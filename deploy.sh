#!/bin/bash

# Docker Registry UI Pro - Quick Deployment Script
# Author: DevOps Enthusiast | Passionate about sharing knowledge

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          Docker Registry UI Pro v2.0                      ║
║          Modern Interface for Docker Registry            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found. Please install Docker first.${NC}"
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker installed${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose not found. Please install Docker Compose first.${NC}"
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose installed${NC}"

# Check Docker daemon
if ! docker info &> /dev/null; then
    echo -e "${RED}✗ Docker daemon not running. Please start Docker.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker daemon running${NC}"

# Check ports
echo ""
echo -e "${BLUE}Checking port availability...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 3000 is in use${NC}"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
else
    echo -e "${GREEN}✓ Port 3000 available${NC}"
fi

if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 5000 is in use${NC}"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
else
    echo -e "${GREEN}✓ Port 5000 available${NC}"
fi

# Deploy
echo ""
echo -e "${BLUE}Starting deployment...${NC}"
echo -e "${YELLOW}This may take a few minutes on first run...${NC}"
echo ""

docker-compose up -d

# Wait for services
echo ""
echo -e "${BLUE}Waiting for services to start...${NC}"
sleep 5

# Verify
if [ "$(docker-compose ps -q | wc -l)" -eq 3 ]; then
    echo ""
    echo -e "${GREEN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              🎉 Deployment Successful!                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo ""
    echo -e "${GREEN}✓ Docker Registry UI Pro is running!${NC}"
    echo ""
    echo "Access the UI at:      ${BLUE}http://localhost:3000${NC}"
    echo "Registry API at:       ${BLUE}http://localhost:5000${NC}"
    echo "Backend API at:        ${BLUE}http://localhost:8000${NC}"
    echo ""
    echo -e "${YELLOW}Quick Commands:${NC}"
    echo "  View logs:     docker-compose logs -f"
    echo "  Stop:          docker-compose down"
    echo "  Restart:       docker-compose restart"
    echo ""
    echo -e "${RED}⚠️  IMPORTANT - Data Persistence:${NC}"
    echo -e "${YELLOW}  NEVER use: docker-compose down -v (this deletes your images!)${NC}"
    echo -e "${GREEN}  Always use: docker-compose down (keeps your data safe)${NC}"
    echo ""
    echo -e "${YELLOW}Volume Management:${NC}"
    echo "  Check volumes: docker volume ls"
    echo "  Volume info:   docker volume inspect docker-registry-ui-pro_registry-data"
    echo "  Backup data:   ./backup-registry.sh (if available)"
    echo ""
    echo -e "${YELLOW}Push your first image:${NC}"
    echo "  docker tag myimage:latest localhost:5000/myimage:latest"
    echo "  docker push localhost:5000/myimage:latest"
    echo ""
    echo -e "${BLUE}📺 Watch tutorial: https://www.youtube.com/@MadhuSudhanReddyYB${NC}"
    echo ""
else
    echo -e "${RED}✗ Some services failed to start${NC}"
    echo "Check logs: docker-compose logs"
    exit 1
fi
