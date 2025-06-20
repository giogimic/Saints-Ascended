import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  gameUserSettingsSchema,
  type GameUserSettingsFormData,
} from "@/lib/validations";
import { clsx } from "clsx";

interface ConfigEditorProps {
  serverId: string;
  initialConfig?: GameUserSettingsFormData;
  onSave: (config: GameUserSettingsFormData) => Promise<void>;
  readOnly?: boolean;
}

interface ConfigField {
  key: string;
  label: string;
  description: string;
  type: "string" | "number" | "boolean";
  category: string;
  min?: number;
  max?: number;
  defaultValue?: any;
}

const configFields: ConfigField[] = [
  // Basic Settings
  {
    key: "ServerName",
    label: "Server Name",
    description: "The name that appears in the server browser",
    type: "string",
    category: "Basic Settings",
  },
  {
    key: "ServerPassword",
    label: "Server Password",
    description:
      "Password required to join the server (leave empty for no password)",
    type: "string",
    category: "Basic Settings",
  },
  {
    key: "ServerAdminPassword",
    label: "Admin Password",
    description: "Password for admin commands",
    type: "string",
    category: "Basic Settings",
  },
  {
    key: "MaxPlayers",
    label: "Max Players",
    description: "Maximum number of players allowed on the server",
    type: "number",
    category: "Basic Settings",
    min: 1,
    max: 200,
    defaultValue: 70,
  },
  {
    key: "ServerIP",
    label: "Server IP",
    description:
      "IP address for the server to bind to (leave empty for all interfaces)",
    type: "string",
    category: "Basic Settings",
  },
  {
    key: "Port",
    label: "Server Port",
    description: "Port number for the game server",
    type: "number",
    category: "Basic Settings",
    min: 1024,
    max: 65535,
    defaultValue: 7777,
  },
  {
    key: "MapName",
    label: "Map Name",
    description: "The map to load for the server",
    type: "string",
    category: "Basic Settings",
    defaultValue: "TheIsland",
  },
  {
    key: "ExePath",
    label: "Executable Path",
    description: "Path to the server executable",
    type: "string",
    category: "Basic Settings",
  },
  {
    key: "ModList",
    label: "Mod List",
    description: "Comma-separated list of mod IDs to load",
    type: "string",
    category: "Basic Settings",
  },

  // Gameplay Settings
  {
    key: "DifficultyOffset",
    label: "Difficulty Offset",
    description: "Server difficulty multiplier (0.0 = Easy, 1.0 = Hard)",
    type: "number",
    category: "Gameplay",
    min: 0,
    max: 1,
    defaultValue: 0.2,
  },
  {
    key: "ServerPVE",
    label: "PvE Mode",
    description: "Enable Player vs Environment mode (disables PvP)",
    type: "boolean",
    category: "Gameplay",
    defaultValue: false,
  },
  {
    key: "ServerCrosshair",
    label: "Show Crosshair",
    description: "Enable crosshair display",
    type: "boolean",
    category: "Gameplay",
    defaultValue: true,
  },
  {
    key: "AllowThirdPersonPlayer",
    label: "Third Person View",
    description: "Allow players to use third person view",
    type: "boolean",
    category: "Gameplay",
    defaultValue: true,
  },

  // Rates and Multipliers
  {
    key: "XPMultiplier",
    label: "XP Multiplier",
    description: "Experience gain multiplier",
    type: "number",
    category: "Rates",
    min: 0.1,
    max: 100,
    defaultValue: 1.0,
  },
  {
    key: "TamingSpeedMultiplier",
    label: "Taming Speed",
    description: "Dinosaur taming speed multiplier",
    type: "number",
    category: "Rates",
    min: 0.1,
    max: 100,
    defaultValue: 1.0,
  },
  {
    key: "HarvestAmountMultiplier",
    label: "Harvest Amount",
    description: "Resource harvest amount multiplier",
    type: "number",
    category: "Rates",
    min: 0.1,
    max: 100,
    defaultValue: 1.0,
  },
  {
    key: "ResourcesRespawnPeriodMultiplier",
    label: "Resource Respawn Speed",
    description: "How quickly resources respawn (lower = faster)",
    type: "number",
    category: "Rates",
    min: 0.1,
    max: 10,
    defaultValue: 1.0,
  },

  // Advanced Settings
  {
    key: "ShowMapPlayerLocation",
    label: "Show Player Location",
    description: "Show player location on the map",
    type: "boolean",
    category: "Advanced",
    defaultValue: false,
  },
  {
    key: "GlobalVoiceChat",
    label: "Global Voice Chat",
    description: "Enable global voice chat",
    type: "boolean",
    category: "Advanced",
    defaultValue: true,
  },
  {
    key: "ProximityChat",
    label: "Proximity Chat",
    description: "Enable proximity-based voice chat",
    type: "boolean",
    category: "Advanced",
    defaultValue: true,
  },
  {
    key: "MaxTribeSize",
    label: "Max Tribe Size",
    description: "Maximum number of players per tribe",
    type: "number",
    category: "Advanced",
    min: 1,
    max: 500,
    defaultValue: 5,
  },

  // Launch Options
  {
    key: "PreventHibernation",
    label: "Prevent Hibernation",
    description: "Prevent server hibernation when no players are online",
    type: "boolean",
    category: "Launch Options",
    defaultValue: true,
  },
  {
    key: "ForceRespawnDinos",
    label: "Force Respawn Dinos",
    description: "Force respawn of dinosaurs on server restart",
    type: "boolean",
    category: "Launch Options",
    defaultValue: false,
  },
  {
    key: "NoBattlEye",
    label: "Disable BattlEye",
    description: "Disable BattlEye anti-cheat system",
    type: "boolean",
    category: "Launch Options",
    defaultValue: false,
  },
  {
    key: "UseBattlEye",
    label: "Enable BattlEye",
    description: "Enable BattlEye anti-cheat system",
    type: "boolean",
    category: "Launch Options",
    defaultValue: true,
  },
  {
    key: "ForceAllowCaveFlyers",
    label: "Force Allow Cave Flyers",
    description: "Allow flying creatures in caves",
    type: "boolean",
    category: "Launch Options",
    defaultValue: false,
  },
  {
    key: "PreventDownloadSurvivors",
    label: "Prevent Download Survivors",
    description: "Prevent downloading survivor data from other servers",
    type: "boolean",
    category: "Launch Options",
    defaultValue: false,
  },
  {
    key: "PreventDownloadItems",
    label: "Prevent Download Items",
    description: "Prevent downloading items from other servers",
    type: "boolean",
    category: "Launch Options",
    defaultValue: false,
  },
  {
    key: "PreventDownloadDinos",
    label: "Prevent Download Dinos",
    description: "Prevent downloading dinosaurs from other servers",
    type: "boolean",
    category: "Launch Options",
    defaultValue: false,
  },
  {
    key: "PreventUploadSurvivors",
    label: "Prevent Upload Survivors",
    description: "Prevent uploading survivor data to other servers",
    type: "boolean",
    category: "Launch Options",
    defaultValue: false,
  },
  {
    key: "PreventUploadItems",
    label: "Prevent Upload Items",
    description: "Prevent uploading items to other servers",
    type: "boolean",
    category: "Launch Options",
    defaultValue: false,
  },
  {
    key: "PreventUploadDinos",
    label: "Prevent Upload Dinos",
    description: "Prevent uploading dinosaurs to other servers",
    type: "boolean",
    category: "Launch Options",
    defaultValue: false,
  },
  {
    key: "ServerLog",
    label: "Enable Server Log",
    description: "Enable detailed server logging",
    type: "boolean",
    category: "Launch Options",
    defaultValue: true,
  },
];

export function ConfigEditor({
  serverId,
  initialConfig = {},
  onSave,
  readOnly = false,
}: ConfigEditorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<GameUserSettingsFormData>({
    resolver: zodResolver(gameUserSettingsSchema),
    defaultValues: initialConfig,
  });

  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(configFields.map((field) => field.category))
    );
    return ["All", ...cats];
  }, []);

  const filteredFields = useMemo(() => {
    return configFields.filter((field) => {
      const matchesSearch =
        field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.key.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || field.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const onSubmit = async (data: GameUserSettingsFormData) => {
    if (readOnly) return;

    setIsSaving(true);
    try {
      await onSave(data);
      toast.success("Configuration saved successfully!");
      reset(data); // Reset form to new values to clear dirty state
    } catch (error) {
      console.error("Failed to save configuration:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    reset(initialConfig);
    toast.success("Configuration reset to last saved values");
  };

  const handleLoadDefaults = () => {
    configFields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        (setValue as any)(field.key, field.defaultValue, { shouldDirty: true });
      }
    });

    toast.success("Default values loaded");
  };

  const renderField = (field: ConfigField) => {
    const error = errors[field.key as keyof GameUserSettingsFormData];
    const fieldProps = {
      // @ts-expect-error - Form library typing complexity
      ...register(field.key as keyof GameUserSettingsFormData),
      id: field.key,
      disabled: readOnly,
      className: clsx(
        "input input-bordered w-full bg-base-200 border-base-content/20 focus:border-primary",
        {
          "border-error focus:border-error": error,
          "bg-base-300": readOnly,
        }
      ),
    };

    switch (field.type) {
      case "boolean":
        return (
          <div className="flex items-center">
            <input
              {...fieldProps}
              type="checkbox"
              className={clsx("checkbox checkbox-primary", {
                "bg-base-300": readOnly,
              })}
            />
            <label
              htmlFor={field.key}
              className="ml-2 text-sm text-base-content"
            >
              {field.label}
            </label>
          </div>
        );

      case "number":
        return (
          <div className="form-control">
            <label htmlFor={field.key} className="label">
              <span className="label-text">{field.label}</span>
            </label>
            <input
              {...fieldProps}
              type="number"
              min={field.min}
              max={field.max}
              step={field.min && field.min < 1 ? "0.1" : "1"}
              placeholder={field.defaultValue?.toString() || ""}
            />
          </div>
        );

      case "string":
      default:
        return (
          <div className="form-control">
            <label htmlFor={field.key} className="label">
              <span className="label-text">{field.label}</span>
            </label>
            <input
              {...fieldProps}
              type={
                field.key.toLowerCase().includes("password")
                  ? "password"
                  : "text"
              }
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      {/* Header */}
      <div className="card bg-base-100 border border-base-content/10 shadow-lg">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-base-content">
                  Server Configuration
                </h2>
                <p className="text-sm text-base-content/60">
                  Configure GameUserSettings.ini for server {serverId}
                </p>
              </div>
            </div>

            {!readOnly && (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleLoadDefaults}
                  className="btn btn-outline btn-sm"
                  disabled={isSaving}
                >
                  <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
                  Load Defaults
                </button>

                {isDirty && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn btn-outline btn-sm"
                    disabled={isSaving}
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    Reset
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="card-body border-t border-base-content/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Search configuration options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full pl-10 bg-base-200 border-base-content/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select select-bordered w-full bg-base-200 border-base-content/20 focus:border-primary"
                title="Filter by category"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {filteredFields.length === 0 ? (
          <div className="card bg-base-100 border border-base-content/10 shadow-lg">
            <div className="card-body text-center py-12">
              <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-base-content/40" />
              <h3 className="mt-2 text-sm font-medium text-base-content">
                No configuration options found
              </h3>
              <p className="mt-1 text-sm text-base-content/60">
                Try adjusting your search or category filter.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.slice(1).map((category) => {
              const categoryFields = filteredFields.filter(
                (field) => field.category === category
              );
              if (categoryFields.length === 0) return null;

              return (
                <div
                  key={category}
                  className="card bg-base-100 border border-base-content/10 shadow-lg"
                >
                  <div className="card-body">
                    <h3 className="text-lg font-medium text-base-content mb-4">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {categoryFields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          {renderField(field)}
                          <p className="text-xs text-base-content/60">
                            {field.description}
                          </p>
                          {errors[
                            field.key as keyof GameUserSettingsFormData
                          ] && (
                            <p className="text-xs text-error">
                              {
                                errors[
                                  field.key as keyof GameUserSettingsFormData
                                ]?.message
                              }
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Save Button */}
        {!readOnly && filteredFields.length > 0 && (
          <div className="card bg-base-100 border border-base-content/10 shadow-lg">
            <div className="card-body">
              <div className="flex justify-end space-x-3">
                <button
                  type="submit"
                  disabled={!isDirty || isSaving}
                  className="btn btn-primary"
                >
                  {isSaving ? (
                    <>
                      <div className="loading-spinner w-4 h-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>

              {isDirty && (
                <p className="text-sm text-warning mt-2">
                  You have unsaved changes.
                </p>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
