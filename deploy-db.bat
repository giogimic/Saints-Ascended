@echo off
set DATABASE_URL=file:./prisma/data/mods.db
npx prisma migrate deploy 