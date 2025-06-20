# Saints Ascended Setup Guide

This guide will help you install and configure the Saints Ascended dashboard for ARK: Survival Ascended dedicated server management.

## Prerequisites

- Node.js 18+ (recommended)
- npm or bun
- (Optional) Caddy or Nginx for reverse proxy/SSL
- (Optional) SQLite (default, included)

## Quick Start

### Automatic Installation (Recommended)

**Windows:**
1. Clone the repository and navigate to the directory
2. Run `install/setup.bat` as administrator
3. Follow the prompts to configure your CurseForge API key

**Linux/macOS:**
1. Clone the repository and navigate to the directory
2. Run `chmod +x install/setup.sh && ./install/setup.sh`
3. Follow the prompts to configure your CurseForge API key

### Manual Installation

1. **Clone the repository**
   ```sh
   git clone <repository-url>
   cd saints-ascended
   ```

2. **Set up environment variables**
   ```sh
   cp .env.example .env
   ```
   
   **CRITICAL:** Edit the `.env` file and add your CurseForge API key:
   - Go to https://console.curseforge.com/
   - Create an account or sign in
   - Create a new API key
   - Replace `YOUR_CURSEFORGE_API_KEY_HERE` with your actual API key
   
   The application **will NOT work** without a valid CurseForge API key!

3. **Install dependencies**
   ```sh
   npm install
   # or
   bun install
   ```

4. **Set up the database**
   ```sh
   npm run db:generate
   npm run db:push
   ```

5. **Run the dashboard**
   ```sh
   npm run dev
   # or
   bun run dev
   ```

6. **Access the dashboard**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

The `.env` file contains critical configuration. Here are the required variables:

```bash
# Database path - points to your SQLite database
DATABASE_URL="file:./prisma/data/mods.db"

# CurseForge API key - REQUIRED for mod management
CURSEFORGE_API_KEY="your_actual_api_key_here"

# Application environment
NODE_ENV="development"
```

## Deployment to Another Server

When moving the project to a different server:

1. **Copy the entire project directory**
2. **Copy your `.env` file** (most important!)
3. **Run the setup script again:**
   - Windows: `install/setup.bat`
   - Linux/macOS: `./install/setup.sh`
4. **Alternative manual deployment:**
   ```bash
   npm install
   npm run db:deploy
   npm run dev
   ```

## Database Deployment Commands

If you encounter database issues, try these commands in order:

```bash
# Method 1: Standard deployment
npm run db:deploy

# Method 2: Database push (development)
npm run db:push

# Method 3: Manual deployment (if cross-env fails)
# Windows:
.\deploy-db.bat

# Linux/macOS/Git Bash:
./deploy-db.sh

# PowerShell:
.\deploy-db.ps1
```

## Troubleshooting

### Common Issues

1. **"CURSEFORGE_API_KEY not configured" error:**
   - Check that your `.env` file exists
   - Verify the API key is correctly set (not the placeholder)
   - Ensure there are no extra spaces or quotes

2. **"Environment variable not found: DATABASE_URL" error:**
   - Run the appropriate deployment script for your system
   - Check that the `.env` file exists and has the correct DATABASE_URL

3. **Database migration errors:**
   - Delete `prisma/migrations` folder and run `npm run db:push`
   - Or run the manual deployment scripts

4. **Permission errors on Linux/macOS:**
   ```bash
   chmod +x install/setup.sh
   chmod +x deploy-db.sh
   ```

## Installer Scripts

- **Windows**: Run `install/setup.bat` as administrator.
- **Linux**: Run `install/setup.sh` (make executable with `chmod +x install/setup.sh`).
- **Caddyfile**: Use `install/Caddyfile` for reverse proxy and SSL setup.

## Adding Your First Server

1. Click "Add Server" in the dashboard.
2. Fill out the required fields:
   - Server Name
   - Map
   - Executable Path
   - Config Directory
   - Server Directory
   - Game/Query/RCON Ports
   - Admin/RCON/Server Passwords
   - Max Players
3. Save and manage your server from its dashboard page.

## Mod Management

- Add mods by pasting one or more CurseForge mod IDs (comma-separated).
- The dashboard will fetch mod info and cache it for instant UI updates.
- Remove or reorder mods as needed.
- **Note:** Requires a valid CurseForge API key!

## Configuration Editing

- Use the "Quick Config" modal for fast edits to core server settings.
- Use the advanced config editors for full Game.ini and GameUserSettings.ini editing.

## Contributing Mod Configs

Help improve the dashboard by submitting custom mod config options for `Game.ini` and `GameUserSettings.ini` from your favorite mods!

**Submit your mod config options here:**
[Submit Mod Configs (Google Form)](https://docs.google.com/forms/u/0/d/14ddcHJooHtuw0cX4i51UIu07dCXgANk6wDSmOQU8JDc/edit?pli=1)

## Support

- For issues, use the GitHub Issues page.
- For feature requests or mod config submissions, use the Google Form above.

## License
MIT