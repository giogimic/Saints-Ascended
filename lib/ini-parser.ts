import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface INISection {
  name: string;
  settings: INISetting[];
}

export interface INISetting {
  key: string;
  value: string | number | boolean;
  comment?: string;
  description?: string;
  category?: string;
  type?: 'string' | 'number' | 'boolean' | 'array';
}

export interface ParsedINI {
  sections: INISection[];
  metadata: {
    version?: string;
    lastUpdated?: Date;
    source?: string;
  };
}

/**
 * Parse GameUserSettings.ini documentation
 */
export function parseGameUserSettingsDoc(): ParsedINI {
  const docPath = join(process.cwd(), 'docs', 'gameusersettings-ini.md');
  
  if (!existsSync(docPath)) {
    generateGameUserSettingsDoc();
  }
  
  try {
    const content = readFileSync(docPath, 'utf-8');
    return parseINIContent(content, 'GameUserSettings');
  } catch (error) {
    console.error('Failed to parse GameUserSettings doc:', error);
    return generateDefaultGameUserSettings();
  }
}

/**
 * Parse Game.ini documentation
 */
export function parseGameINIDoc(): ParsedINI {
  const docPath = join(process.cwd(), 'docs', 'game-ini.md');
  
  if (!existsSync(docPath)) {
    generateGameINIDoc();
  }
  
  try {
    const content = readFileSync(docPath, 'utf-8');
    return parseINIContent(content, 'Game');
  } catch (error) {
    console.error('Failed to parse Game.ini doc:', error);
    return generateDefaultGameINI();
  }
}

/**
 * Parse INI content from documentation
 */
function parseINIContent(content: string, type: string): ParsedINI {
  const lines = content.split('\n');
  const sections: INISection[] = [];
  let currentSection: INISection | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Section header
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      
      currentSection = {
        name: trimmed.slice(1, -1),
        settings: []
      };
      continue;
    }
    
    // Setting line
    if (currentSection && trimmed.includes('=') && !trimmed.startsWith(';') && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      
      const setting: INISetting = {
        key: key.trim(),
        value: parseValue(value),
        type: inferType(value)
      };
      
      currentSection.settings.push(setting);
    }
  }
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return {
    sections,
    metadata: {
      source: type,
      lastUpdated: new Date()
    }
  };
}

/**
 * Parse value to appropriate type
 */
function parseValue(value: string): string | number | boolean {
  const trimmed = value.trim();
  
  // Boolean values
  if (trimmed.toLowerCase() === 'true') return true;
  if (trimmed.toLowerCase() === 'false') return false;
  
  // Number values
  if (/^\d+\.?\d*$/.test(trimmed)) {
    return trimmed.includes('.') ? parseFloat(trimmed) : parseInt(trimmed);
  }
  
  // Remove quotes if present
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  
  return trimmed;
}

/**
 * Infer value type
 */
function inferType(value: string): 'string' | 'number' | 'boolean' | 'array' {
  const trimmed = value.trim();
  
  if (trimmed.toLowerCase() === 'true' || trimmed.toLowerCase() === 'false') {
    return 'boolean';
  }
  
  if (/^\d+\.?\d*$/.test(trimmed)) {
    return 'number';
  }
  
  if (trimmed.includes(',') && !trimmed.includes('=')) {
    return 'array';
  }
  
  return 'string';
}

/**
 * Generate default GameUserSettings.ini documentation
 */
function generateGameUserSettingsDoc(): void {
  const defaultContent = `# GameUserSettings.ini Configuration Reference

;METADATA=(Diff=true, UseCommands=true)

[ServerSettings]
# Basic Server Configuration
DifficultyOffset=1.0
DinoCountMultiplier=1.0
MaxPlayers=70
ServerPassword=
ServerAdminPassword=admin123
SpectatorPassword=

# Network Configuration
Port=7777
QueryPort=27015
RCONPort=27020
RCONEnabled=True

# Gameplay Settings
ServerPVE=True
ServerHardcore=False
AllowThirdPersonPlayer=True
ShowMapPlayerLocation=True
ServerCrosshair=True
ServerForceNoHUD=False

# Auto-save Configuration
AutoSavePeriodMinutes=15.0

# Player Limits
MaxTamedDinos=5000
MaxTamedDinos_SoftTameLimit=4000
MaxTamedDinos_SoftTameLimit_CountdownForDeletionDuration=604800

# Structure Settings
TheMaxStructuresInRange=10500
AlwaysAllowStructurePickup=False
StructurePickupTimeAfterPlacement=30.0
StructurePickupHoldDuration=0.5

# Quality of Life
AllowFlyerCarryPvE=False
AllowCaveBuildingPvE=False
GlobalVoiceChat=False
ProximityChat=False

# Transfer Settings
NoTributeDownloads=True
PreventDownloadSurvivors=False
PreventDownloadItems=False
PreventDownloadDinos=False

# PvP Settings
PreventOfflinePvP=False
PreventOfflinePvPInterval=900

[SessionSettings]
SessionName=My Ark Server

[/Script/Engine.GameSession]
MaxPlayers=70`;

  const docPath = join(process.cwd(), 'docs', 'gameusersettings-ini.md');
  writeFileSync(docPath, defaultContent);
}

/**
 * Generate default Game.ini documentation
 */
function generateGameINIDoc(): void {
  const defaultContent = `# Game.ini Configuration Reference

[/Script/ShooterGame.ShooterGameMode]
# Experience Multipliers
GenericXPMultiplier=1.0
HarvestXPMultiplier=1.0
CraftXPMultiplier=1.0
KillXPMultiplier=1.0
SpecialXPMultiplier=1.0

# Resource & Crafting
CustomRecipeEffectivenessMultiplier=1.0
CustomRecipeSkillMultiplier=1.0
FuelConsumptionIntervalMultiplier=1.0
CropGrowthSpeedMultiplier=1.0
CropDecaySpeedMultiplier=1.0

# Corpse & Item Settings
GlobalCorpseDecompositionTimeMultiplier=1.0
GlobalItemDecompositionTimeMultiplier=1.0
GlobalSpoilingTimeMultiplier=1.0

# Breeding System
MatingIntervalMultiplier=1.0
EggHatchSpeedMultiplier=1.0
BabyMatureSpeedMultiplier=1.0
BabyFoodConsumptionSpeedMultiplier=1.0
BabyCuddleIntervalMultiplier=1.0
BabyCuddleGracePeriodMultiplier=1.0
BabyCuddleLoseImprintQualitySpeedMultiplier=1.0
BabyImprintingStatScaleMultiplier=1.0

# Dino Settings
LayEggIntervalMultiplier=1.0
PoopIntervalMultiplier=1.0
DinoHarvestingDamageMultiplier=1.0
DinoTurretDamageMultiplier=1.0

# Player Stats Multipliers (per level)
# 0=Health, 1=Stamina, 2=Oxygen, 3=Food, 4=Water, 5=Temperature, 6=Weight, 7=Melee, 8=Speed, 9=Fortitude, 10=Crafting
PerLevelStatsMultiplier_Player[0]=1.0
PerLevelStatsMultiplier_Player[1]=1.0
PerLevelStatsMultiplier_Player[2]=1.0
PerLevelStatsMultiplier_Player[3]=1.0
PerLevelStatsMultiplier_Player[4]=1.0
PerLevelStatsMultiplier_Player[5]=1.0
PerLevelStatsMultiplier_Player[6]=1.0
PerLevelStatsMultiplier_Player[7]=1.0
PerLevelStatsMultiplier_Player[8]=1.0
PerLevelStatsMultiplier_Player[9]=1.0
PerLevelStatsMultiplier_Player[10]=1.0

# Wild Dino Stats Multipliers (per level)
PerLevelStatsMultiplier_DinoWild[0]=1.0
PerLevelStatsMultiplier_DinoWild[1]=1.0
PerLevelStatsMultiplier_DinoWild[2]=1.0
PerLevelStatsMultiplier_DinoWild[3]=1.0
PerLevelStatsMultiplier_DinoWild[4]=1.0
PerLevelStatsMultiplier_DinoWild[5]=1.0
PerLevelStatsMultiplier_DinoWild[6]=1.0
PerLevelStatsMultiplier_DinoWild[7]=1.0
PerLevelStatsMultiplier_DinoWild[8]=1.0
PerLevelStatsMultiplier_DinoWild[9]=1.0
PerLevelStatsMultiplier_DinoWild[10]=1.0

# Tamed Dino Stats Multipliers (per level)
PerLevelStatsMultiplier_DinoTamed[0]=0.2
PerLevelStatsMultiplier_DinoTamed[1]=1.0
PerLevelStatsMultiplier_DinoTamed[2]=1.0
PerLevelStatsMultiplier_DinoTamed[3]=1.0
PerLevelStatsMultiplier_DinoTamed[4]=1.0
PerLevelStatsMultiplier_DinoTamed[5]=1.0
PerLevelStatsMultiplier_DinoTamed[6]=1.0
PerLevelStatsMultiplier_DinoTamed[7]=1.0
PerLevelStatsMultiplier_DinoTamed[8]=0.174
PerLevelStatsMultiplier_DinoTamed[9]=1.0
PerLevelStatsMultiplier_DinoTamed[10]=1.0

# PvP Settings
IncreasePvPRespawnInterval=True
IncreasePvPRespawnIntervalCheckPeriod=300
IncreasePvPRespawnIntervalMultiplier=2.0
IncreasePvPRespawnIntervalBaseAmount=60

# Advanced Settings
bAllowCustomRecipes=True
bAllowPlatformSaddleMultiFloors=False
bAllowUnlimitedRespecs=False
bAutoPvETimer=False
bDisableDinoRiding=False
bDisableDinoTaming=False
bDisableFriendlyFire=False
bUseCorpseLocator=True
bUseSingleplayerSettings=False

# Structure Damage Settings
StructureDamageRepairCooldown=180
PvPZoneStructureDamageMultiplier=1.0
OverrideStructurePlatformPrevention=False

# Resource Settings
ResourceNoReplenishRadiusPlayers=1.0
ResourceNoReplenishRadiusStructures=1.0

# Advanced Limits
MaxDifficulty=False
MaxNumberOfPlayersInTribe=0
OverrideMaxExperiencePointsDino=0
OverrideMaxExperiencePointsPlayer=0`;

  const docPath = join(process.cwd(), 'docs', 'game-ini.md');
  writeFileSync(docPath, defaultContent);
}

/**
 * Generate default GameUserSettings structure
 */
function generateDefaultGameUserSettings(): ParsedINI {
  return {
    sections: [
      {
        name: 'ServerSettings',
        settings: [
          { key: 'DifficultyOffset', value: 1.0, type: 'number' },
          { key: 'MaxPlayers', value: 70, type: 'number' },
          { key: 'ServerPassword', value: '', type: 'string' },
          { key: 'ServerAdminPassword', value: 'admin123', type: 'string' },
          { key: 'ServerPVE', value: true, type: 'boolean' },
          { key: 'AllowThirdPersonPlayer', value: true, type: 'boolean' }
        ]
      },
      {
        name: 'SessionSettings',
        settings: [
          { key: 'SessionName', value: 'My Ark Server', type: 'string' }
        ]
      }
    ],
    metadata: {
      source: 'Default',
      lastUpdated: new Date()
    }
  };
}

/**
 * Generate default Game.ini structure
 */
function generateDefaultGameINI(): ParsedINI {
  return {
    sections: [
      {
        name: '/Script/ShooterGame.ShooterGameMode',
        settings: [
          { key: 'GenericXPMultiplier', value: 1.0, type: 'number' },
          { key: 'HarvestXPMultiplier', value: 1.0, type: 'number' },
          { key: 'TamingSpeedMultiplier', value: 1.0, type: 'number' },
          { key: 'MatingIntervalMultiplier', value: 1.0, type: 'number' },
          { key: 'EggHatchSpeedMultiplier', value: 1.0, type: 'number' },
          { key: 'BabyMatureSpeedMultiplier', value: 1.0, type: 'number' }
        ]
      }
    ],
    metadata: {
      source: 'Default',
      lastUpdated: new Date()
    }
  };
}

/**
 * Write INI file
 */
export function writeINIFile(sections: INISection[], filePath: string): void {
  let content = '';
  
  for (const section of sections) {
    content += `[${section.name}]\n`;
    
    for (const setting of section.settings) {
      if (setting.comment) {
        content += `; ${setting.comment}\n`;
      }
      content += `${setting.key}=${setting.value}\n`;
    }
    
    content += '\n';
  }
  
  writeFileSync(filePath, content);
}

/**
 * Read INI file
 */
export function readINIFile(filePath: string): ParsedINI {
  if (!existsSync(filePath)) {
    throw new Error(`INI file not found: ${filePath}`);
  }
  
  const content = readFileSync(filePath, 'utf-8');
  return parseINIContent(content, 'File');
}

/**
 * Merge INI configurations
 */
export function mergeINIConfigs(base: ParsedINI, override: ParsedINI): ParsedINI {
  const mergedSections = [...base.sections];
  
  for (const overrideSection of override.sections) {
    const existingIndex = mergedSections.findIndex(s => s.name === overrideSection.name);
    
    if (existingIndex >= 0) {
      // Merge settings within existing section
      const existingSection = mergedSections[existingIndex];
      const mergedSettings = [...existingSection.settings];
      
      for (const overrideSetting of overrideSection.settings) {
        const settingIndex = mergedSettings.findIndex(s => s.key === overrideSetting.key);
        
        if (settingIndex >= 0) {
          mergedSettings[settingIndex] = overrideSetting;
        } else {
          mergedSettings.push(overrideSetting);
        }
      }
      
      mergedSections[existingIndex] = {
        ...existingSection,
        settings: mergedSettings
      };
    } else {
      // Add new section
      mergedSections.push(overrideSection);
    }
  }
  
  return {
    sections: mergedSections,
    metadata: {
      ...base.metadata,
      lastUpdated: new Date()
    }
  };
}

/**
 * Get comprehensive configuration categories with all available settings
 */
export function getComprehensiveConfigCategories() {
  const gameUserSettings = parseGameUserSettingsDoc();
  const gameINI = parseGameINIDoc();
  
  return {
    gameUserSettings,
    gameINI,
    categories: {
      basic: ['SessionName', 'MaxPlayers', 'ServerPassword', 'ServerAdminPassword', 'Port', 'QueryPort'],
      gameplay: ['DifficultyOffset', 'ServerPVE', 'ServerHardcore', 'AllowThirdPersonPlayer'],
      rates: ['GenericXPMultiplier', 'HarvestXPMultiplier', 'TamingSpeedMultiplier', 'DinoCountMultiplier'],
      breeding: ['MatingIntervalMultiplier', 'EggHatchSpeedMultiplier', 'BabyMatureSpeedMultiplier'],
      pvp: ['PreventOfflinePvP', 'IncreasePvPRespawnInterval'],
      structures: ['TheMaxStructuresInRange', 'AlwaysAllowStructurePickup'],
      transfers: ['NoTributeDownloads', 'PreventDownloadSurvivors', 'PreventDownloadItems'],
      advanced: ['bAllowCustomRecipes', 'bUseCorpseLocator', 'StructureDamageRepairCooldown']
    }
  };
} 