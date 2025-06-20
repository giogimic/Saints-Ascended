#!/usr/bin/env node

/**
 * Verify CurseForge API key format and basic connectivity
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env.local file
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    });
  }
}

// Load environment variables
loadEnvFile();

const API_KEY = process.env.CURSEFORGE_API_KEY;

console.log('🔍 CurseForge API Key Verification\n');

if (!API_KEY) {
  console.error('❌ CURSEFORGE_API_KEY not found in environment variables');
  console.log('   Make sure .env.local file exists and contains CURSEFORGE_API_KEY=your_key');
  process.exit(1);
}

console.log('📋 API Key Analysis:');
console.log(`   Length: ${API_KEY.length} characters`);
console.log(`   Starts with: ${API_KEY.substring(0, 10)}...`);
console.log(`   Contains special chars: ${/[^a-zA-Z0-9-]/.test(API_KEY) ? 'Yes' : 'No'}`);

// Check if it looks like a bcrypt hash
if (API_KEY.startsWith('$2a$')) {
  console.log('\n⚠️  WARNING: This looks like a bcrypt hash, not a CurseForge API key!');
  console.log('   CurseForge API keys are typically 32-64 characters and alphanumeric.');
  console.log('   However, if you copied this directly from CurseForge, let\'s test it anyway.');
}

// Test basic connectivity
console.log('\n🧪 Testing API connectivity...');

function testAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.curseforge.com',
      path: '/v1/games/83374',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-api-key': API_KEY,
        'User-Agent': 'Saints-Ascended-Verify/1.0'
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
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

testAPI()
  .then((response) => {
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ API key is valid and working!');
      console.log(`   Game: ${response.data.data.name}`);
    } else if (response.status === 401) {
      console.log('❌ Authentication failed - Invalid API key');
      console.log('   The API key format or value is incorrect');
    } else if (response.status === 403) {
      console.log('❌ Access forbidden - Check API key permissions');
      console.log('   Make sure your API key has the correct permissions in CurseForge Console');
      if (response.data && response.data.errorMessage) {
        console.log(`   Error: ${response.data.errorMessage}`);
      }
    } else {
      console.log(`❌ Unexpected response: ${response.status}`);
      if (response.data && response.data.errorMessage) {
        console.log(`   Error: ${response.data.errorMessage}`);
      }
      console.log('   Raw response:', JSON.stringify(response.data, null, 2));
    }
  })
  .catch((error) => {
    console.error('❌ Network error:', error.message);
  }); 