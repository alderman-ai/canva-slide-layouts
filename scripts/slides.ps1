<#
.SYNOPSIS
  Operator surface for the Markdown-first Canva slide system.

.DESCRIPTION
  Windows PowerShell 5.1 compatible (no &&, no ternary, no null-coalescing).
  Everything non-trivial is delegated to the node scripts in this folder;
  this file is argument handling, retrieval over manifest/layouts.json, and scaffolding.

.EXAMPLE
  .\scripts\slides.ps1 validate
  .\scripts\slides.ps1 build -Family content
  .\scripts\slides.ps1 find -Accepts stat -Items 5 -MaxPolish 2
  .\scripts\slides.ps1 show L012
  .\scripts\slides.ps1 new-deck acme-q4
#>
[CmdletBinding()]
param(
  [Parameter(Position = 0)][string]$Verb = 'help',
  [Parameter(Position = 1)][string]$Target = '',
  [string]$Deck = '',
  [string]$Family = '',
  [string]$Archetype = '',
  [string]$Shape = '',
  [string]$Accepts = '',
  [int]$Items = 0,
  [int]$MaxPolish = 0,
  [int]$Density = 0,
  [string]$FlowRole = '',
  [string]$Component = '',
  [string]$Brand = '',
  [switch]$NativeFontsOnly,
  [switch]$Json
)

Set-StrictMode -Version 2
$ErrorActionPreference = 'Stop'

$ScriptRoot = $PSScriptRoot
$RepoRoot = Split-Path -Parent $ScriptRoot
$script:LastNodeExit = 0

function Write-Err([string]$Message) {
  Write-Host "slides: $Message" -ForegroundColor Red
}

function Assert-Node {
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if ($null -eq $cmd) {
    throw "node was not found on PATH. Install Node.js 20+ (this repo was built on node 24.15) and re-run."
  }
}

function Invoke-NodeScript {
  param([string]$Script, [string[]]$NodeArgs = @())
  Assert-Node
  $path = Join-Path $ScriptRoot $Script
  if (-not (Test-Path -LiteralPath $path)) { throw "missing script: $path" }
  # node's own stdout/stderr must reach the console (and stay redirectable), so nothing is
  # captured here; the exit code travels in $script:LastNodeExit.
  & node $path @NodeArgs
  $script:LastNodeExit = $LASTEXITCODE
}

function Get-Prop {
  param($Object, [string]$Name)
  if ($null -eq $Object) { return $null }
  $prop = $Object.PSObject.Properties[$Name]
  if ($null -eq $prop) { return $null }
  return $prop.Value
}

# Membership test that treats a scalar and a one-item list alike (mirrors Obsidian Bases list()).
function Test-Member {
  param($Value, [string]$Wanted)
  if ([string]::IsNullOrEmpty($Wanted)) { return $true }
  if ($null -eq $Value) { return $false }
  foreach ($v in @($Value)) {
    if ($null -eq $v) { continue }
    if ([string]$v -eq $Wanted) { return $true }
  }
  return $false
}

function Get-LayoutManifest {
  $file = Join-Path $RepoRoot 'manifest\layouts.json'
  if (-not (Test-Path -LiteralPath $file)) {
    Write-Host 'manifest/layouts.json is missing; building it now...'
    Invoke-NodeScript -Script 'manifest.mjs'
    if ($script:LastNodeExit -ne 0) { throw 'manifest build failed' }
  }
  $raw = Get-Content -LiteralPath $file -Raw -Encoding UTF8
  return ($raw | ConvertFrom-Json)
}

function Show-Help {
  Write-Host ''
  Write-Host 'slides.ps1 - Canva slide system (see scripts/README.md and docs/PLAN.md)'
  Write-Host ''
  $verbs = @(
    [pscustomobject]@{ Verb = 'validate';  Arguments = '[--json]';                        Does = 'Schemas, vocab, geometry, capacity, fonts, repo hygiene. Exit 1 on errors.' }
    [pscustomobject]@{ Verb = 'build';     Arguments = '[-Deck <slug>] [-Family <name>]'; Does = 'Annotated HTML for Canva import + contact sheet (build/html).' }
    [pscustomobject]@{ Verb = 'build-dc';  Arguments = '[-Deck <slug>] [-Family <name>]'; Does = 'Experimental Claude Design deck (.dc.html + canvas.json) in build/dc.' }
    [pscustomobject]@{ Verb = 'ops';       Arguments = '[-Deck <slug>]';                  Does = 'edit-design operation batches in build/canva-ops (Route B / Route C).' }
    [pscustomobject]@{ Verb = 'manifest';  Arguments = '';                                Does = 'Rebuild manifest/layouts.json and manifest/components.json.' }
    [pscustomobject]@{ Verb = 'preview';   Arguments = '';                                Does = 'Playwright PNGs of build/html into build/previews (needs Chromium once).' }
    [pscustomobject]@{ Verb = 'find';      Arguments = '-Family -Archetype -Shape -Accepts -Items -MaxPolish -Density -FlowRole -Component -Brand -NativeFontsOnly'; Does = 'Retrieve layouts from manifest/layouts.json.' }
    [pscustomobject]@{ Verb = 'show';      Arguments = '<layout-id>';                     Does = 'Print a layout''s frontmatter and element table.' }
    [pscustomobject]@{ Verb = 'new-deck';  Arguments = '<slug>';                          Does = 'Scaffold presentations/<slug>/ (brief, context, slides, build, canva.md).' }
    [pscustomobject]@{ Verb = 'hygiene';   Arguments = '';                                Does = 'Vendor design file check on its own (hard rule 1).' }
    [pscustomobject]@{ Verb = 'help';      Arguments = '';                                Does = 'This table.' }
  )
  $verbs | Format-Table -AutoSize Verb, Arguments, Does
  Write-Host ''
}

function Invoke-Find {
  $manifest = Get-LayoutManifest
  $layouts = @(Get-Prop $manifest 'layouts')
  if ($layouts.Count -eq 0) {
    Write-Host 'no layouts in manifest/layouts.json (the library is empty; author layouts/ first)'
    return
  }

  $found = @()
  foreach ($l in $layouts) {
    if ($Family -ne '' -and -not (Test-Member (Get-Prop $l 'family') $Family)) { continue }
    if ($Archetype -ne '' -and -not (Test-Member (Get-Prop $l 'archetype') $Archetype)) { continue }
    if ($Shape -ne '' -and -not (Test-Member (Get-Prop $l 'content_shape') $Shape)) { continue }
    if ($Accepts -ne '' -and -not (Test-Member (Get-Prop $l 'accepts') $Accepts)) { continue }
    if ($FlowRole -ne '' -and -not (Test-Member (Get-Prop $l 'flow_role') $FlowRole)) { continue }
    if ($Brand -ne '' -and -not (Test-Member (Get-Prop $l 'brand') $Brand)) { continue }
    if ($Component -ne '' -and -not (Test-Member (Get-Prop $l 'components') $Component)) { continue }

    if ($Items -gt 0) {
      $min = Get-Prop $l 'min_items'
      $max = Get-Prop $l 'max_items'
      if ($null -ne $min -and $Items -lt [int]$min) { continue }
      if ($null -ne $max -and $Items -gt [int]$max) { continue }
    }
    if ($MaxPolish -gt 0) {
      $polish = Get-Prop $l 'polish_cost'
      if ($null -eq $polish) { continue }
      if ([int]$polish -gt $MaxPolish) { continue }
    }
    if ($Density -gt 0) {
      $d = Get-Prop $l 'density'
      if ($null -eq $d) { continue }
      if ([int]$d -ne $Density) { continue }
    }
    if ($NativeFontsOnly) {
      $native = [string](Get-Prop $l 'fonts_native')
      if ($native -ne 'yes' -and $native -ne 'True' -and $native -ne 'true') { continue }
    }
    $found += $l
  }

  if ($Json) {
    $found | ConvertTo-Json -Depth 6
    return
  }

  if ($found.Count -eq 0) {
    Write-Host '0 layouts match'
    return
  }

  $rows = @()
  foreach ($m in $found) {
    $rows += [pscustomobject]@{
      id       = [string](Get-Prop $m 'id')
      title    = [string](Get-Prop $m 'title')
      family   = [string](Get-Prop $m 'family')
      density  = [string](Get-Prop $m 'density')
      polish   = [string](Get-Prop $m 'polish_cost')
      capacity = [string](Get-Prop $m 'text_capacity_chars')
    }
  }
  $rows | Format-Table -AutoSize id, title, family, density, polish, capacity | Out-Host
  Write-Host ("{0} of {1} layouts match" -f $found.Count, $layouts.Count)
}

function Invoke-Show {
  param([string]$Id)
  if ([string]::IsNullOrWhiteSpace($Id)) { throw "show needs a layout id, e.g. .\scripts\slides.ps1 show L012" }
  $layoutsDir = Join-Path $RepoRoot 'layouts'
  $file = $null
  if (Test-Path -LiteralPath $layoutsDir) {
    $hit = Get-ChildItem -LiteralPath $layoutsDir -Filter "$Id*.md" -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -ne $hit) { $file = $hit.FullName }
  }
  if ($null -eq $file) {
    $manifest = Get-LayoutManifest
    foreach ($l in @(Get-Prop $manifest 'layouts')) {
      if ([string](Get-Prop $l 'id') -eq $Id) {
        $file = Join-Path $RepoRoot ((Get-Prop $l 'file') -replace '/', '\')
        break
      }
    }
  }
  if ($null -eq $file -or -not (Test-Path -LiteralPath $file)) { throw "no layout with id '$Id' in layouts/" }

  $lines = Get-Content -LiteralPath $file -Encoding UTF8
  Write-Host ''
  Write-Host $file -ForegroundColor Cyan
  Write-Host ''
  # frontmatter: everything between the first two --- lines
  $inFront = $false
  $done = $false
  foreach ($line in $lines) {
    if ($line.Trim() -eq '---') {
      if (-not $inFront) { $inFront = $true; continue }
      $done = $true
      break
    }
    if ($inFront) { Write-Host $line }
  }
  if (-not $done) { Write-Host '(no frontmatter block)' }
  Write-Host ''
  # element table: the "## Elements" section
  $inTable = $false
  foreach ($line in $lines) {
    if ($line -match '^##\s+Elements\s*$') { $inTable = $true; Write-Host $line; continue }
    if ($inTable) {
      if ($line -match '^#{1,6}\s') { break }
      if ($line.Trim() -ne '') { Write-Host $line }
    }
  }
  Write-Host ''
}

function New-Deck {
  param([string]$Slug)
  if ([string]::IsNullOrWhiteSpace($Slug)) { throw "new-deck needs a slug, e.g. .\scripts\slides.ps1 new-deck acme-q4" }
  if ($Slug -notmatch '^[a-z0-9][a-z0-9-]*$') { throw "slug '$Slug' must be lowercase letters, digits and hyphens" }
  $deckDir = Join-Path (Join-Path $RepoRoot 'presentations') $Slug
  if (Test-Path -LiteralPath $deckDir) { throw "presentations\$Slug already exists" }

  foreach ($sub in @('', 'context', 'slides', 'build')) {
    $p = $deckDir
    if ($sub -ne '') { $p = Join-Path $deckDir $sub }
    New-Item -ItemType Directory -Path $p -Force | Out-Null
  }

  $today = (Get-Date).ToString('yyyy-MM-dd')
  $brief = @"
---
deck: "$Slug"
title: $Slug
created: $today
audience:
purpose:
delivery_mode:
length_minutes:
target_slides:
density:
polish:
pairing:
brand: neutral
brand_kit_id: kAHHTmdCWzo
fonts_native_required: no
flow_template:
content_generation: preserve
verbosity: standard
content_public: false
status: draft
---

# Brief

One paragraph on what this deck must achieve and for whom. Fill the dials above from
spec/vocab (audience, purpose, density, polish, flow_template); leave a dial empty to let
the planner choose and record its choice in plan.md.

## Must include

- (units that have to appear, in the operator's words)

## Must not include

- (topics, numbers or claims that stay out)

## Context

Drop every source file into context/. Markdown, txt, csv, json, pdf and images are all read;
put bare links in context/urls.md. Then run /ingest-context and /extract-units.
"@
  $canva = @"
---
deck: "$Slug"
canva_design_id:
canva_folder_id: FAFsWyFFv3w
brand_kit_id: kAHHTmdCWzo
route:
page_count: 0
last_upload:
---

# Canva log

Every MCP call that changes Canva is logged here: the call, the ids it returned, and the
thumbnail (hard rule 6 in CLAUDE.md). Nothing is deleted from Canva without the operator's
exact phrase "I approve the deletion".

| when | call | arguments | ids returned | note |
|------|------|-----------|--------------|------|
"@

  $utf8 = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText((Join-Path $deckDir 'brief.md'), ($brief -replace "`r`n", "`n"), $utf8)
  [System.IO.File]::WriteAllText((Join-Path $deckDir 'canva.md'), ($canva -replace "`r`n", "`n"), $utf8)

  Write-Host "scaffolded presentations\$Slug"
  Write-Host '  brief.md    fill the dials and the brief'
  Write-Host '  context\    drop every source file here'
  Write-Host '  slides\     filled slide MDs land here'
  Write-Host '  build\      deck.html, canva-ops, previews'
  Write-Host '  canva.md    upload and redline log'
  Write-Host ''
  Write-Host "next: /ingest-context $Slug"
}

$exitCode = 0
try {
  switch ($Verb.ToLower()) {
    'validate' {
      $a = @()
      if ($Json) { $a += '--json' }
      Invoke-NodeScript -Script 'validate.mjs' -NodeArgs $a
      $exitCode = $script:LastNodeExit
    }
    'hygiene' {
      Invoke-NodeScript -Script 'validate.mjs' -NodeArgs @('--hygiene-only')
      $exitCode = $script:LastNodeExit
    }
    'build' {
      $a = @()
      if ($Deck -ne '') { $a += @('--deck', $Deck) }
      if ($Family -ne '') { $a += @('--family', $Family) }
      Invoke-NodeScript -Script 'build-html.mjs' -NodeArgs $a
      $exitCode = $script:LastNodeExit
    }
    'build-dc' {
      $a = @()
      if ($Deck -ne '') { $a += @('--deck', $Deck) }
      if ($Family -ne '') { $a += @('--family', $Family) }
      Invoke-NodeScript -Script 'build-dc.mjs' -NodeArgs $a
      $exitCode = $script:LastNodeExit
    }
    'ops' {
      $a = @()
      if ($Deck -ne '') { $a += @('--deck', $Deck) }
      elseif ($Target -ne '') { $a += @('--deck', $Target) }
      Invoke-NodeScript -Script 'build-canva-ops.mjs' -NodeArgs $a
      $exitCode = $script:LastNodeExit
    }
    'manifest' { Invoke-NodeScript -Script 'manifest.mjs'; $exitCode = $script:LastNodeExit }
    'preview' { Invoke-NodeScript -Script 'preview.mjs'; $exitCode = $script:LastNodeExit }
    'find' { Invoke-Find; $exitCode = 0 }
    'show' { Invoke-Show -Id $Target; $exitCode = 0 }
    'new-deck' { New-Deck -Slug $Target; $exitCode = 0 }
    'help' { Show-Help; $exitCode = 0 }
    default {
      Write-Err "unknown verb '$Verb'"
      Show-Help
      $exitCode = 2
    }
  }
}
catch {
  Write-Err $_.Exception.Message
  $exitCode = 1
}

exit $exitCode
