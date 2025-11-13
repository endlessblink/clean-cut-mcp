# Clean-Cut-MCP Deployment Guide

## Current Setup Status

### ✅ Working Components

**MCP Server Container:**
- **Name**: `clean-cut-mcp`
- **Status**: Running healthy for 2+ days
- **Image**: `clean-cut-mcp-clean-cut-mcp:latest`
- **Ports**:
  - 6970 → Remotion Studio
  - 6971 → MCP Server (STDIO mode)
- **Process**: `node /app/mcp-server/dist/clean-stdio-server.js`

**Animation System:**
- **20+ Animation Components** Ready for use
- **Remotion Studio**: Accessible at `http://localhost:6970`
- **Export Directory**: `./clean-cut-exports/` (5 videos created)
- **Workspace Directory**: `./clean-cut-workspace/` (source code)

**Available MCP Tools:**
1. `create_animation` - Create new animations
2. `update_composition` - Modify existing animations
3. `get_studio_url` - Get Remotion Studio URL
4. `get_export_directory` - Get export path
5. `list_existing_components` - List all animations
6. `get_project_guidelines` - Animation guidelines
7. `rebuild_compositions` - Rebuild all
8. `format_code` - Format animation code
9. `manage_props` - Manage animation properties
10. `auto_sync` - Auto-sync changes
11. `delete_component` - Remove animations
12. `cleanup_broken_imports` - Fix imports
13. `upload_asset` - Upload assets
14. `list_assets` - List assets
15. `delete_asset` - Remove assets

**Existing Animations:**
- AllGasNoBrakesAnimation
- ChatBubbleAnimation
- FloatingOrbs
- GitHubProfileShowcaseEnhanced
- KineticText
- PacmanGameImproved
- SocialMediaFeed
- And 13 more...

## Architecture

### Current Configuration
```
┌─────────────────────────────────────┐
│        clean-cut-mcp container       │
│  ┌─────────────────────────────────┐ │
│  │      MCP Server (STDIO)         │ │
│  │   - 15+ MCP Tools               │ │
│  │   - Session Isolation           │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │      Remotion Studio            │ │
│  │   - Port 6970                   │ │
│  │   - Visual Editor               │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │    Animation Workspace          │ │
│  │   - 20+ Components              │ │
│  │   - Real-time Sync              │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
         ↓                    ↓
┌─────────────────┐    ┌─────────────────┐
│   Export Dir    │    │   Host System   │
│ clean-cut-      │    │ Port 6970/6971  │
│ exports/        │    │                 │
└─────────────────┘    └─────────────────┘
```

## Deployment Options

### 1. Current Local Setup ✅
- **Docker Container**: Single container solution
- **Persistence**: Local volume mounts
- **Access**: localhost ports
- **Multi-session**: Supports multiple Claude instances

### 2. Cloud Hosting Options

#### AWS ECS/EKS
- **Container Registry**: ECR
- **Load Balancer**: ALB for ports 6970/6971
- **Storage**: EFS for workspace persistence
- **Networking**: VPC with security groups
- **Scaling**: ECS service auto-scaling

#### Google Cloud Run
- **Container**: Cloud Run service
- **Storage**: Cloud Filestore or Persistent Disk
- **Networking**: Cloud Load Balancing
- **Scaling**: Instance-based scaling
- **Security**: IAM and VPC

#### Azure Container Instances
- **Container**: ACI with Azure Container Registry
- **Storage**: Azure Files
- **Networking**: Azure Load Balancer
- **Scaling**: Manual or container groups
- **Security**: Azure AD and VNet

#### DigitalOcean App Platform
- **Container**: App Platform with Docker
- **Storage**: Persistent Disk
- **Networking**: Load Balancer included
- **Scaling**: Basic scaling options
- **Simplicity**: Managed solution

#### Railway/Render
- **Container**: Docker deployment
- **Storage**: Persistent volume
- **Networking**: Automatic domain
- **Scaling**: Basic auto-scaling
- **Ease of Use**: Developer-friendly

## Deployment Requirements

### System Requirements
- **CPU**: 2+ cores recommended
- **Memory**: 4GB+ RAM
- **Storage**: 20GB+ persistent
- **Network**: Open ports 6970, 6971

### Environment Variables
```bash
NODE_ENV=production
DOCKER_CONTAINER=true
REMOTION_STUDIO_PORT=6970
WORKSPACE_DIR=/workspace
MCP_SERVER_PORT=6971
CHOKIDAR_USEPOLLING=true
```

### Volume Mounts
```yaml
volumes:
  - ./clean-cut-exports:/workspace/out
  - ./clean-cut-workspace:/workspace
  - clean-cut-node-modules:/workspace/node_modules
```

## Security Considerations

### Network Security
- **Port 6970**: Remotion Studio (HTTPS recommended for production)
- **Port 6971**: MCP Server (Internal access only)
- **Firewall**: Restrict access as needed
- **SSL/TLS**: Configure HTTPS for production

### Container Security
- **Non-root user**: Configure if possible
- **Resource limits**: Set CPU/memory limits
- **Health checks**: Container health monitoring
- **Image scanning**: Regular security scans

### Data Security
- **Backup**: Regular export directory backups
- **Access control**: User authentication if needed
- **Data retention**: Cleanup policies for exports
- **Encryption**: At-rest encryption for sensitive content

## Monitoring & Maintenance

### Health Monitoring
- **Container health**: Docker health checks
- **Service monitoring**: Port availability
- **Resource monitoring**: CPU, memory, storage
- **Error tracking**: Log aggregation

### Backup Strategy
- **Code backups**: Workspace directory
- **Export backups**: Rendered videos
- **Configuration**: MCP settings and templates
- **Disaster recovery**: Container recreation

### Updates & Maintenance
- **Image updates**: Pull latest container
- **Template updates**: Add new animation templates
- **Security patches**: Regular dependency updates
- **Performance tuning**: Resource optimization

## Usage Examples

### Basic Animation Creation
```bash
# Connect to MCP server
docker exec -i clean-cut-mcp node /app/mcp-server/dist/clean-stdio-server.js

# Create animation via JSON-RPC
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"create_animation","arguments":{...}}}
```

### Access Remotion Studio
```bash
# Open in browser
http://localhost:6970

# Or get URL via MCP
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_studio_url","arguments":{}}}
```

### Export Videos
```bash
# Videos exported to clean-cut-exports/
ls -la clean-cut-exports/
```

## Next Steps

1. **Choose hosting platform** based on requirements
2. **Set up container registry** for custom images
3. **Configure persistent storage** for workspace
4. **Set up load balancer** for port access
5. **Configure monitoring** and alerts
6. **Test deployment** with staging environment
7. **Migrate existing animations** to new setup
8. **Configure backup** and disaster recovery