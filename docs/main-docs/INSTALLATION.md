# Installation Guide - Clean-Cut-MCP

## Quick Installation

### Windows
```powershell
# Download Windows installer (PowerShell 5.1 compatible)
iwr "https://github.com/endlessblink/clean-cut-mcp/releases/latest/download/install-windows.ps1" -o "install.ps1"

# Run installer (includes automatic backup system)
.\install.ps1
```

### Linux/macOS
```bash
# Download Linux/macOS installer (PowerShell Core)
curl -L -o install.ps1 "https://github.com/endlessblink/clean-cut-mcp/releases/latest/download/install.ps1"

# Run installer
pwsh ./install.ps1
```

## Prerequisites by Platform

### Windows Requirements
- **Docker Desktop** → [Download](https://www.docker.com/products/docker-desktop/)
- **WSL2 enabled** → [Guide](https://docs.microsoft.com/en-us/windows/wsl/install) (Docker Desktop enables automatically)
- **PowerShell** (built-in on Windows 10/11)
- **No admin privileges** required for installation

### Linux Requirements
- **Docker** → [Install Guide](https://docs.docker.com/engine/install/)
- **PowerShell Core** → [Install Guide](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-linux)
- **User in docker group**: `sudo usermod -aG docker $USER`

### macOS Requirements
- **Docker Desktop** → [Download](https://www.docker.com/products/docker-desktop/)
- **PowerShell Core** → [Install Guide](https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-macos)
- **Homebrew** (recommended) → [Install](https://brew.sh/)

## What the Installer Does

1. **System Check** - Verifies Docker and PowerShell are available
2. **Container Setup** - Downloads and starts clean-cut-mcp container
3. **Port Configuration** - Configures localhost:6970 for Remotion Studio
4. **Claude Desktop Integration** - Adds MCP server configuration automatically
5. **Directory Creation** - Creates clean-cut-exports/ and clean-cut-workspace/
6. **Backup System** (Windows) - Creates config backups before changes

## After Installation

- **Remotion Studio**: http://localhost:6970
- **Video Exports**: `./clean-cut-exports/` directory
- **Claude Desktop**: clean-cut-mcp tools available
- **Container**: Runs automatically with restart policy

## Verification

```bash
# Check container is running
docker ps | grep clean-cut-mcp

# Test Remotion Studio
# Open: http://localhost:6970

# Test Claude Desktop
# Ask: "Create a bouncing ball animation"
```

## Alternative: Manual Docker Setup

If installers don't work, you can run manually:

```bash
# Pull and start container
docker run -d --name clean-cut-mcp \
  --restart unless-stopped \
  -p 6970:6970 -p 6971:6971 \
  -v ./clean-cut-exports:/workspace/out \
  -v ./clean-cut-workspace:/workspace \
  endlessblink/clean-cut-mcp:latest

# Add to Claude Desktop config manually:
{
  "mcpServers": {
    "clean-cut-mcp": {
      "command": "docker",
      "args": ["exec", "-i", "clean-cut-mcp", "node", "/app/mcp-server/dist/clean-stdio-server.js"]
    }
  }
}
```

## Next Steps

- **User Guide** → [docs/USER-GUIDE.md](USER-GUIDE.md)
- **Troubleshooting** → [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Development** → [docs/DEVELOPMENT.md](DEVELOPMENT.md)