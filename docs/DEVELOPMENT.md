# Development Guide - Clean-Cut-MCP

## Project Architecture

### Core Components
- **Container**: Docker image with Remotion Studio + MCP server
- **MCP Server**: STDIO transport for Claude Desktop integration
- **Installers**: Platform-specific PowerShell scripts
- **Animation System**: React/Remotion components with auto-sync

### File Structure
```
clean-cut-mcp/
├── install.ps1                    # Linux/macOS installer
├── install-windows.ps1            # Windows installer (PowerShell 5.1)
├── download-latest.sh             # API-based cache bypass
├── Dockerfile                     # Container build definition
├── docker-compose.yml             # Alternative setup method
├── start.js                       # Container entrypoint
├── cleanup-service.js             # Background cleanup service
├── package.json                   # Node.js dependencies
├── mcp-server/                    # MCP server source code
│   ├── src/                       # TypeScript source
│   └── dist/                      # Built JavaScript
├── claude-dev-guidelines/         # Animation guides (MCP dependency)
├── docs/                          # Documentation
└── utils/                         # Development utilities
```

## Development Setup

### Local Development
```bash
# Clone repository
git clone https://github.com/endlessblink/clean-cut-mcp.git
cd clean-cut-mcp

# Build and test locally
docker build -t clean-cut-dev .
docker run -d --name clean-cut-dev -p 6970:6970 -p 6971:6971 clean-cut-dev

# Development with live reload
docker-compose up -d
```

### MCP Server Development
```bash
# Navigate to MCP server
cd mcp-server/

# Install dependencies
npm install

# Build TypeScript
npm run build

# Test STDIO transport
node dist/clean-stdio-server.js
```

## Key Dependencies

### Runtime Dependencies (Critical)
- **claude-dev-guidelines/**: MCP server hardcoded dependency
- **cleanup-service.js**: Background service for animation cleanup
- **start.js**: Container initialization and service management
- **.prettierrc**: Required for Remotion Studio component deletion

### Build Dependencies
- **setup-universal.js**: npm postinstall script
- **validate-package.js**: npm validate script
- **Dockerfile**: Container build process
- **package.json**: Node.js dependencies and scripts

## Testing

### Container Testing
```bash
# Build test
docker build -t clean-cut-test .

# Runtime test
docker run --rm clean-cut-test node /app/mcp-server/dist/clean-stdio-server.js --help

# Full integration test
./utils/test-auto-sync.js
```

### Installer Testing
```bash
# Linux/macOS
pwsh ./install.ps1

# Windows (from PowerShell)
.\install-windows.ps1

# Test with debug mode
$env:DEBUG_INSTALLER = "1"
.\install-windows.ps1
```

## Contributing

### Adding New MCP Tools
1. **Edit**: `mcp-server/src/clean-stdio-server.ts`
2. **Add tool definition** to tools array
3. **Implement handler** function
4. **Build**: `npm run build`
5. **Test**: Rebuild container and test with Claude Desktop

### Adding Animation Templates
1. **Create**: Animation in `claude-dev-guidelines/`
2. **Document**: Add to animation patterns
3. **Test**: Verify MCP server can access guidelines
4. **Update**: Documentation with new animation type

### Platform Support
- **Windows**: PowerShell 5.1 compatibility required
- **Linux**: PowerShell Core support
- **macOS**: PowerShell Core + Docker Desktop

## Release Process

### Version Updates
1. **Update version** in package.json
2. **Test installers** on all platforms
3. **Update documentation**
4. **Create GitHub release** with installer assets
5. **Update Docker Hub** image

### Docker Hub Publishing
```bash
# Build and tag
docker build -t endlessblink/clean-cut-mcp:latest .
docker build -t endlessblink/clean-cut-mcp:v2.1.0 .

# Push to Docker Hub
docker push endlessblink/clean-cut-mcp:latest
docker push endlessblink/clean-cut-mcp:v2.1.0
```

## Known Limitations

### PowerShell Compatibility
- **Windows**: Must use emoji-free installer for PowerShell 5.1
- **Unicode issues**: Windows PowerShell 5.1 fails on Unicode characters
- **Scope issues**: Variable expansion problems in downloaded scripts

### Docker Requirements
- **WSL2**: Required on Windows (Docker Desktop handles automatically)
- **Port conflicts**: Requires ports 6970-6971 to be available
- **Volume mounts**: Requires Docker volume mount support

### Claude Desktop Integration
- **STDIO transport**: Requires `-i` flag for Docker exec
- **Configuration**: Must preserve existing MCP servers
- **Restart required**: After configuration changes

## Security Considerations

- **Docker container**: Runs with limited privileges
- **File access**: Limited to workspace directories
- **Network**: Only local ports exposed
- **Configuration**: Automatic backups prevent data loss

## Performance Optimization

- **Container size**: ~2.7GB (optimized with multi-stage build)
- **Startup time**: ~30 seconds for full initialization
- **Memory usage**: ~500MB typical usage
- **Build time**: ~5 minutes on typical hardware