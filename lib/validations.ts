import { z } from 'zod';

// Base validation schemas
export const serverConfigSchema = z.object({
  name: z.string()
    .min(1, 'Server name is required')
    .max(100, 'Server name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Server name contains invalid characters'),
  
  executablePath: z.string()
    .min(1, 'Executable path is required')
    .refine((path) => path.endsWith('.exe') || path.endsWith('ShooterGameServer'), {
      message: 'Must be a valid server executable'
    }),
  
  configDirectory: z.string()
    .min(1, 'Config directory is required'),
  
  serverDirectory: z.string()
    .min(1, 'Server directory is required'),
  
  map: z.string()
    .min(1, 'Map selection is required'),
  
  port: z.number()
    .min(1024, 'Port must be at least 1024')
    .max(65535, 'Port must be less than 65536')
    .default(7777),
  
  queryPort: z.number()
    .min(1024, 'Query port must be at least 1024')
    .max(65535, 'Query port must be less than 65536')
    .default(27015),
  
  rconPort: z.number()
    .min(1024, 'RCON port must be at least 1024')
    .max(65535, 'RCON port must be less than 65536')
    .default(32330),
  
  rconPassword: z.string()
    .min(8, 'RCON password must be at least 8 characters')
    .max(128, 'RCON password must be less than 128 characters'),
  
  adminPassword: z.string()
    .min(8, 'Admin password must be at least 8 characters')
    .max(128, 'Admin password must be less than 128 characters'),
  
  serverPassword: z.string()
    .max(128, 'Server password must be less than 128 characters')
    .optional(),
  
  maxPlayers: z.number()
    .min(1, 'Max players must be at least 1')
    .max(200, 'Max players cannot exceed 200')
    .default(70),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

export const createServerSchema = serverConfigSchema;

export const updateServerSchema = serverConfigSchema.partial().extend({
  id: z.string().uuid('Invalid server ID'),
});

// GameUserSettings.ini validation
export const gameUserSettingsSchema = z.object({
  // Basic Settings
  ServerName: z.string().max(100).optional(),
  ServerPassword: z.string().max(128).optional(),
  ServerAdminPassword: z.string().min(8).max(128).optional(),
  MaxPlayers: z.number().min(1).max(200).optional(),
  
  // Gameplay Settings
  DifficultyOffset: z.number().min(0).max(1).optional(),
  ServerPVE: z.boolean().optional(),
  ServerCrosshair: z.boolean().optional(),
  ServerForceNoHUD: z.boolean().optional(),
  GlobalVoiceChat: z.boolean().optional(),
  ProximityChat: z.boolean().optional(),
  
  // Advanced Settings
  ShowMapPlayerLocation: z.boolean().optional(),
  NoTributeDownloads: z.boolean().optional(),
  AllowThirdPersonPlayer: z.boolean().optional(),
  AlwaysNotifyPlayerLeft: z.boolean().optional(),
  DontAlwaysNotifyPlayerJoined: z.boolean().optional(),
  
  // Rates and Multipliers
  XPMultiplier: z.number().min(0.1).max(100).optional(),
  TamingSpeedMultiplier: z.number().min(0.1).max(100).optional(),
  HarvestAmountMultiplier: z.number().min(0.1).max(100).optional(),
  ResourcesRespawnPeriodMultiplier: z.number().min(0.1).max(10).optional(),
  
  // PvP Settings
  EnablePVPGamma: z.boolean().optional(),
  DisableFriendlyFire: z.boolean().optional(),
  
  // Tribe Settings
  MaxTribeSize: z.number().min(1).max(500).optional(),
}).passthrough(); // Allow additional properties

// Game.ini validation
export const gameIniSettingsSchema = z.record(
  z.string(),
  z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
).optional();

// Mod validation
export const modInfoSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  version: z.string().optional(),
  workshopId: z.string().regex(/^\d+$/, 'Invalid Workshop ID').optional(),
  enabled: z.boolean().default(true),
  loadOrder: z.number().min(0).max(1000).default(0),
  dependencies: z.array(z.string()).optional(),
  incompatibilities: z.array(z.string()).optional(),
  size: z.number().min(0).optional(),
  lastUpdated: z.date().optional(),
});

export const addModSchema = z.object({
  workshopId: z.string()
    .regex(/^\d+$/, 'Workshop ID must be numeric')
    .min(1, 'Workshop ID is required'),
  serverId: z.string().uuid('Invalid server ID'),
});

// Backup validation
export const createBackupSchema = z.object({
  serverId: z.string().uuid('Invalid server ID'),
  name: z.string()
    .min(1, 'Backup name is required')
    .max(100, 'Backup name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Backup name contains invalid characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

// Launch options validation
export const launchOptionsSchema = z.object({
  // Network
  Port: z.number().min(1024).max(65535).optional(),
  QueryPort: z.number().min(1024).max(65535).optional(),
  RCONPort: z.number().min(1024).max(65535).optional(),
  
  // Performance
  UseBattlEye: z.boolean().optional(),
  ForceAllowCaveFlyers: z.boolean().optional(),
  PreventDownloadSurvivors: z.boolean().optional(),
  PreventDownloadItems: z.boolean().optional(),
  PreventDownloadDinos: z.boolean().optional(),
  PreventUploadSurvivors: z.boolean().optional(),
  PreventUploadItems: z.boolean().optional(),
  PreventUploadDinos: z.boolean().optional(),
  
  // Logging
  ServerLog: z.boolean().optional(),
  NoBattlEye: z.boolean().optional(),
  
  // Custom parameters
  customParams: z.array(z.string()).optional(),
});

// Map validation
export const mapInfoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().optional(),
  officialMap: z.boolean().default(false),
  dlcRequired: z.array(z.string()).optional(),
  workshopId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  maxPlayers: z.number().min(1).max(200).optional(),
  recommendedPlayers: z.number().min(1).max(200).optional(),
});

// API validation schemas
export const serverActionSchema = z.object({
  action: z.enum(['start', 'stop', 'restart', 'update', 'backup', 'delete']),
  serverId: z.string().uuid('Invalid server ID'),
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

// Log entry validation
export const logEntrySchema = z.object({
  id: z.string().uuid(),
  serverId: z.string().uuid(),
  timestamp: z.date(),
  level: z.enum(['info', 'warning', 'error', 'debug']),
  message: z.string().min(1),
  source: z.string().optional(),
  data: z.any().optional(),
});

// WebSocket message validation
export const webSocketMessageSchema = z.object({
  type: z.enum(['server_status', 'server_stats', 'log_entry', 'backup_complete', 'update_progress']),
  serverId: z.string().uuid().optional(),
  data: z.any(),
  timestamp: z.date(),
});

// File path validation helpers
export const validateExecutablePath = (path: string): boolean => {
  return path.endsWith('.exe') || path.includes('ShooterGameServer');
};

export const validateDirectoryPath = (path: string): boolean => {
  // Basic path validation - could be enhanced with actual filesystem checks
  return path.length > 0 && !path.includes('..') && !path.includes('<') && !path.includes('>');
};

// Port validation helpers
export const validatePortAvailability = (port: number, existingPorts: number[] = []): boolean => {
  return port >= 1024 && port <= 65535 && !existingPorts.includes(port);
};

export const validatePortRange = (mainPort: number, queryPort: number, rconPort: number): boolean => {
  const ports = [mainPort, queryPort, rconPort];
  return new Set(ports).size === ports.length; // All ports must be unique
};

// Form validation helpers
export type CreateServerFormData = z.infer<typeof createServerSchema>;
export type UpdateServerFormData = z.infer<typeof updateServerSchema>;
export type GameUserSettingsFormData = z.infer<typeof gameUserSettingsSchema>;
export type ModInfoFormData = z.infer<typeof modInfoSchema>;
export type CreateBackupFormData = z.infer<typeof createBackupSchema>;
export type LaunchOptionsFormData = z.infer<typeof launchOptionsSchema>;
export type ServerActionFormData = z.infer<typeof serverActionSchema>;

// Validation result types
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

// Validation utility function
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _root: ['Unknown validation error'] } };
  }
} 