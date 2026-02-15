#!/bin/bash

# Volume Data Loss Diagnostic Tool
# Run this to find out why your data is disappearing

echo "======================================"
echo "Docker Registry Volume Diagnostic"
echo "======================================"
echo ""

echo "1. Checking current directory..."
echo "   Current path: $(pwd)"
echo "   Project directory name: $(basename $(pwd))"
echo ""

echo "2. Checking for volume..."
docker volume ls | grep -i registry
echo ""

echo "3. Checking volume name pattern..."
echo "   Expected: docker-registry-ui-pro_registry-data"
echo "   OR: $(basename $(pwd))_registry-data"
echo ""

echo "4. Checking running containers..."
docker ps | grep -E "registry|frontend|backend"
echo ""

echo "5. Checking stopped containers..."
docker ps -a | grep -E "registry|frontend|backend"
echo ""

echo "6. Checking which volumes are actually mounted..."
if docker ps -q --filter "name=docker-registry" > /dev/null 2>&1; then
    echo "   Registry container volumes:"
    docker inspect docker-registry | grep -A 20 "Mounts" | grep -E "Source|Destination|Name"
else
    echo "   Registry container is not running"
fi
echo ""

echo "7. Checking project name in docker-compose..."
docker-compose config | grep -i "name:"
echo ""

echo "8. Checking all registry-related volumes..."
docker volume ls -q | grep -i registry | while read vol; do
    echo "   Volume: $vol"
    docker volume inspect $vol | grep -E "CreatedAt|Mountpoint" | head -2
    echo ""
done

echo "======================================"
echo "COMMON ISSUES:"
echo "======================================"
echo ""
echo "❌ ISSUE 1: Using 'docker-compose down -v'"
echo "   This DELETES volumes. Never use the -v flag!"
echo ""
echo "❌ ISSUE 2: Running from different directories"
echo "   Volume name includes directory name."
echo "   Always run docker-compose from: $(pwd)"
echo ""
echo "❌ ISSUE 3: Multiple volume names"
if [ $(docker volume ls -q | grep -i registry | wc -l) -gt 1 ]; then
    echo "   ⚠️  FOUND MULTIPLE VOLUMES - This is your problem!"
    echo "   Your images might be in one volume while"
    echo "   the container is using another volume."
    echo ""
    echo "   Run: ./fix-volume-issue.sh"
fi
echo ""

echo "======================================"
echo "RECOMMENDED ACTIONS:"
echo "======================================"
echo ""
echo "1. Check the volume name carefully above"
echo "2. If multiple volumes exist, we need to consolidate"
echo "3. Always use: docker-compose down (NO -v flag)"
echo "4. Always run commands from: $(pwd)"
echo ""
