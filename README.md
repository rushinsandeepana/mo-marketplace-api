# MO Marketplace API

NestJS backend for MO Marketplace — product management with variants and JWT authentication.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| NestJS | Backend framework |
| PostgreSQL 15 | Database |
| TypeORM | ORM |
| Docker | Database container |
| JWT | Authentication |
| Swagger | API documentation |
| class-validator | DTO validation |

---

## Prerequisites

| Tool | Version | How to check |
|------|---------|--------------|
| Node.js | v20+ | `node --version` |
| npm | v9+ | `npm --version` |
| Docker Desktop | latest | `docker --version` |
| Git | latest | `git --version` |

---

## Project Structure

```bash
mo-marketplace-api/
├── src/
│   ├── auth/            # JWT authentication module
│   ├── products/        # Products and variants CRUD
│   ├── variants/        # combination_key logic
│   ├── common/          # Filters, pipes, guards
│   ├── config/          # Database and JWT configuration
│   └── main.ts          # Application entry point
│
├── docker-compose.yml   # Docker configuration
├── .env.example         # Environment variables template
└── README.md            # Project documentation
---

## Setup — Step by Step

### Step 1 — Clone Repository
```bash
git clone https://github.com/rushinsandeepana/mo-marketplace-api.git
cd mo-marketplace-api
```

### Step 2 — Install Dependencies
```bash
npm install
```

### Step 3 — Setup Environment Variables
```bash
cp .env.example .env
```

Open `.env` and update values:
```env
PORT=3000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=mo_marketplace
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

> We use port **5433** to avoid conflict with any local PostgreSQL installation

---

### Step 4 — Start PostgreSQL Database Using Docker

#### Option A — Docker Run (Recommended)
```bash
docker run --name mo-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mo_marketplace \
  -p 5433:5432 \
  -d postgres:15
```

#### Option B — Docker Compose
```bash
docker-compose up -d
```

#### Verify Database is Running
```bash
docker ps
```

Expected output:
NAMES   IMAGE         STATUS        PORTS
mo-db   postgres:15   Up 2 minutes  0.0.0.0:5433->5432/tcp

#### Test Database Connection
```bash
docker exec -it mo-db psql -U postgres -d mo_marketplace
\dt
\q
```

---

### Step 5 — Run Backend
```bash
npm run start:dev
```

Expected output:
[TypeOrmModule] DataSource initialized successfully
API     → http://localhost:3000
Swagger → http://localhost:3000/api/docs


> TypeORM automatically creates database tables on first run

---

## API Documentation

### Swagger UI
http://localhost:3000/api/docs

#### How to use Swagger
Step 1 → Open http://localhost:3000/api/docs
Step 2 → Run POST /auth/register
Step 3 → Copy accessToken from response
Step 4 → Click Authorize button top right
Step 5 → Paste token → Click Authorize
Step 6 → All endpoints now accessible

### Postman Collection
Step 1 → Open Postman
Step 2 → Click Import
Step 3 → Select MO-Marketplace.postman_collection.json
Step 4 → Run Auth/Register first
Step 5 → Token saved automatically
Step 6 → Run any other request


---

## API Endpoints

### Auth — Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |

### Products — JWT Required

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create product with variants |
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get one product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| POST | `/products/:id/variants` | Add variant to product |
| PATCH | `/products/:id/variants/:variantId/stock` | Update stock |
| DELETE | `/products/:id/variants/:variantId` | Delete variant |

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Invalid input |
| 401 | Unauthorized |
| 404 | Not found |
| 409 | Duplicate variant combination |

---

## Edge Cases Handled

| Case | Response |
|------|----------|
| Duplicate variant combination | 409 Conflict |
| Invalid input data | 400 Bad Request |
| Missing JWT token | 401 Unauthorized |
| Product not found | 404 Not Found |

---

## Docker Commands
```bash
# Start database
docker start mo-db

# Stop database
docker stop mo-db

# View running containers
docker ps

# View database logs
docker logs mo-db

# Enter database
docker exec -it mo-db psql -U postgres -d mo_marketplace

# List tables
\dt

# Exit database
\q

# Remove container (fresh start)
docker rm -f mo-db
```

---

## Daily Development Workflow
```bash
# Step 1 — start database
docker start mo-db

# Step 2 — run backend
npm run start:dev

# Step 3 — open swagger
http://localhost:3000/api/docs
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | Database host | `127.0.0.1` |
| `DB_PORT` | Database port | `5433` |
| `DB_USERNAME` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `password` |
| `DB_NAME` | Database name | `mo_marketplace` |
| `JWT_SECRET` | JWT secret key | — |
| `JWT_EXPIRES_IN` | JWT expiry | `7d` |

---

## Troubleshooting

### Cannot connect to database
```bash
# Check Docker is running
docker ps

# Restart database
docker restart mo-db

# Check .env DB_PORT is 5433
```

### Port conflict with local PostgreSQL
```bash
# We use port 5433 to avoid this
# If still conflict check what uses port 5433
netstat -ano | findstr :5433
```

### Tables not created
```bash
# Restart backend — TypeORM will recreate tables
npm run start:dev
```

### JWT errors
```bash
# Check JWT_SECRET is set in .env
# Pass token as Bearer token in header
# Authorization: Bearer your-token-here
```

---

## Assumptions and Decisions

- Port `5433` used for Docker to avoid local PostgreSQL conflict
- `synchronize: true` in development — TypeORM auto creates tables
- JWT token expires in `7d`
- All product endpoints are JWT protected
- `combination_key` auto generated from color + size + material
- Example: `red-M-cotton`
- No role based access — any authenticated user can access all endpoints