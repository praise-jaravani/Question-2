# Prepares one scenario for practice. Run it from inside the scenario folder:
#   cd scenarios\01-blog
#   ..\..\init-scenario.ps1
#
# Installs dependencies, pre-downloads the in-memory MongoDB, creates the local
# git baseline that `make reset` restores, and marks the read-only files.
$ErrorActionPreference = "Stop"

if (-not (Test-Path package.json) -or -not (Test-Path backend)) {
  Write-Host "Run this from inside a scenario folder, e.g. cd scenarios\01-blog"
  exit 1
}

$scenario = Split-Path -Leaf (Get-Location)
Write-Host "Preparing $scenario..."

Write-Host ""
Write-Host "[1/3] Installing dependencies and preparing the database (this takes a few minutes the first time)..."
npm run setup
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "[2/3] Creating the reset baseline..."
if (Test-Path .git) {
  Write-Host "      A git repository already exists here - leaving it alone."
  git rev-parse start 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) { git tag start }
} else {
  git init -b main -q
  git add -A
  git -c user.email=practice@local -c user.name="Practice Lab" commit -q -m "Initial commit"
  git tag -f start | Out-Null
}

Write-Host ""
Write-Host "[3/3] Marking the read-only files..."
# The authoritative list lives in PROJECT_FILES_INSTRUCTIONS.md.
$count = 0
Get-Content PROJECT_FILES_INSTRUCTIONS.md | Where-Object { $_ -match '^- ' } | ForEach-Object {
  $file = ($_ -replace '^- ', '').Trim()
  if (Test-Path -PathType Leaf $file) {
    Set-ItemProperty -Path $file -Name IsReadOnly -Value $true
    $count++
  }
}
Write-Host "      $count files marked read-only."
git update-index --refresh 2>$null | Out-Null

Write-Host ""
Write-Host "Setup complete for $scenario."
Write-Host ""
Write-Host "Next:"
Write-Host "  1. Read QUESTION.md, README.md and PROJECT_FILES_INSTRUCTIONS.md"
Write-Host "  2. Start a timer (60 minutes to simulate the exam)"
Write-Host "  3. Terminal 1: make start    Terminal 2: make test    Terminal 3: claude"
Write-Host ""
Write-Host "Run 'make' to see every command. Don't open answer-keys/ until you've debriefed."
