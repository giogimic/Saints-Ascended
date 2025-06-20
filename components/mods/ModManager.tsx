import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ModInfo } from "../../types/server";
import {
  MagnifyingGlassIcon,
  PuzzlePieceIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { toast } from 'react-hot-toast';
import { modCacheClient } from "@/lib/mod-cache-client";
import { addConsoleError } from "@/components/ui/Layout";

interface ModManagerProps {
  serverId: string;
  onModsUpdate: (mods: ModInfo[]) => void;
  searchQuery?: string;
  showAddModModal?: boolean;
  setShowAddModModal?: (show: boolean) => void;
}

interface CurseForgeModData {
  id: number;
  name: string;
  summary: string;
  logo?: {
    url: string;
  };
  screenshots?: Array<{
    url: string;
  }>;
  authors: Array<{
      name: string;
  }>;
  downloadCount: number;
  dateCreated: string;
  dateModified: string;
  gamePopularityRank?: number;
  categories: Array<{
    id: number;
    name: string;
  }>;
}

interface DisplayMod {
  id: string;
  name: string;
  description: string;
  version: string;
  workshopId: string;
  enabled: boolean;
  loadOrder: number;
  dependencies: string[];
  incompatibilities: string[];
  size: string;
  lastUpdated: Date;
  _curseforgeData?: CurseForgeModData;
}

// Predefined mod categories
const MOD_CATEGORIES = [
  "Installed",
  "QoL",
  "RPG",
  "Maps",
  "Popular",
  "Overhauls",
  "General",
  "Custom Cosmetics",
];

const ModManager: React.FC<ModManagerProps> = ({
  serverId,
  onModsUpdate,
  searchQuery = "",
  showAddModModal: externalShowAddModModal,
  setShowAddModModal: externalSetShowAddModal,
}) => {
  // State management
  const [mods, setMods] = useState<ModInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Installed");
  const [searchResults, setSearchResults] = useState<CurseForgeModData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchModalQuery, setSearchModalQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAddModModal, setShowAddModModal] = useState(false);
  const [manualModId, setManualModId] = useState("");

  const [launchOptions, setLaunchOptions] = useState("");
  const [backgroundFetchStatus, setBackgroundFetchStatus] = useState<any>(null);
  const [installedModsSearchQuery, setInstalledModsSearchQuery] = useState(""); // For searching installed mods

  // Load mods on component mount
  useEffect(() => {
    loadMods();
    loadLaunchOptions();
    loadBackgroundFetchStatus();
    
    // Strategy 1: Pre-fetch popular categories for better UX
    modCacheClient.prefetchPopularCategories();
  }, [serverId]);

  // Load mods from API - Fix: Handle both array and object responses
  const loadMods = async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}/mods`);
      if (response.ok) {
      const data = await response.json();
        // Handle both direct array response and object with mods property
        const modsArray = Array.isArray(data) ? data : (data.mods || []);
        setMods(modsArray);
        if (onModsUpdate) {
          onModsUpdate(modsArray);
        }
      }
    } catch (error) {
      console.error("Failed to load mods:", error);
      toast.error("Failed to load mods");
    }
  };

  // Load launch options
  const loadLaunchOptions = async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}/mods/storage`);
      if (response.ok) {
        const data = await response.json();
        setLaunchOptions(data.launchOptions || "");
      }
    } catch (error) {
      console.error("Failed to load launch options:", error);
    }
  };

  // Load background fetch status
  const loadBackgroundFetchStatus = async () => {
    try {
      const response = await fetch('/api/curseforge/background-fetch');
      if (response.ok) {
        const data = await response.json();
        setBackgroundFetchStatus(data.data);
      }
    } catch (error) {
      console.error("Failed to load background fetch status:", error);
    }
  };

  // Start background fetching
  const startBackgroundFetching = async () => {
    try {
      const response = await fetch('/api/curseforge/background-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      });
      if (response.ok) {
        loadBackgroundFetchStatus();
        toast.success("Background fetching started");
      }
    } catch (error) {
      console.error("Failed to start background fetching:", error);
      toast.error("Failed to start background fetching");
    }
  };

  // Stop background fetching
  const stopBackgroundFetching = async () => {
    try {
      const response = await fetch('/api/curseforge/background-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });
      if (response.ok) {
        loadBackgroundFetchStatus();
        toast.success("Background fetching stopped");
      }
    } catch (error) {
      console.error("Failed to stop background fetching:", error);
      toast.error("Failed to stop background fetching");
    }
  };

  // Handle launch options change
  const handleLaunchOptionsChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setLaunchOptions(newValue);

    // Save launch options
    try {
      const response = await fetch(`/api/servers/${serverId}/mods/storage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ launchOptions: newValue })
      });
      if (response.ok) {
        toast.success("Launch options saved");
      }
    } catch (error) {
      console.error("Failed to save launch options:", error);
      toast.error("Failed to save launch options");
    }
  };

  // Enhanced manual mod adding with bulk support
  const handleAddManualMod = async () => {
    if (!manualModId.trim()) {
      toast.error("Please enter mod ID(s)");
      return;
    }

    // Parse multiple mod IDs if comma-separated
    const modIds = manualModId
      .split(',')
      .map(id => id.trim())
      .filter(id => id && /^\d+$/.test(id));

    if (modIds.length === 0) {
      toast.error("Please enter valid mod IDs");
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < modIds.length; i++) {
        const modId = modIds[i];
        const displayName = `Mod ${modId}`;
        
        try {
          // First try to fetch mod info from CurseForge
          let modData: any = null;
          try {
            const searchResponse = await fetch(`/api/curseforge/search?query=${modId}&searchFilter=1`);
            if (searchResponse.ok) {
              const searchData = await searchResponse.json();
              if (searchData.data && searchData.data.length > 0) {
                const foundMod = searchData.data.find((mod: any) => mod.id.toString() === modId);
                if (foundMod) {
                  modData = foundMod;
                }
              }
            }
          } catch (searchError) {
            console.warn(`Failed to fetch mod info for ${modId}:`, searchError);
          }

          // Create mod object
          const newMod = {
            id: modId,
            name: modData?.name || displayName || `Mod ${modId}`,
            description: modData?.summary || "Manually added mod",
            version: "Unknown",
            workshopId: modId,
        enabled: true,
            loadOrder: mods.length,
            dependencies: [],
            incompatibilities: [],
            size: modData?.downloadCount ? `${Math.floor(modData.downloadCount / 1000)}K downloads` : undefined,
            lastUpdated: new Date()
          };

          // Add to server
          const response = await fetch(`/api/servers/${serverId}/mods`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMod)
          });

          if (response.ok) {
            successCount++;
    } else {
            errorCount++;
            console.error(`Failed to add mod ${modId}:`, await response.text());
          }
        } catch (error) {
          errorCount++;
          console.error(`Error adding mod ${modId}:`, error);
        }
      }

      // Reload mods and show results
      await loadMods();
      
      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} mod${successCount > 1 ? 's' : ''}`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to add ${errorCount} mod${errorCount > 1 ? 's' : ''}`);
      }

      // Reset form
    setManualModId("");
    
    if (externalSetShowAddModal) {
      externalSetShowAddModal(false);
    } else {
      setShowAddModModal(false);
      }
    } catch (error) {
      console.error("Failed to add mods:", error);
      toast.error("Failed to add mod(s)");
    }
  };

  // Perform search with category context
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      // If empty search, load category mods
      loadModsForCategory(selectedCategory);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Use optimized search with category context
      const params = new URLSearchParams({
        query: query.trim(),
        gameId: "1122",
        categoryId: "",
        sortField: "popularity",
        sortOrder: "desc",
        pageIndex: "1",
        pageSize: "20",
      });

      // Add category-specific search context
      const categorySearchMap: Record<string, string> = {
        "QoL": "quality of life utility",
        "RPG": "rpg progression level",
        "Maps": "map level world",
        "Popular": "",
        "Overhauls": "overhaul total conversion",
        "General": "utility building decoration",
        "Custom Cosmetics": "cosmetic decoration skin"
      };

      const categoryContext = categorySearchMap[selectedCategory] || "";
      if (categoryContext) {
        params.set("query", `${query.trim()} ${categoryContext}`);
      }

      const response = await fetch(`/api/curseforge/search?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search mods");
      }

      const data = await response.json();
      
      if (data.data) {
        setSearchResults(data.data);
      } else {
        throw new Error(data.error || "Failed to search mods");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(error instanceof Error ? error.message : "Failed to search mods");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add mod from search results
  const addMod = async (modData: CurseForgeModData) => {
    try {
      const newMod = {
        id: modData.id.toString(),
        name: modData.name,
        description: modData.summary,
        version: "Latest",
        workshopId: modData.id.toString(),
        enabled: true,
        loadOrder: mods.length,
        dependencies: [],
        incompatibilities: [],
        size: `${Math.floor(modData.downloadCount / 1000)}K downloads`,
        lastUpdated: new Date()
      };

      const response = await fetch(`/api/servers/${serverId}/mods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMod)
      });

      if (response.ok) {
        await loadMods();
        toast.success(`Added ${modData.name}`);
      } else {
        throw new Error('Failed to add mod');
      }
    } catch (error) {
      console.error("Failed to add mod:", error);
      toast.error("Failed to add mod");
    }
  };

  // Filter mods based on selected category
  const getFilteredMods = () => {
    if (selectedCategory === "Installed") {
      let filteredMods = mods;
      
      // Apply search filter for installed mods
      if (installedModsSearchQuery.trim()) {
        const query = installedModsSearchQuery.toLowerCase();
        filteredMods = mods.filter(mod => 
          mod.name.toLowerCase().includes(query) ||
          (mod.description || '').toLowerCase().includes(query) ||
          (mod.workshopId || '').toLowerCase().includes(query)
        );
      }
      
      return filteredMods;
    }
    
    // For other categories, return the fetched CurseForge mods from searchResults
    return searchResults;
  };

  // Load mods for non-installed categories from CurseForge API
  // Strategy 1: Use client-side caching with batching and TTL
  const loadModsForCategory = async (category: string) => {
    if (category === "Installed") return;

    setIsSearching(true);
    setSearchError(null);

    try {
      // Map category names to CurseForge search parameters
      const categorySearchMap: Record<string, { query?: string; categoryId?: number }> = {
        "QoL": { query: "quality of life" },
        "RPG": { query: "rpg progression" },
        "Maps": { categoryId: 17 }, // Maps category ID in CurseForge
        "Popular": { query: "" }, // Empty query returns popular mods
        "Overhauls": { query: "overhaul total conversion" },
        "General": { query: "utility building" },
        "Custom Cosmetics": { query: "cosmetic decoration" }
      };

      const searchParams = categorySearchMap[category] || { query: category.toLowerCase() };
      
      const params = new URLSearchParams({
        query: searchParams.query || "",
        sortBy: "popularity",
        sortOrder: "desc",
        pageSize: "20"
      });

      if (searchParams.categoryId) {
        params.append("categoryId", searchParams.categoryId.toString());
      }

      // Strategy 1: Use client-side cache with batching
      const data = await modCacheClient.searchWithBatching(category, params);
      setSearchResults(data);
      
    } catch (error) {
      console.error(`Error loading ${category} mods:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to load ${category} mods`;
      setSearchError(errorMessage);
      addConsoleError(`Mod loading error: ${errorMessage}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Load category mods when category changes
  useEffect(() => {
    loadModsForCategory(selectedCategory);
  }, [selectedCategory]);

  // Strategy 2: Optionally batch load multiple categories on mount
  useEffect(() => {
    const loadMultipleCategories = async () => {
      try {
        // Load popular categories in a single batch request
        const response = await fetch('/api/curseforge/search-optimized?categories=Popular,QoL,Maps');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Pre-populate client cache with batch results
            Object.entries(data.data).forEach(([category, mods]) => {
              const categorySearchMap: Record<string, { query?: string; categoryId?: number }> = {
                "QoL": { query: "quality of life" },
                "Popular": { query: "" },
                "Maps": { categoryId: 17 }
              };
              
              const searchParams = categorySearchMap[category];
              if (searchParams) {
                const params = new URLSearchParams({
                  query: searchParams.query || "",
                  sortBy: "popularity",
                  sortOrder: "desc",
                  pageSize: "20"
                });
                if (searchParams.categoryId) {
                  params.append("categoryId", searchParams.categoryId.toString());
                }
                
                modCacheClient.setCache(category, params, mods as any[], 10 * 60 * 1000); // 10 minutes TTL
              }
            });
          }
        }
      } catch (error) {
        console.log('Strategy 2 batch loading failed, falling back to individual requests:', error);
      }
    };
    
    // Only load batch on initial mount
    loadMultipleCategories();
  }, []);

  // For search results, convert CurseForge data for display
  const getDisplayMods = (): DisplayMod[] => {
    if (selectedCategory === "Installed") {
      // Convert ModInfo to DisplayMod format
      return (getFilteredMods() as ModInfo[]).map(mod => ({
                id: mod.id,
        name: mod.name,
        description: mod.description || '',
        version: mod.version || '1.0.0',
        workshopId: mod.workshopId || mod.id,
        enabled: mod.enabled,
                loadOrder: mod.loadOrder,
        dependencies: mod.dependencies || [],
        incompatibilities: mod.incompatibilities || [],
        size: typeof mod.size === 'string' ? mod.size : 'Unknown',
        lastUpdated: mod.lastUpdated || new Date(),
      }));
    }
    
    // Convert CurseForge data to display format for non-installed tabs
    const categoryMods = getFilteredMods() as CurseForgeModData[];
    return categoryMods.map(mod => ({
      id: mod.id.toString(),
      name: mod.name,
      description: mod.summary,
      version: "Latest",
      workshopId: mod.id.toString(),
      enabled: false,
      loadOrder: 0,
      dependencies: [],
      incompatibilities: [],
      size: "Unknown",
      lastUpdated: new Date(mod.dateModified),
      _curseforgeData: mod // Store original data for adding
    }));
  };

  // Enhanced mod removal with proper API call
  const removeMod = async (modId: string) => {
    try {
      const response = await fetch(`/api/servers/${serverId}/mods`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modId }),
      });

      if (response.ok) {
        // Remove from local state
        const updatedMods = mods.filter(mod => mod.id !== modId);
          setMods(updatedMods);
        if (onModsUpdate) {
          onModsUpdate(updatedMods);
        }
        toast.success("Mod removed successfully");
        } else {
        throw new Error('Failed to remove mod');
      }
    } catch (error) {
      console.error("Failed to remove mod:", error);
      toast.error("Failed to remove mod");
    }
  };

  // Update load order
  const updateLoadOrder = async (modId: string, newLoadOrder: number) => {
    try {
      const updatedMods = mods.map(mod => 
        mod.id === modId ? { ...mod, loadOrder: newLoadOrder } : mod
      );
      
      const response = await fetch(`/api/servers/${serverId}/mods`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMods)
      });

      if (response.ok) {
        setMods(updatedMods);
        if (onModsUpdate) {
          onModsUpdate(updatedMods);
        }
      }
    } catch (error) {
      console.error("Failed to update load order:", error);
      toast.error("Failed to update load order");
    }
  };

  // Toggle mod enabled/disabled
  const toggleMod = async (modId: string) => {
    try {
      const updatedMods = mods.map(mod => 
        mod.id === modId ? { ...mod, enabled: !mod.enabled } : mod
      );
      
      const response = await fetch(`/api/servers/${serverId}/mods`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMods)
      });

      if (response.ok) {
        setMods(updatedMods);
        if (onModsUpdate) {
        onModsUpdate(updatedMods);
        }
        toast.success("Mod updated");
      }
    } catch (error) {
      console.error("Failed to toggle mod:", error);
      toast.error("Failed to update mod");
    }
  };

  // Format date helper
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const filteredMods = getFilteredMods();
  const displayMods = getDisplayMods();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-mono text-green-400">
            MOD MANAGER
          </h2>
          <p className="text-sm text-green-300/60 font-mono">
            Manage server modifications and addons
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModModal(true)}
            className="btn btn-primary btn-sm font-mono"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            ADD MANUAL MOD
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
            {MOD_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={clsx(
              "px-4 py-2 rounded-lg text-sm font-mono transition-all duration-200",
              selectedCategory === category
                ? "bg-green-400/20 text-green-400 border border-green-400/30"
                : "bg-gray-800/50 text-gray-400 border border-gray-600/30 hover:bg-gray-700/50 hover:text-green-300"
            )}
          >
            {category.toUpperCase()}
            {category === "Installed" && mods.length > 0 && (
              <span className="ml-2 bg-green-400/20 text-green-400 px-2 py-0.5 rounded text-xs">
                {mods.length}
              </span>
            )}
              </button>
            ))}
        </div>

      {/* Background Fetch Status */}
      {backgroundFetchStatus && (
        <div className="bg-gray-800/50 border border-green-400/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-mono text-green-400">CURSEFORGE CACHE STATUS</h3>
                    <div className="flex gap-2">
                      <button
                onClick={startBackgroundFetching}
                className="btn btn-success btn-xs font-mono"
                disabled={backgroundFetchStatus.isRunning}
              >
                START
                      </button>
                      <button
                onClick={stopBackgroundFetching}
                className="btn btn-error btn-xs font-mono"
                disabled={!backgroundFetchStatus.isRunning}
                      >
                STOP
                      </button>
                    </div>
                  </div>
          <div className="text-xs font-mono text-green-300/60 space-y-1">
            <div>Status: {backgroundFetchStatus.isRunning ? "RUNNING" : "STOPPED"}</div>
            <div>Can Make Request: {backgroundFetchStatus.canMakeRequest ? "YES" : "NO"}</div>
            <div>Rate Limited: {backgroundFetchStatus.rateLimited ? "YES" : "NO"}</div>
            {backgroundFetchStatus.tokenBucket && (
              <div>Tokens: {backgroundFetchStatus.tokenBucket.tokens}/{backgroundFetchStatus.tokenBucket.capacity}</div>
            )}
                    </div>
                                  </div>
      )}

      {/* Launch Options */}
      <div className="bg-gray-800/50 border border-green-400/30 rounded-lg p-4">
        <h3 className="text-sm font-mono text-green-400 mb-2">LAUNCH OPTIONS</h3>
        <textarea
          value={launchOptions}
          onChange={handleLaunchOptionsChange}
          placeholder="Enter server launch options..."
          className="w-full h-20 bg-gray-900/50 border border-green-400/30 rounded text-green-300 font-mono text-sm p-2 resize-none"
        />
      </div>

      {/* Mod List */}
      <div className="bg-gray-800/50 border border-green-400/30 rounded-lg">
        <div className="p-4 border-b border-green-400/30">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-mono text-green-400">
              {selectedCategory.toUpperCase()} MODS ({displayMods.length})
            </h3>
            
            {/* Search Bar */}
            <div className="flex gap-2">
              {selectedCategory === "Installed" ? (
                // Search installed mods
                <input
                  type="text"
                  value={installedModsSearchQuery}
                  onChange={(e) => setInstalledModsSearchQuery(e.target.value)}
                  placeholder="Search installed mods..."
                  className="input input-bordered input-sm w-64 h-8 text-sm font-mono bg-gray-800/50 border-green-400/30 text-green-300 placeholder:text-green-400/40"
                />
              ) : (
                // Search CurseForge mods
                <>
                  <input
                    type="text"
                    value={searchModalQuery}
                    onChange={(e) => setSearchModalQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setShowSearchModal(true);
                        performSearch(searchModalQuery);
                      }
                    }}
                    placeholder={`Search ${selectedCategory.toLowerCase()} mods...`}
                    className="input input-bordered input-sm w-64 h-8 text-sm font-mono bg-gray-800/50 border-green-400/30 text-green-300 placeholder:text-green-400/40"
                  />
                  <button
                    onClick={() => {
                      setShowSearchModal(true);
                      if (searchModalQuery) {
                        performSearch(searchModalQuery);
                      } else {
                        // Load category mods when no search query
                        loadModsForCategory(selectedCategory);
                      }
                    }}
                    className="btn btn-primary btn-sm font-mono bg-green-400/20 border-green-400/50 text-green-400 hover:bg-green-400/30 hover:border-green-400"
                    title={`Search ${selectedCategory.toLowerCase()} mods`}
                  >
                    <MagnifyingGlassIcon className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          {displayMods.length === 0 ? (
            <div className="text-center py-12">
              <PuzzlePieceIcon className="mx-auto h-12 w-12 text-green-400/40" />
              <h4 className="mt-2 text-sm font-medium text-green-400 font-mono">
                {selectedCategory === "Installed" ? "NO MODS INSTALLED" : `NO ${selectedCategory.toUpperCase()} MODS FOUND`}
              </h4>
              <p className="mt-1 text-sm text-green-300/60 font-mono">
                {selectedCategory === "Installed" 
                  ? "Add mods to get started with server customization."
                  : `Browse ${selectedCategory.toLowerCase()} mods and add them to your server.`
                }
              </p>
              {selectedCategory === "Installed" && (
                <button
                  onClick={() => setShowAddModModal(true)}
                  className="mt-4 btn btn-primary btn-sm font-mono"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  ADD FIRST MOD
                </button>
                                      )}
                                    </div>
                                  ) : (
            <div className="space-y-3">
              {displayMods
                .sort((a, b) => (a.loadOrder || 0) - (b.loadOrder || 0))
                .map((mod) => (
                  <div
                    key={mod.id}
                    className={clsx(
                      "bg-gray-900/50 border rounded-lg p-4 transition-all duration-200",
                      selectedCategory === "Installed"
                        ? mod.enabled
                          ? "border-green-400/30"
                          : "border-gray-600/30 opacity-60"
                        : "border-green-400/30 hover:border-green-400/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {selectedCategory === "Installed" ? (
                                    <button
                                      onClick={() => toggleMod(mod.id)}
                            title={mod.enabled ? "Disable mod" : "Enable mod"}
                            className={clsx(
                              "w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200",
                                        mod.enabled
                                ? "bg-green-400 border-green-400"
                                : "border-gray-600 hover:border-green-400"
                            )}
                          >
                            {mod.enabled && (
                              <CheckIcon className="w-3 h-3 text-gray-900" />
                            )}
                                    </button>
                        ) : (
                                    <button
                            onClick={() => addMod((mod as any)._curseforgeData)}
                            title={`Add ${mod.name} to server`}
                            className="w-8 h-8 rounded border border-green-400/30 bg-green-400/10 hover:bg-green-400/20 flex items-center justify-center transition-all duration-200"
                          >
                            <PlusIcon className="w-4 h-4 text-green-400" />
                                    </button>
                        )}

                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-green-400 font-mono">
                            {mod.name}
                    </h4>
                          <p className="text-xs text-green-300/60 font-mono">
                            {mod.description}
                          </p>
                          {mod.size && (
                            <p className="text-xs text-green-300/40 font-mono">
                              {mod.size}
                            </p>
                    )}
                  </div>
                </div>

                      <div className="flex items-center space-x-2">
                        {selectedCategory === "Installed" ? (
                          <>
                            <input
                              type="number"
                              value={mod.loadOrder || 0}
                              onChange={(e) => updateLoadOrder(mod.id, parseInt(e.target.value) || 0)}
                              title="Load order priority"
                              className="w-16 h-8 bg-gray-900/50 border border-green-400/30 rounded text-green-300 font-mono text-xs text-center"
                              min="0"
                            />
                      <button
                              onClick={() => removeMod(mod.id)}
                              title={`Remove ${mod.name}`}
                              className="btn btn-error btn-xs font-mono"
                            >
                              <TrashIcon className="w-3 h-3" />
                      </button>
                          </>
                        ) : (
                          <div className="text-xs text-green-300/40 font-mono">
                            {(mod as any)._curseforgeData?.downloadCount ? 
                              `${((mod as any)._curseforgeData.downloadCount / 1000000).toFixed(1)}M downloads` 
                              : 'Popular'
                            }
                                  </div>
                                )}
                              </div>
                                </div>
                          </div>
                        ))}
                      </div>
          )}
        </div>
                        </div>



      {/* Search Modal */}
      {showSearchModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl bg-gray-900 border border-green-400/30">
                    <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-green-400 font-mono">SEARCH CURSEFORGE MODS</h3>
                      <button
                        onClick={() => setShowSearchModal(false)}
                className="btn btn-ghost btn-sm text-green-400"
                title="Close search modal"
                aria-label="Close search modal"
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
                  className="input input-bordered flex-1 h-9 text-sm font-mono bg-gray-800 border-green-400/30 text-green-300"
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
            {searchError && (
              <div className="alert alert-error mb-4 bg-red-900/20 border-red-400/30">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <span className="font-mono text-sm text-red-300">
                  {searchError}
                        </span>
                      </div>
                    )}

                    {/* Search Results */}
                    <div className="max-h-[60vh] overflow-y-auto">
                      {isSearching ? (
                        <div className="flex items-center justify-center py-12">
                  <div className="loading loading-spinner loading-lg text-green-400"></div>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="text-center py-12">
                  <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-green-400/40" />
                  <h4 className="mt-2 text-sm font-medium text-green-400 font-mono">
                            NO RESULTS FOUND
                          </h4>
                  <p className="mt-1 text-sm text-green-300/60 font-mono">
                            Try different search terms or check your spelling.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {searchResults.map((mod) => (
                            <div
                              key={mod.id}
                      className="card bg-gray-800 border border-green-400/30 shadow-lg"
                            >
                              <div className="card-body p-4">
                                <div className="flex items-start space-x-3">
                          {mod.logo?.url && (
                                    <div className="flex-shrink-0">
                                      <Image
                                src={mod.logo.url}
                                        alt={mod.name}
                                        width={48}
                                        height={48}
                                        className="rounded-lg"
                                      />
                                    </div>
                                  )}

                                  <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-green-400 truncate font-mono">
                                      {mod.name}
                                    </h4>
                            <p className="text-xs text-green-300/60 mt-1 line-clamp-2 font-mono">
                                      {mod.summary}
                                    </p>

                            <div className="flex items-center space-x-4 mt-2 text-xs text-green-300/40 font-mono">
                                      <span>
                                        📥 {mod.downloadCount.toLocaleString()}
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
      )}

      {/* Manual Mod Modal */}
      {(showAddModModal || externalShowAddModModal) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 py-8 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
              onClick={() => {
                if (externalSetShowAddModal) {
                  externalSetShowAddModal(false);
                } else {
                  setShowAddModModal(false);
                }
              }}
              aria-hidden="true"
            />

            {/* Modal panel */}
            <div className="inline-block transform overflow-hidden rounded-2xl bg-gray-900 text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle border border-green-400/30">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800/50">
                <div className="px-6 pt-6 pb-6 sm:p-6">
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-green-400 font-mono tracking-wide">
                          ADD MANUAL MOD
                        </h3>
                        <p className="text-green-300/70 font-mono mt-2">
                          Add mods by CurseForge ID - mod details will be automatically fetched
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (externalSetShowAddModal) {
                            externalSetShowAddModal(false);
                          } else {
                            setShowAddModModal(false);
                          }
                        }}
                        className="btn btn-ghost btn-sm rounded-xl hover:bg-green-400/10 hover:text-green-400 transition-all duration-200"
                        aria-label="Close dialog"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Mod ID(s) */}
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text text-green-400 font-mono font-semibold">CurseForge Mod ID(s) *</span>
                        </label>
                        <textarea
                          value={manualModId}
                          onChange={(e) => setManualModId(e.target.value)}
                          placeholder="Enter CurseForge mod ID or multiple IDs separated by commas&#10;Examples:&#10;• Single mod: 123456&#10;• Multiple mods: 123456, 789012, 345678"
                          className="textarea textarea-bordered h-24 resize-none bg-gray-800/50 border-green-400/30 text-green-300 font-mono placeholder:text-green-400/40"
                          required
                        />
                        <div className="label">
                          <span className="label-text-alt text-green-300/60 font-mono">
                            For bulk adding, separate mod IDs with commas. Mod names and details will be automatically fetched.
                          </span>
                        </div>
                      </div>



                      {/* Action buttons */}
                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          onClick={() => {
                            if (externalSetShowAddModal) {
                              externalSetShowAddModal(false);
                            } else {
                              setShowAddModModal(false);
                            }
                          }}
                          className="btn btn-ghost text-green-400 font-mono hover:bg-green-400/10"
                        >
                          CANCEL
                        </button>
                        <button
                          onClick={handleAddManualMod}
                          disabled={!manualModId.trim()}
                          className="btn btn-primary font-mono bg-green-400/20 border-green-400/50 text-green-400 hover:bg-green-400/30 hover:border-green-400"
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          ADD MOD{manualModId.includes(',') ? 'S' : ''}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModManager;