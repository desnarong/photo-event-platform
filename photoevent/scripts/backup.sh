#!/bin/bash

set -e

echo "💾 Backing up Photo Event Platform..."

# Colors
GREEN='\033[0;32m'
NC='\033[0m'

# Create backup directory
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo ""
echo -e "${GREEN}Step 1: Backing up PostgreSQL database...${NC}"
docker compose exec -T postgres pg_dump -U postgres eventphotos | gzip > $BACKUP_DIR/database_$DATE.sql.gz

echo ""
echo -e "${GREEN}Step 2: Backing up MinIO data...${NC}"
docker compose exec -T minio tar czf - /data | cat > $BACKUP_DIR/minio_$DATE.tar.gz

echo ""
echo -e "${GREEN}Step 3: Backing up .env file...${NC}"
cp .env $BACKUP_DIR/env_$DATE

echo ""
echo -e "${GREEN}✅ Backup completed!${NC}"
echo ""
echo "Backup files:"
ls -lh $BACKUP_DIR/*$DATE*

echo ""
echo "To restore:"
echo "Database: gunzip < $BACKUP_DIR/database_$DATE.sql.gz | docker compose exec -T postgres psql -U postgres eventphotos"
echo "MinIO: docker compose exec -T minio tar xzf - < $BACKUP_DIR/minio_$DATE.tar.gz"

# Clean old backups (keep last 7 days)
echo ""
echo "Cleaning old backups (keeping last 7 days)..."
find $BACKUP_DIR -name "database_*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "minio_*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "env_*" -mtime +7 -delete

echo ""
echo -e "${GREEN}Cleanup completed!${NC}"
