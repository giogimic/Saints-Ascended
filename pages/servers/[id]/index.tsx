import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeftIcon, 
  ServerIcon as _ServerIcon, 
  UsersIcon, 
  SignalIcon,
  CogIcon,
  PuzzlePieceIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  StopIcon,
  WrenchScrewdriverIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import type { ServerConfig, ServerStatus } from '@/types/server';
import { useGlobalSettings } from '@/lib/global-settings';
import { GlobalSettingsModal } from '@/components/GlobalSettingsModal';
import { AddServerForm } from '@/components/forms/AddServerForm';
import { ServerConfigEditor, ServerConfigModal } from '@/components/config/ServerConfigEditor';

const ServerDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [server, setServer] = useState<ServerConfig | null>(null);
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { settings: globalSettings, updateSettings } = useGlobalSettings();
  const [showGlobalSettingsModal, setShowGlobalSettingsModal] = useState(false);
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showConfigEditor, setShowConfigEditor] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadServerData(id);
    }
  }, [id]);

  const loadServerData = async (serverId: string) => {
    try {
      setLoading(true);
      const [serverResponse, statusResponse] = await Promise.all([
        fetch(`/api/servers/${serverId}`),
        fetch(`/api/servers/${serverId}/status`)
      ]);

      if (serverResponse.ok) {
        const serverData = await serverResponse.json();
        setServer(serverData.data);
      }

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setStatus(statusData.data);
      }
    } catch (error) {
      console.error('Failed to load server data:', error);
      toast.error('Failed to load server data');
    } finally {
      setLoading(false);
    }
  };

  const handleServerAction = async (action: string) => {
    if (!server) return;

    setActionLoading(action);
    try {
      const response = await fetch(`/api/servers/${server.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Server action failed');
      }

      toast.success(`Server ${action} initiated`);
      // Reload status after action
      setTimeout(() => loadServerData(server.id), 2000);
    } catch (error) {
      console.error(`Failed to ${action} server:`, error);
      toast.error(`Failed to ${action} server`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="h-6 w-6 text-matrix-400 drop-shadow-glow" />;
      case 'offline':
        return <ExclamationTriangleIcon className="h-6 w-6 text-destructive drop-shadow-glow" />;
      case 'starting':
      case 'stopping':
        return <ClockIcon className="h-6 w-6 text-cyber-warning drop-shadow-glow animate-pulse" />;
      default:
        return <SignalIcon className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-matrix-400';
      case 'offline':
        return 'text-destructive';
      case 'starting':
      case 'stopping':
        return 'text-cyber-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-matrix-500/20 ring-matrix-500/30';
      case 'offline':
        return 'bg-destructive/20 ring-destructive/30';
      case 'starting':
      case 'stopping':
        return 'bg-cyber-warning/20 ring-cyber-warning/30';
      default:
        return 'bg-muted/20 ring-border';
    }
  };

  const handleGlobalSettingsClick = () => {
    setShowGlobalSettingsModal(true);
  };

  const handleGlobalSettingsClose = () => {
    setShowGlobalSettingsModal(false);
  };

  const handleGlobalSettingsUpdate = (settings: typeof globalSettings) => {
    if (updateSettings && settings) {
      updateSettings(settings);
    }
    setShowGlobalSettingsModal(false);
  };

  const handleAddServerSuccess = async () => {
    setShowAddServerModal(false);
    router.push('/');
  };

  const handleAddServerCancel = () => {
    setShowAddServerModal(false);
  };

  const handleConfigUpdate = async (updatedConfig: Partial<ServerConfig>) => {
    if (!server) return;

    try {
      const response = await fetch(`/api/servers/${server.id}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to update server configuration');
      }

      const result = await response.json();
      if (result.success && result.data?.server) {
        setServer(result.data.server);
        toast.success('Server configuration updated successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to update server configuration:', error);
      toast.error('Failed to update server configuration');
      throw error;
    }
  };

  if (!id || typeof id !== 'string') {
    return (
      <Layout 
        showSidebar={false} 
        globalSettings={globalSettings}
        onAddServer={() => setShowAddServerModal(true)}
        onGlobalSettings={handleGlobalSettingsClick}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      >
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
          <Card className="max-w-md w-full shadow-xl border border-destructive/20 rounded-2xl">
            <CardContent className="text-center p-8">
              <div className="w-16 h-16 bg-destructive/20 rounded-2xl flex items-center justify-center ring-2 ring-destructive/30 shadow-glow mx-auto mb-6">
                <ExclamationTriangleIcon className="h-8 w-8 text-destructive drop-shadow-glow" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4 font-display">
                Invalid Server ID
              </h1>
              <p className="text-muted-foreground mb-6 font-mono">
                The server ID is missing or invalid.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="btn-cyber rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 font-semibold tracking-wide"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout 
        showSidebar={false} 
        globalSettings={globalSettings}
        onAddServer={() => setShowAddServerModal(true)}
        onGlobalSettings={handleGlobalSettingsClick}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      >
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="mt-4 text-muted-foreground font-mono">Loading server details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!server) {
    return (
      <Layout 
        showSidebar={false} 
        globalSettings={globalSettings}
        onAddServer={() => setShowAddServerModal(true)}
        onGlobalSettings={handleGlobalSettingsClick}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      >
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
          <Card className="max-w-md w-full shadow-xl border border-destructive/20 rounded-2xl">
            <CardContent className="text-center p-8">
              <div className="w-16 h-16 bg-destructive/20 rounded-2xl flex items-center justify-center ring-2 ring-destructive/30 shadow-glow mx-auto mb-6">
                <ExclamationTriangleIcon className="h-8 w-8 text-destructive drop-shadow-glow" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4 font-display">
                Server Not Found
              </h1>
              <p className="text-muted-foreground font-mono">
                The server you&apos;re looking for doesn&apos;t exist.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="btn-cyber rounded-xl shadow-lg hover:shadow-glow transition-all duration-300 font-semibold tracking-wide mt-6"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const currentStatus = status?.status || 'offline';
  const players = status?.players || { current: 0, max: server.maxPlayers };

  return (
    <>
      <Head>
        <title>{server?.name || 'Server Details'} - {globalSettings?.siteTitle || 'Saints Ascended'}</title>
        <meta name="description" content="Server details and management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={globalSettings?.favicon || '🦕'} />
      </Head>

      <Layout 
        showSidebar={true}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onAddServer={() => setShowAddServerModal(true)}
        onGlobalSettings={() => setShowGlobalSettingsModal(true)}
        globalSettings={globalSettings}
        sidebarStats={{
          totalServers: 1, // This is a single server view
          onlineServers: status?.status === 'online' ? 1 : 0,
          totalPlayers: status?.players?.current || 0
        }}
      >
        <div className="min-h-screen bg-background text-foreground">
          {/* Header */}
          <div className="bg-card/80 backdrop-blur-sm border-b border-border shadow-lg sticky top-0 z-10">
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push('/')}
                  variant="ghost"
                  size="icon"
                  className="btn-cyber-ghost rounded-full hover:bg-muted/50 transition-all duration-200"
                  aria-label="Back to dashboard"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </Button>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-foreground font-display tracking-wide">
                    {server.name}
                  </h1>
                  <p className="text-muted-foreground font-mono text-lg mt-2">
                    {server.executablePath}:{server.port}
                  </p>
                </div>
                <Badge 
                  className={`gap-2 px-4 py-3 rounded-xl font-semibold tracking-wide text-base ${getStatusBgColor(currentStatus)} ${getStatusColor(currentStatus)}`}
                >
                  {getStatusIcon(currentStatus)}
                  <span className="capitalize">{currentStatus}</span>
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Server Overview */}
              <Card className="card-cyber">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary font-display tracking-wide">
                    Server Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="card-cyber-panel">
                      <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <UsersIcon className="h-6 w-6 text-accent" />
                          <h3 className="text-lg font-semibold text-foreground">Players</h3>
                      </div>
                      <div className="text-3xl font-bold text-accent tracking-wide">
                        {players.current}/{players.max}
                      </div>
                        <div className="text-sm font-mono text-muted-foreground mt-1">
                        {Math.round((players.current / players.max) * 100)}% capacity
                      </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="card-cyber-panel">
                      <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <SignalIcon className="h-6 w-6 text-primary" />
                          <h3 className="text-lg font-semibold text-foreground">Map</h3>
                      </div>
                        <div className="text-xl font-bold text-foreground truncate">{server.map}</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="card-cyber-panel">
                      <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                          <GlobeAltIcon className="h-6 w-6 text-neon-blue" />
                          <h3 className="text-lg font-semibold text-foreground">Port</h3>
                      </div>
                        <div className="text-xl font-bold text-foreground">{server.port}</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => handleServerAction(currentStatus === 'online' ? 'stop' : 'start')}
                      disabled={!!actionLoading || currentStatus === 'starting' || currentStatus === 'stopping'}
                      className={`px-8 py-3 rounded-xl font-semibold tracking-wide transition-all duration-300 ${
                        currentStatus === 'online' 
                          ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-glow' 
                          : 'bg-matrix-500 text-black hover:bg-matrix-400 hover:shadow-matrix-glow'
                      }`}
                      size="lg"
                    >
                      {actionLoading ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : currentStatus === 'online' ? (
                        <div className="flex items-center justify-center gap-3">
                          <StopIcon className="h-5 w-5" />
                          <span>Stop Server</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <PlayIcon className="h-5 w-5" />
                          <span>Start Server</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Server Configuration Modal */}
              {showConfigEditor && server && (
                <ServerConfigModal
                  server={server}
                  onConfigUpdate={handleConfigUpdate}
                  onCancel={() => setShowConfigEditor(false)}
                />
              )}

              {/* Navigation and Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-2">
                  <Card className="card-cyber sticky top-24">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-primary font-display tracking-wide">
                        Quick Navigation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                          onClick={() => router.push(`/servers/${server.id}/edit?tab=mods`)}
                        variant="outline"
                        className="w-full btn-cyber-outline rounded-xl py-3 text-base"
                      >
                        <PuzzlePieceIcon className="h-5 w-5 mr-3" />
                        Manage Mods
                      </Button>
                      
                      <Button
                          onClick={() => router.push(`/servers/${server.id}/edit?tab=cluster`)}
                        variant="outline"
                        className="w-full btn-cyber-outline rounded-xl py-3 text-base"
                      >
                        <GlobeAltIcon className="h-5 w-5 mr-3" />
                        Cluster Settings
                      </Button>
                      
                      <Button
                          onClick={() => router.push(`/servers/${server.id}/edit?tab=general`)}
                        variant="outline"
                        className="w-full btn-cyber-outline rounded-xl py-3 text-base"
                      >
                        <CogIcon className="h-5 w-5 mr-3" />
                        Server Config
                      </Button>
                      
                      <Button
                          onClick={() => setShowConfigEditor(!showConfigEditor)}
                        className={`w-full rounded-xl py-3 text-base ${
                            showConfigEditor 
                            ? 'btn-cyber hover:shadow-matrix-glow' 
                            : 'btn-cyber-outline'
                          }`}
                        >
                        <WrenchScrewdriverIcon className="h-5 w-5 mr-3" />
                        {showConfigEditor ? 'Hide Config' : 'Quick Config'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Server Information */}
                <div className="lg:col-span-3">
                  <Card className="card-cyber">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-primary font-display tracking-wide">
                          Server Information
                        </CardTitle>
                        <Button
                          onClick={() => router.push(`/servers/${id}/edit`)}
                          variant="outline"
                          size="sm"
                          className="btn-cyber-outline"
                          title="Edit server"
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Card className="card-cyber-panel">
                        <CardContent className="p-6">
                          <div className="text-base font-medium text-muted-foreground uppercase tracking-wider mb-3">
                            Server ID
                          </div>
                          <div className="text-lg font-mono text-foreground">{server.id}</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="card-cyber-panel">
                        <CardContent className="p-6">
                          <div className="text-base font-medium text-muted-foreground uppercase tracking-wider mb-3">
                            Max Players
                    </div>
                          <div className="text-lg font-bold text-foreground">{server.maxPlayers}</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="card-cyber-panel">
                        <CardContent className="p-6">
                          <div className="text-base font-medium text-muted-foreground uppercase tracking-wider mb-3">
                            Executable Path
                  </div>
                          <div className="text-lg font-mono text-foreground break-all">{server.executablePath}</div>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showGlobalSettingsModal && (
          <GlobalSettingsModal
            isOpen={showGlobalSettingsModal}
            settings={globalSettings}
            onSettingsUpdate={handleGlobalSettingsUpdate}
            onClose={handleGlobalSettingsClose}
          />
        )}

      {showAddServerModal && (
        <AddServerForm
          onSuccess={handleAddServerSuccess}
            onClose={handleAddServerCancel}
        />
      )}
      </Layout>
    </>
  );
};

export default ServerDetailPage; 