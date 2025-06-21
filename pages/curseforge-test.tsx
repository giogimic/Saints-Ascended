import React, { useState, useEffect } from "react";
import { Layout } from "../components/ui/Layout";
import { CurseForgeAPI } from "../lib/curseforge-api";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

interface ApiKeyConfig {
  hasApiKey: boolean;
  isValidFormat: boolean;
  gameId?: number;
  gameName?: string;
}

interface CurseForgeGame {
  id: number;
  name: string;
  slug: string;
  dateModified: string;
  assets: {
    iconUrl: string;
    tileUrl: string;
    coverUrl: string;
  };
}

interface CurseForgeMod {
  id: number;
  gameId: number;
  name: string;
  slug: string;
  summary: string;
  downloadCount: number;
  dateCreated: string;
  dateModified: string;
  dateReleased: string;
  isAvailable: boolean;
  thumbsUpCount: number;
  logo: {
    thumbnailUrl: string;
    url: string;
  };
  screenshots: Array<{
    thumbnailUrl: string;
    url: string;
  }>;
  mainFileId: number;
  gamePopularityRank: number;
  primaryCategoryId: number;
  categories: Array<{
    categoryId: number;
    name: string;
    url: string;
    avatarUrl: string;
    parentId: number;
    rootId: number;
    projectId: number;
    avatarId: number;
    gameId: number;
  }>;
  classId: number;
  authors: Array<{
    id: number;
    name: string;
    url: string;
  }>;
  links: {
    websiteUrl: string;
    wikiUrl?: string;
    issuesUrl?: string;
    sourceUrl?: string;
  };
}

export default function CurseForgeTest() {
  const [gameId, setGameId] = useState(CurseForgeAPI.getGameId());
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyConfig, setApiKeyConfig] = useState<ApiKeyConfig>({
    hasApiKey: false,
    isValidFormat: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CurseForgeMod[]>([]);
  const [games, setGames] = useState<CurseForgeGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [featuredMods, setFeaturedMods] = useState<CurseForgeMod[]>([]);

  // Load API key configuration on component mount
  useEffect(() => {
    checkApiKeyConfig();
    loadGames();
  }, []);

  const checkApiKeyConfig = async () => {
    try {
      const response = await fetch("/api/curseforge/check-api-key");
      if (response.ok) {
        const data = await response.json();
        setApiKeyConfig(data);
      }
    } catch (error) {
      console.error("Failed to check API key config:", error);
    }
  };

  const loadGames = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/curseforge/games');
      const data = await response.json();
      if (data.success) {
        setGames(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load games:', error);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      const gameParam = selectedGameId ? `&gameId=${selectedGameId}` : '';
      const response = await fetch(`/api/curseforge/search?searchFilter=${encodeURIComponent(searchQuery)}${gameParam}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data || []);
        toast.success(`Found ${data.data?.length || 0} mods`);
      } else {
        toast.error(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedMods = async () => {
    try {
      setLoading(true);
      const gameParam = selectedGameId ? `?gameId=${selectedGameId}` : '';
      const response = await fetch(`/api/curseforge/featured${gameParam}`);
      const data = await response.json();
      
      if (data.success) {
        setFeaturedMods(data.data || []);
        toast.success(`Loaded ${data.data?.length || 0} featured mods`);
      } else {
        toast.error(data.error || 'Failed to load featured mods');
      }
    } catch (error) {
      console.error('Failed to load featured mods:', error);
      toast.error('Failed to load featured mods');
    } finally {
      setLoading(false);
    }
  };

  const testEndpoint = async (endpoint: string, testName: string) => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        setError(
          `${testName} failed: ${response.status} - ${data.error || data.message || "Unknown error"}`
        );
        setTestResult(data);
      } else {
        setTestResult(data);
      }
    } catch (err: any) {
      setError(`${testName} error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGamesList = () =>
    testEndpoint("/api/curseforge/games?pageSize=10", "Games List");
  const testCategories = () =>
    testEndpoint("/api/curseforge/categories", "Categories");
  const testSearch = () =>
    testEndpoint(
      "/api/curseforge/search?searchFilter=test&pageSize=5",
      "Search Mods"
    );

  const updateGameId = async () => {
    try {
      const response = await fetch("/api/curseforge/set-game-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });

      if (response.ok) {
        setError(null);
        setTestResult({ message: `Game ID updated to ${gameId}` });
        setSelectedGameId(gameId);
        checkApiKeyConfig();
      } else {
        const data = await response.json();
        setError(`Failed to update game ID: ${data.error}`);
      }
    } catch (err: any) {
      setError(`Error updating game ID: ${err.message}`);
    }
  };

  return (
    <Layout
      onAddServer={() => {}}
      onGlobalSettings={() => {}}
      globalSettings={null}
      showSidebar={false}
    >
      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 font-display">
            CurseForge API Test
          </h1>
          <p className="text-muted-foreground font-mono">
            Test the CurseForge API integration
          </p>
        </div>

        {/* API Key Status */}
        <Card className="card-cyber">
          <CardHeader>
            <CardTitle>API Key Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              variant={apiKeyConfig.hasApiKey && apiKeyConfig.isValidFormat ? "default" : "destructive"}
              className="mb-4"
            >
              {apiKeyConfig.hasApiKey && apiKeyConfig.isValidFormat ? "✅ Valid API Key" : "❌ Invalid or Missing API Key"}
            </Badge>
            
            {apiKeyConfig.gameId && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Current Game: {apiKeyConfig.gameName || 'Unknown'} (ID: {apiKeyConfig.gameId})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Section */}
        <Card className="card-cyber">
          <CardHeader>
            <CardTitle>Search Mods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Input
                type="text"
                placeholder="Search for mods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                className="btn-cyber"
              >
                {loading ? '🔄' : '🔍'} Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card className="card-cyber">
            <CardHeader>
              <CardTitle>Search Results ({searchResults.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((mod) => (
                  <Card key={mod.id} className="card-cyber-panel">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {mod.logo && (
                          <img
                            src={mod.logo.thumbnailUrl}
                            alt={mod.name}
                            className="w-12 h-12 rounded border border-border"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {mod.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {mod.summary}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {mod.downloadCount.toLocaleString()} downloads
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Games Section */}
        <Card className="card-cyber">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Available Games</CardTitle>
              <Button 
                onClick={loadGames} 
                disabled={loading}
                variant="outline"
                className="btn-cyber-outline"
              >
                🔄 Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <Card key={game.id} className="card-cyber-panel">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {game.assets?.iconUrl && (
                        <img
                          src={game.assets.iconUrl}
                          alt={game.name}
                          className="w-12 h-12 rounded border border-border"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">
                          {game.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          ID: {game.id}
                        </p>
                        <Button
                          onClick={() => setGameId(game.id)}
                          size="sm"
                          className="mt-2 btn-cyber"
                        >
                          Select Game
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Featured Mods Section */}
        <Card className="card-cyber">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Featured Mods</CardTitle>
              <Button 
                onClick={loadFeaturedMods} 
                disabled={loading}
                className="btn-cyber"
              >
                Load Featured
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {featuredMods.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredMods.map((mod) => (
                  <Card key={mod.id} className="card-cyber-panel">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {mod.logo && (
                          <img
                            src={mod.logo.thumbnailUrl}
                            alt={mod.name}
                            className="w-12 h-12 rounded border border-border"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {mod.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {mod.summary}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              ⭐ {mod.thumbsUpCount}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              📥 {mod.downloadCount.toLocaleString()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No featured mods loaded. Click &ldquo;Load Featured&rdquo; to fetch them.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card className="card-cyber">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto bg-muted p-4 rounded text-sm">
              {JSON.stringify({
                apiKeyConfig,
                selectedGameId,
                searchResultsCount: searchResults.length,
                featuredModsCount: featuredMods.length,
                gamesCount: games.length,
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Test Endpoints */}
        <Card className="card-cyber">
          <CardHeader>
            <CardTitle>Test Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={testGamesList}
                disabled={loading}
                variant="secondary"
                className="btn-cyber-outline"
              >
                Test Games List
              </Button>

              <Button
                onClick={testCategories}
                disabled={loading}
                variant="secondary"
                className="btn-cyber-outline"
              >
                Test Categories
              </Button>

              <Button
                onClick={testSearch}
                disabled={loading}
                variant="secondary"
                className="btn-cyber-outline"
              >
                Test Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Token Bucket Rate Limiter */}
        <Card className="card-cyber">
          <CardHeader>
            <CardTitle>Token Bucket Rate Limiter Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "/api/curseforge/background-fetch"
                      );
                      const data = await response.json();
                      console.log("Token bucket status:", data);
                      alert(
                        `Token bucket status: ${JSON.stringify(data, null, 2)}`
                      );
                    } catch (error) {
                      console.error("Error:", error);
                      alert("Error fetching token bucket status");
                    }
                  }}
                  className="btn-cyber"
                >
                  Check Token Bucket Status
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "/api/curseforge/background-fetch",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "start" }),
                        }
                      );
                      const data = await response.json();
                      console.log("Start response:", data);
                      alert(`Background fetching started: ${data.message}`);
                    } catch (error) {
                      console.error("Error:", error);
                      alert("Error starting background fetching");
                    }
                  }}
                  className="btn-cyber"
                >
                  Start Background Fetching
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "/api/curseforge/background-fetch",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "stop" }),
                        }
                      );
                      const data = await response.json();
                      console.log("Stop response:", data);
                      alert(`Background fetching stopped: ${data.message}`);
                    } catch (error) {
                      console.error("Error:", error);
                      alert("Error stopping background fetching");
                    }
                  }}
                  variant="destructive"
                  className="btn-cyber-destructive"
                >
                  Stop Background Fetching
                </Button>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  &bull; Token bucket allows 60 requests per minute (1 per second)
                </p>
                <p>&bull; Background fetching automatically respects rate limits</p>
                <p>&bull; Check browser console for detailed logs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <Card className="card-cyber">
            <CardContent className="flex items-center gap-2 p-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Testing API...</span>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="card-cyber border-destructive">
            <CardContent className="flex items-center gap-2 p-4 text-destructive">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </CardContent>
          </Card>
        )}

        {testResult && (
          <Card className="card-cyber">
            <CardHeader>
              <CardTitle>Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto bg-muted p-4 rounded text-sm">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
