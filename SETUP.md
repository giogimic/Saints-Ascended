# Saints Ascended Setup Guide

This guide will help you install and configure the Saints Ascended dashboard for ARK: Survival Ascended dedicated server management.

## Prerequisites

- Node.js 18+ (recommended)
- npm or bun
- (Optional) Caddy or Nginx for reverse proxy/SSL
- (Optional) SQLite (default, included)

## Quick Start

1. **Clone the repository**
   ```sh
   git clone <repository-url>
   cd saints-ascended
   ```

2. **Install dependencies**
   ```sh
   npm install
   # or
   bun install
   ```

3. **Run the dashboard**
   ```sh
   npm run dev
   # or
   bun run dev
   ```

4. **Access the dashboard**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

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