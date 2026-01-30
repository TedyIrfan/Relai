#!/bin/bash

# RelAI Production Build Script
# This script builds both frontend and backend for production

set -e

echo "🚀 Starting RelAI Production Build..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Frontend Build
echo -e "${YELLOW}📦 Step 1: Building Frontend...${NC}"
cd frontend
npm ci
npm run build
echo -e "${GREEN}✅ Frontend build completed!${NC}"
echo ""

# Step 2: Backend Environment Setup
echo -e "${YELLOW}🔧 Step 2: Setting up Backend Environment...${NC}"
cd ../backend
if [ ! -f .env ]; then
    cp .env.prod.example .env
    echo -e "${RED}⚠️  Please edit .env with your production values!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend environment ready!${NC}"
echo ""

# Step 3: Generate Application Key
echo -e "${YELLOW}🔑 Step 3: Checking Application Key...${NC}"
if grep -q "GENERATE_NEW_APP_KEY_HERE" .env; then
    echo -e "${RED}⚠️  Please generate APP_KEY first!${NC}"
    echo "Run: php artisan key:generate"
    exit 1
fi
echo -e "${GREEN}✅ Application key is set!${NC}"
echo ""

# Step 4: Build Docker Image
echo -e "${YELLOW}🐳 Step 4: Building Docker Production Image...${NC}"
docker build -f Dockerfile.prod -t relai-backend:latest .
echo -e "${GREEN}✅ Docker image built successfully!${NC}"
echo ""

echo -e "${GREEN}🎉 Production build completed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Update .env with your production values"
echo "  2. Run: docker-compose -f docker-compose.prod.yml up -d"
echo "  3. Run: docker exec relai-app-prod php artisan migrate --force"
echo ""
