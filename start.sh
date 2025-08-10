#!/bin/bash

# Startup script for GPU Container Platform
# Automatically detects environment (local/production)

set -e

echo "=========================================="
echo "GPU Container Platform - Startup Script"
echo "=========================================="

# Detect environment based on hostname or explicit setting
if [ -z "$DEPLOYMENT_MODE" ]; then
    # Check for WSL environment
    if [ -f /proc/sys/fs/binfmt_misc/WSLInterop ]; then
        export DEPLOYMENT_MODE="local"
        echo "✓ Detected LOCAL environment (WSL)"
    # Check for localhost or development indicators
    elif [[ "$(hostname)" == *"localhost"* ]] || 
         [[ "$(hostname)" == *"LAPTOP"* ]] || 
         [[ "$(hostname)" == *"DESKTOP"* ]] || 
         [[ "$(hostname -I 2>/dev/null)" == *"127.0.0.1"* ]] || 
         [[ "$(hostname -I 2>/dev/null)" == *"172."* ]] || 
         [[ "$(pwd)" == *"/home/"* ]]; then
        export DEPLOYMENT_MODE="local"
        echo "✓ Detected LOCAL environment"
    else
        export DEPLOYMENT_MODE="production"
        echo "✓ Detected PRODUCTION environment"
    fi
else
    echo "✓ Using explicit DEPLOYMENT_MODE: $DEPLOYMENT_MODE"
fi

# Load appropriate environment file
if [ "$DEPLOYMENT_MODE" == "production" ]; then
    if [ -f .env.production ]; then
        echo "✓ Loading production environment from .env.production"
        export $(cat .env.production | grep -v '^#' | xargs)
    else
        echo "⚠ Warning: .env.production not found. Create it from .env.production.example"
        exit 1
    fi
else
    if [ -f .env.local ]; then
        echo "✓ Loading local environment from .env.local"
        export $(cat .env.local | grep -v '^#' | xargs)
    else
        echo "✓ Using default local development settings"
    fi
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "✗ Docker is not installed"
    exit 1
fi
echo "✓ Docker is installed"

# Check Docker daemon
if ! docker ps &> /dev/null; then
    echo "✗ Docker daemon is not running"
    exit 1
fi
echo "✓ Docker daemon is running"

# Create network if it doesn't exist
NETWORK_NAME="${DOCKER_NETWORK_NAME:-postgres-network}"
if ! docker network inspect $NETWORK_NAME &> /dev/null; then
    echo "Creating Docker network: $NETWORK_NAME"
    docker network create $NETWORK_NAME
fi
echo "✓ Docker network '$NETWORK_NAME' is ready"

# Check if using docker-compose
if [ "$1" == "compose" ] || [ "$1" == "docker-compose" ]; then
    echo ""
    echo "Starting with Docker Compose..."
    
    # Choose compose file based on environment
    if [ "$DEPLOYMENT_MODE" == "production" ]; then
        COMPOSE_FILE="docker-compose.production.yml"
        if [ ! -f "$COMPOSE_FILE" ]; then
            COMPOSE_FILE="docker-compose.yml"
        fi
    else
        COMPOSE_FILE="docker-compose.wsl.yml"
        if [ ! -f "$COMPOSE_FILE" ]; then
            COMPOSE_FILE="docker-compose.yml"
        fi
    fi
    
    echo "Using compose file: $COMPOSE_FILE"
    docker-compose -f $COMPOSE_FILE up -d --build
    
    echo ""
    echo "✓ Services started successfully!"
    echo ""
    echo "Access points:"
    echo "  Frontend: http://${API_HOST:-localhost}:${FRONTEND_PORT:-3001}"
    echo "  API:      http://${API_HOST:-localhost}:${API_PORT:-3000}/api/v1"
    echo "  Database: ${DATABASE_HOST:-localhost}:${DATABASE_PORT:-5432}"
    
else
    echo ""
    echo "Starting services individually..."
    
    # Start PostgreSQL if not running
    if ! docker ps | grep -q postgres-container; then
        echo "Starting PostgreSQL..."
        docker run -d \
            --name postgres-container \
            --network $NETWORK_NAME \
            -e POSTGRES_USER=${DATABASE_USER:-qaisjabbar} \
            -e POSTGRES_PASSWORD=${DATABASE_PASSWORD:-123} \
            -e POSTGRES_DB=${DATABASE_NAME:-nvidia} \
            -p ${DATABASE_PORT:-5432}:5432 \
            postgres:latest
    fi
    
    # Wait for PostgreSQL
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
    
    # Start backend API
    echo "Starting backend API..."
    cd skripsi-admin
    npm install
    npm run dev &
    cd ..
    
    # Start frontend
    echo "Starting frontend..."
    cd skripsi-frontend
    npm install
    npm run dev &
    cd ..
    
    echo ""
    echo "✓ Services started successfully!"
    echo ""
    echo "Access points:"
    echo "  Frontend: http://localhost:${FRONTEND_PORT:-3001}"
    echo "  API:      http://localhost:${API_PORT:-3000}/api/v1"
    echo "  Database: localhost:${DATABASE_PORT:-5432}"
fi

echo ""
echo "Environment: $DEPLOYMENT_MODE"
echo "DNS Servers: ${DOCKER_DNS_SERVERS:-8.8.8.8,8.8.4.4}"
echo ""
echo "To stop all services, run: ./stop.sh"
echo "=========================================="
