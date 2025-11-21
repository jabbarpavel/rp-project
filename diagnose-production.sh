#!/bin/bash

# =============================================================================
# Production Diagnostic Script for Kynso CRM
# =============================================================================
# This script diagnoses common issues with the production deployment
# Run this on your production server when you encounter connection issues
# =============================================================================

set +e  # Don't exit on error, we want to check everything

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ISSUES_FOUND=0
CHECKS_PASSED=0

echo ""
echo "=========================================="
echo "   Kynso CRM Production Diagnostics"
echo "=========================================="
echo ""
echo "Running comprehensive system checks..."
echo ""

# =============================================================================
# Check 1: Docker Compose Installation
# =============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK 1: Docker Compose Installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION=$(docker-compose --version)
    echo -e "${GREEN}✓ Docker Compose is installed${NC}"
    echo "  Version: $DOCKER_COMPOSE_VERSION"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗ Docker Compose is NOT installed${NC}"
    echo "  → Install with: sudo apt-get install docker-compose"
    ((ISSUES_FOUND++))
fi
echo ""

# =============================================================================
# Check 2: Docker Service Status
# =============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK 2: Docker Service Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if systemctl is-active --quiet docker; then
    echo -e "${GREEN}✓ Docker service is running${NC}"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗ Docker service is NOT running${NC}"
    echo "  → Start with: sudo systemctl start docker"
    ((ISSUES_FOUND++))
fi
echo ""

# =============================================================================
# Check 3: Container Status
# =============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK 3: Container Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_container() {
    local container_name=$1
    local display_name=$2
    
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        local status=$(docker inspect --format='{{.State.Health.Status}}' $container_name 2>/dev/null)
        if [ "$status" == "healthy" ]; then
            echo -e "${GREEN}✓ $display_name is running and healthy${NC}"
            ((CHECKS_PASSED++))
        elif [ "$status" == "" ]; then
            echo -e "${YELLOW}⚠ $display_name is running (no health check)${NC}"
            ((CHECKS_PASSED++))
        else
            echo -e "${YELLOW}⚠ $display_name is running but unhealthy${NC}"
            echo "  Status: $status"
            echo "  → Check logs: docker-compose logs $container_name"
            ((ISSUES_FOUND++))
        fi
    else
        echo -e "${RED}✗ $display_name is NOT running${NC}"
        echo "  → Start with: docker-compose up -d $container_name"
        ((ISSUES_FOUND++))
    fi
}

check_container "kynso-backend" "Backend API"
check_container "kynso-postgres" "PostgreSQL Database"
check_container "kynso-frontend" "Frontend"

echo ""

# =============================================================================
# Check 4: Backend Port Configuration
# =============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK 4: Backend Port Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if docker ps --format '{{.Names}}' | grep -q "^kynso-backend$"; then
    # Check logs for ASPNETCORE_URLS usage
    if docker logs kynso-backend 2>&1 | grep -q "Using ASPNETCORE_URLS: http://+:5000"; then
        echo -e "${GREEN}✓ Backend is configured to listen on port 5000${NC}"
        echo "  (Using ASPNETCORE_URLS environment variable)"
        ((CHECKS_PASSED++))
    elif docker logs kynso-backend 2>&1 | grep -q "Bound ports 5015"; then
        echo -e "${RED}✗ Backend is using WRONG port configuration${NC}"
        echo "  Backend is listening on port 5015/5020 instead of 5000"
        echo "  This means ASPNETCORE_URLS is not being respected"
        echo ""
        echo "  → Solution: Rebuild the backend container"
        echo "    docker-compose build --no-cache backend"
        echo "    docker-compose up -d backend"
        ((ISSUES_FOUND++))
    else
        echo -e "${YELLOW}⚠ Cannot determine backend port configuration${NC}"
        echo "  → Check logs manually: docker-compose logs backend | grep -E 'ASPNETCORE_URLS|Bound ports'"
    fi
else
    echo -e "${YELLOW}⚠ Backend container not running, skipping port check${NC}"
fi
echo ""

# =============================================================================
# Check 5: Port Binding on Host
# =============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK 5: Port Binding on Host"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_port() {
    local port=$1
    local service=$2
    
    if netstat -tlnp 2>/dev/null | grep -q ":${port}.*LISTEN" || ss -tlnp 2>/dev/null | grep -q ":${port}.*LISTEN"; then
        echo -e "${GREEN}✓ Port $port is bound ($service)${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗ Port $port is NOT bound${NC}"
        echo "  Expected: $service"
        echo "  → Check if container is exposing the port in docker-compose.yml"
        ((ISSUES_FOUND++))
    fi
}

check_port "5000" "Backend API"
check_port "5432" "PostgreSQL"
check_port "8080" "Frontend"

echo ""

# =============================================================================
# Check 6: Database Connectivity
# =============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK 6: Database Connectivity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if docker ps --format '{{.Names}}' | grep -q "^kynso-postgres$"; then
    if docker exec kynso-postgres psql -U kynso_user -d kynso_prod -c "SELECT 1;" &>/dev/null; then
        echo -e "${GREEN}✓ Database is accessible${NC}"
        
        # Check if Tenants table exists and has data
        TENANT_COUNT=$(docker exec kynso-postgres psql -U kynso_user -d kynso_prod -t -c "SELECT COUNT(*) FROM \"Tenants\";" 2>/dev/null | tr -d ' ')
        if [ "$TENANT_COUNT" -gt 0 ]; then
            echo -e "${GREEN}✓ Found $TENANT_COUNT tenant(s) in database${NC}"
            echo ""
            echo "  Tenants:"
            docker exec kynso-postgres psql -U kynso_user -d kynso_prod -c "SELECT \"Id\", \"Name\", \"Domain\" FROM \"Tenants\";" 2>/dev/null | grep -v "rows)" | tail -n +3
        else
            echo -e "${YELLOW}⚠ No tenants found in database${NC}"
            echo "  → You may need to create tenants"
        fi
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗ Cannot connect to database${NC}"
        echo "  → Check postgres logs: docker-compose logs postgres"
        ((ISSUES_FOUND++))
    fi
else
    echo -e "${YELLOW}⚠ PostgreSQL container not running, skipping database check${NC}"
fi
echo ""

# =============================================================================
# Check 7: Backend Health Endpoint
# =============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK 7: Backend Health Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if docker ps --format '{{.Names}}' | grep -q "^kynso-backend$"; then
    # Try to access health endpoint from inside the container
    if docker exec kynso-backend curl -sf http://localhost:5000/api/health &>/dev/null; then
        echo -e "${GREEN}✓ Health endpoint responds (inside container)${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗ Health endpoint does NOT respond (inside container)${NC}"
        echo "  → Backend may not be listening on port 5000"
        echo "  → Check logs: docker-compose logs backend"
        ((ISSUES_FOUND++))
    fi
    
    # Try from host
    if curl -sf http://localhost:5000/api/health &>/dev/null; then
        echo -e "${GREEN}✓ Health endpoint responds (from host)${NC}"
        HEALTH_RESPONSE=$(curl -s http://localhost:5000/api/health)
        echo "  Response: $HEALTH_RESPONSE"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗ Health endpoint does NOT respond (from host)${NC}"
        echo "  → Port mapping may be incorrect"
        echo "  → Check docker-compose.yml ports section"
        ((ISSUES_FOUND++))
    fi
else
    echo -e "${YELLOW}⚠ Backend container not running, skipping health check${NC}"
fi
echo ""

# =============================================================================
# Check 8: Docker Network
# =============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK 8: Docker Network"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if docker network ls | grep -q "kynso-network"; then
    echo -e "${GREEN}✓ Docker network 'kynso-network' exists${NC}"
    
    # Check which containers are on the network
    CONTAINERS_ON_NETWORK=$(docker network inspect kynso-network -f '{{range .Containers}}{{.Name}} {{end}}' 2>/dev/null)
    if [ -n "$CONTAINERS_ON_NETWORK" ]; then
        echo "  Containers on network: $CONTAINERS_ON_NETWORK"
    fi
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗ Docker network 'kynso-network' does NOT exist${NC}"
    echo "  → Network will be created when running docker-compose up"
    ((ISSUES_FOUND++))
fi
echo ""

# =============================================================================
# Check 9: Environment Variables
# =============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK 9: Backend Environment Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if docker ps --format '{{.Names}}' | grep -q "^kynso-backend$"; then
    # Check critical environment variables
    ENV_ASPNETCORE=$(docker exec kynso-backend printenv ASPNETCORE_ENVIRONMENT 2>/dev/null)
    ENV_URLS=$(docker exec kynso-backend printenv ASPNETCORE_URLS 2>/dev/null)
    ENV_CONN=$(docker exec kynso-backend printenv ConnectionStrings__DefaultConnection 2>/dev/null)
    
    if [ "$ENV_ASPNETCORE" == "Production" ]; then
        echo -e "${GREEN}✓ ASPNETCORE_ENVIRONMENT = Production${NC}"
    else
        echo -e "${YELLOW}⚠ ASPNETCORE_ENVIRONMENT = $ENV_ASPNETCORE (expected: Production)${NC}"
    fi
    
    if [ "$ENV_URLS" == "http://+:5000" ]; then
        echo -e "${GREEN}✓ ASPNETCORE_URLS = http://+:5000${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗ ASPNETCORE_URLS is not set correctly${NC}"
        echo "  Current value: $ENV_URLS"
        echo "  Expected: http://+:5000"
        echo "  → Check docker-compose.yml environment section"
        ((ISSUES_FOUND++))
    fi
    
    if [[ "$ENV_CONN" == *"postgres"* ]]; then
        echo -e "${GREEN}✓ Database connection string is set${NC}"
        echo "  (Connection string contains 'postgres')"
    else
        echo -e "${RED}✗ Database connection string may be incorrect${NC}"
        echo "  → Check docker-compose.yml ConnectionStrings__DefaultConnection"
        ((ISSUES_FOUND++))
    fi
else
    echo -e "${YELLOW}⚠ Backend container not running, skipping environment check${NC}"
fi
echo ""

# =============================================================================
# Check 10: Recent Backend Logs
# =============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK 10: Recent Backend Logs (Last 15 lines)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if docker ps --format '{{.Names}}' | grep -q "^kynso-backend$"; then
    docker-compose logs backend --tail=15
else
    echo -e "${YELLOW}⚠ Backend container not running, no logs available${NC}"
fi
echo ""

# =============================================================================
# Summary
# =============================================================================
echo "=========================================="
echo "           DIAGNOSTIC SUMMARY"
echo "=========================================="
echo ""
echo -e "Checks Passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Issues Found:  ${RED}$ISSUES_FOUND${NC}"
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ All checks passed! System appears healthy.${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "You should be able to access the API at:"
    echo "  - Health Check: http://localhost:5000/api/health"
    echo "  - User Registration: http://localhost:5000/api/user/register"
    echo ""
    echo "For external access:"
    echo "  - https://finaro.kynso.ch/api/health"
    echo "  - https://demo.kynso.ch/api/health"
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗ Issues found! Please review the checks above.${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Common solutions:"
    echo ""
    echo "1. Rebuild and restart backend:"
    echo "   docker-compose build --no-cache backend"
    echo "   docker-compose up -d backend"
    echo ""
    echo "2. Complete restart:"
    echo "   docker-compose down"
    echo "   docker-compose up -d"
    echo ""
    echo "3. Check detailed troubleshooting guide:"
    echo "   docs/PRODUCTION_TROUBLESHOOTING.md"
    echo ""
fi

echo "=========================================="
echo ""

# Exit with appropriate code
if [ $ISSUES_FOUND -gt 0 ]; then
    exit 1
else
    exit 0
fi
