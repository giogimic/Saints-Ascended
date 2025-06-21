#!/usr/bin/env node

/**
 * Verify CurseForge API key format and basic connectivity
 */

import https from "https";
import { getEffectiveCurseForgeApiKey } from "../lib/global-settings-wrapper.js";

console.log("🔍 CurseForge API Key Verification\n");

const API_KEY = getEffectiveCurseForgeApiKey();

if (!API_KEY) {
  console.error("❌ CurseForge API key not found in Global Settings");
  console.log(
    "   Please set your CurseForge API key in the app's Global Settings interface."
  );
  process.exit(1);
}

console.log("📋 API Key Analysis:");
console.log(`   Length: ${API_KEY.length} characters`);
console.log(
  `   Format: ${/^[a-zA-Z0-9]+$/.test(API_KEY) ? "Valid (alphanumeric)" : "Invalid (contains special characters)"}`
);

// Check if it looks like a bcrypt hash
if (API_KEY.startsWith("$2a$")) {
  console.log(
    "\n⚠️  WARNING: This looks like a bcrypt hash, not a CurseForge API key!"
  );
  console.log(
    "   CurseForge API keys are typically 32-64 characters and alphanumeric."
  );
  console.log(
    "   However, if you copied this directly from CurseForge, let's test it anyway."
  );
}

// Check for truncation
if (API_KEY.length < 32) {
  console.log("\n⚠️  WARNING: API key appears to be truncated!");
  console.log("   CurseForge API keys should be at least 32 characters long.");
  console.log("   This might be due to:");
  console.log("   - Incorrect copying from CurseForge console");
  console.log("   - Incomplete API key in Global Settings");
  console.log("\n   Solutions:");
  console.log("   1. Check your Global Settings for the complete API key");
  console.log("   2. Ensure the API key is copied completely from CurseForge");
  console.log("   3. Restart your development server after making changes");
}

// Test basic connectivity
console.log("\n🧪 Testing API connectivity...");

function testAPI(): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.curseforge.com",
      path: "/v1/games/83374",
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-api-key": API_KEY,
        "User-Agent": "Saints-Ascended-Verify/1.0",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode || 0, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode || 0, data: data });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

testAPI()
  .then((response: { status: number; data: any }) => {
    console.log(`   Status: ${response.status}`);

    if (response.status === 200) {
      console.log("✅ API key is valid and working!");
      console.log(`   Game: ${response.data.data.name}`);
      console.log("\n🎉 Your CurseForge API integration is ready to use!");
    } else if (response.status === 401) {
      console.log("❌ Authentication failed - Invalid API key");
      console.log("   The API key format or value is incorrect");
      console.log("   Please check:");
      console.log(
        "   1. The API key is copied correctly from CurseForge console"
      );
      console.log("   2. The API key is not truncated");
      console.log("   3. The API key has the correct permissions");
    } else if (response.status === 403) {
      console.log("❌ Access forbidden - Check API key permissions");
      console.log(
        "   Make sure your API key has the correct permissions in CurseForge Console"
      );
      if (response.data && response.data.errorMessage) {
        console.log(`   Error: ${response.data.errorMessage}`);
      }
    } else {
      console.log(`❌ Unexpected response: ${response.status}`);
      if (response.data && response.data.errorMessage) {
        console.log(`   Error: ${response.data.errorMessage}`);
      }
      console.log("   Raw response:", JSON.stringify(response.data, null, 2));
    }
  })
  .catch((error) => {
    console.error("❌ Network error:", error.message);
    console.log("   Please check your internet connection and try again.");
  });

/**
 * Test basic connectivity to CurseForge API
 */
async function testConnectivity(apiKey: string) {
  console.log("\n🌐 Testing connectivity to CurseForge API...");
  
  const testEndpoints = [
    { name: "Games List", url: "https://api.curseforge.com/v1/games?index=0&pageSize=1" },
    { name: "Categories", url: "https://api.curseforge.com/v1/categories?gameId=83374" }
  ];

  for (const endpoint of testEndpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const start = Date.now();
      
      const response = await fetch(endpoint.url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "X-API-Key": apiKey,
          "User-Agent": "Saints-Ascended/1.0"
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const duration = Date.now() - start;
      
      if (response.ok) {
        console.log(`✅ ${endpoint.name}: ${response.status} (${duration}ms)`);
        
        // Check rate limit headers
        const remaining = response.headers.get('x-ratelimit-remaining');
        const reset = response.headers.get('x-ratelimit-reset');
        if (remaining && reset) {
          console.log(`   Rate limit: ${remaining} requests remaining, resets at ${new Date(parseInt(reset) * 1000).toLocaleTimeString()}`);
        }
      } else {
        console.log(`❌ ${endpoint.name}: ${response.status} ${response.statusText} (${duration}ms)`);
        const errorText = await response.text().catch(() => 'No error details');
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error instanceof Error ? error.message : String(error)}`);
      
      if (error instanceof Error && error.name === 'TimeoutError') {
        console.log(`   ⚠️ Request timed out after 10 seconds - this indicates network connectivity issues`);
      }
    }
  }
} 