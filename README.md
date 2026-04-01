# MO Marketplace API

## Prerequisites
- Node.js v20+
- npm v9+
- Docker Desktop
- Git

## Setup Steps

### Step 1 — Clone project
git clone your-repo-url
cd mo-marketplace-api

### Step 2 — Install dependencies
npm install

### Step 3 — Copy env file
cp .env.example .env

### Step 4 — Start database (Option A — Docker recommended)
docker run --name mo-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mo_marketplace \
  -p 5433:5432 \
  -d postgres:15

### Or using Docker Compose
docker-compose up -d

### Step 5 — Run backend
npm run start:dev

### API     → http://localhost:3000
### Swagger → http://localhost:3000/api

## Daily Commands
docker start mo-db    ← start database
docker stop mo-db     ← stop database
npm run start:dev     ← run backend

## Notes
- Database runs on port 5433 to avoid conflict
  with any local PostgreSQL installation
- TypeORM auto creates tables on first run