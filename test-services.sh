#!/bin/bash
# Script to test if frontend and backend services are running
# Usage: ./test-services.sh

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🔍 Testing Kynso CRM Services"
echo "=========================================="
echo ""

# Determine environment (default to Development)
ENVIRONMENT=${1:-Development}

# Set ports based on environment
if [ "$ENVIRONMENT" = "Test" ]; then
    BACKEND_PORT=5016
    FRONTEND_PORT=4300
else
    BACKEND_PORT=5015
    FRONTEND_PORT=4200
fi

BACKEND_URL="http://localhost:$BACKEND_PORT"
FRONTEND_URL="http://localhost:$FRONTEND_PORT"

echo "Environment: $ENVIRONMENT"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Test Backend
echo "----------------------------------------"
echo "🔧 Testing Backend..."
echo "----------------------------------------"
if curl -s -f -m 5 "$BACKEND_URL/api/health" > /dev/null 2>&1; then
    BACKEND_RESPONSE=$(curl -s "$BACKEND_URL/api/health")
    echo -e "${GREEN}✅ Backend is running${NC}"
    echo "Response: $BACKEND_RESPONSE"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
    echo "Expected URL: $BACKEND_URL/api/health"
    echo ""
    echo "To start the backend:"
    if [ "$ENVIRONMENT" = "Test" ]; then
        echo "  cd src/backend/RP.CRM.Api && dotnet run --launch-profile Test"
    else
        echo "  cd src/backend/RP.CRM.Api && dotnet run --launch-profile Development"
    fi
    BACKEND_FAILED=1
fi
echo ""

# Test Frontend
echo "----------------------------------------"
echo "🎨 Testing Frontend..."
echo "----------------------------------------"
if curl -s -f -m 5 "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
    echo "Accessible at: $FRONTEND_URL"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
    echo "Expected URL: $FRONTEND_URL"
    echo ""
    echo "To start the frontend:"
    if [ "$ENVIRONMENT" = "Test" ]; then
        echo "  cd src/frontend && npm run start:test"
    else
        echo "  cd src/frontend && npm start"
    fi
    FRONTEND_FAILED=1
fi
echo ""

# Summary
echo "=========================================="
echo "📊 Summary"
echo "=========================================="
if [ -z "$BACKEND_FAILED" ] && [ -z "$FRONTEND_FAILED" ]; then
    echo -e "${GREEN}✅ All services are running!${NC}"
    echo ""
    echo "You can access:"
    echo "  - Frontend: $FRONTEND_URL"
    echo "  - Backend API: $BACKEND_URL"
    echo "  - API Docs: $BACKEND_URL/scalar/v1"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some services are not running${NC}"
    if [ ! -z "$BACKEND_FAILED" ]; then
        echo -e "${RED}  - Backend: Not running${NC}"
    fi
    if [ ! -z "$FRONTEND_FAILED" ]; then
        echo -e "${RED}  - Frontend: Not running${NC}"
    fi
    echo ""
    echo "Please start the missing services and try again."
    exit 1
fi
