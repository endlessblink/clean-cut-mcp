# Clean-Cut-MCP Separated Architecture

This document describes the separated container architecture for Clean-Cut-MCP, which provides improved scalability, maintainability, and resource utilization compared to the monolithic approach.

## Architecture Overview

### Before (Monolithic)
```
┌─────────────────────────────────────┐
│        clean-cut-mcp container       │
│  ┌─────────────────────────────────┐ │
│  │      MCP Server (STDIO)         │ │
│  │   - Port 6971                   │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │      Remotion Studio            │ │
│  │   - Port 6970                   │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### After (Separated)
```
┌─────────────────┐    ┌─────────────────┐
│  mcp-server     │    │   web-app       │
│  container      │    │   container     │
│                 │    │                 │
│ • MCP Server    │    │ • Remotion      │
│ • Validation    │    │   Studio        │
│ • Claude API    │    │ • Web UI        │
│ • Port 6971     │    │ • Port 6970     │
│                 │    │ • Rendering     │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
    ┌─────────────────────────────────┐
    │        Shared Resources         │
    │   • clean-cut-workspace volume │
    │   • clean-cut-exports volume   │
    │   • Docker network             │
    └─────────────────────────────────┘
```

## Benefits of Separation

### 1. **Improved Resource Management**
- **MCP Server**: Lightweight (256MB RAM, 0.5 CPU)
- **Web App**: Heavy (2GB RAM, 2+ CPU for video rendering)
- Each container gets appropriate resources

### 2. **Independent Scaling**
- Restart MCP server without affecting web interface
- Update web app without breaking Claude Desktop integration
- Scale containers independently based on usage patterns

### 3. **Enhanced Security**
- Isolated network policies per container
- Read-only volume mounts where appropriate
- Reduced attack surface

### 4. **Simplified Development**
- Debug MCP server issues without web app complexity
- Update Remotion Studio independently
- Clear separation of concerns

### 5. **Better Monitoring**
- Separate health checks for each service
- Individual log streams
- Per-container metrics

## Container Responsibilities

### MCP Server Container
**Purpose**: Pure MCP functionality and animation management

**Key Features**:
- Claude Desktop integration (STDIO transport)
- Animation validation system
- File system operations (create/update/delete animations)
- Root.tsx synchronization
- Learning system (user preferences)
- Health check endpoint

**Resource Profile**: Lightweight
- Memory: 256MB - 512MB
- CPU: 0.25 - 0.5 cores
- Storage: Minimal (preferences and learned rules)

### Web App Container
**Purpose**: Remotion Studio and visual interface

**Key Features**:
- Remotion Studio web interface
- Real-time animation preview
- Video rendering pipeline
- Hot reload for development
- Asset management
- Export functionality

**Resource Profile**: Heavy
- Memory: 1GB - 2GB
- CPU: 1 - 2+ cores
- Storage: Workspace and export volumes

## File Structure

```
clean-cut-mcp/
├── docker-compose.yml              # Original monolithic setup (preserved)
├── docker-compose.separated.yml    # New separated setup
├── SEPARATED-ARCHITECTURE.md       # This file
├── scripts/
│   ├── migrate-to-separated.sh     # Migration script
│   └── rollback.sh                 # Rollback script
├── mcp-server-separated/           # MCP server container
│   ├── Dockerfile
│   └── start-mcp-server.js
├── web-app-separated/              # Web app container
│   ├── Dockerfile
│   └── start-web-app.js
├── clean-cut-workspace/            # Shared workspace volume
├── clean-cut-exports/              # Shared exports volume
└── mcp-server/                     # Original MCP source code
```

## Migration Guide

### Quick Migration

1. **Backup Current Setup** (automated):
   ```bash
   ./scripts/migrate-to-separated.sh
   ```

2. **Verify Migration**:
   - Check MCP server: http://localhost:6971/health
   - Check Web App: http://localhost:6970
   - Test Claude Desktop integration

3. **Rollback if Needed**:
   ```bash
   ./scripts/rollback.sh
   ```

### Manual Migration Steps

1. **Build Separated Containers**:
   ```bash
   docker-compose -f docker-compose.separated.yml build
   ```

2. **Start Separated Containers**:
   ```bash
   docker-compose -f docker-compose.separated.yml up -d
   ```

3. **Stop Original Container**:
   ```bash
   docker-compose down
   ```

4. **Verify Functionality**:
   ```bash
   curl http://localhost:6971/health  # MCP server
   curl http://localhost:6970/        # Web app
   ```

## Communication Architecture

### File-Based Communication
The containers communicate through shared files in the workspace volume:

1. **Animation Creation**:
   - MCP server writes animation files to `/workspace/src/assets/animations/`
   - Web app detects changes via file watching
   - Remotion Studio automatically reloads

2. **Configuration Updates**:
   - MCP server updates Root.tsx
   - Web app reflects changes immediately

3. **Export Operations**:
   - Web app renders videos to `/workspace/out/`
   - Both containers access export directory

### Health Check Endpoints

**MCP Server** (`http://localhost:6971/health`):
```json
{
  "status": "healthy",
  "service": "mcp-server",
  "timestamp": "2025-11-05T10:30:00.000Z",
  "workspace": "/workspace",
  "ports": {
    "mcp": 6971,
    "studio": 6970
  }
}
```

**Web App** (`http://localhost:6970/`):
- Remotion Studio interface
- Automatically redirects from health check

## Volume Management

### Shared Volumes

1. **clean-cut-workspace**:
   - Animation source files
   - Components and utilities
   - Configuration files
   - Access: Read/Write for both containers

2. **clean-cut-exports**:
   - Rendered video files
   - Temporary assets
   - Access: Read/Write for both containers

3. **clean-cut-mcp-data**:
   - MCP preferences and learned rules
   - User customization data
   - Access: MCP server only

### Volume Mounts

**MCP Server**:
```yaml
volumes:
  - ./clean-cut-workspace:/workspace
  - ./clean-cut-exports:/workspace/out
  - clean-cut-mcp-data:/app/mcp-server/preferences
```

**Web App**:
```yaml
volumes:
  - ./clean-cut-workspace:/workspace:ro  # Read-only for safety
  - ./clean-cut-exports:/workspace/out
  - clean-cut-web-modules:/workspace/node_modules
```

## Network Configuration

### Docker Network
- **Name**: `clean-cut-mcp-network`
- **Type**: Bridge network
- **Purpose**: Inter-container communication

### Port Mappings
- **6971**: MCP server health checks (STDIO still primary)
- **6970**: Remotion Studio web interface

### Service Discovery
- **mcp-server**: Accessible as hostname `mcp-server` from web app
- **web-app**: Accessible as hostname `web-app` from MCP server

## Environment Variables

### MCP Server Container
```bash
NODE_ENV=production
DOCKER_CONTAINER=true
CONTAINER_ROLE=mcp-server
MCP_SERVER_PORT=6971
REMOTION_STUDIO_PORT=6970
WORKSPACE_DIR=/workspace
```

### Web App Container
```bash
NODE_ENV=production
DOCKER_CONTAINER=true
CONTAINER_ROLE=web-app
REMOTION_STUDIO_PORT=6970
REMOTION_OUTPUT_DIR=/workspace/out
REMOTION_NON_INTERACTIVE=1
WORKSPACE_DIR=/workspace
```

## Health Checks

### MCP Server Health Check
- **Endpoint**: `http://localhost:6971/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 5
- **Start Period**: 60 seconds

### Web App Health Check
- **Endpoint**: `http://localhost:6970/`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 5
- **Start Period**: 60 seconds

## Resource Limits

### MCP Server
```yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

### Web App
```yaml
deploy:
  resources:
    limits:
      memory: 2G
      cpus: '2.0'
    reservations:
      memory: 1G
      cpus: '1.0'
```

## Troubleshooting

### Common Issues

1. **Container Won't Start**:
   ```bash
   # Check logs
   docker-compose -f docker-compose.separated.yml logs mcp-server
   docker-compose -f docker-compose.separated.yml logs web-app

   # Check volume mounts
   docker exec clean-cut-mcp-server ls -la /workspace
   docker exec clean-cut-web-app ls -la /workspace
   ```

2. **Health Checks Failing**:
   ```bash
   # Manual health check
   curl http://localhost:6971/health
   curl http://localhost:6970/

   # Check container status
   docker ps --format "table {{.Names}}\t{{.Status}}"
   ```

3. **File Access Issues**:
   ```bash
   # Check permissions
   ls -la clean-cut-workspace/
   ls -la clean-cut-exports/

   # Fix permissions if needed
   sudo chown -R $USER:$USER clean-cut-workspace/
   sudo chown -R $USER:$USER clean-cut-exports/
   ```

4. **MCP Server Not Responding**:
   ```bash
   # Check if MCP server is running
   docker exec clean-cut-mcp-server ps aux | grep node

   # Restart MCP server
   docker restart clean-cut-mcp-server
   ```

### Performance Monitoring

1. **Resource Usage**:
   ```bash
   # Monitor container resources
   docker stats clean-cut-mcp-server clean-cut-web-app
   ```

2. **Log Monitoring**:
   ```bash
   # Follow logs in real-time
   docker-compose -f docker-compose.separated.yml logs -f
   ```

3. **Network Connectivity**:
   ```bash
   # Test inter-container communication
   docker exec clean-cut-web-app curl http://mcp-server:6971/health
   ```

## Development Workflow

### Local Development

1. **Make Changes**:
   - Update MCP server: Edit files in `mcp-server/src/`
   - Update web app: Edit files in `clean-cut-workspace/src/`

2. **Rebuild Containers**:
   ```bash
   docker-compose -f docker-compose.separated.yml build
   docker-compose -f docker-compose.separated.yml up -d
   ```

3. **Test Changes**:
   - MCP tools via Claude Desktop
   - Web interface via http://localhost:6970

### Debugging

1. **Container Shell Access**:
   ```bash
   docker exec -it clean-cut-mcp-server sh
   docker exec -it clean-cut-web-app sh
   ```

2. **Log Analysis**:
   ```bash
   # MCP server logs
   docker logs clean-cut-mcp-server -f

   # Web app logs
   docker logs clean-cut-web-app -f
   ```

## Migration Back to Monolithic

If needed, you can easily migrate back to the monolithic setup:

```bash
# Automatic rollback
./scripts/rollback.sh

# Or manual rollback
docker-compose -f docker-compose.separated.yml down
docker-compose up -d
```

## Future Enhancements

### Planned Improvements

1. **Advanced Monitoring**:
   - Prometheus metrics collection
   - Grafana dashboards
   - Alert management

2. **Enhanced Security**:
   - Network policies
   - Secrets management
   - Container scanning

3. **Performance Optimization**:
   - Container caching strategies
   - GPU acceleration for rendering
   - Load balancing for scaling

4. **Multi-Environment Support**:
   - Development/Testing/Production configurations
   - Environment variable management
   - CI/CD integration

## Support

### Getting Help

1. **Documentation**: Check this file and `docs/prd-container-separation.md`
2. **Issues**: Report problems on GitHub
3. **Rollback**: Use `./scripts/rollback.sh` if needed
4. **Community**: Join discussions for tips and troubleshooting

### Contributing

Contributions are welcome! Please:
1. Test changes in separated architecture
2. Update documentation
3. Maintain backward compatibility
4. Follow the existing code style