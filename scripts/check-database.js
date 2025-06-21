#!/usr/bin/env node

/**
 * Database Check Script
 * Verifies if the database is properly populated with mod data
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function checkDatabase() {
  console.log('🔍 Checking database population...\n')

  try {
    // Check database connection
    console.log('1️⃣ Testing database connection...')
    await prisma.$connect()
    console.log('   ✅ Database connection successful\n')

    // Check mod cache table
    console.log('2️⃣ Checking mod cache table...')
    const cacheCount = await prisma.modCache.count()
    console.log(`   📊 ModCache entries: ${cacheCount}`)
    
    if (cacheCount > 0) {
      const recentCache = await prisma.modCache.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          query: true,
          totalCount: true,
          createdAt: true,
          hitCount: true,
          lastAccessed: true
        }
      })
      console.log('   📋 Recent cache entries:')
      recentCache.forEach(cache => {
        console.log(`      - Query: "${cache.query}" | Results: ${cache.totalCount} | Hits: ${cache.hitCount}`)
      })
    }
    console.log('')

    // Check mods table
    console.log('3️⃣ Checking mods table...')
    const modCount = await prisma.mod.count()
    console.log(`   📊 Mod entries: ${modCount}`)
    
    if (modCount > 0) {
      const recentMods = await prisma.mod.findMany({
        take: 5,
        orderBy: { lastFetched: 'desc' },
        select: {
          id: true,
          name: true,
          downloadCount: true,
          thumbsUpCount: true,
          lastFetched: true,
          gameId: true
        }
      })
      console.log('   📋 Recent mods:')
      recentMods.forEach(mod => {
        console.log(`      - ID: ${mod.id} | Name: "${mod.name}" | Downloads: ${mod.downloadCount} | Game: ${mod.gameId}`)
      })
    }
    console.log('')

    // Check installed mods table
    console.log('4️⃣ Checking installed mods table...')
    const installedCount = await prisma.installedMod.count()
    console.log(`   📊 Installed mod entries: ${installedCount}`)
    
    if (installedCount > 0) {
      const installedMods = await prisma.installedMod.findMany({
        take: 5,
        orderBy: { lastUpdated: 'desc' },
        select: {
          serverId: true,
          modId: true,
          name: true,
          enabled: true,
          loadOrder: true,
          lastUpdated: true
        }
      })
      console.log('   📋 Installed mods:')
      installedMods.forEach(mod => {
        console.log(`      - Server: ${mod.serverId} | ModID: ${mod.modId} | Name: "${mod.name}" | Enabled: ${mod.enabled}`)
      })
    }
    console.log('')

    // Check mod files table
    console.log('5️⃣ Checking mod files table...')
    const fileCount = await prisma.modFile.count()
    console.log(`   📊 Mod file entries: ${fileCount}`)
    console.log('')

    // Check mod categories table
    console.log('6️⃣ Checking mod categories table...')
    const categoryCount = await prisma.modCategory.count()
    console.log(`   📊 Mod category entries: ${categoryCount}`)
    console.log('')

    // Check for expired cache entries
    console.log('7️⃣ Checking cache expiration...')
    const expiredCache = await prisma.modCache.count({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
    console.log(`   ⚠️ Expired cache entries: ${expiredCache}`)
    console.log('')

    // Summary
    console.log('📈 SUMMARY:')
    console.log(`   • Total Mods: ${modCount}`)
    console.log(`   • Cache Entries: ${cacheCount} (${expiredCache} expired)`)
    console.log(`   • Installed Mods: ${installedCount}`)
    console.log(`   • Mod Files: ${fileCount}`)
    console.log(`   • Categories: ${categoryCount}`)

    // Check if database seems healthy
    if (modCount === 0 && cacheCount === 0) {
      console.log('\n❌ ISSUE: Database appears empty - no mods or cache entries found')
      console.log('   This could indicate:')
      console.log('   • CurseForge API is not being called')
      console.log('   • API key is invalid')
      console.log('   • Network connectivity issues')
      console.log('   • Database write permissions issues')
    } else if (modCount > 0 && cacheCount === 0) {
      console.log('\n⚠️ WARNING: Mods found but no cache entries - cache may not be working')
    } else if (cacheCount > 0 && modCount === 0) {
      console.log('\n⚠️ WARNING: Cache entries found but no mods - mod storage may be failing')
    } else {
      console.log('\n✅ Database appears to be functioning normally')
    }

  } catch (error) {
    console.error('❌ Database check failed:', error)
    
    if (error.code === 'P1001') {
      console.log('\n💡 Database connection failed. Check:')
      console.log('   • DATABASE_URL environment variable')
      console.log('   • Database file permissions')
      console.log('   • SQLite file location')
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the check
checkDatabase().catch(console.error) 