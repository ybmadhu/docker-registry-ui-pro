#!/bin/bash

echo "🐳 Docker Registry UI - Quick Setup"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"
echo ""

# Check if ports are available
check_port() {
    port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use"
        return 1
    fi
    return 0
}

echo "🔍 Checking ports..."
ports_available=true
check_port 3000 || ports_available=false
check_port 5000 || ports_available=false
check_port 8000 || ports_available=false

if [ "$ports_available" = false ]; then
    echo ""
    echo "⚠️  Some required ports are in use. Please free up ports 3000, 5000, and 8000."
    read -p "Do you want to continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🚀 Starting Docker Registry UI..."
echo ""

# Build and start services
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check if services are running
if docker ps | grep -q "docker-registry"; then
    echo "✅ Registry is running"
else
    echo "❌ Registry failed to start"
    exit 1
fi

if docker ps | grep -q "registry-backend"; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start"
    exit 1
fi

if docker ps | grep -q "registry-frontend"; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend failed to start"
    exit 1
fi

echo ""
echo "🎉 Docker Registry UI is ready!"
echo ""
echo "📍 Access points:"
echo "   - Frontend UI:       http://localhost:3000"
echo "   - Backend API:       http://localhost:8000"
echo "   - Backend Docs:      http://localhost:8000/docs"
echo "   - Docker Registry:   http://localhost:5000"
echo ""
echo "📝 Quick Start:"
echo "   1. Tag an image:     docker tag myimage:latest localhost:5000/myimage:latest"
echo "   2. Push to registry: docker push localhost:5000/myimage:latest"
echo "   3. View in UI:       http://localhost:3000"
echo ""
echo "🛑 To stop:"
echo "   docker-compose down"
echo ""
echo "🗑️  To cleanup and remove data:"
echo "   docker-compose down -v"
echo ""
