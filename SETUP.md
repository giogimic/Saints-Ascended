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

2. **Set up environment**
   ```sh
   node scripts/setup-env.js
   ```
   
   This will create the necessary directories and set up the database path.

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

6. **Configure CurseForge API Key**
   - Open [http://localhost:3000](http://localhost:3000) in your browser
   - Click the gear icon (Global Settings) in the top right
   - Enter your CurseForge API key and save
   - **CRITICAL:** The application **will NOT work** without a valid CurseForge API key!

7. **Verify API Key**
   ```sh
   node scripts/verify-api-key.js
   ```

## CurseForge API Key Setup

**Getting Your API Key:**
1. Go to https://console.curseforge.com/
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key for your application
5. Copy the API key (BCrypt hash format, starts with `$2a$10$`)

**Setting Your API Key:**
1. Open the Saints Ascended app in your browser
2. Click the gear icon (Global Settings) in the top right corner
3. Paste your CurseForge API key in the designated field
4. Click "Save Settings"
5. Verify it works by running `node scripts/verify-api-key.js`

## Environment Variables

The application now uses Global Settings for configuration, but you can still set these environment variables if needed:

```bash
# Database path - points to your SQLite database
DATABASE_URL="file:./prisma/data/mods.db"

# CurseForge API key - Can be set in Global Settings instead
CURSEFORGE_API_KEY="your_actual_api_key_here"

# Application environment
NODE_ENV="development"
```

**Note:** The CurseForge API key is now primarily managed through the app's Global Settings interface, making it easier to configure without editing files.

## Deployment to Another Server

When moving the project to a different server:

1. **Copy the entire project directory**
2. **Run the setup script:**
   - Windows: `install/setup.bat`
   - Linux/macOS: `./install/setup.sh`
3. **Alternative manual deployment:**
   ```bash
   npm install
   npm run db:deploy
   npm run dev
   ```
4. **Configure your API key in Global Settings** (gear icon in the app interface)

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
   - Check that you've set the API key in Global Settings (gear icon)
   - Verify the API key is correctly copied from CurseForge Console
   - Ensure there are no extra spaces or quotes
   - Run `node scripts/verify-api-key.js` to test

2. **"Environment variable not found: DATABASE_URL" error:**
   - Run `node scripts/setup-env.js` to set up the environment
   - Run the appropriate deployment script for your system

3. **Database migration errors:**
   - Delete `prisma/migrations` folder and run `npm run db:push`
   - Or run the manual deployment scripts

4. **Permission errors on Linux/macOS:**
   ```bash
   chmod +x install/setup.sh
   chmod +x deploy-db.sh
   ```

5. **API key format issues:**
   - CurseForge API keys should be in BCrypt hash format (starts with `$2a$10$`)
   - If you see a warning about the format, it's likely correct - CurseForge uses BCrypt hashes
   - Run `node scripts/verify-api-key.js` to confirm it works

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
- **Note:** Requires a valid CurseForge API key configured in Global Settings!

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