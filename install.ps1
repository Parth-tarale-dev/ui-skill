<#
.SYNOPSIS
    Installs the UI skill into a project's .antigravity folder.

.DESCRIPTION
    Copies SKILL.md, references/, templates/ and scripts/ into
        <Target>\.antigravity\skills\ui-skill\
    and writes a thin trigger rule to
        <Target>\.antigravity\rules\ui-skill.md
    The rule has `alwaysApply: false`, so nothing is loaded into context
    until you say "use UI skill".

    .git, node_modules, .antigravity, OS junk and scratch folders are never copied.

.PARAMETER Target
    Project folder to install into. Defaults to the current directory.

.PARAMETER Force
    Overwrite an existing install without asking.

.EXAMPLE
    .\install.ps1
    Installs into the current directory.

.EXAMPLE
    .\install.ps1 -Target "D:\projects\my-app" -Force
    Installs (or updates) the skill in another project.

.EXAMPLE
    .\install.ps1 -Target "D:\projects\my-app" -WhatIf
    Shows what would be copied without changing anything.
#>

[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Position = 0)]
    [string]$Target = (Get-Location).Path,

    [switch]$Force
)

$ErrorActionPreference = 'Stop'

# --- Settings ----------------------------------------------------------------

$SourceRoot  = $PSScriptRoot
$ExcludeDirs = @('.git', 'node_modules', '.antigravity', '.vscode', '.idea', '.scratch', 'tmp', '__pycache__')
$ExcludeFiles = @('.DS_Store', 'Thumbs.db', 'desktop.ini', '*.swp', '*.swo', '*.log')
$SkillItems  = @('SKILL.md', 'references', 'templates', 'scripts')

# --- Helpers -----------------------------------------------------------------

function Write-Step([string]$Message) { Write-Host "  - $Message" -ForegroundColor Cyan }
function Write-Ok([string]$Message)   { Write-Host "  + $Message" -ForegroundColor Green }

function Test-Excluded([System.IO.FileSystemInfo]$Item, [string]$BasePath) {
    $relative = $Item.FullName.Substring($BasePath.Length).TrimStart('\', '/')
    $segments = $relative -split '[\\/]'
    foreach ($segment in $segments) {
        if ($ExcludeDirs -contains $segment) { return $true }
    }
    if (-not $Item.PSIsContainer) {
        foreach ($pattern in $ExcludeFiles) {
            if ($Item.Name -like $pattern) { return $true }
        }
    }
    return $false
}

function Copy-Tree([string]$From, [string]$To) {
    $base = (Resolve-Path -LiteralPath $From).Path
    if (-not (Test-Path -LiteralPath $To)) {
        New-Item -ItemType Directory -Path $To -Force | Out-Null
    }
    Get-ChildItem -LiteralPath $base -Recurse -Force | ForEach-Object {
        if (Test-Excluded $_ $base) { return }
        $relative = $_.FullName.Substring($base.Length).TrimStart('\', '/')
        $destination = Join-Path $To $relative
        if ($_.PSIsContainer) {
            if (-not (Test-Path -LiteralPath $destination)) {
                New-Item -ItemType Directory -Path $destination -Force | Out-Null
            }
        } else {
            $parent = Split-Path -Parent $destination
            if (-not (Test-Path -LiteralPath $parent)) {
                New-Item -ItemType Directory -Path $parent -Force | Out-Null
            }
            Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
        }
    }
}

# --- Validate ----------------------------------------------------------------

foreach ($item in $SkillItems) {
    $path = Join-Path $SourceRoot $item
    if (-not (Test-Path -LiteralPath $path)) {
        throw "Missing '$item' next to install.ps1 ($SourceRoot). Run the installer from the UI SKILL folder."
    }
}

if (-not (Test-Path -LiteralPath $Target)) {
    throw "Target folder not found: $Target"
}

$Target    = (Resolve-Path -LiteralPath $Target).Path
$SkillDir  = Join-Path $Target '.antigravity\skills\ui-skill'
$RulesDir  = Join-Path $Target '.antigravity\rules'
$RuleFile  = Join-Path $RulesDir 'ui-skill.md'

if ($SourceRoot -eq $Target) {
    Write-Host "Installing into the skill repo itself (syncing .antigravity copy)." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "UI skill installer" -ForegroundColor White
Write-Host "  Source: $SourceRoot"
Write-Host "  Target: $Target"
Write-Host ""

# --- Existing install check --------------------------------------------------

if ((Test-Path -LiteralPath $SkillDir) -and -not $Force -and -not $WhatIfPreference) {
    $answer = Read-Host "An install already exists at $SkillDir. Overwrite? (y/N)"
    if ($answer -notmatch '^(y|yes)$') {
        Write-Host "Cancelled. Nothing was changed." -ForegroundColor Yellow
        return
    }
}

# --- Copy the skill ----------------------------------------------------------

if ($PSCmdlet.ShouldProcess($SkillDir, 'Copy SKILL.md, references, templates, scripts')) {
    if (-not (Test-Path -LiteralPath $SkillDir)) {
        New-Item -ItemType Directory -Path $SkillDir -Force | Out-Null
    }

    foreach ($item in $SkillItems) {
        $from = Join-Path $SourceRoot $item
        $to   = Join-Path $SkillDir $item
        Write-Step "Copying $item"
        if ((Get-Item -LiteralPath $from).PSIsContainer) {
            # Replace folders wholesale so deleted files do not linger from older versions.
            if (Test-Path -LiteralPath $to) { Remove-Item -LiteralPath $to -Recurse -Force }
            Copy-Tree $from $to
        } else {
            Copy-Item -LiteralPath $from -Destination $to -Force
        }
    }
    Write-Ok "Skill files copied to .antigravity\skills\ui-skill\"
}

# --- Write the trigger rule --------------------------------------------------

$RuleContent = @'
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
'@

if ($PSCmdlet.ShouldProcess($RuleFile, 'Write trigger rule')) {
    if (-not (Test-Path -LiteralPath $RulesDir)) {
        New-Item -ItemType Directory -Path $RulesDir -Force | Out-Null
    }
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($RuleFile, ($RuleContent -replace "`r`n", "`n") + "`n", $utf8NoBom)
    Write-Ok "Rule written to .antigravity\rules\ui-skill.md (alwaysApply: false)"
}

# --- Done ---------------------------------------------------------------------

if (-not $WhatIfPreference) {
    Write-Host ""
    Write-Host "Done. Say 'use UI skill' in your agent to activate it." -ForegroundColor Green
    Write-Host "Next, in your project:" -ForegroundColor White
    Write-Host "  node .antigravity/skills/ui-skill/scripts/init-ui-stack.mjs            # core stack"
    Write-Host "  node .antigravity/skills/ui-skill/scripts/init-ui-stack.mjs --with-3d  # + Three.js / R3F"
    Write-Host ""
}
