#!/bin/bash
export DATABASE_URL="file:./prisma/data/mods.db"
npx prisma migrate deploy 