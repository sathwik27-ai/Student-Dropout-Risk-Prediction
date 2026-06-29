@echo off
echo Starting development server...

REM Kill any existing Node.js processes
echo Checking for existing processes on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 2^>nul') do (
    echo Found process %%a using port 3001. Killing it...
    taskkill /f /pid %%a >nul 2>&1
)

REM Kill all node processes as backup
echo Killing all Node.js processes...
taskkill /f /im node.exe >nul 2>&1

REM Wait a moment for processes to be killed
echo Waiting for processes to stop...
timeout /t 3 /nobreak >nul

REM Set environment variables
set DATABASE_URL=file:./db/custom.db
set JWT_SECRET=your-super-secret-jwt-key-change-in-production

echo Environment variables set successfully!
echo Starting development server on http://localhost:3001...

REM Start the development server
npm run dev
