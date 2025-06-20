@echo off
setlocal
cls
title Saints Ascended - Windows Installer

REM Saints Ascended - Windows Installer
REM Modern ARK: Survival Ascended Server Dashboard

echo.
echo  ██████╗ ██╗   ██╗██╗███╗   ██╗████████╗███████╗     █████╗  ███████╗ ██████╗███████╗███╗   ██╗██████╗ ███████╗
echo ██╔════╝ ██║   ██║██║████╗  ██║╚══██╔══╝██╔════╝    ██╔══██╗██╔════╝██╔════╝██╔════╝████╗  ██║██╔══██╗██╔════╝
echo ██║  ███╗██║   ██║██║██╔██╗ ██║   ██║   ███████╗    ███████║█████╗  ██║     █████╗  ██╔██╗ ██║██║  ██║███████╗
echo ██║   ██║██║   ██║██║██║╚██╗██║   ██║   ╚════██║    ██╔══██║██╔══╝  ██║     ██╔══╝  ██║╚██╗██║██║  ██║╚════██║
echo ╚██████╔╝╚██████╔╝██║██║ ╚████║   ██║   ███████║    ██║  ██║███████╗╚██████╗███████╗██║ ╚████║██████╔╝███████║
echo  ╚═════╝  ╚═════╝ ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝    ╚═╝  ╚═╝╚══════╝ ╚═════╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝
echo.
echo                       A cyberpunk-themed ARK: Survival Ascended server management dashboard
echo.
echo.

REM Check for Node.js
echo Checking for prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Node.js is required. Please install Node.js 18+ and re-run this script.
  pause
  exit /b 1
)
echo  - Node.js found.

where git >nul 2>nul
if %errorlevel% neq 0 (
  echo [WARNING] Git is not found. Some features might not work correctly.
) else (
  echo  - Git found.
)
echo.

REM Environment Setup
echo Setting up environment file...
if not exist .env (
    if exist .env.example (
        copy .env.example .env
        echo  - .env file created from .env.example.
        echo  - IMPORTANT: Please edit the .env file and add your CURSEFORGE_API_KEY.
    ) else (
        echo [ERROR] .env.example not found. Cannot create .env file.
        pause
        exit /b 1
    )
) else (
    echo  - .env file already exists. Skipping.
)
echo.

REM Install dependencies
echo Installing dependencies...
if exist package-lock.json (
  echo  - Using npm to install dependencies...
  call npm install --loglevel error
) else if exist bun.lockb (
  echo  - Using bun to install dependencies...
  call bun install
) else (
  echo  - No lockfile found. Using npm...
  call npm install --loglevel error
)
if %errorlevel% neq 0 (
    echo [ERROR] Dependency installation failed. Please check the errors above.
    pause
    exit /b 1
)
echo  - Dependencies installed successfully.
echo.

REM Database Setup
echo Setting up database...
echo  - Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Prisma client generation failed.
    pause
    exit /b 1
)
echo  - Synchronizing database schema...
call npx prisma db push
if %errorlevel% neq 0 (
    echo [ERROR] Database schema push failed.
    pause
    exit /b 1
)
echo  - Database setup complete.
echo.


REM Setup complete
cls
echo.
echo  ██████╗ ███████╗████████╗██████╗  ██████╗     ██████╗  ██████╗ ██████╗ 
echo ██╔════╝ ██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗    ██╔══██╗██╔═══██╗██╔══██╗
echo ██║  ███╗███████╗   ██║   ██████╔╝██║   ██║    ██║  ██║██║   ██║██████╔╝
echo ██║   ██║╚════██║   ██║   ██╔═══╝ ██║   ██║    ██║  ██║██║   ██║██╔═══╝ 
echo ╚██████╔╝███████║   ██║   ██║     ╚██████╔╝    ██████╔╝╚██████╔╝██║     
echo  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝      ╚═════╝     ╚═════╝  ╚═════╝ ╚═╝     
echo.
echo                     Saints Ascended setup is complete!
echo.
echo ------------------------------------------------------------------------
echo.
echo To start the dashboard, run:
echo   npm run dev
echo.
echo Then open http://localhost:3000 in your browser.
echo.
echo [IMPORTANT]
echo You MUST add your CurseForge API key to the .env file for the
echo mod manager to work correctly.
echo.
echo ------------------------------------------------------------------------
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
endlocal 