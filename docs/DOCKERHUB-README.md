# Clean-Cut-MCP - Docker Hub Installation

> **One-Script Magic**: Create Remotion animations in Claude Desktop with zero setup time

## 🚀 Quick Install (Docker Hub)

**Requirements**: Only Docker Desktop

### Windows/PowerShell:
```powershell
# Download installer
curl -o install-dockerhub.ps1 https://raw.githubusercontent.com/endlessblink/clean-cut-mcp/master/install-dockerhub.ps1

# Run installer
.\install-dockerhub.ps1
```

### macOS/Linux:
```bash
# One-line install
docker run -d --name clean-cut-mcp --restart unless-stopped -p 6960:6960 -p 6961:6961 -v clean-cut-exports:/workspace/out endlessblink/clean-cut-mcp:latest

# Configure Claude Desktop (manual)
# Add to ~/.config/Claude/claude_desktop_config.json:
{
  "mcpServers": {
    "clean-cut-mcp": {
      "command": "sh",
      "args": ["-c", "curl -X POST -H \"Content-Type: application/json\" -d @- http://localhost:6961/mcp"]
    }
  }
}
```

### Manual Docker Run:
```bash
docker run -d \
  --name clean-cut-mcp \
  --restart unless-stopped \
  -p 6960:6960 \
  -p 6961:6961 \
  -v clean-cut-exports:/workspace/out \
  endlessblink/clean-cut-mcp:latest
```

## ✅ Test Your Installation

1. **Restart Claude Desktop**
2. **Ask Claude**: "Create a bouncing ball animation"
3. **Expect Response**: "Animation ready at http://localhost:6960"

## 🎯 Why Docker Hub > Git Install?

| Feature | Docker Hub | Git Install |
|---------|------------|-------------|
| **Setup Time** | 30 seconds | 3-5 minutes |
| **Prerequisites** | Docker only | Git + Docker + Build tools |
| **Build Time** | Zero (pre-built) | 2-3 minutes |
| **Version Consistency** | ✅ Locked | ❌ Source changes |
| **VM Testing** | ✅ Perfect | ❌ Complex |
| **Offline Capable** | ✅ After first pull | ❌ Requires Git |

## 📊 Available Versions

- `latest` - Most recent stable build
- `v4.5.10` - Specific version (recommended for production)
- `dev` - Development builds
- `experimental` - Bleeding edge features

```bash
# Install specific version
docker run -d --name clean-cut-mcp -p 6960:6960 -p 6961:6961 -v clean-cut-exports:/workspace/out endlessblink/clean-cut-mcp:v4.5.10
```

## 🛠️ Available Tools

Once installed, Claude Desktop gains these MCP tools:

- **`create_animation`** - Generate bouncing ball, sliding text, rotating objects
- **`list_animations`** - View all available animations
- **`get_studio_url`** - Get Remotion Studio URL
- **`get_export_directory`** - Access rendered videos
- **`open_export_directory`** - Open exports in file manager

## 🎬 Example Usage

```
User: "Create a bouncing ball animation"
Claude: "I'll create a bouncing ball animation for you using the Clean-Cut-MCP tools."
[Creates animation]
Claude: "✅ Animation ready at http://localhost:6960"
```

## 🔧 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs clean-cut-mcp

# Restart container
docker restart clean-cut-mcp
```

### Port Conflicts
```bash
# Use different ports
docker run -d --name clean-cut-mcp -p 7960:6960 -p 7961:6961 endlessblink/clean-cut-mcp:latest
# Update Claude config to use localhost:7961
```

### Claude Desktop Not Connecting
1. Restart Claude Desktop after installation
2. Check container is running: `docker ps`
3. Test MCP endpoint: `curl http://localhost:6961/health`

## 📁 Export Location

Videos are exported to Docker volume `clean-cut-exports`:

```bash
# List exported videos
docker run --rm -v clean-cut-exports:/data alpine ls -la /data

# Copy video to current directory
docker run --rm -v clean-cut-exports:/data -v $(pwd):/host alpine cp /data/video.mp4 /host/
```

## 🔄 Updates

```bash
# Update to latest version
docker pull endlessblink/clean-cut-mcp:latest
docker stop clean-cut-mcp
docker rm clean-cut-mcp
docker run -d --name clean-cut-mcp --restart unless-stopped -p 6960:6960 -p 6961:6961 -v clean-cut-exports:/workspace/out endlessblink/clean-cut-mcp:latest
```

## 📖 Links

- **Docker Hub**: https://hub.docker.com/r/endlessblink/clean-cut-mcp
- **GitHub**: https://github.com/endlessblink/clean-cut-mcp
- **Remotion Docs**: https://remotion.dev
- **Claude Desktop**: https://claude.ai/desktop

---

**Perfect for**: VM testing, production deployments, team consistency, quick demos