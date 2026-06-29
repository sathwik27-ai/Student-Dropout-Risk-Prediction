# Environment Setup Script
# This script ensures environment variables are properly set

Write-Host "Setting up environment variables..." -ForegroundColor Green

# Set environment variables
$env:DATABASE_URL = "file:./db/custom.db"
$env:JWT_SECRET = "your-super-secret-jwt-key-change-in-production"
$env:NODE_ENV = "development"

# Verify they are set
Write-Host "Environment variables:" -ForegroundColor Cyan
Write-Host "DATABASE_URL: $env:DATABASE_URL" -ForegroundColor White
Write-Host "JWT_SECRET: SET" -ForegroundColor White
Write-Host "NODE_ENV: $env:NODE_ENV" -ForegroundColor White

# Check if database file exists
if (Test-Path "db/custom.db") {
    Write-Host "✅ Database file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Database file not found. Creating directory..." -ForegroundColor Red
    New-Item -ItemType Directory -Path "db" -Force | Out-Null
    Write-Host "✅ Database directory created" -ForegroundColor Green
}

Write-Host "Environment setup complete!" -ForegroundColor Green
