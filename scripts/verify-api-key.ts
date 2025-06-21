#!/usr/bin/env node

/**
 * Verify CurseForge API key format and basic connectivity
 */

import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local or .env from project root
function loadEnvFile() {
  // Always resolve from project root
  const envLocalPath = path.join(process.cwd(), ".env.local");
  const envPath = path.join(process.cwd(), ".env");

  if (fs.existsSync(envLocalPath)) {
    console.log("📁 Loading environment from .env.local");
    const envContent = fs.readFileSync(envLocalPath, "utf8");
    const lines = envContent.split("\n");
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=");
          process.env[key] = value;
        }
      }
    });
  } else if (fs.existsSync(envPath)) {
    console.log("📁 Loading environment from .env");
    const envContent = fs.readFileSync(envPath, "utf8");
    const lines = envContent.split("\n");
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=");
          process.env[key] = value;
        }
      }
    });
  } else {
    console.log("⚠️  No .env.local or .env file found");
  }
}

// Load environment variables
loadEnvFile();

const API_KEY = process.env.CURSEFORGE_API_KEY;

console.log("🔍 CurseForge API Key Verification\n");

if (!API_KEY) {
  console.error("❌ CURSEFORGE_API_KEY not found in environment variables");
  console.log(
    "   Make sure .env.local file exists and contains CURSEFORGE_API_KEY=your_key"
  );
  console.log(
    "   Or set the environment variable: export CURSEFORGE_API_KEY=your_key"
  );
  process.exit(1);
}

console.log("📋 API Key Analysis:");
console.log(`   Length: ${API_KEY.length} characters`);
console.log(
  `   Format: ${API_KEY.startsWith("$2a$") ? "Valid (bcrypt format)" : /^[a-zA-Z0-9]+$/.test(API_KEY) ? "Valid (alphanumeric)" : "Invalid (contains special characters)"}`
);

// Check if it looks like a bcrypt hash (which is what CurseForge is providing)
if (API_KEY.startsWith("$2a$")) {
  console.log(
    "\n✅ This appears to be a bcrypt-formatted API key from CurseForge!"
  );
  console.log(
    "   This is the format that CurseForge is currently providing for API keys."
  );
  console.log(
    "   The key should work with the CurseForge API despite the unusual format."
  );
}

// Check for truncation - bcrypt keys should be 60 characters
if (API_KEY.startsWith("$2a$") && API_KEY.length < 60) {
  console.log("\n⚠️  WARNING: bcrypt API key appears to be truncated!");
  console.log("   Bcrypt-formatted API keys should be exactly 60 characters long.");
  console.log("   This might be due to:");
  console.log("   - Environment variable length limits");
  console.log("   - Build process truncation");
  console.log("   - Incorrect copying from CurseForge console");
  console.log("\n   Solutions:");
  console.log("   1. Check your .env file for the complete API key");
  console.log("   2. Remove any quotes around the API key value");
  console.log("   3. Ensure the API key is copied completely from CurseForge");
  console.log("   4. Restart your development server after making changes");
} else if (!API_KEY.startsWith("$2a$") && API_KEY.length < 32) {
  console.log("\n⚠️  WARNING: Traditional API key appears to be truncated!");
  console.log("   Traditional CurseForge API keys should be at least 32 characters long.");
  console.log("   This might be due to:");
  console.log("   - Environment variable length limits");
  console.log("   - Build process truncation");
  console.log("   - Incorrect copying from CurseForge console");
  console.log("\n   Solutions:");
  console.log("   1. Check your .env file for the complete API key");
  console.log("   2. Remove any quotes around the API key value");
  console.log("   3. Ensure the API key is copied completely from CurseForge");
  console.log("   4. Restart your development server after making changes");
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
  .then((response) => {
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