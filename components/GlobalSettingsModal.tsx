import React, { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  CogIcon,
  FolderOpenIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { GlobalSettings } from "@/lib/global-settings";
import { ErrorHandler, ErrorType, ErrorSeverity } from "@/lib/error-handler";
import { useGlobalSettings } from "@/lib/global-settings";
import { isValidCurseForgeApiKey } from "@/lib/curseforge-api";

interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GlobalSettings | null;
  onSettingsUpdate: (settings: GlobalSettings) => void;
}

// Common emoji options for favicon
const EMOJI_OPTIONS = [
  "🦕",
  "🦖",
  "🐉",
  "🦎",
  "🐊",
  "🌴",
  "🌋",
  "🏝️",
  "🎮",
  "⚙️",
];

export function GlobalSettingsModal({
  isOpen,
  onClose,
  settings: externalSettings,
  onSettingsUpdate,
}: GlobalSettingsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  // Ensure we always have a valid settings object
  const defaultSettings: GlobalSettings = {
    siteTitle: "Ark Server Manager",
    favicon: "🦕",
    steamCmdPath: "",
    curseforgeApiKey: "",
    cacheRefreshInterval: 5,
    cacheEnabled: true,
    updatedAt: new Date(),
  };

  const [settings, setSettings] = useState<GlobalSettings>(
    () => externalSettings || defaultSettings
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [faviconType, setFaviconType] = useState<"emoji" | "custom">("emoji");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isThemeChange, setIsThemeChange] = useState(false);

  // Update settings when externalSettings changes
  useEffect(() => {
    if (externalSettings) {
      setSettings(externalSettings);
    }
  }, [externalSettings]);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (!isOpen && dialogRef.current) {
      dialogRef.current.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    const result = await ErrorHandler.handleAsync(
      async () => {
        setIsLoading(true);
        setErrors({});

        const response = await fetch("/api/global-settings");
        if (!response.ok) {
          throw new Error(
            `Failed to load global settings: ${response.statusText}`
          );
        }

        const result = await response.json();
        return result.data;
      },
      { component: "GlobalSettingsModal", action: "loadSettings" },
      false // Don't show toast for this error
    );

    if (result.success && result.data) {
      setSettings(result.data);

      // Determine favicon type
      if (
        EMOJI_OPTIONS.includes(result.data.favicon) ||
        (result.data.favicon.length <= 2 &&
          !result.data.favicon.startsWith("data:"))
      ) {
        setFaviconType("emoji");
      } else {
        setFaviconType("custom");
      }
    } else {
      console.error("Failed to load global settings:", result.success ? "No data received" : result.error);
      // Keep default settings if loading fails
      // The settings state already has default values from initialization
    }

    setIsLoading(false);
  };

  const validateSettings = (): boolean => {
    // Safety check: ensure settings is not undefined
    if (!settings) {
      return false;
    }

    const newErrors: Record<string, string> = {};

    if (!settings.siteTitle.trim()) {
      newErrors.siteTitle = "Site title is required";
    }

    if (settings.siteTitle.length > 50) {
      newErrors.siteTitle = "Site title must be 50 characters or less";
    }

    if (!settings.favicon.trim()) {
      newErrors.favicon = "Favicon is required";
    }

    if (
      settings.favicon &&
      faviconType === "custom" &&
      !settings.favicon.startsWith("data:") &&
      !settings.favicon.startsWith("http")
    ) {
      newErrors.favicon = "Custom favicon must be a valid URL or data URL";
    }

    // Validate CurseForge API key if provided (optional field)
    if (settings.curseforgeApiKey && !isValidCurseForgeApiKey(settings.curseforgeApiKey)) {
      newErrors.curseforgeApiKey = "Invalid CurseForge API key format. Please provide a valid BCrypt hash or legacy alphanumeric key.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Safety check: ensure settings is not undefined
    if (!settings) {
      toast.error("Settings not loaded");
      return;
    }

    if (!validateSettings()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const result = await ErrorHandler.handleAsync(
      async () => {
        setIsSaving(true);

        const response = await fetch("/api/global-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save settings");
        }

        const result = await response.json();
        return result.data;
      },
      { component: "GlobalSettingsModal", action: "saveSettings" }
    );

    if (result.success) {
      if (!isThemeChange) {
        toast.success("Global settings saved successfully");
      }
      onSettingsUpdate(result.data);
      onClose();
    }

    setIsSaving(false);
  };

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
          component: "GlobalSettingsModal",
          action: "updateFavicon",
        },
        false
      );
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024) {
        // 100KB limit
        toast.error("Image must be less than 100KB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newFavicon = reader.result as string;
        setSettings((prev) => ({ ...prev, favicon: newFavicon }));
        updateFavicon(newFavicon); // Update immediately
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setSettings((prev) => ({ ...prev, favicon: emoji }));
    updateFavicon(emoji); // Update immediately
  };

  const selectSteamCmdPath = () => {
    // For web app, we can't use file system dialog
    // Instead, user will type the path manually
    // In Electron or similar, you could use dialog.showOpenDialog
    toast("Please enter the SteamCMD path manually", {
      icon: "💡",
      duration: 3000,
    });
  };

  const handleDownloadSteamCMD = async () => {
    // Safety check: ensure settings is not undefined
    if (!settings) {
      toast.error("Settings not loaded");
      return;
    }

    if (!settings.steamCmdPath.trim()) {
      toast.error("Please enter a SteamCMD path first");
      return;
    }

    const result = await ErrorHandler.handleAsync(
      async () => {
        setIsDownloading(true);
        setDownloadProgress(0);

        const response = await fetch("/api/download-steamcmd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetPath: settings.steamCmdPath }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to download SteamCMD");
        }

        const result = await response.json();
        return result;
      },
      { component: "GlobalSettingsModal", action: "downloadSteamCMD" }
    );

    if (result.success) {
      toast.success("SteamCMD downloaded successfully");
    }

    setIsDownloading(false);
    setDownloadProgress(0);
  };

  const handleFaviconChange = (value: string) => {
    setSettings((prev) => ({ ...prev, favicon: value }));
    if (errors.favicon) {
      setErrors((prev) => ({ ...prev, favicon: "" }));
    }
  };

  const handleInputChange = (field: keyof GlobalSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Safety check: ensure settings is never undefined
  if (!settings) {
    return null;
  }

  return isOpen ? (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8 text-center sm:block sm:p-0">
        {/* Improved backdrop with proper z-index and blur */}
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-hidden="true"
        />

        {/* Modal panel */}
        <div className="inline-block transform overflow-hidden rounded-2xl bg-cyber-panel text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:align-middle border border-matrix-500/30">
          <div className="bg-gradient-to-br from-cyber-panel to-cyber-bg px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-matrix-500/20 sm:mx-0 sm:h-10 sm:w-10">
                <CogIcon className="h-6 w-6 text-matrix-500" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 className="text-base font-semibold leading-6 text-matrix-400 font-mono">
                  Global Settings
                </h3>
                <div className="mt-4 space-y-4">
                  <form onSubmit={handleSave} className="space-y-6">
                    {/* Site Title */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-matrix-600 font-display font-semibold">Site Title *</span>
                      </label>
                      <input
                        type="text"
                        className={`input input-bordered w-full ${errors.siteTitle ? "input-error" : ""}`}
                        value={settings.siteTitle}
                        onChange={(e) =>
                          handleInputChange("siteTitle", e.target.value)
                        }
                        placeholder="Enter site title"
                        disabled={isSaving || isDownloading}
                        aria-label="Site title"
                        required
                      />
                      {errors.siteTitle && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {errors.siteTitle}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* Favicon */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-matrix-600 font-display font-semibold">Favicon *</span>
                      </label>
                      <div className="flex gap-2 mb-2">
                        <button
                          type="button"
                          className={`btn btn-sm flex-1 ${faviconType === "emoji" ? "btn-primary" : "btn-outline"}`}
                          onClick={() => setFaviconType("emoji")}
                        >
                          Emoji
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm flex-1 ${faviconType === "custom" ? "btn-primary" : "btn-outline"}`}
                          onClick={() => setFaviconType("custom")}
                        >
                          Custom
                        </button>
                      </div>

                      {faviconType === "emoji" ? (
                        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                          {EMOJI_OPTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleEmojiSelect(emoji)}
                              className={`btn btn-sm ${
                                settings.favicon === emoji
                                  ? "btn-primary"
                                  : "btn-outline"
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="file-input file-input-bordered w-full"
                            title="Upload custom favicon"
                            placeholder="Choose a file..."
                            aria-label="Upload custom favicon"
                          />
                          <p className="text-sm text-matrix-600 font-mono">
                            Max file size: 100KB. Recommended size: 32x32 pixels.
                          </p>
                          {settings.favicon &&
                            settings.favicon.startsWith("data:") && (
                              <img
                                src={settings.favicon}
                                alt="Current favicon"
                                className="h-8 w-8 rounded border border-matrix-500/30 mt-2"
                              />
                            )}
                        </div>
                      )}
                      {errors.favicon && (
                        <label className="label">
                          <span className="label-text-alt text-error">
                            {errors.favicon}
                          </span>
                        </label>
                      )}
                    </div>

                    {/* SteamCMD Path */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-matrix-600 font-display font-semibold">SteamCMD Path</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className={`input input-bordered flex-1 ${errors.steamCmdPath ? "input-error" : ""}`}
                          value={settings.steamCmdPath}
                          onChange={(e) =>
                            handleInputChange("steamCmdPath", e.target.value)
                          }
                          placeholder="C:\SteamCMD"
                          disabled={isDownloading}
                          aria-label="SteamCMD path"
                        />
                        <button
                          type="button"
                          onClick={handleDownloadSteamCMD}
                          className="btn btn-primary"
                          disabled={
                            isDownloading || !settings.steamCmdPath.trim()
                          }
                        >
                          {isDownloading ? (
                            <>
                              <span className="loading loading-spinner loading-sm" />
                              Downloading...
                            </>
                          ) : (
                            "Download"
                          )}
                        </button>
                      </div>
                    </div>

                    {/* CurseForge API Key */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-matrix-600 font-display font-semibold">CurseForge API Key</span>
                        <span className="label-text-alt text-matrix-600">Required for mod management</span>
                      </label>
                      <div className="space-y-2">
                        <input
                          type="password"
                          className={`input input-bordered w-full ${errors.curseforgeApiKey ? "input-error" : ""}`}
                          value={settings.curseforgeApiKey}
                          onChange={(e) =>
                            handleInputChange("curseforgeApiKey", e.target.value)
                          }
                          placeholder="Enter your CurseForge API key"
                          disabled={isSaving}
                          aria-label="CurseForge API key"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.querySelector('input[type="password"]') as HTMLInputElement;
                              if (input) {
                                input.type = input.type === 'password' ? 'text' : 'password';
                              }
                            }}
                            className="btn btn-ghost btn-sm"
                            aria-label="Toggle API key visibility"
                          >
                            👁️ Toggle Visibility
                          </button>
                          <a
                            href="https://console.curseforge.com/#/api-keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                          >
                            🔑 Get API Key
                          </a>
                        </div>
                        <p className="text-sm text-matrix-600 font-mono">
                          Get your API key from the{" "}
                          <a
                            href="https://console.curseforge.com/#/api-keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-primary"
                          >
                            CurseForge Developer Console
                          </a>
                          . API keys use BCrypt hash format.
                        </p>
                        {errors.curseforgeApiKey && (
                          <label className="label">
                            <span className="label-text-alt text-error">
                              {errors.curseforgeApiKey}
                            </span>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Cache Settings */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-matrix-600 font-display font-semibold">Mod Cache Settings</span>
                      </label>
                      <div className="space-y-4">
                        {/* Enable Cache */}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={settings.cacheEnabled}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                cacheEnabled: e.target.checked,
                              }))
                            }
                            disabled={isSaving}
                            id="cache-enabled"
                            aria-label="Enable mod caching"
                          />
                          <label
                            htmlFor="cache-enabled"
                            className="label-text cursor-pointer text-matrix-600 font-mono"
                          >
                            Enable mod caching
                          </label>
                        </div>

                        {/* Cache Refresh Interval */}
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="cache-interval"
                            className="label-text min-w-[200px] text-matrix-600 font-mono"
                          >
                            Refresh interval:
                          </label>
                          <input
                            type="number"
                            id="cache-interval"
                            className="input input-bordered w-20"
                            value={settings.cacheRefreshInterval}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                cacheRefreshInterval:
                                  parseInt(e.target.value) || 5,
                              }))
                            }
                            min="1"
                            max="24"
                            disabled={isSaving || !settings.cacheEnabled}
                            aria-label="Cache refresh interval in hours"
                          />
                          <span className="label-text">hours</span>
                        </div>

                        <p className="text-sm text-matrix-600 font-mono">
                          Mod data is cached to improve performance. Cache is
                          refreshed automatically every{" "}
                          {settings.cacheRefreshInterval} hours.
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 mt-8">
                      <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost min-w-[100px]"
                        disabled={isSaving || isDownloading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary min-w-[140px]"
                        disabled={isSaving || isDownloading}
                      >
                        {isSaving ? (
                          <>
                            <span className="loading loading-spinner loading-sm" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
}
