// JavaScript wrapper for cache refresh service
// This allows Node.js scripts to trigger cache refresh without TypeScript compilation

import { getEffectiveCurseForgeApiKey } from './global-settings-wrapper.js';

/**
 * Simple cache refresh function that can be called from scripts
 */
export async function triggerCacheRefresh() {
  console.log('🔄 Triggering cache refresh...');
  
  const apiKey = getEffectiveCurseForgeApiKey();
  if (!apiKey) {
    throw new Error('CurseForge API key not found');
  }

  // Import Prisma client
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    // Define search terms for different categories
    const searchTerms = {
      'Popular': ['general', 'popular'],
      'Buildings': ['building', 'structures'],
      'Creatures': ['creatures', 'dinosaurs'],
      'Tools': ['tools', 'weapons'],
      'Maps': ['maps', 'worlds']
    };

    console.log('📋 Starting cache refresh for categories:', Object.keys(searchTerms));

    for (const [category, terms] of Object.entries(searchTerms)) {
      const primaryTerm = terms[0];
      console.log(`🔍 Refreshing category: ${category} (search: ${primaryTerm})`);
      
      try {
        // Make API call to CurseForge
        const response = await fetch(`https://api.curseforge.com/v1/mods/search?gameId=83374&searchFilter=${primaryTerm}&sortField=2&sortOrder=desc&pageSize=20`, {
          headers: {
            'Accept': 'application/json',
            'x-api-key': apiKey,
            'User-Agent': 'Saints-Ascended-Cache-Refresh/1.0'
          }
        });

        if (!response.ok) {
          console.error(`❌ API call failed for ${category}: ${response.status} ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          console.log(`✅ Found ${data.data.length} mods for ${category}`);
          
          // Store mods in database
          for (const mod of data.data) {
            try {
              // Check if mod already exists
              const existingMod = await prisma.mod.findUnique({
                where: { id: mod.id }
              });

              if (existingMod) {
                // Update existing mod
                await prisma.mod.update({
                  where: { id: mod.id },
                  data: {
                    gameId: mod.gameId,
                    name: mod.name,
                    slug: mod.slug,
                    summary: mod.summary || '',
                    status: mod.status || 1,
                    downloadCount: mod.downloadCount || 0,
                    isFeatured: mod.isFeatured || false,
                    primaryCategoryId: mod.primaryCategoryId || 0,
                    classId: mod.classId || 0,
                    dateCreated: new Date(mod.dateCreated),
                    dateModified: new Date(mod.dateModified),
                    dateReleased: mod.dateReleased ? new Date(mod.dateReleased) : null,
                    allowModDistribution: mod.allowModDistribution !== false,
                    gamePopularityRank: mod.gamePopularityRank || null,
                    isAvailable: mod.isAvailable !== false,
                    thumbsUpCount: mod.thumbsUpCount || 0,
                    searchKeywords: mod.searchKeywords || '',
                    popularityScore: mod.popularityScore || 0,
                    lastUpdated: new Date(),
                    updatedAt: new Date()
                  }
                });
              } else {
                // Create new mod
                await prisma.mod.create({
                  data: {
                    id: mod.id,
                    gameId: mod.gameId,
                    name: mod.name,
                    slug: mod.slug,
                    summary: mod.summary || '',
                    status: mod.status || 1,
                    downloadCount: mod.downloadCount || 0,
                    isFeatured: mod.isFeatured || false,
                    primaryCategoryId: mod.primaryCategoryId || 0,
                    classId: mod.classId || 0,
                    dateCreated: new Date(mod.dateCreated),
                    dateModified: new Date(mod.dateModified),
                    dateReleased: mod.dateReleased ? new Date(mod.dateReleased) : null,
                    allowModDistribution: mod.allowModDistribution !== false,
                    gamePopularityRank: mod.gamePopularityRank || null,
                    isAvailable: mod.isAvailable !== false,
                    thumbsUpCount: mod.thumbsUpCount || 0,
                    searchKeywords: mod.searchKeywords || '',
                    popularityScore: mod.popularityScore || 0,
                    lastUpdated: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }
                });
              }

              // Store categories (simple create, ignore duplicates)
              if (mod.categories && mod.categories.length > 0) {
                for (const cat of mod.categories) {
                  try {
                    await prisma.modCategory.create({
                      data: {
                        modId: mod.id,
                        categoryId: cat.id,
                        gameId: cat.gameId,
                        name: cat.name,
                        slug: cat.slug,
                        url: cat.url || '',
                        iconUrl: cat.iconUrl || '',
                        dateModified: new Date(cat.dateModified),
                        isClass: cat.isClass || false,
                        classId: cat.classId || null,
                        parentCategoryId: cat.parentCategoryId || null,
                        displayIndex: cat.displayIndex || null
                      }
                    });
                  } catch (catError) {
                    // Ignore duplicate category errors
                    if (!catError.message.includes('Unique constraint')) {
                      console.error(`❌ Error storing category ${cat.id}:`, catError.message);
                    }
                  }
                }
              }

              // Store authors (simple create, ignore duplicates)
              if (mod.authors && mod.authors.length > 0) {
                for (const author of mod.authors) {
                  try {
                    await prisma.modAuthor.create({
                      data: {
                        modId: mod.id,
                        authorId: author.id,
                        name: author.name,
                        url: author.url || ''
                      }
                    });
                  } catch (authorError) {
                    // Ignore duplicate author errors
                    if (!authorError.message.includes('Unique constraint')) {
                      console.error(`❌ Error storing author ${author.id}:`, authorError.message);
                    }
                  }
                }
              }

            } catch (modError) {
              console.error(`❌ Error storing mod ${mod.id}:`, modError.message);
            }
          }

          // Store cache entry using the 'query' field
          const cacheQuery = `${primaryTerm}_${category}_popularity_desc_1`;
          try {
            await prisma.modCache.upsert({
              where: { query: cacheQuery },
              update: {
                results: JSON.stringify(data.data.map(m => m.id)),
                totalCount: data.pagination?.totalCount || data.data.length,
                expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours
                hitCount: { increment: 1 },
                lastAccessed: new Date()
              },
              create: {
                query: cacheQuery,
                results: JSON.stringify(data.data.map(m => m.id)),
                totalCount: data.pagination?.totalCount || data.data.length,
                expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours
                hitCount: 1,
                lastAccessed: new Date()
              }
            });
          } catch (cacheError) {
            console.error(`❌ Error storing cache for ${category}:`, cacheError.message);
          }

        } else {
          console.log(`⚠️  No mods found for category: ${category}`);
        }

      } catch (categoryError) {
        console.error(`❌ Error refreshing category ${category}:`, categoryError.message);
      }
    }

    console.log('✅ Cache refresh completed!');

  } catch (error) {
    console.error('❌ Cache refresh failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
} 