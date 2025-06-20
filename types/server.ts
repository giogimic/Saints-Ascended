export interface ServerConfig {
  id: string;
  name: string;
  executablePath: string;
  configDirectory: string;
  serverDirectory: string; // Main server installation directory
  map: string;
  port: number;
  queryPort: number;
  rconPort: number;
  rconPassword: string;
  adminPassword: string;
  serverPassword?: string;
  maxPlayers: number;
  tribeLimit: number;
  description?: string;
  motd?: string;
  // Launch options configuration
  launchOptions?: LaunchOptionsConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServerStatus {
  id: string;
  status: "online" | "offline" | "starting" | "stopping" | "error";
  players: {
    current: number;
    max: number;
  };
  uptime?: number;
  version?: string;
  lastSeen?: Date;
  errorMessage?: string;
}

export interface ServerStats {
  id: string;
  cpuUsage: number;
  memoryUsage: number;
  networkIn: number;
  networkOut: number;
  diskUsage: number;
  timestamp: Date;
}

export interface GameUserSettings {
  // Basic Settings
  ServerName?: string;
  ServerPassword?: string;
  ServerAdminPassword?: string;
  MaxPlayers?: number;

  // Gameplay Settings
  DifficultyOffset?: number;
  ServerPVE?: boolean;
  ServerCrosshair?: boolean;
  ServerForceNoHUD?: boolean;
  GlobalVoiceChat?: boolean;
  ProximityChat?: boolean;

  // Advanced Settings
  ShowMapPlayerLocation?: boolean;
  NoTributeDownloads?: boolean;
  AllowThirdPersonPlayer?: boolean;
  AlwaysNotifyPlayerLeft?: boolean;
  DontAlwaysNotifyPlayerJoined?: boolean;

  // Rates and Multipliers
  XPMultiplier?: number;
  TamingSpeedMultiplier?: number;
  HarvestAmountMultiplier?: number;
  ResourcesRespawnPeriodMultiplier?: number;

  // PvP Settings
  EnablePVPGamma?: boolean;
  DisableFriendlyFire?: boolean;

  // Tribe Settings
  MaxTribeSize?: number;

  // Custom settings object for additional INI values
  [key: string]: string | number | boolean | undefined;
}

export interface GameIniSettings {
  // Engine Settings
  "Engine.GameSession": {
    MaxPlayers?: number;
  };

  // Game Mode Settings
  "/Game/PrimalEarth/GameModes/GameMode_Genesis": any;

  // Custom settings for mods and advanced configuration
  [section: string]:
    | {
        [key: string]: string | number | boolean | undefined;
      }
    | undefined;
}

export interface ModInfo {
  id: string;
  name: string;
  description?: string;
  version?: string;
  workshopId?: string;
  curseForgeId?: string;
  enabled: boolean;
  loadOrder: number;
  dependencies?: string[];
  incompatibilities?: string[];
  size?: number;
  lastUpdated?: Date;
  // Additional fields from local storage
  summary?: string;
  author?: string;
  downloadCount?: number;
  thumbsUpCount?: number;
  logoUrl?: string;
  websiteUrl?: string;
  category?: string;
  tags?: string[];
  installedAt?: Date;
}

export interface BackupInfo {
  id: string;
  serverId: string;
  name: string;
  path: string;
  size: number;
  createdAt: Date;
  type: "manual" | "automatic" | "scheduled";
  description?: string;
}

export interface LogEntry {
  id: string;
  serverId: string;
  timestamp: Date;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  source?: string;
  data?: any;
}

export interface ServerLaunchOptions {
  // Network
  Port?: number;
  QueryPort?: number;
  RCONPort?: number;

  // Performance
  UseBattlEye?: boolean;
  ForceAllowCaveFlyers?: boolean;
  PreventDownloadSurvivors?: boolean;
  PreventDownloadItems?: boolean;
  PreventDownloadDinos?: boolean;
  PreventUploadSurvivors?: boolean;
  PreventUploadItems?: boolean;
  PreventUploadDinos?: boolean;

  // Logging
  ServerLog?: boolean;
  NoBattlEye?: boolean;

  // Custom launch parameters
  customParams?: string[];
}

export interface MapInfo {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  officialMap: boolean;
  dlcRequired?: string[];
  workshopId?: string;
  imageUrl?: string;
  maxPlayers?: number;
  recommendedPlayers?: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface CreateServerFormData {
  name: string;
  executablePath: string;
  configDirectory: string;
  serverDirectory: string; // Main server installation directory
  map: string;
  port: number;
  queryPort: number;
  rconPort: number;
  rconPassword: string;
  adminPassword: string;
  serverPassword?: string;
  maxPlayers: number;
  description?: string;
}

export interface UpdateServerFormData extends Partial<CreateServerFormData> {
  id: string;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type:
    | "server_status"
    | "server_stats"
    | "log_entry"
    | "backup_complete"
    | "update_progress";
  serverId?: string;
  data: any;
  timestamp: Date;
}

// Utility Types
export type ServerAction =
  | "start"
  | "stop"
  | "restart"
  | "update"
  | "backup"
  | "delete";

export interface ServerActionResult {
  success: boolean;
  message: string;
  error?: string;
  data?: any;
}

// Launch options configuration interface
export interface LaunchOptionsConfig {
  // Performance options
  USEALLAVAILABLECORES: boolean;
  lowmemory: boolean;
  nomanssky: boolean;

  // System options
  NoCrashDialog: boolean;
  NoHangDetection: boolean;
  preventhibernation: boolean;

  // Mod options
  disablemodchecks: boolean;
  automanagedmods: boolean;

  // Server options
  ForceRespawnDinos: boolean;
  crossplay: boolean;
  StasisKeepControllers: boolean;
  UseDynamicConfig: boolean;

  // Anti-cheat options
  NoBattlEye: boolean;
  UseBattlEye: boolean;

  // Cluster options
  clusterID: string;
  clusterDirOverride: string;
  clusterEnabled: boolean;

  // Mod list (managed separately but included for launch)
  mods: string[];
}
