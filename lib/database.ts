// lib/database.ts
// Database configuration and connection management for both development and production

import { PrismaClient } from '@prisma/client';
import { env, validateEnvironment } from './environment';

// Validate environment on module load
validateEnvironment();

// Database connection configuration
const createPrismaClient = (): PrismaClient => {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: env.database.url,
      },
    },
    log: env.isDevelopment ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });

  // Handle connection errors gracefully
  client.$connect()
    .then(async () => {
      console.log(`✅ Database connected successfully (${env.database.type})`);
      
      // Apply SQLite performance optimizations
      if (env.database.type === 'sqlite') {
        try {
          // Apply PRAGMA settings using $queryRaw with template literals
          
          // Enable WAL mode for better concurrency
          await client.$queryRaw`PRAGMA journal_mode = WAL`;
          // Increase cache size for better performance  
          await client.$queryRaw`PRAGMA cache_size = 10000`;
          // Reduce sync overhead
          await client.$queryRaw`PRAGMA synchronous = NORMAL`;
          // Enable memory-mapped I/O
          await client.$queryRaw`PRAGMA mmap_size = 268435456`;
          // Optimize for faster queries
          await client.$queryRaw`PRAGMA temp_store = MEMORY`;
          
          console.log('✅ SQLite performance optimizations applied');
        } catch (pragmaError) {
          console.warn('⚠️  Failed to apply SQLite optimizations:', pragmaError);
        }
      }
    })
    .catch((error: Error) => {
      console.error('❌ Database connection failed:', error);
      
      if (env.isProduction) {
        console.error('Critical: Database connection failed in production');
        console.error('Please check your DATABASE_URL environment variable');
        console.error('For SQLite: DATABASE_URL=file:/path/to/database.db');
        console.error('For PostgreSQL: DATABASE_URL=postgresql://user:pass@host:port/db');
        process.exit(1);
      } else {
        console.warn('⚠️  Database connection failed in development - some features may not work');
      }
    });

  return client;
};

// Export a singleton instance
export const prisma = createPrismaClient();

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Handle process termination
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Database health check function
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; error?: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { healthy: true };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { 
      healthy: false, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    };
  }
}

// Initialize database with proper error handling
export async function initializeDatabase(): Promise<void> {
  try {
    // Check if we can connect to the database
    const health = await checkDatabaseHealth();
    if (!health.healthy) {
      throw new Error(`Database health check failed: ${health.error}`);
    }

    // Run any necessary migrations or setup
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    
    if (env.isDevelopment && env.database.type === 'sqlite') {
      console.log('Attempting to create SQLite database file...');
      try {
        // Use $queryRaw for PRAGMA statements with template literals
        await prisma.$queryRaw`PRAGMA journal_mode = WAL`;
        console.log('✅ SQLite database created successfully');
      } catch (createError) {
        console.error('Failed to create SQLite database:', createError);
        throw error;
      }
    } else {
      throw error;
    }
  }
}

// Export the client for use in other modules
export default prisma; 