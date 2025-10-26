#!/bin/bash

set -e

echo "🚀 Photo Event Platform - Setup Script"
echo "======================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root (use sudo)${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}Step 1: Updating system...${NC}"
apt update && apt upgrade -y

echo ""
echo -e "${GREEN}Step 2: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}Docker installed successfully${NC}"
else
    echo -e "${YELLOW}Docker already installed${NC}"
fi

echo ""
echo -e "${GREEN}Step 3: Installing Docker Compose...${NC}"
if ! command -v docker compose &> /dev/null; then
    apt install -y docker-compose-plugin
    echo -e "${GREEN}Docker Compose installed successfully${NC}"
else
    echo -e "${YELLOW}Docker Compose already installed${NC}"
fi

echo ""
echo -e "${GREEN}Step 4: Starting Docker service...${NC}"
systemctl enable docker
systemctl start docker

echo ""
echo -e "${GREEN}Step 5: Setting up firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw allow 22/tcp   # SSH
    ufw allow 80/tcp   # HTTP
    ufw allow 443/tcp  # HTTPS
    echo -e "${GREEN}Firewall configured${NC}"
fi

echo ""
echo -e "${GREEN}Step 6: Creating .env file...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env file with your configuration${NC}"
    echo -e "${YELLOW}Important: Change all passwords and secrets!${NC}"
else
    echo -e "${YELLOW}.env file already exists${NC}"
fi

echo ""
echo -e "${GREEN}Step 7: Creating directories...${NC}"
mkdir -p monitoring/{prometheus,loki,promtail,grafana}/provisioning
mkdir -p scripts

echo ""
echo -e "${GREEN}✅ Setup completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file: nano .env"
echo "2. Generate Traefik auth: ./scripts/generate-auth.sh"
echo "3. Start services: docker compose up -d"
echo "4. Check logs: docker compose logs -f"
echo ""
echo "Access points:"
echo "- Frontend: https://thepixstock.com"
echo "- Admin: https://admin.thepixstock.com"
echo "- API: https://api.thepixstock.com"
echo "- Monitoring: https://monitor.thepixstock.com"
echo "- MinIO: https://minio.thepixstock.com"
echo ""
