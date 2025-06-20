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
  const [settings, setSettings] = useState<GlobalSettings>(
    () =>
      externalSettings || {
        siteTitle: "Ark Server Manager",
        favicon: "🦕",
        steamCmdPath: "",
        cacheRefreshInterval: 5,
        cacheEnabled: true,
        updatedAt: new Date(),
      }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [faviconType, setFaviconType] = useState<"emoji" | "custom">("emoji");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isThemeChange, setIsThemeChange] = useState(false);

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

    if (result.success) {
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
      console.error("Failed to load global settings:", result.error);
      // Keep default settings if loading fails
    }

    setIsLoading(false);
  };

  const validateSettings = (): boolean => {
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
      faviconType === "custom" &&
      !settings.favicon.startsWith("data:") &&
      !settings.favicon.startsWith("http")
    ) {
      newErrors.favicon = "Custom favicon must be a valid URL or data URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

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

  return isOpen ? (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Improved backdrop with proper z-index and blur */}
        <div
          className="fixed inset-0 bg-base-300/75 backdrop-blur-sm transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-hidden="true"
        />

        {/* Modal panel */}
        <div className="inline-block transform overflow-hidden rounded-lg bg-base-100 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:align-middle">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium leading-6">
                    Global Settings
                  </h3>
                  <button
                    onClick={onClose}
                    className="rounded-full p-1 hover:bg-base-200 transition-colors"
                    aria-label="Close dialog"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  {/* Site Title */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Site Title *</span>
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
                      <span className="label-text">Favicon *</span>
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
                        <p className="text-sm text-base-content/60">
                          Max file size: 100KB. Recommended size: 32x32 pixels.
                        </p>
                        {settings.favicon &&
                          settings.favicon.startsWith("data:") && (
                            <img
                              src={settings.favicon}
                              alt="Current favicon"
                              className="h-8 w-8 rounded border border-base-content/20 mt-2"
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
                      <span className="label-text">SteamCMD Path</span>
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

                  {/* Cache Settings */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Mod Cache Settings</span>
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
                          className="label-text cursor-pointer"
                        >
                          Enable mod caching
                        </label>
                      </div>

                      {/* Cache Refresh Interval */}
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="cache-interval"
                          className="label-text min-w-[200px]"
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

                      <p className="text-sm text-base-content/60">
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
  ) : null;
}
