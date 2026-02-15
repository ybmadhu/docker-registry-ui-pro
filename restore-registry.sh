#!/bin/bash

# Docker Registry Restore Script
# Restores registry data from a backup file

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
VOLUME_NAME="registry-ui_registry-data"

echo -e "${BLUE}Docker Registry Restore Tool${NC}"
echo ""

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 <backup-file.tar.gz>${NC}"
    echo ""
    echo "Available backups:"
    ls -lh backups/registry-backup-*.tar.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}✗ Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will REPLACE all current registry data!${NC}"
echo "Backup file: $BACKUP_FILE"
echo "Volume: $VOLUME_NAME"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

# Stop the registry container
echo -e "${YELLOW}Stopping registry container...${NC}"
docker-compose stop registry || true

# Restore the backup
echo -e "${YELLOW}Restoring data from backup...${NC}"
docker run --rm \
  -v ${VOLUME_NAME}:/data \
  -v $(pwd)/$(dirname $BACKUP_FILE):/backup \
  ubuntu:latest \
  bash -c "rm -rf /data/* && tar xzf /backup/$(basename $BACKUP_FILE) -C /data"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Data restored successfully!${NC}"
    echo ""
    
    # Start the registry container
    echo -e "${YELLOW}Starting registry container...${NC}"
    docker-compose start registry
    
    echo ""
    echo -e "${GREEN}✓ Restore complete!${NC}"
    echo "Your registry data has been restored."
else
    echo -e "${RED}✗ Restore failed${NC}"
    exit 1
fi
