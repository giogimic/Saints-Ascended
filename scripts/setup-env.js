#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment for Saints Ascended...');

// Set DATABASE_URL environment variable
process.env.DATABASE_URL = 'file:./prisma/data/mods.db';

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '..', 'prisma', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('📁 Created database directory');
}

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env.local not found!');
  console.log('   Please create .env.local with your configuration:');
  console.log('   CURSEFORGE_API_KEY=your_api_key_here');
  console.log('   DATABASE_URL=file:./prisma/data/mods.db');
  process.exit(1);
}

console.log('✅ Environment setup complete!');
console.log('   DATABASE_URL set to: file:./prisma/data/mods.db');
console.log('   Database directory: prisma/data/'); 