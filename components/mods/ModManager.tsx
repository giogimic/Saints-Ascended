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
import { useModal } from "@/context/ModalContext";

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
  const { openModal } = useModal();
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

  const handleAddModClick = () => {
    openModal('addMods', { serverId });
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
        toast.success("Launch options saved!");
      } else {
        toast.error("Failed to save launch options");
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

  const renderFilters = () => (
    <div className="space-y-4">
      <h3 className="font-bold text-matrix-400 uppercase tracking-wider">Filters</h3>
      <input
        type="text"
        placeholder="Search installed mods..."
        value={installedModsSearchQuery}
        onChange={(e) => setInstalledModsSearchQuery(e.target.value)}
        className="w-full bg-cyber-bg border-2 border-matrix-500/50 focus:border-matrix-500 p-2 text-matrix-400 font-mono"
      />
    </div>
  );

  const renderLaunchOptions = () => (
    <div>
      <h3 className="font-bold text-matrix-400 uppercase tracking-wider mb-2">Launch Options</h3>
      <textarea
        value={launchOptions}
        onChange={handleLaunchOptionsChange}
        placeholder="-mod=<mod_id> -another-option"
        className="w-full h-24 bg-cyber-bg border-2 border-matrix-500/50 focus:border-matrix-500 p-2 text-matrix-400 font-mono resize-none"
      />
    </div>
  );

  const renderBackgroundFetchControls = () => backgroundFetchStatus && (
    <div>
      <h3 className="font-bold text-matrix-400 uppercase tracking-wider mb-2">Cache Status</h3>
      <div className="text-xs text-matrix-600 space-y-1">
        <p>Status: {backgroundFetchStatus.isRunning ? 'Running' : 'Stopped'}</p>
        <p>Rate Limited: {backgroundFetchStatus.rateLimited ? 'Yes' : 'No'}</p>
      </div>
      <div className="flex gap-2 mt-2">
        <button onClick={startBackgroundFetching} disabled={backgroundFetchStatus.isRunning} className="btn-cyber-xs">Start</button>
        <button onClick={stopBackgroundFetching} disabled={!backgroundFetchStatus.isRunning} className="btn-cyber-xs-danger">Stop</button>
      </div>
    </div>
  );

  const renderCategoryMods = (category: string) => {
    // This function would fetch and display mods for a given category.
    // For now, it's a placeholder.
    return (
      <div className="text-center p-8 border-2 border-dashed border-matrix-500/30">
        <p className="text-matrix-600">Mods for category: <span className="text-matrix-400">{category}</span></p>
        <p className="text-xs text-matrix-700">Display logic to be implemented.</p>
      </div>
    );
  };

  // Render main mod list
  const renderModList = () => {
    const displayMods = getDisplayMods();
    return (
      <div>
        {displayMods.length === 0 ? (
          <div className="text-center p-8 border-2 border-dashed border-matrix-500/30">
            <PuzzlePieceIcon className="mx-auto h-10 w-10 text-matrix-600" />
            <h4 className="mt-4 font-bold text-matrix-500">No Mods Installed</h4>
            <p className="text-sm text-matrix-600">{`Click 'Add Mods' to get started.`}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {displayMods.map((mod) => (
              <li key={mod.id} className="flex items-center gap-4 p-3 bg-cyber-bg/50 border border-matrix-500/20">
                {/* Mod details */}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  const filteredMods = getFilteredMods();
  const displayMods = getDisplayMods();

  return (
    <div className="mod-manager-container p-4 sm:p-6 bg-cyber-panel border-2 border-matrix-500/30 shadow-matrix-glow relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5 z-0"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <PuzzlePieceIcon className="w-8 h-8 text-matrix-500 drop-shadow-matrix" />
            <div>
              <h2 className="text-2xl font-bold font-mono uppercase tracking-wider text-matrix-400 cyber-text">
                Mod Installation Matrix
              </h2>
              <p className="text-xs text-matrix-600 font-mono tracking-widest">
                SERVER ID: {serverId}
              </p>
            </div>
          </div>
          <button
            onClick={handleAddModClick}
            className="flex items-center gap-2 bg-matrix-500 text-black px-4 py-2 font-bold uppercase tracking-wider hover:bg-matrix-400 transition-colors text-sm"
          >
            <PlusIcon className="w-5 h-5" />
            Add Mods
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-matrix-500/30 mb-6">
          {MOD_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={clsx(
                "px-4 py-2 font-mono transition-all duration-200 uppercase tracking-wider text-sm",
                selectedCategory === category
                  ? "bg-matrix-500/20 text-matrix-400 border-b-2 border-matrix-500"
                  : "text-matrix-600 hover:bg-matrix-900/50 hover:text-matrix-400"
              )}
            >
              {category}
              {category === "Installed" && mods.length > 0 && (
                <span className="ml-2 bg-matrix-900/50 text-matrix-500 px-2 py-0.5 text-xs">
                  {mods.length}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Panel: Filters and Actions */}
          <div className="md:col-span-1 space-y-6">
            {renderFilters()}
            {renderLaunchOptions()}
            {renderBackgroundFetchControls()}
          </div>

          {/* Right Panel: Mod List */}
          <div className="md:col-span-3">
            {selectedCategory === 'Installed' 
              ? renderModList() 
              : renderCategoryMods(selectedCategory)
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModManager;