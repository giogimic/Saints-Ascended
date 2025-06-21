import React, { useState, useEffect, useCallback, useMemo } from "react";
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

// ShadCN UI Components for modern table layout
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

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

// Predefined mod categories using actual CurseForge categories for Ark: Survival Ascended
const MOD_CATEGORIES = [
  "Installed",
  "Structures", // CurseForge category for building/structure mods
  "Creatures", // CurseForge category for creature/dino mods  
  "Maps", // CurseForge category for custom maps
  "Popular", // Most popular mods across all categories
  "Gameplay", // CurseForge category for gameplay modifications
  "Utility", // CurseForge category for utility/QoL mods
  "Cosmetic", // CurseForge category for cosmetic/visual mods
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
        setTimeout(() => reject(new Error('Mod loading timeout after 25 seconds')), 25000); // Increased timeout
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
      console.error("Failed to load mods:", error);
      
      // Enhanced error handling with specific error types
      let errorMessage = 'Failed to load mods';
      let shouldRetry = false;
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Mod loading timed out. This may be due to network issues or server load.';
          shouldRetry = retryCount < 2; // Allow up to 2 retries for timeouts
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error while loading mods. Please check your connection.';
          shouldRetry = retryCount < 1; // Allow 1 retry for network errors
        } else if (error.message.includes('API')) {
          errorMessage = 'CurseForge API error. The service may be temporarily unavailable.';
          shouldRetry = false; // Don't retry API errors
        } else {
          errorMessage = `Unexpected error: ${error.message}`;
          shouldRetry = false;
        }
      }
      
      // Implement retry logic with exponential backoff
      if (shouldRetry) {
        const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        addConsoleInfo(`⏳ Retrying mod loading in ${retryDelay/1000} seconds... (attempt ${retryCount + 1})`);
        
        setTimeout(async () => {
          try {
            await loadMods(cachedMods, retryCount + 1);
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            setIsLoadingMods(false);
          }
        }, retryDelay);
        
        return cachedMods; // Return cached data while retrying
      }
      
      // If no retry or all retries failed, show error and use cached data
      addConsoleError(`❌ ${errorMessage}`);
      toast.error(errorMessage);
      
      // Fallback to cached mods if available
      if (cachedMods.length > 0) {
        setMods(cachedMods);
        addConsoleInfo(`📦 Using ${cachedMods.length} cached mods as fallback`);
        if (onModsUpdate) {
          onModsUpdate(cachedMods);
        }
      }
      
      setIsLoadingMods(false);
      return cachedMods;
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

      // Create a timeout controller for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(`/api/curseforge/search?${params}`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // Handle different types of errors more gracefully
          if (response.status === 404) {
            // 404 errors are now handled by fallback strategies in the API
            addConsoleInfo(`⚠️ No direct results found for "${query.trim()}", but fallback strategies may have found alternatives`);
            const errorData = await response.json().catch(() => ({ data: [], totalCount: 0 }));
            
            // If we have fallback data, use it
            if (errorData.data && errorData.data.length > 0) {
              setSearchResults(errorData.data);
              addConsoleInfo(`✅ Found ${errorData.data.length} mods using fallback search strategies`);
              return;
            } else {
              setSearchError(`No mods found for "${query.trim()}". Try a different search term.`);
              setSearchResults([]);
              addConsoleInfo(`ℹ️ No results found for "${query.trim()}" - try simpler terms like "dino", "building", or "tool"`);
              return;
            }
          } else if (response.status === 429) {
            throw new Error('Search rate limit exceeded. Please wait a moment before searching again.');
          } else if (response.status >= 500) {
            throw new Error('CurseForge service is temporarily unavailable. Please try again later.');
          } else {
            const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
            throw new Error(errorData.error || `Search failed (${response.status})`);
          }
        }

        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          setSearchResults(data.data);
          const sourceInfo = data.source ? ` from ${data.source}` : '';
          addConsoleInfo(`✅ Found ${data.data.length} mods for "${query.trim()}"${sourceInfo}`);
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          // Empty results but no error - this is valid
          setSearchResults([]);
          setSearchError(`No mods found for "${query.trim()}". Try a different search term.`);
          addConsoleInfo(`ℹ️ No results found for "${query.trim()}" - try simpler terms like "dino", "building", or "tool"`);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timeout - The search took too long to complete');
        }
        throw fetchError;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to search mods";
      console.error("Search error:", error);
      setSearchError(errorMessage);
      setSearchResults([]);
      
      // Enhanced error handling for system console
      addConsoleError(`❌ Search Error: ${errorMessage}`);
      addConsoleError(`📍 Context: Query="${query.trim()}", Time=${new Date().toISOString()}`);
      
      // Provide helpful suggestions based on error type
      if (errorMessage.includes('404') || errorMessage.includes('No mods found')) {
        addConsoleInfo(`💡 Tip: Try simpler search terms like "dino", "building", "weapon", "tool", or "skin"`);
      } else if (errorMessage.includes('timeout')) {
        addConsoleInfo(`💡 Tip: The search timed out. Try again with a shorter search term.`);
      } else if (errorMessage.includes('rate limit')) {
        addConsoleInfo(`💡 Tip: Please wait a moment before searching again.`);
      }
      
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

  // Effect to handle external search query changes from the top-right search bar
  useEffect(() => {
    if (searchQuery && searchQuery.trim() && selectedCategory !== "Installed") {
      // For non-installed categories, use the search query to filter the displayed mods
      // This will be handled in the CategoryModsDisplay component
    }
  }, [searchQuery, selectedCategory]);

  // Filter mods based on selected category and search query
  const getFilteredMods = () => {
    if (selectedCategory === "Installed") {
      let filteredMods = mods;
      
      // Apply search filter for installed mods using the installed mods search query
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
        // If no results but no error, try to get popular mods as fallback
        if (result.data && result.data.length === 0 && !result.error) {
          addConsoleWarning(`⚠️ No mods found for "${category}", trying popular mods fallback...`);
          
          try {
            const fallbackResult = await loadModsWithFallback("Popular");
            if (fallbackResult.success && fallbackResult.data && fallbackResult.data.length > 0) {
              setSearchResults(fallbackResult.data);
              categoryDataCache.set(category, {
                data: fallbackResult.data,
                timestamp: Date.now(),
                isLoading: false,
                error: null
              });
              addConsoleInfo(`✅ Showing popular mods as fallback for "${category}"`);
              return;
            }
          } catch (fallbackError) {
            console.warn("Fallback to popular mods failed:", fallbackError);
          }
        }
        
        throw new Error(result.error || `No mods found for category: ${category}`);
      }
    } catch (error) {
      console.error(`Error loading mods for ${category}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
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
      // Strategy 1: Category-specific search with proper query
      async () => {
        const categoryQuery = getCategorySearchQuery(category);
        const params = new URLSearchParams({
          query: categoryQuery,
          sortBy: "popularity",
          sortOrder: "desc",
          pageSize: "20",
          forceRefresh: "false"
        });

        addConsoleInfo(`🔍 Strategy 1: Searching with query "${categoryQuery}" for category "${category}"`);

        const response = await fetch(`/api/curseforge/search?${params}`, {
          signal: AbortSignal.timeout(25000) // 25s timeout (allows for API retries)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Check if we got actual data or just empty results
        if (data.data && data.data.length > 0) {
          return {
            success: true,
            data: data.data,
            source: `category-search (${data.source || 'api'})`
          };
        } else if (data.warning) {
          // API returned empty results but with a warning (like timeout fallback)
          throw new Error(data.warning);
        } else {
          throw new Error("No results found");
        }
      },

      // Strategy 2: Empty query with category filter (popular mods in category)
      async () => {
        const params = new URLSearchParams({
          query: "",
          sortBy: "popularity",
          sortOrder: "desc",
          pageSize: "20",
          forceRefresh: "false"
        });

        addConsoleInfo(`🔍 Strategy 2: Empty query search for popular mods`);

        const response = await fetch(`/api/curseforge/search?${params}`, {
          signal: AbortSignal.timeout(25000) // 25s timeout (allows for API retries)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          return {
            success: true,
            data: data.data,
            source: `popular-search (${data.source || 'api'})`
          };
        } else {
          throw new Error("No popular mods found");
        }
      },

      // Strategy 3: Fallback to cached data from any category
      async () => {
        addConsoleInfo(`🔍 Strategy 3: Searching cache for any available mod data`);
        
        for (const [cacheKey, cacheData] of categoryDataCache.entries()) {
          if (cacheData.data && cacheData.data.length > 0) {
            addConsoleInfo(`✅ Found cached data from category: ${cacheKey}`);
            return {
              success: true,
              data: cacheData.data,
              source: `cache-fallback (${cacheKey})`
            };
          }
        }
        
        throw new Error("No cached data available");
      },

      // Strategy 4: Demo/Sample mods fallback
      async () => {
        addConsoleInfo(`🔍 Strategy 4: Using demo mods as final fallback`);
        
        const demoMods: CurseForgeModData[] = [
          {
            id: 928621,
            gameId: 83374,
            name: "Awesome Spyglass",
            slug: "awesome-spyglass",
            links: {
              websiteUrl: "https://www.curseforge.com/ark-survival-ascended/mods/awesome-spyglass",
              wikiUrl: "",
              issuesUrl: "",
              sourceUrl: ""
            },
            summary: "A quality of life mod that enhances the spyglass functionality",
            status: 4,
            downloadCount: 150000,
            isFeatured: false,
            primaryCategoryId: 4546,
            categories: [
              {
                id: 4546,
                gameId: 83374,
                name: "Quality of Life",
                slug: "quality-of-life",
                url: "",
                iconUrl: "",
                dateModified: "2023-01-01T00:00:00Z",
                isClass: false,
                classId: 0,
                parentCategoryId: 0,
                displayIndex: 0
              }
            ],
            classId: 0,
            authors: [
              {
                id: 1,
                name: "ModAuthor",
                url: ""
              }
            ],
            logo: {
              id: 1,
              modId: 928621,
              title: "Awesome Spyglass Logo",
              description: "",
              thumbnailUrl: "/placeholder.png",
              url: "/placeholder.png"
            },
            screenshots: [],
            mainFileId: 1,
            latestFiles: [],
            latestFilesIndexes: [],
            dateCreated: "2023-01-01T00:00:00Z",
            dateModified: "2023-12-01T00:00:00Z",
            dateReleased: "2023-01-01T00:00:00Z",
            allowModDistribution: true,
            gamePopularityRank: 1,
            isAvailable: true,
            thumbsUpCount: 1200
          }
        ];

        return {
          success: true,
          data: demoMods,
          source: "demo-fallback"
        };
      }
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        const result = await strategies[i]();
        if (result.success && result.data && result.data.length > 0) {
          return result;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addConsoleWarning(`⚠️ Strategy ${i + 1} failed: ${errorMessage}`);
        
        if (i === strategies.length - 1) {
          // Last strategy failed
          return {
            success: false,
            error: `All strategies failed. Last error: ${errorMessage}`
          };
        }
      }
    }

    return {
      success: false,
      error: "All fallback strategies failed"
    };
  };

  // Helper function to get appropriate search query for each category
  const getCategorySearchQuery = (category: string): string => {
    const categoryQueries: Record<string, string> = {
      "Structures": "structures building construction",
      "Creatures": "creatures dinos dinosaurs animals",
      "Maps": "map world island custom terrain",
      "Popular": "", // Empty for popular mods
      "Gameplay": "gameplay mechanics survival features",
      "Utility": "utility quality of life tools automation",
      "Cosmetic": "cosmetic skins visual appearance texture"
    };

    return categoryQueries[category] || "";
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
      <h3 className="font-bold text-primary-green uppercase tracking-wider font-mono">Actions</h3>
      
      {/* Search Mods Button */}
      <Button
        onClick={() => setShowSearchModal(true)}
        className="w-full bg-primary-green text-bg-dark hover:bg-secondary-green"
        title="Search CurseForge for mods"
      >
        <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
        Search Mods
      </Button>

      {/* Add Mods Button */}
      <Button
        onClick={() => setShowAddModModal(true)}
        className="w-full bg-secondary-green text-bg-dark hover:bg-primary-green"
        title="Add mods by ID"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Mods by ID
      </Button>

      <div className="border-t border-primary-green/30 pt-4">
        <h4 className="font-bold text-primary-green uppercase tracking-wider text-xs mb-2 font-mono">Filter Installed</h4>
        <Input
          type="text"
          placeholder="Search installed mods..."
          value={installedModsSearchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstalledModsSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  );

  // Enhanced launch options render with auto-generation
  const renderLaunchOptions = () => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-primary-green uppercase tracking-wider font-mono">Mod Launch Options</h3>
        <div className="text-xs text-text-muted font-mono">
          Auto-generated from enabled mods
        </div>
      </div>
      <Textarea
        value={launchOptions}
        onChange={handleLaunchOptionsChange}
        placeholder="-mods=ModID1,ModID2,ModID3 (Auto-generated based on enabled mods)"
        className="h-24"
        title="Launch options are automatically generated from your enabled mods. You can also manually edit them if needed."
      />
      <div className="text-xs text-text-muted mt-1 font-mono">
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

    useEffect(() => {
      const loadCategoryMods = async () => {
        if (category === "Installed") return;
        
        setIsLoading(true);
        setError(null);

        try {
          const result = await loadModsWithFallback(category);
          
          if (result.success && result.data) {
            setCategoryMods(result.data);
            addConsoleSuccess(`✅ Loaded ${result.data.length} mods for "${category}" from ${result.source}`);
          } else {
            setError(result.error || `Failed to load ${category} mods`);
            setCategoryMods([]);
            addConsoleError(`❌ Failed to load ${category} mods: ${result.error}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          setError(errorMessage);
          setCategoryMods([]);
          addConsoleError(`❌ Error loading ${category} mods: ${errorMessage}`);
        } finally {
          setIsLoading(false);
        }
      };

      loadCategoryMods();
    }, [category]);

    // Filter category mods based on the top-right search query
    const getFilteredCategoryMods = () => {
      if (!searchQuery || !searchQuery.trim()) {
        return categoryMods;
      }
      
      const query = searchQuery.toLowerCase();
      return categoryMods.filter(mod => 
        mod.name.toLowerCase().includes(query) ||
        (mod.summary || '').toLowerCase().includes(query) ||
        (mod.authors && mod.authors.some(author => 
          author.name.toLowerCase().includes(query)
        ))
      );
    };

    const filteredMods = getFilteredCategoryMods();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-matrix-500 mx-auto mb-4"></div>
            <p className="text-matrix-400 font-mono">Loading {category} mods...</p>
            <p className="text-matrix-600 text-xs mt-2">Searching CurseForge and cache...</p>
          </div>
        </div>
      );
    }

    if (error && categoryMods.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <h3 className="text-red-400 font-bold mb-2">Failed to Load Mods</h3>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                // Trigger reload
                const loadCategoryMods = async () => {
                  try {
                    const result = await loadModsWithFallback(category);
                    if (result.success && result.data) {
                      setCategoryMods(result.data);
                    } else {
                      setError(result.error || `Failed to load ${category} mods`);
                    }
                  } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    setError(errorMessage);
                  } finally {
                    setIsLoading(false);
                  }
                };
                loadCategoryMods();
              }}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-mono text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (filteredMods.length === 0 && categoryMods.length > 0) {
      // Search query filtered out all results
      return (
        <div className="text-center py-8">
          <MagnifyingGlassIcon className="h-12 w-12 text-matrix-600 mx-auto mb-4" />
          <p className="text-matrix-600 font-mono">No mods found matching &ldquo;{searchQuery}&rdquo;</p>
          <p className="text-matrix-700 text-sm mt-2">Try a different search term or clear the search</p>
        </div>
      );
    }

    if (categoryMods.length === 0) {
      return (
        <div className="text-center py-8">
          <PuzzlePieceIcon className="h-12 w-12 text-matrix-600 mx-auto mb-4" />
          <p className="text-matrix-600 font-mono">No mods found for {category}</p>
          <p className="text-matrix-700 text-sm mt-2">Try a different category or search term</p>
        </div>
      );
    }

    // Check if we're showing demo mods and display a notice
    const isDemoData = categoryMods.some(mod => mod.id === 928621 && mod.name === "Awesome Spyglass");

    return (
      <div className="space-y-4">
        {isDemoData && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
              <div>
                <h4 className="text-yellow-400 font-bold text-sm">Demo Mode</h4>
                <p className="text-yellow-300 text-xs">
                  Showing sample mods due to API connectivity issues. Please check your internet connection or try again later.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMods.map((mod) => (
            <div
              key={mod.id}
              className="bg-cyber-panel border border-matrix-500/30 rounded-lg p-4 hover:border-matrix-500 transition-colors group"
            >
              <div className="flex items-start gap-3">
                {mod.logo?.url && mod.logo.url !== "/placeholder.png" && (
                  <Image
                    src={mod.logo.url}
                    alt={mod.name}
                    width={48}
                    height={48}
                    className="rounded border border-matrix-500/30 flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-matrix-400 text-sm truncate group-hover:text-matrix-300 transition-colors">
                    {mod.name}
                  </h3>
                  <p className="text-matrix-600 text-xs line-clamp-2 mt-1">
                    {mod.summary}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-matrix-700 text-xs">
                      {mod.downloadCount?.toLocaleString()} downloads
                    </span>
                    <button
                      onClick={() => addMod(mod)}
                      className="bg-matrix-600 hover:bg-matrix-500 text-white p-1 rounded transition-colors"
                      title={`Add ${mod.name}`}
                      disabled={isDemoData}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render main mod list using ShadCN Table - [Small Pic] | Mod Name | Author | Category | ModID | Actions
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
        <div className="text-center p-8 border-2 border-dashed border-primary-green/30">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green mx-auto mb-4"></div>
          <p className="text-text-secondary font-mono">Loading installed mods...</p>
          <p className="text-xs text-text-muted">Fetching mod data from server (timeout: 25s)</p>
          <p className="text-xs text-text-muted mt-2">
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
        <div className="text-center p-8 border-2 border-dashed border-primary-green/30">
          <div className="text-text-secondary mb-4">
            <PuzzlePieceIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-primary-green mb-2 font-mono uppercase">No Mods Found</h3>
          {installedModsSearchQuery ? (
            <div>
              <p className="text-text-secondary mb-4">No mods match your search &quot;{installedModsSearchQuery}&quot;</p>
              <Button 
                onClick={() => setInstalledModsSearchQuery("")}
                variant="outline"
                className="border-primary-green/50 text-primary-green hover:bg-primary-green/20"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-text-secondary mb-2">No mods are currently installed on this server</p>
              <p className="text-xs text-text-muted mb-4">
                {backgroundFetchStatus?.isRunning 
                  ? "🔄 Background caching is active - mod data will be available soon" 
                  : "💡 Try searching for mods to install some"
                }
              </p>
              <Button 
                onClick={() => setSelectedCategory("Popular")}
                className="bg-primary-green text-bg-dark hover:bg-secondary-green"
              >
                Browse Popular Mods
              </Button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-cyber-panel border border-primary-green/20 shadow-lg shadow-primary-green/10">
        <Table>
          <TableHeader>
            <TableRow className="border-primary-green/20 hover:bg-primary-green/5">
              <TableHead className="w-16 text-primary-green font-mono uppercase">Image</TableHead>
              <TableHead className="text-primary-green font-mono uppercase">Mod Name</TableHead>
              <TableHead className="text-primary-green font-mono uppercase">Author</TableHead>
              <TableHead className="text-primary-green font-mono uppercase">Category</TableHead>
              <TableHead className="text-primary-green font-mono uppercase">Mod ID</TableHead>
              <TableHead className="text-primary-green font-mono uppercase">Status</TableHead>
              <TableHead className="w-32 text-primary-green font-mono uppercase">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInstalledMods.map((mod) => (
              <TableRow 
                key={mod.id} 
                className="border-primary-green/10 hover:bg-primary-green/5 transition-colors"
              >
                {/* Small Pic */}
                <TableCell>
                  <Avatar className="h-8 w-8 border border-primary-green/30">
                    <AvatarImage 
                      src={mod._curseforgeData?.logo?.thumbnailUrl || "/placeholder.png"} 
                      alt={mod.name} 
                    />
                    <AvatarFallback className="bg-cyber-panel text-primary-green text-xs font-mono">
                      {mod.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>

                {/* Mod Name */}
                <TableCell className="font-mono text-primary-green">
                  <div>
                    <div className="font-bold truncate max-w-[200px]" title={mod.name}>
                      {mod.name}
                    </div>
                    <div className="text-xs text-text-secondary truncate max-w-[200px]" title={mod.description}>
                      {mod.description}
                    </div>
                  </div>
                </TableCell>

                {/* Author */}
                <TableCell className="text-text-secondary font-mono">
                  {mod._curseforgeData?.authors?.[0]?.name || "Unknown"}
                </TableCell>

                {/* Category */}
                <TableCell>
                  <Badge variant="cyberpunk" className="text-xs">
                    {mod._curseforgeData?.categories?.[0]?.name || "Utility"}
                  </Badge>
                </TableCell>

                {/* Mod ID */}
                <TableCell className="font-mono text-primary-green font-bold">
                  {mod.workshopId}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge 
                    variant={mod.enabled ? "default" : "outline"}
                    className={clsx(
                      "text-xs font-mono uppercase",
                      mod.enabled 
                        ? "bg-green-500/20 text-green-400 border-green-500/30" 
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    )}
                  >
                    {mod.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => toggleMod(mod.id)}
                      size="sm"
                      variant={mod.enabled ? "destructive" : "default"}
                      className={clsx(
                        "text-xs px-2 py-1 h-7",
                        mod.enabled
                          ? "bg-red-600/80 hover:bg-red-600 text-white"
                          : "bg-green-600/80 hover:bg-green-600 text-white"
                      )}
                      title={mod.enabled ? "Disable mod" : "Enable mod"}
                    >
                      {mod.enabled ? "Off" : "On"}
                    </Button>

                    <Button
                      onClick={() => removeMod(mod.id)}
                      size="sm"
                      variant="destructive"
                      className="text-xs px-2 py-1 h-7 bg-red-700/80 hover:bg-red-700"
                      title="Remove mod completely"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </Button>

                    <Button
                      onClick={() => window.open(`https://www.curseforge.com/ark-survival-ascended/mods/${mod.workshopId}`, '_blank')}
                      size="sm"
                      variant="ghost"
                      className="text-xs px-2 py-1 h-7 text-primary-green hover:bg-primary-green/20"
                      title="View on CurseForge"
                    >
                      <EyeIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Load Order Controls - Simplified for table view */}
        {filteredInstalledMods.length > 1 && (
          <div className="p-4 border-t border-primary-green/20 bg-cyber-panel/50">
            <div className="text-xs text-text-muted font-mono">
              💡 Load order: {filteredInstalledMods.map(mod => `${mod.name} (${mod.loadOrder})`).join(', ')}
            </div>
          </div>
        )}
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

        {/* Tab Navigation using ShadCN Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="bg-cyber-panel border border-primary-green/20 w-full justify-start">
            {MOD_CATEGORIES.map((category) => (
              <TabsTrigger 
                key={category}
                value={category}
                className="font-mono uppercase tracking-wider text-sm data-[state=active]:bg-primary-green/20 data-[state=active]:text-primary-green"
              >
                {category}
                {category === "Installed" && mods.length > 0 && (
                  <Badge variant="cyberpunk" className="ml-2 text-xs px-1 py-0">
                    {mods.length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          {MOD_CATEGORIES.map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Left Panel: Filters and Actions */}
                <div className="md:col-span-1 space-y-6">
                  {renderFilters()}
                  {renderLaunchOptions()}
                  {renderBackgroundFetchControls()}
                </div>

                {/* Right Panel: Mod List */}
                <div className="md:col-span-3">
                  {category === 'Installed' 
                    ? renderModList() 
                    : <CategoryModsDisplay category={category} />
                  }
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Search Modal using ShadCN Dialog */}
        <Dialog open={showSearchModal} onOpenChange={setShowSearchModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-primary-green uppercase tracking-wider font-mono">
                Search CurseForge Mods
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">

              <form onSubmit={(e) => { e.preventDefault(); performSearch(searchModalQuery); }} className="mb-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={searchModalQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchModalQuery(e.target.value)}
                    placeholder="Search for mods... (e.g., 'quality of life', 'map', 'building')"
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isSearching || !searchModalQuery.trim()}
                    className="bg-primary-green text-bg-dark hover:bg-secondary-green"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </form>

              {/* Search Error */}
              {searchError && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded">
                  <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
                  {searchError}
                </div>
              )}

              {/* Search Results */}
              <div className="h-[50vh] overflow-y-auto pr-2">
                {isSearching ? (
                  <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green mx-auto mb-4"></div>
                    <p className="text-text-secondary font-mono">Searching CurseForge...</p>
                  </div>
                ) : searchResults.length === 0 && searchModalQuery ? (
                  <div className="text-center text-text-secondary py-10">
                    <p>No mods found. Try a different search term.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((mod: CurseForgeModData) => (
                      <div
                        key={mod.id}
                        className="bg-cyber-panel border border-primary-green/20 p-4 hover:bg-primary-green/5 transition-colors rounded"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={mod.logo?.thumbnailUrl} alt={mod.name} />
                            <AvatarFallback className="bg-cyber-panel text-primary-green text-xs">
                              {mod.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-primary-green text-sm truncate font-mono">{mod.name}</h4>
                            <p className="text-xs text-text-secondary line-clamp-2 mt-1">{mod.summary}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                              <span>⬇️ {mod.downloadCount?.toLocaleString() || '0'}</span>
                              {mod.thumbsUpCount && mod.thumbsUpCount > 0 && (
                                <span>👍 {mod.thumbsUpCount.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => addMod(mod)}
                          className="w-full mt-3 bg-primary-green text-bg-dark hover:bg-secondary-green"
                          size="sm"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Mod
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Mods by ID Modal using ShadCN Dialog */}
        <Dialog open={showAddModModal} onOpenChange={(open: boolean) => {
          setShowAddModModal(open);
          if (!open) setManualModId("");
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-primary-green uppercase tracking-wider font-mono">
                Add Mods by ID
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-primary-green mb-2 font-mono">
                  CurseForge Mod IDs
                </label>
                <textarea
                  value={manualModId}
                  onChange={(e) => setManualModId(e.target.value)}
                  placeholder="Enter mod IDs separated by commas or line breaks:&#10;&#10;12345,67890,112233&#10;&#10;Or one per line:&#10;12345&#10;67890&#10;112233"
                  className="w-full h-32 bg-cyber-panel border border-primary-green/30 focus:border-primary-green p-3 text-primary-green font-mono text-sm resize-none rounded"
                />
                <p className="text-xs text-text-muted mt-1 font-mono">
                  💡 You can paste multiple mod IDs separated by commas or line breaks
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowAddModModal(false);
                    setManualModId("");
                  }}
                  variant="outline"
                  className="flex-1 border-primary-green/50 text-primary-green hover:bg-primary-green/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddManualMod}
                  disabled={!manualModId.trim()}
                  className="flex-1 bg-primary-green text-bg-dark hover:bg-secondary-green"
                >
                  Add Mods
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ModManager;