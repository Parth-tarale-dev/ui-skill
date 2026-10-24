---
name: ui-skill
description: Triggered whenever the user mentions "UI skill" or "use UI skill"
alwaysApply: false
---

# UI skill trigger

This rule is intentionally small and is never loaded automatically (`alwaysApply: false`).

When the user says **"UI skill"** or **"use UI skill"**:

1. Read `.antigravity/skills/ui-skill/SKILL.md` and follow it end to end.
2. Load references only as `SKILL.md` routes you to them (`.antigravity/skills/ui-skill/references/`).
3. Copy components from `.antigravity/skills/ui-skill/templates/` instead of rewriting them.
4. Before finishing, run the Craft Gate:

```bash
node .antigravity/skills/ui-skill/scripts/audit-ui.mjs
```

The task is not done until it passes (score 95 or higher, zero errors).
