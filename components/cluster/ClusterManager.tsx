import React, { useState, useEffect } from "react";
import {
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

interface ClusterConfig {
  clusterId: string;
  clusterDirOverride: string;
  enabled: boolean;
}

interface ClusterManagerProps {
  serverId: string;
}

export function ClusterManager({ serverId }: ClusterManagerProps) {
  const [clusterConfig, setClusterConfig] = useState<ClusterConfig>({
    clusterId: "",
    clusterDirOverride: "",
    enabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState({
    clusterId: false,
    clusterDirOverride: false,
  });
  const [tempValues, setTempValues] = useState({
    clusterId: "",
    clusterDirOverride: "",
  });

  useEffect(() => {
    loadClusterConfig();
  }, [serverId]);

  const loadClusterConfig = async () => {
    try {
      setLoading(true);

      // Load cluster config from launch options
      const response = await fetch(`/api/servers/${serverId}/config`);
      if (response.ok) {
        const { data } = await response.json();

        if (data.launchOptions) {
          setClusterConfig({
            clusterId: data.launchOptions.clusterID || "",
            clusterDirOverride: data.launchOptions.clusterDirOverride || "",
            enabled: data.launchOptions.clusterEnabled || false,
          });
        } else {
          // Default state if no launch options found
          setClusterConfig({
            clusterId: "",
            clusterDirOverride: "",
            enabled: false,
          });
        }
      } else {
        // Default state if API call fails
        setClusterConfig({
          clusterId: "",
          clusterDirOverride: "",
          enabled: false,
        });
      }
    } catch (error) {
      console.error("Failed to load cluster config:", error);
      // Default state on error
      setClusterConfig({
        clusterId: "",
        clusterDirOverride: "",
        enabled: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveClusterConfig = async (updates: Partial<ClusterConfig>) => {
    try {
      setLoading(true);

      // Update local state
      const updatedConfig = { ...clusterConfig, ...updates };
      setClusterConfig(updatedConfig);

      // Load existing launch options first
      const response = await fetch(`/api/servers/${serverId}/config`);
      let existingLaunchOptions = {};

      if (response.ok) {
        const { data } = await response.json();
        if (data.launchOptions) {
          existingLaunchOptions = data.launchOptions;
        }
      }

      // Merge with cluster options
      const mergedLaunchOptions = {
        ...existingLaunchOptions,
        clusterID: updatedConfig.clusterId,
        clusterDirOverride: updatedConfig.clusterDirOverride,
        clusterEnabled: updatedConfig.enabled,
      };

      // Save merged launch options
      const saveResponse = await fetch(`/api/servers/${serverId}/config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          launchOptions: mergedLaunchOptions,
        }),
      });

      if (!saveResponse.ok) {
        console.error("Failed to save cluster config");
      }
    } catch (error) {
      console.error("Failed to save cluster config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: "clusterId" | "clusterDirOverride") => {
    setTempValues((prev) => ({ ...prev, [field]: clusterConfig[field] }));
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleSave = async (field: "clusterId" | "clusterDirOverride") => {
    await saveClusterConfig({ [field]: tempValues[field] });
    setIsEditing((prev) => ({ ...prev, [field]: false }));
  };

  const handleCancel = (field: "clusterId" | "clusterDirOverride") => {
    setTempValues((prev) => ({ ...prev, [field]: clusterConfig[field] }));
    setIsEditing((prev) => ({ ...prev, [field]: false }));
  };

  const toggleCluster = async () => {
    await saveClusterConfig({ enabled: !clusterConfig.enabled });
  };

  const generateClusterId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempValues((prev) => ({ ...prev, clusterId: result }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-primary glow-strong font-mono tracking-wider">
          CLUSTER CONFIGURATION
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {clusterConfig.enabled ? (
              <CheckCircleIcon className="h-4 w-4 text-success glow" />
            ) : (
              <ExclamationTriangleIcon className="h-4 w-4 text-warning glow" />
            )}
            <span
              className={`text-sm font-bold font-mono ${
                clusterConfig.enabled ? "text-success" : "text-warning"
              }`}
            >
              {clusterConfig.enabled ? "ENABLED" : "DISABLED"}
            </span>
          </div>
          <button
            onClick={toggleCluster}
            disabled={loading}
            className={`btn btn-sm ${
              clusterConfig.enabled ? "btn-warning" : "btn-success"
            }`}
          >
            {clusterConfig.enabled ? "DISABLE" : "ENABLE"}
          </button>
        </div>
      </div>

      {/* Functional Cluster Settings */}
      <div className="card bg-base-200 border border-primary shadow-pipboy">
        <div className="card-body p-4">
          <div className="flex items-center gap-2 mb-3">
            <ServerIcon className="h-4 w-4 text-primary glow" />
            <h4 className="font-bold text-sm text-primary font-mono">
              CLUSTER SETTINGS
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-base-content/60 font-mono mb-2 flex items-center justify-between">
                <span>CLUSTER ID FORMAT:</span>
                {!isEditing.clusterId && (
                  <button
                    onClick={() => handleEdit("clusterId")}
                    className="btn btn-ghost btn-xs rounded border border-base-content/30 hover:bg-base-300 transition-all duration-200"
                    title="Edit Cluster ID"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
              {isEditing.clusterId ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempValues.clusterId}
                      onChange={(e) =>
                        setTempValues((prev) => ({
                          ...prev,
                          clusterId: e.target.value,
                        }))
                      }
                      className="input input-bordered flex-1 font-mono text-xs"
                      placeholder="XXXXXXXX"
                      maxLength={8}
                    />
                    <button
                      type="button"
                      onClick={generateClusterId}
                      className="btn btn-outline btn-xs rounded border border-base-content/30 hover:bg-base-300 transition-all duration-200 font-mono"
                    >
                      GEN
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave("clusterId")}
                      className="btn btn-success btn-xs font-mono flex-1"
                      disabled={loading}
                    >
                      SAVE
                    </button>
                    <button
                      onClick={() => handleCancel("clusterId")}
                      className="btn btn-ghost btn-xs font-mono flex-1"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <div className="font-mono bg-base-300 p-2 rounded border border-base-content/20">
                  -clusterID={clusterConfig.clusterId || "XXXXXXXX"}
                </div>
              )}
            </div>
            <div>
              <div className="text-base-content/60 font-mono mb-2 flex items-center justify-between">
                <span>CLUSTER DIR FORMAT:</span>
                {!isEditing.clusterDirOverride && (
                  <button
                    onClick={() => handleEdit("clusterDirOverride")}
                    className="btn btn-ghost btn-xs rounded border border-base-content/30 hover:bg-base-300 transition-all duration-200"
                    title="Edit Cluster Directory"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
              {isEditing.clusterDirOverride ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={tempValues.clusterDirOverride}
                    onChange={(e) =>
                      setTempValues((prev) => ({
                        ...prev,
                        clusterDirOverride: e.target.value,
                      }))
                    }
                    className="input input-bordered w-full font-mono text-xs"
                    placeholder="G:\ASAServer"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave("clusterDirOverride")}
                      className="btn btn-success btn-xs font-mono flex-1"
                      disabled={loading}
                    >
                      SAVE
                    </button>
                    <button
                      onClick={() => handleCancel("clusterDirOverride")}
                      className="btn btn-ghost btn-xs font-mono flex-1"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <div className="font-mono bg-base-300 p-2 rounded border border-base-content/20">
                  -ClusterDirOverride=&quot;
                  {clusterConfig.clusterDirOverride || "G:\\ASAServer"}&quot;
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 p-3 bg-warning/10 border border-warning/30 rounded">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-warning" />
              <span className="text-xs font-mono text-warning">
                CLUSTER CONFIGURATION ALLOWS MULTIPLE SERVERS TO SHARE DATA
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
