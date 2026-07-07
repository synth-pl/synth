# install.ps1 - Installs the Synth language extension into Cursor and VS Code.
# Run from the vscode-extension directory: .\install.ps1

$version = "1.0.3"
$extensionId = "synth-lang.synth-language-$version"
$src = $PSScriptRoot

$destinations = @(
  (Join-Path $env:USERPROFILE ".cursor\extensions\$extensionId"),
  (Join-Path $env:USERPROFILE ".vscode\extensions\$extensionId")
)

function Remove-StaleExtensionRegistryEntries {
  param([string]$RegistryPath)

  if (-not (Test-Path $RegistryPath)) { return }

  try {
    $raw = Get-Content $RegistryPath -Raw | ConvertFrom-Json
    $extensionsRoot = Split-Path $RegistryPath -Parent
    $kept = @()

    foreach ($entry in $raw) {
      $rel = $entry.relativeLocation
      if (-not $rel) { $kept += $entry; continue }
      $folder = Join-Path $extensionsRoot $rel
      if (Test-Path $folder) {
        $kept += $entry
      } else {
        Write-Host "  Pruned missing extension: $rel" -ForegroundColor DarkGray
      }
    }

    if ($kept.Count -ne $raw.Count) {
      $kept | ConvertTo-Json -Depth 10 | Set-Content $RegistryPath -Encoding UTF8
    }
  } catch {
    Write-Host "  Warning: could not prune $RegistryPath ($($_.Exception.Message))" -ForegroundColor Yellow
  }
}

Write-Host "Installing Synth language extension v$version..." -ForegroundColor Cyan

# Remove old versions
$legacyIds = @(
  "synth-lang.synth-language-0.1.0",
  "synth-lang.synth-language-1.0.0",
  "synth-lang.synth-language-1.0.1",
  "synth-lang.synth-language-1.0.2",
  "axon-lang.axon-language-0.1.0"
)

foreach ($root in @(
  (Join-Path $env:USERPROFILE ".cursor\extensions"),
  (Join-Path $env:USERPROFILE ".vscode\extensions")
)) {
  foreach ($legacy in $legacyIds) {
    $legacyPath = Join-Path $root $legacy
    if (Test-Path $legacyPath) {
      Remove-Item -Recurse -Force $legacyPath
      Write-Host "  Removed legacy: $legacy ($root)" -ForegroundColor DarkGray
    }
  }

  Remove-StaleExtensionRegistryEntries (Join-Path $root "extensions.json")
}

foreach ($dest in $destinations) {
  if (Test-Path $dest) {
    Remove-Item -Recurse -Force $dest
    Write-Host "  Removed old install: $dest" -ForegroundColor DarkGray
  }

  New-Item -ItemType Directory -Force $dest | Out-Null
  Copy-Item "$src\package.json" $dest
  Copy-Item "$src\extension.js" $dest
  Copy-Item "$src\language-configuration.json" $dest
  Copy-Item "$src\README.md" $dest -ErrorAction SilentlyContinue
  Copy-Item "$src\LICENSE" $dest -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Force "$dest\syntaxes" | Out-Null
  Copy-Item "$src\syntaxes\*" "$dest\syntaxes\"

  Write-Host "  Installed to: $dest" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done! Reload your editor window (Developer: Reload Window)" -ForegroundColor Green
Write-Host "Open any .syn file - language mode should show Synth in the status bar." -ForegroundColor Cyan
