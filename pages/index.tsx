import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Layout } from "@/components/ui/Layout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ModernServerList } from "@/components/servers/ModernServerList";
import { AddServerForm } from "@/components/forms/AddServerForm";
import { GlobalSettingsModal } from "@/components/GlobalSettingsModal";
import { toast } from "react-hot-toast";
import type { ServerConfig, ServerStatus } from "@/types/server";
import type { GlobalSettings } from "@/lib/global-settings";
import { ErrorHandler, ErrorType, ErrorSeverity } from "@/lib/error-handler";

export default function Dashboard() {
  const router = useRouter();
  const [servers, setServers] = useState<ServerConfig[]>([]);
  const [serverStatuses, setServerStatuses] = useState<
    Record<string, ServerStatus>
  >({});
  const [loading, setLoading] = useState(true);
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [showGlobalSettingsModal, setShowGlobalSettingsModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleGlobalSettingsClick = useCallback(() => {
    console.log("Opening global settings modal");
    setShowGlobalSettingsModal(true);
  }, []);

  const handleGlobalSettingsClose = useCallback(() => {
    console.log("Closing global settings modal");
    setShowGlobalSettingsModal(false);
  }, []);

  const handleGlobalSettingsUpdate = useCallback((settings: GlobalSettings) => {
    try {
      setGlobalSettings(settings);
      document.title = settings.siteTitle;
      updateFavicon(settings.favicon);
      setShowGlobalSettingsModal(false);
    } catch (error) {
      ErrorHandler.handleError(error, {
        component: "Dashboard",
        action: "handleGlobalSettingsUpdate",
      });
    }
  }, []);

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
        cacheRefreshInterval: 5,
        cacheEnabled: true,
        updatedAt: new Date(),
      });
    }
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
      setShowAddServerModal(false);
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
    setShowAddServerModal(false);
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

        const data = await response.json();
        return data;
      },
      { component: "Dashboard", action: "handleServerAction", serverId }
    );

    if (result.success) {
      toast.success(`Server ${action} initiated`);
      // Refresh server status after a delay
      setTimeout(() => fetchServers(), 2000);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchServers();
  };

  // Error boundary for critical errors
  if (error && servers.length === 0) {
    return (
      <div className="min-h-screen bg-base-100 text-base-content flex items-center justify-center px-4">
        <div className="card bg-base-200 shadow-xl border border-error/30 rounded-2xl max-w-md w-full">
          <div className="card-body text-center p-8">
            <div className="w-16 h-16 bg-error/20 rounded-2xl flex items-center justify-center ring-2 ring-error/30 shadow-glow shadow-error/20 mx-auto mb-6">
              <svg
                className="h-8 w-8 text-error drop-shadow-glow"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-base-content mb-4 font-display tracking-wide">
              Failed to Load Dashboard
            </h1>
            <p className="text-base-content/70 mb-6 font-mono">{error}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleRetry}
                className="btn btn-primary rounded-xl shadow-lg hover:shadow-glow hover:shadow-primary/30 transition-all duration-300 font-semibold tracking-wide"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-outline rounded-xl hover:bg-secondary hover:border-secondary hover:text-secondary-content transition-all duration-300 font-semibold tracking-wide"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{globalSettings?.siteTitle || "Saints Ascended"}</title>
        <meta
          name="description"
          content="Manage your Ark: Survival Ascended servers"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={globalSettings?.favicon || "🦕"} />
      </Head>

      <Layout
        showSidebar={true}
        globalSettings={globalSettings}
        onAddServer={() => setShowAddServerModal(true)}
        onGlobalSettings={handleGlobalSettingsClick}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        sidebarStats={{
          totalServers: servers.length,
          onlineServers: Object.values(serverStatuses).filter(
            (s) => s.status === "online"
          ).length,
          totalPlayers: Object.values(serverStatuses).reduce(
            (sum, s) => sum + s.players.current,
            0
          ),
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <DashboardOverview
            servers={servers}
            serverStatuses={serverStatuses}
          />

          <ModernServerList
            servers={servers}
            serverStatuses={serverStatuses}
            loading={loading}
            onServerAction={handleServerAction}
            onEditServer={(serverId) =>
              router.push(`/servers/${serverId}/edit`)
            }
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
          />
        </div>
      </Layout>

      {showAddServerModal && (
        <AddServerForm
          onSuccess={handleAddServerSuccess}
          onClose={handleAddServerCancel}
        />
      )}
      <GlobalSettingsModal
        settings={globalSettings}
        onSettingsUpdate={handleGlobalSettingsUpdate}
        onClose={handleGlobalSettingsClose}
        isOpen={showGlobalSettingsModal}
      />
    </>
  );
}
