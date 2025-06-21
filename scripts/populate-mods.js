#!/usr/bin/env node

/**
 * Manual Mod Population Script
 * Triggers cache refresh and mod population for testing
 */

import { getEffectiveCurseForgeApiKey } from '../lib/global-settings-wrapper.js';
import { triggerCacheRefresh } from '../lib/cache-refresh-wrapper.js';

console.log('🚀 Manual Mod Population Script');
console.log('================================\n');

// Check API key first
const apiKey = getEffectiveCurseForgeApiKey();
if (!apiKey) {
  console.error('❌ CurseForge API key not found in environment variables or global settings');
  console.log('Please set your CurseForge API key in the app\'s Global Settings or environment variables');
  process.exit(1);
}

console.log('✅ API key found and verified');
console.log('📋 Starting manual mod population...\n');

try {
  console.log('🔄 Triggering manual cache refresh...');
  await triggerCacheRefresh();
  
  console.log('✅ Manual cache refresh completed!');
  console.log('\n📊 Checking database population...');
  
  // Check database after population
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    const modCount = await prisma.mod.count();
    const cacheCount = await prisma.modCache.count();
    const categoryCount = await prisma.modCategory.count();
    
    console.log(`📈 Population Results:`);
    console.log(`   • Mods: ${modCount}`);
    console.log(`   • Cache Entries: ${cacheCount}`);
    console.log(`   • Categories: ${categoryCount}`);
    
    if (modCount > 0) {
      console.log('\n🎉 Mod population successful!');
      console.log('   The database now contains mod data.');
      console.log('   You can now use the mod manager in the web interface.');
      
      // Show some sample mods
      const sampleMods = await prisma.mod.findMany({
        take: 5,
        orderBy: { downloadCount: 'desc' }
      });
      
      if (sampleMods.length > 0) {
        console.log('\n📋 Sample mods loaded:');
        sampleMods.forEach((mod, index) => {
          console.log(`   ${index + 1}. ${mod.name} (${mod.downloadCount} downloads)`);
        });
      }
    } else {
      console.log('\n⚠️  No mods were populated.');
      console.log('   This could indicate:');
      console.log('   • Network connectivity issues');
      console.log('   • API rate limiting');
      console.log('   • No mods found for the search terms');
      console.log('   • Database write permissions issues');
    }
    
  } catch (dbError) {
    console.error('❌ Database check failed:', dbError.message);
  } finally {
    await prisma.$disconnect();
  }
  
} catch (error) {
  console.error('❌ Cache refresh failed:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('1. Check your internet connection');
  console.log('2. Verify the CurseForge API is accessible');
  console.log('3. Check if your API key has the correct permissions');
  console.log('4. Try starting the development server: npm run dev');
}

console.log('\n📝 Next steps:');
console.log('1. Check the web interface for mods');
console.log('2. If no mods appear, check the browser console for errors');
console.log('3. Verify the CurseForge API is accessible');
console.log('4. Check the application logs for any errors'); 