#!/bin/bash

set -e

echo "🚀 Deploying Photo Event Platform..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please run setup.sh first"
    exit 1
fi

echo ""
echo -e "${GREEN}Step 1: Pulling latest code...${NC}"
git pull origin main || echo -e "${YELLOW}Skipping git pull${NC}"

echo ""
echo -e "${GREEN}Step 2: Building Docker images...${NC}"
docker compose build --no-cache

echo ""
echo -e "${GREEN}Step 3: Stopping old containers...${NC}"
docker compose down

echo ""
echo -e "${GREEN}Step 4: Starting new containers...${NC}"
docker compose up -d

echo ""
echo -e "${GREEN}Step 5: Running database migrations...${NC}"
sleep 10  # Wait for database to be ready
# docker compose exec api alembic upgrade head

echo ""
echo -e "${GREEN}Step 6: Checking container status...${NC}"
docker compose ps

echo ""
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo "Check logs with: docker compose logs -f"
echo "Check health: curl https://api.thepixstock.com/health"
