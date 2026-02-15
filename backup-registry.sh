#!/bin/bash

# Docker Registry Backup Script
# Backs up all registry data to a tar.gz file

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
VOLUME_NAME="registry-ui_registry-data"
BACKUP_FILE="registry-backup-${DATE}.tar.gz"

echo -e "${BLUE}Docker Registry Backup Tool${NC}"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if volume exists
if ! docker volume inspect "$VOLUME_NAME" &> /dev/null; then
    echo -e "${RED}✗ Volume $VOLUME_NAME not found${NC}"
    echo "Make sure the registry is deployed first."
    exit 1
fi

echo -e "${YELLOW}Creating backup of registry data...${NC}"
echo "Volume: $VOLUME_NAME"
echo "Backup file: $BACKUP_DIR/$BACKUP_FILE"
echo ""

# Create backup
docker run --rm \
  -v ${VOLUME_NAME}:/data:ro \
  -v $(pwd)/${BACKUP_DIR}:/backup \
  ubuntu:latest \
  tar czf /backup/${BACKUP_FILE} -C /data .

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Backup created successfully!${NC}"
    echo ""
    echo "Backup location: ${BACKUP_DIR}/${BACKUP_FILE}"
    echo "Backup size: $(du -h ${BACKUP_DIR}/${BACKUP_FILE} | cut -f1)"
    echo ""
    echo -e "${BLUE}To restore this backup:${NC}"
    echo "./restore-registry.sh ${BACKUP_DIR}/${BACKUP_FILE}"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

# Clean up old backups (keep last 7)
echo -e "${YELLOW}Cleaning up old backups (keeping last 7)...${NC}"
cd "$BACKUP_DIR"
ls -t registry-backup-*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm --
cd ..

echo -e "${GREEN}✓ Backup complete!${NC}"
