#!/bin/bash

# Saints Ascended Deployment Script
echo "🚀 Starting Saints Ascended deployment..."

# Check if .env.local exists, if not create from .env.example
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your configuration before continuing"
    echo "   Required: CURSEFORGE_API_KEY"
    exit 1
fi

# Set DATABASE_URL for build process
export DATABASE_URL="file:./prisma/data/mods.db"

# Create database directory if it doesn't exist
mkdir -p prisma/data

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️  Building application..."
npm run build

# Create database and run migrations
echo "🗄️  Setting up database..."
npx prisma db push

echo "✅ Deployment completed successfully!"
echo "🚀 Start the application with: npm start" 