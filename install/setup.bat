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
  echo Download from: https://nodejs.org/
  pause
  exit /b 1
)
echo  - Node.js found.

where git >nul 2>nul
if %errorlevel% neq 0 (
  echo [WARNING] Git is not found. Some features might not work correctly.
  echo Download from: https://git-scm.com/
) else (
  echo  - Git found.
)
echo.

REM Environment Setup
echo Setting up environment file...
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo  - .env file created from .env.example.
        echo.
        echo [CRITICAL] You MUST edit the .env file and add your CurseForge API key!
        echo.
        echo Steps to get your CurseForge API key:
        echo 1. Go to: https://console.curseforge.com/
        echo 2. Create an account or sign in
        echo 3. Create a new API key
        echo 4. Copy the API key
        echo 5. Edit the .env file and replace "YOUR_CURSEFORGE_API_KEY_HERE" with your actual key
        echo.
        echo The application will NOT work without a valid CurseForge API key!
        echo.
        set /p dummy="Press Enter to continue after noting the above instructions..."
    ) else (
        echo [ERROR] .env.example not found. Cannot create .env file.
        echo Creating a basic .env file with required variables...
        echo # Saints Ascended Environment Configuration > .env
        echo DATABASE_URL="file:./prisma/data/mods.db" >> .env
        echo CURSEFORGE_API_KEY="YOUR_CURSEFORGE_API_KEY_HERE" >> .env
        echo NODE_ENV="development" >> .env
        echo  - Basic .env file created.
        echo.
        echo [CRITICAL] You MUST edit the .env file and add your CurseForge API key!
        echo Go to https://console.curseforge.com/ to get your API key.
        echo.
        set /p dummy="Press Enter to continue after noting the above instructions..."
    )
) else (
    echo  - .env file already exists.
    echo  - Checking if CurseForge API key is configured...
    findstr /C:"YOUR_CURSEFORGE_API_KEY_HERE" .env >nul
    if %errorlevel% equ 0 (
        echo [WARNING] CurseForge API key appears to be the default placeholder.
        echo Please edit .env and add your actual API key from https://console.curseforge.com/
        echo.
    ) else (
        echo  - CurseForge API key appears to be configured.
    )
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
echo  - Ensuring database directory exists...
if not exist "prisma\data" mkdir "prisma\data"

echo  - Generating Prisma client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo [ERROR] Prisma client generation failed.
    pause
    exit /b 1
)

echo  - Setting up database schema...
call npm run db:push
if %errorlevel% neq 0 (
    echo [WARNING] Database schema push failed. Trying deployment method...
    call npm run db:deploy
    if %errorlevel% neq 0 (
        echo [ERROR] Database setup failed. Trying manual method...
        call .\deploy-db.bat
        if %errorlevel% neq 0 (
            echo [ERROR] All database setup methods failed.
            echo Please check the .env file and try running: npm run db:push
            pause
            exit /b 1
        )
    )
)
echo  - Database setup complete.
echo.

REM Verify setup
echo Verifying installation...
if exist node_modules (
    echo  - Dependencies installed: OK
) else (
    echo  - Dependencies installed: FAILED
)

if exist .env (
    echo  - Environment file: OK
) else (
    echo  - Environment file: FAILED
)

if exist "prisma\data\mods.db" (
    echo  - Database file: OK
) else if exist "prisma\dev.db" (
    echo  - Database file: OK (dev.db)
) else (
    echo  - Database file: WARNING - No database found
)
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
echo [IMPORTANT REMINDERS]
echo 1. Edit the .env file and add your CurseForge API key from:
echo    https://console.curseforge.com/
echo.
echo 2. The mod manager will NOT work without a valid API key!
echo.
echo 3. If you move this to another server, copy the .env file
echo    and run this setup script again.
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
echo If you encounter issues, check:
echo   - .env file has your actual CurseForge API key
echo   - Database exists in prisma/data/mods.db
echo   - Node.js version is 18 or higher
echo.
pause
endlocal 