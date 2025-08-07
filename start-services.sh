#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Skripsi Services...${NC}"

# Network name
NETWORK_NAME="postgres-network"

# Check if network exists, create if not
if ! docker network ls | grep -q "$NETWORK_NAME"; then
    echo -e "${YELLOW}Creating network: $NETWORK_NAME${NC}"
    docker network create $NETWORK_NAME
else
    echo -e "${GREEN}Network $NETWORK_NAME already exists${NC}"
fi

# Start PostgreSQL container
echo -e "${YELLOW}Starting PostgreSQL container...${NC}"
if docker ps -a | grep -q "postgres-container"; then
    if ! docker ps | grep -q "postgres-container"; then
        docker start postgres-container
        echo -e "${GREEN}PostgreSQL container started${NC}"
    else
        echo -e "${GREEN}PostgreSQL container is already running${NC}"
    fi
else
    echo -e "${YELLOW}Creating new PostgreSQL container...${NC}"
    docker run -d \
        --name postgres-container \
        --network $NETWORK_NAME \
        -e POSTGRES_USER=qaisjabbar \
        -e POSTGRES_PASSWORD=123 \
        -e POSTGRES_DB=nvidia \
        -p 5432:5432 \
        -v postgres_data:/var/lib/postgresql/data \
        postgres:latest
    echo -e "${GREEN}PostgreSQL container created and started${NC}"
fi

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
sleep 5

# Start Admin API container
echo -e "${YELLOW}Starting Admin API container...${NC}"
if docker ps -a | grep -q "skripsi-admin-api"; then
    docker stop skripsi-admin-api 2>/dev/null
    docker rm skripsi-admin-api 2>/dev/null
fi

docker run -d \
    --name skripsi-admin-api \
    --network $NETWORK_NAME \
    -p 3000:3000 \
    -e DATABASE_URL="postgresql://qaisjabbar:123@postgres-container:5432/nvidia?schema=public" \
    -e JWT_ACCESS_SECRET="yourverysecretkey" \
    -e JWT_REFRESH_SECRET="yourrefreshsecretkey" \
    -e PORT=3000 \
    -v /var/run/docker.sock:/var/run/docker.sock \
    skripsi-admin-api

echo -e "${GREEN}Admin API container started${NC}"

# Show running containers
echo -e "\n${GREEN}Running containers on $NETWORK_NAME:${NC}"
docker network inspect $NETWORK_NAME --format='{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{println}}{{end}}'

echo -e "\n${GREEN}Services Status:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "postgres-container|skripsi-admin-api"

echo -e "\n${GREEN}All services started successfully!${NC}"
echo -e "${YELLOW}Frontend URL: http://localhost:3002${NC}"
echo -e "${YELLOW}Backend API URL: http://localhost:3000${NC}"
echo -e "${YELLOW}PostgreSQL: localhost:5432${NC}"
