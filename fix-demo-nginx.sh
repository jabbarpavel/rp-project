#!/bin/bash

# =============================================================================
# Fix demo.kynso.ch nginx Configuration
# =============================================================================
# This script fixes the nginx configuration for demo.kynso.ch
# Run this on your production server to resolve the "Welcome to nginx!" issue
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "=========================================="
echo "   Fix demo.kynso.ch nginx Configuration"
echo "=========================================="
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}✗ This script must be run with sudo${NC}"
    echo "  Usage: sudo ./fix-demo-nginx.sh"
    exit 1
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}✗ nginx is not installed${NC}"
    echo "  Install with: sudo apt-get install nginx"
    exit 1
fi

echo -e "${BLUE}Step 1: Creating nginx configuration for demo.kynso.ch${NC}"
echo ""

# Create nginx configuration for demo.kynso.ch
cat > /etc/nginx/sites-available/demo << 'EOF'
server {
    listen 80;
    server_name demo.kynso.ch;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /user/ {
        proxy_pass http://localhost:5000/user/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /scalar/ {
        proxy_pass http://localhost:5000/scalar/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    client_max_body_size 10M;
}
EOF

echo -e "${GREEN}✓ Created /etc/nginx/sites-available/demo${NC}"
echo ""

echo -e "${BLUE}Step 2: Enabling demo.kynso.ch configuration${NC}"
echo ""

# Remove existing symlink if it exists
if [ -L /etc/nginx/sites-enabled/demo ]; then
    rm /etc/nginx/sites-enabled/demo
    echo "  Removed old symlink"
fi

# Create symlink to enable the configuration
ln -sf /etc/nginx/sites-available/demo /etc/nginx/sites-enabled/demo
echo -e "${GREEN}✓ Enabled demo.kynso.ch configuration${NC}"
echo ""

echo -e "${BLUE}Step 3: Removing default nginx page (if present)${NC}"
echo ""

# Remove default nginx configuration that might interfere
if [ -L /etc/nginx/sites-enabled/default ] || [ -f /etc/nginx/sites-enabled/default ]; then
    rm -f /etc/nginx/sites-enabled/default
    echo -e "${GREEN}✓ Removed default nginx configuration${NC}"
else
    echo "  Default configuration not present (OK)"
fi
echo ""

echo -e "${BLUE}Step 4: Testing nginx configuration${NC}"
echo ""

# Test nginx configuration
if nginx -t 2>&1; then
    echo -e "${GREEN}✓ nginx configuration is valid${NC}"
else
    echo -e "${RED}✗ nginx configuration has errors${NC}"
    echo "  Please check the errors above and fix them"
    exit 1
fi
echo ""

echo -e "${BLUE}Step 5: Reloading nginx${NC}"
echo ""

# Reload nginx to apply changes
systemctl reload nginx
echo -e "${GREEN}✓ nginx reloaded successfully${NC}"
echo ""

echo -e "${BLUE}Step 6: Verifying demo.kynso.ch${NC}"
echo ""

# Test if demo.kynso.ch is accessible
sleep 2  # Give nginx a moment to reload

if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ | grep -q "200"; then
    echo -e "${GREEN}✓ Application is responding on port 8080${NC}"
else
    echo -e "${YELLOW}⚠ Application may not be running on port 8080${NC}"
    echo "  Check with: docker-compose ps"
fi

echo ""
echo "=========================================="
echo "   Configuration Complete!"
echo "=========================================="
echo ""
echo -e "${GREEN}✓ demo.kynso.ch nginx configuration is now active${NC}"
echo ""
echo "Next steps:"
echo "1. Set up SSL with: sudo certbot --nginx -d demo.kynso.ch"
echo "2. Test HTTPS access: curl -I https://demo.kynso.ch"
echo "3. Open in browser: https://demo.kynso.ch"
echo ""
echo "Note: HTTP testing is only for initial verification."
echo "Always use HTTPS in production to protect sensitive data."
echo ""
echo "If you see 'Welcome to nginx!' page, try:"
echo "  - Clear browser cache"
echo "  - Wait 1-2 minutes for DNS propagation"
echo "  - Check docker containers: docker-compose ps"
echo ""
