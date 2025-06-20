import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  PuzzlePieceIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { useModal } from "@/context/ModalContext";
import { ErrorHandler } from "@/lib/error-handler";

// This would be your actual CurseForge mod data structure
interface CurseForgeMod {
  id: number;
  name: string;
  summary: string;
  logo?: { url: string };
  authors: { name: string }[];
  downloadCount: number;
}

export function AddModsModal() {
  const { closeModal, payload } = useModal();
  const { serverId } = payload || {};
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CurseForgeMod[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  if (!serverId) {
    // This case should ideally not happen if the modal is opened correctly
    return null;
  }

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    const result = await ErrorHandler.handleAsync(
      async () => {
        setIsSearching(true);
        setSearchError(null);
        const response = await fetch(
          `/api/curseforge/search-optimized?query=${encodeURIComponent(
            searchQuery
          )}`
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to search for mods.");
        }
        const data = await response.json();
        return data.data || [];
      },
      { component: "AddModsModal", action: "searchMods" }
    );

    if (result.success) {
      setSearchResults(result.data);
    } else {
      setSearchError(result.error.userMessage || "An unknown error occurred.");
    }
    setIsSearching(false);
  };

  const handleAddMod = async (mod: CurseForgeMod) => {
    const result = await ErrorHandler.handleAsync(
      async () => {
        const response = await fetch(`/api/servers/${serverId}/mods`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modId: mod.id.toString(),
            name: mod.name,
            // You might need to pass more data here
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to add mod.");
        }
        return response.json();
      },
      {
        component: "AddModsModal",
        action: "addMod",
        serverId,
      }
    );

    if (result.success) {
      toast.success(`Mod "${mod.name}" added successfully!`);
      // Optionally, you could trigger a refresh of the mods list in ModManager
      // This would require a more advanced state management solution or callbacks
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="relative w-full max-w-4xl transform rounded-2xl bg-cyber-panel border-2 border-matrix-500/50 shadow-matrix-glow text-left align-middle transition-all"
          role="dialog"
          aria-modal="true"
        >
          <div className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-matrix-500/30">
              <div className="flex items-center gap-3">
                <PuzzlePieceIcon className="h-6 w-6 text-matrix-500" />
                <h3 className="text-xl font-bold text-matrix-500 font-mono uppercase tracking-wider">
                  Add Mods
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-matrix-500/20 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6 text-matrix-500" />
              </button>
            </div>

            <div className="mt-6">
              <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for mods on CurseForge..."
                    className="w-full bg-cyber-bg border-2 border-matrix-500/50 focus:border-matrix-500 focus:ring-matrix-500/50 p-3 pl-10 text-matrix-400 font-mono"
                    disabled={isSearching}
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-matrix-500/70" />
                </div>
                <button
                  type="submit"
                  className="bg-matrix-500 text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-matrix-400 transition-colors disabled:bg-gray-600"
                  disabled={isSearching}
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </form>

              {searchError && (
                <div className="border border-red-500/50 bg-red-900/20 text-red-400 p-4 mb-4 text-center">
                  <p>{searchError}</p>
                </div>
              )}

              <div className="h-[50vh] overflow-y-auto pr-2">
                {searchResults.length === 0 && !isSearching && (
                  <div className="text-center text-matrix-600 py-10">
                    <p>No mods found. Try a different search term.</p>
                  </div>
                )}
                <ul className="space-y-3">
                  {searchResults.map((mod) => (
                    <li
                      key={mod.id}
                      className="flex items-center gap-4 p-3 bg-cyber-bg/50 border border-matrix-500/20 hover:bg-matrix-900/50 transition-colors"
                    >
                      <img
                        src={mod.logo?.url || "/placeholder.png"}
                        alt={mod.name}
                        className="w-16 h-16 object-cover border-2 border-matrix-500/30"
                      />
                      <div className="flex-grow">
                        <h4 className="font-bold text-matrix-400">{mod.name}</h4>
                        <p className="text-sm text-matrix-600 line-clamp-2">{mod.summary}</p>
                        <div className="text-xs text-matrix-700 mt-1">
                          <span>By: {mod.authors.map(a => a.name).join(', ')}</span>
                          <span className="mx-2">|</span>
                          <span>Downloads: {mod.downloadCount.toLocaleString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddMod(mod)}
                        className="bg-matrix-600 text-white p-2 hover:bg-matrix-500 transition-colors"
                        title="Add Mod"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 