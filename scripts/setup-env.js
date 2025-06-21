#!/usr/bin/env node

/**
 * Environment Setup Helper
 * Guides users through setting up required environment variables
 */

import fs from 'fs';
import path from 'path';
import { getEffectiveCurseForgeApiKey } from '../lib/global-settings-wrapper.js';

console.log('🔧 Saints-Ascended Environment Setup Helper\n');

// Check current environment
console.log('📋 Current Environment Status:');
console.log('================================');

// Database URL
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  console.log(`✅ DATABASE_URL: ${dbUrl}`);
} else {
  console.log('❌ DATABASE_URL: Not set');
  console.log('   💡 Recommended: file:./prisma/prisma/dev.db');
}

// CurseForge API Key
const apiKey = getEffectiveCurseForgeApiKey();
if (apiKey) {
  const isValidFormat = /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/.test(apiKey);
  console.log(`✅ CURSEFORGE_API_KEY: Set (${apiKey.length} characters)`);
  console.log(`${isValidFormat ? '✅' : '❌'} Format: ${isValidFormat ? 'Valid BCrypt' : 'Invalid - should be BCrypt hash'}`);
} else {
  console.log('❌ CURSEFORGE_API_KEY: Not set');
  console.log('   💡 Required: Get from https://console.curseforge.com/');
}

console.log('\n📖 Setup Instructions:');
console.log('======================');

if (!dbUrl) {
  console.log('\n1️⃣ Set Database URL (PowerShell):');
  console.log('   $env:DATABASE_URL="file:./prisma/prisma/dev.db"');
}

if (!apiKey) {
  console.log('\n2️⃣ Set CurseForge API Key in Global Settings:');
  console.log('   • Open the app in your browser');
  console.log('   • Go to Global Settings (gear icon)');
  console.log('   • Enter your CurseForge API key');
  console.log('   • Save the settings');
  console.log('\n   📋 To get an API key:');
  console.log('   • Visit: https://console.curseforge.com/');
  console.log('   • Create account or log in');
  console.log('   • Navigate to API Keys section');
  console.log('   • Create a new API key for your application');
  console.log('   • Copy the BCrypt hash (starts with $2a$10$...)');
}

console.log('\n3️⃣ Verify Setup:');
console.log('   node scripts/setup-env.js');

console.log('\n4️⃣ Test API Connection:');
console.log('   node scripts/verify-api-key.js');

console.log('\n5️⃣ Check Database Population:');
console.log('   node scripts/check-database.js');

if (dbUrl && apiKey) {
  console.log('\n🎉 Environment appears to be configured correctly!');
  console.log('   Run the verification scripts above to test functionality.');
} else {
  console.log('\n⚠️  Environment setup incomplete. Please follow the instructions above.');
}

console.log('\n📚 Additional Help:');
console.log('==================');
console.log('• Documentation: README.md');
console.log('• Setup Guide: SETUP.md');
console.log('• Deployment: DEPLOYMENT.md');
console.log('• Troubleshooting: lets-fix-mod-loading-v2.md');

// Set DATABASE_URL environment variable
process.env.DATABASE_URL = 'file:./prisma/data/mods.db';

// Create database directory if it doesn't exist
const dbDir = path.join(process.cwd(), 'prisma', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('📁 Created database directory');
}

console.log('✅ Environment setup complete!');
console.log('   DATABASE_URL set to: file:./prisma/data/mods.db');
console.log('   Database directory: prisma/data/');
console.log('   API Key: Use Global Settings interface'); 