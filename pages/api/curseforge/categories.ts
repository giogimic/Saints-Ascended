import { NextApiRequest, NextApiResponse } from "next";
import {
  CurseForgeAPI,
  CurseForgeAPIError,
  CurseForgeRateLimitError,
  CurseForgeAuthenticationError,
  CurseForgeForbiddenError,
} from "@/lib/curseforge-api";
import { modCache } from "@/lib/mod-cache";

// Category to search term mapping
const CATEGORY_SEARCH_TERMS: { [key: string]: string[] } = {
  Structures: [
    "Structures",
    "Building",
    "Construction",
    "Architecture",
    "Foundation",
    "Wall",
    "Roof",
    "Door",
    "Window",
    "Pillar",
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
    "Quick Build",
    "Easy Place",
    "Pillars Plus",
  ],
  Creatures: [
    "Creatures",
    "Dinos",
    "Dinosaurs",
    "Animals",
    "Pets",
    "Mounts",
    "Wildlife",
    "Fauna",
    "Beasts",
    "Monsters",
    "ARK Additions",
    "ARK Advance",
    "Mount",
    "Pet Companion",
    "Creature Evolution",
    "Evolution",
    "Mutation",
    "Boss",
    "Classic Flyers",
    "Sheep's Ark",
    "Dino Storage",
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
  Gameplay: [
    "Gameplay",
    "Mechanics",
    "Survival",
    "Features",
    "Rules",
    "Balance",
    "Systems",
    "Experience",
    "RPG",
    "Roleplaying",
    "Roleplay",
    "Progression",
    "Skills",
    "Stats",
    "Leveling",
    "Classes",
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
    "Redesign",
    "Rebuild",
    "Transform",
    "Revolution",
    "Game Changer",
    "Total",
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
  Utility: [
    "Utility",
    "Quality of Life",
    "QoL",
    "Improvement",
    "Tweak",
    "Fix",
    "Enhancement",
    "Optimization",
    "Tools",
    "Automation",
    "Helper",
    "Assistant",
    "Framework",
    "Library",
    "API",
    "Integration",
    "Bridge",
    "Connector",
    "Adapter",
    "Wrapper",
    "Interface",
    "System",
    "Core",
    "Base",
    "Foundation",
    "Platform",
    "Engine",
    "Backend",
    "Frontend",
    "Middleware",
    "Service",
    "Component",
    "Module",
    "Plugin",
    "Extension",
    "Add-on",
    "Performance",
    "Speed",
    "Efficiency",
    "Reliability",
    "Stability",
    "Compatibility",
    "Support",
    "Notification",
    "Alert",
    "Indicator",
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
    "Fast Loot",
    "Auto Sort",
    "Quick Repair",
    "Quick Heal",
    "Resource",
    "Pulling",
    "Streamlined",
    "Simplified",
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
  Cosmetic: [
    "Cosmetic",
    "Skins",
    "Visual",
    "Appearance",
    "Texture",
    "Model",
    "Style",
    "Design",
    "Custom",
    "Personalized",
    "Unique",
    "Special",
    "Exclusive",
    "Premium",
    "Deluxe",
    "Ultimate",
    "Collector",
    "Limited Edition",
    "Rare",
    "Legendary",
    "Epic",
    "Mythic",
    "Divine",
    "Celestial",
    "Infernal",
    "Demonic",
    "Angelic",
    "Holy",
    "Sacred",
    "Profane",
    "Cursed",
    "Blessed",
    "Enchanted",
    "Magical",
    "Mystical",
    "Arcane",
    "Elemental",
    "Fire",
    "Ice",
    "Lightning",
    "Earth",
    "Wind",
    "Water",
    "Nature",
    "Organic",
    "Synthetic",
    "Artificial",
    "Natural",
  ],
};

// Utility function to convert BigInt values to strings for JSON serialization
function serializeBigInts(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInts);
  }

  if (typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigInts(value);
    }
    return result;
  }

  return obj;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      category,
      forceRefresh = "false",
      pageSize = "10",
      page = "1",
    } = req.query;

    // If no category is provided, return the list of available categories
    if (!category || typeof category !== "string") {
      const availableCategories = Object.keys(CATEGORY_SEARCH_TERMS).map(name => ({
        name,
        searchTerms: CATEGORY_SEARCH_TERMS[name].slice(0, 5), // First 5 terms for preview
        totalTerms: CATEGORY_SEARCH_TERMS[name].length,
        description: getCategoryDescription(name)
      }));

      return res.status(200).json({
        success: true,
        data: {
          categories: availableCategories,
          totalCategories: availableCategories.length
        },
        message: "Available mod categories"
      });
    }

    // Get search terms for the category
    const searchTerms = CATEGORY_SEARCH_TERMS[category] || [category];
    const primarySearchTerm = searchTerms[0];

    // Determine sort parameters based on category
    const sortBy = category === "Popular" ? "popularity" : "name";
    const sortOrder = "desc";

    // Validate pageSize
    const pageSizeNum = parseInt(pageSize as string);
    const pageNum = parseInt(page as string);
    if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 50) {
      return res
        .status(400)
        .json({ error: "Page size must be between 1 and 50" });
    }

    // Check if we should force refresh
    const shouldForceRefresh = forceRefresh === "true";

    // Try to get from cache first (unless force refresh is requested)
    if (!shouldForceRefresh) {
      const cachedResult = await modCache.searchMods(
        primarySearchTerm,
        category,
        sortBy,
        sortOrder,
        pageNum,
        pageSizeNum
      );
      if (cachedResult.data && cachedResult.data.length > 0) {
        return res.status(200).json({
          success: true,
          data: serializeBigInts({
            mods: cachedResult.data,
            totalCount: cachedResult.totalCount || cachedResult.data.length,
            totalPages: Math.ceil(
              (cachedResult.totalCount || cachedResult.data.length) /
                pageSizeNum
            ),
            currentPage: pageNum,
            pageSize: pageSizeNum,
          }),
          source: "cache",
          category,
          searchTerm: primarySearchTerm,
        });
      }
    }

    // Fetch from CurseForge API
    const mods = await CurseForgeAPI.searchMods(
      primarySearchTerm,
      undefined, // No category ID filter
      sortBy as "name" | "popularity" | "size" | "updated",
      sortOrder as "asc" | "desc",
      pageSizeNum
    );

    // Cache the results
    if (mods && mods.mods && mods.mods.length > 0) {
      await modCache.setSearchResults(
        primarySearchTerm,
        category,
        sortBy,
        sortOrder,
        pageNum,
        pageSizeNum,
        mods.mods,
        mods.totalCount
      );
    }

    return res.status(200).json({
      success: true,
      data: serializeBigInts({
        mods: mods?.mods || [],
        totalCount: mods?.totalCount || 0,
        totalPages: Math.ceil((mods?.totalCount || 0) / pageSizeNum),
        currentPage: pageNum,
        pageSize: pageSizeNum,
      }),
      source: "api",
      category,
      searchTerm: primarySearchTerm,
    });
  } catch (error) {
    console.error("CurseForge category search error:", error);

    // Handle specific CurseForge API errors
    if (error instanceof CurseForgeAuthenticationError) {
      return res.status(401).json({
        error: "Authentication failed. Please check your CurseForge API key.",
        details: error.message,
      });
    }

    if (error instanceof CurseForgeForbiddenError) {
      return res.status(403).json({
        error: "Access forbidden. Please check your API key permissions.",
        details: error.message,
      });
    }

    if (error instanceof CurseForgeRateLimitError) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please wait before making more requests.",
        retryAfter: error.retryAfter,
        details: error.message,
      });
    }

    if (error instanceof CurseForgeAPIError) {
      return res.status(error.statusCode).json({
        error: "CurseForge API error",
        statusCode: error.statusCode,
        details: error.message,
      });
    }

    // Handle generic errors
    if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        error: "Failed to search CurseForge mods",
        details: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred",
    });
  }
}

// Helper function to provide descriptions for categories
function getCategoryDescription(categoryName: string): string {
  const descriptions: { [key: string]: string } = {
    Structures: "Building and construction mods including walls, foundations, and architectural elements",
    Creatures: "Dinosaurs, animals, and creature-related mods including new species and creature mechanics",
    Maps: "Custom maps, biomes, and world environments for ARK",
    Popular: "Most popular and trending mods in the community",
    Gameplay: "Core gameplay mechanics, survival features, and game system overhauls",
    Utility: "Quality of life improvements, tools, and helpful automation mods",
    Cosmetic: "Visual enhancements, skins, textures, and appearance modifications"
  };
  
  return descriptions[categoryName] || `Mods related to ${categoryName.toLowerCase()}`;
}
