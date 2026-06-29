# PowerShell script to start the development server with proper environment variables
Write-Host "Starting development server with environment variables..." -ForegroundColor Green

# Kill any existing Node.js processes
Write-Host "Checking for existing processes on port 3001..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "Killed existing Node processes" -ForegroundColor Yellow

# Wait a moment for processes to be killed
Start-Sleep -Seconds 2

# Run environment setup
Write-Host "Setting up environment..." -ForegroundColor Yellow
& ".\setup-env.ps1"

# Start the development server
Write-Host "Starting development server on http://localhost:3001..." -ForegroundColor Green
npm run dev