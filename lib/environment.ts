// lib/environment.ts
// Environment configuration for different deployment scenarios

export interface EnvironmentConfig {
  database: {
    url: string;
    type: 'sqlite' | 'postgresql';
  };
  isProduction: boolean;
  isDevelopment: boolean;
  dataDir: string;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Database configuration
  let databaseUrl = process.env.DATABASE_URL;
  let databaseType: 'sqlite' | 'postgresql' = 'sqlite';

  if (!databaseUrl) {
    if (isProduction) {
      // In production, we should use PostgreSQL
      databaseUrl = process.env.POSTGRES_URL || 'postgresql://localhost:5432/saints_ascended';
      databaseType = 'postgresql';
    } else {
      // In development, use SQLite
      databaseUrl = 'file:./prisma/dev.db';
      databaseType = 'sqlite';
    }
  } else {
    // Determine type from URL
    if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
      databaseType = 'postgresql';
    } else if (databaseUrl.startsWith('file:')) {
      databaseType = 'sqlite';
    }
  }

  // Data directory configuration
  let dataDir = process.env.DATA_DIR || 'data';
  
  if (isProduction) {
    // In production, use a more appropriate directory
    dataDir = process.env.DATA_DIR || '/var/lib/saints-ascended/data';
  }

  return {
    database: {
      url: databaseUrl,
      type: databaseType,
    },
    isProduction,
    isDevelopment,
    dataDir,
  };
}

export function validateEnvironment(): void {
  const config = getEnvironmentConfig();
  
  console.log('Environment Configuration:');
  console.log(`- Environment: ${config.isProduction ? 'Production' : 'Development'}`);
  console.log(`- Database Type: ${config.database.type}`);
  console.log(`- Data Directory: ${config.dataDir}`);
  
  if (config.isProduction) {
    // Validate production requirements
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      console.warn('⚠️  No DATABASE_URL or POSTGRES_URL set for production');
    }
    
    if (config.database.type === 'sqlite') {
      console.warn('⚠️  Using SQLite in production is not recommended for scalability');
    }
  }
  
  // Validate database URL format
  if (config.database.type === 'postgresql') {
    if (!config.database.url.includes('://')) {
      throw new Error('Invalid PostgreSQL URL format');
    }
  } else if (config.database.type === 'sqlite') {
    if (!config.database.url.startsWith('file:')) {
      throw new Error('Invalid SQLite URL format. Should start with "file:"');
    }
  }
}

// Export the configuration
export const env = getEnvironmentConfig(); 