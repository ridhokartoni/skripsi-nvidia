#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Full Stack Application Status Check${NC}"
echo -e "${BLUE}============================================${NC}\n"

# Check Backend API
echo -e "${YELLOW}1. Backend API Status:${NC}"
echo -e "${YELLOW}----------------------${NC}"

# Check if API container is running
api_status=$(docker ps --filter "name=skripsi-admin-api" --format "table {{.Status}}" | tail -1)
if [ ! -z "$api_status" ]; then
    echo -e "   ${GREEN}✅ Docker Container:${NC} Running ($api_status)"
else
    echo -e "   ${RED}❌ Docker Container:${NC} Not running"
fi

# Test API endpoint
api_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/)
if [ "$api_response" = "200" ]; then
    echo -e "   ${GREEN}✅ API Endpoint:${NC} Responding (http://localhost:3000/api/v1/)"
    api_data=$(curl -s http://localhost:3000/api/v1/)
    echo -e "   ${GREEN}Response:${NC} $api_data"
else
    echo -e "   ${RED}❌ API Endpoint:${NC} Not responding (HTTP $api_response)"
fi

echo ""

# Check Frontend
echo -e "${YELLOW}2. Frontend Status:${NC}"
echo -e "${YELLOW}-------------------${NC}"

# Check if Next.js is running
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
if [ "$frontend_response" = "307" ] || [ "$frontend_response" = "200" ]; then
    echo -e "   ${GREEN}✅ Next.js Server:${NC} Running (http://localhost:3001)"
    echo -e "   ${GREEN}Redirecting to:${NC} /login (authentication required)"
else
    echo -e "   ${RED}❌ Next.js Server:${NC} Not responding (HTTP $frontend_response)"
fi

# Check Next.js process
nextjs_pid=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}' | head -1)
if [ ! -z "$nextjs_pid" ]; then
    echo -e "   ${GREEN}✅ Process ID:${NC} $nextjs_pid"
else
    echo -e "   ${YELLOW}⚠️  Process:${NC} Not found in process list"
fi

echo ""

# Check Database Connection
echo -e "${YELLOW}3. Database Connection:${NC}"
echo -e "${YELLOW}-----------------------${NC}"

# Check if PostgreSQL container exists (if using Docker)
postgres_container=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -1)
if [ ! -z "$postgres_container" ]; then
    echo -e "   ${GREEN}✅ PostgreSQL Container:${NC} $postgres_container"
else
    echo -e "   ${YELLOW}ℹ️  PostgreSQL:${NC} Not running in Docker (might be external)"
fi

echo ""

# Test API Authentication Endpoint
echo -e "${YELLOW}4. API Endpoints Test:${NC}"
echo -e "${YELLOW}----------------------${NC}"

# Test registration endpoint (expect validation error)
echo -e "   ${BLUE}Testing /auth/register:${NC}"
register_test=$(curl -s -X POST http://localhost:3000/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d '{}' \
    -w "\nHTTP_CODE:%{http_code}")
    
http_code=$(echo "$register_test" | grep "HTTP_CODE" | cut -d: -f2)
if [ "$http_code" = "400" ]; then
    echo -e "   ${GREEN}✅ Validation working${NC} (returns 400 for empty data)"
else
    echo -e "   ${YELLOW}⚠️  Unexpected response:${NC} HTTP $http_code"
fi

echo ""

# Application URLs
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Application URLs${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}Frontend Application:${NC}"
echo -e "   🌐 http://localhost:3001"
echo -e "   📝 Login page: http://localhost:3001/login"
echo ""
echo -e "${GREEN}Backend API:${NC}"
echo -e "   🔧 Base URL: http://localhost:3000/api/v1"
echo -e "   📚 Endpoints:"
echo -e "      • POST /auth/register"
echo -e "      • POST /auth/login"
echo -e "      • POST /auth/admin/login"
echo -e "      • GET  /users (requires auth)"
echo -e "      • GET  /docker (requires auth)"
echo -e "      • GET  /tiket (requires auth)"
echo -e "      • GET  /paket (requires auth)"
echo -e "      • GET  /payment (requires auth)"
echo -e "      • GET  /gpu (requires auth)"
echo ""

# Quick Commands
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Useful Commands${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}View logs:${NC}"
echo -e "   • Backend:  docker logs -f skripsi-admin-api"
echo -e "   • Frontend: Check terminal where npm run dev is running"
echo ""
echo -e "${YELLOW}Stop services:${NC}"
echo -e "   • Backend:  docker stop skripsi-admin-api"
echo -e "   • Frontend: Press Ctrl+C in the terminal or kill -9 $nextjs_pid"
echo ""
echo -e "${YELLOW}Restart services:${NC}"
echo -e "   • Backend:  docker restart skripsi-admin-api"
echo -e "   • Frontend: npm run dev"
echo ""

echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}   System Ready for Testing! 🚀${NC}"
echo -e "${BLUE}============================================${NC}"
