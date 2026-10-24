#!/usr/bin/env node
/**
 * audit-ui.mjs: the 95/100 Craft Gate.
 *
 * A static scanner. It reads source files, looks for banned anti-patterns, and prints a
 * pass/fail report. It cannot judge how something looks; it only catches what text can prove.
 *
 * Usage:
 *   node audit-ui.mjs                    # scan ./src
 *   node audit-ui.mjs --src app          # scan another folder
 *   node audit-ui.mjs --min-score 90     # change the pass threshold (default 95)
 *   node audit-ui.mjs --json             # machine-readable output
 *
 * Scoring: start at 100. Each error costs 5 points, each warning costs 2. Pass needs
 * score >= threshold AND zero errors. Exit code 0 on pass, 1 on fail, 2 on usage problems.
 *
 * Suppress a finding:
 *   // ui-audit-ignore-next-line         (line above)
 *   ... ui-audit-ignore                  (same line)
 *   // ui-audit-disable-file             (anywhere in the file)
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

// ---------------------------------------------------------------------------
// Terminal helpers
// ---------------------------------------------------------------------------

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (text) => (useColor ? `\u001b[${code}m${text}\u001b[0m` : String(text));
const bold = paint("1");
const dim = paint("2");
const red = paint("31");
const green = paint("32");
const yellow = paint("33");
const cyan = paint("36");

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { src: "src", minScore: 95, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--src") args.src = argv[++i];
    else if (arg.startsWith("--src=")) args.src = arg.slice(6);
    else if (arg === "--min-score") args.minScore = Number(argv[++i]);
    else if (arg.startsWith("--min-score=")) args.minScore = Number(arg.slice(12));
    else if (arg === "--json") args.json = true;
    else if (arg === "--help" || arg === "-h") {
      console.log("Usage: node audit-ui.mjs [--src <dir>] [--min-score <n>] [--json]");
      process.exit(0);
    } else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(2);
    }
  }
  if (!args.src || Number.isNaN(args.minScore)) {
    console.error("Invalid arguments. Try --help.");
    process.exit(2);
  }
  return args;
}

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

const SCAN_EXTENSIONS = new Set([".tsx", ".jsx", ".ts", ".js", ".mjs", ".css", ".html", ".mdx"]);
const JSX_EXTENSIONS = new Set([".tsx", ".jsx", ".html", ".mdx"]);
const IGNORED_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build", "out", ".turbo", "coverage", ".antigravity"]);

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if (!IGNORED_DIRS.has(name)) walk(full, files);
    } else if (SCAN_EXTENSIONS.has(extname(name)) && !/\.(test|spec|stories|d)\.[tj]sx?$/.test(name)) {
      files.push(full);
    }
  }
  return files;
}

// ---------------------------------------------------------------------------
// Source scanning utilities (string / comment / brace aware)
// ---------------------------------------------------------------------------

/** Returns the index just past the string or comment starting at i, or i if none starts there. */
function skipLiteral(text, i) {
  const ch = text[i];
  const next = text[i + 1];

  if (ch === "/" && next === "/") {
    const end = text.indexOf("\n", i);
    return end === -1 ? text.length : end;
  }
  if (ch === "/" && next === "*") {
    const end = text.indexOf("*/", i + 2);
    return end === -1 ? text.length : end + 2;
  }
  if (ch === '"' || ch === "'") {
    let j = i + 1;
    while (j < text.length && text[j] !== ch && text[j] !== "\n") {
      if (text[j] === "\\") j += 1;
      j += 1;
    }
    return j + 1;
  }
  if (ch === "`") {
    let j = i + 1;
    while (j < text.length && text[j] !== "`") {
      if (text[j] === "\\") j += 2;
      else if (text[j] === "$" && text[j + 1] === "{") {
        const close = findClose(text, j + 1, "{", "}");
        j = close === -1 ? text.length : close + 1;
      } else j += 1;
    }
    return j + 1;
  }
  return i;
}

/** Index of the bracket that closes the one at `openIndex`, or -1. */
function findClose(text, openIndex, open, close) {
  let depth = 0;
  for (let i = openIndex; i < text.length; i += 1) {
    const skipped = skipLiteral(text, i);
    if (skipped !== i) {
      i = skipped - 1;
      continue;
    }
    if (text[i] === open) depth += 1;
    else if (text[i] === close) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Finds every JSX opening tag. Returns { name, start, end, text }. */
function findJsxTags(text) {
  const tags = [];
  const re = /<([A-Za-z][\w.]*)/g;
  let match;
  while ((match = re.exec(text))) {
    const start = match.index;
    const prev = text[start - 1] ?? "\n";
    // Skip generics / comparisons like useState<Foo> and a<b.
    if (/[\w)\]]/.test(prev)) continue;

    let i = start + match[0].length;
    let end = -1;
    while (i < text.length) {
      const ch = text[i];
      if (ch === '"' || ch === "'") {
        const skipped = skipLiteral(text, i);
        if (skipped === i) i += 1;
        else i = skipped;
        continue;
      }
      if (ch === "{") {
        const close = findClose(text, i, "{", "}");
        if (close === -1) break;
        i = close + 1;
        continue;
      }
      if (ch === ">") {
        end = i;
        break;
      }
      i += 1;
    }
    if (end === -1) continue;
    tags.push({ name: match[1], start, end, text: text.slice(start, end + 1) });
    re.lastIndex = end;
  }
  return tags;
}

/** Extracts the class / className attribute value from a tag's text. */
function getClassAttr(tagText) {
  const m = /\b(?:className|class)\s*=\s*/.exec(tagText);
  if (!m) return null;
  const i = m.index + m[0].length;
  const ch = tagText[i];
  if (ch === '"' || ch === "'") {
    const end = skipLiteral(tagText, i);
    return tagText.slice(i, end);
  }
  if (ch === "{") {
    const close = findClose(tagText, i, "{", "}");
    return close === -1 ? null : tagText.slice(i, close + 1);
  }
  return null;
}

/** All string literal contents inside a snippet, joined by spaces. */
function stringLiterals(snippet) {
  const out = [];
  for (let i = 0; i < snippet.length; i += 1) {
    const ch = snippet[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const end = skipLiteral(snippet, i);
      out.push(snippet.slice(i + 1, end - 1));
      i = end - 1;
    }
  }
  return out.join(" ");
}

/** True when the class attr references identifiers (variants[variant], className, etc.) we cannot read. */
function classIsDynamic(attr) {
  const stripped = attr
    .replace(/(["'`])(?:\\.|(?!\1)[^\\])*\1/g, "")
    .replace(/\b(cn|clsx|twMerge|className|class)\b/g, "");
  return /[A-Za-z_]/.test(stripped);
}

// ---------------------------------------------------------------------------
// Rule catalogue
// ---------------------------------------------------------------------------

const GATE = {
  COLOR: "1. Tokens, no raw default Tailwind colors",
  STATES: "2. Complete interactive states",
  FOCAL: "3. No empty placeholder boxes",
  MOTION: "4. 60fps compositor-only motion",
  RESPONSIVE: "5. Responsive and touch-safe",
  GENERAL: "General hygiene",
};

const PENALTY = { error: 5, warn: 2 };

const COLOR_NAMES =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const COLOR_UTILITIES =
  "bg|text|border|ring|ring-offset|from|via|to|fill|stroke|divide|outline|decoration|accent|caret|placeholder|shadow";

const RAW_COLOR_RE = new RegExp(`(?<![\\w-])(?:${COLOR_UTILITIES})-(?:${COLOR_NAMES})-(?:50|100|200|300|400|500|600|700|800|900|950)(?![\\w-])`, "g");
const DEFAULT_SHADOW_RE = /(?<![\w-])shadow-(?:sm|md|lg|xl|2xl|inner)(?![\w-])/g;
const TRANSITION_ALL_RE = /(?<![\w-])transition-all(?![\w-])|transition\s*:\s*all\b/g;
const PLACEHOLDER_URL_RE = /(?:via\.placeholder\.com|placehold\.co|placeholder\.com|picsum\.photos|dummyimage\.com|placekitten\.com)/g;
const LOADING_TEXT_RE = />\s*Loading(?:\.\.\.|…)?\s*</g;
const TODO_RE = /(?:\/\/|\/\*|\{\s*\/\*|#)\s*(?:TODO|FIXME|XXX)\b/g;
const LAYOUT_ANIM_PROPS = "width|height|top|left|right|bottom|margin|marginTop|marginLeft|marginRight|marginBottom|padding|paddingTop|paddingLeft";

/** Line-based rules. Each returns matches on a single line of code. */
const LINE_RULES = [
  { id: "raw-tailwind-color", severity: "error", gate: GATE.COLOR, re: RAW_COLOR_RE, message: (m) => `Raw default Tailwind color "${m}". Use a token class (bg-surface, text-muted, border-border) or a CSS variable.` },
  { id: "default-shadow", severity: "error", gate: GATE.COLOR, re: DEFAULT_SHADOW_RE, message: (m) => `Default "${m}". Use shadow-card / shadow-pop or an explicit layered shadow.` },
  { id: "transition-all", severity: "error", gate: GATE.MOTION, re: TRANSITION_ALL_RE, message: () => 'transition-all animates layout properties. Use transition-[transform,opacity] or transition-colors.' },
  { id: "placeholder-image-url", severity: "error", gate: GATE.FOCAL, re: PLACEHOLDER_URL_RE, message: (m) => `Placeholder image host "${m}". Use a ThreeDStage asset, bespoke SVG, or live UI preview.` },
  { id: "loading-text", severity: "warn", gate: GATE.GENERAL, re: LOADING_TEXT_RE, message: () => 'Raw "Loading..." text. Build a shimmer skeleton.' },
  { id: "todo-comment", severity: "error", gate: GATE.GENERAL, re: TODO_RE, message: () => "TODO/FIXME left in code. Finish the implementation.", includeComments: true },
  { id: "viewport-width-overflow", severity: "warn", gate: GATE.RESPONSIVE, re: /(?<![\w-])w-screen(?![\w-])|(?<![\d.])100vw(?![\w-])/g, message: (m) => `"${m}" ignores the scrollbar width and can cause horizontal overflow. Prefer w-full / max-w-full.` },
];

// ---------------------------------------------------------------------------
// Auditing a file
// ---------------------------------------------------------------------------

function auditFile(file, root) {
  const text = readFileSync(file, "utf8");
  const rel = relative(root, file).split("\\").join("/");
  const ext = extname(file);
  const issues = [];

  if (/ui-audit-disable-file/.test(text)) return issues;

  const lines = text.split(/\r?\n/);
  const lineStarts = [];
  let offset = 0;
  for (const line of lines) {
    lineStarts.push(offset);
    offset += line.length + 1;
  }
  const lineOf = (index) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };

  const isIgnored = (lineNo) =>
    /ui-audit-ignore(?!-)/.test(lines[lineNo - 1] ?? "") || /ui-audit-ignore-next-line/.test(lines[lineNo - 2] ?? "");

  const add = (rule, lineNo, message) => {
    if (isIgnored(lineNo)) return;
    issues.push({ file: rel, line: lineNo, rule: rule.id, severity: rule.severity, gate: rule.gate, message });
  };

  const isComment = (line) => /^\s*(?:\/\/|\*|\/\*|\{\/\*)/.test(line);

  // --- Line rules ---------------------------------------------------------
  lines.forEach((line, idx) => {
    for (const rule of LINE_RULES) {
      if (!rule.includeComments && isComment(line)) continue;
      rule.re.lastIndex = 0;
      let m;
      while ((m = rule.re.exec(line))) {
        if (rule.filter && !rule.filter(m[0], line)) continue;
        add(rule, idx + 1, rule.message(m[0]));
        if (m[0].length === 0) rule.re.lastIndex += 1;
      }
    }
  });

  // --- GSAP in raw useEffect ---------------------------------------------
  const gsapRule = { id: "gsap-in-useeffect", severity: "error", gate: GATE.MOTION };
  const hookRe = /\buse(?:Layout)?Effect\s*\(/g;
  let hook;
  while ((hook = hookRe.exec(text))) {
    const open = hook.index + hook[0].length - 1;
    const close = findClose(text, open, "(", ")");
    if (close === -1) continue;
    const body = text.slice(open, close);
    if (/\bgsap\s*\.\s*(?:to|from|fromTo|set|timeline|quickTo|quickSetter|context|delayedCall|utils\.toArray)\b|\bScrollTrigger\s*\.\s*(?:create|batch|scrollerProxy)\b|new\s+ScrollTrigger\b/.test(body)) {
      add(gsapRule, lineOf(hook.index), "GSAP used inside useEffect. Use useGSAP(() => {...}, { scope }) so tweens and ScrollTriggers clean up.");
    }
  }

  // --- useGSAP without scope ---------------------------------------------
  const scopeRule = { id: "usegsap-no-scope", severity: "warn", gate: GATE.MOTION };
  const useGsapRe = /\buseGSAP\s*\(/g;
  let ug;
  while ((ug = useGsapRe.exec(text))) {
    const open = ug.index + ug[0].length - 1;
    const close = findClose(text, open, "(", ")");
    if (close === -1) continue;
    const call = text.slice(open, close);
    if (!/\bscope\b/.test(call)) {
      add(scopeRule, lineOf(ug.index), "useGSAP() has no { scope }. Pass a container ref so selectors are scoped and cleanup is reliable.");
    }
  }

  // --- GSAP / motion animating layout properties ---------------------------
  const layoutRule = { id: "layout-property-animation", severity: "warn", gate: GATE.MOTION };
  const gsapLayoutRe = new RegExp(`\\bgsap\\s*\\.\\s*(?:to|from|fromTo|set)\\s*\\([^;]{0,400}?\\b(?:${LAYOUT_ANIM_PROPS})\\s*:`, "g");
  const motionLayoutRe = new RegExp(`\\b(?:animate|whileHover|whileTap|whileInView|initial|exit)\\s*=\\s*\\{\\{[^}]{0,200}?\\b(?:${LAYOUT_ANIM_PROPS})\\s*:`, "g");
  for (const re of [gsapLayoutRe, motionLayoutRe]) {
    let lm;
    while ((lm = re.exec(text))) {
      add(layoutRule, lineOf(lm.index), "Animating a layout property (width/height/top/left/margin/padding). Animate transform (x, y, scale) or opacity instead.");
    }
  }

  // --- Reduced motion (file level) ---------------------------------------
  const motionRule = { id: "no-reduced-motion", severity: "warn", gate: GATE.MOTION };
  const usesHeavyMotion = /\bScrollTrigger\b|\bgsap\s*\.\s*(?:to|from|fromTo|timeline)\b|repeat\s*:\s*Infinity|\banimate-(?:spin|pulse|bounce|ping)\b/.test(text);
  const respectsReducedMotion = /useReducedMotion|prefers-reduced-motion|gsap\s*\.\s*matchMedia|motion-reduce:|MotionConfig/.test(text);
  if (JSX_EXTENSIONS.has(ext) || ext === ".css" || ext === ".ts") {
    if (usesHeavyMotion && !respectsReducedMotion) {
      add(motionRule, 1, "Scroll or looping motion with no reduced-motion handling. Use useReducedMotion(), gsap.matchMedia(), or motion-reduce: variants.");
    }
  }

  // --- JSX tag rules --------------------------------------------------------
  if (JSX_EXTENSIONS.has(ext)) {
    const tags = findJsxTags(text);

    for (const tag of tags) {
      const lineNo = lineOf(tag.start);
      const name = tag.name;
      const classAttr = getClassAttr(tag.text);
      const literal = classAttr ? stringLiterals(classAttr) : "";
      const dynamic = classAttr ? classIsDynamic(classAttr) : false;
      const hasRoleButton = /\brole\s*=\s*["']button["']/.test(tag.text);

      const isButton = name === "button" || name === "motion.button" || hasRoleButton;
      const isAnchor = name === "a" || name === "motion.a";
      const isField = name === "input" || name === "select" || name === "textarea";
      const isInteractive = isButton || isAnchor || isField;

      // Tokens may live in the tag, or (for dynamic class lists) anywhere in the file.
      const has = (re) => re.test(tag.text) || (dynamic && re.test(text));

      // ---- Interaction states -------------------------------------------
      const notFocusable = /\btabIndex\s*=\s*\{\s*-1\s*\}/.test(tag.text) || /\baria-hidden\b/.test(tag.text);
      if (isInteractive && !notFocusable && !(isField && /\btype\s*=\s*["']hidden["']/.test(tag.text))) {
        const unverifiable = classAttr !== null && literal.trim() === "" && !dynamic;
        const noClass = classAttr === null && !/\{\s*\.\.\./.test(tag.text);
        const statesRule = (id, severity = "warn") => ({ id, severity, gate: GATE.STATES });

        if (noClass) {
          add(statesRule("unstyled-interactive"), lineNo, `<${name}> has no className. It needs designed hover, focus-visible, active and disabled states.`);
        } else if (!unverifiable && classAttr !== null) {
          if (!has(/focus-visible:|focus:|:focus-visible/)) {
            add(statesRule("missing-focus-visible"), lineNo, `<${name}> has no focus-visible: style. Keyboard users cannot see focus.`);
          }
          if ((isButton || isAnchor) && !has(/(?<![\w-])hover:|whileHover|\[@media\(hover:hover\)\]/)) {
            add(statesRule("missing-hover"), lineNo, `<${name}> has no hover: state.`);
          }
          if (isButton && !has(/(?<![\w-])active:|whileTap|group-active:/)) {
            add(statesRule("missing-active"), lineNo, `<${name}> has no active press state. Add whileTap={{ scale: 0.97 }} or active: classes.`);
          }
          if ((isButton || isField) && !has(/disabled:|aria-disabled:|data-\[disabled\]:/)) {
            add(statesRule("missing-disabled"), lineNo, `<${name}> has no disabled: style.`);
          }
        }

        // ---- Touch targets ------------------------------------------------
        if (isButton || isAnchor || (isField && !/\btype\s*=\s*["'](?:checkbox|radio)["']/.test(tag.text))) {
          const small = /(?<![\w:-])(?:h|size)-(?:[1-9]|10)(?![\w.\d/-])/.test(literal) || /(?<![\w:-])(?:h|size)-\[(?:[1-3]?\d|4[0-3])px\]/.test(literal);
          const bigEnough = /(?:min-h|min-w|h|size)-(?:11|12|13|14|16)(?![\d])|(?:min-h|min-w|h|size)-\[(?:4[4-9]|[5-9]\d)px\]/.test(literal);
          if (small && !bigEnough) {
            add({ id: "small-touch-target", severity: "warn", gate: GATE.RESPONSIVE }, lineNo, `<${name}> is sized below 44px. Add min-h-11 min-w-11 (or use a larger hit area).`);
          }
        }
      }

      // ---- Empty gray placeholder boxes -----------------------------------
      if (name === "div" || name === "span" || name === "motion.div" || name === "section") {
        const grayBox = /(?<![\w-])bg-(?:gray|zinc|slate|neutral|stone)-\d{2,3}|(?<![\w-])bg-(?:muted|placeholder)(?![\w-])/.test(literal);
        const sized = /(?<![\w-])(?:aspect-|h-|size-|min-h-|w-)/.test(literal);
        const loadingBlock = /animate-pulse|skeleton|shimmer/.test(literal);
        if (grayBox && sized && !loadingBlock) {
          const after = text.slice(tag.end + 1, tag.end + 80);
          const selfClosing = /\/\s*>$/.test(tag.text);
          const emptyChildren = new RegExp(`^\\s*</${name.replace(".", "\\.")}>`).test(after);
          if (selfClosing || emptyChildren) {
            add({ id: "empty-placeholder-box", severity: "error", gate: GATE.FOCAL }, lineNo, "Empty gray placeholder box. Fill the focal area with a ThreeDStage asset, bespoke SVG, or live UI preview.");
          }
        }
      }

      // ---- Responsive prefixes -----------------------------------------------
      if (literal) {
        const decorative = /pointer-events-none/.test(literal) && /(?:absolute|fixed)/.test(literal);
        const respGrid = /(?:sm|md|lg|xl|2xl):grid-cols-/.test(literal);
        if (/(?<![\w:-])grid-cols-(?:[3-9]|1[0-2])(?![\w-])/.test(literal) && !respGrid) {
          add({ id: "grid-not-responsive", severity: "warn", gate: GATE.RESPONSIVE }, lineNo, "3+ column grid with no responsive prefix. Start at grid-cols-1 and add sm:/md:/lg: columns.");
        }
        if (/(?<![\w:-])text-(?:5xl|6xl|7xl|8xl|9xl)(?![\w-])/.test(literal) && !/(?:sm|md|lg|xl|2xl):text-/.test(literal)) {
          add({ id: "type-not-responsive", severity: "warn", gate: GATE.RESPONSIVE }, lineNo, "Very large text with no responsive scale. Start smaller and step up with sm:/lg:text-*.");
        }
        const fixedWidth = /(?<![\w:-])w-\[(\d{3,4})px\]/.exec(literal);
        if (fixedWidth && Number(fixedWidth[1]) >= 360 && !decorative && !/max-w-/.test(literal)) {
          add({ id: "fixed-width", severity: "warn", gate: GATE.RESPONSIVE }, lineNo, `Fixed width ${fixedWidth[1]}px with no max-w-* can overflow phones. Use w-full max-w-[${fixedWidth[1]}px].`);
        }
      }
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function buildReport(issues, fileCount, minScore) {
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warn").length;
  const score = Math.max(0, 100 - errors * PENALTY.error - warnings * PENALTY.warn);
  const passed = score >= minScore && errors === 0;
  const byGate = Object.values(GATE).map((gate) => {
    const inGate = issues.filter((i) => i.gate === gate);
    return {
      gate,
      errors: inGate.filter((i) => i.severity === "error").length,
      warnings: inGate.filter((i) => i.severity === "warn").length,
    };
  });
  return { score, passed, errors, warnings, fileCount, minScore, byGate };
}

function printReport(issues, report, root, srcDir) {
  console.log(bold("\nUI skill: Craft Gate audit"));
  console.log(dim(`Scanned ${report.fileCount} file(s) in ${relative(root, srcDir) || "."}\n`));

  const byFile = new Map();
  for (const issue of issues) {
    if (!byFile.has(issue.file)) byFile.set(issue.file, []);
    byFile.get(issue.file).push(issue);
  }

  for (const [file, list] of byFile) {
    console.log(bold(file));
    list.sort((a, b) => a.line - b.line);
    for (const issue of list) {
      const tag = issue.severity === "error" ? red("error") : yellow("warn ");
      console.log(`  ${dim(String(issue.line).padStart(4))}  ${tag}  ${issue.message} ${dim(`(${issue.rule})`)}`);
    }
    console.log("");
  }

  console.log(bold("Gate summary"));
  for (const row of report.byGate) {
    const clean = row.errors === 0 && row.warnings === 0;
    const mark = clean ? green("✔") : row.errors > 0 ? red("✖") : yellow("!");
    const detail = clean ? dim("clean") : `${row.errors} error(s), ${row.warnings} warning(s)`;
    console.log(`  ${mark} ${row.gate.padEnd(44)} ${detail}`);
  }

  const scoreColor = report.passed ? green : red;
  console.log(`\n${bold("Score")}  ${scoreColor(bold(`${report.score}/100`))}  ${dim(`(pass: >= ${report.minScore} and zero errors)`)}`);
  console.log(`${bold("Result")} ${report.passed ? green(bold("PASS")) : red(bold("FAIL"))}\n`);

  if (!report.passed) {
    console.log(cyan("Fix every error, then re-run. Errors cost 5 points, warnings 2."));
  }
  console.log(dim("Static scan only: still review focal-area visuals, 44px targets and 320px layout by hand.\n"));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = process.cwd();
  const srcDir = resolve(root, args.src);

  if (!existsSync(srcDir) || !statSync(srcDir).isDirectory()) {
    console.error(red(`No "${args.src}" directory found in ${root}.`));
    console.error("Run from your project root, or pass --src <dir> (for example --src app).");
    process.exit(2);
  }

  const files = walk(srcDir);
  const issues = files.flatMap((file) => auditFile(file, root));
  const report = buildReport(issues, files.length, args.minScore);

  if (args.json) {
    console.log(JSON.stringify({ ...report, issues }, null, 2));
  } else {
    printReport(issues, report, root, srcDir);
  }

  process.exit(report.passed ? 0 : 1);
}

main();
