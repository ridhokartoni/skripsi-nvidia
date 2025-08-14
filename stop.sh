#!/bin/bash

# Stop script for GPU Container Platform

set -e

echo "=========================================="
echo "GPU Container Platform - Stop Script"
echo "=========================================="

# Detect environment
if [ -z "$DEPLOYMENT_MODE" ]; then
    if [ -f /proc/sys/fs/binfmt_misc/WSLInterop ]; then
        export DEPLOYMENT_MODE="local"
    elif [[ "$(hostname)" == *"localhost"* ]] || \
         [[ "$(hostname)" == *"LAPTOP"* ]] || \
         [[ "$(hostname)" == *"DESKTOP"* ]]; then
        export DEPLOYMENT_MODE="local"
    else
        export DEPLOYMENT_MODE="production"
    fi
fi

echo "Environment: $DEPLOYMENT_MODE"
echo ""

# Check if using docker-compose
if [ "$1" == "compose" ] || [ -z "$1" ]; then
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
    
    if [ -f "$COMPOSE_FILE" ]; then
        echo "Stopping services using: $COMPOSE_FILE"
        docker-compose -f $COMPOSE_FILE down
        echo ""
        echo "✓ All services stopped successfully!"
    else
        echo "❌ Compose file not found: $COMPOSE_FILE"
        exit 1
    fi
else
    # Stop individual containers
    echo "Stopping individual containers..."
    
    # Stop frontend
    if docker ps | grep -q skripsi-frontend; then
        echo "Stopping frontend..."
        docker stop skripsi-frontend
        docker rm skripsi-frontend
    fi
    
    # Stop backend
    if docker ps | grep -q skripsi-admin-api; then
        echo "Stopping backend API..."
        docker stop skripsi-admin-api
        docker rm skripsi-admin-api
    fi
    
    # Stop database
    if docker ps | grep -q postgres-container; then
        echo "Stopping PostgreSQL..."
        docker stop postgres-container
        docker rm postgres-container
    fi
    
    echo ""
    echo "✓ All services stopped successfully!"
fi

echo "=========================================="
