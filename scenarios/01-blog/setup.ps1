$ErrorActionPreference = "Stop"

Write-Host "Installing root dependencies..."
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Installing backend dependencies..."
Push-Location backend
npm install
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }
Pop-Location

Write-Host "Installing frontend dependencies..."
Push-Location frontend
npm install
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }
Pop-Location

Write-Host "Preparing the in-memory MongoDB (the first run downloads the binary, about 100 MB)..."
Push-Location backend
node devtools/memory-db.js --check
if ($LASTEXITCODE -ne 0) { Pop-Location; exit $LASTEXITCODE }
Pop-Location

Write-Host "Setup complete!"
Write-Host "To start the application, run: npm start"
