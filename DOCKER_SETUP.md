# Docker Setup for Skripsi Project

## Network Configuration

All containers run on the same Docker network called `postgres-network` to ensure proper communication between services.

## Quick Start

### Method 1: Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build
```

### Method 2: Using Shell Script

```bash
# Make script executable
chmod +x start-services.sh

# Run the script
./start-services.sh
```

### Method 3: Manual Docker Commands

```bash
# Create network if not exists
docker network create postgres-network

# Start PostgreSQL
docker run -d \
  --name postgres-container \
  --network postgres-network \
  -e POSTGRES_USER=qaisjabbar \
  -e POSTGRES_PASSWORD=123 \
  -e POSTGRES_DB=nvidia \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:latest

# Build Admin API
cd skripsi-admin
docker build -t skripsi-admin-api .

# Start Admin API
docker run -d \
  --name skripsi-admin-api \
  --network postgres-network \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://qaisjabbar:123@postgres-container:5432/nvidia?schema=public" \
  -e JWT_ACCESS_SECRET="yourverysecretkey" \
  -e JWT_REFRESH_SECRET="yourrefreshsecretkey" \
  -e PORT=3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  skripsi-admin-api

# Start Frontend
cd skripsi-frontend
npm run dev
```

## Service URLs

- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432

## Database Access

### Using Container Name (within Docker network)
```
postgresql://qaisjabbar:123@postgres-container:5432/nvidia
```

### From Host Machine
```
postgresql://qaisjabbar:123@localhost:5432/nvidia
```

## Troubleshooting

### Check Network Status
```bash
# List all networks
docker network ls

# Inspect network details
docker network inspect postgres-network

# Check containers on network
docker network inspect postgres-network --format='{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{println}}{{end}}'
```

### Container Logs
```bash
# View PostgreSQL logs
docker logs postgres-container

# View API logs
docker logs skripsi-admin-api

# Follow logs in real-time
docker logs -f skripsi-admin-api
```

### Database Migration
```bash
# Run inside admin directory
cd skripsi-admin
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Reset Everything
```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

## Important Notes

1. **Network Consistency**: Always ensure both containers are on the `postgres-network`
2. **Database URL**: Use container name (`postgres-container`) instead of IP addresses for stability
3. **Docker Socket**: The admin API needs access to Docker socket to manage containers
4. **Port Conflicts**: Ensure ports 3000, 3002, and 5432 are available

## Security Recommendations

1. Change default passwords in production
2. Use environment variables for sensitive data
3. Consider using Docker secrets for production deployments
4. Implement proper firewall rules for exposed ports
