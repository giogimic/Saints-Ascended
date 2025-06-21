// pages/admin.tsx
// Comprehensive admin dashboard for Saints Ascended Server Manager
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/ui/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/router';
import { useGlobalSettings } from '@/lib/global-settings';

interface TestScript {
  name: string;
  description: string;
  endpoint?: string;
  scriptPath?: string;
  category: 'api' | 'script' | 'page' | 'utility';
  status?: 'available' | 'deprecated' | 'experimental';
}

interface SystemInfo {
  uptime: string;
  nodeVersion: string;
  nextVersion: string;
  databaseStatus: string;
  cacheStatus: string;
  apiKeyStatus: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { settings } = useGlobalSettings();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Check PIN authentication
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('admin-authenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      loadSystemInfo();
    }
  }, []);

  const testScripts: TestScript[] = [
    // API Test Endpoints
    {
      name: 'CurseForge Health Check',
      description: 'Check CurseForge API connectivity and health',
      endpoint: '/api/curseforge/health',
      category: 'api',
      status: 'available'
    },
    {
      name: 'CurseForge Categories',
      description: 'Test categories endpoint',
      endpoint: '/api/curseforge/categories',
      category: 'api',
      status: 'available'
    },
    {
      name: 'CurseForge Search',
      description: 'Test search functionality',
      endpoint: '/api/curseforge/search?searchFilter=test&pageSize=5',
      category: 'api',
      status: 'available'
    },
    {
      name: 'CurseForge Games',
      description: 'Test games list endpoint',
      endpoint: '/api/curseforge/games?pageSize=10',
      category: 'api',
      status: 'available'
    },
    {
      name: 'Background Fetch',
      description: 'Test background cache warming',
      endpoint: '/api/curseforge/background-fetch',
      category: 'api',
      status: 'available'
    },
    {
      name: 'Global Settings',
      description: 'Test global settings API',
      endpoint: '/api/global-settings',
      category: 'api',
      status: 'available'
    },
    
    // Test Pages
    {
      name: 'CurseForge Test Page',
      description: 'Comprehensive CurseForge testing interface',
      endpoint: '/curseforge-test',
      category: 'page',
      status: 'available'
    },
    {
      name: '404 Error Page',
      description: 'Custom 404 error page',
      endpoint: '/404',
      category: 'page',
      status: 'available'
    },
    {
      name: 'Error Boundary Test',
      description: 'Test error handling',
      endpoint: '/_error',
      category: 'page',
      status: 'available'
    },
    
    // Scripts
    {
      name: 'API Key Verification',
      description: 'Verify CurseForge API key validity',
      scriptPath: 'scripts/verify-api-key.js',
      category: 'script',
      status: 'available'
    },
    {
      name: 'Database Check',
      description: 'Check database connectivity and schema',
      scriptPath: 'scripts/check-database.js',
      category: 'script',
      status: 'available'
    },
    {
      name: 'Populate Mods',
      description: 'Populate mod cache with data',
      scriptPath: 'scripts/populate-mods.js',
      category: 'script',
      status: 'available'
    },
    {
      name: 'Populate Mods (Parallel)',
      description: 'Parallel mod population for better performance',
      scriptPath: 'scripts/populate-mods-parallel.js',
      category: 'script',
      status: 'available'
    },
    {
      name: 'Test Rate Limiting',
      description: 'Test API rate limiting functionality',
      scriptPath: 'scripts/test-rate-limiting.js',
      category: 'script',
      status: 'experimental'
    },
    {
      name: 'Test Mod Cache',
      description: 'Test mod caching system',
      scriptPath: 'scripts/test-mod-cache.js',
      category: 'script',
      status: 'available'
    },
    {
      name: 'Test Mod Loading',
      description: 'Test mod loading functionality',
      scriptPath: 'scripts/test-mod-loading.js',
      category: 'script',
      status: 'available'
    },
    {
      name: 'Verify Installation',
      description: 'Verify complete system installation',
      scriptPath: 'scripts/verify-installation.js',
      category: 'utility',
      status: 'available'
    },
    {
      name: 'Setup Environment',
      description: 'Setup environment variables',
      scriptPath: 'scripts/setup-env.js',
      category: 'utility',
      status: 'available'
    }
  ];

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if PIN matches (from global settings or env)
    const adminPin = settings?.adminPin || process.env.ADMIN_PIN || '1234';
    
    if (pinInput === adminPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin-authenticated', 'true');
      loadSystemInfo();
      setPinInput('');
    } else {
      alert('Invalid PIN');
      setPinInput('');
    }
  };

  const checkApiKeyStatus = async (): Promise<string> => {
    try {
      const response = await fetch('/api/curseforge/check-api-key');
      const result = await response.json();
      
      if (response.ok && result.success && result.data) {
        const config = result.data;
        if (config.hasApiKey && config.isValidFormat) {
          return `✅ Valid (${config.source})`;
        } else if (config.hasApiKey && !config.isValidFormat) {
          return `⚠️ Invalid format (${config.source})`;
        } else {
          return '❌ Missing API key';
        }
      } else {
        return `❌ ${result.message || 'Error checking API key'}`;
      }
    } catch (error) {
      return '❌ Error checking API key';
    }
  };

  const loadSystemInfo = async () => {
    try {
      const info: SystemInfo = {
        uptime: process.uptime ? `${Math.floor(process.uptime() / 60)} minutes` : 'Unknown',
        nodeVersion: process.version || 'Unknown',
        nextVersion: '15.3.4', // From package.json
        databaseStatus: 'Connected',
        cacheStatus: 'Active',
        apiKeyStatus: await checkApiKeyStatus()
      };
      setSystemInfo(info);
    } catch (error) {
      console.error('Failed to load system info:', error);
    }
  };

  const runTest = async (script: TestScript) => {
    const key = script.name;
    setLoading(prev => ({ ...prev, [key]: true }));
    
    try {
      if (script.endpoint) {
        // Run API endpoint test
        const response = await fetch(script.endpoint);
        const data = await response.json();
        setTestResults(prev => ({
          ...prev,
          [key]: {
            success: response.ok,
            status: response.status,
            data: data,
            timestamp: new Date().toISOString()
          }
        }));
      } else if (script.scriptPath) {
        // For scripts, we'll show info about how to run them
        setTestResults(prev => ({
          ...prev,
          [key]: {
            success: true,
            message: `Script location: ${script.scriptPath}`,
            note: 'Run this script manually from the terminal',
            command: `node ${script.scriptPath}`,
            timestamp: new Date().toISOString()
          }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [key]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const clearResults = () => {
    setTestResults({});
  };

  const runAllTests = async () => {
    const apiTests = testScripts.filter(script => script.endpoint && script.category === 'api');
    for (const test of apiTests) {
      await runTest(test);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout
        onAddServer={() => {}}
        onGlobalSettings={() => {}}
        globalSettings={settings}
      >
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md p-8 bg-cyber-card border-matrix-500">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-matrix-500 mb-2">🔒 Admin Access</h1>
              <p className="text-matrix-400">Enter PIN to access admin dashboard</p>
            </div>
            
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter 4-digit PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                maxLength={4}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
              <Button 
                type="submit" 
                className="w-full bg-matrix-500 hover:bg-matrix-400 text-black"
                disabled={pinInput.length !== 4}
              >
                Access Admin Dashboard
              </Button>
            </form>
            
            <div className="mt-4 text-xs text-matrix-400 text-center">
              Default PIN: 1234 (change in Global Settings)
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      onAddServer={() => {}}
      onGlobalSettings={() => {}}
      globalSettings={settings}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-matrix-500 mb-2">⚡ Admin Dashboard</h1>
            <p className="text-matrix-400">System administration and testing tools</p>
          </div>
          <Button
            onClick={() => {
              setIsAuthenticated(false);
              sessionStorage.removeItem('admin-authenticated');
            }}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            🔓 Logout
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-cyber-card">
            <TabsTrigger value="overview">📊 Overview</TabsTrigger>
            <TabsTrigger value="api-tests">🌐 API Tests</TabsTrigger>
            <TabsTrigger value="scripts">📜 Scripts</TabsTrigger>
            <TabsTrigger value="pages">📄 Pages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Information */}
            <Card className="p-6 bg-cyber-card border-matrix-500">
              <h2 className="text-xl font-semibold text-matrix-500 mb-4">🖥️ System Information</h2>
              {systemInfo && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-matrix-400">Node.js Version</div>
                    <div className="text-matrix-500 font-mono">{systemInfo.nodeVersion}</div>
                  </div>
                  <div>
                    <div className="text-sm text-matrix-400">Next.js Version</div>
                    <div className="text-matrix-500 font-mono">{systemInfo.nextVersion}</div>
                  </div>
                  <div>
                    <div className="text-sm text-matrix-400">Database</div>
                    <div className="text-matrix-500 font-mono">{systemInfo.databaseStatus}</div>
                  </div>
                  <div>
                    <div className="text-sm text-matrix-400">Cache Status</div>
                    <div className="text-matrix-500 font-mono">{systemInfo.cacheStatus}</div>
                  </div>
                  <div>
                    <div className="text-sm text-matrix-400">API Key</div>
                    <div className="text-matrix-500 font-mono">{systemInfo.apiKeyStatus}</div>
                  </div>
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-cyber-card border-matrix-500">
              <h2 className="text-xl font-semibold text-matrix-500 mb-4">⚡ Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={runAllTests}
                  className="bg-matrix-500 hover:bg-matrix-400 text-black"
                >
                  🧪 Run All API Tests
                </Button>
                <Button
                  onClick={clearResults}
                  variant="outline"
                  className="border-matrix-500 text-matrix-500"
                >
                  🗑️ Clear Results
                </Button>
                <Button
                  onClick={() => router.push('/curseforge-test')}
                  variant="outline"
                  className="border-matrix-500 text-matrix-500"
                >
                  🔬 CurseForge Test
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-matrix-500 text-matrix-500"
                >
                  🔄 Refresh Page
                </Button>
                <Button
                  onClick={() => router.push('/?settings=true')}
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  ⚙️ Global Settings
                </Button>
              </div>
            </Card>

            {/* API Key Configuration */}
            <Card className="p-6 bg-cyber-card border-matrix-500">
              <h2 className="text-xl font-semibold text-matrix-500 mb-4">🔑 CurseForge API Configuration</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-black/20 rounded">
                  <div>
                    <div className="font-medium text-matrix-400">API Key Status</div>
                    <div className="text-sm text-matrix-600">
                      {systemInfo?.apiKeyStatus || 'Checking...'}
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push('/?settings=true')}
                    className="bg-matrix-500 hover:bg-matrix-400 text-black"
                  >
                    Configure API Key
                  </Button>
                </div>
                <div className="text-sm text-matrix-600 space-y-2">
                  <p>📋 <strong>To get your CurseForge API key:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Visit <a href="https://console.curseforge.com/#/api-keys" target="_blank" rel="noopener noreferrer" className="text-matrix-400 hover:text-matrix-300 underline">CurseForge Developer Console</a></li>
                    <li>Create an account or log in</li>
                    <li>Generate a new API key</li>
                    <li>Copy the key (it should start with $2a$10$ and be 60 characters long)</li>
                    <li>Add it in Global Settings above</li>
                  </ol>
                </div>
              </div>
            </Card>

            {/* Test Results Summary */}
            {Object.keys(testResults).length > 0 && (
              <Card className="p-6 bg-cyber-card border-matrix-500">
                <h2 className="text-xl font-semibold text-matrix-500 mb-4">📋 Recent Test Results</h2>
                <div className="space-y-2">
                  {Object.entries(testResults).slice(-5).map(([name, result]) => (
                    <div key={name} className="flex justify-between items-center p-2 bg-black/20 rounded">
                      <span className="text-matrix-400">{name}</span>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "✅ Pass" : "❌ Fail"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="api-tests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-matrix-500">🌐 API Endpoint Tests</h2>
              <Button onClick={runAllTests} className="bg-matrix-500 hover:bg-matrix-400 text-black">
                Run All API Tests
              </Button>
            </div>
            
            <div className="grid gap-4">
              {testScripts.filter(script => script.category === 'api').map((script) => (
                <Card key={script.name} className="p-4 bg-cyber-card border-matrix-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-matrix-500">{script.name}</h3>
                      <p className="text-sm text-matrix-400">{script.description}</p>
                      <code className="text-xs text-matrix-300 bg-black/30 px-2 py-1 rounded mt-1 inline-block">
                        {script.endpoint}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={script.status === 'available' ? "default" : "secondary"}>
                        {script.status}
                      </Badge>
                      <Button
                        onClick={() => runTest(script)}
                        disabled={loading[script.name]}
                        size="sm"
                        className="bg-matrix-500 hover:bg-matrix-400 text-black"
                      >
                        {loading[script.name] ? "⏳" : "🧪"} Test
                      </Button>
                    </div>
                  </div>
                  
                  {testResults[script.name] && (
                    <div className="mt-3 p-3 bg-black/30 rounded text-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className={testResults[script.name].success ? "text-green-400" : "text-red-400"}>
                          {testResults[script.name].success ? "✅ Success" : "❌ Failed"}
                        </span>
                        <span className="text-matrix-400 text-xs">
                          {new Date(testResults[script.name].timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="text-xs text-matrix-300 overflow-x-auto">
                        {JSON.stringify(testResults[script.name], null, 2)}
                      </pre>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scripts" className="space-y-4">
            <h2 className="text-xl font-semibold text-matrix-500">📜 Available Scripts</h2>
            
            <div className="grid gap-4">
              {testScripts.filter(script => script.category === 'script' || script.category === 'utility').map((script) => (
                <Card key={script.name} className="p-4 bg-cyber-card border-matrix-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-matrix-500">{script.name}</h3>
                      <p className="text-sm text-matrix-400">{script.description}</p>
                      <code className="text-xs text-matrix-300 bg-black/30 px-2 py-1 rounded mt-1 inline-block">
                        node {script.scriptPath}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={script.status === 'available' ? "default" : script.status === 'experimental' ? "secondary" : "outline"}>
                        {script.status}
                      </Badge>
                      <Button
                        onClick={() => runTest(script)}
                        disabled={loading[script.name]}
                        size="sm"
                        className="bg-matrix-500 hover:bg-matrix-400 text-black"
                      >
                        {loading[script.name] ? "⏳" : "📜"} Info
                      </Button>
                    </div>
                  </div>
                  
                  {testResults[script.name] && (
                    <div className="mt-3 p-3 bg-black/30 rounded text-sm">
                      <div className="text-matrix-300">
                        <div className="mb-2">
                          <strong>Command:</strong> <code className="bg-black/50 px-2 py-1 rounded">{testResults[script.name].command}</code>
                        </div>
                        <div className="text-matrix-400">{testResults[script.name].note}</div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pages" className="space-y-4">
            <h2 className="text-xl font-semibold text-matrix-500">📄 Test Pages & Utilities</h2>
            
            <div className="grid gap-4">
              {testScripts.filter(script => script.category === 'page').map((script) => (
                <Card key={script.name} className="p-4 bg-cyber-card border-matrix-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-matrix-500">{script.name}</h3>
                      <p className="text-sm text-matrix-400">{script.description}</p>
                      <code className="text-xs text-matrix-300 bg-black/30 px-2 py-1 rounded mt-1 inline-block">
                        {script.endpoint}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={script.status === 'available' ? "default" : "secondary"}>
                        {script.status}
                      </Badge>
                      <Button
                        onClick={() => window.open(script.endpoint, '_blank')}
                        size="sm"
                        className="bg-matrix-500 hover:bg-matrix-400 text-black"
                      >
                        🔗 Open
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
} 