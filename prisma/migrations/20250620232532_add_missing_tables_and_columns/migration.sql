/*
  Warnings:

  - The primary key for the `installed_mods` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `installedAt` on the `installed_mods` table. All the data in the column will be lost.
  - You are about to drop the column `isEnabled` on the `installed_mods` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `installed_mods` table. All the data in the column will be lost.
  - You are about to alter the column `fileSize` on the `installed_mods` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `id` on the `installed_mods` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to drop the column `timestamp` on the `mod_cache` table. All the data in the column will be lost.
  - Added the required column `modId` to the `installed_mods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serverId` to the `installed_mods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `installed_mods` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "mod_search_analytics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "searchTerm" TEXT NOT NULL,
    "category" TEXT,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "searchCount" INTEGER NOT NULL DEFAULT 1,
    "lastSearched" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avgResultCount" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "popular_mods" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL,
    "modId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "thumbsUpCount" INTEGER NOT NULL DEFAULT 0,
    "popularityScore" REAL NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_installed_mods" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "serverId" TEXT NOT NULL,
    "modId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT,
    "workshopId" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "loadOrder" INTEGER NOT NULL DEFAULT 0,
    "dependencies" TEXT,
    "incompatibilities" TEXT,
    "size" TEXT,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "curseForgeData" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "thumbsUpCount" INTEGER NOT NULL DEFAULT 0,
    "logoUrl" TEXT,
    "author" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "websiteUrl" TEXT,
    "fileSize" BIGINT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_installed_mods" ("author", "category", "downloadCount", "fileSize", "id", "lastUpdated", "loadOrder", "logoUrl", "name", "tags", "thumbsUpCount", "version", "websiteUrl") SELECT "author", "category", coalesce("downloadCount", 0) AS "downloadCount", "fileSize", "id", "lastUpdated", "loadOrder", "logoUrl", "name", "tags", coalesce("thumbsUpCount", 0) AS "thumbsUpCount", "version", "websiteUrl" FROM "installed_mods";
DROP TABLE "installed_mods";
ALTER TABLE "new_installed_mods" RENAME TO "installed_mods";
CREATE INDEX "installed_mods_serverId_idx" ON "installed_mods"("serverId");
CREATE INDEX "installed_mods_modId_idx" ON "installed_mods"("modId");
CREATE INDEX "installed_mods_enabled_idx" ON "installed_mods"("enabled");
CREATE INDEX "installed_mods_loadOrder_idx" ON "installed_mods"("loadOrder");
CREATE INDEX "installed_mods_name_idx" ON "installed_mods"("name");
CREATE UNIQUE INDEX "installed_mods_serverId_modId_key" ON "installed_mods"("serverId", "modId");
CREATE TABLE "new_mod_cache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "query" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessed" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_mod_cache" ("expiresAt", "id", "query", "results") SELECT "expiresAt", "id", "query", "results" FROM "mod_cache";
DROP TABLE "mod_cache";
ALTER TABLE "new_mod_cache" RENAME TO "mod_cache";
CREATE UNIQUE INDEX "mod_cache_query_key" ON "mod_cache"("query");
CREATE INDEX "mod_cache_expiresAt_idx" ON "mod_cache"("expiresAt");
CREATE INDEX "mod_cache_lastAccessed_idx" ON "mod_cache"("lastAccessed");
CREATE INDEX "mod_cache_hitCount_idx" ON "mod_cache"("hitCount");
CREATE TABLE "new_mods" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "status" INTEGER NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "primaryCategoryId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "dateCreated" DATETIME NOT NULL,
    "dateModified" DATETIME NOT NULL,
    "dateReleased" DATETIME,
    "allowModDistribution" BOOLEAN NOT NULL DEFAULT true,
    "gamePopularityRank" INTEGER,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "thumbsUpCount" INTEGER NOT NULL DEFAULT 0,
    "searchKeywords" TEXT,
    "popularityScore" REAL NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateFrequency" INTEGER NOT NULL DEFAULT 24,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastFetched" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_mods" ("allowModDistribution", "classId", "createdAt", "dateCreated", "dateModified", "dateReleased", "downloadCount", "gameId", "gamePopularityRank", "id", "isAvailable", "isFeatured", "lastFetched", "name", "primaryCategoryId", "slug", "status", "summary", "thumbsUpCount", "updatedAt") SELECT "allowModDistribution", "classId", "createdAt", "dateCreated", "dateModified", "dateReleased", "downloadCount", "gameId", "gamePopularityRank", "id", "isAvailable", "isFeatured", "lastFetched", "name", "primaryCategoryId", "slug", "status", "summary", "thumbsUpCount", "updatedAt" FROM "mods";
DROP TABLE "mods";
ALTER TABLE "new_mods" RENAME TO "mods";
CREATE INDEX "mods_name_idx" ON "mods"("name");
CREATE INDEX "mods_downloadCount_idx" ON "mods"("downloadCount");
CREATE INDEX "mods_popularityScore_idx" ON "mods"("popularityScore");
CREATE INDEX "mods_lastUpdated_idx" ON "mods"("lastUpdated");
CREATE INDEX "mods_searchKeywords_idx" ON "mods"("searchKeywords");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "mod_search_analytics_searchTerm_idx" ON "mod_search_analytics"("searchTerm");

-- CreateIndex
CREATE INDEX "mod_search_analytics_category_idx" ON "mod_search_analytics"("category");

-- CreateIndex
CREATE INDEX "mod_search_analytics_searchCount_idx" ON "mod_search_analytics"("searchCount");

-- CreateIndex
CREATE INDEX "mod_search_analytics_lastSearched_idx" ON "mod_search_analytics"("lastSearched");

-- CreateIndex
CREATE UNIQUE INDEX "mod_search_analytics_searchTerm_category_key" ON "mod_search_analytics"("searchTerm", "category");

-- CreateIndex
CREATE INDEX "popular_mods_category_idx" ON "popular_mods"("category");

-- CreateIndex
CREATE INDEX "popular_mods_modId_idx" ON "popular_mods"("modId");

-- CreateIndex
CREATE INDEX "popular_mods_popularityScore_idx" ON "popular_mods"("popularityScore");

-- CreateIndex
CREATE INDEX "popular_mods_rank_idx" ON "popular_mods"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "popular_mods_category_modId_key" ON "popular_mods"("category", "modId");

-- CreateIndex
CREATE INDEX "mod_authors_authorId_idx" ON "mod_authors"("authorId");

-- CreateIndex
CREATE INDEX "mod_authors_name_idx" ON "mod_authors"("name");

-- CreateIndex
CREATE INDEX "mod_categories_categoryId_idx" ON "mod_categories"("categoryId");

-- CreateIndex
CREATE INDEX "mod_categories_name_idx" ON "mod_categories"("name");

-- CreateIndex
CREATE INDEX "mod_categories_modId_categoryId_idx" ON "mod_categories"("modId", "categoryId");

-- CreateIndex
CREATE INDEX "mod_file_dependencies_modId_idx" ON "mod_file_dependencies"("modId");

-- CreateIndex
CREATE INDEX "mod_file_dependencies_relationType_idx" ON "mod_file_dependencies"("relationType");

-- CreateIndex
CREATE INDEX "mod_file_game_versions_version_idx" ON "mod_file_game_versions"("version");

-- CreateIndex
CREATE INDEX "mod_file_hashes_value_idx" ON "mod_file_hashes"("value");

-- CreateIndex
CREATE INDEX "mod_file_hashes_algo_idx" ON "mod_file_hashes"("algo");

-- CreateIndex
CREATE INDEX "mod_file_indexes_gameVersion_idx" ON "mod_file_indexes"("gameVersion");

-- CreateIndex
CREATE INDEX "mod_file_indexes_releaseType_idx" ON "mod_file_indexes"("releaseType");

-- CreateIndex
CREATE INDEX "mod_file_indexes_gameVersionTypeId_idx" ON "mod_file_indexes"("gameVersionTypeId");

-- CreateIndex
CREATE INDEX "mod_file_modules_name_idx" ON "mod_file_modules"("name");

-- CreateIndex
CREATE INDEX "mod_file_sortable_game_versions_gameVersion_idx" ON "mod_file_sortable_game_versions"("gameVersion");

-- CreateIndex
CREATE INDEX "mod_file_sortable_game_versions_gameVersionTypeId_idx" ON "mod_file_sortable_game_versions"("gameVersionTypeId");

-- CreateIndex
CREATE INDEX "mod_files_fileId_idx" ON "mod_files"("fileId");

-- CreateIndex
CREATE INDEX "mod_files_releaseType_idx" ON "mod_files"("releaseType");

-- CreateIndex
CREATE INDEX "mod_files_fileDate_idx" ON "mod_files"("fileDate");

-- CreateIndex
CREATE INDEX "mod_files_downloadCount_idx" ON "mod_files"("downloadCount");
