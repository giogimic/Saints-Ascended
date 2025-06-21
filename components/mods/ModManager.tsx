import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ModInfo } from "../../types/server";
import { CurseForgeModData } from "../../types/curseforge";
import {
  MagnifyingGlassIcon,
  PuzzlePieceIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import { toast } from 'react-hot-toast';
import { modCacheClient } from "@/lib/mod-cache-client";
import { 
  addConsoleInfo, 
  addConsoleSuccess, 
  addConsoleWarning, 
  addConsoleError 
} from "@/components/ui/Layout";
import { useModal } from "@/context/ModalContext";
import { ErrorHandler } from "@/lib/error-handler";
import { unifiedModManager, UnifiedModData } from "@/lib/unified-mod-manager";

// Global cache for category data to prevent duplicate API calls
const categoryDataCache = new Map<string, {
  data: CurseForgeModData[];
  timestamp: number;
  isLoading: boolean;
  error: string | null;
}>();

// Cache TTL: 5 minutes
const CATEGORY_CACHE_TTL = 5 * 60 * 1000;

// Cleanup function to clear expired cache entries
const cleanupExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of categoryDataCache.entries()) {
    if (now - value.timestamp > CATEGORY_CACHE_TTL) {
      categoryDataCache.delete(key);
    }
  }
};

// Run cleanup every 2 minutes
setInterval(cleanupExpiredCache, 2 * 60 * 1000);

// Function to clear all cache
const clearAllCategoryCache = () => {
  categoryDataCache.clear();
  console.log('[ModManager] Cleared all category cache');
};

// Function to clear specific category cache
const clearCategoryCache = (category: string) => {
  categoryDataCache.delete(category);
  console.log(`[ModManager] Cleared cache for category: ${category}`);
};

interface ModManagerProps {
  serverId: string;
  onModsUpdate: (mods: ModInfo[]) => void;
  searchQuery?: string;
  showAddModModal?: boolean;
  setShowAddModModal?: (show: boolean) => void;
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

// Cache keys for persistent storage
const getInstalledModsCacheKey = (serverId: string) => `installed_mods_${serverId}`;
const getLaunchOptionsCacheKey = (serverId: string) => `launch_options_${serverId}`;

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
  const [isLoadingMods, setIsLoadingMods] = useState(false); // Track loading state for installed mods
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

  // Save launch options to localStorage
  const saveLaunchOptionsToCache = useCallback((options: string) => {
    try {
      const cacheKey = getLaunchOptionsCacheKey(serverId);
      localStorage.setItem(cacheKey, options);
      addConsoleInfo(`💾 Cached launch options: ${options || '(empty)'}`);
    } catch (error) {
      console.error("Failed to cache launch options:", error);
    }
  }, [serverId]);

  // Load launch options from localStorage
  const loadLaunchOptionsFromCache = useCallback(() => {
    try {
      const cacheKey = getLaunchOptionsCacheKey(serverId);
      const cachedOptions = localStorage.getItem(cacheKey);
      if (cachedOptions !== null) {
        setLaunchOptions(cachedOptions);
        addConsoleInfo(`💾 Loaded launch options from cache: ${cachedOptions || '(empty)'}`);
        return cachedOptions;
      }
    } catch (error) {
      console.error("Failed to load launch options from cache:", error);
    }
    return null;
  }, [serverId]);

  // Generate launch options based on enabled mods
  const generateModLaunchOptions = useCallback((modsArray: ModInfo[]) => {
    const enabledMods = modsArray.filter(mod => mod.enabled);
    if (enabledMods.length === 0) {
      return "";
    }
    
    // Create comma-separated list of mod IDs
    const modIds = enabledMods.map(mod => mod.workshopId || mod.id).join(',');
    return `-mods=${modIds}`;
  }, []);

  // Update launch options and persist to server and cache
  const updateLaunchOptions = useCallback(async (modsArray: ModInfo[]) => {
    const newLaunchOptions = generateModLaunchOptions(modsArray);
    
    // Only update if different to prevent unnecessary operations
    if (newLaunchOptions !== launchOptions) {
      setLaunchOptions(newLaunchOptions);
      
      // Save to both localStorage cache and server
      saveLaunchOptionsToCache(newLaunchOptions);
      
      try {
        const response = await fetch(`/api/servers/${serverId}/mods/storage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ launchOptions: newLaunchOptions })
        });
        if (response.ok) {
          addConsoleInfo(`🚀 Updated mod launch options: ${newLaunchOptions || '(empty)'}`);
        } else {
          addConsoleWarning("⚠️ Failed to save launch options to server");
        }
      } catch (error) {
        console.error("Failed to save launch options:", error);
        addConsoleError(`❌ Failed to save launch options: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [launchOptions, serverId, generateModLaunchOptions, saveLaunchOptionsToCache]);

  // Instant cache loading for installed mods with launch options update
  const loadInstalledModsFromCache = useCallback(() => {
    try {
      const cacheKey = getInstalledModsCacheKey(serverId);
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const cachedMods = JSON.parse(cachedData);
        if (Array.isArray(cachedMods) && cachedMods.length > 0) {
          setMods(cachedMods);
          
          // Only generate launch options if none are cached
          const cachedLaunchOptions = loadLaunchOptionsFromCache();
          if (cachedLaunchOptions === null) {
            // Generate initial launch options from cached mods only if no cached options exist
            const initialLaunchOptions = generateModLaunchOptions(cachedMods);
            setLaunchOptions(initialLaunchOptions);
            saveLaunchOptionsToCache(initialLaunchOptions);
          }
          
          addConsoleInfo(`💾 Loaded ${cachedMods.length} installed mods from cache (instant)`);
          return cachedMods;
        }
      }
    } catch (error) {
      console.error("Failed to load mods from cache:", error);
    }
    return null;
  }, [serverId, generateModLaunchOptions, loadLaunchOptionsFromCache, saveLaunchOptionsToCache]);

  // Save installed mods to cache
  const saveInstalledModsToCache = useCallback((modsToCache: ModInfo[]) => {
    try {
      const cacheKey = getInstalledModsCacheKey(serverId);
      localStorage.setItem(cacheKey, JSON.stringify(modsToCache));
      addConsoleInfo(`💾 Cached ${modsToCache.length} installed mods for instant loading`);
    } catch (error) {
      console.error("Failed to cache mods:", error);
    }
  }, [serverId]);

  // Load launch options from server
  const loadLaunchOptions = async () => {
    try {
      const response = await fetch(`/api/servers/${serverId}/mods/storage?setting=launchOptions`);
      if (response.ok) {
        const data = await response.json();
        const serverLaunchOptions = data.data?.launchOptions;

        if (serverLaunchOptions) {
          setLaunchOptions(serverLaunchOptions);
          saveLaunchOptionsToCache(serverLaunchOptions); // Also cache it
          addConsoleInfo(`🚀 Loaded launch options from server`);
        } else {
          // If no options on server, check cache
          const cachedOptions = loadLaunchOptionsFromCache();
          if (cachedOptions === null) {
            // if nothing on server or cache, generate from mods
            const initialLaunchOptions = generateModLaunchOptions(mods);
            setLaunchOptions(initialLaunchOptions);
          }
        }
      }
    } catch (error) {
      addConsoleWarning(`Could not load launch options from server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Effect to load initial data
  useEffect(() => {
    const cachedMods = loadInstalledModsFromCache();
    // Pass cached mods to loadMods to avoid re-fetching what we have
    loadMods(cachedMods || []); 
    loadLaunchOptions();
    loadBackgroundFetchStatus();
    
    // Automatically start background fetching if not already running
    const autoStartBackgroundFetch = async () => {
      try {
        // First check current status
        const statusResponse = await fetch('/api/curseforge/background-fetch');
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (!statusData.data?.isRunning) {
            // Start background fetching automatically
            const startResponse = await fetch('/api/curseforge/background-fetch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'start' })
            });
            
            if (startResponse.ok) {
              console.log('✅ Background fetch service started automatically');
              // Reload status after starting
              loadBackgroundFetchStatus();
            } else {
              console.warn('⚠️ Failed to start background fetch service');
            }
          } else {
            console.log('✅ Background fetch service already running');
          }
        }
      } catch (error) {
        console.error('❌ Error starting background fetch service:', error);
      }
    };

    // Start background fetch with a small delay to ensure other services are ready
    const timer = setTimeout(autoStartBackgroundFetch, 1000);
    
    // Set up periodic status refresh
    const statusInterval = setInterval(loadBackgroundFetchStatus, 10000); // Refresh every 10 seconds
    
    return () => {
      clearTimeout(timer);
      clearInterval(statusInterval);
    };
  }, [serverId]);

  // Load mods with unified manager for comprehensive data
  const loadMods = async (cachedMods: ModInfo[] = [], retryCount = 0) => {
    setIsLoadingMods(true);
    
    try {
      // Add timeout to prevent hanging on mod loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Mod loading timeout')), 15000); // 15 second timeout
      });
      
      // Use unified mod manager to get comprehensive mod data with auto-fetch
      const enhancedMods = await Promise.race([
        unifiedModManager.getServerMods(serverId),
        timeoutPromise
      ]) as UnifiedModData[];
      
      // Convert UnifiedModData to ModInfo for compatibility
      const convertedMods: ModInfo[] = enhancedMods.map(mod => ({
        id: mod.id,
        name: mod.name,
        description: mod.description,
        version: mod.version,
        workshopId: mod.workshopId,
        enabled: mod.enabled,
        loadOrder: mod.loadOrder,
        dependencies: mod.dependencies,
        incompatibilities: mod.incompatibilities,
        size: typeof mod.size === 'number' ? mod.size : (mod.fileSize || 0),
        lastUpdated: mod.lastUpdated
      }));

      setMods(convertedMods);
      saveInstalledModsToCache(convertedMods);
      
      // Update launch options with comprehensive data
      const launchOptions = unifiedModManager.generateLaunchOptions(enhancedMods);
      setLaunchOptions(launchOptions);
      saveLaunchOptionsToCache(launchOptions);
      
      addConsoleSuccess(`✅ Loaded ${convertedMods.length} installed mods with comprehensive data`);
      
      if (onModsUpdate) {
        onModsUpdate(convertedMods);
      }
      
      setIsLoadingMods(false); // Clear loading state on successful completion
      
      return convertedMods;
    } catch (error) {
      console.error(`❌ Error loading mods (attempt ${retryCount + 1}):`, error);
      
      // Handle timeout specifically
      if (error instanceof Error && error.message === 'Mod loading timeout') {
        addConsoleWarning(`⏰ Mod loading timed out after 15 seconds (attempt ${retryCount + 1})`);
        
        // For timeouts, use cached data immediately if available
        if (cachedMods.length > 0) {
          console.log(`📦 Using ${cachedMods.length} cached mods due to timeout`);
          setMods(cachedMods);
          setIsLoadingMods(false);
          addConsoleInfo("💾 Loaded mods from cache due to slow API response");
          return cachedMods;
        }
      }
      
      // Retry logic with exponential backoff (but not for timeouts if we have cache)
      if (retryCount < 2 && !(error instanceof Error && error.message === 'Mod loading timeout' && cachedMods.length > 0)) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`🔄 Retrying in ${delay}ms...`);
        
        setTimeout(() => {
          loadMods(cachedMods, retryCount + 1);
        }, delay);
        return;
      }
      
      // Final fallback: use cached mods if available
      if (cachedMods.length > 0) {
        console.log(`📦 Using ${cachedMods.length} cached mods as fallback`);
        setMods(cachedMods);
        setIsLoadingMods(false);
      } else {
        // Show error state
        setIsLoadingMods(false);
        console.error('❌ No cached mods available, showing empty state');
      }
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

  const handleAddModClick = () => {
    openModal('addMods', { serverId });
  };

  // Handle launch options change
  const handleLaunchOptionsChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setLaunchOptions(newValue);

    // Save to both localStorage cache and server for persistence
    saveLaunchOptionsToCache(newValue);

    // Save launch options to server
    try {
      const response = await fetch(`/api/servers/${serverId}/mods/storage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ launchOptions: newValue })
      });
      if (response.ok) {
        toast.success("Launch options saved!");
        addConsoleSuccess(`🚀 Manually saved launch options: ${newValue || '(empty)'}`);
      } else {
        toast.error("Failed to save launch options");
        addConsoleError("❌ Failed to save launch options to server");
      }
    } catch (error) {
      console.error("Failed to save launch options:", error);
      toast.error("Failed to save launch options");
      addConsoleError(`❌ Failed to save launch options: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Enhanced manual mod adding with unified manager
  const handleAddManualMod = async () => {
    if (!manualModId.trim()) {
      toast.error("Please enter mod ID(s)");
      return;
    }

    // Parse multiple mod IDs - support both comma-separated and line-separated
    const modIds = manualModId
      .split(/[,\n\r]+/) // Split by comma, newline, or carriage return
      .map(id => id.trim())
      .filter(id => id && /^\d+$/.test(id)); // Only numeric IDs

    if (modIds.length === 0) {
      toast.error("Please enter valid numeric mod IDs");
      return;
    }

    addConsoleInfo(`🔄 Adding ${modIds.length} mod(s): ${modIds.join(', ')}`);

    try {
      // Use unified mod manager for bulk operations with comprehensive data fetching
      const result = await unifiedModManager.bulkAddMods(modIds, serverId);
      
      // Reload mods to get updated list
      await loadMods();
      
      if (result.successCount > 0) {
        toast.success(`Successfully added ${result.successCount} mod${result.successCount > 1 ? 's' : ''}`);
        addConsoleSuccess(`🎉 Bulk add completed: ${result.successCount} success, ${result.errorCount} failed`);
      }
      if (result.errorCount > 0) {
        toast.error(`Failed to add ${result.errorCount} mod${result.errorCount > 1 ? 's' : ''}`);
      }

      // Reset form and close modal
      setManualModId("");
      setShowAddModModal(false);
      
    } catch (error) {
      console.error("Failed to add mods:", error);
      toast.error("Failed to add mod(s)");
      addConsoleError(`❌ Bulk add failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Perform search with category context - searches CurseForge API for unique searches not found in DB
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchError("Please enter a search term");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Use the regular search endpoint which checks cache first, then hits API for unique searches
      const params = new URLSearchParams({
        query: query.trim(),
        sortBy: "popularity",
        sortOrder: "desc",
        pageSize: "20",
        forceRefresh: "false" // Allow cache first, but will hit API if not cached
      });

      addConsoleInfo(`🔍 Searching for "${query.trim()}" - checking cache first, then API if needed`);

      const response = await fetch(`/api/curseforge/search?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search mods");
      }

      const data = await response.json();
      
      if (data.data) {
        setSearchResults(data.data);
        addConsoleInfo(`✅ Found ${data.data.length} mods for "${query.trim()}" from ${data.source || 'unknown source'}`);
      } else {
        throw new Error(data.error || "No results found");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to search mods";
      console.error("Search error:", error);
      setSearchError(errorMessage);
      setSearchResults([]);
      
      // Enhanced error handling for system console
      addConsoleError(`❌ Search Error: ${errorMessage}`);
      addConsoleError(`📍 Context: Query="${query.trim()}", Time=${new Date().toISOString()}`);
      
      // Use the error handler for proper logging and categorization
      ErrorHandler.handleError(error, {
        component: 'ModManager',
        action: 'performSearch',
        timestamp: new Date()
      }, false); // Don't show toast, we handle it in UI
    } finally {
      setIsSearching(false);
    }
  };

  // Add mod with unified manager and comprehensive data fetching
  const addMod = async (modData: CurseForgeModData) => {
    try {
      // Use unified mod manager for comprehensive data fetching and storage
      const result = await unifiedModManager.addMod(modData.id.toString(), serverId);
      
      if (result.success) {
        toast.success(`Added ${modData.name}`);
        addConsoleSuccess(`✅ Added mod: ${modData.name} (ID: ${modData.id})`);
        
        // Close search modal after successful add
        setShowSearchModal(false);
        
        // Reload mods to get updated list with comprehensive data
        await loadMods();
        
        if (onModsUpdate) {
          const updatedMods = await unifiedModManager.getServerMods(serverId);
          onModsUpdate(updatedMods);
        }
      } else {
        throw new Error(result.error || 'Failed to add mod');
      }
    } catch (error) {
      console.error("Failed to add mod:", error);
      toast.error(`Failed to add ${modData.name}`);
      addConsoleError(`❌ Failed to add mod ${modData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    if (category === "Installed") return; // Skip for installed mods - they're cached locally

    // Check if we already have cached data for this category
    const cached = categoryDataCache.get(category);
    if (cached && !cached.isLoading) {
      if (Date.now() - cached.timestamp < CATEGORY_CACHE_TTL) {
        // Use cached data if it's still fresh
        setSearchResults(cached.data);
        setSearchError(cached.error);
        addConsoleInfo(`✅ Loaded ${cached.data.length} mods for "${category}" from cache`);
        return;
      } else {
        // Data is stale, but we can show it while loading fresh data
        setSearchResults(cached.data);
        if (cached.error) {
          setSearchError(cached.error);
        }
        addConsoleInfo(`⏳ Showing stale data for "${category}" while refreshing...`);
      }
    }

    // Check if loading is already in progress
    if (cached && cached.isLoading) {
      addConsoleInfo(`⏳ Category "${category}" is already loading...`);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    // Mark as loading in cache
    categoryDataCache.set(category, {
      data: cached?.data || [],
      timestamp: cached?.timestamp || 0,
      isLoading: true,
      error: null
    });

    try {
      // Use multiple strategies for better reliability
      const result = await loadModsWithFallback(category);
      
      if (result.success && result.data) {
        setSearchResults(result.data);
        setSearchError(null);
        
        // Update cache with fresh data
        categoryDataCache.set(category, {
          data: result.data,
          timestamp: Date.now(),
          isLoading: false,
          error: null
        });
        
        addConsoleSuccess(`✅ Loaded ${result.data.length} mods for "${category}" from ${result.source}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`Error loading mods for ${category}:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to load ${category} mods`;
      setSearchError(errorMessage);
      
      // Update cache with error state
      categoryDataCache.set(category, {
        data: cached?.data || [],
        timestamp: cached?.timestamp || 0,
        isLoading: false,
        error: errorMessage
      });
      
      addConsoleError(`❌ Failed to load ${category} mods: ${errorMessage}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Load mods with multiple fallback strategies
  const loadModsWithFallback = async (category: string): Promise<{
    success: boolean;
    data?: CurseForgeModData[];
    source?: string;
    error?: string;
  }> => {
    const strategies = [
      // Strategy 1: Optimized search endpoint with longer timeout
      async () => {
        const params = new URLSearchParams({
          category: category,
          sortBy: "popularity",
          sortOrder: "desc",
          pageSize: "20",
          comprehensive: "true"
        });

        const response = await fetch(`/api/curseforge/search-optimized?${params}`, {
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          return {
            success: true,
            data: data.data || [],
            source: 'optimized-search'
          };
        } else {
          throw new Error(data.error || 'Unknown error from optimized search');
        }
      },
      
      // Strategy 2: Regular search endpoint with moderate timeout
      async () => {
        const params = new URLSearchParams({
          query: category === "Popular" ? "" : category,
          sortBy: "popularity",
          sortOrder: "desc",
          pageSize: "20"
        });

        const response = await fetch(`/api/curseforge/search?${params}`, {
          signal: AbortSignal.timeout(25000) // 25 second timeout
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        return {
          success: true,
          data: data.data || [],
          source: 'regular-search'
        };
      },
      
      // Strategy 3: Categories endpoint as final fallback
      async () => {
        const response = await fetch('/api/curseforge/categories', {
          signal: AbortSignal.timeout(20000) // 20 second timeout
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        return {
          success: true,
          data: data.data || [],
          source: 'categories-fallback'
        };
      }
    ];

    // Cache for successful results (5 minutes TTL)
    const cachedResult = categoryDataCache.get(category);
    
    if (cachedResult && Date.now() - cachedResult.timestamp < 5 * 60 * 1000) {
      addConsoleInfo(`📋 Using cached data for category "${category}"`);
      return {
        success: true,
        data: cachedResult.data,
        source: 'cache'
      };
    }

    // Try each strategy with exponential backoff
    for (let i = 0; i < strategies.length; i++) {
      try {
        addConsoleInfo(`🔄 Trying strategy ${i + 1} for category "${category}"`);
        
        const result = await strategies[i]();
        
                 if (result.success && result.data && result.data.length > 0) {
           // Cache successful result
           categoryDataCache.set(category, {
             data: result.data,
             timestamp: Date.now(),
             isLoading: false,
             error: null
           });
          
          addConsoleInfo(`✅ Strategy ${i + 1} succeeded for "${category}" - found ${result.data.length} mods`);
          return result;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addConsoleError(`❌ Strategy ${i + 1} failed for "${category}": ${errorMessage}`);
        
        // Wait between strategies (exponential backoff)
        if (i < strategies.length - 1) {
          const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s...
          addConsoleInfo(`⏳ Waiting ${delay / 1000}s before next strategy...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All strategies failed
    addConsoleError(`💥 All strategies failed for category "${category}"`);
    return {
      success: false,
      error: `Failed to load mods for category "${category}" after trying all available methods`
    };
  };

  // Load multiple categories for better performance
  useEffect(() => {
    const loadMultipleCategories = async () => {
      if (selectedCategory !== "Installed") {
        await loadModsForCategory(selectedCategory);
      }
    };

    loadMultipleCategories();
  }, [selectedCategory]);

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
        size: typeof mod.size === 'number' ? `${Math.floor(mod.size / 1000)}K downloads` : 'Unknown',
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
      size: mod.downloadCount ? `${Math.floor(mod.downloadCount / 1000)}K downloads` : "Unknown",
      lastUpdated: new Date(mod.dateModified),
      _curseforgeData: mod // Store original data for adding
    }));
  };

  // Remove mod with unified manager and proper cleanup
  const removeMod = async (modId: string) => {
    try {
      // Use unified mod manager for removal with proper cleanup
      const result = await unifiedModManager.removeMod(modId, serverId);
      
      if (result.success) {
        toast.success(`Removed ${result.mod?.name || `Mod ${modId}`}`);
        addConsoleSuccess(`✅ Removed mod: ${result.mod?.name || `Mod ${modId}`} (ID: ${modId})`);
        
        // Reload mods to get updated list
        await loadMods();
        
        if (onModsUpdate) {
          const updatedMods = await unifiedModManager.getServerMods(serverId);
          onModsUpdate(updatedMods);
        }
      } else {
        throw new Error(result.error || 'Failed to remove mod');
      }
    } catch (error) {
      console.error("Failed to remove mod:", error);
      toast.error(`Failed to remove mod ${modId}`);
      addConsoleError(`❌ Failed to remove mod ${modId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Toggle mod enabled/disabled with unified manager
  const toggleMod = async (modId: string) => {
    try {
      // Find current mod to get current state
      const currentMod = mods.find(m => m.id === modId);
      if (!currentMod) {
        toast.error(`Mod ${modId} not found`);
        return;
      }

      // Use unified mod manager for toggle with proper state management
      const result = await unifiedModManager.toggleMod(modId, serverId, !currentMod.enabled);
      
      if (result.success) {
        const action = !currentMod.enabled ? 'enabled' : 'disabled';
        toast.success(`${currentMod.name} ${action}`);
        addConsoleInfo(`🔄 ${action.charAt(0).toUpperCase() + action.slice(1)} mod: ${currentMod.name}`);
        
        // Reload mods to get updated list
        await loadMods();
        
        if (onModsUpdate) {
          const updatedMods = await unifiedModManager.getServerMods(serverId);
          onModsUpdate(updatedMods);
        }
      } else {
        throw new Error(result.error || 'Failed to toggle mod');
      }
    } catch (error) {
      console.error("Failed to toggle mod:", error);
      toast.error(`Failed to toggle mod ${modId}`);
      addConsoleError(`❌ Failed to toggle mod ${modId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Format date helper with error handling
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Unknown';
    
    try {
      // Convert to Date object if it's a string
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
      }).format(dateObj);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  const renderFilters = () => (
    <div className="space-y-4">
      <h3 className="font-bold text-matrix-400 uppercase tracking-wider">Actions</h3>
      
      {/* Search Mods Button */}
      <button
        onClick={() => setShowSearchModal(true)}
        className="w-full bg-matrix-600 text-white px-3 py-2 text-sm hover:bg-matrix-500 transition-colors flex items-center justify-center gap-2"
        title="Search CurseForge for mods"
      >
        <MagnifyingGlassIcon className="h-4 w-4" />
        Search Mods
      </button>

      {/* Add Mods Button */}
      <button
        onClick={() => setShowAddModModal(true)}
        className="w-full bg-matrix-500 text-black px-3 py-2 text-sm hover:bg-matrix-400 transition-colors flex items-center justify-center gap-2 font-bold"
        title="Add mods by ID"
      >
        <PlusIcon className="h-4 w-4" />
        Add Mods by ID
      </button>

      <div className="border-t border-matrix-500/30 pt-4">
        <h4 className="font-bold text-matrix-400 uppercase tracking-wider text-xs mb-2">Filter Installed</h4>
      <input
        type="text"
        placeholder="Search installed mods..."
        value={installedModsSearchQuery}
        onChange={(e) => setInstalledModsSearchQuery(e.target.value)}
          className="w-full bg-cyber-bg border-2 border-matrix-500/50 focus:border-matrix-500 p-2 text-matrix-400 font-mono text-sm"
      />
      </div>
    </div>
  );

  // Enhanced launch options render with auto-generation
  const renderLaunchOptions = () => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-matrix-400 uppercase tracking-wider">Mod Launch Options</h3>
        <div className="text-xs text-matrix-600">
          Auto-generated from enabled mods
        </div>
      </div>
      <textarea
        value={launchOptions}
        onChange={handleLaunchOptionsChange}
        placeholder="-mods=ModID1,ModID2,ModID3 (Auto-generated based on enabled mods)"
        className="w-full h-24 bg-cyber-bg border-2 border-matrix-500/50 focus:border-matrix-500 p-2 text-matrix-400 font-mono resize-none text-sm"
        title="Launch options are automatically generated from your enabled mods. You can also manually edit them if needed."
      />
      <div className="text-xs text-matrix-600 mt-1">
        💡 Tip: Launch options update automatically when you enable/disable mods
      </div>
    </div>
  );

  const renderBackgroundFetchControls = () => (
    <div>
      <h3 className="font-bold text-matrix-400 uppercase tracking-wider mb-2">Cache Status</h3>
      <div className="text-xs text-matrix-600 space-y-1">
        <p>Status: {backgroundFetchStatus?.isRunning ? '🟢 Active' : '🔴 Inactive'}</p>
        <p>Rate Limited: {backgroundFetchStatus?.rateLimited ? '⚠️ Yes' : '✅ No'}</p>
        <p>Cache Warming: {backgroundFetchStatus?.cacheWarming?.isWarming ? '🔄 Warming' : '💾 Ready'}</p>
      </div>
      <div className="mt-2 text-xs text-matrix-700">
        <p>💡 Automatic caching is enabled</p>
        <p>📊 Data refreshes every 30 minutes</p>
      </div>
    </div>
  );

  // Category Mods Component - handles loading and displaying mods for a specific category
  const CategoryModsDisplay: React.FC<{ category: string }> = ({ category }) => {
    const [categoryMods, setCategoryMods] = useState<CurseForgeModData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cacheStatus, setCacheStatus] = useState<'cache' | 'api' | 'unknown'>('unknown');

    // Load mods for the selected category using existing cache flow
    useEffect(() => {
      const loadCategoryMods = async () => {
        if (category === 'Installed') return; // Skip for installed mods

        // Check global cache first
        const cached = categoryDataCache.get(category);
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < CATEGORY_CACHE_TTL) {
          // Use cached data
          setCategoryMods(cached.data);
          setError(cached.error);
          setCacheStatus('cache');
          addConsoleInfo(`💾 Loaded ${cached.data.length} mods for "${category}" from global cache`);
          return;
        }

        // Check if already loading this category
        if (cached?.isLoading) {
          setIsLoading(true);
          return;
        }

        // Set loading state in global cache
        categoryDataCache.set(category, {
          data: [],
          timestamp: now,
          isLoading: true,
          error: null
        });

        setIsLoading(true);
        setError(null);
        
        try {
          // First try the optimized search endpoint (uses cache/db flow)
          const response = await fetch(`/api/curseforge/search-optimized?category=${encodeURIComponent(category)}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch mods for ${category}: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || `Failed to load ${category} mods`);
          }
          
          const mods = data.data || [];
          
          // Update global cache
          categoryDataCache.set(category, {
            data: mods,
            timestamp: now,
            isLoading: false,
            error: null
          });
          
          setCategoryMods(mods);
          setCacheStatus(data.source === 'cache' ? 'cache' : 'api');
          
          // Log success to system console
          addConsoleInfo(`✅ Loaded ${mods.length} mods for category "${category}" from ${data.source || 'unknown source'}`);
          
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : `Failed to load ${category} mods`;
          
          // Update global cache with error
          categoryDataCache.set(category, {
            data: [],
            timestamp: now,
            isLoading: false,
            error: errorMessage
          });
          
          setError(errorMessage);
          setCategoryMods([]);
          
          // Enhanced error handling for system console
          const errorDetails = {
            category,
            error: errorMessage,
            timestamp: new Date().toISOString(),
            userAction: `Loading ${category} mods`
          };
          
          // Log to system console with context
          addConsoleError(`❌ Mod Loading Error: ${errorMessage}`);
          addConsoleError(`📍 Context: Category="${category}", Time=${errorDetails.timestamp}`);
          
          // Use the error handler for proper logging and categorization
          ErrorHandler.handleError(err, {
            component: 'ModManager',
            action: 'loadCategoryMods',
            timestamp: new Date()
          }, false); // Don't show toast, we handle it in UI
          
        } finally {
          setIsLoading(false);
        }
      };

      loadCategoryMods();
    }, [category]);

    // Loading state
    if (isLoading) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-matrix-500/30">
          <div className="loading loading-spinner loading-lg text-matrix-500 mx-auto mb-4"></div>
          <p className="text-matrix-600">Loading {category} mods...</p>
          <p className="text-xs text-matrix-700">Checking cache and fetching fresh data</p>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="text-center p-8 border-2 border-dashed border-red-500/30 bg-red-900/10">
          <ExclamationTriangleIcon className="mx-auto h-10 w-10 text-red-500 mb-4" />
          <h4 className="font-bold text-red-400 mb-2">Failed to Load {category} Mods</h4>
          <p className="text-sm text-red-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-cyber-xs bg-red-600 hover:bg-red-500"
          >
            Retry
          </button>
          <div className="mt-4 text-xs text-matrix-700">
            <p>💡 Try checking your CurseForge API key permissions</p>
            <p>📊 Cache Status: {cacheStatus}</p>
          </div>
        </div>
      );
    }

    // Empty state
    if (categoryMods.length === 0) {
      return (
        <div className="text-center p-8 border-2 border-dashed border-matrix-500/30">
          <PuzzlePieceIcon className="mx-auto h-10 w-10 text-matrix-600 mb-4" />
          <h4 className="font-bold text-matrix-500">No {category} Mods Found</h4>
          <p className="text-sm text-matrix-600">No mods available in this category</p>
          <div className="mt-4 text-xs text-matrix-700">
            <p>📊 Source: {cacheStatus === 'cache' ? 'Cache' : 'Live API'}</p>
          </div>
        </div>
      );
    }

    // Success state - display mods
    return (
      <div className="space-y-4">
        {/* Category header with cache status */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-matrix-400">
            {category} Mods ({categoryMods.length})
          </h3>
          <div className="text-xs text-matrix-600 flex items-center gap-2">
            <span className={`px-2 py-1 rounded ${cacheStatus === 'cache' ? 'bg-green-900/30 text-green-400' : 'bg-matrix-900/30 text-matrix-400'}`}>
              {cacheStatus === 'cache' ? '💾 Cached' : '🌐 Live'}
            </span>
          </div>
        </div>

        {/* Mod grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryMods.map((mod) => (
            <div
              key={mod.id}
              className="bg-cyber-bg/50 border border-matrix-500/20 p-4 hover:bg-matrix-900/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Mod logo */}
                <div className="flex-shrink-0">
                  {mod.logo?.thumbnailUrl ? (
                    <img
                      src={mod.logo.thumbnailUrl}
                      alt={mod.name}
                      className="w-12 h-12 rounded object-cover border border-matrix-500/30"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-matrix-800/50 rounded flex items-center justify-center border border-matrix-500/30">
                      <PuzzlePieceIcon className="h-6 w-6 text-matrix-600" />
                    </div>
                  )}
                </div>

                {/* Mod info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-matrix-400 text-sm truncate">
                    {mod.name}
                  </h4>
                  <p className="text-xs text-matrix-600 line-clamp-2 mt-1">
                    {mod.summary}
                  </p>
                  
                  {/* Mod stats */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-matrix-700">
                    <span>⬇️ {mod.downloadCount?.toLocaleString() || '0'}</span>
                    {mod.thumbsUpCount && mod.thumbsUpCount > 0 && (
                      <span>👍 {mod.thumbsUpCount.toLocaleString()}</span>
                    )}
                    {mod.dateModified && (
                      <span>📅 {new Date(mod.dateModified).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => addMod(mod)}
                  className="flex-1 bg-matrix-600 text-white px-3 py-1 text-xs hover:bg-matrix-500 transition-colors"
                  title="Add Mod"
                >
                  <PlusIcon className="h-4 w-4 inline mr-1" />
                  Add
                </button>
                {mod.links?.websiteUrl && (
                  <button
                    onClick={() => window.open(mod.links.websiteUrl, '_blank')}
                    className="bg-matrix-800 text-matrix-400 px-3 py-1 text-xs hover:bg-matrix-700 transition-colors"
                    title="View on CurseForge"
                  >
                    🔗
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load more button (if needed) */}
        {categoryMods.length >= 20 && (
          <div className="text-center mt-6">
            <button className="btn-cyber-xs">
              Load More {category} Mods
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render main mod list
  const renderModList = () => {
    const displayMods = getDisplayMods();
    
    // Filter installed mods by search query
    const filteredInstalledMods = displayMods.filter(mod =>
      mod.name.toLowerCase().includes(installedModsSearchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(installedModsSearchQuery.toLowerCase())
    );

    // Loading state
    if (isLoadingMods) {
      return (
        <div className="text-center p-8 border-2 border-dashed border-matrix-500/30">
          <div className="loading loading-spinner loading-lg text-matrix-500 mx-auto mb-4"></div>
          <p className="text-matrix-600">Loading installed mods...</p>
          <p className="text-xs text-matrix-700">Fetching mod data from server (timeout: 15s)</p>
          <p className="text-xs text-matrix-800 mt-2">
            {backgroundFetchStatus?.isRunning 
              ? "🔄 Background caching is active" 
              : "💡 Background caching will start automatically"
            }
          </p>
        </div>
      );
    }

    // Empty state
    if (filteredInstalledMods.length === 0) {
      return (
        <div className="text-center p-8 border-2 border-dashed border-matrix-500/30">
          <div className="text-matrix-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-matrix-400 mb-2">No Mods Found</h3>
          {installedModsSearchQuery ? (
            <div>
              <p className="text-matrix-600 mb-4">No mods match your search &quot;{installedModsSearchQuery}&quot;</p>
              <button 
                onClick={() => setInstalledModsSearchQuery("")}
                className="btn btn-sm btn-outline text-matrix-400 border-matrix-500 hover:bg-matrix-500 hover:text-black"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div>
              <p className="text-matrix-600 mb-2">No mods are currently installed on this server</p>
              <p className="text-xs text-matrix-700 mb-4">
                {backgroundFetchStatus?.isRunning 
                  ? "🔄 Background caching is active - mod data will be available soon" 
                  : "💡 Try searching for mods to install some"
                }
              </p>
              <button 
                onClick={() => setSelectedCategory("Popular")}
                className="btn btn-sm btn-primary bg-matrix-500 border-matrix-500 text-black hover:bg-matrix-400"
              >
                Browse Popular Mods
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filteredInstalledMods.map((mod) => (
          <div key={mod.id} className="bg-cyber-bg/50 border border-matrix-500/20 p-4 hover:bg-matrix-900/50 transition-colors">
            <div className="flex items-start gap-4">
              {/* Mod Icon/Logo */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-matrix-800/50 rounded flex items-center justify-center border border-matrix-500/30">
                  <PuzzlePieceIcon className="h-8 w-8 text-matrix-600" />
                </div>
              </div>

              {/* Mod Information */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-matrix-400 text-lg truncate">{mod.name}</h3>
                    <p className="text-sm text-matrix-600 mt-1 line-clamp-2">{mod.description}</p>
                    
                    {/* Mod Stats */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-matrix-700">
                      <span className="flex items-center gap-1">
                        📦 Version: {mod.version}
                      </span>
                      <span className="flex items-center gap-1">
                        🆔 ID: {mod.workshopId}
                      </span>
                      <span className="flex items-center gap-1">
                        📊 {typeof mod.size === 'number' ? `${(mod.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        📅 {formatDate(mod.lastUpdated)}
                      </span>
                    </div>

                    {/* Dependencies & Incompatibilities */}
                    {(mod.dependencies.length > 0 || mod.incompatibilities.length > 0) && (
                      <div className="mt-2 text-xs">
                        {mod.dependencies.length > 0 && (
                          <div className="text-matrix-400">
                            🔗 Dependencies: {mod.dependencies.join(', ')}
                          </div>
                        )}
                        {mod.incompatibilities.length > 0 && (
                          <div className="text-red-400">
                            ⚠️ Conflicts: {mod.incompatibilities.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Enabled/Disabled Status */}
                  <div className="flex-shrink-0 ml-4">
                    <div className={clsx(
                      "px-3 py-1 text-xs font-bold uppercase tracking-wider",
                      mod.enabled 
                        ? "bg-green-900/30 text-green-400 border border-green-500/30" 
                        : "bg-red-900/30 text-red-400 border border-red-500/30"
                    )}>
                      {mod.enabled ? "✅ Enabled" : "❌ Disabled"}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => toggleMod(mod.id)}
                    className={clsx(
                      "px-4 py-2 text-sm font-bold transition-colors",
                      mod.enabled
                        ? "bg-red-600 hover:bg-red-500 text-white"
                        : "bg-green-600 hover:bg-green-500 text-white"
                    )}
                    title={mod.enabled ? "Disable mod" : "Enable mod"}
                  >
                    {mod.enabled ? "Disable" : "Enable"}
                  </button>

                  <button
                    onClick={() => removeMod(mod.id)}
                    className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 text-sm font-bold transition-colors"
                    title="Remove mod completely"
                  >
                    Remove
                  </button>

                  {/* View on CurseForge (if available) */}
                  <button
                    onClick={() => window.open(`https://www.curseforge.com/ark-survival-ascended/mods/${mod.workshopId}`, '_blank')}
                    className="bg-matrix-600 hover:bg-matrix-500 text-white px-4 py-2 text-sm font-bold transition-colors flex items-center gap-1"
                    title="View on CurseForge"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View
                  </button>
                </div>
              </div>
            </div>

            {/* Load Order (for advanced users) */}
            <div className="mt-3 pt-3 border-t border-matrix-500/20">
              <div className="flex items-center justify-between text-xs text-matrix-700">
                <span>Load Order: {mod.loadOrder}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Move up in load order
                      const currentIndex = mods.findIndex(m => m.id === mod.id);
                      if (currentIndex > 0) {
                        const newMods = [...mods];
                        [newMods[currentIndex], newMods[currentIndex - 1]] = [newMods[currentIndex - 1], newMods[currentIndex]];
                        // Update load orders
                        newMods.forEach((m, i) => m.loadOrder = i);
                        setMods(newMods);
                        saveInstalledModsToCache(newMods);
                        updateLaunchOptions(newMods);
                      }
                    }}
                    disabled={mod.loadOrder === 0}
                    className="text-matrix-600 hover:text-matrix-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up in load order"
                  >
                    ⬆️
                  </button>
                  <button
                    onClick={() => {
                      // Move down in load order
                      const currentIndex = mods.findIndex(m => m.id === mod.id);
                      if (currentIndex < mods.length - 1) {
                        const newMods = [...mods];
                        [newMods[currentIndex], newMods[currentIndex + 1]] = [newMods[currentIndex + 1], newMods[currentIndex]];
                        // Update load orders
                        newMods.forEach((m, i) => m.loadOrder = i);
                        setMods(newMods);
                        saveInstalledModsToCache(newMods);
                        updateLaunchOptions(newMods);
                      }
                    }}
                    disabled={mod.loadOrder === mods.length - 1}
                    className="text-matrix-600 hover:text-matrix-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down in load order"
                  >
                    ⬇️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
              : <CategoryModsDisplay category={selectedCategory} />
            }
          </div>
        </div>

        {/* Search Modal */}
        {showSearchModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-cyber-panel border-2 border-matrix-500/30 shadow-matrix-glow w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-matrix-400 uppercase tracking-wider">Search CurseForge Mods</h3>
                  <button
                    onClick={() => setShowSearchModal(false)}
                    className="text-matrix-600 hover:text-matrix-400 transition-colors"
                    aria-label="Close search modal"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); performSearch(searchModalQuery); }} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchModalQuery}
                      onChange={(e) => setSearchModalQuery(e.target.value)}
                      placeholder="Search for mods... (e.g., 'quality of life', 'map', 'building')"
                      className="flex-1 bg-cyber-bg border-2 border-matrix-500/50 focus:border-matrix-500 p-3 text-matrix-400 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isSearching || !searchModalQuery.trim()}
                      className="bg-matrix-600 text-white px-6 py-3 hover:bg-matrix-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </form>

                {/* Search Error */}
                {searchError && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 text-red-400">
                    <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
                    {searchError}
                  </div>
                )}

                {/* Search Results */}
                <div className="h-[50vh] overflow-y-auto pr-2">
                  {isSearching ? (
                    <div className="text-center py-10">
                      <div className="loading loading-spinner loading-lg text-matrix-500 mx-auto mb-4"></div>
                      <p className="text-matrix-600">Searching CurseForge...</p>
                    </div>
                  ) : searchResults.length === 0 && searchModalQuery ? (
                    <div className="text-center text-matrix-600 py-10">
                      <p>No mods found. Try a different search term.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.map((mod: CurseForgeModData) => (
                        <div
                          key={mod.id}
                          className="bg-cyber-bg/50 border border-matrix-500/20 p-4 hover:bg-matrix-900/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {mod.logo?.thumbnailUrl ? (
                                <img
                                  src={mod.logo.thumbnailUrl}
                                  alt={mod.name}
                                  className="w-12 h-12 rounded object-cover border border-matrix-500/30"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-matrix-800/50 rounded flex items-center justify-center border border-matrix-500/30">
                                  <PuzzlePieceIcon className="h-6 w-6 text-matrix-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-matrix-400 text-sm truncate">{mod.name}</h4>
                              <p className="text-xs text-matrix-600 line-clamp-2 mt-1">{mod.summary}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-matrix-700">
                                <span>⬇️ {mod.downloadCount?.toLocaleString() || '0'}</span>
                                {mod.thumbsUpCount && mod.thumbsUpCount > 0 && (
                                  <span>👍 {mod.thumbsUpCount.toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => addMod(mod)}
                            className="w-full mt-3 bg-matrix-600 text-white px-3 py-2 text-xs hover:bg-matrix-500 transition-colors"
                            title="Add Mod"
                          >
                            <PlusIcon className="h-4 w-4 inline mr-1" />
                            Add Mod
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Mods by ID Modal */}
        {showAddModModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-cyber-panel border-2 border-matrix-500/30 shadow-matrix-glow w-full max-w-md mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-matrix-400 uppercase tracking-wider">Add Mods by ID</h3>
                  <button
                    onClick={() => {
                      setShowAddModModal(false);
                      setManualModId("");
                    }}
                    className="text-matrix-600 hover:text-matrix-400 transition-colors"
                    aria-label="Close add mods modal"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-matrix-400 mb-2">
                      CurseForge Mod IDs
                    </label>
                    <textarea
                      value={manualModId}
                      onChange={(e) => setManualModId(e.target.value)}
                      placeholder="Enter mod IDs separated by commas or line breaks:&#10;&#10;12345,67890,112233&#10;&#10;Or one per line:&#10;12345&#10;67890&#10;112233"
                      className="w-full h-32 bg-cyber-bg border-2 border-matrix-500/50 focus:border-matrix-500 p-3 text-matrix-400 font-mono text-sm resize-none"
                    />
                    <p className="text-xs text-matrix-600 mt-1">
                      💡 You can paste multiple mod IDs separated by commas or line breaks
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowAddModModal(false);
                        setManualModId("");
                      }}
                      className="flex-1 bg-matrix-800 text-matrix-400 px-4 py-2 hover:bg-matrix-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddManualMod}
                      disabled={!manualModId.trim()}
                      className="flex-1 bg-matrix-600 text-white px-4 py-2 hover:bg-matrix-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                      Add Mods
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModManager;