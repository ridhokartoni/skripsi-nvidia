#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api/v1"

echo -e "${YELLOW}==================================${NC}"
echo -e "${YELLOW}Testing Skripsi Admin API${NC}"
echo -e "${YELLOW}==================================${NC}\n"

# Test 1: Basic connection
echo -e "${GREEN}1. Testing basic API connection...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" ${API_URL}/)
if [ $response -eq 200 ]; then
    echo -e "   ✅ API is responding (HTTP $response)"
    curl -s ${API_URL}/ | python3 -m json.tool 2>/dev/null || curl -s ${API_URL}/
else
    echo -e "   ${RED}❌ API not responding (HTTP $response)${NC}"
fi
echo ""

# Test 2: Check all main endpoints
echo -e "${GREEN}2. Testing main endpoints availability...${NC}"
endpoints=("/auth/login" "/users" "/docker" "/tiket" "/paket" "/payment" "/gpu")

for endpoint in "${endpoints[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" ${API_URL}${endpoint})
    if [ $response -eq 200 ] || [ $response -eq 401 ] || [ $response -eq 400 ] || [ $response -eq 404 ]; then
        echo -e "   ✅ ${endpoint} - Endpoint reachable (HTTP $response)"
    else
        echo -e "   ${RED}❌ ${endpoint} - Endpoint not reachable (HTTP $response)${NC}"
    fi
done
echo ""

# Test 3: Test registration endpoint
echo -e "${GREEN}3. Testing registration endpoint (without actual registration)...${NC}"
response=$(curl -s -X POST ${API_URL}/auth/register \
    -H "Content-Type: application/json" \
    -d '{}' \
    -w "\nHTTP_CODE:%{http_code}")
    
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" -eq 400 ]; then
    echo -e "   ✅ Registration endpoint working (validation active)"
    echo "   Response: $(echo $body | python3 -m json.tool 2>/dev/null || echo $body)"
else
    echo -e "   ${YELLOW}⚠️  Unexpected response code: $http_code${NC}"
fi
echo ""

# Test 4: Check container health
echo -e "${GREEN}4. Checking Docker container health...${NC}"
container_status=$(docker inspect -f '{{.State.Status}}' skripsi-admin-api 2>/dev/null)
if [ "$container_status" = "running" ]; then
    echo -e "   ✅ Container is running"
    
    # Get container stats
    docker stats skripsi-admin-api --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
else
    echo -e "   ${RED}❌ Container is not running${NC}"
fi
echo ""

# Test 5: Response time test
echo -e "${GREEN}5. Testing API response time...${NC}"
time_taken=$(curl -s -o /dev/null -w "%{time_total}" ${API_URL}/)
echo -e "   ⏱️  Response time: ${time_taken}s"

if (( $(echo "$time_taken < 1" | bc -l) )); then
    echo -e "   ✅ Good response time (< 1s)"
else
    echo -e "   ${YELLOW}⚠️  Slow response time (> 1s)${NC}"
fi
echo ""

echo -e "${YELLOW}==================================${NC}"
echo -e "${GREEN}Testing Complete!${NC}"
echo -e "${YELLOW}==================================${NC}"
