# 🚀 Server Startup Guide

## Quick Start (Recommended)

### Method 1: Clean Start Script
```bash
npm run dev:clean
```
This is the safest method that automatically handles port conflicts.

### Method 2: Batch File
```bash
start-dev.bat
```
Double-click this file or run it from command prompt.

### Method 3: PowerShell Script
```powershell
.\start-server.ps1
```

## Manual Start (If needed)

### PowerShell
```powershell
$env:DATABASE_URL="file:./db/custom.db"; $env:JWT_SECRET="your-super-secret-jwt-key-change-in-production"; npm run dev
```

### Command Prompt
```cmd
set DATABASE_URL=file:./db/custom.db
set JWT_SECRET=your-super-secret-jwt-key-change-in-production
npm run dev
```

## Troubleshooting

### If you get "EADDRINUSE" error:
1. Run: `taskkill /f /im node.exe`
2. Wait 3 seconds
3. Try starting again with any method above

### If server crashes:
1. Check the console for error messages
2. Kill all Node processes: `taskkill /f /im node.exe`
3. Restart using `npm run dev:clean`

## Test Your Application

- **Main Page**: http://localhost:3001
- **Login Test**: 
  - Email: `test@example.com`
  - Password: `password123`
  - Role: `STUDENT`

## Features Fixed

✅ **Port Conflict Handling** - Automatically kills existing processes
✅ **Environment Variables** - Properly loaded for database and JWT
✅ **Error Handling** - Better error messages and logging
✅ **Registration Validation** - Clear email format validation
✅ **Server Stability** - No more crash loops

## Files Created

- `start-dev.bat` - Windows batch file for clean startup
- `start-server.ps1` - PowerShell script with process checking
- `kill-and-start.bat` - Simple kill and start script
- `STARTUP-GUIDE.md` - This guide

Your application is now running smoothly! 🎉
