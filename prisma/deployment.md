# Prisma Deployment Guide

## Overview
This guide covers deploying the Saints-Ascended application with Prisma across different platforms.

## Database Options

### Local Development (SQLite)
```bash
DATABASE_URL="file:./prisma/data/mods.db"
```

### Production Options

#### 1. PostgreSQL (Recommended for production)
```bash
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database" # For connection pooling
SHADOW_DATABASE_URL="postgresql://user:password@host:port/shadow_database" # For migrations
```

#### 2. MySQL
```bash
DATABASE_URL="mysql://user:password@host:port/database"
```

#### 3. SQLite (Simple deployment)
```bash
DATABASE_URL="file:./data/mods.db"
```

## Platform-Specific Deployment

### Vercel
1. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `DIRECT_URL` (if using connection pooling)
   - `CURSEFORGE_API_KEY`

2. Add to your `package.json` build script:
   ```json
   "build": "prisma generate && prisma migrate deploy && next build"
   ```

3. For Vercel with Neon/PlanetScale:
   ```bash
   # Update prisma/schema.prisma
   datasource db {
     provider = "postgresql"  // or "mysql"
     url = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```

### Railway
1. Add a PostgreSQL database service
2. Set `DATABASE_URL` in environment variables
3. Railway will run migrations automatically with the build script

### Netlify
1. Add database provider (Supabase, PlanetScale, etc.)
2. Set environment variables in Netlify dashboard
3. Ensure build command includes Prisma generation

### Docker Deployment
```dockerfile
# Add to your Dockerfile
RUN npx prisma generate
RUN npx prisma migrate deploy
```

## Migration Commands

### Development
```bash
npm run db:migrate        # Create and apply new migration
npm run db:push           # Push schema changes without migration
npm run db:generate       # Generate Prisma client
```

### Production
```bash
npm run db:deploy         # Apply migrations to production
```

## Environment Setup

### Required Environment Variables
```env
DATABASE_URL=your_database_url
CURSEFORGE_API_KEY=your_api_key
NODE_ENV=production
```

### Optional Environment Variables
```env
DIRECT_URL=your_direct_connection_url
SHADOW_DATABASE_URL=your_shadow_database_url
NEXT_TELEMETRY_DISABLED=1
```

## Common Issues and Solutions

### Issue: BigInt Serialization
**Problem**: `TypeError: Do not know how to serialize a BigInt`
**Solution**: Already handled with `convertBigIntsToStrings()` helper in `lib/json-helpers.ts`

### Issue: Connection Pooling
**Problem**: Too many database connections
**Solution**: Use `DIRECT_URL` for connection pooling with providers like PlanetScale

### Issue: Migration Failures
**Problem**: Migrations fail on deployment
**Solution**: Ensure `prisma migrate deploy` runs before `next build`

### Issue: Client Generation
**Problem**: Prisma client not generated
**Solution**: Add `prisma generate` to postinstall script

## Best Practices

1. **Always run migrations in deployment**
   ```json
   "build": "prisma generate && prisma migrate deploy && next build"
   ```

2. **Use environment-specific database URLs**
   - Development: SQLite for simplicity
   - Production: PostgreSQL/MySQL for performance

3. **Backup before migrations**
   - Set up automated backups
   - Test migrations on staging first

4. **Monitor database performance**
   - Use connection pooling
   - Monitor query performance
   - Set up alerts for errors

## Platform Recommendations

- **Vercel + Neon**: Best for serverless deployments
- **Railway + PostgreSQL**: Great for full-stack apps
- **Netlify + Supabase**: Good for JAMstack approach
- **Docker + PostgreSQL**: Best for self-hosted solutions 