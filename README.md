# Saints-Ascended 

A cyberpunk-themed ARK: Survival Ascended server management dashboard with advanced mod management capabilities.

## Features

- **Server Management**: Create, configure, and monitor multiple ARK servers
- **Mod Manager**: Browse, search, and install mods from CurseForge with real-time caching
- **Real-time Console**: Monitor server activities and errors with an integrated terminal
- **Cyberpunk Theme**: Futuristic UI with glitch effects and terminal aesthetics
- **Cache Optimization**: Multi-tier caching system for optimal performance

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Prisma ORM with SQLite (dev) / PostgreSQL (prod)
- **APIs**: CurseForge API integration with background fetching
- **Caching**: Multi-strategy cache warming and optimization

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- CurseForge API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/saints-ascended.git
   cd saints-ascended
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to access the dashboard.

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="file:./prisma/data/mods.db"

# CurseForge API
CURSEFORGE_API_KEY="your_api_key_here"

# Optional - Production
DIRECT_URL="your_direct_database_url"
SHADOW_DATABASE_URL="your_shadow_database_url"
NODE_ENV="production"
```

## Database Commands

```bash
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema changes
npm run db:migrate    # Create new migration
npm run db:deploy     # Deploy migrations (production)
npm run db:studio     # Open Prisma Studio
npm run db:reset      # Reset database
```

## Deployment

### Quick Deploy to Vercel

1. **Connect repository to Vercel**
2. **Set environment variables**:
   - `DATABASE_URL` (PostgreSQL recommended)
   - `CURSEFORGE_API_KEY`
   - `NODE_ENV=production`

3. **Build configuration is automatic** - the build script handles Prisma generation and migration deployment

### Other Platforms

See `prisma/deployment.md` for detailed deployment instructions for:
- Railway
- Netlify  
- Docker
- Self-hosted options

### Database Options

- **Development**: SQLite (current setup)
- **Production**: PostgreSQL (recommended) or MySQL
- **Schema**: Copy `prisma/schema.production.prisma` for PostgreSQL

## Features in Detail

### Mod Manager
- **Browse by Category**: Popular, QoL, Maps, RPG, and more
- **Search**: Real-time search with category filtering
- **Cache System**: Multi-tier caching for optimal performance
- **Background Fetching**: Automatic cache warming for popular categories

### Console System
- **Real-time Logs**: Monitor system activities and errors
- **Color-coded Messages**: Different message types with visual distinction
- **Minimize/Maximize**: Toggleable console window
- **Global Error Integration**: All system errors appear in console

### Server Management
- **Multiple Servers**: Manage multiple ARK server instances
- **Configuration**: Edit game settings and server parameters
- **Status Monitoring**: Real-time server status and performance

## Architecture

### Data Flow
```
CurseForge API → SQLite Database (via Prisma) → Memory Cache → Frontend
```

### Cache Strategy
- **Frontend**: 5-minute TTL with batching
- **Backend**: Category-based cache warming
- **Database**: Prisma ORM with BigInt serialization handling

### Performance Optimizations
- **Client-side caching** with automatic invalidation
- **Backend cache aggregation** for multiple categories
- **Cache warming service** that pre-populates popular categories
- **Optimized API endpoints** with batch processing

## Development

### Project Structure
```
├── components/          # React components
├── pages/              # Next.js pages and API routes
├── lib/                # Utilities and services
├── prisma/             # Database schema and migrations
├── types/              # TypeScript type definitions
└── styles/             # Global styles and themes
```

### Key Files
- `lib/mod-service-optimized.ts` - Advanced caching and optimization
- `lib/json-helpers.ts` - BigInt serialization helper
- `components/mods/ModManager.tsx` - Main mod management interface
- `components/ui/TerminalWindow.tsx` - Console system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- **Documentation**: See `prisma/deployment.md` for deployment help
- **Issues**: Create GitHub issues for bugs or feature requests
- **API**: CurseForge API documentation at https://docs.curseforge.com/