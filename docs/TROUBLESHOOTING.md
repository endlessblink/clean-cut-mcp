# Troubleshooting Guide - Clean-Cut-MCP

## Common Issues and Solutions

### Installation Issues

#### Docker Not Found
**Error**: "Docker not installed" or "Docker not accessible"

**Windows Solutions**:
1. Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Enable WSL2 integration in Docker Desktop settings
3. Restart computer after Docker installation

**Linux Solutions**:
```bash
# Install Docker
sudo apt update && sudo apt install docker.io

# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login for changes to take effect
```

#### PowerShell Not Found (Linux/macOS)
**Error**: "pwsh: command not found"

**Linux Solution**:
```bash
curl -sSL https://aka.ms/install-powershell.sh | sudo bash
```

**macOS Solution**:
```bash
brew install powershell
```

#### Claude Desktop Config Corruption
**Error**: "Could not load app settings" in Claude Desktop

**Solution**:
```powershell
# Windows: Restore from backup
Get-ChildItem "$env:APPDATA\Claude" -Filter "*.backup-*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | ForEach-Object { Copy-Item $_.FullName "$env:APPDATA\Claude\claude_desktop_config.json" }

# Or delete corrupted config (Claude Desktop will recreate)
Remove-Item "$env:APPDATA\Claude\claude_desktop_config.json"
```

### Runtime Issues

#### Container Not Running
**Check Status**:
```bash
docker ps | grep clean-cut-mcp
```

**Solutions**:
```bash
# Start stopped container
docker start clean-cut-mcp

# Restart container
docker restart clean-cut-mcp

# If container doesn't exist, re-run installer
.\install.ps1
```

#### Remotion Studio Not Loading
**URL**: http://localhost:6970 shows connection refused

**Solutions**:
1. **Check container**: `docker ps | grep clean-cut-mcp`
2. **Check logs**: `docker logs clean-cut-mcp`
3. **Restart container**: `docker restart clean-cut-mcp`
4. **Wait 30 seconds** for studio to start up

#### Port Conflicts
**Error**: "Port 6970 already in use"

**Solutions**:
```bash
# Find what's using the port
netstat -tulpn | grep 6970

# Kill conflicting process or change port
docker run -p 6971:6970 ... # Use different host port
```

### Claude Desktop Integration Issues

#### MCP Tools Not Available
**Issue**: Claude Desktop doesn't show clean-cut-mcp tools

**Solutions**:
1. **Restart Claude Desktop** completely
2. **Check configuration**:
   ```powershell
   # Windows
   Get-Content "$env:APPDATA\Claude\claude_desktop_config.json"

   # Linux/macOS
   cat ~/.config/Claude/claude_desktop_config.json
   ```
3. **Re-run installer** if config missing
4. **Check container**: `docker exec -i clean-cut-mcp echo "test"`

#### "Request Timed Out" Errors
**Issue**: MCP commands timeout or fail

**Cause**: Missing `-i` flag in Docker exec command

**Solution**: Ensure Claude Desktop config has:
```json
{
  "mcpServers": {
    "clean-cut-mcp": {
      "command": "docker",
      "args": ["exec", "-i", "clean-cut-mcp", "node", "/app/mcp-server/dist/clean-stdio-server.js"]
    }
  }
}
```

### Animation Issues

#### Animation Not Appearing in Studio
**Solutions**:
1. **Refresh Studio**: Press F5 in browser
2. **Check console**: Open browser dev tools for errors
3. **Verify files**: Check `clean-cut-workspace/src/assets/animations/`
4. **Restart Studio**: `docker restart clean-cut-mcp`

#### "Component Not Found" Errors
**Solutions**:
1. **Check file exists**: Verify .tsx file in animations folder
2. **Check Root.tsx**: Ensure component is registered
3. **Restart Studio**: Refresh browser page
4. **Re-create**: Ask Claude to recreate the animation

#### Export Failures
**Solutions**:
1. **Check disk space**: Ensure enough space for video files
2. **Check permissions**: Verify write access to clean-cut-exports/
3. **Try different format**: MP4, GIF, or PNG sequence
4. **Check Studio console**: Look for export error messages

## Advanced Troubleshooting

### Container Debugging
```bash
# View container logs
docker logs clean-cut-mcp

# Access container shell
docker exec -it clean-cut-mcp bash

# Check MCP server manually
docker exec clean-cut-mcp node /app/mcp-server/dist/clean-stdio-server.js
```

### Clean Reinstallation
```bash
# Complete cleanup
docker stop clean-cut-mcp
docker rm clean-cut-mcp
docker rmi endlessblink/clean-cut-mcp:latest

# Remove local directories
rm -rf clean-cut-exports clean-cut-workspace

# Re-run installer
.\install.ps1
```

### Network Issues (Windows)
```powershell
# Check WSL2 networking
wsl hostname -I

# Test WSL2 Docker
wsl docker ps

# Reset WSL2 if needed (requires admin)
wsl --shutdown
# Restart Docker Desktop
```

## Getting Help

### Log Collection
When reporting issues, include:
```bash
# Container logs
docker logs clean-cut-mcp > container.log

# System info
docker --version
# PowerShell version
$PSVersionTable

# Claude Desktop config (remove sensitive info)
# Windows: %APPDATA%\Claude\claude_desktop_config.json
# Linux/macOS: ~/.config/Claude/claude_desktop_config.json
```

### Support Channels
- **GitHub Issues**: [Report bugs](https://github.com/endlessblink/clean-cut-mcp/issues)
- **Discussions**: [Ask questions](https://github.com/endlessblink/clean-cut-mcp/discussions)

### Common Error Messages
- **"Container not accessible"** → Check Docker is running
- **"Could not load app settings"** → Claude Desktop config corruption
- **"Request timed out"** → Missing `-i` flag in MCP config
- **"Component not found"** → Animation file or registration issue
- **"Port already in use"** → Port conflict with other services