#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Saints Ascended Server Manager Setup${NC}"
echo "======================================"

# Check if running on Windows
if [[ "$OSTYPE" != "msys"* ]] && [[ "$OSTYPE" != "cygwin"* ]] && [[ "$OSTYPE" != "win"* ]]; then
    echo -e "${RED}Error: This script must be run on Windows${NC}"
    exit 1
fi

# Check for Node.js
echo -e "\n${YELLOW}Checking for Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js not found. Please install Node.js 18 or later from https://nodejs.org/${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
if (( ${NODE_VERSION%%.*} < 18 )); then
    echo -e "${RED}Node.js version must be 18 or greater. Current version: ${NODE_VERSION}${NC}"
    exit 1
fi

# Create directories
echo -e "\n${YELLOW}Creating directories...${NC}"
mkdir -p "C:\\SteamCMD"
mkdir -p "C:\\ArkServer"

# Download SteamCMD if not exists
if [ ! -f "C:\\SteamCMD\\steamcmd.exe" ]; then
    echo -e "\n${YELLOW}Downloading SteamCMD...${NC}"
    curl -L "https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip" -o "C:\\SteamCMD\\steamcmd.zip"
    
    echo -e "${YELLOW}Extracting SteamCMD...${NC}"
    powershell -command "Expand-Archive -Path 'C:\\SteamCMD\\steamcmd.zip' -DestinationPath 'C:\\SteamCMD' -Force"
    rm "C:\\SteamCMD\\steamcmd.zip"
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo -e "\n${YELLOW}Creating .env.local...${NC}"
    cat > .env.local << EOL
# Development settings
NODE_ENV=development
PORT=3000

# WebSocket settings
WS_PORT=3001

# File paths
DEFAULT_STEAMCMD_PATH=C:\\SteamCMD\\steamcmd.exe
DEFAULT_SERVER_PATH=C:\\ArkServer

# CurseForge API (optional - for mod search functionality)
# Get your API key from: https://console.curseforge.com/#/api-keys
CURSEFORGE_API_KEY=your_curseforge_api_key_here
EOL
    echo -e "${YELLOW}Note: You can add your CurseForge API key to .env.local for mod search functionality${NC}"
    echo -e "${YELLOW}Get your API key from: https://console.curseforge.com/#/api-keys${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install

# Run verification
echo -e "\n${YELLOW}Verifying installation...${NC}"
npm run verify

echo -e "\n${GREEN}Setup complete!${NC}"
echo -e "Next steps:"
echo -e "1. Run ${YELLOW}npm run dev${NC} to start the development server"
echo -e "2. Visit ${YELLOW}http://localhost:3000${NC} in your browser"
echo -e "3. Follow the first-time setup wizard to configure your server"
echo -e "4. Optional: Add your CurseForge API key to .env.local for mod search"

# Optional: Install Ark server
read -p "Would you like to install the Ark server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "\n${YELLOW}Installing Ark server...${NC}"
    echo -e "${YELLOW}This may take a while...${NC}"
    "C:\\SteamCMD\\steamcmd.exe" +force_install_dir "C:\\ArkServer" +login anonymous +app_update 2430930 validate +quit
fi 