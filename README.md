# Saints Ascended

> Modern Ark: Survival Ascended Server Management Interface

A sleek, modern web application for managing Ark: Survival Ascended dedicated servers. Built with Next.js, Tailwind CSS, and DaisyUI.

## 🚀 Quick Installation

We provide automated installation scripts in the `install` directory for easy setup. For production deployments, we recommend using Caddy as a reverse proxy (sample configuration included).

```bash
# Clone and run the setup script
git clone <repository-url>
cd saints-ascended

# Windows users (Command Prompt/PowerShell)
.\install\setup.bat

# Git Bash/WSL users
./install/setup.sh
```

See [SETUP.md](SETUP.md) for detailed installation instructions and production deployment guide.

## 🚀 Features

### ✅ Current Features

- **Server Management**: 
  - Server configuration creation and editing
  - Advanced INI file management for Game.ini and GameUserSettings.ini
  - Mod management and configuration
  - Server status monitoring

- **Mod Integration**:
  - CurseForge mod search and discovery
  - Real-time mod information from official API
  - Automatic mod ID management for launch parameters
  - Mod load order configuration
  - Duplicate prevention and validation

- **Modern UI/UX**:
  - Responsive design with DaisyUI components
  - Fixed "tromper" theme with dark base and neon green accents
  - Consistent styling using oklch color space
  - Proper CSS variable fallbacks

- **Technical Foundation**:
  - Next.js 15 with TypeScript
  - REST API with comprehensive validation
  - Real-time server configuration updates
  - Mod integration support

### 🚧 In Development

- **Server Process Management**: Direct control of server processes
- **Advanced Mod Tools**: Performance monitoring and optimization
- **Multi-Server Support**: Cluster management capabilities
- **Backup System**: Server state preservation

## 📂 Project Structure

```
Saints Ascended/
├── components/           # React components
│   ├── cluster/         # Cluster management
│   ├── config/          # Configuration editors
│   ├── mods/           # Mod management
│   └── servers/         # Server components
├── pages/               # Next.js pages and API
│   ├── api/            # REST endpoints
│   └── servers/        # Server management UI
├── lib/                # Core utilities
└── styles/             # Styling system
```

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd saints-ascended
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the interface**
   Navigate to `http://localhost:3000`

## 📖 Usage

### Server Management

1. **Adding a Server**
   - Navigate to the server management interface
   - Configure basic server settings
   - Set up network ports and access controls
   - Configure mod lists and settings

2. **Server Configuration**
   - Edit Game.ini and GameUserSettings.ini through the UI
   - Manage mod configurations
   - Apply server settings in real-time

3. **Mod Management**
   - Add and remove mods
   - Configure mod-specific settings
   - Monitor mod performance

### Configuration System

The application provides a comprehensive interface for managing:
- Server initialization parameters
- Game configuration files
- Mod configurations and load orders
- Network and security settings

## 🎨 Theme System

Built with Tailwind CSS and DaisyUI v5:

- **Theme Implementation**:
  - Fixed "tromper" theme implementation
  - Standardized oklch() color space
  - Comprehensive CSS variable fallbacks
- **Visual Elements**:
  - Futuristic geometric patterns
  - Subtle text glow effects
  - Unified typography system

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### API Endpoints

```typescript
GET    /api/servers           # List servers
POST   /api/servers           # Create server
GET    /api/servers/[id]      # Server details
GET    /api/servers/[id]/config # Server configuration
```

## 📋 Configuration Reference

The application supports comprehensive server configuration through:
- GameUserSettings.ini management
- Game.ini customization
- Mod configuration integration
- Launch parameter management

## 🎯 Roadmap

### Near Term
- [ ] Process management integration
- [ ] Enhanced mod performance metrics
- [ ] Backup system implementation

### Future Plans
- [ ] Multi-cluster orchestration
- [ ] Advanced performance monitoring
- [ ] Automated update management

---

Built for the Saints Gaming Community