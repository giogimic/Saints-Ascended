@echo off
REM Saints Ascended - Windows Installer
REM Modern ARK: Survival Ascended Server Dashboard

REM Check for Node.js
where node >nul 2>nul || (
  echo Node.js is required. Please install Node.js 18+ and re-run this script.
  pause
  exit /b 1
)

REM Install dependencies
if exist package-lock.json (
  echo Installing dependencies with npm...
  npm install
) else if exist bun.lock (
  echo Installing dependencies with bun...
  bun install
) else (
  echo No lockfile found. Installing dependencies with npm...
  npm install
)

REM Setup complete
cls

echo Saints Ascended setup complete!
echo.
echo To start the dashboard, run:
echo    npm run dev
echo.
echo Then open http://localhost:3000 in your browser.
echo.
echo This dashboard provides:
echo   - Cyberpunk matrix UI for ARK: Ascended server management
echo   - Add/edit servers, manage mods, edit config files
echo   - Quick config modal for fast server edits
echo   - Bulk mod adding and instant mod info fetching
echo   - Real-time status and metrics
echo.
echo For advanced config, edit Game.ini and GameUserSettings.ini in the dashboard.
echo.
echo To contribute custom mod config options, submit them here:
echo   https://docs.google.com/forms/u/0/d/14ddcHJooHtuw0cX4i51UIu07dCXgANk6wDSmOQU8JDc/edit?pli=1
echo.
pause 