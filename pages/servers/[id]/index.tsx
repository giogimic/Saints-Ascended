import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Layout } from '@/components/ui/Layout';
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
        return <CheckCircleIcon className="h-6 w-6 text-success drop-shadow-glow" />;
      case 'offline':
        return <ExclamationTriangleIcon className="h-6 w-6 text-error drop-shadow-glow" />;
      case 'starting':
      case 'stopping':
        return <ClockIcon className="h-6 w-6 text-warning drop-shadow-glow animate-pulse" />;
      default:
        return <SignalIcon className="h-6 w-6 text-base-content/50" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-success';
      case 'offline':
        return 'text-error';
      case 'starting':
      case 'stopping':
        return 'text-warning';
      default:
        return 'text-base-content/50';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-success/20 ring-success/30';
      case 'offline':
        return 'bg-error/20 ring-error/30';
      case 'starting':
      case 'stopping':
        return 'bg-warning/20 ring-warning/30';
      default:
        return 'bg-base-content/10 ring-base-content/20';
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
        <div className="min-h-screen bg-base-100 text-base-content flex items-center justify-center px-4">
          <div className="card bg-base-200 shadow-xl border border-base-300 rounded-2xl max-w-md w-full">
            <div className="card-body text-center p-8">
              <div className="w-16 h-16 bg-error/20 rounded-2xl flex items-center justify-center ring-2 ring-error/30 shadow-glow shadow-error/20 mx-auto mb-6">
                <ExclamationTriangleIcon className="h-8 w-8 text-error drop-shadow-glow" />
              </div>
              <h1 className="text-2xl font-bold text-base-content mb-4 font-display">
                Invalid Server ID
              </h1>
              <p className="text-base-content/70 mb-6 font-mono">
                The server ID is missing or invalid.
              </p>
              <button
                onClick={() => router.push('/')}
                className="btn btn-primary rounded-xl shadow-lg hover:shadow-glow hover:shadow-primary/30 transition-all duration-300 font-semibold tracking-wide"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Return to Dashboard
              </button>
            </div>
          </div>
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
        <div className="min-h-screen bg-base-100 text-base-content flex items-center justify-center">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-base-content/70 font-mono">Loading server details...</p>
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
        <div className="min-h-screen bg-base-100 text-base-content flex items-center justify-center px-4">
          <div className="card bg-base-200 shadow-xl border border-base-300 rounded-2xl max-w-md w-full">
            <div className="card-body text-center p-8">
              <div className="w-16 h-16 bg-error/20 rounded-2xl flex items-center justify-center ring-2 ring-error/30 shadow-glow shadow-error/20 mx-auto mb-6">
                <ExclamationTriangleIcon className="h-8 w-8 text-error drop-shadow-glow" />
              </div>
              <h1 className="text-2xl font-bold text-base-content mb-4 font-display">
                Server Not Found
              </h1>
              <p className="text-base-content/70 font-mono">
                The server you&apos;re looking for doesn&apos;t exist.
              </p>
              <button
                onClick={() => router.push('/')}
                className="btn btn-primary rounded-xl shadow-lg hover:shadow-glow hover:shadow-primary/30 transition-all duration-300 font-semibold tracking-wide"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Return to Dashboard
              </button>
            </div>
          </div>
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
        <div className="min-h-screen bg-base-100 text-base-content">
          {/* Header */}
          <div className="bg-base-200/80 backdrop-blur-sm border-b border-base-300 shadow-lg sticky top-0 z-10">
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="btn btn-ghost btn-circle hover:bg-base-300 transition-all duration-200"
                  aria-label="Back to dashboard"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-base-content font-display tracking-wide">
                    {server.name}
                  </h1>
                  <p className="text-base-content/70 font-mono text-lg mt-2">
                    {server.executablePath}:{server.port}
                  </p>
                </div>
                <div className={`badge badge-lg gap-2 px-4 py-3 rounded-xl font-semibold tracking-wide ${getStatusBgColor(currentStatus)} ${getStatusColor(currentStatus)}`}>
                  {getStatusIcon(currentStatus)}
                  <span className="capitalize text-base">{currentStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-5xl mx-auto">
              {/* Server Overview */}
              <div className="bg-cyber-panel shadow-matrix-glow border border-matrix-500/30 rounded-2xl mb-10">
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-matrix-400 font-display tracking-wide">Server Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-cyber-panel shadow-matrix-glow border border-matrix-500/30 rounded-xl p-5 border border-matrix-500/30">
                      <div className="flex items-center gap-3 mb-3">
                        <UsersIcon className="h-6 w-6 text-accent" />
                        <h3 className="text-lg font-semibold text-matrix-400">Players</h3>
                      </div>
                      <div className="text-3xl font-bold text-accent tracking-wide">
                        {players.current}/{players.max}
                      </div>
                      <div className="text-sm font-mono text-matrix-400 mt-1">
                        {Math.round((players.current / players.max) * 100)}% capacity
                      </div>
                    </div>
                    <div className="bg-cyber-panel shadow-matrix-glow border border-matrix-500/30 rounded-xl p-5 border border-matrix-500/30">
                      <div className="flex items-center gap-3 mb-3">
                        <SignalIcon className="h-6 w-6 text-primary" />
                        <h3 className="text-lg font-semibold text-matrix-400">Map</h3>
                      </div>
                      <div className="text-xl font-bold text-matrix-400 truncate">{server.map}</div>
                    </div>
                    <div className="bg-cyber-panel shadow-matrix-glow border border-matrix-500/30 rounded-xl p-5 border border-matrix-500/30">
                      <div className="flex items-center gap-3 mb-3">
                        <GlobeAltIcon className="h-6 w-6 text-info" />
                        <h3 className="text-lg font-semibold text-matrix-400">Port</h3>
                      </div>
                      <div className="text-xl font-bold text-matrix-400">{server.port}</div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-8 justify-center">
                    <button
                      onClick={() => handleServerAction(currentStatus === 'online' ? 'stop' : 'start')}
                      disabled={!!actionLoading || currentStatus === 'starting' || currentStatus === 'stopping'}
                      className={`btn btn-md rounded-xl font-semibold tracking-wide transition-all duration-300 px-8 py-3 ${
                        currentStatus === 'online' 
                          ? 'btn-error hover:shadow-glow hover:shadow-error/30' 
                          : 'btn-success hover:shadow-glow hover:shadow-success/30'
                      }`}
                    >
                      {actionLoading ? (
                        <span className="loading loading-spinner loading-sm"></span>
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
                    </button>
                  </div>
                </div>
              </div>

              {/* Server Configuration Modal */}
              {showConfigEditor && server && (
                <ServerConfigModal
                  server={server}
                  onConfigUpdate={handleConfigUpdate}
                  onCancel={() => setShowConfigEditor(false)}
                />
              )}

              {/* Server Information Card */}
              <div className="card bg-cyber-panel shadow-matrix-glow border border-matrix-500/30 rounded-2xl">
                <div className="card-body p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-matrix-400 font-display tracking-wide cyber-text">
                      Server Information
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/servers/${id}/edit`)}
                        className="btn btn-sm btn-outline hover:bg-matrix-900/50 text-matrix-400 border-matrix-500/50 hover:border-matrix-500"
                        title="Edit server"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-cyber-panel shadow-matrix-glow border border-matrix-500/30 rounded-xl p-6 border border-matrix-500/30">
                      <div className="text-base font-medium text-matrix-400 uppercase tracking-wider mb-3">Server ID</div>
                      <div className="text-lg font-mono text-matrix-400">{server.id}</div>
                    </div>
                    <div className="bg-cyber-panel shadow-matrix-glow border border-matrix-500/30 rounded-xl p-6 border border-matrix-500/30">
                      <div className="text-base font-medium text-matrix-400 uppercase tracking-wider mb-3">Max Players</div>
                      <div className="text-lg font-bold text-matrix-400">{server.maxPlayers}</div>
                    </div>
                    <div className="bg-cyber-panel shadow-matrix-glow border border-matrix-500/30 rounded-xl p-6 border border-matrix-500/30">
                      <div className="text-base font-medium text-matrix-400 uppercase tracking-wider mb-3">Executable Path</div>
                      <div className="text-lg font-mono text-matrix-400 break-all">{server.executablePath}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation and Details */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-2">
                  <div className="bg-cyber-panel shadow-matrix-glow border border-matrix-500/30 rounded-2xl shadow-lg overflow-hidden sticky top-24">
                    <div className="p-6">
                      <h2 className="text-2xl font-bold text-matrix-400 mb-6 font-display tracking-wide">Quick Navigation</h2>
                      <div className="space-y-4">
                        <button
                          onClick={() => router.push(`/servers/${server.id}/edit?tab=mods`)}
                          className="btn btn-outline w-full rounded-xl hover:bg-matrix-900/50 text-matrix-400 hover:border-matrix-500 hover:text-matrix-400 transition-all duration-300 font-semibold tracking-wide text-base py-3"
                        >
                          <div className="flex items-center justify-center gap-3 w-full">
                            <PuzzlePieceIcon className="h-5 w-5" />
                            <span>Manage Mods</span>
                          </div>
                        </button>
                        <button
                          onClick={() => router.push(`/servers/${server.id}/edit?tab=cluster`)}
                          className="btn btn-outline w-full rounded-xl hover:bg-matrix-900/50 text-matrix-400 hover:border-matrix-500 hover:text-matrix-400 transition-all duration-300 font-semibold tracking-wide text-base py-3"
                        >
                          <div className="flex items-center justify-center gap-3 w-full">
                            <GlobeAltIcon className="h-5 w-5" />
                            <span>Cluster Settings</span>
                          </div>
                        </button>
                        <button
                          onClick={() => router.push(`/servers/${server.id}/edit?tab=general`)}
                          className="btn btn-outline w-full rounded-xl hover:bg-matrix-900/50 text-matrix-400 hover:border-matrix-500 hover:text-matrix-400 transition-all duration-300 font-semibold tracking-wide text-base py-3"
                        >
                          <div className="flex items-center justify-center gap-3 w-full">
                            <CogIcon className="h-5 w-5" />
                            <span>Server Config</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setShowConfigEditor(!showConfigEditor)}
                          className={`btn w-full rounded-xl transition-all duration-300 font-semibold tracking-wide text-base py-3 ${
                            showConfigEditor 
                              ? 'btn-primary hover:shadow-glow hover:shadow-primary/30' 
                              : 'btn-outline hover:bg-matrix-900/50 hover:border-matrix-500 hover:text-matrix-400'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-3 w-full">
                            <WrenchScrewdriverIcon className="h-5 w-5" />
                            <span>{showConfigEditor ? 'Hide Config' : 'Quick Config'}</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Server Details */}
                <div className="lg:col-span-3">
                  <div className="bg-cyber-panel shadow-matrix-glow border border-matrix-500/30 rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-8">
                      <h2 className="text-2xl font-bold text-matrix-400 mb-6 font-display tracking-wide">Server Details</h2>
                      <div className="space-y-6">
                        <div className="bg-cyber-panel shadow-matrix-glow border border-matrix-500/30 rounded-xl p-6 border border-matrix-500/30">
                          <div className="text-base font-medium text-matrix-400 uppercase tracking-wider mb-3">Server ID</div>
                          <div className="text-lg font-mono text-matrix-400">{server.id}</div>
                        </div>
                        <div className="bg-cyber-panel shadow-matrix-glow border border-matrix-500/30 rounded-xl p-6 border border-matrix-500/30">
                          <div className="text-base font-medium text-matrix-400 uppercase tracking-wider mb-3">Max Players</div>
                          <div className="text-lg font-bold text-matrix-400">{server.maxPlayers}</div>
                        </div>
                        <div className="bg-cyber-panel shadow-matrix-glow border border-matrix-500/30 rounded-xl p-6 border border-matrix-500/30">
                          <div className="text-base font-medium text-matrix-400 uppercase tracking-wider mb-3">Executable Path</div>
                          <div className="text-lg font-mono text-matrix-400 break-all">{server.executablePath}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>

      {showAddServerModal && (
        <AddServerForm
          onSuccess={handleAddServerSuccess}
          onClose={() => setShowAddServerModal(false)}
        />
      )}
      
      <GlobalSettingsModal
        settings={globalSettings}
        onSettingsUpdate={handleGlobalSettingsUpdate}
        onClose={() => setShowGlobalSettingsModal(false)}
        isOpen={showGlobalSettingsModal}
      />
    </>
  );
};

export default ServerDetailPage; 