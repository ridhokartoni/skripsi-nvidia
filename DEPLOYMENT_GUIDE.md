# GPU Container Platform - Deployment Guide

## Table of Contents
1. [Local Development](#local-development)
2. [Production Deployment](#production-deployment)
3. [Configuration Files](#configuration-files)
4. [Security Checklist](#security-checklist)
5. [Troubleshooting](#troubleshooting)

---

## Local Development

### Quick Start (Localhost)
```bash
# The application works out of the box for localhost
./start.sh compose
```

### Manual Setup
```bash
# 1. Use the local environment file (already created)
cp .env.local .env

# 2. Start with docker-compose
docker-compose -f docker-compose.wsl.yml up -d --build

# 3. Access the application
# Frontend: http://localhost:3001
# API: http://localhost:3000/api/v1
```

---

## Production Deployment

### Prerequisites
- Docker and Docker Compose installed
- NVIDIA drivers and nvidia-docker2 (for GPU support)
- Domain name or static IP address
- SSL certificates (recommended)

### Step 1: Configure Environment

```bash
# 1. Copy production environment template
cp .env.production.example .env.production

# 2. Edit .env.production with your values
nano .env.production
```

**Required changes in `.env.production`:**
```env
# Update these values:
API_HOST=your-server.domain.com
NEXT_PUBLIC_API_URL=http://your-server.domain.com:3000/api/v1
PUBLIC_FRONTEND_URL=http://your-server.domain.com:3001

# Database (use strong passwords!)
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_strong_password_here
DATABASE_NAME=nvidia_production

# DNS (use your internal DNS)
DOCKER_DNS_PRIMARY=your.internal.dns.server
DOCKER_DNS_SECONDARY=8.8.8.8

# CORS (add your domains)
ALLOWED_ORIGINS=http://your-server.domain.com:3001,https://your-server.domain.com

# JWT Secrets (MUST CHANGE!)
JWT_ACCESS_SECRET=generate-long-random-string-here
JWT_REFRESH_SECRET=generate-another-long-random-string-here
```

### Step 2: Generate Secure Secrets

```bash
# Generate JWT secrets
openssl rand -base64 32  # For JWT_ACCESS_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET

# Generate database password
openssl rand -base64 24
```

### Step 3: Deploy Application

```bash
# Set deployment mode
export DEPLOYMENT_MODE=production

# Start with production config
docker-compose -f docker-compose.production.yml up -d --build

# OR use the smart start script
./start.sh compose
```

### Step 4: Configure Firewall

```bash
# Allow only necessary ports
sudo ufw allow 80/tcp    # HTTP (redirect to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH (restrict source IPs)

# Block direct access to application ports
sudo ufw deny 3000/tcp   # Block direct API access
sudo ufw deny 3001/tcp   # Block direct frontend access
sudo ufw deny 5432/tcp   # Block direct database access
```

### Step 5: Setup Reverse Proxy (Nginx)

Create `/etc/nginx/sites-available/gpu-platform`:
```nginx
server {
    listen 80;
    server_name your-server.domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-server.domain.com;

    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/gpu-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Configuration Files

### Environment Files
- `.env.local` - Local development (localhost)
- `.env.production` - Production deployment
- `.env.production.example` - Production template

### Docker Compose Files
- `docker-compose.wsl.yml` - Local development
- `docker-compose.production.yml` - Production with env variables
- `docker-compose.yml` - Default/fallback

### Key Configuration Points
1. **DNS Configuration**: Containers use configurable DNS from environment
2. **CORS**: Configured per environment, localhost always allowed in dev
3. **Database**: Connection strings adapt to environment
4. **API URLs**: Frontend dynamically uses correct backend URL
5. **Jupyter Links**: Generated with correct hostname

---

## Security Checklist

### Before Production Deployment

- [ ] Change all default passwords
- [ ] Generate new JWT secrets
- [ ] Configure firewall rules
- [ ] Setup SSL certificates
- [ ] Restrict database access
- [ ] Configure CORS properly
- [ ] Disable debug mode
- [ ] Setup backup strategy
- [ ] Configure log rotation
- [ ] Review Docker socket permissions
- [ ] Implement rate limiting
- [ ] Setup monitoring/alerting

### Database Security
```bash
# Restrict PostgreSQL connections
# Edit postgresql.conf
echo "host    all    all    172.17.0.0/16    md5" >> pg_hba.conf
```

### Docker Security
```bash
# Use Docker API over TLS (optional)
# In .env.production:
DOCKER_HOST=tcp://docker-host:2376
DOCKER_TLS_VERIFY=1
DOCKER_CERT_PATH=/path/to/certs
```

---

## Troubleshooting

### Common Issues

#### 1. Container can't resolve hostnames
**Problem**: Containers can't reach internal services
**Solution**: Update `DOCKER_DNS_SERVERS` in environment file
```bash
DOCKER_DNS_SERVERS=172.17.9.25,8.8.8.8
```

#### 2. CORS errors
**Problem**: Frontend can't reach backend
**Solution**: Add frontend URL to `ALLOWED_ORIGINS`
```bash
ALLOWED_ORIGINS=http://your-domain:3001,http://localhost:3001
```

#### 3. Database connection failed
**Problem**: API can't connect to database
**Solution**: Check if database container is healthy
```bash
docker ps
docker logs postgres-container
```

#### 4. GPU not accessible
**Problem**: Containers can't access GPU
**Solution**: Ensure nvidia-docker2 is installed
```bash
# Install nvidia-docker2
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update && sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker
```

#### 5. Port already in use
**Problem**: Cannot bind to port
**Solution**: Change port in environment file or stop conflicting service
```bash
# Find what's using the port
sudo lsof -i :3000
# Change port in .env file
API_PORT=3100
```

### Debug Commands

```bash
# Check environment detection
echo $DEPLOYMENT_MODE

# View container logs
docker logs skripsi-admin-api
docker logs skripsi-frontend

# Test database connection
docker exec -it postgres-container psql -U $DATABASE_USER -d $DATABASE_NAME

# Check network connectivity
docker network inspect nvidia-network

# Verify environment variables
docker exec skripsi-admin-api env | grep -E "(DATABASE|JWT|DOCKER_DNS)"

# Test DNS resolution from container
docker exec skripsi-admin-api nslookup google.com
```

---

## Maintenance

### Backup Database
```bash
# Backup
docker exec postgres-container pg_dump -U $DATABASE_USER $DATABASE_NAME > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i postgres-container psql -U $DATABASE_USER $DATABASE_NAME < backup.sql
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

### Monitor Resources
```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean up
docker system prune -a --volumes
```

---

## Support

For issues or questions:
1. Check the logs: `docker logs [container-name]`
2. Review environment variables: `docker exec [container-name] env`
3. Verify network configuration: `docker network ls`
4. Test DNS resolution: `nslookup your-server.domain.com`

Remember: The application automatically detects the environment and loads the appropriate configuration!
