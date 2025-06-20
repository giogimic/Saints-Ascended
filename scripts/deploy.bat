@echo off
echo 🚀 Starting Saints Ascended deployment...

REM Check if .env.local exists, if not create from .env.example
if not exist .env.local (
    echo 📝 Creating .env.local from .env.example...
    copy .env.example .env.local
    echo ⚠️  Please edit .env.local with your configuration before continuing
    echo    Required: CURSEFORGE_API_KEY
    pause
    exit /b 1
)

REM Set DATABASE_URL for build process
set DATABASE_URL=file:./prisma/data/mods.db

REM Create database directory if it doesn't exist
if not exist prisma\data mkdir prisma\data

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate

REM Build the application
echo 🏗️  Building application...
npm run build

REM Create database and run migrations
echo 🗄️  Setting up database...
npx prisma db push

echo ✅ Deployment completed successfully!
echo 🚀 Start the application with: npm start
pause 