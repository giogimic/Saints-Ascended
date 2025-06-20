import React, { useState, useEffect } from "react";
import { Layout } from "../components/ui/Layout";
import { CurseForgeAPI } from "../lib/curseforge-api";

export default function CurseForgeTest() {
  const [gameId, setGameId] = useState(CurseForgeAPI.getGameId());
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyConfig, setApiKeyConfig] = useState<any>(null);

  // Load API key configuration on component mount
  useEffect(() => {
    checkApiKeyConfig();
  }, []);

  const checkApiKeyConfig = async () => {
    try {
      const response = await fetch("/api/curseforge/check-api-key");
      if (response.ok) {
        const data = await response.json();
        setApiKeyConfig(data.data);
      }
    } catch (error) {
      console.error("Failed to check API key config:", error);
    }
  };

  const testEndpoint = async (endpoint: string, testName: string) => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      if (!response.ok) {
        setError(
          `${testName} failed: ${response.status} - ${data.error || data.message || "Unknown error"}`
        );
        setTestResult(data);
      } else {
        setTestResult(data);
      }
    } catch (err: any) {
      setError(`${testName} error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGamesList = () =>
    testEndpoint("/api/curseforge/games?pageSize=10", "Games List");
  const testCategories = () =>
    testEndpoint("/api/curseforge/categories", "Categories");
  const testSearch = () =>
    testEndpoint(
      "/api/curseforge/search?searchFilter=test&pageSize=5",
      "Search Mods"
    );

  const updateGameId = async () => {
    try {
      const response = await fetch("/api/curseforge/set-game-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });

      if (response.ok) {
        setError(null);
        setTestResult({ message: `Game ID updated to ${gameId}` });
      } else {
        const data = await response.json();
        setError(`Failed to update game ID: ${data.error}`);
      }
    } catch (err: any) {
      setError(`Error updating game ID: ${err.message}`);
    }
  };

  return (
    <Layout
      onAddServer={() => {}}
      onGlobalSettings={() => {}}
      globalSettings={null}
      showSidebar={false}
    >
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">CurseForge API Test</h1>

        {/* API Key Configuration Status */}
        <div className="card bg-base-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Key Configuration</h2>

          {apiKeyConfig && (
            <div
              className={`alert ${apiKeyConfig.hasApiKey && apiKeyConfig.isValidFormat ? "alert-success" : "alert-error"} mb-4`}
            >
              <div>
                <h3 className="font-bold">API Key Status</h3>
                <div className="text-sm">
                  <p>
                    <strong>Status:</strong>{" "}
                    {apiKeyConfig.hasApiKey ? "Configured" : "Not Configured"}
                  </p>
                  <p>
                    <strong>Source:</strong>{" "}
                    {apiKeyConfig.source === "file"
                      ? ".env.local file"
                      : apiKeyConfig.source === "env"
                        ? "Environment variable"
                        : "None"}
                  </p>
                  <p>
                    <strong>Length:</strong> {apiKeyConfig.keyLength} characters
                  </p>
                  <p>
                    <strong>Format:</strong>{" "}
                    {apiKeyConfig.isValidFormat ? "Valid" : "Invalid"}
                  </p>
                  <p>
                    <strong>Message:</strong> {apiKeyConfig.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Game ID</span>
            </label>
            <div className="join">
              <input
                type="number"
                value={gameId}
                onChange={(e) => setGameId(parseInt(e.target.value) || 0)}
                className="input input-bordered join-item"
                placeholder="Enter game ID"
                title="Game ID"
              />
              <button
                onClick={updateGameId}
                className="btn btn-primary join-item"
              >
                Update
              </button>
            </div>
            <label className="label">
              <span className="label-text-alt">
                Common IDs: 443 (ARK:SE), 70886, 83374, 929420
              </span>
            </label>
          </div>

          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h3 className="font-bold">API Key Requirements</h3>
              <div className="text-xs">
                <p>
                  You need a valid CurseForge API key with proper permissions.
                  For third-party apps, you need to apply for access.
                </p>
                <p className="mt-2">
                  <strong>To fix truncated API key issues:</strong>
                </p>
                <ul className="list-disc list-inside mt-1">
                  <li>Ensure your .env.local file contains the full API key</li>
                  <li>Remove any quotes around the API key value</li>
                  <li>Check that the API key is at least 32 characters long</li>
                  <li>Restart the development server after making changes</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={checkApiKeyConfig}
            className="btn btn-outline btn-sm"
          >
            Refresh API Key Status
          </button>
        </div>

        <div className="card bg-base-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Endpoints</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={testGamesList}
              disabled={loading}
              className="btn btn-secondary"
            >
              Test Games List
            </button>

            <button
              onClick={testCategories}
              disabled={loading}
              className="btn btn-secondary"
            >
              Test Categories
            </button>

            <button
              onClick={testSearch}
              disabled={loading}
              className="btn btn-secondary"
            >
              Test Search
            </button>
          </div>
        </div>

        {/* Test Token Bucket Rate Limiter */}
        <div className="card bg-base-100 border border-base-content/10 shadow-lg">
          <div className="card-body">
            <h3 className="text-lg font-semibold mb-4">
              Token Bucket Rate Limiter Test
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "/api/curseforge/background-fetch"
                      );
                      const data = await response.json();
                      console.log("Token bucket status:", data);
                      alert(
                        `Token bucket status: ${JSON.stringify(data, null, 2)}`
                      );
                    } catch (error) {
                      console.error("Error:", error);
                      alert("Error fetching token bucket status");
                    }
                  }}
                  className="btn btn-primary"
                >
                  Check Token Bucket Status
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "/api/curseforge/background-fetch",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "start" }),
                        }
                      );
                      const data = await response.json();
                      console.log("Start response:", data);
                      alert(`Background fetching started: ${data.message}`);
                    } catch (error) {
                      console.error("Error:", error);
                      alert("Error starting background fetching");
                    }
                  }}
                  className="btn btn-success"
                >
                  Start Background Fetching
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "/api/curseforge/background-fetch",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "stop" }),
                        }
                      );
                      const data = await response.json();
                      console.log("Stop response:", data);
                      alert(`Background fetching stopped: ${data.message}`);
                    } catch (error) {
                      console.error("Error:", error);
                      alert("Error stopping background fetching");
                    }
                  }}
                  className="btn btn-error"
                >
                  Stop Background Fetching
                </button>
              </div>
              <div className="text-sm text-base-content/70">
                <p>
                  • Token bucket allows 60 requests per minute (1 per second)
                </p>
                <p>• Background fetching automatically respects rate limits</p>
                <p>• Check browser console for detailed logs</p>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="alert">
            <span className="loading loading-spinner"></span>
            <span>Testing API...</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {testResult && (
          <div className="card bg-base-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <pre className="overflow-auto bg-base-300 p-4 rounded">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Layout>
  );
}
