#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🚀 Running post-install configuration...\n");

// Ensure DaisyUI is properly configured
console.log("🎨 Checking DaisyUI configuration...");

// Check if node_modules/daisyui exists
const daisyUIPath = path.join(__dirname, "..", "node_modules", "daisyui");
if (fs.existsSync(daisyUIPath)) {
  console.log("✅ DaisyUI installed successfully");
} else {
  console.log("⚠️  DaisyUI not found in node_modules");
  console.log("   Please ensure npm install completed successfully");
}

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("✅ Created data directory");
}

// Create scripts directory if it doesn't exist
const scriptsDir = path.join(__dirname, "..", "scripts");
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
  console.log("✅ Created scripts directory");
}

// Verify critical configuration files
const requiredFiles = [
  "tailwind.config.js",
  "postcss.config.js",
  "styles/globals.css",
  "lib/theme-manager.ts",
  "components/ThemeSwitcher.tsx",
];

console.log("\n📋 Verifying configuration files...");
let allFilesPresent = true;

requiredFiles.forEach((file) => {
  const filePath = path.join(__dirname, "..", file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing`);
    allFilesPresent = false;
  }
});

if (allFilesPresent) {
  console.log("\n✨ Post-install configuration complete!");
  console.log("🎨 Saints Gaming theme is ready to use with Saints Ascended");
} else {
  console.log("\n⚠️  Some configuration files are missing");
  console.log(
    "   Please ensure the Saints Ascended project structure is complete"
  );
}

console.log(
  "\n🛠️ Saints Ascended — ARK: Survival Ascended Server Tool & Config Manager"
);
console.log(
  "🎨 Active theme: Saints Gaming - Aggressive neon UI tailored for ASA"
);

// Final instruction
console.log("\n🚀 Ready to start development!");
console.log("   Run: npm run dev");
