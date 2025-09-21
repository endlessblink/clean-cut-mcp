# Clean-Cut-MCP Installation Instructions

## 🎯 One-Click Installation

**Requirements:**
- Windows with WSL2 installed
- Docker Desktop running
- Claude Desktop installed

**Installation Steps:**
1. **Download project**: `git clone https://github.com/endlessblink/clean-cut-mcp.git`
2. **Run installer**: Right-click `install.ps1` → "Run with PowerShell"
3. **Wait for completion**: Script handles everything automatically
4. **Restart Claude Desktop**: Close and reopen Claude Desktop
5. **Test**: Ask Claude to "Create a bouncing ball animation"

## ✅ What You Get

- **Remotion Studio**: http://localhost:6970 (video editing interface)
- **Claude Desktop Integration**: MCP tools for AI animation creation
- **Automatic Sync**: Animations appear immediately in Studio
- **Video Export**: Rendered videos in `./clean-cut-exports/` folder

## 🛠️ Manual Installation (Alternative)

If the PowerShell installer doesn't work:

```bash
# 1. Clone and navigate
git clone https://github.com/endlessblink/clean-cut-mcp.git
cd clean-cut-mcp

# 2. Start container
docker-compose up -d

# 3. Configure Claude Desktop
# Add to %APPDATA%\Claude\claude_desktop_config.json:
{
  "mcpServers": {
    "clean-cut-mcp": {
      "command": "docker",
      "args": ["exec", "clean-cut-mcp", "node", "/app/mcp-server/dist/clean-stdio-server.js"]
    }
  }
}

# 4. Restart Claude Desktop
```

## 🔧 Troubleshooting

**Studio not accessible:**
- Ensure Docker Desktop is running
- Check ports 6970-6971 aren't blocked
- Run: `docker-compose restart`

**Claude Desktop can't connect:**
- Restart Claude Desktop after configuration
- Check container is running: `docker ps | grep clean-cut-mcp`
- Verify config file syntax is valid JSON

**Animations don't appear:**
- Studio auto-updates with webpack polling enabled
- Check browser console at http://localhost:6970 for errors
- Container includes automatic sync fixes

## 📋 Success Validation

After installation, test these features:
- ✅ Ask Claude: "Create a simple bouncing ball animation"
- ✅ Check animation appears in Studio: http://localhost:6970
- ✅ Export video from Studio interface
- ✅ Find exported video in `./clean-cut-exports/` folder
- ✅ Delete animation via Claude: "Delete the bouncing ball animation"
- ✅ Verify animation disappears from Studio automatically

**All operations should work without manual intervention!**