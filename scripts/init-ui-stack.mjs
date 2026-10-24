#!/usr/bin/env node
/**
 * init-ui-stack.mjs
 *
 * Prepares a project for the UI skill:
 *   1. Reads package.json in the target directory.
 *   2. Detects the package manager (npm, pnpm, yarn, bun).
 *   3. Installs only the UI / motion dependencies that are missing.
 *   4. Creates src/lib/utils.ts with the cn() helper if it does not exist.
 *
 * Usage:
 *   node init-ui-stack.mjs                 # core UI + motion stack
 *   node init-ui-stack.mjs --with-3d       # also three, @types/three, @react-three/fiber, @react-three/drei
 *   node init-ui-stack.mjs --dry-run       # print what would happen, change nothing
 *   node init-ui-stack.mjs --dir ../my-app # target another project
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CORE_DEPENDENCIES = ["motion", "gsap", "@gsap/react", "lucide-react", "clsx", "tailwind-merge", "lenis"];
const THREE_DEPENDENCIES = ["three", "@react-three/fiber", "@react-three/drei"];
const THREE_DEV_DEPENDENCIES = ["@types/three"];

const UTILS_FILE = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
`;

// ---------------------------------------------------------------------------
// Tiny terminal helpers (no dependencies)
// ---------------------------------------------------------------------------

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (text) => (useColor ? `\u001b[${code}m${text}\u001b[0m` : text);
const bold = paint("1");
const dim = paint("2");
const green = paint("32");
const yellow = paint("33");
const red = paint("31");
const cyan = paint("36");

const info = (message) => console.log(`${cyan("•")} ${message}`);
const ok = (message) => console.log(`${green("✔")} ${message}`);
const warn = (message) => console.log(`${yellow("!")} ${message}`);
const fail = (message) => {
  console.error(`${red("✖")} ${message}`);
  process.exit(1);
};

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { with3d: false, dryRun: false, dir: process.cwd() };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--with-3d") args.with3d = true;
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--dir") {
      const value = argv[i + 1];
      if (!value) fail("--dir needs a path.");
      args.dir = resolve(value);
      i += 1;
    } else if (arg.startsWith("--dir=")) args.dir = resolve(arg.slice("--dir=".length));
    else if (arg === "--help" || arg === "-h") {
      console.log(
        [
          "Usage: node init-ui-stack.mjs [--with-3d] [--dry-run] [--dir <path>]",
          "",
          "  --with-3d   also install three, @types/three, @react-three/fiber, @react-three/drei",
          "  --dry-run   show what would be installed without changing anything",
          "  --dir       target project directory (default: current directory)",
        ].join("\n"),
      );
      process.exit(0);
    } else {
      fail(`Unknown argument: ${arg}  (try --help)`);
    }
  }
  return args;
}

// ---------------------------------------------------------------------------
// Package manager detection
// ---------------------------------------------------------------------------

function detectPackageManager(dir, pkg) {
  const lockfiles = [
    ["pnpm-lock.yaml", "pnpm"],
    ["bun.lockb", "bun"],
    ["bun.lock", "bun"],
    ["yarn.lock", "yarn"],
    ["package-lock.json", "npm"],
    ["npm-shrinkwrap.json", "npm"],
  ];
  for (const [file, manager] of lockfiles) {
    if (existsSync(join(dir, file))) return manager;
  }

  // package.json "packageManager": "pnpm@9.0.0"
  if (typeof pkg.packageManager === "string") {
    const name = pkg.packageManager.split("@")[0];
    if (["npm", "pnpm", "yarn", "bun"].includes(name)) return name;
  }

  // Fall back to whichever manager launched this script (npm_config_user_agent), else npm.
  const agent = process.env.npm_config_user_agent ?? "";
  for (const name of ["pnpm", "yarn", "bun", "npm"]) {
    if (agent.startsWith(name)) return name;
  }
  return "npm";
}

function installArgs(manager, packages, dev) {
  switch (manager) {
    case "pnpm":
      return ["add", ...(dev ? ["-D"] : []), ...packages];
    case "yarn":
      return ["add", ...(dev ? ["-D"] : []), ...packages];
    case "bun":
      return ["add", ...(dev ? ["-d"] : []), ...packages];
    case "npm":
    default:
      return ["install", ...(dev ? ["--save-dev"] : ["--save"]), ...packages];
  }
}

function runInstall(manager, packages, dev, dir) {
  const args = installArgs(manager, packages, dev);
  info(`${bold(`${manager} ${args.join(" ")}`)}`);
  const result = spawnSync(manager, args, {
    cwd: dir,
    stdio: "inherit",
    // On Windows, npm / pnpm / yarn are .cmd shims and need a shell.
    shell: process.platform === "win32",
  });
  if (result.error) fail(`Could not run ${manager}: ${result.error.message}`);
  if (result.status !== 0) fail(`${manager} exited with code ${result.status}.`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const { with3d, dryRun, dir } = parseArgs(process.argv.slice(2));

  console.log(bold("\nUI skill: stack initializer"));
  console.log(dim(`Target: ${dir}${dryRun ? "  (dry run)" : ""}\n`));

  const pkgPath = join(dir, "package.json");
  if (!existsSync(pkgPath)) {
    fail(`No package.json found in ${dir}. Run this from your project root or pass --dir <path>.`);
  }

  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  } catch (error) {
    fail(`Could not parse package.json: ${error.message}`);
  }

  const installed = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]);

  const manager = detectPackageManager(dir, pkg);
  info(`Package manager: ${bold(manager)}`);

  const wantedRuntime = [...CORE_DEPENDENCIES, ...(with3d ? THREE_DEPENDENCIES : [])];
  const wantedDev = with3d ? THREE_DEV_DEPENDENCIES : [];

  const missingRuntime = wantedRuntime.filter((name) => !installed.has(name));
  const missingDev = wantedDev.filter((name) => !installed.has(name));

  // framer-motion is the legacy package name. Templates import "motion/react", so we still add `motion`.
  if (installed.has("framer-motion") && !installed.has("motion")) {
    warn("framer-motion found. Adding `motion` too, because the templates import from \"motion/react\".");
  }

  for (const name of wantedRuntime) {
    if (installed.has(name)) ok(`${name} ${dim("already installed")}`);
  }
  for (const name of wantedDev) {
    if (installed.has(name)) ok(`${name} ${dim("already installed")}`);
  }

  if (missingRuntime.length === 0 && missingDev.length === 0) {
    ok("All required dependencies are already installed.");
  } else if (dryRun) {
    if (missingRuntime.length) info(`Would install: ${missingRuntime.join(", ")}`);
    if (missingDev.length) info(`Would install (dev): ${missingDev.join(", ")}`);
  } else {
    if (missingRuntime.length) runInstall(manager, missingRuntime, false, dir);
    if (missingDev.length) runInstall(manager, missingDev, true, dir);
    ok("Dependencies installed.");
  }

  // src/lib/utils.ts
  const utilsPath = join(dir, "src", "lib", "utils.ts");
  if (existsSync(utilsPath)) {
    const current = readFileSync(utilsPath, "utf8");
    if (/export\s+(function|const)\s+cn\b/.test(current)) {
      ok(`src/lib/utils.ts ${dim("already exports cn()")}`);
    } else {
      warn("src/lib/utils.ts exists but does not export cn(). Add this to it manually:\n");
      console.log(dim(UTILS_FILE));
    }
  } else if (dryRun) {
    info("Would create src/lib/utils.ts with the cn() helper.");
  } else {
    mkdirSync(dirname(utilsPath), { recursive: true });
    writeFileSync(utilsPath, UTILS_FILE, "utf8");
    ok("Created src/lib/utils.ts with the cn() helper.");
  }

  // Path alias hint: templates import from "@/lib/utils".
  for (const configName of ["tsconfig.json", "jsconfig.json"]) {
    const configPath = join(dir, configName);
    if (!existsSync(configPath)) continue;
    const text = readFileSync(configPath, "utf8");
    if (!/"@\/\*"/.test(text)) {
      warn(
        `${configName} has no "@/*" path alias. Templates import "@/lib/utils". Add:\n` +
          dim('  "paths": { "@/*": ["./src/*"] }   (inside compilerOptions)'),
      );
    }
    break;
  }

  if (with3d) {
    info("Optional: Spline scenes need `@splinetool/react-spline` (install only if you use Spline).");
  }

  if (dryRun) {
    console.log(`\n${yellow(bold("Dry run complete."))} Nothing was changed. Re-run without --dry-run to apply.\n`);
    return;
  }

  console.log(`\n${green(bold("Stack ready."))} Next: pick an archetype, then build. Finish with the audit:`);
  console.log(dim("  node .antigravity/skills/ui-skill/scripts/audit-ui.mjs\n"));
}

main();
