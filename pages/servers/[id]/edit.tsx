import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Layout } from "@/components/ui/Layout";
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CogIcon,
  PuzzlePieceIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ModManager from "../../../components/mods/ModManager";
import { ClusterManager } from "../../../components/cluster/ClusterManager";
import AdvancedConfigEditor from "../../../components/config/AdvancedConfigEditor";
import { ServerConfig } from "../../../types/server";
import { useGlobalSettings } from "@/lib/global-settings";
import { GlobalSettingsModal } from "@/components/GlobalSettingsModal";
import { AddServerForm } from "@/components/forms/AddServerForm";

const TABS = [
  { id: "general", name: "General", icon: CogIcon },
  { id: "mods", name: "Mods", icon: PuzzlePieceIcon },
  { id: "cluster", name: "Cluster", icon: GlobeAltIcon },
];

const EditServerPage = () => {
  const router = useRouter();
  const { id, tab } = router.query;
  const [activeTab, setActiveTab] = useState("general");
  const { settings: globalSettings, updateSettings } = useGlobalSettings();
  const [showGlobalSettingsModal, setShowGlobalSettingsModal] = useState(false);
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModModal, setShowAddModModal] = useState(false);

  useEffect(() => {
    if (typeof tab === "string" && TABS.some((t) => t.id === tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("general");
    }
  }, [tab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.replace(
      { pathname: router.pathname, query: { ...router.query, tab: tabId } },
      undefined,
      { shallow: true }
    );
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
    router.push("/");
  };

  const handleAddServerCancel = () => {
    setShowAddServerModal(false);
  };

  const searchCurseForgeMods = async (query: string) => {
    // Update the search query state which will be passed to ModManager
    setSearchQuery(query);
    // The ModManager component will handle the actual search via the searchQuery prop
  };

  if (!id || typeof id !== "string") {
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
                onClick={() => router.push("/")}
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

  return (
    <>
      <Head>
        <title>
          Edit Server - {globalSettings?.siteTitle || "Saints Ascended"}
        </title>
        <meta name="description" content="Edit server configuration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={globalSettings?.favicon || "🦕"} />
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
          onlineServers: 0, // We don't have status in edit view
          totalPlayers: 0, // We don't have player count in edit view
        }}
      >
        <div className="min-h-screen bg-base-100 text-base-content">
          {/* Header */}
          <div className="bg-base-200/80 backdrop-blur-sm border-b border-base-300 shadow-lg">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push(`/servers/${id}`)}
                  className="btn btn-ghost btn-circle hover:bg-base-300 transition-all duration-200"
                  aria-label="Back to server dashboard"
                >
                  <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-base-content font-display tracking-wide">
                    Edit Server
                  </h1>
                  <p className="text-base-content/70 font-mono">
                    Server ID: {id}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Navigation */}
          <div className="border-b border-[#00ff00]/30">
            <div className="container mx-auto px-4">
              <div className="flex h-12 items-center justify-between">
                <div className="flex h-full">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`inline-flex items-center px-4 h-full gap-2 border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? "text-[#00ff00] border-[#00ff00] drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]"
                            : "text-[#00ff00]/50 border-transparent hover:text-[#00ff00]/70 hover:border-[#00ff00]/30"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Search and Add Mod buttons only shown on mods tab */}
                {activeTab === "mods" && (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search mods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && searchCurseForgeMods(searchQuery)
                        }
                        className="input input-xs input-bordered w-48 pl-8 pr-8 bg-base-200 border-base-content/20 focus:border-primary text-sm"
                      />
                      <button
                        onClick={() => searchCurseForgeMods(searchQuery)}
                        className="absolute left-1 top-1/2 transform -translate-y-1/2 p-1 hover:bg-base-300 rounded transition-colors"
                        title="Search mods"
                      >
                        <MagnifyingGlassIcon className="h-3 w-3 text-base-content/60 hover:text-base-content" />
                      </button>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 hover:bg-base-300 rounded transition-colors"
                          title="Clear search"
                        >
                          <XMarkIcon className="h-3 w-3 text-base-content/60 hover:text-base-content" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAddModModal(true)}
                      className="btn btn-xs btn-outline flex items-center justify-center min-w-[2rem] hover:bg-base-300"
                      title="Add manual mod"
                    >
                      <PlusIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 pb-8">
            {activeTab === "general" ? (
              // Full height for config editor
              <div className="h-[calc(100vh-200px)]">
                <AdvancedConfigEditor
                  serverId={id}
                  onConfigUpdate={() => {
                    // Config updated - could refresh data if needed
                  }}
                />
              </div>
            ) : activeTab === "mods" ? (
              // Full width for mods page
              <div className="w-full">
                <ModManager
                  serverId={id}
                  onModsUpdate={() => {
                    // Mods updated - could refresh data if needed
                  }}
                  searchQuery={searchQuery}
                  showAddModModal={showAddModModal}
                  setShowAddModModal={setShowAddModModal}
                />
              </div>
            ) : (
              // Standard layout for other tabs
              <div className="max-w-4xl mx-auto">
                {activeTab === "cluster" && <ClusterManager serverId={id} />}
              </div>
            )}
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

export default EditServerPage;
