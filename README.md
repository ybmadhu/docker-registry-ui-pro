# Docker Registry UI Pro 🐳

> A modern, beautiful, and feature-rich web interface for managing your private Docker Registry

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-v20.10+-2496ED?logo=docker)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)

📺 **[Watch Full Tutorial on YouTube](https://www.youtube.com/@MadhuSudhanReddyYB)**

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Technologies Used](#-technologies-used)
- [Configuration](#-configuration)
- [Using with Remote Registries](#-using-with-remote-registries)
- [Volumes and Data Persistence](#-volumes-and-data-persistence)
- [Deployment Options](#-deployment-options)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [About the Author](#-about-the-author)
- [License](#-license)

---

## 🎯 Overview

Docker Registry UI Pro is a lightweight, modern web interface for Docker Registry v2. It solves the problem of managing private registries without the complexity and cost of enterprise solutions like Harbor, Nexus, or JFrog Artifactory.

### Why This Project?

The official Docker Registry has no web interface, and existing solutions are either:
- **Too complex** - Enterprise tools with steep learning curves
- **Too expensive** - Commercial solutions costing thousands per year
- **Too limited** - Basic UIs lacking modern features

Docker Registry UI Pro provides enterprise-grade features in a simple, beautiful package that anyone can deploy in minutes.

### Perfect For

- 🚀 Startups managing private container images
- 👨‍💻 DevOps teams needing simple registry visualization
- 🎓 Educational institutions teaching containerization
- 🏢 Development teams running microservices
- 💡 Anyone learning Docker and DevOps

---

## ✨ Features

### 🎨 Beautiful Modern UI
- Sidebar navigation with statistics and top repositories
- Gradient dark theme - professional and easy on the eyes
- Responsive design - works on desktop, tablet, and mobile
- Smooth animations and delightful user experience

### 📊 Comprehensive Dashboard
- Real-time statistics (total repositories, images, storage)
- Top repositories widget showing most-used images
- Recently updated widget tracking latest changes
- Visual analytics with charts and metrics

### 🔍 Advanced Search & Filtering
- Instant search across all repositories
- Smart filters (All, Active, Large images)
- Multiple sort options (name, tags, size, date)
- Pattern matching for powerful searches

### 🛠️ Repository Management
- Complete repository overview
- Detailed tag information (size, OS, architecture, dates)
- Platform details for each image
- Storage tracking per repository

### 🏷️ Tag Operations
- One-click copy of docker pull commands
- Safe deletion with confirmation dialogs
- Detailed metadata (digest, layers, author, creation date)
- Batch operations support

### 🔐 Production Ready
- Built-in health checks for monitoring
- Graceful error handling with helpful messages
- Comprehensive logging for debugging
- Data persistence with Docker volumes

---

## 🚀 Quick Start

### Prerequisites
- Docker 20.10 or higher
- Docker Compose 2.0 or higher
- 2GB RAM minimum (4GB recommended)
- 10GB disk space minimum

### Installation

```bash
# 1. Clone or extract the repository
git clone https://github.com/ybmadhu/docker-registry-ui-pro.git
cd docker-registry-ui-pro

# 2. Run the deployment script
chmod +x deploy.sh
./deploy.sh

# 3. Access the UI
# Open http://localhost:3000 in your browser
```

That's it! Your registry UI is now running.

### Push Your First Image

```bash
# Tag an existing image
docker tag myapp:latest localhost:5000/myapp:latest

# Push to your registry
docker push localhost:5000/myapp:latest

# Refresh the UI to see your image
```

---

## 🏗️ Architecture

Docker Registry UI Pro follows a modern microservices architecture:

```
┌─────────────────────────────────────────┐
│         User Browser                    │
│      http://localhost:3000              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│    Frontend Container (React + Nginx)    │
│    - Modern UI Components                │
│    - State Management                    │
│    - Responsive Design                   │
│    - Port 80 → Exposed as 3000           │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│    Backend Container (FastAPI)           │
│    - RESTful API Endpoints               │
│    - Async HTTP Client                   │
│    - Data Processing                     │
│    - Port 8000                           │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│    Registry Container                    │
│    - Docker Registry v2                  │
│    - Image Storage                       │
│    - Registry API v2                     │
│    - Port 5000                           │
│    ┌─────────────────────────────────┐  │
│    │ Volume: registry-data           │  │
│    │ Path: /var/lib/registry         │  │
│    └─────────────────────────────────┘  │
└──────────────────────────────────────────┘

    All containers connected via
    Docker Network: registry-network
```

### Component Details

**Frontend (Port 3000):**
- Serves React-based user interface
- Nginx web server with static asset caching
- Proxies API requests to backend

**Backend (Port 8000):**
- Provides RESTful API endpoints
- Communicates with Docker Registry
- Processes and aggregates data
- Handles future authentication

**Registry (Port 5000):**
- Official Docker Registry v2
- Stores container images
- Provides Registry API
- Manages image layers and manifests

---

## 💻 Technologies Used

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2+ | UI framework |
| Tailwind CSS | 3.3+ | Styling framework |
| Vite | 4.4+ | Build tool |
| Lucide React | 0.263+ | Icon library |
| Nginx | 1.25+ | Web server |

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Core language |
| FastAPI | 0.100+ | Web framework |
| Uvicorn | 0.23+ | ASGI server |
| httpx | 0.24+ | HTTP client |
| Pydantic | 2.0+ | Data validation |

### Infrastructure

| Technology | Version | Purpose |
|------------|---------|---------|
| Docker | 20.10+ | Container runtime |
| Docker Compose | 2.0+ | Orchestration |
| Docker Registry | 2.8+ | Image storage |
| Docker Networks | - | Communication |
| Docker Volumes | - | Data persistence |

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file for custom configuration:

```bash
# Registry Configuration
REGISTRY_URL=http://registry:5000
REGISTRY_STORAGE_DELETE_ENABLED=true

# Port Configuration
FRONTEND_PORT=3000
BACKEND_PORT=8000
REGISTRY_PORT=5000
```

### Registry Configuration

Edit `config/registry-config.yml`:

```yaml
version: 0.1
log:
  level: info
storage:
  filesystem:
    rootdirectory: /var/lib/registry
  delete:
    enabled: true
http:
  addr: :5000
```

---

## 🌐 Using with Remote Registries

### Push from Different Server

```bash
# On application server
docker tag myapp:latest registry.example.com:5000/myapp:latest
docker push registry.example.com:5000/myapp:latest
```

### Configure Insecure Registry (HTTP)

Edit `/etc/docker/daemon.json`:

```json
{
  "insecure-registries": ["registry.example.com:5000"]
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

### Deploy on Cloud Server

```bash
# On AWS/Azure/GCP server
sudo apt update
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone and deploy
git clone https://github.com/yourusername/docker-registry-ui-pro.git
cd docker-registry-ui-pro
./deploy.sh

# Configure firewall
sudo ufw allow 3000/tcp
sudo ufw allow 5000/tcp
```

### Multi-Server Setup

**Registry Server (192.168.1.10):**
```bash
./deploy.sh
```

**Application Server (192.168.1.20):**
```bash
# Configure Docker
echo '{"insecure-registries": ["192.168.1.10:5000"]}' | \
  sudo tee /etc/docker/daemon.json
sudo systemctl restart docker

# Push images
docker tag app:v1 192.168.1.10:5000/app:v1
docker push 192.168.1.10:5000/app:v1
```

**For complete remote registry setup, see DEPLOYMENT.md**

---

## 💾 Volumes and Data Persistence

### Understanding Volumes

Docker Registry UI Pro uses Docker volumes to persist data:

```yaml
volumes:
  registry-data:
    driver: local
```

This volume stores all container images at `/var/lib/registry`.

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect docker-registry-ui-pro_registry-data

# Backup volume
docker run --rm \
  -v docker-registry-ui-pro_registry-data:/data \
  -v $(pwd)/backups:/backup \
  ubuntu tar czf /backup/registry-$(date +%Y%m%d).tar.gz /data

# Restore volume
docker run --rm \
  -v docker-registry-ui-pro_registry-data:/data \
  -v $(pwd)/backups:/backup \
  ubuntu tar xzf /backup/registry-YYYYMMDD.tar.gz -C /
```

### Storage Monitoring

```bash
# Check volume size
docker system df -v

# Monitor registry size
du -sh /var/lib/docker/volumes/docker-registry-ui-pro_registry-data
```

### Garbage Collection

After deleting images, free disk space:

```bash
docker exec docker-registry bin/registry garbage-collect \
  /etc/docker/registry/config.yml
```

---

## 🚀 Deployment Options

- **Local Development:** `./deploy.sh`
- **Production Server:** See DEPLOYMENT.md
- **AWS EC2:** Launch instance → Install Docker → Deploy
- **Azure/GCP:** Similar to AWS
- **Kubernetes:** See k8s/ directory

---

## 📚 API Documentation

### Endpoints

**GET /api/repositories**
Get all repositories with details

**GET /api/health**
Check backend and registry health

**GET /api/statistics**
Get registry statistics

**DELETE /api/v2/{repository}/manifests/{digest}**
Delete an image

### Interactive Docs

Visit `http://localhost:8000/docs` for Swagger UI

---

## 🐛 Troubleshooting

**Cannot access UI:**
```bash
docker-compose ps
docker-compose logs frontend
```

**Images not showing:**
```bash
curl http://localhost:5000/v2/_catalog
docker-compose logs backend
```

**Cannot push images:**
```bash
curl http://localhost:5000/v2/
cat /etc/docker/daemon.json
sudo systemctl restart docker
```

**Out of disk space:**
```bash
docker system df
docker exec docker-registry bin/registry garbage-collect \
  /etc/docker/registry/config.yml
```

**See docs/TROUBLESHOOTING.md for more help**

---

## 🤝 Contributing

Contributions welcome! See CONTRIBUTING.md

**Ways to contribute:**
- Report bugs
- Suggest features
- Improve documentation
- Add tests
- Enhance UI/UX

---

## 👤 About the Author

**DevOps Engineer | Cloud Enthusiast | Knowledge Sharer**

I'm a DevOps professional passionate about making complex technologies accessible to everyone. I created Docker Registry UI Pro because powerful tools shouldn't require enterprise budgets or complex setups.

### My Journey

- 🏢 Working as DevOps Engineer
- 🛠️ Daily tools: Docker, Kubernetes, AWS, Python, React, helm, argocd, terraform
- 📚 Passionate about teaching and mentoring
- 🌐 Sharing knowledge through open-source

### Why I Built This

Working with teams using private registries, I saw frustration with complex enterprise tools, expensive solutions, and poor interfaces. I wanted something that:
- Anyone can deploy in minutes
- Works beautifully
- Helps people learn DevOps
- Stays free forever

### My Mission

**Empowering the next generation of DevOps engineers** by creating tools and content that make learning accessible and enjoyable.

### Connect

- 💼 LinkedIn: https://www.linkedin.com/in/ybmsreddy/ 
- 📺 YouTube: [Docker Registry UI Tutorials](https://www.youtube.com/@MadhuSudhanReddyYB)
- 📧 Email: ybmadhu404@gmail.com


**"The best way to learn is to build, and the best way to grow is to share."**

---

## 📄 License

MIT License - see LICENSE file

---

## 🙏 Acknowledgments

- Docker Registry team
- FastAPI community
- React and Tailwind CSS teams
- All contributors
- You, for using this project!

---

## 📺 Video Tutorial

Watch the complete tutorial:
[![Tutorial](https://www.youtube.com/@MadhuSudhanReddyYB)

---

<div align="center">

**Made with ❤️ for the DevOps community**

If you find this useful, give it a ⭐!

[⬆ Back to Top](#docker-registry-ui-pro-)

</div>
