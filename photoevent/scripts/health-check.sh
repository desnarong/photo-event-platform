#!/bin/bash

echo "🏥 Photo Event Platform - Health Check"
echo "======================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_service() {
    service=$1
    if docker compose ps | grep -q "$service.*running"; then
        echo -e "${GREEN}✓${NC} $service is running"
        return 0
    else
        echo -e "${RED}✗${NC} $service is NOT running"
        return 1
    fi
}

echo ""
echo "📦 Checking Docker containers..."
check_service "frontend"
check_service "admin"
check_service "api"
check_service "ai-service"
check_service "worker"
check_service "postgres"
check_service "redis"
check_service "minio"
check_service "grafana"
check_service "prometheus"

echo ""
echo "🌐 Checking API endpoints..."

API_URL="${1:-https://api.thepixstock.com}"

# Check API health
if curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" | grep -q "200"; then
    echo -e "${GREEN}✓${NC} API is healthy"
else
    echo -e "${RED}✗${NC} API is not responding"
fi

# Check AI service (internal)
if docker compose exec -T ai-service curl -s http://localhost:8001/health | grep -q "healthy"; then
    echo -e "${GREEN}✓${NC} AI Service is healthy"
else
    echo -e "${RED}✗${NC} AI Service is not healthy"
fi

echo ""
echo "💾 Checking disk space..."
df -h | grep -E "Filesystem|/$" | grep -v "tmpfs"

echo ""
echo "🧠 Checking memory usage..."
free -h

echo ""
echo "📊 Docker resource usage..."
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "🔍 Recent logs (errors only)..."
docker compose logs --tail=20 | grep -i error || echo "No errors found"

echo ""
echo "✅ Health check completed!"
