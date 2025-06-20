#!/bin/bash
set -e

# Saints Ascended - Linux/macOS Installer
# Modern ARK: Survival Ascended Server Dashboard

echo ""
echo "  ██████╗ ██╗   ██╗██╗███╗   ██╗████████╗███████╗     █████╗  ███████╗ ██████╗███████╗███╗   ██╗██████╗ ███████╗"
echo " ██╔════╝ ██║   ██║██║████╗  ██║╚══██╔══╝██╔════╝    ██╔══██╗██╔════╝██╔════╝██╔════╝████╗  ██║██╔══██╗██╔════╝"
echo " ██║  ███╗██║   ██║██║██╔██╗ ██║   ██║   ███████╗    ███████║█████╗  ██║     █████╗  ██╔██╗ ██║██║  ██║███████╗"
echo " ██║   ██║██║   ██║██║██║╚██╗██║   ██║   ╚════██║    ██╔══██║██╔══╝  ██║     ██╔══╝  ██║╚██╗██║██║  ██║╚════██║"
echo " ╚██████╔╝╚██████╔╝██║██║ ╚████║   ██║   ███████║    ██║  ██║███████╗╚██████╗███████╗██║ ╚████║██████╔╝███████║"
echo "  ╚═════╝  ╚═════╝ ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝    ╚═╝  ╚═╝╚══════╝ ╚═════╝╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝"
echo ""
echo "                       A cyberpunk-themed ARK: Survival Ascended server management dashboard"
echo ""
echo ""

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check for Node.js
echo "Checking for prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Node.js is required. Please install Node.js 18+ and re-run this script."
    echo "Download from: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN} - Node.js found.${NC}"

if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}[WARNING]${NC} Git is not found. Some features might not work correctly."
    echo "Install git using your package manager (e.g., apt, brew, yum)"
else
    echo -e "${GREEN} - Git found.${NC}"
fi
echo ""

# Environment Setup
echo "Setting up environment file..."
if [[ ! -f .env ]]; then
    if [[ -f .env.example ]]; then
        cp .env.example .env
        echo -e "${GREEN} - .env file created from .env.example.${NC}"
        echo ""
        echo -e "${RED}[CRITICAL]${NC} You MUST edit the .env file and add your CurseForge API key!"
        echo ""
        echo "Steps to get your CurseForge API key:"
        echo "1. Go to: https://console.curseforge.com/"
        echo "2. Create an account or sign in"
        echo "3. Create a new API key"
        echo "4. Copy the API key"
        echo "5. Edit the .env file and replace \"YOUR_CURSEFORGE_API_KEY_HERE\" with your actual key"
        echo ""
        echo "The application will NOT work without a valid CurseForge API key!"
        echo ""
        read -p "Press Enter to continue after noting the above instructions..."
    else
        echo -e "${RED}[ERROR]${NC} .env.example not found. Creating a basic .env file..."
        cat > .env << EOF
# Saints Ascended Environment Configuration
DATABASE_URL="file:./prisma/data/mods.db"
CURSEFORGE_API_KEY="YOUR_CURSEFORGE_API_KEY_HERE"
NODE_ENV="development"
EOF
        echo -e "${GREEN} - Basic .env file created.${NC}"
        echo ""
        echo -e "${RED}[CRITICAL]${NC} You MUST edit the .env file and add your CurseForge API key!"
        echo "Go to https://console.curseforge.com/ to get your API key."
        echo ""
        read -p "Press Enter to continue after noting the above instructions..."
    fi
else
    echo -e "${GREEN} - .env file already exists.${NC}"
    echo " - Checking if CurseForge API key is configured..."
    if grep -q "YOUR_CURSEFORGE_API_KEY_HERE" .env; then
        echo -e "${YELLOW}[WARNING]${NC} CurseForge API key appears to be the default placeholder."
        echo "Please edit .env and add your actual API key from https://console.curseforge.com/"
        echo ""
    else
        echo -e "${GREEN} - CurseForge API key appears to be configured.${NC}"
    fi
fi
echo ""

# Install dependencies
echo "Installing dependencies..."
if [[ -f package-lock.json ]]; then
    echo " - Using npm to install dependencies..."
    npm install --loglevel error
elif [[ -f bun.lockb ]]; then
    echo " - Using bun to install dependencies..."
    bun install
else
    echo " - No lockfile found. Using npm..."
    npm install --loglevel error
fi
echo -e "${GREEN} - Dependencies installed successfully.${NC}"
echo ""

# Database Setup
echo "Setting up database..."
echo " - Ensuring database directory exists..."
mkdir -p prisma/data

echo " - Generating Prisma client..."
npm run db:generate
if [[ $? -ne 0 ]]; then
    echo -e "${RED}[ERROR]${NC} Prisma client generation failed."
    exit 1
fi

echo " - Setting up database schema..."
npm run db:push
if [[ $? -ne 0 ]]; then
    echo -e "${YELLOW}[WARNING]${NC} Database schema push failed. Trying deployment method..."
    npm run db:deploy
    if [[ $? -ne 0 ]]; then
        echo -e "${RED}[ERROR]${NC} Database setup failed. Trying manual method..."
        ./deploy-db.sh
        if [[ $? -ne 0 ]]; then
            echo -e "${RED}[ERROR]${NC} All database setup methods failed."
            echo "Please check the .env file and try running: npm run db:push"
            exit 1
        fi
    fi
fi
echo -e "${GREEN} - Database setup complete.${NC}"
echo ""

# Verify setup
echo "Verifying installation..."
if [[ -d node_modules ]]; then
    echo -e "${GREEN} - Dependencies installed: OK${NC}"
else
    echo -e "${RED} - Dependencies installed: FAILED${NC}"
fi

if [[ -f .env ]]; then
    echo -e "${GREEN} - Environment file: OK${NC}"
else
    echo -e "${RED} - Environment file: FAILED${NC}"
fi

if [[ -f "prisma/data/mods.db" ]]; then
    echo -e "${GREEN} - Database file: OK${NC}"
elif [[ -f "prisma/dev.db" ]]; then
    echo -e "${GREEN} - Database file: OK (dev.db)${NC}"
else
    echo -e "${YELLOW} - Database file: WARNING - No database found${NC}"
fi
echo ""

# Setup complete
clear
echo ""
echo "  ██████╗ ███████╗████████╗██████╗  ██████╗     ██████╗  ██████╗ ██████╗ "
echo " ██╔════╝ ██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗    ██╔══██╗██╔═══██╗██╔══██╗"
echo " ██║  ███╗███████╗   ██║   ██████╔╝██║   ██║    ██║  ██║██║   ██║██████╔╝"
echo " ██║   ██║╚════██║   ██║   ██╔═══╝ ██║   ██║    ██║  ██║██║   ██║██╔═══╝ "
echo " ╚██████╔╝███████║   ██║   ██║     ╚██████╔╝    ██████╔╝╚██████╔╝██║     "
echo "  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝      ╚═════╝     ╚═════╝  ╚═════╝ ╚═╝     "
echo ""
echo -e "${GREEN}                     Saints Ascended setup is complete!${NC}"
echo ""
echo "------------------------------------------------------------------------"
echo ""
echo "To start the dashboard, run:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser."
echo ""
echo -e "${YELLOW}[IMPORTANT REMINDERS]${NC}"
echo "1. Edit the .env file and add your CurseForge API key from:"
echo "   https://console.curseforge.com/"
echo ""
echo "2. The mod manager will NOT work without a valid API key!"
echo ""
echo "3. If you move this to another server, copy the .env file"
echo "   and run this setup script again."
echo ""
echo "------------------------------------------------------------------------"
echo ""
echo "This dashboard provides:"
echo "  - Cyberpunk matrix UI for ARK: Ascended server management"
echo "  - Add/edit servers, manage mods, edit config files"
echo "  - Quick config modal for fast server edits"
echo "  - Bulk mod adding and instant mod info fetching"
echo "  - Real-time status and metrics"
echo ""
echo "For advanced config, edit Game.ini and GameUserSettings.ini in the dashboard."
echo ""
echo "To contribute custom mod config options, submit them here:"
echo "  https://docs.google.com/forms/u/0/d/14ddcHJooHtuw0cX4i51UIu07dCXgANk6wDSmOQU8JDc/edit?pli=1"
echo ""
echo "If you encounter issues, check:"
echo "  - .env file has your actual CurseForge API key"
echo "  - Database exists in prisma/data/mods.db"
echo "  - Node.js version is 18 or higher"
echo ""
echo -e "${GREEN}Setup complete!${NC} You can now start the dashboard with 'npm run dev'" 