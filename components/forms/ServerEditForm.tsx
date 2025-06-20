import React, { useState, useEffect } from "react";
import { ServerConfig } from "../../types/server";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import {
  ArrowLeftIcon,
  CogIcon,
  PuzzlePieceIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface ServerEditFormProps {
  serverId: string;
  onSave: (config: ServerConfig) => void;
  onCancel: () => void;
}

interface ConfigSetting {
  key: string;
  name: string;
  type: "string" | "number" | "boolean";
  value: any;
  default: any;
  file: string;
  section: string;
  description?: string;
}

interface TabConfig {
  id: string;
  label: string;
  icon: string;
  subtabs?: TabConfig[];
}

const ServerEditForm: React.FC<ServerEditFormProps> = ({
  serverId,
  onSave,
  onCancel,
}) => {
  const [activeMainTab, setActiveMainTab] = useState("general");
  const [activeSubTab, setActiveSubTab] = useState("basic");
  const [rawGameUserSettings, setRawGameUserSettings] = useState("");
  const [rawGameIni, setRawGameIni] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [configSettings, setConfigSettings] = useState<
    Record<string, ConfigSetting[]>
  >({});
  const [launchOptions, setLaunchOptions] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [iniFilesExist, setIniFilesExist] = useState({
    gameIni: true,
    gameUserSettings: true,
  });
  const router = useRouter();

  // Main tab structure
  const mainTabs: TabConfig[] = [
    {
      id: "general",
      label: "General",
      icon: "⚙️",
      subtabs: [
        { id: "basic", label: "Basic Settings", icon: "📋" },
        { id: "gameplay", label: "Gameplay", icon: "🎮" },
        { id: "difficulty", label: "Difficulty", icon: "⚔️" },
        { id: "pvp", label: "PvP/PvE", icon: "🛡️" },
      ],
    },
    {
      id: "rates",
      label: "Rates & Multipliers",
      icon: "📊",
      subtabs: [
        { id: "xp", label: "Experience", icon: "✨" },
        { id: "harvest", label: "Harvesting", icon: "⛏️" },
        { id: "taming", label: "Taming", icon: "🦕" },
        { id: "breeding", label: "Breeding", icon: "🥚" },
      ],
    },
    {
      id: "structures",
      label: "Structures & Items",
      icon: "🏗️",
      subtabs: [
        { id: "building", label: "Building", icon: "🏠" },
        { id: "decay", label: "Decay Timers", icon: "⏰" },
        { id: "inventory", label: "Inventory", icon: "🎒" },
      ],
    },
    {
      id: "creatures",
      label: "Creatures",
      icon: "🦖",
      subtabs: [
        { id: "spawns", label: "Spawns", icon: "🌍" },
        { id: "stats", label: "Stats", icon: "💪" },
        { id: "behavior", label: "Behavior", icon: "🧠" },
      ],
    },
    {
      id: "launch",
      label: "Launch Options",
      icon: "🚀",
    },
    {
      id: "cluster",
      label: "Cluster Settings",
      icon: "🌐",
    },
    {
      id: "raw",
      label: "Raw Files",
      icon: "📝",
      subtabs: [
        { id: "gameusersettings", label: "GameUserSettings.ini", icon: "📄" },
        { id: "gameini", label: "Game.ini", icon: "🎯" },
      ],
    },
  ];

  // Comprehensive settings organized by category
  const configCategories: Record<string, ConfigSetting[]> = {
    "general-basic": [
      {
        key: "sessionName",
        name: "Server Name",
        type: "string",
        value: "",
        default: "My Ark Server",
        file: "GameUserSettings.ini",
        section: "SessionSettings",
        description:
          "The name of your server as it appears in the server browser",
      },
      {
        key: "maxPlayers",
        name: "Max Players",
        type: "number",
        value: 70,
        default: 70,
        file: "GameUserSettings.ini",
        section: "/Script/Engine.GameSession",
        description: "Maximum number of players allowed on the server",
      },
      {
        key: "serverPassword",
        name: "Server Password",
        type: "string",
        value: "",
        default: "",
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description:
          "Password required to join the server (leave empty for public)",
      },
      {
        key: "serverAdminPassword",
        name: "Admin Password",
        type: "string",
        value: "",
        default: "",
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Password for admin commands and remote administration",
      },
      {
        key: "spectatorPassword",
        name: "Spectator Password",
        type: "string",
        value: "",
        default: "",
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Password for spectator mode access",
      },
      {
        key: "rconPort",
        name: "RCON Port",
        type: "number",
        value: 27420,
        default: 27420,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Port for remote console connections",
      },
      {
        key: "autoSavePeriodMinutes",
        name: "Auto Save Period (Minutes)",
        type: "number",
        value: 15,
        default: 15,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "How often the server saves the world state",
      },
    ],
    "general-gameplay": [
      {
        key: "difficultyOffset",
        name: "Difficulty Offset",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Affects max wild creature level (0.01-1.0)",
      },
      {
        key: "maxDifficulty",
        name: "Max Difficulty",
        type: "boolean",
        value: false,
        default: false,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "Enable max difficulty (level 150 wild dinos)",
      },
      {
        key: "allowThirdPersonPlayer",
        name: "Allow Third Person",
        type: "boolean",
        value: true,
        default: true,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Allow players to use third person view",
      },
      {
        key: "globalVoiceChat",
        name: "Global Voice Chat",
        type: "boolean",
        value: true,
        default: true,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Enable server-wide voice chat",
      },
      {
        key: "proximityChat",
        name: "Proximity Chat",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Limit voice chat to nearby players only",
      },
      {
        key: "bUseCorpseLocator",
        name: "Use Corpse Locator",
        type: "boolean",
        value: true,
        default: true,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "Show green beam at death location",
      },
      {
        key: "bUseSingleplayerSettings",
        name: "Use Singleplayer Settings",
        type: "boolean",
        value: false,
        default: false,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "Apply singleplayer balance settings",
      },
    ],
    "general-difficulty": [
      {
        key: "serverHardcore",
        name: "Hardcore Mode",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Permanent character death",
      },
      {
        key: "disableWeatherFog",
        name: "Disable Weather Fog",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Remove fog weather effects",
      },
      {
        key: "randomSupplyCratePoints",
        name: "Random Supply Crate Points",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Randomize supply drop locations",
      },
    ],
    "general-pvp": [
      {
        key: "serverPVE",
        name: "PvE Mode",
        type: "boolean",
        value: true,
        default: true,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Enable PvE mode (no player vs player damage)",
      },
      {
        key: "allowCaveBuildingPvE",
        name: "Allow Cave Building (PvE)",
        type: "boolean",
        value: true,
        default: true,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Allow building in caves on PvE servers",
      },
      {
        key: "allowFlyerCarryPvE",
        name: "Allow Flyer Carry PvE",
        type: "boolean",
        value: true,
        default: true,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Allow flyers to carry players/dinos in PvE",
      },
      {
        key: "preventOfflinePvP",
        name: "Prevent Offline PvP",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Prevent damage to offline players structures",
      },
      {
        key: "preventOfflinePvPInterval",
        name: "Offline PvP Interval (seconds)",
        type: "number",
        value: 300,
        default: 300,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Time after logout before offline protection",
      },
    ],
    "rates-xp": [
      {
        key: "genericXPMultiplier",
        name: "Generic XP Multiplier",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "General experience gain multiplier",
      },
      {
        key: "harvestXPMultiplier",
        name: "Harvest XP Multiplier",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "XP from harvesting resources",
      },
      {
        key: "craftXPMultiplier",
        name: "Craft XP Multiplier",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "XP from crafting items",
      },
      {
        key: "killXPMultiplier",
        name: "Kill XP Multiplier",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "XP from killing creatures",
      },
      {
        key: "specialXPMultiplier",
        name: "Special XP Multiplier",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "XP from special actions",
      },
    ],
    "rates-harvest": [
      {
        key: "harvestAmountMultiplier",
        name: "Harvest Amount Multiplier",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Resources gained per harvest action",
      },
      {
        key: "harvestHealthMultiplier",
        name: "Harvest Health Multiplier",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Health of harvestable objects",
      },
      {
        key: "resourcesRespawnPeriodMultiplier",
        name: "Resource Respawn Period",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Time for resources to respawn (lower = faster)",
      },
      {
        key: "playerHarvestingDamageMultiplier",
        name: "Player Harvesting Damage",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "Player damage to harvestable objects",
      },
      {
        key: "dinoHarvestingDamageMultiplier",
        name: "Dino Harvesting Damage",
        type: "number",
        value: 3.2,
        default: 3.2,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "Dino damage to harvestable objects",
      },
    ],
    "rates-taming": [
      {
        key: "tamingSpeedMultiplier",
        name: "Taming Speed Multiplier",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Speed of taming process",
      },
      {
        key: "dinoCharacterFoodDrainMultiplier",
        name: "Dino Food Drain",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Rate dinos consume food",
      },
      {
        key: "passiveTameIntervalMultiplier",
        name: "Passive Tame Interval",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "Time between passive tame feedings",
      },
    ],
    "rates-breeding": [
      {
        key: "matingIntervalMultiplier",
        name: "Mating Interval Multiplier",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "Time between mating",
      },
      {
        key: "eggHatchSpeedMultiplier",
        name: "Egg Hatch Speed",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "Speed eggs hatch",
      },
      {
        key: "babyMatureSpeedMultiplier",
        name: "Baby Mature Speed",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "Speed babies grow up",
      },
      {
        key: "babyCuddleIntervalMultiplier",
        name: "Baby Cuddle Interval",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "Time between imprinting",
      },
      {
        key: "babyFoodConsumptionSpeedMultiplier",
        name: "Baby Food Consumption",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "Rate babies consume food",
      },
      {
        key: "layEggIntervalMultiplier",
        name: "Lay Egg Interval",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "Time between egg laying",
      },
      {
        key: "allowAnyoneBabyImprintCuddle",
        name: "Anyone Can Imprint",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Allow any tribe member to imprint",
      },
    ],
    "structures-building": [
      {
        key: "structureResistanceMultiplier",
        name: "Structure Resistance",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Damage resistance of structures",
      },
      {
        key: "structureDamageMultiplier",
        name: "Structure Damage",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Damage dealt to structures",
      },
      {
        key: "theMaxStructuresInRange",
        name: "Max Structures In Range",
        type: "number",
        value: 10500,
        default: 10500,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Build limit in an area",
      },
      {
        key: "alwaysAllowStructurePickup",
        name: "Always Allow Pickup",
        type: "boolean",
        value: true,
        default: true,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Allow picking up structures anytime",
      },
      {
        key: "structurePickupTimeAfterPlacement",
        name: "Pickup Time After Placement",
        type: "number",
        value: 30,
        default: 30,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Seconds to pickup after placing",
      },
      {
        key: "structurePickupHoldDuration",
        name: "Pickup Hold Duration",
        type: "number",
        value: 0.5,
        default: 0.5,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Hold time to pickup structures",
      },
      {
        key: "bDisableStructurePlacementCollision",
        name: "Disable Placement Collision",
        type: "boolean",
        value: false,
        default: false,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "Allow structures to clip",
      },
      {
        key: "forceAllowCaveFlyers",
        name: "Force Allow Cave Flyers",
        type: "boolean",
        value: true,
        default: true,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Allow flyers in caves",
      },
    ],
    "structures-decay": [
      {
        key: "disableStructureDecayPvE",
        name: "Disable Structure Decay PvE",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Turn off structure decay in PvE",
      },
      {
        key: "pveStructureDecayPeriodMultiplier",
        name: "PvE Structure Decay Period",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Time before structures decay",
      },
      {
        key: "pveStructureDecayDestructionPeriod",
        name: "Structure Destruction Period",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Time decayed structures can be destroyed",
      },
      {
        key: "autoDestroyOldStructuresMultiplier",
        name: "Auto Destroy Old Structures",
        type: "number",
        value: 0,
        default: 0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Auto cleanup old structures",
      },
      {
        key: "disableDinoDecayPvE",
        name: "Disable Dino Decay PvE",
        type: "boolean",
        value: true,
        default: true,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Turn off dino decay in PvE",
      },
      {
        key: "pveDinoDecayPeriodMultiplier",
        name: "PvE Dino Decay Period",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Time before dinos decay",
      },
    ],
    "structures-inventory": [
      {
        key: "itemStackSizeMultiplier",
        name: "Stack Size Multiplier",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Multiplier for item stack sizes",
      },
      {
        key: "bAllowCustomRecipes",
        name: "Allow Custom Recipes",
        type: "boolean",
        value: true,
        default: true,
        file: "Game.ini",
        section: "/script/shootergame.shootergamemode",
        description: "Enable custom cooking recipes",
      },
      {
        key: "cropDecaySpeedMultiplier",
        name: "Crop Decay Speed",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Rate crops decay when not watered",
      },
      {
        key: "cropGrowthSpeedMultiplier",
        name: "Crop Growth Speed",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Speed crops grow",
      },
    ],
    "creatures-spawns": [
      {
        key: "dinoCountMultiplier",
        name: "Dino Count Multiplier",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Multiplier for wild dino spawns",
      },
      {
        key: "maxTamedDinos",
        name: "Max Tamed Dinos",
        type: "number",
        value: 5000,
        default: 5000,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Server-wide tamed dino limit",
      },
      {
        key: "maxPersonalTamedDinos",
        name: "Max Personal Tamed Dinos",
        type: "number",
        value: 500,
        default: 500,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Per-tribe tamed dino limit",
      },
      {
        key: "ForceRespawnDinos",
        name: "Force Respawn Dinos",
        type: "boolean",
        value: false,
        default: false,
        file: "Launch",
        section: "Launch Options",
        description: "Force wild dino respawn on server start",
      },
    ],
    "creatures-stats": [
      {
        key: "dinoDamageMultiplier",
        name: "Dino Damage Multiplier",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Wild dino damage",
      },
      {
        key: "tamedDinoDamageMultiplier",
        name: "Tamed Dino Damage",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Tamed dino damage",
      },
      {
        key: "dinoResistanceMultiplier",
        name: "Dino Resistance",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Wild dino damage resistance",
      },
      {
        key: "tamedDinoResistanceMultiplier",
        name: "Tamed Dino Resistance",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Tamed dino damage resistance",
      },
      {
        key: "dinoCharacterHealthRecoveryMultiplier",
        name: "Dino Health Recovery",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Dino health regeneration rate",
      },
      {
        key: "dinoCharacterStaminaDrainMultiplier",
        name: "Dino Stamina Drain",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Rate dinos use stamina",
      },
    ],
    "creatures-behavior": [
      {
        key: "preventMateBoost",
        name: "Prevent Mate Boost",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Disable mate boost buff",
      },
      {
        key: "allowRaidDinoFeeding",
        name: "Allow Raid Dino Feeding",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Allow feeding raid dinos",
      },
      {
        key: "raidDinoCharacterFoodDrainMultiplier",
        name: "Raid Dino Food Drain",
        type: "number",
        value: 1.0,
        default: 1.0,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Titanosaur food consumption",
      },
    ],
    launch: [
      {
        key: "USEALLAVAILABLECORES",
        name: "Use All Available Cores",
        type: "boolean",
        value: false,
        default: false,
        file: "Launch",
        section: "Launch Options",
        description: "Use all CPU cores for better performance",
      },
      {
        key: "lowmemory",
        name: "Low Memory Mode",
        type: "boolean",
        value: false,
        default: false,
        file: "Launch",
        section: "Launch Options",
        description: "Reduce memory usage for systems with limited RAM",
      },
      {
        key: "NoCrashDialog",
        name: "No Crash Dialog",
        type: "boolean",
        value: false,
        default: false,
        file: "Launch",
        section: "Launch Options",
        description: "Disable crash dialogs for automatic restarts",
      },
      {
        key: "crossplay",
        name: "Enable Crossplay",
        type: "boolean",
        value: false,
        default: false,
        file: "Launch",
        section: "Launch Options",
        description: "Allow PC and console players together",
      },
      {
        key: "preventhibernation",
        name: "Prevent Hibernation",
        type: "boolean",
        value: false,
        default: false,
        file: "Launch",
        section: "Launch Options",
        description: "Keep server active when no players online",
      },
      {
        key: "automanagedmods",
        name: "Auto-Managed Mods",
        type: "boolean",
        value: false,
        default: false,
        file: "Launch",
        section: "Launch Options",
        description: "Automatically download and update mods",
      },
      {
        key: "UseBattlEye",
        name: "Use BattlEye",
        type: "boolean",
        value: false,
        default: false,
        file: "Launch",
        section: "Launch Options",
        description: "Enable BattlEye anti-cheat",
      },
      {
        key: "NoBattlEye",
        name: "No BattlEye",
        type: "boolean",
        value: false,
        default: false,
        file: "Launch",
        section: "Launch Options",
        description: "Disable BattlEye anti-cheat",
      },
      {
        key: "StasisKeepControllers",
        name: "Stasis Keep Controllers",
        type: "boolean",
        value: false,
        default: false,
        file: "Launch",
        section: "Launch Options",
        description: "Keep AI controllers active in stasis",
      },
      {
        key: "NoHangDetection",
        name: "No Hang Detection",
        type: "boolean",
        value: false,
        default: false,
        file: "Launch",
        section: "Launch Options",
        description: "Disable server hang detection",
      },
      {
        key: "nomanssky",
        name: "No Mans Sky",
        type: "boolean",
        value: false,
        default: false,
        file: "Launch",
        section: "Launch Options",
        description: "Disable sky effects for performance",
      },
      {
        key: "disablemodchecks",
        name: "Disable Mod Checks",
        type: "boolean",
        value: false,
        default: false,
        file: "Launch",
        section: "Launch Options",
        description: "Skip mod validation on startup",
      },
      {
        key: "UseDynamicConfig",
        name: "Use Dynamic Config",
        type: "boolean",
        value: false,
        default: false,
        file: "Launch",
        section: "Launch Options",
        description: "Enable dynamic configuration updates",
      },
    ],
    cluster: [
      {
        key: "clusterID",
        name: "Cluster ID",
        type: "string",
        value: "",
        default: "",
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Unique cluster identifier",
      },
      {
        key: "clusterDirOverride",
        name: "Cluster Directory Override",
        type: "string",
        value: "",
        default: "",
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Custom cluster save directory",
      },
      {
        key: "noTributeDownloads",
        name: "No Tribute Downloads",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Disable all downloads from obelisks",
      },
      {
        key: "preventDownloadSurvivors",
        name: "Prevent Download Survivors",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Block character transfers",
      },
      {
        key: "preventDownloadItems",
        name: "Prevent Download Items",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Block item transfers",
      },
      {
        key: "preventDownloadDinos",
        name: "Prevent Download Dinos",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Block dino transfers",
      },
      {
        key: "preventUploadSurvivors",
        name: "Prevent Upload Survivors",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Block character uploads",
      },
      {
        key: "preventUploadItems",
        name: "Prevent Upload Items",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Block item uploads",
      },
      {
        key: "preventUploadDinos",
        name: "Prevent Upload Dinos",
        type: "boolean",
        value: false,
        default: false,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Block dino uploads",
      },
      {
        key: "maxTributeItems",
        name: "Max Tribute Items",
        type: "number",
        value: 150,
        default: 150,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Max items in tribute inventory",
      },
      {
        key: "maxTributeDinos",
        name: "Max Tribute Dinos",
        type: "number",
        value: 20,
        default: 20,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Max dinos in tribute inventory",
      },
      {
        key: "maxTributeCharacters",
        name: "Max Tribute Characters",
        type: "number",
        value: 10,
        default: 10,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Max characters in tribute inventory",
      },
      {
        key: "tributeItemExpirationSeconds",
        name: "Tribute Item Expiration (seconds)",
        type: "number",
        value: 86400,
        default: 86400,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Time before tribute items expire",
      },
      {
        key: "tributeDinoExpirationSeconds",
        name: "Tribute Dino Expiration (seconds)",
        type: "number",
        value: 86400,
        default: 86400,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Time before tribute dinos expire",
      },
      {
        key: "tributeCharacterExpirationSeconds",
        name: "Tribute Character Expiration (seconds)",
        type: "number",
        value: 86400,
        default: 86400,
        file: "GameUserSettings.ini",
        section: "ServerSettings",
        description: "Time before tribute characters expire",
      },
    ],
  };

  useEffect(() => {
    const loadServerConfig = async () => {
      try {
        const response = await fetch(`/api/servers/${serverId}/config`);
        if (response.ok) {
          const { data } = await response.json();

          // Load launch options from persistent storage
          if (data.launchOptions) {
            // Handle new format - object with launch options
            if (
              typeof data.launchOptions === "object" &&
              data.launchOptions.mods
            ) {
              const modIds = data.launchOptions.mods;
              setLaunchOptions(
                modIds.length > 0 ? `-mods=${modIds.join(",")}` : ""
              );
            } else if (Array.isArray(data.launchOptions)) {
              // Handle legacy format - array of strings
              const modsOption = data.launchOptions.find((opt: string) =>
                opt.startsWith("-mods=")
              );
              setLaunchOptions(modsOption || "");
            }

            // Load launch option settings into config
            const updatedLaunchSettings = configCategories.launch.map(
              (setting) => ({
                ...setting,
                value:
                  data.launchOptions[setting.key] !== undefined
                    ? data.launchOptions[setting.key]
                    : setting.default,
              })
            );

            setConfigSettings((prev) => ({
              ...prev,
              launch: updatedLaunchSettings,
            }));
          }

          // Load INI files
          if (data.gameUserSettings) {
            setRawGameUserSettings(data.gameUserSettings);
            parseAndPopulateSettings(
              data.gameUserSettings,
              data.gameIni || "",
              data.launchOptions
            );
          }
          if (data.gameIni) {
            setRawGameIni(data.gameIni);
          }
          setIniFilesExist({
            gameUserSettings: !!data.gameUserSettings,
            gameIni: !!data.gameIni,
          });
        } else {
          initializeEmptyConfig();
        }
      } catch (error) {
        console.error("Failed to load server config:", error);
        initializeEmptyConfig();
      }
      setIsLoading(false);
    };

    loadServerConfig();
  }, [serverId]);

  const initializeEmptyConfig = () => {
    // Initialize all config categories with empty values
    const emptyCategories = Object.entries(configCategories).reduce(
      (acc, [key, category]) => {
        acc[key] = category.map((setting) => ({
          ...setting,
          value:
            setting.default ||
            (setting.type === "boolean"
              ? false
              : setting.type === "number"
                ? 0
                : ""),
        }));
        return acc;
      },
      {} as Record<string, ConfigSetting[]>
    );

    setConfigSettings(emptyCategories);
    setLaunchOptions("");
  };

  const parseAndPopulateSettings = (
    gameUserSettingsContent: string,
    gameIniContent: string,
    launchOptions?: any
  ) => {
    // Parse INI files and populate settings
    const updatedCategories = { ...configCategories };

    // Parse GameUserSettings.ini
    const gameUserSettingsSections = parseINIString(gameUserSettingsContent);

    // Parse Game.ini
    const gameIniSections = parseINIString(gameIniContent);

    // Update config settings with parsed values
    Object.entries(updatedCategories).forEach(
      ([categoryKey, categorySettings]) => {
        updatedCategories[categoryKey] = categorySettings.map((setting) => {
          let value = setting.default;

          // Find value in appropriate INI file
          if (setting.file === "GameUserSettings.ini") {
            const section = gameUserSettingsSections[setting.section];
            if (section && section[setting.key] !== undefined) {
              value = section[setting.key];
            }
          } else if (setting.file === "Game.ini") {
            const section = gameIniSections[setting.section];
            if (section && section[setting.key] !== undefined) {
              value = section[setting.key];
            }
          } else if (setting.file === "Launch" && launchOptions) {
            // Load launch options from persistent storage
            if (launchOptions[setting.key] !== undefined) {
              value = launchOptions[setting.key];
            }
          }

          return {
            ...setting,
            value: value,
          };
        });
      }
    );

    setConfigSettings(updatedCategories);
  };

  const parseINIString = (
    content: string
  ): Record<string, Record<string, any>> => {
    const sections: Record<string, Record<string, any>> = {};
    let currentSection = "";

    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith(";") || trimmed.startsWith("#")) {
        continue;
      }

      // Section header
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        currentSection = trimmed.slice(1, -1);
        sections[currentSection] = {};
        continue;
      }

      // Key-value pair
      if (currentSection && trimmed.includes("=")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=").trim();

        // Parse value to appropriate type
        let parsedValue: any = value;
        if (value.toLowerCase() === "true") parsedValue = true;
        else if (value.toLowerCase() === "false") parsedValue = false;
        else if (/^\d+\.?\d*$/.test(value)) {
          parsedValue = value.includes(".")
            ? parseFloat(value)
            : parseInt(value);
        }

        sections[currentSection][key.trim()] = parsedValue;
      }
    }

    return sections;
  };

  const handleSettingChange = (key: string, value: any) => {
    // Update the specific setting in configSettings
    setConfigSettings((prev) => {
      const updated = { ...prev };

      // Find and update the setting
      Object.entries(updated).forEach(([categoryKey, categorySettings]) => {
        const settingIndex = categorySettings.findIndex((s) => s.key === key);
        if (settingIndex !== -1) {
          updated[categoryKey] = [...categorySettings];
          updated[categoryKey][settingIndex] = {
            ...updated[categoryKey][settingIndex],
            value: value,
          };
        }
      });

      return updated;
    });

    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);

    // Auto-save launch options when they change
    if (configSettings.launch?.some((setting) => setting.key === key)) {
      saveLaunchOptionChange(key, value);
    }
  };

  const saveLaunchOptionChange = async (key: string, value: any) => {
    try {
      await fetch(`/api/servers/${serverId}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          launchOptionKey: key,
          launchOptionValue: value,
        }),
      });
    } catch (error) {
      console.error("Failed to save launch option:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Collect launch options from config settings
      const launchOptionsConfig: any = {};

      // Get launch options from the launch category
      if (configSettings.launch) {
        configSettings.launch.forEach((setting) => {
          launchOptionsConfig[setting.key] = setting.value;
        });
      }

      // Extract mods from launch options text
      const modsMatch = launchOptions.match(/-mods=([^,\s]+)/);
      if (modsMatch) {
        launchOptionsConfig.mods = modsMatch[1]
          .split(",")
          .filter((id) => id.trim());
      } else {
        launchOptionsConfig.mods = [];
      }

      // Save launch options to persistent storage
      await fetch(`/api/servers/${serverId}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          launchOptions: launchOptionsConfig,
        }),
      });

      // Save INI files if in raw mode
      if (activeMainTab === "raw") {
        await saveRawFile(
          activeSubTab === "gameusersettings"
            ? "GameUserSettings.ini"
            : "Game.ini"
        );
      } else {
        // Save settings
        const currentSettings = getCurrentSettings();
        await fetch(`/api/servers/${serverId}/config`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentSettings),
        });
      }

      setHasUnsavedChanges(false);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    }
    setIsSaving(false);
  };

  const generateINIContent = (fileName: string): string => {
    const sections: Record<string, Record<string, any>> = {};

    // Collect all settings for this file
    Object.values(configSettings).forEach((categorySettings) => {
      categorySettings.forEach((setting) => {
        if (setting.file === fileName) {
          if (!sections[setting.section]) {
            sections[setting.section] = {};
          }
          sections[setting.section][setting.key] = setting.value;
        }
      });
    });

    // Build INI content
    let content = "";
    Object.entries(sections).forEach(([sectionName, sectionSettings]) => {
      content += `[${sectionName}]\n`;
      Object.entries(sectionSettings).forEach(([key, value]) => {
        content += `${key}=${value}\n`;
      });
      content += "\n";
    });

    return content;
  };

  const saveRawFile = async (fileType: "GameUserSettings.ini" | "Game.ini") => {
    try {
      const content =
        fileType === "GameUserSettings.ini" ? rawGameUserSettings : rawGameIni;
      const response = await fetch(
        `/api/servers/${serverId}/config?file=${fileType}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );

      if (response.ok) {
        setHasUnsavedChanges(false);
        toast.success(`${fileType} saved successfully!`);
      } else {
        toast.error(`Failed to save ${fileType}`);
      }
    } catch (error) {
      console.error(`Failed to save ${fileType}:`, error);
      toast.error(`Failed to save ${fileType}`);
    }
  };

  const getCurrentSettings = () => {
    const currentKey =
      activeMainTab === "launch" || activeMainTab === "cluster"
        ? activeMainTab
        : `${activeMainTab}-${activeSubTab}`;
    return configCategories[currentKey] || [];
  };

  const filteredSettings = getCurrentSettings().filter(
    (setting) =>
      searchTerm === "" ||
      setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateIniFiles = async () => {
    setIsGenerating(true);

    try {
      // Generate default INI file content based on current settings
      const gameUserSettingsContent = generateGameUserSettingsContent();
      const gameIniContent = generateGameIniContent();

      // Save both files
      const promises = [];

      if (!iniFilesExist.gameUserSettings) {
        promises.push(
          fetch(`/api/servers/${serverId}/config?file=GameUserSettings.ini`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: gameUserSettingsContent }),
          })
        );
      }

      if (!iniFilesExist.gameIni) {
        promises.push(
          fetch(`/api/servers/${serverId}/config?file=Game.ini`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: gameIniContent }),
          })
        );
      }

      await Promise.all(promises);

      // Update files exist state
      setIniFilesExist({ gameIni: true, gameUserSettings: true });

      // Reload server config
      window.location.reload();

      toast.success("Configuration files generated successfully!");
    } catch (error) {
      console.error("Error generating config files:", error);
      toast.error("Failed to generate configuration files");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateGameUserSettingsContent = () => {
    // Generate default GameUserSettings.ini content
    const sections: Record<string, Record<string, any>> = {
      ServerSettings: {},
      SessionSettings: {},
      "/Script/Engine.GameSession": {},
      ScalabilityGroups: {},
    };

    // Process all settings and organize by section
    Object.values(configCategories).forEach((categorySettings) => {
      categorySettings.forEach((setting) => {
        if (setting.file === "GameUserSettings.ini") {
          if (!sections[setting.section]) {
            sections[setting.section] = {};
          }
          sections[setting.section][setting.key] =
            setting.value || setting.default;
        }
      });
    });

    // Build INI content
    let content = "";
    Object.entries(sections).forEach(([section, settings]) => {
      if (Object.keys(settings).length > 0) {
        content += `[${section}]\n`;
        Object.entries(settings).forEach(([key, value]) => {
          content += `${key}=${value}\n`;
        });
        content += "\n";
      }
    });

    return content;
  };

  const generateGameIniContent = () => {
    // Generate default Game.ini content
    const sections: Record<string, Record<string, any>> = {
      "/script/shootergame.shootergamemode": {},
    };

    // Process all settings and organize by section
    Object.values(configCategories).forEach((categorySettings) => {
      categorySettings.forEach((setting) => {
        if (setting.file === "Game.ini") {
          if (!sections[setting.section]) {
            sections[setting.section] = {};
          }
          sections[setting.section][setting.key] =
            setting.value || setting.default;
        }
      });
    });

    // Build INI content
    let content = "";
    Object.entries(sections).forEach(([section, settings]) => {
      if (Object.keys(settings).length > 0) {
        content += `[${section}]\n`;
        Object.entries(settings).forEach(([key, value]) => {
          content += `${key}=${value}\n`;
        });
        content += "\n";
      }
    });

    return content;
  };

  const handleTabChange = (tabId: string) => {
    setActiveMainTab(tabId);
    if (tabId === "general") {
      setActiveSubTab("gameusersettings");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-base-content">Loading server configuration...</p>
        </div>
      </div>
    );
  }

  const renderSettingInput = (setting: ConfigSetting) => {
    const value = settings[setting.key] ?? setting.default;

    return (
      <div key={setting.key} className="mb-4">
        <div className="text-[#00ff00]/70 font-mono mb-1">
          {setting.name.toUpperCase()}:
        </div>
        {setting.type === "boolean" ? (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) =>
                handleSettingChange(setting.key, e.target.checked)
              }
              className="checkbox checkbox-primary border-[#00ff00]/30"
            />
            <span className="text-[#00ff00] text-sm font-mono">
              {setting.description}
            </span>
          </label>
        ) : (
          <>
            <input
              type={setting.type === "number" ? "number" : "text"}
              value={value}
              onChange={(e) =>
                handleSettingChange(
                  setting.key,
                  setting.type === "number"
                    ? parseFloat(e.target.value)
                    : e.target.value
                )
              }
              className="w-full bg-black/50 border border-[#00ff00]/30 hover:border-[#00ff00]/50 focus:border-[#00ff00] text-[#00ff00] font-mono p-2 rounded"
              placeholder={`Enter ${setting.name.toLowerCase()}`}
            />
            {setting.description && (
              <p className="text-xs text-[#00ff00]/50 mt-1 font-mono">
                {setting.description}
              </p>
            )}
          </>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (activeMainTab === "raw") {
      return (
        <div className="space-y-4">
          <div className="card bg-black border border-[#00ff00]/30 shadow-lg">
            <div className="card-body p-4">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg font-bold text-[#00ff00] drop-shadow-[0_0_10px_rgba(0,255,0,0.5)] font-mono tracking-wider">
                  {activeSubTab === "gameusersettings"
                    ? "GAMEUSERSETTINGS.INI"
                    : "GAME.INI"}
                </h3>
              </div>

              <div className="h-[600px] border border-[#00ff00]/30 rounded">
                <MonacoEditor
                  height="100%"
                  language="ini"
                  theme="vs-dark"
                  value={
                    activeSubTab === "gameusersettings"
                      ? rawGameUserSettings
                      : rawGameIni
                  }
                  onChange={(value) => {
                    if (activeSubTab === "gameusersettings") {
                      setRawGameUserSettings(value || "");
                    } else {
                      setRawGameIni(value || "");
                    }
                    setHasUnsavedChanges(true);
                  }}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    fontFamily: "monospace",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    const currentSettings =
      configCategories[`${activeMainTab}-${activeSubTab}`] || [];

    return (
      <div className="space-y-4">
        <div className="card bg-black border border-[#00ff00]/30 shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-bold text-[#00ff00] drop-shadow-[0_0_10px_rgba(0,255,0,0.5)] font-mono tracking-wider">
                {mainTabs
                  .find((t) => t.id === activeMainTab)
                  ?.label.toUpperCase()}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentSettings.map((setting) => renderSettingInput(setting))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-base-100 text-base-content">
      {/* Sidebar */}
      <div className="w-64 bg-base-200 shadow-xl border-r border-base-300">
        <div className="p-4 border-b border-base-300">
          <h2 className="text-xl font-bold text-base-content font-display tracking-wide">
            Configuration
          </h2>
          <p className="text-sm text-base-content/60 mt-1 font-mono">
            Server ID: {serverId}
          </p>
        </div>

        {/* Header */}
        <div className="bg-black border-b border-[#00ff00]/30">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/servers/${serverId}`)}
                className="text-[#00ff00] hover:text-[#00ff00]/70 transition-colors"
                aria-label="Back to server dashboard"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-[#00ff00] drop-shadow-[0_0_10px_rgba(0,255,0,0.5)] font-mono">
                  Edit Server
                </h1>
                <p className="text-[#00ff00]/70 font-mono">
                  Server ID: {serverId}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-black border-b border-[#00ff00]/30">
          <div className="container mx-auto px-4">
            <div className="flex h-12">
              <button
                onClick={() => handleTabChange("general")}
                className={`btn btn-ghost btn-sm ${
                  activeMainTab === "general" ? "btn-active" : ""
                }`}
              >
                <CogIcon className="h-4 w-4" />
                <span>General</span>
              </button>
              <button
                onClick={() => handleTabChange("mods")}
                className={`btn btn-ghost btn-sm ${
                  activeMainTab === "mods" ? "btn-active" : ""
                }`}
              >
                <PuzzlePieceIcon className="h-4 w-4" />
                <span>Mods</span>
              </button>
              <button
                onClick={() => handleTabChange("cluster")}
                className={`btn btn-ghost btn-sm ${
                  activeMainTab === "cluster" ? "btn-active" : ""
                }`}
              >
                <GlobeAltIcon className="h-4 w-4" />
                <span>Cluster</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-base-200 border-b border-base-300 px-6 py-4 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-base-content font-display tracking-wide">
                {activeMainTab === "raw"
                  ? "Raw Configuration Files"
                  : mainTabs.find((t) => t.id === activeMainTab)?.label ||
                    "Settings"}
              </h1>
              <p className="text-sm text-base-content/60 mt-1 font-mono">
                {activeMainTab === "raw" &&
                  activeSubTab === "gameusersettings" &&
                  "Edit GameUserSettings.ini directly"}
                {activeMainTab === "raw" &&
                  activeSubTab === "gameini" &&
                  "Edit Game.ini directly"}
                {activeMainTab !== "raw" &&
                  `Configure ${mainTabs.find((t) => t.id === activeMainTab)?.label.toLowerCase()} settings`}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Generate Button - Show only if INI files don't exist */}
              {(!iniFilesExist.gameIni || !iniFilesExist.gameUserSettings) && (
                <button
                  onClick={generateIniFiles}
                  disabled={isGenerating}
                  className="btn btn-success btn-sm"
                >
                  {isGenerating ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Generating...
                    </>
                  ) : (
                    "Generate Config Files"
                  )}
                </button>
              )}

              {/* Save/Cancel Buttons */}
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className={`btn btn-sm ${
                  hasUnsavedChanges ? "btn-primary" : "btn-disabled"
                }`}
              >
                {hasUnsavedChanges ? "Save Changes" : "No Changes"}
              </button>
              <button onClick={onCancel} className="btn btn-outline btn-sm">
                Close
              </button>

              {/* Search Box */}
              {activeMainTab !== "raw" && (
                <div className="form-control">
                  <div className="relative">
                    <label htmlFor="settingsSearch" className="sr-only">
                      Search settings
                    </label>
                    <input
                      id="settingsSearch"
                      type="text"
                      placeholder="Search settings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input input-bordered input-sm w-64 pl-10 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                      aria-label="Search settings"
                    />
                    <svg
                      className="absolute left-3 top-2.5 h-4 w-4 text-base-content/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-base-100">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ServerEditForm;
