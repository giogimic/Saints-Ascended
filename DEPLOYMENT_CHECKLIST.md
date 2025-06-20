# Saints Ascended - Deployment Checklist

## Pre-Deployment Checklist

- [ ] Node.js 18+ installed on target server
- [ ] Git installed (optional but recommended)
- [ ] Valid CurseForge API key obtained from https://console.curseforge.com/

## Deployment Steps

### Method 1: Automatic Setup (Recommended)

**Windows:**
- [ ] Copy project files to server
- [ ] Run `install\setup.bat` as administrator
- [ ] Follow prompts to configure CurseForge API key
- [ ] Verify installation with `npm run dev`

**Linux/macOS:**
- [ ] Copy project files to server
- [ ] Run `chmod +x install/setup.sh && ./install/setup.sh`
- [ ] Follow prompts to configure CurseForge API key
- [ ] Verify installation with `npm run dev`

### Method 2: Manual Deployment

- [ ] Copy project files to server
- [ ] Copy `.env` file from original installation (CRITICAL!)
- [ ] Run `npm install`
- [ ] Run database deployment: `npm run db:deploy`
- [ ] Test with `npm run dev`

### Method 3: Fresh Installation

- [ ] Clone repository: `git clone <repository-url>`
- [ ] Create `.env` file: `cp .env.example .env`
- [ ] Edit `.env` and add your CurseForge API key
- [ ] Run `npm install`
- [ ] Run `npm run db:generate`
- [ ] Run `npm run db:push`
- [ ] Test with `npm run dev`

## Environment Configuration

- [ ] `.env` file exists in project root
- [ ] `DATABASE_URL` is set correctly
- [ ] `CURSEFORGE_API_KEY` is set with actual API key (not placeholder)
- [ ] `NODE_ENV` is set appropriately

## Database Setup Verification

- [ ] Database file exists at `prisma/data/mods.db`
- [ ] Prisma client generated successfully
- [ ] Database schema is up to date

## Troubleshooting Commands

If deployment fails, try these in order:

```bash
# Check environment variables
cat .env  # Linux/macOS
type .env  # Windows

# Database deployment alternatives
npm run db:deploy
npm run db:push
.\deploy-db.bat     # Windows
./deploy-db.sh      # Linux/macOS/Git Bash
.\deploy-db.ps1     # PowerShell

# Verify Prisma client
npm run db:generate

# Clean install if needed
rm -rf node_modules package-lock.json  # Linux/macOS
rmdir /s node_modules & del package-lock.json  # Windows
npm install
```

## Production Considerations

- [ ] Consider using PostgreSQL instead of SQLite for production
- [ ] Set up reverse proxy (Nginx/Caddy) for SSL
- [ ] Configure firewall for port 3000 or custom port
- [ ] Set up process manager (PM2, systemd, etc.)
- [ ] Configure automatic startup on server boot
- [ ] Set up regular database backups
- [ ] Monitor application logs

## Post-Deployment Verification

- [ ] Dashboard accessible at http://localhost:3000
- [ ] Can add/edit servers without errors
- [ ] Mod search functionality works (requires CurseForge API key)
- [ ] Configuration editors load properly
- [ ] No console errors in browser

## Common Issues and Solutions

**"CURSEFORGE_API_KEY not configured":**
- Check `.env` file exists and contains actual API key
- Verify no extra spaces or quotes around the key

**"Environment variable not found: DATABASE_URL":**
- Run appropriate deployment script for your OS
- Check `.env` file has correct DATABASE_URL

**Database errors:**
- Delete `prisma/migrations` and run `npm run db:push`
- Use manual deployment scripts as fallback

**Permission errors (Linux/macOS):**
```bash
chmod +x install/setup.sh
chmod +x deploy-db.sh
```

## Support

If issues persist:
1. Check the SETUP.md file for detailed instructions
2. Review console output for specific error messages
3. Verify all prerequisites are installed
4. Consider running the automatic setup scripts
