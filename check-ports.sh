#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}        Port Usage Information${NC}"
echo -e "${BLUE}============================================${NC}\n"

# Method 1: Check specific ports for your application
echo -e "${YELLOW}1. Your Application Ports:${NC}"
echo -e "${YELLOW}-------------------------${NC}"

# Check port 3000 (API)
if ss -tuln | grep -q ":3000 "; then
    echo -e "${GREEN}✅ Port 3000:${NC} IN USE (Backend API)"
    # Try to find what's using it
    pid_3000=$(lsof -ti:3000 2>/dev/null)
    if [ ! -z "$pid_3000" ]; then
        echo -e "   Process ID: $pid_3000"
    fi
else
    echo -e "${RED}❌ Port 3000:${NC} NOT IN USE"
fi

# Check port 3001 (Frontend)
if ss -tuln | grep -q ":3001 "; then
    echo -e "${GREEN}✅ Port 3001:${NC} IN USE (Frontend Next.js)"
    pid_3001=$(lsof -ti:3001 2>/dev/null)
    if [ ! -z "$pid_3001" ]; then
        echo -e "   Process ID: $pid_3001"
    fi
else
    echo -e "${RED}❌ Port 3001:${NC} NOT IN USE"
fi

# Check port 5432 (PostgreSQL default)
if ss -tuln | grep -q ":5432 "; then
    echo -e "${GREEN}✅ Port 5432:${NC} IN USE (PostgreSQL Database)"
else
    echo -e "${YELLOW}⚠️  Port 5432:${NC} NOT IN USE (PostgreSQL might be on different port)"
fi

# Check port 3306 (MySQL)
if ss -tuln | grep -q ":3306 "; then
    echo -e "${GREEN}✅ Port 3306:${NC} IN USE (MySQL Database)"
else
    echo -e "${YELLOW}⚠️  Port 3306:${NC} NOT IN USE"
fi

echo ""

# Method 2: Show all listening ports
echo -e "${YELLOW}2. All Listening Ports:${NC}"
echo -e "${YELLOW}----------------------${NC}"
echo -e "${CYAN}PORT    SERVICE/DESCRIPTION${NC}"
echo -e "${CYAN}----    ------------------${NC}"

# Common ports with descriptions
declare -A port_descriptions=(
    ["22"]="SSH"
    ["80"]="HTTP"
    ["443"]="HTTPS"
    ["3000"]="Your Backend API"
    ["3001"]="Your Frontend (Next.js)"
    ["3306"]="MySQL"
    ["5432"]="PostgreSQL"
    ["6379"]="Redis"
    ["8080"]="Alternative HTTP"
    ["8081"]="Alternative HTTP"
    ["9000"]="PHP-FPM"
    ["11211"]="Memcached"
    ["27017"]="MongoDB"
    ["5672"]="RabbitMQ"
)

# Get all listening ports
ports=$(ss -tuln | grep LISTEN | awk '{print $5}' | rev | cut -d: -f1 | rev | sort -n | uniq)

for port in $ports; do
    if [[ ${port_descriptions[$port]} ]]; then
        echo -e "${GREEN}$port${NC}     ${port_descriptions[$port]}"
    else
        echo -e "$port"
    fi
done

echo ""

# Method 3: Docker container ports
echo -e "${YELLOW}3. Docker Container Ports:${NC}"
echo -e "${YELLOW}-------------------------${NC}"
docker ps --format "table {{.Names}}\t{{.Ports}}" 2>/dev/null | grep -v "NAMES" | while IFS= read -r line; do
    if [ ! -z "$line" ]; then
        echo "   $line"
    fi
done

if [ -z "$(docker ps -q 2>/dev/null)" ]; then
    echo -e "   ${YELLOW}No Docker containers running${NC}"
fi

echo ""

# Method 4: Quick port check commands
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}     Useful Port Checking Commands${NC}"
echo -e "${BLUE}============================================${NC}\n"

echo -e "${GREEN}1. Check all listening ports:${NC}"
echo "   ss -tuln | grep LISTEN"
echo ""

echo -e "${GREEN}2. Check specific port (e.g., 3000):${NC}"
echo "   ss -tuln | grep :3000"
echo ""

echo -e "${GREEN}3. Find process using a port:${NC}"
echo "   lsof -i :3000"
echo "   # or with sudo for more details:"
echo "   sudo lsof -i :3000"
echo ""

echo -e "${GREEN}4. Check if port is open:${NC}"
echo "   nc -zv localhost 3000"
echo ""

echo -e "${GREEN}5. Show all network connections:${NC}"
echo "   ss -tuln"
echo ""

echo -e "${GREEN}6. Check Docker port mappings:${NC}"
echo "   docker ps"
echo ""

echo -e "${GREEN}7. Kill process using a port:${NC}"
echo "   # First find the PID:"
echo "   lsof -ti:3000"
echo "   # Then kill it:"
echo "   kill -9 \$(lsof -ti:3000)"
echo ""

echo -e "${BLUE}============================================${NC}"
