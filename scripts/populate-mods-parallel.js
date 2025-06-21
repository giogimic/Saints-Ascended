#!/usr/bin/env node

// scripts/populate-mods-parallel.js - Optimized parallel mod population script

const { PrismaClient } = require('@prisma/client');
const { CurseForgeAPI } = require('../lib/curseforge-api');

const prisma = new PrismaClient();

async function populateModsParallel() {
  console.log('🚀 Starting optimized parallel mod population...');
  
  try {
    // First, get all available categories for ARK: Survival Ascended
    console.log('📋 Fetching categories...');
    const categories = await CurseForgeAPI.getCategories();
    
    if (!categories || categories.length === 0) {
      console.log('❌ No categories found');
      return;
    }
    
    console.log(`✅ Found ${categories.length} categories`);
    
    // Extract category IDs
    const categoryIds = categories.map(cat => cat.id);
    
    // Use the new parallel processing method to maximize throughput
    console.log('🔄 Starting parallel category processing...');
    const startTime = Date.now();
    
    const results = await CurseForgeAPI.populateMultipleCategoriesParallel(
      categoryIds,
      "popularity", // Sort by popularity for best mods first
      "desc",       // Descending order
      10            // 10 pages per category for maximum coverage
    );
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n🎉 Parallel population completed!');
    console.log(`📊 Results:`);
    console.log(`   • Total mods processed: ${results.totalMods}`);
    console.log(`   • Categories processed: ${results.categoriesProcessed}/${categoryIds.length}`);
    console.log(`   • Duration: ${duration.toFixed(2)} seconds`);
    console.log(`   • Average: ${(results.totalMods / duration).toFixed(2)} mods/second`);
    
    if (results.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`);
      results.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    // Check final database state
    const finalModCount = await prisma.mod.count();
    const finalCacheCount = await prisma.modCache.count();
    
    console.log(`\n📈 Final database state:`);
    console.log(`   • Mods in database: ${finalModCount}`);
    console.log(`   • Cache entries: ${finalCacheCount}`);
    
  } catch (error) {
    console.error('❌ Error during parallel population:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Additional function to populate specific high-value categories
async function populateHighValueCategories() {
  console.log('🎯 Populating high-value categories with maximum pages...');
  
  // High-value category IDs for ARK: Survival Ascended
  const highValueCategories = [
    17,  // Maps
    18,  // Structures  
    19,  // Items & Blocks
    20,  // Technology
    21,  // Creatures
    22,  // Gameplay
    23,  // Utility
    24,  // Library
    25,  // Cosmetic
  ];
  
  try {
    const results = await CurseForgeAPI.populateMultipleCategoriesParallel(
      highValueCategories,
      "popularity",
      "desc",
      20 // 20 pages per category for maximum coverage of popular categories
    );
    
    console.log('🎯 High-value category population completed!');
    console.log(`   • Total mods: ${results.totalMods}`);
    console.log(`   • Categories: ${results.categoriesProcessed}/${highValueCategories.length}`);
    
  } catch (error) {
    console.error('❌ Error during high-value population:', error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--high-value')) {
    await populateHighValueCategories();
  } else {
    await populateModsParallel();
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  populateModsParallel,
  populateHighValueCategories
}; 