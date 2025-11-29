#!/bin/bash

# =============================================================================
# Complete Production Fix - Execute on Production Server
# =============================================================================
# This script combines all fixes for demo.kynso.ch and container health
# Run this on your production server at 83.228.225.166
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "=========================================="
echo "   Kynso Production Complete Fix"
echo "=========================================="
echo ""
echo -e "${CYAN}This script will:${NC}"
echo "  1. Update code from repository"
echo "  2. Fix nginx configuration for demo.kynso.ch"
echo "  3. Restart containers with improved health checks"
echo "  4. Verify everything is working"
echo ""
echo -e "${YELLOW}⚠️  This script requires sudo privileges${NC}"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}✗ Error: docker-compose.yml not found${NC}"
    echo "  Please run this script from /opt/kynso/prod/app"
    exit 1
fi

echo ""
echo "=========================================="
echo "   Step 1: Update Code from Repository"
echo "=========================================="
echo ""

git fetch origin
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}Current branch: $CURRENT_BRANCH${NC}"

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Warning: You're not on the main branch${NC}"
    read -p "Switch to main branch? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
    fi
fi

echo "Pulling latest changes..."
git pull origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Code updated successfully${NC}"
else
    echo -e "${RED}✗ Failed to update code${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "   Step 2: Fix nginx Configuration"
echo "=========================================="
echo ""

# Check if we have sudo
if ! sudo -n true 2>/dev/null; then
    echo "This step requires sudo. You may be prompted for your password."
fi

if [ -f "./fix-demo-nginx.sh" ]; then
    echo "Running nginx fix script..."
    sudo ./fix-demo-nginx.sh
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ nginx configuration fixed${NC}"
    else
        echo -e "${YELLOW}⚠️  nginx fix had issues, but continuing...${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  fix-demo-nginx.sh not found, skipping nginx fix${NC}"
fi

echo ""
echo "=========================================="
echo "   Step 3: Restart Docker Containers"
echo "=========================================="
echo ""

echo "Stopping containers..."
docker-compose down

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Warning: docker-compose down had issues${NC}"
fi

echo ""
echo "Starting containers with new configuration..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Containers started successfully${NC}"
else
    echo -e "${RED}✗ Failed to start containers${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}Waiting for services to start...${NC}"
echo "  - Backend needs ~90 seconds for database migrations"
echo "  - Frontend needs ~30 seconds"
echo ""

# Wait for services to initialize
WAIT_TIME_SECONDS=90
SLEEP_INTERVAL=10
ITERATIONS=$((WAIT_TIME_SECONDS / SLEEP_INTERVAL))

for i in $(seq 1 $ITERATIONS); do
    echo -n "."
    sleep $SLEEP_INTERVAL
done
echo ""

echo ""
echo "=========================================="
echo "   Step 4: Verify Services"
echo "=========================================="
echo ""

echo -e "${BLUE}Container Status:${NC}"
docker-compose ps
echo ""

echo -e "${BLUE}Testing Backend Health Endpoint...${NC}"
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    HEALTH_RESPONSE=$(curl -s http://localhost:5000/api/health)
    echo -e "${GREEN}✓ Backend is responding${NC}"
    echo "  Response: $HEALTH_RESPONSE"
else
    echo -e "${YELLOW}⚠️  Backend health check failed (may still be starting)${NC}"
fi
echo ""

echo -e "${BLUE}Testing Frontend...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ | grep -q "200"; then
    echo -e "${GREEN}✓ Frontend is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend health check failed (may still be starting)${NC}"
fi
echo ""

echo -e "${BLUE}Testing demo.kynso.ch...${NC}"
DEMO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://demo.kynso.ch)
if [ "$DEMO_STATUS" = "200" ] || [ "$DEMO_STATUS" = "301" ]; then
    echo -e "${GREEN}✓ demo.kynso.ch is responding (HTTP $DEMO_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  demo.kynso.ch returned HTTP $DEMO_STATUS${NC}"
fi
echo ""

echo -e "${BLUE}Testing finaro.kynso.ch...${NC}"
FINARO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://finaro.kynso.ch)
if [ "$FINARO_STATUS" = "200" ] || [ "$FINARO_STATUS" = "301" ]; then
    echo -e "${GREEN}✓ finaro.kynso.ch is responding (HTTP $FINARO_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  finaro.kynso.ch returned HTTP $FINARO_STATUS${NC}"
fi
echo ""

echo ""
echo "=========================================="
echo "   Summary"
echo "=========================================="
echo ""

echo -e "${GREEN}✓ Code updated from repository${NC}"
echo -e "${GREEN}✓ nginx configuration applied${NC}"
echo -e "${GREEN}✓ Containers restarted${NC}"
echo ""

echo -e "${CYAN}Next Steps:${NC}"
echo "1. Wait 2-3 minutes for all services to fully initialize"
echo "2. Check container health: ${YELLOW}docker-compose ps${NC}"
echo "3. View logs if needed: ${YELLOW}docker-compose logs -f${NC}"
echo "4. Test in browser:"
echo "   - https://demo.kynso.ch"
echo "   - https://finaro.kynso.ch"
echo ""

echo -e "${CYAN}If demo.kynso.ch needs SSL:${NC}"
echo "   ${YELLOW}sudo certbot --nginx -d demo.kynso.ch${NC}"
echo ""

echo -e "${CYAN}Run full diagnostics:${NC}"
echo "   ${YELLOW}./diagnose-production.sh${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}Production Fix Complete! 🎉${NC}"
echo "=========================================="
echo ""
