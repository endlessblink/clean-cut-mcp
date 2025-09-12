# Docker Port Fix Documentation

## Problem Solved
**Issue**: Docker port allocation conflicts preventing container startup
- Error: `"Bind for 0.0.0.0:6960 failed: port is already allocated"`
- **Root Cause**: Zombie containers from previous sessions holding ports
- **Impact**: Complete system failure, Claude Desktop integration broken

## Solution Applied

### 1. Port Migration
**Changed from conflicted ports to stable ports:**
- **OLD**: 6960 (Studio), 6961 (MCP) 
- **NEW**: 6970 (Studio), 6971 (MCP)

### 2. Files Modified

#### `Dockerfile`
```dockerfile
# OLD
ENV REMOTION_STUDIO_PORT=6960 \
    MCP_SERVER_PORT=6961
EXPOSE 6960 6961
HEALTHCHECK CMD curl -fsS http://localhost:6961/health || exit 1

# NEW  
ENV REMOTION_STUDIO_PORT=6970 \
    MCP_SERVER_PORT=6971
EXPOSE 6970 6971
HEALTHCHECK CMD curl -fsS http://localhost:6971/health || exit 1
```

#### `start-clean-cut.sh` (Created)
```bash
#!/bin/bash
# Robust container management with port checking
REMOTION_PORT=6970
MCP_PORT=6971

# Port availability checking
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Port $port is already in use"
        return 1
    fi
    return 0
}

# Container cleanup and startup with validation
```

#### `stop-clean-cut.sh` (Created)
```bash
#!/bin/bash
# Safe container shutdown and cleanup
CONTAINER_NAME="clean-cut-mcp"

# Stop and remove containers
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true
```

### 3. Port Mapping Architecture
```
Host System → Docker Container
6970 (Host) → 6970 (Container) [Remotion Studio]
6971 (Host) → 6961 (Container) [MCP Server Internal]
```

**Why this mapping?**
- **6970→6970**: Direct mapping for Remotion Studio (simplicity)
- **6971→6961**: External 6971 maps to internal 6961 (flexibility)
- **Avoids conflicts**: Moved away from commonly used 6960/6961

### 4. Container Management Improvements
- **Pre-flight checks**: Port availability verification before startup
- **Zombie cleanup**: Automatic removal of conflicted containers  
- **Health validation**: Service connectivity testing
- **Graceful shutdown**: Proper container lifecycle management

## Claude Desktop Integration Fix

### Critical Discovery
**HTTP transport doesn't work** - Claude Desktop requires **STDIO transport**

### Working Configuration
```json
{
  "mcpServers": {
    "clean-cut-mcp": {
      "command": "docker", 
      "args": ["exec", "-i", "clean-cut-mcp", "node", "/app/mcp-server/dist/stdio-bridge.js"],
      "env": {}
    }
  }
}
```

### STDIO Bridge Implementation
- **File**: `mcp-server/src/stdio-bridge.ts` (already existed)
- **Purpose**: Provides proper STDIO interface for Claude Desktop
- **Compiled**: `/app/mcp-server/dist/stdio-bridge.js` in container
- **Transport**: Direct STDIO communication (no HTTP layer)

## Testing Results

### Port Connectivity ✅
```bash
curl -fsS http://localhost:6971/health
# {"status":"healthy","service":"clean-cut-mcp","version":"1.0.0"}

curl -I http://localhost:6970  
# HTTP/1.1 200 OK (Remotion Studio)
```

### Container Health ✅
```bash
docker ps --filter "name=clean-cut-mcp"
# Shows: 0.0.0.0:6970->6970/tcp, 0.0.0.0:6971->6961/tcp
```

### STDIO Bridge ✅
```bash
docker exec clean-cut-mcp node /app/mcp-server/dist/stdio-bridge.js
# [STDIO-BRIDGE] Clean-Cut-MCP ready for Claude Desktop!
# [STDIO-BRIDGE] MCP server listening for requests...
```

## Prevention Measures

### Robust Scripts
- **`./start-clean-cut.sh`**: Prevents future port conflicts
- **`./stop-clean-cut.sh`**: Ensures clean shutdown
- **Health checks**: Verify services before declaring success

### Monitoring
```bash
# Check container status
docker ps --filter "name=clean-cut-mcp" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Verify port usage
lsof -Pi :6970-6971 -sTCP:LISTEN

# Test endpoints
curl -fsS http://localhost:6971/health && echo "MCP OK"
curl -I http://localhost:6970 && echo "Studio OK"
```

## Summary
1. **Root Cause**: Zombie containers holding ports 6960/6961
2. **Solution**: Migration to stable ports 6970/6971 with robust management
3. **Claude Desktop**: Requires STDIO transport, not HTTP (critical discovery)
4. **Prevention**: Automated cleanup scripts prevent recurrence
5. **Status**: ✅ **Fully Operational** - Ready for Claude Desktop integration

**Next Step**: Use the working STDIO configuration for actual Claude Desktop testing