import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Layout } from "@/components/ui/Layout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ModernServerList } from "@/components/servers/ModernServerList";
import { AddServerForm } from "@/components/forms/AddServerForm";
import { GlobalSettingsModal } from "@/components/GlobalSettingsModal";
import { AddModsModal } from "@/components/mods/AddModsModal";
import { toast } from "react-hot-toast";
import type { ServerConfig, ServerStatus } from "@/types/server";
import type { GlobalSettings } from "@/lib/global-settings";
import { ErrorHandler, ErrorType, ErrorSeverity } from "@/lib/error-handler";
import { useModal } from "@/context/ModalContext";

export default function Dashboard() {
  const router = useRouter();
  const { currentModal, openModal, closeModal, payload } = useModal();
  const [servers, setServers] = useState<ServerConfig[]>([]);
  const [serverStatuses, setServerStatuses] = useState<
    Record<string, ServerStatus>
  >({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleGlobalSettingsUpdate = useCallback((settings: GlobalSettings) => {
    try {
      setGlobalSettings(settings);
      document.title = settings.siteTitle;
      updateFavicon(settings.favicon);
      closeModal();
    } catch (error) {
      ErrorHandler.handleError(error, {
        component: "Dashboard",
        action: "handleGlobalSettingsUpdate",
      });
    }
  }, [closeModal]);

  const loadInitialSettings = useCallback(async () => {
    const result = await ErrorHandler.handleAsync(
      async () => {
        const response = await fetch("/api/global-settings");
        if (!response.ok) {
          throw new Error(
            `Failed to load global settings: ${response.statusText}`
          );
        }
        const data = await response.json();
        return data.data;
      },
      { component: "Dashboard", action: "loadInitialSettings" },
      false // Don't show toast for this error
    );

    if (result.success) {
      setGlobalSettings(result.data);
      // Update page title and favicon
      document.title = result.data.siteTitle;
      updateFavicon(result.data.favicon);
    } else {
      console.error("Failed to load global settings:", result.error);
      // Set default settings if loading fails
      setGlobalSettings({
        siteTitle: "Ark Server Manager",
        favicon: "🦕",
        steamCmdPath: "",
        curseforgeApiKey: "",
        cacheRefreshInterval: 5,
        cacheEnabled: true,
        updatedAt: new Date(),
      });
    }

    setLoading(false);
  }, []);

  const updateFavicon = (favicon: string) => {
    try {
      if (favicon && typeof window !== "undefined") {
        const link =
          (document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
          document.createElement("link");
        link.type = "image/x-icon";
        link.rel = "shortcut icon";
        link.href = favicon;
        document.getElementsByTagName("head")[0].appendChild(link);
      }
    } catch (error) {
      ErrorHandler.handleError(
        error,
        {
          component: "Dashboard",
          action: "updateFavicon",
        },
        false
      );
    }
  };

  const fetchServers = useCallback(async () => {
    const result = await ErrorHandler.handleAsync(
      async () => {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/servers");
        if (!response.ok) {
          throw new Error(`Failed to fetch servers: ${response.statusText}`);
        }

        const data = await response.json();
        const serverList = data.data || [];

        // Generate mock statuses for each server
        const statuses: Record<string, ServerStatus> = {};
        serverList.forEach((server: ServerConfig) => {
          statuses[server.id] = {
            id: server.id,
            status: "offline", // Default to offline
            players: { current: 0, max: server.maxPlayers },
            version: "1.0.0",
            lastSeen: new Date(),
          };
        });

        setServers(serverList);
        setServerStatuses(statuses);

        return serverList;
      },
      { component: "Dashboard", action: "fetchServers" }
    );

    if (!result.success) {
      setError(result.error.userMessage || "Failed to load servers");
      setServers([]);
      setServerStatuses({});
    }

    setLoading(false);
  }, []);

  // Fetch servers and global settings on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchServers(), loadInitialSettings()]);
      } catch (error) {
        ErrorHandler.handleError(error, {
          component: "Dashboard",
          action: "loadData",
        });
      }
    };

    loadData();
  }, [fetchServers, loadInitialSettings]);

  const handleAddServerSuccess = async (serverId: string) => {
    try {
      closeModal();
      toast.success("Server created successfully!");

      // Refresh the server list
      await fetchServers();

      // Navigate to the new server
      router.push(`/servers/${serverId}`);
    } catch (error) {
      ErrorHandler.handleError(error, {
        component: "Dashboard",
        action: "handleAddServerSuccess",
        serverId,
      });
    }
  };

  const handleAddServerCancel = () => {
    closeModal();
  };

  const handleServerAction = async (serverId: string, action: string) => {
    const result = await ErrorHandler.handleAsync(
      async () => {
        const response = await fetch(`/api/servers/${serverId}/actions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to ${action} server`);
        }
        
        // Optimistically update status
        setServerStatuses(prev => ({
          ...prev,
          [serverId]: {
            ...prev[serverId],
            status: action === 'start' ? 'online' : 'offline'
          }
        }));

        toast.success(`Server ${action} initiated!`);
      },
      { component: "Dashboard", action: "handleServerAction", serverId }
    );
  };

  const handleRetry = () => {
    fetchServers();
  };

  if (loading) {
    return (
      <Layout
        showSidebar={true}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onAddServer={() => openModal('addServer')}
        onGlobalSettings={() => openModal('globalSettings')}
        globalSettings={globalSettings}
        sidebarStats={{
          totalServers: servers.length,
          onlineServers: Object.values(serverStatuses).filter(s => s.status === 'online').length,
          totalPlayers: Object.values(serverStatuses).reduce((acc, s) => acc + s.players.current, 0)
        }}
      >
        <Head>
          <title>{globalSettings?.siteTitle || "Saints Ascended"}</title>
        </Head>
        <div className="main-content">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="spinner-border animate-spin w-8 h-8 mx-auto mb-4"></div>
              <div className="text-muted">LOADING SYSTEM DATA...</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        showSidebar={true}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onAddServer={() => openModal('addServer')}
        onGlobalSettings={() => openModal('globalSettings')}
        globalSettings={globalSettings}
        sidebarStats={{
          totalServers: servers.length,
          onlineServers: Object.values(serverStatuses).filter(s => s.status === 'online').length,
          totalPlayers: Object.values(serverStatuses).reduce((acc, s) => acc + s.players.current, 0)
        }}
      >
        <Head>
          <title>{globalSettings?.siteTitle || "Saints Ascended"}</title>
        </Head>
        <div className="main-content">
          <div className="text-center py-12">
            <div className="empty-icon mb-4">⚠️</div>
            <div className="empty-title mb-2">SYSTEM ERROR</div>
            <div className="empty-subtitle mb-6">{error}</div>
            <button onClick={handleRetry} className="action-button">
              <span>🔄</span>
              RETRY CONNECTION
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{globalSettings?.siteTitle || "Saints Ascended"}</title>
      </Head>
      <Layout
        showSidebar={true}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onAddServer={() => openModal('addServer')}
        onGlobalSettings={() => openModal('globalSettings')}
        globalSettings={globalSettings}
        sidebarStats={{
          totalServers: servers.length,
          onlineServers: Object.values(serverStatuses).filter(s => s.status === 'online').length,
          totalPlayers: Object.values(serverStatuses).reduce((acc, s) => acc + s.players.current, 0)
        }}
      >
        <DashboardOverview servers={servers} serverStatuses={serverStatuses} />
        <div className="mt-8">
          <ModernServerList
            servers={servers}
            serverStatuses={serverStatuses}
            onServerAction={handleServerAction}
            onEditServer={(serverId) => router.push(`/servers/${serverId}/edit`)}
            onDeleteServer={async (serverId) => {
              if (!confirm("Are you sure you want to delete this server?"))
                return;

              const result = await ErrorHandler.handleAsync(
                async () => {
                  const response = await fetch(`/api/servers/${serverId}`, {
                    method: "DELETE",
                  });

                  if (!response.ok) {
                    throw new Error("Failed to delete server");
                  }

                  return response.json();
                },
                { component: "Dashboard", action: "deleteServer", serverId }
              );

              if (result.success) {
                toast.success("Server deleted successfully");
                fetchServers();
              }
            }}
            onViewDashboard={(serverId) => router.push(`/servers/${serverId}`)}
            loading={loading}
          />
        </div>
      </Layout>
      {currentModal === 'addServer' && (
        <AddServerForm
          onSuccess={handleAddServerSuccess}
          onClose={handleAddServerCancel}
        />
      )}
      {currentModal === 'globalSettings' && (
        <GlobalSettingsModal
          isOpen={true}
          onClose={closeModal}
          onSettingsUpdate={handleGlobalSettingsUpdate}
          settings={globalSettings}
        />
      )}
      {currentModal === 'addMods' && payload?.serverId && (
        <AddModsModal />
      )}
    </>
  );
}
