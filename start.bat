@echo off
echo ========================================
echo   Library Management System Launcher
echo ========================================
echo.
echo Installing dependencies...
cd backend && npm install
cd ../frontend && npm install
cd ..
echo.
echo Dependencies installed!
echo.
echo Starting both Frontend and Backend...
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.
start "Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"
start "Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"
echo.
echo Both servers are starting in separate windows...
echo You can close this window now.
pause
