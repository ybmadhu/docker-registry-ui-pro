#!/bin/bash

# Volume Migration and Fix Script
# Fixes volume data loss issues permanently

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}======================================"
echo "Docker Registry Volume Fix Tool"
echo "======================================${NC}"
echo ""

# Stop containers first
echo -e "${YELLOW}Step 1: Stopping all containers...${NC}"
docker-compose down 2>/dev/null || true
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

# Find all existing registry volumes
echo -e "${YELLOW}Step 2: Finding existing volumes...${NC}"
VOLUMES=$(docker volume ls -q | grep -i registry || true)

if [ -z "$VOLUMES" ]; then
    echo -e "${YELLOW}No existing volumes found. This will be a fresh start.${NC}"
    NEW_INSTALL=true
else
    echo "Found volumes:"
    echo "$VOLUMES" | while read vol; do
        SIZE=$(docker system df -v 2>/dev/null | grep "$vol" | awk '{print $3}' || echo "unknown")
        echo "  - $vol (Size: $SIZE)"
    done
    echo ""
    NEW_INSTALL=false
fi

# New fixed volume name
NEW_VOLUME="registry-ui_registry-data"

if [ "$NEW_INSTALL" = false ]; then
    # Find the volume with data
    echo -e "${YELLOW}Step 3: Checking which volume has your data...${NC}"
    
    LARGEST_VOLUME=""
    LARGEST_SIZE=0
    
    echo "$VOLUMES" | while read vol; do
        if [ ! -z "$vol" ]; then
            # Check if volume has data
            HAS_DATA=$(docker run --rm -v $vol:/data alpine sh -c 'ls /data 2>/dev/null | wc -l' 2>/dev/null || echo "0")
            if [ "$HAS_DATA" != "0" ]; then
                echo -e "  ${GREEN}✓ $vol has data ($HAS_DATA files/folders)${NC}"
                LARGEST_VOLUME=$vol
            else
                echo "  - $vol is empty"
            fi
        fi
    done
    
    # If we found a volume with data that's not the new name, migrate it
    if [ ! -z "$LARGEST_VOLUME" ] && [ "$LARGEST_VOLUME" != "$NEW_VOLUME" ]; then
        echo ""
        echo -e "${YELLOW}Step 4: Migrating data from $LARGEST_VOLUME to $NEW_VOLUME${NC}"
        
        # Create new volume if it doesn't exist
        docker volume create $NEW_VOLUME 2>/dev/null || true
        
        # Copy data
        echo "Copying data (this may take a few minutes)..."
        docker run --rm \
            -v $LARGEST_VOLUME:/source:ro \
            -v $NEW_VOLUME:/dest \
            alpine sh -c 'cp -a /source/. /dest/'
        
        echo -e "${GREEN}✓ Data migrated successfully${NC}"
        echo ""
        
        echo -e "${YELLOW}Old volume cleanup:${NC}"
        echo "The old volume ($LARGEST_VOLUME) still exists but is no longer used."
        read -p "Do you want to delete it to save space? (yes/no): " -r
        if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            docker volume rm $LARGEST_VOLUME
            echo -e "${GREEN}✓ Old volume deleted${NC}"
        else
            echo "Old volume kept. You can delete it later with:"
            echo "  docker volume rm $LARGEST_VOLUME"
        fi
    elif [ "$LARGEST_VOLUME" = "$NEW_VOLUME" ]; then
        echo -e "${GREEN}✓ Already using correct volume name${NC}"
    fi
else
    # Create the volume for fresh install
    echo -e "${YELLOW}Step 3: Creating new volume...${NC}"
    docker volume create $NEW_VOLUME 2>/dev/null || true
    echo -e "${GREEN}✓ Volume created: $NEW_VOLUME${NC}"
fi

echo ""
echo -e "${YELLOW}Step 5: Updating configuration...${NC}"

# Make sure docker-compose.yml has the project name
if ! grep -q "^name:" docker-compose.yml; then
    echo -e "${RED}⚠️  Adding project name to docker-compose.yml${NC}"
    sed -i '1a name: registry-ui' docker-compose.yml
fi

echo -e "${GREEN}✓ Configuration updated${NC}"
echo ""

echo -e "${YELLOW}Step 6: Starting services...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}======================================"
echo "✓ Volume Fix Complete!"
echo "======================================${NC}"
echo ""
echo "Your volume is now fixed and will persist data correctly."
echo ""
echo -e "${BLUE}Volume Information:${NC}"
echo "  Name: $NEW_VOLUME"
echo "  Location: /var/lib/docker/volumes/$NEW_VOLUME"
echo ""
echo -e "${YELLOW}Important - Never use these commands:${NC}"
echo "  ❌ docker-compose down -v   (deletes volumes)"
echo "  ❌ docker volume rm         (deletes specific volume)"
echo ""
echo -e "${GREEN}Safe commands to use:${NC}"
echo "  ✓ docker-compose down       (stops containers, keeps data)"
echo "  ✓ docker-compose restart    (restarts containers)"
echo "  ✓ docker-compose logs -f    (view logs)"
echo ""
echo -e "${BLUE}Backup your data:${NC}"
echo "  ./backup-registry.sh"
echo ""
