@echo off
setlocal enabledelayedexpansion

echo Saints Ascended Server Manager Setup
echo ======================================

:: Check for Node.js
echo Checking for Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js not found. Please install Node.js 18 or later from https://nodejs.org/
    exit /b 1
)

:: Check Node.js version
for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
    set NODE_VER=%%a
    set NODE_VER=!NODE_VER:~1!
)
if !NODE_VER! LSS 18 (
    echo Error: Node.js version must be 18 or greater. Current version: !NODE_VER!
    exit /b 1
)

:: Create directories
echo Creating directories...
if not exist "C:\SteamCMD" mkdir "C:\SteamCMD"
if not exist "C:\ArkServer" mkdir "C:\ArkServer"

:: Download SteamCMD if not exists
if not exist "C:\SteamCMD\steamcmd.exe" (
    echo Downloading SteamCMD...
    powershell -Command "Invoke-WebRequest -Uri 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip' -OutFile 'C:\SteamCMD\steamcmd.zip'"
    
    echo Extracting SteamCMD...
    powershell -Command "Expand-Archive -Path 'C:\SteamCMD\steamcmd.zip' -DestinationPath 'C:\SteamCMD' -Force"
    del "C:\SteamCMD\steamcmd.zip"
)

:: Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo Creating .env.local...
    (
        echo # Development settings
        echo NODE_ENV=development
        echo PORT=3000
        echo.
        echo # WebSocket settings
        echo WS_PORT=3001
        echo.
        echo # File paths
        echo DEFAULT_STEAMCMD_PATH=C:\SteamCMD\steamcmd.exe
        echo DEFAULT_SERVER_PATH=C:\ArkServer
        echo.
        echo # CurseForge API (optional - for mod search functionality)
        echo # Get your API key from: https://console.curseforge.com/#/api-keys
        echo CURSEFORGE_API_KEY=your_curseforge_api_key_here
    ) > .env.local
    echo Note: You can add your CurseForge API key to .env.local for mod search functionality
    echo Get your API key from: https://console.curseforge.com/#/api-keys
)

:: Install dependencies
echo Installing dependencies...
call npm install

:: Run verification
echo Verifying installation...
call npm run verify

echo.
echo Setup complete!
echo Next steps:
echo 1. Run 'npm run dev' to start the development server
echo 2. Visit http://localhost:3000 in your browser
echo 3. Follow the first-time setup wizard to configure your server
echo 4. Optional: Add your CurseForge API key to .env.local for mod search

:: Optional: Install Ark server
set /p INSTALL_ARK="Would you like to install the Ark server now? (y/n) "
if /i "%INSTALL_ARK%"=="y" (
    echo Installing Ark server...
    echo This may take a while...
    "C:\SteamCMD\steamcmd.exe" +force_install_dir "C:\ArkServer" +login anonymous +app_update 2430930 validate +quit
) 