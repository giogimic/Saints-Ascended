import React, { useState, useEffect, useCallback } from 'react';
import { ServerConfig } from '../../types/server';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import { Cog6ToothIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface AdvancedConfigEditorProps {
  serverId: string;
  onConfigUpdate: (config: Partial<ServerConfig>) => void;
}

interface ConfigSection {
  id: string;
  name: string;
  description: string;
  settings: ConfigSetting[];
}

interface ConfigSetting {
  key: string;
  name: string;
  description: string;
  type: 'number' | 'boolean' | 'string' | 'array' | 'select';
  value: unknown;
  defaultValue: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  advanced?: boolean;
  restart_required?: boolean;
}

// Simple INI parser
const parseINIFile = (content: string): Record<string, Record<string, string>> => {
  const sections: Record<string, Record<string, string>> = {};
  let currentSection = '';
  
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith(';') || trimmedLine.startsWith('//')) {
      continue;
    }
    
    // Check for section headers
    if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
      currentSection = trimmedLine.slice(1, -1);
      sections[currentSection] = {};
      continue;
    }
    
    // Parse key-value pairs
    const equalIndex = trimmedLine.indexOf('=');
    if (equalIndex > 0 && currentSection) {
      const key = trimmedLine.substring(0, equalIndex).trim();
      const value = trimmedLine.substring(equalIndex + 1).trim();
      sections[currentSection][key] = value;
    }
  }
  
  return sections;
};

const AdvancedConfigEditor: React.FC<AdvancedConfigEditorProps> = ({ serverId, onConfigUpdate }) => {
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const [parsedSettings, setParsedSettings] = useState<Record<string, unknown>>({});
  const [configSections, setConfigSections] = useState<ConfigSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('session');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'raw'>('config');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rawGameUserSettings, setRawGameUserSettings] = useState('');
  const [rawGameIni, setRawGameIni] = useState('');
  const [activeRawTab, setActiveRawTab] = useState<'gameusersettings' | 'gameini'>('gameusersettings');

  const loadServerConfig = useCallback(async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}`);
      if (response.ok) {
        const serverData = await response.json();
        setConfig(serverData);
      }
    } catch (error) {
      console.error('Failed to load server config:', error);
    }
  }, [serverId]);

  const generateConfigSections = useCallback((settings: Record<string, unknown>): ConfigSection[] => {
    return [
      {
        id: 'session',
        name: 'Session Settings',
        description: 'Server session and basic configuration',
        settings: [
          {
            key: 'sessionName',
            name: 'Session Name',
            description: 'Display name in server browser and session info',
            type: 'string',
            value: settings.sessionName || config?.name || '',
            defaultValue: 'My Ark Server'
          },
          {
            key: 'maxPlayers',
            name: 'Max Players',
            description: 'Maximum number of concurrent players',
            type: 'number',
            value: settings.maxPlayers || config?.maxPlayers || 70,
            defaultValue: 70,
            min: 1,
            max: 255
          }
        ]
      },
      {
        id: 'difficulty',
        name: 'Difficulty Settings',
        description: 'Server difficulty and level settings',
        settings: [
          {
            key: 'DifficultyOffset',
            name: 'Difficulty Offset',
            description: 'Base difficulty multiplier affecting dino levels and loot quality',
            type: 'number',
            value: settings.DifficultyOffset || 1.0,
            defaultValue: 1.0,
            min: 0.0,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'DinoCountMultiplier',
            name: 'Dino Count Multiplier',
            description: 'Multiplier for the number of wild dinosaurs that spawn',
            type: 'number',
            value: settings.DinoCountMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          }
        ]
      },
      {
        id: 'gameplay',
        name: 'Gameplay Settings',
        description: 'Core gameplay mechanics and features',
        settings: [
          {
            key: 'AllowAnyoneBabyImprintCuddle',
            name: 'Allow Anyone Baby Imprint Cuddle',
            description: 'Allow any player to imprint on babies',
            type: 'boolean',
            value: settings.AllowAnyoneBabyImprintCuddle || false,
            defaultValue: false
          },
          {
            key: 'AllowCaveBuildingPvE',
            name: 'Allow Cave Building PvE',
            description: 'Allow building structures in caves in PvE mode',
            type: 'boolean',
            value: settings.AllowCaveBuildingPvE || false,
            defaultValue: false
          },
          {
            key: 'AllowFlyerCarryPvE',
            name: 'Allow Flyer Carry PvE',
            description: 'Allow flying creatures to carry players/dinos in PvE',
            type: 'boolean',
            value: settings.AllowFlyerCarryPvE || true,
            defaultValue: true
          },
          {
            key: 'bAllowFlyerSpeedLeveling',
            name: 'Allow Flyer Speed Leveling',
            description: 'Allow players to level up flying creature movement speed',
            type: 'boolean',
            value: settings.bAllowFlyerSpeedLeveling || false,
            defaultValue: false
          },
          {
            key: 'bAllowSpeedLeveling',
            name: 'Allow Speed Leveling',
            description: 'Allow players to level up movement speed',
            type: 'boolean',
            value: settings.bAllowSpeedLeveling || true,
            defaultValue: true
          },
          {
            key: 'CraftingSkillBonusMultiplier',
            name: 'Crafting Skill Bonus Multiplier',
            description: 'Multiplier for crafting skill bonus effects',
            type: 'number',
            value: settings.CraftingSkillBonusMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          }
        ]
      },
      {
        id: 'structures',
        name: 'Structure Settings',
        description: 'Building and structure related settings',
        settings: [
          {
            key: 'AlwaysAllowStructurePickup',
            name: 'Always Allow Structure Pickup',
            description: 'Allow picking up placed structures at any time',
            type: 'boolean',
            value: settings.AlwaysAllowStructurePickup || false,
            defaultValue: false
          },
          {
            key: 'DisableStructureDecayPvE',
            name: 'Disable Structure Decay PvE',
            description: 'Prevent structures from decaying in PvE mode',
            type: 'boolean',
            value: settings.DisableStructureDecayPvE || false,
            defaultValue: false
          },
          {
            key: 'StructurePickupHoldDuration',
            name: 'Structure Pickup Hold Duration',
            description: 'Time in seconds to hold use key for structure pickup',
            type: 'number',
            value: settings.StructurePickupHoldDuration || 0.5,
            defaultValue: 0.5,
            min: 0.1,
            max: 5.0,
            step: 0.1
          },
          {
            key: 'StructurePickupTimeAfterPlacement',
            name: 'Structure Pickup Time After Placement',
            description: 'Time in seconds structures can be picked up after placement',
            type: 'number',
            value: settings.StructurePickupTimeAfterPlacement || 30,
            defaultValue: 30,
            min: 0,
            max: 3600,
            step: 1
          }
        ]
      },
      {
        id: 'dinos',
        name: 'Dino Settings',
        description: 'Dinosaur and creature related settings',
        settings: [
          {
            key: 'DisableDinoDecayPvE',
            name: 'Disable Dino Decay PvE',
            description: 'Prevent tamed dinosaurs from decaying in PvE mode',
            type: 'boolean',
            value: settings.DisableDinoDecayPvE || false,
            defaultValue: false
          },
          {
            key: 'DisableImprintDinoBuff',
            name: 'Disable Imprint Dino Buff',
            description: 'Disable the bonus stats from imprinting on dinosaurs',
            type: 'boolean',
            value: settings.DisableImprintDinoBuff || false,
            defaultValue: false
          },
          {
            key: 'MaxTamedDinos',
            name: 'Max Tamed Dinos',
            description: 'Maximum number of tamed dinosaurs allowed on the server',
            type: 'number',
            value: settings.MaxTamedDinos || 5000,
            defaultValue: 5000,
            min: 1,
            max: 50000
          }
        ]
      },
      {
        id: 'environment',
        name: 'Environment Settings',
        description: 'World and environment related settings',
        settings: [
          {
            key: 'DisableWeatherFog',
            name: 'Disable Weather Fog',
            description: 'Disable fog weather effects',
            type: 'boolean',
            value: settings.DisableWeatherFog || false,
            defaultValue: false
          },
          {
            key: 'StartTimeHour',
            name: 'Start Time Hour',
            description: 'Hour of the day when server starts (0-23)',
            type: 'number',
            value: settings.StartTimeHour || 10,
            defaultValue: 10,
            min: 0,
            max: 23
          },
          {
            key: 'StartTimeOverride',
            name: 'Start Time Override',
            description: 'Override the default start time',
            type: 'boolean',
            value: settings.StartTimeOverride || false,
            defaultValue: false
          }
        ]
      },
      {
        id: 'breeding',
        name: 'Breeding Settings',
        description: 'Baby, maturation, and cuddle settings',
        settings: [
          {
            key: 'BabyCuddleGracePeriodMultiplier',
            name: 'Baby Cuddle Grace Period',
            description: 'Multiplier for the grace period between cuddles',
            type: 'number',
            value: settings.BabyCuddleGracePeriodMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'BabyCuddleIntervalMultiplier',
            name: 'Baby Cuddle Interval',
            description: 'Time multiplier between cuddle interactions',
            type: 'number',
            value: settings.BabyCuddleIntervalMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'BabyCuddleLoseImprintQualitySpeedMultiplier',
            name: 'Imprint Quality Loss Speed',
            description: 'Speed at which babies lose imprint quality',
            type: 'number',
            value: settings.BabyCuddleLoseImprintQualitySpeedMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'BabyFoodConsumptionSpeedMultiplier',
            name: 'Baby Food Consumption Speed',
            description: 'Rate at which babies consume food',
            type: 'number',
            value: settings.BabyFoodConsumptionSpeedMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'BabyImprintingStatScaleMultiplier',
            name: 'Baby Imprinting Stat Scale',
            description: 'Multiplier for imprinting bonus stats',
            type: 'number',
            value: settings.BabyImprintingStatScaleMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'BabyMatureSpeedMultiplier',
            name: 'Baby Mature Speed',
            description: 'Speed at which babies mature',
            type: 'number',
            value: settings.BabyMatureSpeedMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'EggHatchSpeedMultiplier',
            name: 'Egg Hatch Speed',
            description: 'Speed at which eggs hatch',
            type: 'number',
            value: settings.EggHatchSpeedMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'MatingIntervalMultiplier',
            name: 'Mating Interval',
            description: 'Time between mating attempts',
            type: 'number',
            value: settings.MatingIntervalMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          }
        ]
      },
      {
        id: 'pvp',
        name: 'PvP Settings',
        description: 'Player vs Player related settings',
        settings: [
          {
            key: 'bDisableFriendlyFire',
            name: 'Disable Friendly Fire',
            description: 'Prevent damage between tribe members',
            type: 'boolean',
            value: settings.bDisableFriendlyFire || false,
            defaultValue: false
          },
          {
            key: 'bPvEAllowTribeWar',
            name: 'Allow Tribe War in PvE',
            description: 'Allow tribes to declare war in PvE mode',
            type: 'boolean',
            value: settings.bPvEAllowTribeWar || true,
            defaultValue: true
          },
          {
            key: 'bPvEAllowTribeWarCancel',
            name: 'Allow Tribe War Cancellation',
            description: 'Allow cancellation of tribe wars',
            type: 'boolean',
            value: settings.bPvEAllowTribeWarCancel || false,
            defaultValue: false
          },
          {
            key: 'bIncreasePvPRespawnInterval',
            name: 'Increase PvP Respawn Interval',
            description: 'Gradually increase respawn time in PvP',
            type: 'boolean',
            value: settings.bIncreasePvPRespawnInterval || true,
            defaultValue: true
          },
          {
            key: 'IncreasePvPRespawnIntervalBaseAmount',
            name: 'PvP Respawn Base Interval',
            description: 'Base respawn delay in seconds',
            type: 'number',
            value: settings.IncreasePvPRespawnIntervalBaseAmount || 60,
            defaultValue: 60,
            min: 0,
            max: 3600,
            step: 1
          },
          {
            key: 'IncreasePvPRespawnIntervalMultiplier',
            name: 'PvP Respawn Interval Multiplier',
            description: 'Multiplier for respawn delay increase',
            type: 'number',
            value: settings.IncreasePvPRespawnIntervalMultiplier || 2,
            defaultValue: 2,
            min: 1,
            max: 10,
            step: 0.1
          },
          {
            key: 'PvPZoneStructureDamageMultiplier',
            name: 'PvP Zone Structure Damage',
            description: 'Damage multiplier for structures in PvP zones',
            type: 'number',
            value: settings.PvPZoneStructureDamageMultiplier || 6,
            defaultValue: 6,
            min: 0.1,
            max: 10.0,
            step: 0.1
          }
        ]
      },
      {
        id: 'resources',
        name: 'Resource Settings',
        description: 'Resource gathering and harvesting settings',
        settings: [
          {
            key: 'DinoHarvestingDamageMultiplier',
            name: 'Dino Harvesting Damage',
            description: 'Multiplier for dino harvesting damage',
            type: 'number',
            value: settings.DinoHarvestingDamageMultiplier || 3.2,
            defaultValue: 3.2,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'PlayerHarvestingDamageMultiplier',
            name: 'Player Harvesting Damage',
            description: 'Multiplier for player harvesting damage',
            type: 'number',
            value: settings.PlayerHarvestingDamageMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'ResourceNoReplenishRadiusPlayers',
            name: 'Resource No Replenish Radius (Players)',
            description: 'Radius around players where resources won\'t respawn',
            type: 'number',
            value: settings.ResourceNoReplenishRadiusPlayers || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'ResourceNoReplenishRadiusStructures',
            name: 'Resource No Replenish Radius (Structures)',
            description: 'Radius around structures where resources won\'t respawn',
            type: 'number',
            value: settings.ResourceNoReplenishRadiusStructures || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          }
        ]
      },
      {
        id: 'experience',
        name: 'Experience Settings',
        description: 'XP gain and multiplier settings',
        settings: [
          {
            key: 'CraftXPMultiplier',
            name: 'Crafting XP',
            description: 'Multiplier for XP gained from crafting',
            type: 'number',
            value: settings.CraftXPMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'GenericXPMultiplier',
            name: 'Generic XP',
            description: 'Multiplier for general XP gain',
            type: 'number',
            value: settings.GenericXPMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'HarvestXPMultiplier',
            name: 'Harvesting XP',
            description: 'Multiplier for XP gained from harvesting',
            type: 'number',
            value: settings.HarvestXPMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'KillXPMultiplier',
            name: 'Kill XP',
            description: 'Multiplier for XP gained from kills',
            type: 'number',
            value: settings.KillXPMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'SpecialXPMultiplier',
            name: 'Special XP',
            description: 'Multiplier for XP from special events/actions',
            type: 'number',
            value: settings.SpecialXPMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          }
        ]
      },
      {
        id: 'misc',
        name: 'Miscellaneous Settings',
        description: 'Other game settings',
        settings: [
          {
            key: 'bAllowCustomRecipes',
            name: 'Allow Custom Recipes',
            description: 'Enable creation of custom recipes',
            type: 'boolean',
            value: settings.bAllowCustomRecipes || true,
            defaultValue: true
          },
          {
            key: 'CustomRecipeEffectivenessMultiplier',
            name: 'Custom Recipe Effectiveness',
            description: 'Multiplier for custom recipe effects',
            type: 'number',
            value: settings.CustomRecipeEffectivenessMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'CustomRecipeSkillMultiplier',
            name: 'Custom Recipe Skill',
            description: 'Multiplier for custom recipe creation skill',
            type: 'number',
            value: settings.CustomRecipeSkillMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'FuelConsumptionIntervalMultiplier',
            name: 'Fuel Consumption Interval',
            description: 'Multiplier for fuel consumption rate',
            type: 'number',
            value: settings.FuelConsumptionIntervalMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          },
          {
            key: 'GlobalCorpseDecompositionTimeMultiplier',
            name: 'Corpse Decomposition Time',
            description: 'Multiplier for corpse decay time',
            type: 'number',
            value: settings.GlobalCorpseDecompositionTimeMultiplier || 6.0,
            defaultValue: 6.0,
            min: 0.1,
            max: 50.0,
            step: 0.1
          },
          {
            key: 'PoopIntervalMultiplier',
            name: 'Poop Interval',
            description: 'Multiplier for creature defecation frequency',
            type: 'number',
            value: settings.PoopIntervalMultiplier || 1.0,
            defaultValue: 1.0,
            min: 0.1,
            max: 10.0,
            step: 0.1
          }
        ]
      },
      {
        id: 'awesome_teleporters',
        name: 'Awesome Teleporters',
        description: 'Settings for the Awesome Teleporters mod',
        settings: [
          {
            key: 'AllowCorpseFinder',
            name: 'Allow Corpse Finder',
            description: 'Allow players to find their corpses using teleporters',
            type: 'boolean',
            value: settings.AllowCorpseFinder || true,
            defaultValue: true
          },
          {
            key: 'AllowFindDinos',
            name: 'Allow Find Dinos',
            description: 'Allow players to find their tamed dinos using teleporters',
            type: 'boolean',
            value: settings.AllowFindDinos || true,
            defaultValue: true
          },
          {
            key: 'AllowLastRemoteLocation',
            name: 'Allow Last Remote Location',
            description: 'Allow teleporting to last remote location',
            type: 'boolean',
            value: settings.AllowLastRemoteLocation || true,
            defaultValue: true
          },
          {
            key: 'AllowTeleportersOnSaddles',
            name: 'Allow Teleporters On Saddles',
            description: 'Allow placing teleporters on platform saddles',
            type: 'boolean',
            value: settings.AllowTeleportersOnSaddles || true,
            defaultValue: true
          },
          {
            key: 'AllowTeleportingOutOfPreventionZones',
            name: 'Allow Teleporting Out Of Prevention Zones',
            description: 'Allow teleporting out of prevention zones',
            type: 'boolean',
            value: settings.AllowTeleportingOutOfPreventionZones || true,
            defaultValue: true
          },
          {
            key: 'BubbleDuration',
            name: 'Bubble Duration',
            description: 'Duration of the teleporter bubble effect in seconds',
            type: 'number',
            value: settings.BubbleDuration || 5,
            defaultValue: 5,
            min: 1,
            max: 60
          }
        ]
      },
      {
        id: 'loot_grabber',
        name: 'Loot Grabber',
        description: 'Settings for the Loot Grabber mod',
        settings: [
          {
            key: 'BagLooting',
            name: 'Bag Looting',
            description: 'Enable looting from bags',
            type: 'boolean',
            value: settings.BagLooting || true,
            defaultValue: true
          },
          {
            key: 'ItemLooting',
            name: 'Item Looting',
            description: 'Enable looting of items',
            type: 'boolean',
            value: settings.ItemLooting || true,
            defaultValue: true
          },
          {
            key: 'SupplyDropLooting',
            name: 'Supply Drop Looting',
            description: 'Enable looting from supply drops',
            type: 'boolean',
            value: settings.SupplyDropLooting || true,
            defaultValue: true
          },
          {
            key: 'ReworkPickUpRadius',
            name: 'Pickup Radius',
            description: 'Radius in units for picking up items',
            type: 'number',
            value: settings.ReworkPickUpRadius || 900,
            defaultValue: 900,
            min: 100,
            max: 5000
          }
        ]
      },
      {
        id: 'egg_collector',
        name: 'Egg Collector',
        description: 'Settings for the Egg Collector mod',
        settings: [
          {
            key: 'AllowIncubate',
            name: 'Allow Incubate',
            description: 'Allow egg incubation',
            type: 'boolean',
            value: settings.AllowIncubate || true,
            defaultValue: true
          },
          {
            key: 'GenRate',
            name: 'Generation Rate',
            description: 'Rate at which eggs are generated',
            type: 'number',
            value: settings.GenRate || 1,
            defaultValue: 1,
            min: 0.1,
            max: 10,
            step: 0.1
          },
          {
            key: 'GrabFert',
            name: 'Grab Fertilized Eggs',
            description: 'Allow collection of fertilized eggs',
            type: 'boolean',
            value: settings.GrabFert || true,
            defaultValue: true
          }
        ]
      },
      {
        id: 'omega_dino_storage',
        name: 'Omega Dino Storage',
        description: 'Settings for the Omega Dino Storage mod',
        settings: [
          {
            key: 'AllowBabyStore',
            name: 'Allow Baby Storage',
            description: 'Allow storing baby creatures',
            type: 'boolean',
            value: settings.AllowBabyStore || true,
            defaultValue: true
          },
          {
            key: 'ObeliskBabyDistance',
            name: 'Obelisk Baby Distance',
            description: 'Maximum distance for baby storage at obelisks',
            type: 'number',
            value: settings.ObeliskBabyDistance || 9000,
            defaultValue: 9000,
            min: 1000,
            max: 50000
          },
          {
            key: 'SaveItems',
            name: 'Save Items',
            description: 'Save items with stored creatures',
            type: 'boolean',
            value: settings.SaveItems || true,
            defaultValue: true
          }
        ]
      },
      {
        id: 'sprinkles',
        name: 'Sprinkles',
        description: 'Settings for the Sprinkles mod',
        settings: [
          {
            key: 'EnableStatPointsPlayer',
            name: 'Enable Player Stat Points',
            description: 'Enable stat point system for players',
            type: 'boolean',
            value: settings.EnableStatPointsPlayer || true,
            defaultValue: true
          },
          {
            key: 'EnableStatPointsDino',
            name: 'Enable Dino Stat Points',
            description: 'Enable stat point system for dinosaurs',
            type: 'boolean',
            value: settings.EnableStatPointsDino || true,
            defaultValue: true
          },
          {
            key: 'EnablePickupGun',
            name: 'Enable Pickup Gun',
            description: 'Enable the structure pickup gun',
            type: 'boolean',
            value: settings.EnablePickupGun || true,
            defaultValue: true
          },
          {
            key: 'PullRange',
            name: 'Pull Range',
            description: 'Range for pulling items in foundations',
            type: 'number',
            value: settings.PullRange || 30.0,
            defaultValue: 30.0,
            min: 1,
            max: 100,
            step: 0.1
          }
        ]
      },
      {
        id: 'qol_plus',
        name: 'QoL Plus',
        description: 'Settings for the Quality of Life Plus mod',
        settings: [
          {
            key: 'RemoveFloorRequirementFromStructurePlacement',
            name: 'Remove Floor Requirement',
            description: 'Allow placing structures without floor requirement',
            type: 'boolean',
            value: settings.RemoveFloorRequirementFromStructurePlacement || true,
            defaultValue: true
          },
          {
            key: 'ResourcePullRangeInFoundations',
            name: 'Resource Pull Range',
            description: 'Range for pulling resources in foundations',
            type: 'number',
            value: settings.ResourcePullRangeInFoundations || 25,
            defaultValue: 25,
            min: 1,
            max: 100
          },
          {
            key: 'SmallStorageSlotCount',
            name: 'Small Storage Slots',
            description: 'Number of slots in small storage containers',
            type: 'number',
            value: settings.SmallStorageSlotCount || 30,
            defaultValue: 30,
            min: 1,
            max: 1000
          }
        ]
      },
      {
        id: 'human_npcs',
        name: 'Human NPCs',
        description: 'Settings for the Human NPCs mod',
        settings: [
          {
            key: 'Total_NPCs',
            name: 'Total NPCs',
            description: 'Total number of NPCs to spawn',
            type: 'number',
            value: settings.Total_NPCs || 1,
            defaultValue: 1,
            min: 1,
            max: 100
          },
          {
            key: 'Start_Clothing',
            name: 'Start Clothing',
            description: 'Initial clothing level for NPCs',
            type: 'number',
            value: settings.Start_Clothing || 1,
            defaultValue: 1,
            min: 0,
            max: 5
          },
          {
            key: 'Health_x',
            name: 'Health Multiplier',
            description: 'Health multiplier for NPCs',
            type: 'number',
            value: settings.Health_x || 250.0,
            defaultValue: 250.0,
            min: 1,
            max: 1000,
            step: 0.1
          }
        ]
      },
      {
        id: 'cloud_storage',
        name: 'Cloud Storage',
        description: 'Settings for the Cloud Storage mod',
        settings: [
          {
            key: 'ID',
            name: 'Cloud Storage ID',
            description: 'Unique identifier for cloud storage',
            type: 'string',
            value: settings.CloudStorage_ID || '',
            defaultValue: ''
          },
          {
            key: 'Secret',
            name: 'Cloud Storage Secret',
            description: 'Secret key for cloud storage authentication',
            type: 'string',
            value: settings.CloudStorage_Secret || '',
            defaultValue: ''
          },
          {
            key: 'URL',
            name: 'Cloud Storage URL',
            description: 'WebSocket URL for cloud storage service',
            type: 'string',
            value: settings.CloudStorage_URL || 'wss://api.arkcloudstorage.com',
            defaultValue: 'wss://api.arkcloudstorage.com'
          }
        ]
      },
      {
        id: 'thors_hammer',
        name: 'Thors Hammer',
        description: 'Settings for the Thors Hammer mod',
        settings: [
          {
            key: 'ThorsHammerHealing',
            name: 'Healing Amount',
            description: 'Amount of healing provided by Thors Hammer',
            type: 'number',
            value: settings.ThorsHammerHealing || 0.15,
            defaultValue: 0.15,
            min: 0,
            max: 1,
            step: 0.01
          },
          {
            key: 'ThorsHammerRange',
            name: 'Range',
            description: 'Range of Thors Hammer effects',
            type: 'number',
            value: settings.ThorsHammerRange || 900,
            defaultValue: 900,
            min: 100,
            max: 5000
          }
        ]
      }
    ];
  }, [config]);

  const extractSettingsFromINI = useCallback((gameUserSettingsContent: string, gameIniContent: string) => {
    const gameUserSettings = parseINIFile(gameUserSettingsContent);
    const gameIni = parseINIFile(gameIniContent);
    
    const settings: Record<string, unknown> = {};
    
    // Helper function to parse values
    const parseValue = (value: string): unknown => {
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
      if (!isNaN(Number(value)) && value !== '') return Number(value);
      return value;
    };
    
    // Extract values from GameUserSettings.ini
    if (gameUserSettings['SessionSettings']) {
      settings.sessionName = gameUserSettings['SessionSettings'].SessionName || '';
    }
    if (gameUserSettings['ServerSettings']) {
      const serverSettings = gameUserSettings['ServerSettings'];
      settings.serverPassword = serverSettings.ServerPassword || '';
      settings.serverAdminPassword = serverSettings.ServerAdminPassword || '';
      settings.spectatorPassword = serverSettings.SpectatorPassword || '';
      settings.rconPort = parseValue(serverSettings.RCONPort || '27420');
      settings.difficultyOffset = parseValue(serverSettings.DifficultyOffset || '1.0');
      settings.serverPVE = parseValue(serverSettings.ServerPVE || 'false');
      settings.serverHardcore = parseValue(serverSettings.ServerHardcore || 'false');
      settings.serverCrosshair = parseValue(serverSettings.ServerCrosshair || 'true');
      settings.serverForceNoHUD = parseValue(serverSettings.ServerForceNoHUD || 'false');
      settings.adminLogging = parseValue(serverSettings.AdminLogging || 'false');
      settings.autoSavePeriodMinutes = parseValue(serverSettings.AutoSavePeriodMinutes || '15');
      settings.allowThirdPersonPlayer = parseValue(serverSettings.AllowThirdPersonPlayer || 'true');
      settings.allowCaveBuildingPvE = parseValue(serverSettings.AllowCaveBuildingPvE || 'true');
      settings.allowFlyerCarryPvE = parseValue(serverSettings.AllowFlyerCarryPvE || 'true');
      settings.preventOfflinePvP = parseValue(serverSettings.PreventOfflinePvP || 'false');
      settings.preventOfflinePvPInterval = parseValue(serverSettings.PreventOfflinePvPInterval || '300');
      settings.disableWeatherFog = parseValue(serverSettings.DisableWeatherFog || 'false');
      settings.randomSupplyCratePoints = parseValue(serverSettings.RandomSupplyCratePoints || 'false');
      settings.dinoCountMultiplier = parseValue(serverSettings.DinoCountMultiplier || '1.0');
      settings.maxTamedDinos = parseValue(serverSettings.MaxTamedDinos || '5000');
      settings.theMaxStructuresInRange = parseValue(serverSettings.TheMaxStructuresInRange || '10500');
      settings.alwaysAllowStructurePickup = parseValue(serverSettings.AlwaysAllowStructurePickup || 'true');
      settings.structurePickupTimeAfterPlacement = parseValue(serverSettings.StructurePickupTimeAfterPlacement || '30');
      settings.structurePickupHoldDuration = parseValue(serverSettings.StructurePickupHoldDuration || '0.5');
      settings.forceAllowCaveFlyers = parseValue(serverSettings.ForceAllowCaveFlyers || 'true');
      settings.disableStructureDecayPvE = parseValue(serverSettings.DisableStructureDecayPvE || 'false');
      settings.pveStructureDecayPeriodMultiplier = parseValue(serverSettings.PvEStructureDecayPeriodMultiplier || '1.0');
      settings.disableDinoDecayPvE = parseValue(serverSettings.DisableDinoDecayPvE || 'true');
      settings.pveDinoDecayPeriodMultiplier = parseValue(serverSettings.PvEDinoDecayPeriodMultiplier || '1.0');
      settings.itemStackSizeMultiplier = parseValue(serverSettings.ItemStackSizeMultiplier || '1.0');
      settings.cropDecaySpeedMultiplier = parseValue(serverSettings.CropDecaySpeedMultiplier || '1.0');
      settings.cropGrowthSpeedMultiplier = parseValue(serverSettings.CropGrowthSpeedMultiplier || '1.0');
      settings.bAllowSpeedLeveling = parseValue(serverSettings.bAllowSpeedLeveling || 'true');
      settings.bAllowFlyerSpeedLeveling = parseValue(serverSettings.bAllowFlyerSpeedLeveling || 'true');
      settings.allowAnyoneBabyImprintCuddle = parseValue(serverSettings.AllowAnyoneBabyImprintCuddle || 'false');
      settings.disableImprintDinoBuff = parseValue(serverSettings.DisableImprintDinoBuff || 'false');
      settings.enableExtraStructurePreventionVolumes = parseValue(serverSettings.EnableExtraStructurePreventionVolumes || 'true');
      settings.enablePvPGamma = parseValue(serverSettings.EnablePvPGamma || 'true');
      settings.disablePvEGamma = parseValue(serverSettings.DisablePvEGamma || 'false');
      settings.showFloatingDamageText = parseValue(serverSettings.ShowFloatingDamageText || 'true');
      settings.showMapPlayerLocation = parseValue(serverSettings.ShowMapPlayerLocation || 'true');
      settings.allowHitMarkers = parseValue(serverSettings.AllowHitMarkers || 'true');
      settings.kickIdlePlayersPeriod = parseValue(serverSettings.KickIdlePlayersPeriod || '3600');
      settings.craftingSkillBonusMultiplier = parseValue(serverSettings.CraftingSkillBonusMultiplier || '1.0');
      settings.pvpDinoDecay = parseValue(serverSettings.PvPDinoDecay || 'false');
      settings.supplyCrateLootQualityMultiplier = parseValue(serverSettings.SupplyCrateLootQualityMultiplier || '1.0');
      settings.structurePreventResourceRadiusMultiplier = parseValue(serverSettings.StructurePreventResourceRadiusMultiplier || '1.0');
    }
    if (gameUserSettings['/Script/Engine.GameSession']) {
      settings.maxPlayers = parseValue(gameUserSettings['/Script/Engine.GameSession'].MaxPlayers || '70');
    }
    
    // Extract values from Game.ini
    if (gameIni['/script/shootergame.shootergamemode']) {
      const gameMode = gameIni['/script/shootergame.shootergamemode'];
      settings.maxDifficulty = parseValue(gameMode.MaxDifficulty || 'false');
      settings.genericXPMultiplier = parseValue(gameMode.GenericXPMultiplier || '1.0');
      settings.harvestXPMultiplier = parseValue(gameMode.HarvestXPMultiplier || '1.0');
      settings.craftXPMultiplier = parseValue(gameMode.CraftXPMultiplier || '1.0');
      settings.killXPMultiplier = parseValue(gameMode.KillXPMultiplier || '1.0');
      settings.specialXPMultiplier = parseValue(gameMode.SpecialXPMultiplier || '1.0');
      settings.playerHarvestingDamageMultiplier = parseValue(gameMode.PlayerHarvestingDamageMultiplier || '1.0');
      settings.dinoHarvestingDamageMultiplier = parseValue(gameMode.DinoHarvestingDamageMultiplier || '3.2');
      settings.matingIntervalMultiplier = parseValue(gameMode.MatingIntervalMultiplier || '1.0');
      settings.eggHatchSpeedMultiplier = parseValue(gameMode.EggHatchSpeedMultiplier || '1.0');
      settings.babyMatureSpeedMultiplier = parseValue(gameMode.BabyMatureSpeedMultiplier || '1.0');
      settings.babyCuddleIntervalMultiplier = parseValue(gameMode.BabyCuddleIntervalMultiplier || '1.0');
      settings.babyFoodConsumptionSpeedMultiplier = parseValue(gameMode.BabyFoodConsumptionSpeedMultiplier || '1.0');
      settings.layEggIntervalMultiplier = parseValue(gameMode.LayEggIntervalMultiplier || '1.0');
      settings.bUseCorpseLocator = parseValue(gameMode.bUseCorpseLocator || 'true');
      settings.bUseSingleplayerSettings = parseValue(gameMode.bUseSingleplayerSettings || 'false');
      settings.bAllowCustomRecipes = parseValue(gameMode.bAllowCustomRecipes || 'true');
      settings.bDisableStructurePlacementCollision = parseValue(gameMode.bDisableStructurePlacementCollision || 'false');
      settings.bPvEAllowTribeWar = parseValue(gameMode.bPvEAllowTribeWar || 'true');
      settings.bIncreasePvPRespawnInterval = parseValue(gameMode.bIncreasePvPRespawnInterval || 'true');
      settings.increasePvPRespawnIntervalBaseAmount = parseValue(gameMode.IncreasePvPRespawnIntervalBaseAmount || '60');
      settings.increasePvPRespawnIntervalMultiplier = parseValue(gameMode.IncreasePvPRespawnIntervalMultiplier || '2');
      settings.bDisableDinoRiding = parseValue(gameMode.bDisableDinoRiding || 'false');
      settings.bDisableDinoTaming = parseValue(gameMode.bDisableDinoTaming || 'false');
      settings.customRecipeEffectivenessMultiplier = parseValue(gameMode.CustomRecipeEffectivenessMultiplier || '1.0');
      settings.customRecipeSkillMultiplier = parseValue(gameMode.CustomRecipeSkillMultiplier || '1.0');
      settings.fuelConsumptionIntervalMultiplier = parseValue(gameMode.FuelConsumptionIntervalMultiplier || '1.0');
      settings.poopIntervalMultiplier = parseValue(gameMode.PoopIntervalMultiplier || '1.0');
      settings.globalCorpseDecompositionTimeMultiplier = parseValue(gameMode.GlobalCorpseDecompositionTimeMultiplier || '6.0');
      settings.globalItemDecompositionTimeMultiplier = parseValue(gameMode.GlobalItemDecompositionTimeMultiplier || '0.0');
      settings.globalSpoilingTimeMultiplier = parseValue(gameMode.GlobalSpoilingTimeMultiplier || '0.0');
      settings.structureDamageRepairCooldown = parseValue(gameMode.StructureDamageRepairCooldown || '180');
    }
    
    // Extract mod-specific settings
    if (gameUserSettings['AwesomeTeleporters']) {
      const teleporters = gameUserSettings['AwesomeTeleporters'];
      settings.AllowCorpseFinder = parseValue(teleporters.AllowCorpseFinder || 'true');
      settings.AllowFindDinos = parseValue(teleporters.AllowFindDinos || 'true');
      settings.AllowLastRemoteLocation = parseValue(teleporters.AllowLastRemoteLocation || 'true');
      settings.AllowTeleportersOnSaddles = parseValue(teleporters.AllowTeleportersOnSaddles || 'true');
      settings.AllowTeleportingOutOfPreventionZones = parseValue(teleporters.AllowTeleportingOutOfPreventionZones || 'true');
      settings.BubbleDuration = parseValue(teleporters.BubbleDuration || '5');
    }

    if (gameUserSettings['LootGrabber']) {
      const lootGrabber = gameUserSettings['LootGrabber'];
      settings.BagLooting = parseValue(lootGrabber.BagLooting || 'true');
      settings.ItemLooting = parseValue(lootGrabber.ItemLooting || 'true');
      settings.SupplyDropLooting = parseValue(lootGrabber.SupplyDropLooting || 'true');
      settings.ReworkPickUpRadius = parseValue(lootGrabber.ReworkPickUpRadius || '900');
    }

    if (gameUserSettings['EggCollector']) {
      const eggCollector = gameUserSettings['EggCollector'];
      settings.AllowIncubate = parseValue(eggCollector.AllowIncubate || 'true');
      settings.GenRate = parseValue(eggCollector.GenRate || '1');
      settings.GrabFert = parseValue(eggCollector.GrabFert || 'true');
    }

    if (gameUserSettings['OmegaDinoStorage']) {
      const dinoStorage = gameUserSettings['OmegaDinoStorage'];
      settings.AllowBabyStore = parseValue(dinoStorage.AllowBabyStore || 'true');
      settings.ObeliskBabyDistance = parseValue(dinoStorage.ObeliskBabyDistance || '9000');
      settings.SaveItems = parseValue(dinoStorage.SaveItems || 'true');
    }

    if (gameUserSettings['Sprinkles']) {
      const sprinkles = gameUserSettings['Sprinkles'];
      settings.EnableStatPointsPlayer = parseValue(sprinkles.EnableStatPointsPlayer || 'true');
      settings.EnableStatPointsDino = parseValue(sprinkles.EnableStatPointsDino || 'true');
      settings.EnablePickupGun = parseValue(sprinkles.EnablePickupGun || 'true');
      settings.PullRange = parseValue(sprinkles.PullRange || '30.0');
    }

    if (gameUserSettings['QoLPlus']) {
      const qolPlus = gameUserSettings['QoLPlus'];
      settings.RemoveFloorRequirementFromStructurePlacement = parseValue(qolPlus.RemoveFloorRequirementFromStructurePlacement || 'true');
      settings.ResourcePullRangeInFoundations = parseValue(qolPlus.ResourcePullRangeInFoundations || '25');
      settings.SmallStorageSlotCount = parseValue(qolPlus.SmallStorageSlotCount || '30');
    }

    if (gameUserSettings['Human_NPCs']) {
      const humanNPCs = gameUserSettings['Human_NPCs'];
      settings.Total_NPCs = parseValue(humanNPCs.Total_NPCs || '1');
      settings.Start_Clothing = parseValue(humanNPCs.Start_Clothing || '1');
    }

    if (gameUserSettings['Human_NPCs_Settings']) {
      const npcSettings = gameUserSettings['Human_NPCs_Settings'];
      settings.Health_x = parseValue(npcSettings.Health_x || '250.0');
    }

    if (gameUserSettings['CloudStorage']) {
      const cloudStorage = gameUserSettings['CloudStorage'];
      settings.CloudStorage_ID = cloudStorage.ID || '';
      settings.CloudStorage_Secret = cloudStorage.Secret || '';
      settings.CloudStorage_URL = cloudStorage.URL || 'wss://api.arkcloudstorage.com';
    }

    if (gameUserSettings['ThorsHammerMSVV']) {
      const thorsHammer = gameUserSettings['ThorsHammerMSVV'];
      settings.ThorsHammerHealing = parseValue(thorsHammer.ThorsHammerHealing || '0.15');
      settings.ThorsHammerRange = parseValue(thorsHammer.ThorsHammerRange || '900');
    }

    // Add server config values
    if (config) {
      settings.port = config.port || 7777;
      settings.queryPort = config.queryPort || 27015;
    }
    
    setParsedSettings(settings);
    
    // Generate config sections directly here
    const sections = generateConfigSections(settings);
    setConfigSections(sections);
  }, [config]);

  // Load raw files on component mount - only depend on serverId to prevent infinite loops
  useEffect(() => {
    const loadRawFiles = async () => {
      try {
        setIsLoading(true);
        await loadServerConfig();
        
        // Load the actual config files from the user's config directory
        const [gameUserSettingsResponse, gameIniResponse] = await Promise.all([
          fetch(`/api/servers/${serverId}/config?file=GameUserSettings.ini`),
          fetch(`/api/servers/${serverId}/config?file=Game.ini`)
        ]);

        let gameUserSettingsContent = '';
        let gameIniContent = '';

        if (gameUserSettingsResponse.ok) {
          gameUserSettingsContent = await gameUserSettingsResponse.text();
          setRawGameUserSettings(gameUserSettingsContent);
          console.log('Successfully loaded GameUserSettings.ini');
        } else {
          console.warn('GameUserSettings.ini not found, will create default');
          // Try to create the file
          const createResponse = await fetch(`/api/servers/${serverId}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: 'GameUserSettings.ini',
              content: ''
            }),
          });
          if (createResponse.ok) {
            const result = await createResponse.json();
            gameUserSettingsContent = result.data?.content || '';
            setRawGameUserSettings(gameUserSettingsContent);
            console.log('Created default GameUserSettings.ini');
          } else {
            console.error('Failed to create GameUserSettings.ini');
            toast.error('Failed to create GameUserSettings.ini');
          }
        }

        if (gameIniResponse.ok) {
          gameIniContent = await gameIniResponse.text();
          setRawGameIni(gameIniContent);
          console.log('Successfully loaded Game.ini');
        } else {
          console.warn('Game.ini not found, will create default');
          // Try to create the file
          const createResponse = await fetch(`/api/servers/${serverId}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: 'Game.ini',
              content: ''
            }),
          });
          if (createResponse.ok) {
            const result = await createResponse.json();
            gameIniContent = result.data?.content || '';
            setRawGameIni(gameIniContent);
            console.log('Created default Game.ini');
          } else {
            console.error('Failed to create Game.ini');
            toast.error('Failed to create Game.ini');
          }
        }

        // Parse settings if we have content
        if (gameUserSettingsContent && gameIniContent) {
          extractSettingsFromINI(gameUserSettingsContent, gameIniContent);
        } else {
          console.warn('No content available to parse settings');
          toast.error('No configuration content available');
        }
      } catch (error) {
        console.error('Failed to load raw files:', error);
        toast.error(`Failed to load configuration files: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadRawFiles();
  }, [serverId]); // Only depend on serverId to prevent infinite loops

  const saveRawFile = async (fileType: 'GameUserSettings.ini' | 'Game.ini') => {
    try {
      const content = fileType === 'GameUserSettings.ini' ? rawGameUserSettings : rawGameIni;
      
      const response = await fetch(`/api/servers/${serverId}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: fileType,
          content: content
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save file');
      }

      toast.success(`${fileType} saved successfully`);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error(`Failed to save ${fileType}:`, error);
      toast.error(`Failed to save ${fileType}`);
    }
  };

  const saveConfiguration = async () => {
    try {
      // Collect all settings into a configuration object
      const configData: Record<string, unknown> = {};
      configSections.forEach(section => {
        section.settings.forEach(setting => {
          configData[setting.key] = setting.value;
        });
      });

      // Generate updated INI content
      const updatedGameUserSettings = generateUpdatedGameUserSettings(configData);
      const updatedGameIni = generateUpdatedGameIni(configData);

      // Save configuration using a single API call
      const response = await fetch(`/api/servers/${serverId}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configData: configData,
          gameUserSettingsContent: updatedGameUserSettings,
          gameIniContent: updatedGameIni
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      toast.success('Configuration saved successfully');
      setHasUnsavedChanges(false);
      
      // Update the raw files state to reflect changes instead of reloading
      setRawGameUserSettings(updatedGameUserSettings);
      setRawGameIni(updatedGameIni);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast.error('Failed to save configuration');
    }
  };

  const generateUpdatedGameUserSettings = (settings: Record<string, unknown>): string => {
    let content = rawGameUserSettings;
    
    // Update ServerSettings section
    const serverSettingsUpdates: [string, unknown][] = [
      ['ServerPassword', settings.serverPassword],
      ['ServerAdminPassword', settings.serverAdminPassword],
      ['SpectatorPassword', settings.spectatorPassword],
      ['RCONPort', settings.rconPort],
      ['DifficultyOffset', settings.difficultyOffset],
      ['ServerPVE', settings.serverPVE],
      ['ServerHardcore', settings.serverHardcore],
      ['ServerCrosshair', settings.serverCrosshair],
      ['ServerForceNoHUD', settings.serverForceNoHUD],
      ['AdminLogging', settings.adminLogging],
      ['AutoSavePeriodMinutes', settings.autoSavePeriodMinutes],
      ['AllowThirdPersonPlayer', settings.allowThirdPersonPlayer],
      ['AllowCaveBuildingPvE', settings.allowCaveBuildingPvE],
      ['AllowFlyerCarryPvE', settings.allowFlyerCarryPvE],
      ['PreventOfflinePvP', settings.preventOfflinePvP],
      ['PreventOfflinePvPInterval', settings.preventOfflinePvPInterval],
      ['DisableWeatherFog', settings.disableWeatherFog],
      ['RandomSupplyCratePoints', settings.randomSupplyCratePoints],
      ['DinoCountMultiplier', settings.dinoCountMultiplier],
      ['MaxTamedDinos', settings.maxTamedDinos],
      ['TheMaxStructuresInRange', settings.theMaxStructuresInRange],
      ['AlwaysAllowStructurePickup', settings.alwaysAllowStructurePickup],
      ['StructurePickupTimeAfterPlacement', settings.structurePickupTimeAfterPlacement],
      ['StructurePickupHoldDuration', settings.structurePickupHoldDuration],
      ['ForceAllowCaveFlyers', settings.forceAllowCaveFlyers],
      ['DisableStructureDecayPvE', settings.disableStructureDecayPvE],
      ['PvEStructureDecayPeriodMultiplier', settings.pveStructureDecayPeriodMultiplier],
      ['DisableDinoDecayPvE', settings.disableDinoDecayPvE],
      ['PvEDinoDecayPeriodMultiplier', settings.pveDinoDecayPeriodMultiplier],
      ['ItemStackSizeMultiplier', settings.itemStackSizeMultiplier],
      ['CropDecaySpeedMultiplier', settings.cropDecaySpeedMultiplier],
      ['CropGrowthSpeedMultiplier', settings.cropGrowthSpeedMultiplier],
      ['bAllowSpeedLeveling', settings.bAllowSpeedLeveling],
      ['bAllowFlyerSpeedLeveling', settings.bAllowFlyerSpeedLeveling],
      ['AllowAnyoneBabyImprintCuddle', settings.allowAnyoneBabyImprintCuddle],
      ['DisableImprintDinoBuff', settings.disableImprintDinoBuff],
      ['EnableExtraStructurePreventionVolumes', settings.enableExtraStructurePreventionVolumes],
      ['EnablePvPGamma', settings.enablePvPGamma],
      ['DisablePvEGamma', settings.disablePvEGamma],
      ['ShowFloatingDamageText', settings.showFloatingDamageText],
      ['ShowMapPlayerLocation', settings.showMapPlayerLocation],
      ['AllowHitMarkers', settings.allowHitMarkers],
      ['KickIdlePlayersPeriod', settings.kickIdlePlayersPeriod],
      ['CraftingSkillBonusMultiplier', settings.craftingSkillBonusMultiplier],
      ['PvPDinoDecay', settings.pvpDinoDecay],
      ['SupplyCrateLootQualityMultiplier', settings.supplyCrateLootQualityMultiplier],
      ['StructurePreventResourceRadiusMultiplier', settings.structurePreventResourceRadiusMultiplier]
    ];

    content = updateINISection(content, 'ServerSettings', serverSettingsUpdates);

    // Update SessionSettings section
    const sessionSettingsUpdates: [string, unknown][] = [
      ['SessionName', settings.sessionName]
    ];
    content = updateINISection(content, 'SessionSettings', sessionSettingsUpdates);

    // Update GameSession section
    const gameSessionUpdates: [string, unknown][] = [
      ['MaxPlayers', settings.maxPlayers]
    ];
    content = updateINISection(content, '/Script/Engine.GameSession', gameSessionUpdates);

    return content;
  };

  const generateUpdatedGameIni = (settings: Record<string, unknown>): string => {
    let content = rawGameIni;
    
    // Update GameMode section
    const gameModeUpdates: [string, unknown][] = [
      ['MaxDifficulty', settings.maxDifficulty],
      ['GenericXPMultiplier', settings.genericXPMultiplier],
      ['HarvestXPMultiplier', settings.harvestXPMultiplier],
      ['CraftXPMultiplier', settings.craftXPMultiplier],
      ['KillXPMultiplier', settings.killXPMultiplier],
      ['SpecialXPMultiplier', settings.specialXPMultiplier],
      ['PlayerHarvestingDamageMultiplier', settings.playerHarvestingDamageMultiplier],
      ['DinoHarvestingDamageMultiplier', settings.dinoHarvestingDamageMultiplier],
      ['MatingIntervalMultiplier', settings.matingIntervalMultiplier],
      ['EggHatchSpeedMultiplier', settings.eggHatchSpeedMultiplier],
      ['BabyMatureSpeedMultiplier', settings.babyMatureSpeedMultiplier],
      ['BabyCuddleIntervalMultiplier', settings.babyCuddleIntervalMultiplier],
      ['BabyFoodConsumptionSpeedMultiplier', settings.babyFoodConsumptionSpeedMultiplier],
      ['LayEggIntervalMultiplier', settings.layEggIntervalMultiplier],
      ['bUseCorpseLocator', settings.bUseCorpseLocator],
      ['bUseSingleplayerSettings', settings.bUseSingleplayerSettings],
      ['bAllowCustomRecipes', settings.bAllowCustomRecipes],
      ['bDisableStructurePlacementCollision', settings.bDisableStructurePlacementCollision],
      ['bPvEAllowTribeWar', settings.bPvEAllowTribeWar],
      ['bIncreasePvPRespawnInterval', settings.bIncreasePvPRespawnInterval],
      ['IncreasePvPRespawnIntervalBaseAmount', settings.increasePvPRespawnIntervalBaseAmount],
      ['IncreasePvPRespawnIntervalMultiplier', settings.increasePvPRespawnIntervalMultiplier],
      ['bDisableDinoRiding', settings.bDisableDinoRiding],
      ['bDisableDinoTaming', settings.bDisableDinoTaming],
      ['CustomRecipeEffectivenessMultiplier', settings.customRecipeEffectivenessMultiplier],
      ['CustomRecipeSkillMultiplier', settings.customRecipeSkillMultiplier],
      ['FuelConsumptionIntervalMultiplier', settings.fuelConsumptionIntervalMultiplier],
      ['PoopIntervalMultiplier', settings.poopIntervalMultiplier],
      ['GlobalCorpseDecompositionTimeMultiplier', settings.globalCorpseDecompositionTimeMultiplier],
      ['GlobalItemDecompositionTimeMultiplier', settings.globalItemDecompositionTimeMultiplier],
      ['GlobalSpoilingTimeMultiplier', settings.globalSpoilingTimeMultiplier],
      ['StructureDamageRepairCooldown', settings.structureDamageRepairCooldown]
    ];

    content = updateINISection(content, '/script/shootergame.shootergamemode', gameModeUpdates);

    return content;
  };

  const updateINISection = (content: string, sectionName: string, updates: [string, unknown][]): string => {
    const lines = content.split('\n');
    const updatedLines: string[] = [];
    let inTargetSection = false;
    let sectionUpdated = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Check if we're entering the target section
      if (trimmedLine === `[${sectionName}]`) {
        inTargetSection = true;
        updatedLines.push(line);
        
        // Add all updates for this section
        for (const [key, value] of updates) {
          if (value !== undefined && value !== null) {
            updatedLines.push(`${key}=${value}`);
          }
        }
        sectionUpdated = true;
        continue;
      }

      // If we're in the target section, skip existing key-value pairs that we're updating
      if (inTargetSection) {
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmedLine.substring(0, equalIndex).trim();
          const isBeingUpdated = updates.some(([updateKey]) => updateKey === key);
          if (isBeingUpdated) {
            continue; // Skip this line as we already added the updated value
          }
        }
        
        // Check if we're leaving the section (next section or end of file)
        if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']') && trimmedLine !== `[${sectionName}]`) {
          inTargetSection = false;
        }
      }

      updatedLines.push(line);
    }

    // If section wasn't found, add it at the end
    if (!sectionUpdated) {
      updatedLines.push(`[${sectionName}]`);
      for (const [key, value] of updates) {
        if (value !== undefined && value !== null) {
          updatedLines.push(`${key}=${value}`);
        }
      }
    }

    return updatedLines.join('\n');
  };

  const handleSettingChange = (sectionId: string, settingKey: string, value: unknown) => {
    // Update the parsedSettings state
    setParsedSettings(prev => ({
      ...prev,
      [settingKey]: value
    }));
    
    // Update the configSections state directly
    setConfigSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          settings: section.settings.map(setting => {
            if (setting.key === settingKey) {
              return { ...setting, value };
            }
            return setting;
          })
        };
      }
      return section;
    }));
    
    setHasUnsavedChanges(true);
    onConfigUpdate({ [settingKey]: value });
  };

  const resetToDefaults = () => {
    // Reset all settings to their default values
    configSections.forEach(section => {
      section.settings.forEach(setting => {
        handleSettingChange(section.id, setting.key, setting.defaultValue);
      });
    });
  };

  const exportConfiguration = () => {
    const configData: Record<string, any> = {};
    configSections.forEach(section => {
      section.settings.forEach(setting => {
        configData[setting.key] = setting.value;
      });
    });

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `server-config-${serverId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderSetting = (section: ConfigSection, setting: ConfigSetting) => {
    if (setting.advanced && !showAdvanced) return null;
    if (searchQuery && !setting.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !setting.description.toLowerCase().includes(searchQuery.toLowerCase())) return null;

    return (
      <div key={setting.key} className="card bg-base-100 shadow-sm border border-base-300 rounded-xl">
        <div className="card-body p-4">
          <label className="label">
            <span className="label-text text-sm font-medium">{setting.name}</span>
            {setting.restart_required && (
              <span className="badge badge-warning badge-sm">Restart Required</span>
            )}
          </label>
          <div className="space-y-2">
            {setting.type === 'string' && (
              <input
                type="text"
                className="input input-bordered w-full text-sm"
                value={String(setting.value)}
                onChange={(e) => handleSettingChange(section.id, setting.key, e.target.value)}
                placeholder={setting.description}
                aria-label={setting.name}
              />
            )}
            {setting.type === 'number' && (
              <input
                type="number"
                className="input input-bordered w-full text-sm"
                value={Number(setting.value)}
                onChange={(e) => handleSettingChange(section.id, setting.key, parseFloat(e.target.value) || 0)}
                min={setting.min}
                max={setting.max}
                step={setting.step}
                placeholder={setting.description}
                aria-label={setting.name}
              />
            )}
            {setting.type === 'boolean' && (
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={Boolean(setting.value)}
                onChange={(e) => handleSettingChange(section.id, setting.key, e.target.checked)}
                aria-label={setting.name}
              />
            )}
            {setting.type === 'select' && setting.options && (
              <select
                className="select select-bordered w-full text-sm"
                value={String(setting.value)}
                onChange={(e) => handleSettingChange(section.id, setting.key, e.target.value)}
                aria-label={setting.name}
              >
                {setting.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            <div className="text-xs text-base-content/60 mt-1">{setting.description}</div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Navigation */}
      <div className="border-b border-[#00ff00]/30">
        <div className="container mx-auto px-4">
          <div className="flex h-12">
            <button
              onClick={() => setActiveTab('config')}
              className={`inline-flex items-center px-4 h-full gap-2 border-b-2 transition-colors ${
                activeTab === 'config'
                  ? 'text-[#00ff00] border-[#00ff00] drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]'
                  : 'text-[#00ff00]/50 border-transparent hover:text-[#00ff00]/70 hover:border-[#00ff00]/30'
              }`}
            >
              <Cog6ToothIcon className="h-5 w-5" />
              <span>Configuration Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`inline-flex items-center px-4 h-full gap-2 border-b-2 transition-colors ${
                activeTab === 'raw'
                  ? 'text-[#00ff00] border-[#00ff00] drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]'
                  : 'text-[#00ff00]/50 border-transparent hover:text-[#00ff00]/70 hover:border-[#00ff00]/30'
              }`}
            >
              <DocumentTextIcon className="h-5 w-5" />
              <span>Raw Files</span>
            </button>
          </div>
        </div>
      </div>

      {/* Raw Files Subtabs */}
      {activeTab === 'raw' && (
        <div className="border-b border-[#00ff00]/30">
          <div className="container mx-auto px-4">
            <div className="flex h-12">
              <button
                onClick={() => setActiveRawTab('gameusersettings')}
                className={`inline-flex items-center px-4 h-full gap-2 border-b-2 transition-colors ${
                  activeRawTab === 'gameusersettings'
                    ? 'text-[#00ff00] border-[#00ff00] drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]'
                    : 'text-[#00ff00]/50 border-transparent hover:text-[#00ff00]/70 hover:border-[#00ff00]/30'
                }`}
              >
                <span>GameUserSettings.ini</span>
              </button>
              <button
                onClick={() => setActiveRawTab('gameini')}
                className={`inline-flex items-center px-4 h-full gap-2 border-b-2 transition-colors ${
                  activeRawTab === 'gameini'
                    ? 'text-[#00ff00] border-[#00ff00] drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]'
                    : 'text-[#00ff00]/50 border-transparent hover:text-[#00ff00]/70 hover:border-[#00ff00]/30'
                }`}
              >
                <span>Game.ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'config' ? (
          <div className="container mx-auto p-4">
            <div className="flex">
              {/* Section Navigation */}
              <div className="w-64 border-r border-[#00ff00]/30">
                <div className="flex flex-col gap-1 pr-4">
                  {configSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section.id)}
                      className={`text-left px-4 py-2 rounded transition-colors ${
                        selectedSection === section.id
                          ? 'text-[#00ff00] drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]'
                          : 'text-[#00ff00]/50 hover:text-[#00ff00]/70'
                      }`}
                    >
                      {section.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Content */}
              <div className="flex-1 pl-6">
                {configSections.map(section => (
                  <div key={section.id} className={selectedSection === section.id ? 'block' : 'hidden'}>
                    <h3 className="text-lg font-bold text-base-content mb-4 font-display tracking-wide">
                      {section.name}
                    </h3>
                    <p className="text-sm text-base-content/70 mb-6">{section.description}</p>
                    
                    <div className="space-y-6">
                      {section.settings.map(setting => renderSetting(section, setting))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto p-4">
            <div className="card border border-[#00ff00]/30 shadow-lg">
              <div className="card-body p-4">
                <div className="h-[600px] border border-[#00ff00]/30 rounded">
                  <MonacoEditor
                    height="100%"
                    language="ini"
                    theme="vs-dark"
                    value={activeRawTab === 'gameusersettings' ? rawGameUserSettings : rawGameIni}
                    onChange={(value) => {
                      if (activeRawTab === 'gameusersettings') {
                        setRawGameUserSettings(value || '');
                      } else {
                        setRawGameIni(value || '');
                      }
                      setHasUnsavedChanges(true);
                    }}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedConfigEditor; 