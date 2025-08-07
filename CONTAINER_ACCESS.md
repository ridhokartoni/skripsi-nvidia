# Container Access Guide

## Overview
This guide explains how to connect to the GPU containers in the platform.

## Container Information from Admin Panel

From the screenshot, you can see a container with the following details:
- **Container Name**: qais1748764610331
- **Image**: jupyter/base-notebook
- **User**: qais
- **Resources**: 2 CPU, 1g RAM, device=4:0 GPU
- **SSH Port**: 20476
- **Jupyter Port**: 20465
- **Status**: Running

## How to Connect to Containers

### 1. SSH Access
Each container has an SSH port exposed on the host machine. To connect via SSH:

```bash
# SSH connection format
ssh -p [SSH_PORT] root@localhost

# Example for the container shown
ssh -p 20476 root@localhost

# You'll need the container password (stored in the database)
```

### 2. Jupyter Notebook Access
Each container runs a Jupyter server accessible through the browser:

```
# Jupyter URL format
http://localhost:[JUPYTER_PORT]

# Example for the container shown
http://localhost:20465
```

You'll need the Jupyter token or password to access the notebook.

### 3. Getting Container Credentials

The container passwords are stored in the database. You can retrieve them:

#### Option A: Via Database Query
```bash
# Connect to PostgreSQL
docker exec -it postgres-container psql -U qaisjabbar -d nvidia

# Query to get container details with password
SELECT 
  c.name as container_name,
  c.sshPort,
  c.jupyterPort,
  c.password,
  u.email as owner_email,
  u.fullName as owner_name
FROM "Container" c
JOIN "User" u ON c."userId" = u.id
WHERE c.name = 'qais1748764610331';
```

#### Option B: Via Prisma Studio
```bash
cd /home/Coding/skripsi/skripsi-admin
npx prisma studio
```
Then navigate to http://localhost:5555 and view the Container table.

### 4. Docker Direct Access
If you need direct Docker access to the container:

```bash
# List all running containers
docker ps

# Find the container by name pattern
docker ps | grep qais1748764610331

# Execute bash in the container
docker exec -it [CONTAINER_ID] bash

# Or access with docker directly
docker exec -it qais1748764610331 bash
```

### 5. Container Management Actions

As an admin, you can perform these actions from the UI:
- **Stop Container**: Click the stop button (⏸️)
- **Start Container**: Click the play button (▶️) 
- **Delete Container**: Click the trash button (🗑️)

## Container Network Details

The containers are typically configured with:
- **Network Mode**: Bridge or custom network
- **Port Mapping**: Host ports mapped to container ports
- **GPU Access**: NVIDIA GPU passthrough using device mapping

## Troubleshooting

### Cannot Connect via SSH
1. Check if container is running: `docker ps`
2. Verify SSH port is correct
3. Check firewall rules: `sudo ufw status`
4. Verify SSH service is running in container

### Cannot Access Jupyter
1. Check if Jupyter is running: `docker logs [CONTAINER_NAME]`
2. Get the Jupyter token: `docker exec [CONTAINER_NAME] jupyter notebook list`
3. Verify port mapping is correct

### GPU Not Available
1. Check NVIDIA drivers: `nvidia-smi`
2. Verify Docker GPU support: `docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi`
3. Check container GPU assignment in database

## Security Notes

1. **Change Default Passwords**: The container passwords should be changed after first access
2. **SSH Keys**: Consider using SSH keys instead of passwords for production
3. **Network Isolation**: Containers should be on isolated networks in production
4. **Resource Limits**: Ensure CPU/RAM/GPU limits are enforced

## API Endpoints for Container Management

The backend provides these endpoints for container management:

```javascript
// Get all containers (admin)
GET /api/v1/containers

// Get specific container
GET /api/v1/containers/:id

// Create new container
POST /api/v1/containers

// Start container
POST /api/v1/containers/:id/start

// Stop container
POST /api/v1/containers/:id/stop

// Delete container
DELETE /api/v1/containers/:id
```

## Example: Creating a New Container via API

```javascript
const createContainer = async () => {
  const response = await fetch('http://localhost:3000/api/v1/containers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
      name: 'test-container',
      imageName: 'jupyter/base-notebook',
      CPU: 2,
      RAM: '4g',
      GPU: '0:0',
      userId: 1
    })
  });
  
  const data = await response.json();
  console.log('Container created:', data);
};
```

## Container Lifecycle

1. **Creation**: User requests container → Admin approves → Container created
2. **Running**: Container active and accessible via SSH/Jupyter
3. **Stopped**: Container exists but not running (can be restarted)
4. **Deleted**: Container removed from system

## Monitoring

Monitor containers using:
- `docker stats` - Real-time resource usage
- `docker logs [CONTAINER_NAME]` - Container logs
- `nvidia-smi` - GPU usage
- Admin dashboard statistics

## Support

For issues with container access, check:
1. Container status in admin panel
2. Docker container status: `docker ps -a`
3. Backend logs: `docker logs skripsi-admin`
4. Database records for container configuration
