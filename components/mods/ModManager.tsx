import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ModInfo } from "../../types/server";
import {
  MagnifyingGlassIcon,
  PuzzlePieceIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { clsx } from "clsx";

interface ModManagerProps {
  serverId: string;
  onModsUpdate: (mods: ModInfo[]) => void;
  searchQuery?: string;
  showAddModModal?: boolean;
  setShowAddModModal?: (show: boolean) => void;
}

interface CurseForgeModData {
  id: number;
  gameId: number;
  name: string;
  slug: string;
  links: {
    websiteUrl: string;
    wikiUrl: string;
    issuesUrl: string;
    sourceUrl: string;
  };
  summary: string;
  status: number;
  downloadCount: number;
  isFeatured: boolean;
  primaryCategoryId: number;
  categories: Array<{
    id: number;
    gameId: number;
    name: string;
    slug: string;
    url: string;
    iconUrl: string;
    dateModified: string;
    isClass: boolean;
    classId: number;
    parentCategoryId: number;
    displayIndex: number;
  }>;
  classId: number;
  authors: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  logo: {
    id: number;
    modId: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    url: string;
  };
  screenshots: Array<{
    id: number;
    modId: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    url: string;
  }>;
  mainFileId: number;
  latestFiles: Array<{
    id: number;
    gameId: number;
    modId: number;
    isAvailable: boolean;
    displayName: string;
    fileName: string;
    releaseType: number;
    fileStatus: number;
    hashes: Array<{
      value: string;
      algo: number;
    }>;
    fileDate: string;
    fileLength: number;
    downloadCount: number;
    fileSizeOnDisk: number;
    downloadUrl: string;
    gameVersions: string[];
    sortableGameVersions: Array<{
      gameVersionName: string;
      gameVersionPadded: string;
      gameVersion: string;
      gameVersionReleaseDate: string;
      gameVersionTypeId: number;
    }>;
    dependencies: Array<{
      modId: number;
      relationType: number;
    }>;
    exposeAsAlternative: boolean;
    parentProjectFileId: number;
    alternateFileId: number;
    isServerPack: boolean;
    serverPackFileId: number;
    isEarlyAccessContent: boolean;
    earlyAccessEndDate: string;
    fileFingerprint: number;
    modules: Array<{
      name: string;
      fingerprint: number;
    }>;
  }>;
  latestFilesIndexes: Array<{
    gameVersion: string;
    fileId: number;
    filename: string;
    releaseType: number;
    gameVersionTypeId: number;
    modLoader: number;
  }>;
  dateCreated: string;
  dateModified: string;
  dateReleased: string;
  allowModDistribution: boolean;
  gamePopularityRank: number;
  isAvailable: boolean;
  thumbsUpCount: number;
}

interface CurseForgeCategory {
  id: number;
  name: string;
}

// Predefined mod categories matching the requested structure
const MOD_CATEGORIES = [
  "QoL",
  "RPG",
  "Maps",
  "Popular",
  "Overhauls",
  "General",
  "Custom Cosmetics",
  "Installed",
];

// Category to search term mapping
const CATEGORY_SEARCH_TERMS: { [key: string]: string[] } = {
  QoL: [
    "QoL",
    "Quality of Life",
    "Improvement",
    "Tweak",
    "Fix",
    "Enhancement",
    "Utility",
    "Optimization",
    "Better",
    "Improved",
    "Enhanced",
    "Convenient",
    "Helper",
    "Assistant",
    "Tool",
    "Auto",
    "Stack",
    "Pickup",
    "Interface",
    "UI",
    "HUD",
    "Notification",
    "Alert",
    "Indicator",
    "Smart",
    "Advanced",
    "Extended",
    "Plus",
    "Pro",
    "Ultimate",
    "Super",
    "Mega",
    "S+",
    "Structures Plus",
    "Awesome SpyGlass",
    "Ultra Stacks",
    "Inventory Manager",
    "Auto Stack",
    "Quick Craft",
    "Fast Travel",
    "Resource Tracker",
    "Auto Harvest",
    "Auto Craft",
    "Hotkeys",
    "Quick Build",
    "Easy Place",
    "Fast Loot",
    "Auto Sort",
    "Quick Repair",
    "Quick Heal",
    "Resource",
    "Pulling",
    "System",
    "Automation",
    "Streamlined",
    "Simplified",
    "Performance",
    "FSR",
    "Frame Rate",
    "Upscaling",
    "Efficient",
    "Smooth",
    "Faster",
    "Quick",
    "Instant",
    "Management",
    "Organizer",
    "Sorter",
    "Filter",
    "Search",
    "Browse",
    "Navigate",
    "Depletion",
    "Infinite",
    "Unlimited",
    "Boosted",
    "Multiplier",
    "Enhanced Stats",
  ],
  RPG: [
    "RPG",
    "Roleplaying",
    "Roleplay",
    "Progression",
    "Skills",
    "Stats",
    "Leveling",
    "Classes",
    "Experience",
    "XP",
    "Level",
    "Skill Tree",
    "Talent",
    "Attribute",
    "Character",
    "Profession",
    "Job",
    "Career",
    "Specialization",
    "Build",
    "Development",
    "Adventure",
    "Quest",
    "Mission",
    "Story",
    "Narrative",
    "Campaign",
    "Magic",
    "Perks",
    "Lore",
    "Ark Advance",
    "ARK Additions",
    "Spell",
    "Potion",
    "Crafting Skill",
    "Trader",
    "Guild",
    "Faction",
    "Reputation",
    "Bounty",
    "Exploration",
    "Dungeon",
    "Boss",
    "Mount",
    "Pet Companion",
    "Hardcore",
    "Permadeath",
    "Difficulty",
    "Challenge",
    "Immersive",
    "Realistic",
    "Simulation",
    "Survival Experience",
    "Tribe",
    "Clan",
    "Alliance",
    "Rank",
    "Prestige",
    "Mastery",
    "Ascension",
    "Evolution",
    "Mutation",
  ],
  Maps: [
    "Map",
    "Maps",
    "Custom Map",
    "New Map",
    "Biome",
    "Terrain",
    "World",
    "Island",
    "Environment",
    "Landscape",
    "Location",
    "Area",
    "Region",
    "Zone",
    "Territory",
    "Expansion",
    "DLC",
    "Add-on",
    "Extension",
    "Pack",
    "Collection",
    "Aberration",
    "Extinction",
    "Genesis",
    "Ragnarok",
    "Valguero",
    "Crystal Isles",
    "Lost Island",
    "Fjordur",
    "Scorched Earth",
    "Center",
    "Atlas",
    "Adventure Map",
    "Parkour Map",
    "PvP Map",
    "Survival Map",
    "Building Map",
    "Roleplay Map",
    "Custom",
    "Remake",
    "Remaster",
    "Conversion",
    "Port",
    "Updated",
    "Reimagined",
    "Mysterious",
    "Verdant",
    "Azure",
    "Misty",
    "Jungle",
    "Ocean",
    "Desert",
    "Snow",
    "Volcanic",
    "Underground",
    "Cave",
    "Cliff",
    "Mountain",
    "Valley",
  ],
  Popular: [
    "Popular",
    "Trending",
    "Top Rated",
    "Most Downloaded",
    "Hot",
    "Recommended",
    "Featured",
    "Best",
    "Top",
    "Favorite",
    "Must Have",
    "Essential",
    "Core",
    "Awesome",
    "Amazing",
    "Great",
    "Excellent",
    "Outstanding",
    "Fantastic",
    "Structures Plus",
    "Awesome SpyGlass",
    "Ultra Stacks",
    "Dino Storage",
    "ARK Additions",
    "ARK Advance",
    "Eco's Mods",
    "Classic Flyers",
    "Sheep's Ark",
    "Pillars Plus",
    "Reusable",
    "Multipurpose",
    "Community Favorite",
    "Community",
    "Staff Pick",
    "Editor Choice",
    "Highly Rated",
    "Celebrated",
    "Acclaimed",
    "Beloved",
    "Iconic",
    "Legendary",
    "Classic",
    "Timeless",
    "Viral",
    "Buzzing",
    "Sensation",
    "Phenomenon",
    "Breakthrough",
  ],
  Overhauls: [
    "Overhaul",
    "Total Conversion",
    "Rework",
    "Expansion",
    "Revamp",
    "Modpack",
    "Complete",
    "Full",
    "Major",
    "Massive",
    "Huge",
    "Big",
    "Large Scale",
    "Remaster",
    "Remake",
    "Redesign",
    "Rebuild",
    "Transform",
    "Revolution",
    "Game Changer",
    "Total",
    "Ultimate",
    "Comprehensive",
    "All-in-One",
    "Primal Fear",
    "Omega",
    "Ebenus Astrum",
    "Genesis Ascended",
    "Exiled Lands",
    "Dark Ages",
    "TRex Calibration",
    "Combat Overhaul",
    "Creature Evolution",
    "System Overhaul",
    "Comprehensive Building",
    "Core Improvements",
    "Ground-up",
    "Next-generation",
    "Unreal Engine 5",
    "Revolutionary",
    "Cross-platform",
    "Modding Experience",
    "Technology",
    "Innovation",
  ],
  Structures: [
    "Structures",
    "Building",
    "Construction",
    "Architecture",
    "Platforms",
    "Foundations",
    "Walls",
    "Roofs",
    "Doors",
    "Windows",
    "Stairs",
    "Ramps",
    "Pillars",
    "Beams",
    "Super Structures",
    "Arkitect",
    "Advanced Building",
    "Building Plus",
    "B+",
    "Snap",
    "Snapping",
    "Placement",
    "Wedges",
    "Triangles",
    "Circles",
    "Curves",
    "Decorative",
    "Furniture",
    "Chairs",
    "Tables",
    "Lights",
    "Cobble Stone",
    "Wooden",
    "Metal",
    "Tek",
    "Glass",
    "Crystal",
    "Stone",
    "Thatch",
    "Progression",
    "Utility Structures",
    "P.U.S",
    "Remastered",
    "Core",
  ],
  Creatures: [
    "Creatures",
    "Dinosaurs",
    "Dinos",
    "Animals",
    "Beasts",
    "Monsters",
    "Wildlife",
    "Prehistoric",
    "Extinct",
    "Ancient",
    "Primeval",
    "Jurassic",
    "Cretaceous",
    "Additions",
    "New Species",
    "Custom Creatures",
    "Unique",
    "Rare",
    "Legendary",
    "Predators",
    "Herbivores",
    "Carnivores",
    "Omnivores",
    "Flying",
    "Swimming",
    "Aquatic",
    "Marine",
    "Sea",
    "Ocean",
    "Land",
    "Terrestrial",
    "Aerial",
    "Toothy",
    "Gargantuan",
    "Massive",
    "Tiny",
    "Giant",
    "Boss",
    "Alpha",
    "Tameable",
    "Rideable",
    "Mountable",
    "Companion",
    "Pet",
    "Breeding",
    "Mammals",
    "Sharks",
    "Dragons",
    "Wyverns",
    "Griffins",
    "Phoenix",
  ],
  General: [
    "Content",
    "AI",
    "Creature",
    "Item",
    "Gameplay",
    "Balance",
    "Mod",
    "Feature",
    "Addition",
    "New",
    "Extra",
    "More",
    "Additional",
    "Extended",
    "Expanded",
    "Misc",
    "Miscellaneous",
    "Various",
    "Mixed",
    "Assorted",
    "Collection",
    "Pack",
    "Bundle",
    "Set",
    "Group",
    "Compilation",
    "Anthology",
    "Ark",
    "Ascended",
    "ASA",
    "Ascension",
    "Survival",
    "Adventure",
    "Crafting",
    "Building",
    "Tooltips",
    "Tutorial",
    "Legacy",
    "Debug",
    "Cheat",
    "Test",
    "Dev",
    "Prototype",
    "Evolved",
    "SA",
    "Server",
    "Client",
    "Dedicated",
    "Local",
    "Single Player",
    "Multiplayer",
    "PvP",
    "PvE",
    "Official",
    "Unofficial",
    "Private",
    "Public",
  ],
  "Custom Cosmetics": [
    "Cosmetic",
    "Skin",
    "Appearance",
    "Visual",
    "Decoration",
    "Aesthetic",
    "Hair",
    "Armor Skin",
    "Style",
    "Emote",
    "Costume",
    "Outfit",
    "Clothing",
    "Apparel",
    "Fashion",
    "Beauty",
    "Makeover",
    "Color",
    "Paint",
    "Dye",
    "Pattern",
    "Design",
    "Theme",
    "Look",
    "Glamour",
    "Vanity",
    "Ornament",
    "Accessory",
    "Jewelry",
    "Embellishment",
    "Face Paint",
    "Tattoo Pack",
    "Hair Pack",
    "Emote Pack",
    "Mask",
    "Hats",
    "Glasses",
    "Wristbands",
    "Boots",
    "Backpack Skin",
    "Pet Skin",
    "Furniture Skins",
    "Premium Outfits",
    "Bounty Hunter",
    "Medieval",
    "Plague Doctor",
    "Custom Armor",
    "Weapons",
    "Inspired",
    "Character Customization",
    "Player Models",
    "Textures",
    "Recolors",
    "Retextures",
    "HD",
    "High Definition",
    "4K",
    "Graphics",
    "Shaders",
    "Materials",
    "Particle Effects",
    "Glow",
    "Shine",
    "Metallic",
  ],
};

const ModManager: React.FC<ModManagerProps> = ({
  serverId,
  onModsUpdate,
  searchQuery: externalSearchQuery,
  showAddModModal: externalShowAddModal,
  setShowAddModModal: externalSetShowAddModal,
}) => {
  const [mods, setMods] = useState<ModInfo[]>([]);
  const [availableMods, setAvailableMods] = useState<CurseForgeModData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("QoL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [launchOptionsText, setLaunchOptionsText] = useState("");
  const [showAddModModal, setShowAddModModal] = useState(false);
  const [manualModId, setManualModId] = useState("");
  const [manualModName, setManualModName] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchModalQuery, setSearchModalQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CurseForgeModData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchModalError, setSearchModalError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("featured");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMods, setTotalMods] = useState(0);
  const [backgroundFetchStatus, setBackgroundFetchStatus] = useState<{
    isRunning: boolean;
    tokenBucket: { tokens: number; capacity: number };
    canMakeRequest: boolean;
    rateLimited: boolean;
  } | null>(null);
  const pageSize = 10;

  // Handle external search query from parent component
  useEffect(() => {
    if (externalSearchQuery && externalSearchQuery.trim()) {
      setSearchQuery(externalSearchQuery);
      // Open search modal with the external query
      setSearchModalQuery(externalSearchQuery);
      setShowSearchModal(true);
      performSearch(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Load mods for the selected category when it changes
  useEffect(() => {
    if (selectedCategory !== "Installed") {
      setCurrentPage(1);
      loadModsForCategory(selectedCategory, false, 1);
    }
  }, [selectedCategory, sortBy, sortOrder]);

  // Use external modal state if provided
  useEffect(() => {
    if (externalShowAddModal !== undefined) {
      setShowAddModModal(externalShowAddModal);
    }
  }, [externalShowAddModal]);

  const loadModsForCategory = async (
    category: string,
    forceRefresh: boolean = false,
    page: number = 1
  ) => {
    setIsLoading(true);
    setSearchError(null);

    try {
      const params = new URLSearchParams({
        category: category,
        pageSize: "10", // Limit to 10 mods per page
        page: page.toString(),
        forceRefresh: forceRefresh.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      const response = await fetch(`/api/curseforge/categories?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to load mods: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setAvailableMods(data.data.mods || []);
        setTotalMods(data.data.totalCount || 0);
        setTotalPages(data.data.totalPages || 1);
        setCurrentPage(page);
      } else {
        setSearchError(data.error || "Failed to load mods");
      }
    } catch (error) {
      console.error("Error loading mods for category:", error);
      setSearchError(
        error instanceof Error ? error.message : "Failed to load mods"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadServerMods = useCallback(async () => {
    try {
      // First, try to load from local storage for faster UI
      const localStorageResponse = await fetch(
        `/api/servers/${serverId}/mods/storage`
      );
      let localMods: any[] = [];

      if (localStorageResponse.ok) {
        const localData = await localStorageResponse.json();
        // Ensure localMods is always an array
        localMods = Array.isArray(localData.data) ? localData.data : [];

        // Convert local storage format to ModInfo format for UI
        const uiMods: ModInfo[] = localMods.map((mod) => ({
          id: mod.id,
          name: mod.name,
          enabled: mod.isEnabled,
          loadOrder: mod.loadOrder,
        }));

        setMods(uiMods);
        onModsUpdate(uiMods);
      }

      // Load mods from the mods API for server sync
      const modsResponse = await fetch(`/api/servers/${serverId}/mods`);
      let serverMods: ModInfo[] = [];
      if (modsResponse.ok) {
        const responseData = await modsResponse.json();
        serverMods = Array.isArray(responseData) ? responseData : [];
      }

      // Load launch options from the config API
      const configResponse = await fetch(`/api/servers/${serverId}/config`);
      if (configResponse.ok) {
        const { data } = await configResponse.json();

        if (data.launchOptions && data.launchOptions.mods) {
          // Update launch options text from persistent storage
          const modIds = data.launchOptions.mods;
          const launchOptionsText =
            modIds.length > 0 ? `-mods=${modIds.join(",")}` : "";
          setLaunchOptionsText(launchOptionsText);

          // Merge launch options with existing mods instead of replacing
          const existingModIds = serverMods.map((mod) => mod.id);
          const newModIds = modIds.filter(
            (id: string) => !existingModIds.includes(id)
          );

          if (newModIds.length > 0) {
            // Add new mods from launch options that aren't already in the list
            const newMods = newModIds.map((id: string, index: number) => ({
              id: id,
              name: `Mod ${id}`,
              enabled: true,
              loadOrder: serverMods.length + index + 1,
            }));

            const mergedMods = [...serverMods, ...newMods];
            setMods(mergedMods);
            onModsUpdate(mergedMods);

            // Save new mods to local storage
            for (const newMod of newMods) {
              await fetch(`/api/servers/${serverId}/mods/storage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  modId: newMod.id,
                  isEnabled: newMod.enabled,
                  loadOrder: newMod.loadOrder,
                }),
              });
            }
          }

          // Update enable states to match launch options
          const updatedMods = serverMods.map((mod) => ({
            ...mod,
            enabled: modIds.includes(mod.id),
          }));

          if (
            JSON.stringify(
              updatedMods.map((m) => ({ id: m.id, enabled: m.enabled }))
            ) !==
            JSON.stringify(
              serverMods.map((m) => ({ id: m.id, enabled: m.enabled }))
            )
          ) {
            setMods(updatedMods);
            onModsUpdate(updatedMods);

            // Update local storage
            const updates = updatedMods.map((mod) => ({
              id: mod.id,
              isEnabled: mod.enabled,
              loadOrder: mod.loadOrder,
            }));

            await fetch(`/api/servers/${serverId}/mods/storage`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ updates }),
            });
          }
        } else {
          // Fallback: generate launch options text from current mods
          const modIds = serverMods
            .filter((mod: ModInfo) => mod.enabled)
            .map((mod: ModInfo) => mod.id);
          const launchOptionsText =
            modIds.length > 0 ? `-mods=${modIds.join(",")}` : "";
          setLaunchOptionsText(launchOptionsText);

          // Save to launch options if not already saved
          if (modIds.length > 0) {
            await saveLaunchOptions(modIds);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load server mods:", error);
    }
  }, [serverId, onModsUpdate]);

  useEffect(() => {
    loadServerMods();
  }, [loadServerMods]);

  useEffect(() => {
    // Load detailed mod information from local storage
    if (mods.length > 0) {
      loadModDetails();
    }
  }, [mods.length > 0]); // Only run when mods are loaded

  // Auto-fetch metadata when entering the mod manager or when mods are loaded
  useEffect(() => {
    if (mods.length > 0) {
      // Auto-refresh metadata for all mods when entering the mod manager
      refreshAllModMetadata();
    }
  }, []); // Run once when component mounts

  // Auto-fetch metadata when switching to "Installed" category
  useEffect(() => {
    if (selectedCategory === "Installed" && mods.length > 0) {
      // Refresh metadata for all mods when switching to installed category
      refreshAllModMetadata();
    }
  }, [selectedCategory, mods.length]);

  // Load background fetch status
  useEffect(() => {
    loadBackgroundFetchStatus();
    const interval = setInterval(loadBackgroundFetchStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadBackgroundFetchStatus = async () => {
    try {
      const response = await fetch("/api/curseforge/background-fetch");
      if (response.ok) {
        const { data } = await response.json();
        setBackgroundFetchStatus(data);
      }
    } catch (error) {
      console.error("Failed to load background fetch status:", error);
    }
  };

  const startBackgroundFetching = async () => {
    try {
      const response = await fetch("/api/curseforge/background-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      if (response.ok) {
        await loadBackgroundFetchStatus();
      }
    } catch (error) {
      console.error("Failed to start background fetching:", error);
    }
  };

  const stopBackgroundFetching = async () => {
    try {
      const response = await fetch("/api/curseforge/background-fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      });
      if (response.ok) {
        await loadBackgroundFetchStatus();
      }
    } catch (error) {
      console.error("Failed to stop background fetching:", error);
    }
  };

  const updateLaunchOptionsText = async (currentMods: ModInfo[]) => {
    const modIds = currentMods
      .filter((mod) => mod.enabled)
      .map((mod) => mod.id);

    const launchOptionsText =
      modIds.length > 0 ? `-mods=${modIds.join(",")}` : "";
    setLaunchOptionsText(launchOptionsText);

    // Save mods to persistent launch options
    await saveLaunchOptions(modIds);
  };

  const saveLaunchOptions = async (modIds: string[]) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          launchOptionKey: "mods",
          launchOptionValue: modIds,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save launch options");
      }
    } catch (error) {
      console.error("Error saving launch options:", error);
    }
  };

  const handleLaunchOptionsChange = async (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newText = event.target.value;
    setLaunchOptionsText(newText);

    const modIdsMatch = newText.match(/-mods=([^,\s]+)/);
    if (modIdsMatch) {
      const modIds = modIdsMatch[1].split(",").filter((id) => id.trim());

      const updatedMods = modIds.map((id, index) => ({
        id: id.trim(),
        name: `Mod ${id.trim()}`,
        enabled: true,
        loadOrder: index + 1,
      }));

      setMods(updatedMods);
      onModsUpdate(updatedMods);

      // Save to persistent storage
      await saveLaunchOptions(modIds);
    } else {
      // No mods found, save empty array
      await saveLaunchOptions([]);
    }
  };

  const handleAddManualMod = async () => {
    if (!manualModId.trim() || !manualModName.trim()) {
      return;
    }

    const newMod: ModInfo = {
      id: manualModId.trim(),
      name: manualModName.trim(),
      enabled: true,
      loadOrder: mods.length + 1,
    };

    const updatedMods = [...mods, newMod];
    setMods(updatedMods);
    await updateLaunchOptionsText(updatedMods);
    onModsUpdate(updatedMods);

    setManualModId("");
    setManualModName("");
    if (externalSetShowAddModal) {
      externalSetShowAddModal(false);
    } else {
      setShowAddModModal(false);
    }
  };

  // Function to perform search and display in modal
  const performSearch = async (query: string) => {
    try {
      setIsSearching(true);
      setSearchModalError(null);

      let searchQuery = query;

      // If no query provided, search for trending mods
      if (!searchQuery.trim()) {
        searchQuery = "trending";
      }

      const params = new URLSearchParams({
        query: searchQuery,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/curseforge/search?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        setSearchModalError(errorData.error || "Failed to search mods");
        return;
      }

      const { data } = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Failed to search mods:", error);
      setSearchModalError("Failed to search mods");
    } finally {
      setIsSearching(false);
    }
  };

  const searchCurseForgeMods = async (query: string) => {
    try {
      setIsLoading(true);
      setSearchError(null);

      let searchQuery = query;

      // If no query provided, search for trending mods
      if (!searchQuery.trim()) {
        searchQuery = "trending";
      }

      const params = new URLSearchParams({
        query: searchQuery,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/curseforge/search?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        setSearchError(errorData.error || "Failed to search mods");
        return;
      }

      const { data } = await response.json();
      setAvailableMods(data);
    } catch (error) {
      console.error("Failed to search mods:", error);
      setSearchError("Failed to search mods");
    } finally {
      setIsLoading(false);
    }
  };

  const addMod = async (modData: CurseForgeModData) => {
    const newMod: ModInfo = {
      id: modData.id.toString(),
      name: modData.name,
      enabled: true,
      loadOrder: mods.length + 1,
    };

    const updatedMods = [...mods, newMod];
    setMods(updatedMods);
    await updateLaunchOptionsText(updatedMods);
    onModsUpdate(updatedMods);

    // Save to local storage with full metadata
    try {
      await fetch(`/api/servers/${serverId}/mods/storage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modId: newMod.id,
          curseForgeData: modData,
          isEnabled: newMod.enabled,
          loadOrder: newMod.loadOrder,
        }),
      });
    } catch (error) {
      console.error("Failed to save mod to local storage:", error);
    }
  };

  const removeMod = async (modId: string) => {
    const updatedMods = mods.filter((mod) => mod.id !== modId);
    setMods(updatedMods);
    await updateLaunchOptionsText(updatedMods);
    onModsUpdate(updatedMods);

    // Remove from local storage
    try {
      await fetch(`/api/servers/${serverId}/mods/storage`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modId }),
      });
    } catch (error) {
      console.error("Failed to remove mod from local storage:", error);
    }
  };

  const updateLoadOrder = async (modId: string, newLoadOrder: number) => {
    const updatedMods = mods.map((mod) =>
      mod.id === modId ? { ...mod, loadOrder: newLoadOrder } : mod
    );
    setMods(updatedMods);
    await updateLaunchOptionsText(updatedMods);
    onModsUpdate(updatedMods);

    // Update local storage
    try {
      const mod = updatedMods.find((m) => m.id === modId);
      if (mod) {
        await fetch(`/api/servers/${serverId}/mods/storage`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            updates: [
              {
                id: mod.id,
                isEnabled: mod.enabled,
                loadOrder: mod.loadOrder,
              },
            ],
          }),
        });
      }
    } catch (error) {
      console.error("Failed to update load order in local storage:", error);
    }
  };

  const toggleMod = async (modId: string) => {
    const updatedMods = mods.map((mod) =>
      mod.id === modId ? { ...mod, enabled: !mod.enabled } : mod
    );
    setMods(updatedMods);
    await updateLaunchOptionsText(updatedMods);
    onModsUpdate(updatedMods);

    // Update local storage
    try {
      const mod = updatedMods.find((m) => m.id === modId);
      if (mod) {
        await fetch(`/api/servers/${serverId}/mods/storage`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            updates: [
              {
                id: mod.id,
                isEnabled: mod.enabled,
                loadOrder: mod.loadOrder,
              },
            ],
          }),
        });
      }
    } catch (error) {
      console.error("Failed to update mod status in local storage:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Filter mods by selected category and search query (client-side filtering for additional refinement)
  const filteredMods = availableMods.filter((mod) => {
    // Add null check for mod
    if (!mod) return false;

    // If we're in a specific category, do additional client-side filtering for precision
    const matchesCategory =
      selectedCategory === "Installed" ||
      (CATEGORY_SEARCH_TERMS[selectedCategory]?.some(
        (term) =>
          (mod.name?.toLowerCase() || "").includes(term.toLowerCase()) ||
          (mod.summary?.toLowerCase() || "").includes(term.toLowerCase()) ||
          (mod.categories?.some(
            (cat) =>
              (cat.name?.toLowerCase() || "").includes(term.toLowerCase()) ||
              (cat.slug?.toLowerCase() || "").includes(term.toLowerCase())
          ) ??
            false)
      ) ??
        false);

    return matchesCategory;
  });

  const refreshModMetadata = async (modId: string) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/mods/storage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modId }),
      });

      if (response.ok) {
        const { data } = await response.json();

        // Add null check to prevent TypeError
        if (data && typeof data === "object") {
          // Update the mod in the UI with fresh metadata
          const updatedMods = mods.map((mod) =>
            mod.id === modId ? { ...mod, name: data.name || mod.name } : mod
          );
          setMods(updatedMods);
          onModsUpdate(updatedMods);
        } else {
          console.warn(`No valid data returned for mod ${modId}`);
        }
      }
    } catch (error) {
      console.error("Failed to refresh mod metadata:", error);
    }
  };

  const refreshAllModMetadata = async () => {
    try {
      // Refresh metadata for all mods in parallel
      const refreshPromises = mods.map((mod) => refreshModMetadata(mod.id));
      await Promise.all(refreshPromises);

      // After all refreshes are complete, reload mod details to get the full updated data
      await loadModDetails();
    } catch (error) {
      console.error("Failed to refresh all mod metadata:", error);
    }
  };

  const loadModDetails = async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}/mods/storage`);
      if (response.ok) {
        const { data } = await response.json();

        // Add null check for data
        if (!data || !Array.isArray(data)) {
          console.warn("No valid mod data received from storage API");
          return;
        }

        // Create a map of mod details for quick lookup
        const modDetailsMap = new Map();
        data.forEach((mod: any) => {
          if (mod && mod.id) {
            modDetailsMap.set(mod.id, mod);
          }
        });

        // Update mods with detailed information
        const updatedMods = mods.map((mod) => {
          const details = modDetailsMap.get(mod.id);
          return {
            ...mod,
            name: details?.name || mod.name,
            summary: details?.summary,
            author: details?.author,
            downloadCount: details?.downloadCount,
            thumbsUpCount: details?.thumbsUpCount,
            logoUrl: details?.logoUrl,
            websiteUrl: details?.websiteUrl,
            category: details?.category,
            tags: details?.tags,
            installedAt: details?.installedAt
              ? new Date(details.installedAt)
              : undefined,
            lastUpdated: details?.lastUpdated
              ? new Date(details.lastUpdated)
              : undefined,
          };
        });

        setMods(updatedMods);
        onModsUpdate(updatedMods);
      }
    } catch (error) {
      console.error("Failed to load mod details:", error);
    }
  };

  return (
    <div className="w-full space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Search Error */}
      {searchError && (
        <div className="alert alert-error">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Background Fetching Status */}
      {backgroundFetchStatus && (
        <div className="card bg-base-100 border border-base-content/10 shadow-lg">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  Background Mod Fetching
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span
                    className={`badge ${backgroundFetchStatus.isRunning ? "badge-success" : "badge-warning"}`}
                  >
                    {backgroundFetchStatus.isRunning ? "Running" : "Stopped"}
                  </span>
                  <span className="text-base-content/70">
                    Tokens: {backgroundFetchStatus.tokenBucket.tokens}/
                    {backgroundFetchStatus.tokenBucket.capacity}
                  </span>
                  <span
                    className={`badge ${backgroundFetchStatus.canMakeRequest ? "badge-success" : "badge-error"}`}
                  >
                    {backgroundFetchStatus.canMakeRequest
                      ? "Can Request"
                      : "Rate Limited"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {backgroundFetchStatus.isRunning ? (
                  <button
                    onClick={stopBackgroundFetching}
                    className="btn btn-sm btn-error"
                  >
                    Stop Fetching
                  </button>
                ) : (
                  <button
                    onClick={startBackgroundFetching}
                    className="btn btn-sm btn-success"
                  >
                    Start Fetching
                  </button>
                )}
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-base-300 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(backgroundFetchStatus.tokenBucket.tokens / backgroundFetchStatus.tokenBucket.capacity) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-base-content/60 mt-1">
                Token bucket: {backgroundFetchStatus.tokenBucket.tokens} tokens
                available
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex w-full">
        {/* Category Navigation */}
        <div className="w-64 border-r border-base-content/10 flex-shrink-0">
          <div className="flex flex-col gap-1 pr-4">
            {MOD_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={clsx(
                  "text-left px-4 py-2 rounded transition-colors",
                  {
                    "text-primary drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]":
                      selectedCategory === category,
                    "text-base-content/50 hover:text-base-content/70":
                      selectedCategory !== category,
                  }
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Mod Content */}
        <div className="flex-1 pl-6 min-w-0">
          {selectedCategory === "Installed" ? (
            /* Installed Mods Content */
            <div className="space-y-6">
              {/* Installed Mods */}
              <div className="card bg-base-100 border border-base-content/10 shadow-lg w-full">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Installed Mods</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => refreshAllModMetadata()}
                        className="btn btn-sm btn-outline"
                        title="Refresh mod metadata from CurseForge"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Refresh Metadata
                      </button>
                      <button
                        onClick={() => setShowAddModModal(true)}
                        className="btn btn-sm btn-primary"
                      >
                        Add Mod
                      </button>
                    </div>
                  </div>

                  {mods.length === 0 ? (
                    <div className="text-center py-8 text-base-content/60">
                      <p>No mods installed</p>
                      <p className="text-sm mt-2">
                        Click &quot;Add Mod&quot; to install mods from
                        CurseForge
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="table table-zebra w-full">
                        <thead>
                          <tr className="bg-base-200/50">
                            <th className="w-16 text-center">Order</th>
                            <th className="w-8"></th> {/* Logo */}
                            <th>Name & Author</th>
                            <th className="hidden md:table-cell">Category</th>
                            <th className="hidden lg:table-cell text-center">
                              Downloads
                            </th>
                            <th className="hidden xl:table-cell text-center">
                              Installed
                            </th>
                            <th className="w-20 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mods
                            .sort((a, b) => a.loadOrder - b.loadOrder)
                            .map((mod) => (
                              <tr
                                key={mod.id}
                                className={`group hover:bg-base-200/50 transition-colors ${
                                  mod.enabled ? "" : "opacity-60"
                                }`}
                              >
                                {/* Load Order */}
                                <td className="text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <button
                                      onClick={() =>
                                        updateLoadOrder(
                                          mod.id,
                                          Math.max(1, mod.loadOrder - 1)
                                        )
                                      }
                                      className="btn btn-xs btn-ghost btn-square"
                                      disabled={mod.loadOrder <= 1}
                                      title="Move up in load order"
                                    >
                                      ↑
                                    </button>
                                    <span className="text-xs font-mono font-medium">
                                      {mod.loadOrder}
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateLoadOrder(
                                          mod.id,
                                          Math.min(
                                            mods.length,
                                            mod.loadOrder + 1
                                          )
                                        )
                                      }
                                      className="btn btn-xs btn-ghost btn-square"
                                      disabled={mod.loadOrder >= mods.length}
                                      title="Move down in load order"
                                    >
                                      ↓
                                    </button>
                                  </div>
                                </td>

                                {/* Logo */}
                                <td className="text-center">
                                  {mod.logoUrl && (
                                    <img
                                      src={mod.logoUrl}
                                      alt={`${mod.name} logo`}
                                      className="w-6 h-6 rounded object-cover mx-auto"
                                    />
                                  )}
                                </td>

                                {/* Name & Author */}
                                <td>
                                  <div className="min-w-0">
                                    <div className="font-medium text-base-content truncate">
                                      {mod.name}
                                    </div>
                                    {mod.author && (
                                      <div className="text-xs text-base-content/60 truncate">
                                        by {mod.author}
                                      </div>
                                    )}
                                    {mod.summary && (
                                      <div className="text-xs text-base-content/50 truncate mt-1 hidden md:block">
                                        {mod.summary}
                                      </div>
                                    )}
                                    {/* Mobile: Show category and downloads inline */}
                                    <div className="flex items-center gap-2 mt-1 md:hidden">
                                      {mod.category && (
                                        <span className="badge badge-xs badge-outline">
                                          {mod.category}
                                        </span>
                                      )}
                                      {mod.downloadCount && (
                                        <span className="text-xs text-base-content/50">
                                          📥{" "}
                                          {mod.downloadCount.toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Category - Desktop only */}
                                <td className="hidden md:table-cell">
                                  {mod.category ? (
                                    <span className="badge badge-sm badge-outline">
                                      {mod.category}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-base-content/40">
                                      -
                                    </span>
                                  )}
                                </td>

                                {/* Downloads - Desktop only */}
                                <td className="hidden lg:table-cell text-center">
                                  {mod.downloadCount ? (
                                    <div className="text-xs">
                                      <div className="font-medium">
                                        {mod.downloadCount.toLocaleString()}
                                      </div>
                                      {mod.thumbsUpCount && (
                                        <div className="text-base-content/50">
                                          👍{" "}
                                          {mod.thumbsUpCount.toLocaleString()}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-base-content/40">
                                      -
                                    </span>
                                  )}
                                </td>

                                {/* Installed Date - Desktop only */}
                                <td className="hidden xl:table-cell text-center">
                                  {mod.installedAt ? (
                                    <span className="text-xs text-base-content/70">
                                      {new Date(
                                        mod.installedAt
                                      ).toLocaleDateString()}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-base-content/40">
                                      -
                                    </span>
                                  )}
                                </td>

                                {/* Status & Actions */}
                                <td className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => toggleMod(mod.id)}
                                      className={`btn btn-xs btn-square ${
                                        mod.enabled
                                          ? "btn-success"
                                          : "btn-ghost"
                                      }`}
                                      title={
                                        mod.enabled
                                          ? "Disable mod"
                                          : "Enable mod"
                                      }
                                    >
                                      {mod.enabled ? "✓" : "○"}
                                    </button>
                                    <button
                                      onClick={() => removeMod(mod.id)}
                                      className="btn btn-xs btn-error btn-square"
                                      title="Remove mod"
                                    >
                                      <TrashIcon className="h-3 w-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Launch Options */}
              <div className="card bg-base-100 border border-base-content/10 shadow-lg w-full">
                <div className="card-body">
                  <h4 className="text-sm font-medium text-base-content mb-3">
                    Launch Options
                  </h4>
                  <textarea
                    value={launchOptionsText}
                    onChange={handleLaunchOptionsChange}
                    placeholder="-mods=modid1,modid2,modid3"
                    className="textarea textarea-bordered w-full h-24 bg-base-200 border-base-content/20 focus:border-primary font-mono text-sm"
                  />
                  <p className="text-xs text-base-content/60 mt-2">
                    This will be automatically generated based on your enabled
                    mods and their load order.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Category Header with Refresh Button */}
              <div className="card bg-base-100 border border-base-content/10 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-base-content">
                      {selectedCategory} Mods
                      {isLoading && (
                        <span className="loading loading-spinner loading-sm ml-2"></span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-base-content/60">
                        Page {currentPage} of {totalPages} ({totalMods} total)
                      </div>
                      <button
                        onClick={() =>
                          loadModsForCategory(selectedCategory, true)
                        }
                        className="btn btn-outline btn-sm"
                        disabled={isLoading}
                        title="Refresh mods from CurseForge"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {filteredMods.length === 0 && !isLoading && !searchError ? (
                <div className="card bg-base-100 border border-base-content/10 shadow-lg">
                  <div className="card-body text-center py-12">
                    <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-base-content/40" />
                    <h3 className="mt-2 text-sm font-medium text-base-content">
                      No mods found
                    </h3>
                    <p className="mt-1 text-sm text-base-content/60">
                      Try refreshing or switching to a different category.
                    </p>
                  </div>
                </div>
              ) : (
                /* Available Mods Grid */
                <div className="card bg-base-100 border border-base-content/10 shadow-lg">
                  <div className="card-body">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="loading loading-spinner loading-lg text-primary"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {filteredMods.map((mod) => (
                          <div key={mod.id} className="space-y-2">
                            <div className="flex items-start space-x-3 p-4 bg-base-200 rounded-lg border border-base-content/10">
                              <div className="flex-shrink-0">
                                {mod.logo?.thumbnailUrl ? (
                                  <img
                                    src={mod.logo.thumbnailUrl}
                                    alt={mod.name}
                                    className="w-12 h-12 rounded object-cover"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-base-300 rounded flex items-center justify-center">
                                    <PuzzlePieceIcon className="h-6 w-6 text-base-content/40" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-base-content truncate">
                                  {mod.name}
                                </h4>
                                {mod.authors && mod.authors.length > 0 && (
                                  <p className="text-xs text-base-content/60 truncate">
                                    by {mod.authors[0].name}
                                  </p>
                                )}
                                {mod.summary && (
                                  <p className="text-xs text-base-content/70 mt-1 line-clamp-2">
                                    {mod.summary}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-base-content/50">
                                  <span>
                                    📥 {mod.downloadCount.toLocaleString()}
                                  </span>
                                  {mod.thumbsUpCount > 0 && (
                                    <span>
                                      👍 {mod.thumbsUpCount.toLocaleString()}
                                    </span>
                                  )}
                                  {mod.categories &&
                                    mod.categories.length > 0 && (
                                      <span className="badge badge-xs badge-outline">
                                        {mod.categories[0].name}
                                      </span>
                                    )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => addMod(mod)}
                              className="btn btn-primary btn-sm w-full"
                            >
                              Add Mod
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-6">
                        <button
                          onClick={() =>
                            loadModsForCategory(
                              selectedCategory,
                              false,
                              Math.max(1, currentPage - 1)
                            )
                          }
                          className="btn btn-sm btn-outline"
                          disabled={currentPage <= 1 || isLoading}
                        >
                          Previous
                        </button>

                        <div className="flex gap-1">
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              const pageNum =
                                Math.max(
                                  1,
                                  Math.min(totalPages - 4, currentPage - 2)
                                ) + i;
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() =>
                                    loadModsForCategory(
                                      selectedCategory,
                                      false,
                                      pageNum
                                    )
                                  }
                                  className={`btn btn-sm ${currentPage === pageNum ? "btn-primary" : "btn-outline"}`}
                                  disabled={isLoading}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}
                        </div>

                        <button
                          onClick={() =>
                            loadModsForCategory(
                              selectedCategory,
                              false,
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          className="btn btn-sm btn-outline"
                          disabled={currentPage >= totalPages || isLoading}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-base-300/75 backdrop-blur-sm transition-opacity"
              onClick={() => setShowSearchModal(false)}
              aria-hidden="true"
            />

            {/* Modal panel */}
            <div className="inline-block transform overflow-hidden rounded-lg bg-base-100 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:align-middle">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium leading-6 text-primary glow font-mono">
                        SEARCH RESULTS
                      </h3>
                      <button
                        onClick={() => setShowSearchModal(false)}
                        className="btn btn-ghost btn-sm btn-circle rounded-full hover:bg-base-200 transition-colors"
                        aria-label="Close dialog"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="mb-6">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={searchModalQuery}
                          onChange={(e) => setSearchModalQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              performSearch(searchModalQuery);
                            }
                          }}
                          placeholder="Search for mods..."
                          className="input input-bordered flex-1 h-9 text-sm font-mono"
                          disabled={isSearching}
                        />
                        <button
                          onClick={() => performSearch(searchModalQuery)}
                          className="btn btn-primary btn-sm font-mono"
                          disabled={isSearching}
                        >
                          {isSearching ? (
                            <span className="loading loading-spinner loading-xs" />
                          ) : (
                            <MagnifyingGlassIcon className="h-4 w-4" />
                          )}
                          {isSearching ? "SEARCHING" : "SEARCH"}
                        </button>
                      </div>
                    </div>

                    {/* Search Error */}
                    {searchModalError && (
                      <div className="alert alert-error mb-4">
                        <ExclamationTriangleIcon className="h-5 w-5" />
                        <span className="font-mono text-sm">
                          {searchModalError}
                        </span>
                      </div>
                    )}

                    {/* Search Results */}
                    <div className="max-h-[60vh] overflow-y-auto">
                      {isSearching ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="loading loading-spinner loading-lg text-primary"></div>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="text-center py-12">
                          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-base-content/40" />
                          <h4 className="mt-2 text-sm font-medium text-base-content font-mono">
                            NO RESULTS FOUND
                          </h4>
                          <p className="mt-1 text-sm text-base-content/60 font-mono">
                            Try different search terms or check your spelling.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {searchResults.map((mod) => (
                            <div
                              key={mod.id}
                              className="card bg-base-200 border border-base-content/10 shadow-pipboy"
                            >
                              <div className="card-body p-4">
                                <div className="flex items-start space-x-3">
                                  {mod.logo?.thumbnailUrl && (
                                    <div className="flex-shrink-0">
                                      <Image
                                        src={mod.logo.thumbnailUrl}
                                        alt={mod.name}
                                        width={48}
                                        height={48}
                                        className="rounded-lg"
                                      />
                                    </div>
                                  )}

                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-base-content truncate font-mono">
                                      {mod.name}
                                    </h4>
                                    <p className="text-xs text-base-content/60 mt-1 line-clamp-2 font-mono">
                                      {mod.summary}
                                    </p>

                                    <div className="flex items-center space-x-4 mt-2 text-xs text-base-content/40 font-mono">
                                      <span>
                                        📥 {mod.downloadCount.toLocaleString()}
                                      </span>
                                      <span>
                                        👍 {mod.thumbsUpCount.toLocaleString()}
                                      </span>
                                    </div>

                                    <div className="mt-3">
                                      <button
                                        onClick={() => {
                                          addMod(mod);
                                          setShowSearchModal(false);
                                        }}
                                        className="btn btn-primary btn-xs font-mono"
                                        disabled={mods.some(
                                          (m) => m.id === mod.id.toString()
                                        )}
                                      >
                                        <PlusIcon className="h-3 w-3 mr-1" />
                                        {mods.some(
                                          (m) => m.id === mod.id.toString()
                                        )
                                          ? "INSTALLED"
                                          : "INSTALL"}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Mod Modal */}
      {showAddModModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add Manual Mod</h3>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Mod ID</span>
              </label>
              <input
                type="text"
                value={manualModId}
                onChange={(e) => setManualModId(e.target.value)}
                placeholder="Enter CurseForge mod ID"
                className="input input-bordered bg-base-200 border-base-content/20 focus:border-primary"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Mod Name</span>
              </label>
              <input
                type="text"
                value={manualModName}
                onChange={(e) => setManualModName(e.target.value)}
                placeholder="Enter mod display name"
                className="input input-bordered bg-base-200 border-base-content/20 focus:border-primary"
              />
            </div>

            <div className="modal-action">
              <button
                onClick={() => {
                  if (externalSetShowAddModal) {
                    externalSetShowAddModal(false);
                  } else {
                    setShowAddModModal(false);
                  }
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManualMod}
                disabled={!manualModId.trim() || !manualModName.trim()}
                className="btn btn-primary"
              >
                Add Mod
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModManager;
