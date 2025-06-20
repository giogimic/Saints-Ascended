-- CreateTable
CREATE TABLE "mods" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastFetched" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "mod_links" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modId" INTEGER NOT NULL,
    "websiteUrl" TEXT,
    "wikiUrl" TEXT,
    "issuesUrl" TEXT,
    "sourceUrl" TEXT,
    CONSTRAINT "mod_links_modId_fkey" FOREIGN KEY ("modId") REFERENCES "mods" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mod_categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "url" TEXT,
    "iconUrl" TEXT,
    "dateModified" DATETIME NOT NULL,
    "isClass" BOOLEAN NOT NULL DEFAULT false,
    "classId" INTEGER,
    "parentCategoryId" INTEGER,
    "displayIndex" INTEGER,
    CONSTRAINT "mod_categories_modId_fkey" FOREIGN KEY ("modId") REFERENCES "mods" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mod_authors" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    CONSTRAINT "mod_authors_modId_fkey" FOREIGN KEY ("modId") REFERENCES "mods" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mod_logos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modId" INTEGER NOT NULL,
    "logoId" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "url" TEXT,
    CONSTRAINT "mod_logos_modId_fkey" FOREIGN KEY ("modId") REFERENCES "mods" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mod_screenshots" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modId" INTEGER NOT NULL,
    "screenshotId" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "url" TEXT,
    CONSTRAINT "mod_screenshots_modId_fkey" FOREIGN KEY ("modId") REFERENCES "mods" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mod_files" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modId" INTEGER NOT NULL,
    "fileId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "displayName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "releaseType" INTEGER NOT NULL,
    "fileStatus" INTEGER NOT NULL,
    "fileDate" DATETIME NOT NULL,
    "fileLength" BIGINT NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "fileSizeOnDisk" BIGINT,
    "downloadUrl" TEXT,
    "isServerPack" BOOLEAN NOT NULL DEFAULT false,
    "serverPackFileId" INTEGER,
    "isEarlyAccessContent" BOOLEAN NOT NULL DEFAULT false,
    "earlyAccessEndDate" DATETIME,
    "fileFingerprint" BIGINT,
    CONSTRAINT "mod_files_modId_fkey" FOREIGN KEY ("modId") REFERENCES "mods" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mod_file_hashes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "algo" INTEGER NOT NULL,
    CONSTRAINT "mod_file_hashes_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "mod_files" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mod_file_game_versions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileId" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    CONSTRAINT "mod_file_game_versions_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "mod_files" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mod_file_sortable_game_versions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileId" INTEGER NOT NULL,
    "gameVersionName" TEXT NOT NULL,
    "gameVersionPadded" TEXT NOT NULL,
    "gameVersion" TEXT NOT NULL,
    "gameVersionReleaseDate" DATETIME NOT NULL,
    "gameVersionTypeId" INTEGER NOT NULL,
    "modLoader" INTEGER,
    CONSTRAINT "mod_file_sortable_game_versions_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "mod_files" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mod_file_dependencies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileId" INTEGER NOT NULL,
    "modId" INTEGER NOT NULL,
    "relationType" INTEGER NOT NULL,
    CONSTRAINT "mod_file_dependencies_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "mod_files" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mod_file_modules" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fileId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fingerprint" BIGINT NOT NULL,
    CONSTRAINT "mod_file_modules_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "mod_files" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mod_file_indexes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modId" INTEGER NOT NULL,
    "gameVersion" TEXT NOT NULL,
    "fileId" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "releaseType" INTEGER NOT NULL,
    "gameVersionTypeId" INTEGER NOT NULL,
    "modLoader" INTEGER,
    CONSTRAINT "mod_file_indexes_modId_fkey" FOREIGN KEY ("modId") REFERENCES "mods" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mod_cache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "query" TEXT NOT NULL,
    "results" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "installed_mods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "downloadCount" INTEGER,
    "thumbsUpCount" INTEGER,
    "logoUrl" TEXT,
    "author" TEXT,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "installedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT,
    "fileSize" INTEGER,
    "category" TEXT,
    "tags" TEXT,
    "websiteUrl" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "loadOrder" INTEGER NOT NULL DEFAULT 1
);

-- CreateIndex
CREATE UNIQUE INDEX "mod_links_modId_key" ON "mod_links"("modId");

-- CreateIndex
CREATE UNIQUE INDEX "mod_logos_modId_key" ON "mod_logos"("modId");

-- CreateIndex
CREATE UNIQUE INDEX "mod_cache_query_key" ON "mod_cache"("query");
