# Saints Ascended - Setup Guide

This guide will help you set up Saints Ascended on your system. We provide automated installation scripts to simplify the process.

## ⚡ Quick Install

For the fastest setup, run one of our automated installation scripts:

```bash
# Clone the repository
git clone <repository-url>
cd saints-ascended

# Windows users (Command Prompt/PowerShell)
.\install\setup.bat

# Git Bash/WSL users
./install/setup.sh
```

The script will handle everything automatically:
- ✅ Check Node.js requirements
- ✅ Download and install SteamCMD
- ✅ Create necessary directories
- ✅ Install project dependencies
- ✅ Set up initial configuration
- ✅ Optionally install Ark server

After running the script, start the application:
```bash
npm run dev
```

Then visit `http://localhost:3000` in your browser.

### 🔑 Optional: CurseForge API Key

For mod search functionality, you can add your CurseForge API key to `.env.local`:

1. Get your API key from [CurseForge Console](https://console.curseforge.com/#/api-keys)
2. Edit `.env.local` and replace `your_curseforge_api_key_here` with your actual key
3. Restart the application

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Windows 10/11** - Required for Ark server executable
- **Git** - For cloning the repository

### 1. Automated Installation

We provide two installation scripts in the `install` directory:
- `setup.bat` - For Windows users (recommended)
- `setup.sh` - For Git Bash/WSL users

```bash
# Clone the repository
git clone <repository-url>
cd saints-ascended

# Run the setup script
# Option 1: Windows Command Prompt/PowerShell
.\install\setup.bat

# Option 2: Git Bash/WSL
./install/setup.sh
```

The setup script will:
- Check for Node.js installation
- Create necessary directories
- Download and install SteamCMD
- Create initial configuration
- Install project dependencies
- Optionally install the Ark server

### 2. Manual Installation (Alternative)

If you prefer to install manually:

```bash
# Install dependencies
npm install

# Verify installation
npm run verify

# Start development server
npm run dev
```

## 🔒 Production Setup

### Reverse Proxy with Caddy (Recommended)

We recommend using Caddy as a reverse proxy for:
- Automatic HTTPS with Let's Encrypt
- WebSocket support
- Security headers
- Compression
- Access logging

1. **Install Caddy** - [Official Instructions](https://caddyserver.com/docs/install)

2. **Use our sample configuration**
   Copy `install/Caddyfile` to your Caddy configuration directory and modify:
   ```bash
   # Replace ark.yourdomain.com with your domain
   sed -i 's/ark.yourdomain.com/your-actual-domain.com/' Caddyfile
   ```

3. **Start Caddy**
   ```bash
   sudo systemctl start caddy
   ```

# Ark Server Manager - Setup Guide

This guide will help you set up the AI-First Ark: Survival Ascended Dedicated Server Manager on your system.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Windows 10/11** - Required for Ark server executable
- **SteamCMD** - [Download here](https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip)
- **Ark: Survival Ascended Dedicated Server** - Via SteamCMD

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd web-app

# Install dependencies
npm install

# Verify installation (including DaisyUI)
npm run verify

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### 2. SteamCMD Setup

1. **Download SteamCMD**
   ```bash
   # Download steamcmd.zip from: https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip
   # Extract to C:\SteamCMD\
   ```

2. **Install Ark Server**
   ```bash
   # Run SteamCMD
   C:\SteamCMD\steamcmd.exe

   # In SteamCMD console:
   force_install_dir "C:\ArkServer"
   login anonymous
   app_update 2430930 validate
   quit
   ```

3. **Verify Installation**
   - Server executable should be at: `C:\ArkServer\ShooterGameServer.exe`
   - Config directory: `C:\ArkServer\ShooterGame\Saved\Config\WindowsServer`

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Development settings
NODE_ENV=development
PORT=3000

# WebSocket settings
WS_PORT=3001

# File paths (adjust for your system)
DEFAULT_STEAMCMD_PATH=C:\\SteamCMD\\steamcmd.exe
DEFAULT_SERVER_PATH=C:\\ArkServer

# Optional: Database (for production)
DATABASE_URL=postgresql://user:password@localhost:5432/arkmanager
```