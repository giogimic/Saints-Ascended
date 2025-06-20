# Saints Ascended

A modern, cyberpunk-themed Next.js dashboard for managing ARK: Survival Ascended dedicated servers. Provides a visually immersive, matrix-inspired control panel for server admins, with advanced mod management, real-time config editing, and seamless server operations.

## Features

- **Cyberpunk Matrix UI**: Custom matrix color palette, animated backgrounds, and technical panel styling.
- **Server Management**: Add, edit, and manage multiple ARK: Ascended servers with detailed configuration.
- **Quick Config Modal**: Instantly edit core server settings, ports, and passwords in a wide, organized modal.
- **Advanced Mod Management**: Bulk add mods by ID, instant fetch from CurseForge, caching, and UI updates.
- **Real-Time Status**: Live server status, metrics, and logs with animated overlays.
- **Global Settings**: Centralized global configuration for the dashboard.
- **Installer Scripts**: Automated setup for Windows and Linux (see `install/`).

## How to Use

1. **Install dependencies**
   ```sh
   npm install
   # or
   bun install
   ```
2. **Run the dashboard**
   ```sh
   npm run dev
   # or
   bun run dev
   ```
3. **Access the dashboard**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Add your ARK: Ascended servers**
   Use the "Add Server" button and fill out the required fields. Edit server settings and mods from each server's dashboard.

## Installer

- **Windows**: Run `install/setup.bat` as administrator.
- **Linux**: Run `install/setup.sh` (ensure it is executable: `chmod +x install/setup.sh`).
- **Caddyfile**: Provided for reverse proxy/SSL setup (see `install/Caddyfile`).

## Contributing Mod Configs

Want to help improve the dashboard? Submit custom mod config options for `Game.ini` and `GameUserSettings.ini`! These will be reviewed and integrated into the UI for easier access by all users.

**Submit your mod config options here:**
[Submit Mod Configs (Google Form)](https://docs.google.com/forms/u/0/d/14ddcHJooHtuw0cX4i51UIu07dCXgANk6wDSmOQU8JDc/edit?pli=1)

---

## Project Structure

- `components/` — UI components (dashboard, mod manager, config editors, etc.)
- `pages/` — Next.js pages and API routes
- `lib/` — Core logic, API clients, utilities
- `hooks/` — Custom React hooks
- `styles/` — Global and theme CSS
- `install/` — Installer scripts and Caddyfile
- `prisma/` — Database schema and data

## License
MIT