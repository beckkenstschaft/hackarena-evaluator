@echo off
REM HackArena Startup Script
REM Double-click to run everything

echo ==================================================
echo HackArena Backend Startup
echo ==================================================

cd /d "%~dp0backend"

echo.
echo [1] Starting backend server...
start /b cmd /c "node src\index.js"

timeout /t 3 /nobreak >nul

echo [2] Starting localtunnel...
start /b cmd /c "npx localtunnel --port 5000"

echo.
echo ==================================================
echo Keep both terminal windows open!
echo ==================================================
echo.
echo Once you get your URL, the script will
echo automatically update and push to GitHub.
echo.
pause