# EC2 Deployment Guide

## Quick Fix for External Access

If you're accessing the UI from outside your EC2 instance (e.g., `http://13.233.174.158:3000`), follow these steps:

### Option 1: Using Nginx Proxy (Recommended)

The nginx proxy is already configured. Just make sure your EC2 security group allows:
- Port 3000 (Frontend)

All API calls will be proxied through port 3000.

### Option 2: Expose Backend Port

If you need direct backend access, ensure your security group allows:
- Port 3000 (Frontend)
- Port 8000 (Backend API)
- Port 5000 (Docker Registry)

## EC2 Security Group Configuration

Add these inbound rules:

```
Type: Custom TCP
Port: 3000
Source: 0.0.0.0/0 (or your IP)

Type: Custom TCP
Port: 8000
Source: 0.0.0.0/0 (or your IP)

Type: Custom TCP
Port: 5000
Source: 0.0.0.0/0 (or your IP)
```

## Deployment Steps

1. **SSH into your EC2 instance**
```bash
ssh -i your-key.pem ec2-user@13.233.174.158
```

2. **Install Docker & Docker Compose** (if not already installed)
```bash
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Upload your project**
```bash
# From your local machine
scp -i your-key.pem -r docker-registry-ui ec2-user@13.233.174.158:~/
```

4. **Start the services**
```bash
cd docker-registry-ui
./setup.sh
```

5. **Access the UI**
```
http://13.233.174.158:3000
```

## Troubleshooting

### Check if services are running
```bash
docker ps
```

You should see:
- docker-registry
- registry-backend
- registry-frontend

### Check logs
```bash
# Frontend logs
docker logs registry-frontend

# Backend logs
docker logs registry-backend

# Registry logs
docker logs docker-registry
```

### Test backend connectivity
```bash
# From EC2 instance
curl http://localhost:8000/
curl http://localhost:8000/api/repositories

# From your browser
http://13.233.174.158:8000/
http://13.233.174.158:8000/docs
```

### Test registry
```bash
curl http://localhost:5000/v2/
# Should return: {}
```

### Restart services
```bash
docker-compose restart
```

### View all logs
```bash
docker-compose logs -f
```

## Push Test Image

```bash
# On EC2 or any machine that can reach your EC2 instance
docker pull alpine:latest
docker tag alpine:latest 13.233.174.158:5000/alpine:latest
docker push 13.233.174.158:5000/alpine:latest

# If you get certificate errors, use HTTP
# Add to /etc/docker/daemon.json:
{
  "insecure-registries": ["13.233.174.158:5000"]
}

# Then restart Docker
sudo systemctl restart docker
```

## Production Recommendations

For production use:

1. **Use HTTPS**: Set up SSL/TLS certificates
2. **Add Authentication**: Implement basic auth or OAuth
3. **Use Domain Name**: Instead of IP address
4. **Firewall**: Restrict access to specific IPs
5. **Backup**: Set up volume backups for registry data

## Common Issues

### "Failed to fetch" error
- Check EC2 security group allows port 8000
- Verify backend is running: `docker logs registry-backend`
- Test API: `curl http://13.233.174.158:8000/api/repositories`

### Can't push images
- Add registry to Docker's insecure registries
- Check EC2 security group allows port 5000
- Verify registry is running: `curl http://13.233.174.158:5000/v2/`

### Nginx 502 Bad Gateway
- Check if backend is running: `docker ps | grep backend`
- Check backend logs: `docker logs registry-backend`
- Restart: `docker-compose restart backend`
