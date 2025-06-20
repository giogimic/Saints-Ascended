# Saints Ascended

Saints Ascended is a comprehensive server management tool designed specifically for ARK: Survival Ascended. It provides an intuitive interface for server administrators to manage their game servers, browse and install mods, and monitor server performance.

## Key Features

### 🎮 Server Management
- Create and configure multiple ARK server instances
- Real-time server monitoring and status tracking
- Easy server configuration management
- Start, stop, and restart servers with one click

### 📦 Mod Manager
- Browse thousands of mods from CurseForge
- Search mods by category (Quality of Life, Maps, RPG, etc.)
- One-click mod management
- Real-time mod updates and notifications

### 🎨 Modern Interface
- Responsive layout that works on desktop and mobile
- Intuitive navigation and user experience
- Real-time data updates

## Getting Started

### For Server Administrators

1. **Download and Install**
   - Clone or download the application
   - Install Node.js if you haven't already
   - Run `npm install` to install dependencies

2. **Configure Your Environment**
   - Run `node scripts/setup-env.js` to set up the environment
   - Get a CurseForge API key from [CurseForge Console](https://console.curseforge.com)
   - Set your API key in the app's Global Settings (gear icon in the interface)
   - No `.env` files needed - everything is managed through the app interface!

3. **Start the Application**
   - Run `npm run dev` to start the development server
   - Open your browser to `http://localhost:3000`
   - Configure your CurseForge API key in Global Settings
   - Begin managing your ARK servers!

### Server Deployment

For production server deployment, use one of these methods:

#### **Option 1: Automated Deployment (Recommended)**
```bash
# On Linux/Mac
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# On Windows
scripts\deploy.bat
```

#### **Option 2: Manual Deployment**
```bash
# 1. Set environment variables
export DATABASE_URL="file:./prisma/data/mods.db"

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Build the application
npm run build

# 5. Set up database
npx prisma db push

# 6. Start the application
npm start
```

#### **Option 3: Using Bun (Faster)**
```bash
# 1. Set environment variables
set DATABASE_URL=file:./prisma/data/mods.db

# 2. Install dependencies
bun install

# 3. Generate Prisma client
bun prisma generate

# 4. Build the application
bun run build

# 5. Set up database
bun prisma db push

# 6. Start the application
bun start
```

### Configuration

#### **CurseForge API Key Setup**
1. Visit [CurseForge Console](https://console.curseforge.com)
2. Create an account or log in
3. Navigate to API Keys section
4. Create a new API key for your application
5. Copy the API key (BCrypt hash format)
6. Open the Saints Ascended app
7. Go to Global Settings (gear icon)
8. Paste your API key and save

#### **Verification**
After setting up your API key, verify it works:
```bash
node scripts/verify-api-key.js
```

### For Players

Saints Ascended is primarily designed for server administrators, but players can also use it to:
- Browse available mods for ARK: Survival Ascended
- See what mods are popular or trending
- Discover new content for their favorite game

## Support

- **Documentation**: Check the project wiki for detailed guides
- **Issues**: Report bugs or request features through GitHub issues
- **Community**: Join our Discord server for help and discussions

## Contributing

We welcome contributions from the community! Whether you're a developer, designer, or just passionate about ARK: Survival Ascended, there are many ways to help:

- Report bugs and suggest features
- Contribute code improvements
- Help with documentation
- Share feedback and ideas

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the ARK: Survival Ascended community**