#!/usr/bin/env node

/**
 * Test script for CurseForge API integration
 * Run with: node scripts/test-curseforge.js
 */

const https = require('https');

// Configuration
const API_KEY = process.env.CURSEFORGE_API_KEY;
const GAME_ID = 83374; // ARK: Survival Ascended
const BASE_URL = 'https://api.curseforge.com/v1';

if (!API_KEY) {
  console.error('❌ CURSEFORGE_API_KEY environment variable not set');
  console.log('Please set your CurseForge API key:');
  console.log('export CURSEFORGE_API_KEY=your_api_key_here');
  process.exit(1);
}

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.curseforge.com',
      path: `/v1${endpoint}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-api-key': API_KEY,
        'User-Agent': 'Saints-Ascended-Test/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing CurseForge API Integration...\n');

  try {
    // Test 1: Get game details
    console.log('1. Testing game details...');
    const gameResponse = await makeRequest(`/games/${GAME_ID}`);
    if (gameResponse.status === 200) {
      console.log(`✅ Game ID ${GAME_ID} is valid!`);
      console.log(`   Name: ${gameResponse.data.data.name}`);
      console.log(`   Slug: ${gameResponse.data.data.slug}`);
    } else {
      console.log(`❌ Failed to get game details: ${gameResponse.status}`);
    }

    // Test 2: Get categories
    console.log('\n2. Testing categories...');
    const categoriesResponse = await makeRequest(`/categories?gameId=${GAME_ID}`);
    if (categoriesResponse.status === 200) {
      console.log(`✅ Categories loaded successfully!`);
      console.log(`   Found ${categoriesResponse.data.data.length} categories`);
      categoriesResponse.data.data.slice(0, 5).forEach(cat => {
        console.log(`   - ${cat.name} (ID: ${cat.id})`);
      });
    } else {
      console.log(`❌ Failed to get categories: ${categoriesResponse.status}`);
    }

    // Test 3: Search mods
    console.log('\n3. Testing mod search...');
    const searchResponse = await makeRequest(`/mods/search?gameId=${GAME_ID}&searchFilter=test&pageSize=5`);
    if (searchResponse.status === 200) {
      console.log(`✅ Mod search working!`);
      console.log(`   Found ${searchResponse.data.data.length} mods`);
      searchResponse.data.data.slice(0, 3).forEach(mod => {
        console.log(`   - ${mod.name} (ID: ${mod.id}, Downloads: ${mod.downloadCount})`);
      });
    } else {
      console.log(`❌ Failed to search mods: ${searchResponse.status}`);
    }

    console.log('\n🎉 All tests completed!');
    
    if (gameResponse.status === 200 && categoriesResponse.status === 200 && searchResponse.status === 200) {
      console.log('✅ CurseForge API integration is working correctly!');
      console.log('\n📝 Next steps:');
      console.log('1. Make sure your .env.local file has CURSEFORGE_API_KEY set');
      console.log('2. Restart your development server: npm run dev');
      console.log('3. Test the mod manager in the web interface');
    } else {
      console.log('❌ Some tests failed. Check your API key and permissions.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testAPI(); 