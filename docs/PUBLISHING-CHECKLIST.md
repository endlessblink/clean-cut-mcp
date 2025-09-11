# Clean-Cut-MCP Publishing Checklist

## 🚀 **Pre-Publishing Validation**

### **1. Package Structure Validation**
```bash
# Run automatic validation
npm run validate

# Expected output:
# ✅ Package validation PASSED!
# 📦 Ready for npm publishing
```

### **2. Critical Files Present**
- [ ] `setup-universal.js` - Universal installation script
- [ ] `validate-package.js` - Package validation script  
- [ ] `Dockerfile` - Container definition
- [ ] `start.js` - Container startup script
- [ ] `mcp-server/dist/http-mcp-server.js` - Built MCP server
- [ ] `claude-dev-guidelines/` - Professional animation guidelines
- [ ] `README.md` - Complete documentation
- [ ] `VM-TESTING-GUIDE.md` - Testing methodology

### **3. Package.json Validation**
- [ ] **Name**: `@endlessblink/clean-cut-mcp`
- [ ] **Version**: Correct semantic version (currently 4.5.10)
- [ ] **Main**: Points to correct MCP server entry point
- [ ] **Files**: Includes all required files
- [ ] **Scripts**: All critical scripts present (postinstall, setup-universal, start)
- [ ] **Bin**: Executable entry points configured
- [ ] **Repository**: Correct GitHub URL

### **4. Build Validation**
```bash
# Build MCP server
npm run build-mcp

# Verify build output exists
ls mcp-server/dist/http-mcp-server.js

# Test build integrity
node mcp-server/dist/http-mcp-server.js --help
```

## 🧪 **VM Testing Protocol**

### **Phase 1: Environment Setup**
- [ ] **Fresh Windows 11 VM** (8GB RAM, 50GB disk)
- [ ] **Prerequisites installed**: Node.js 18+, Docker Desktop, Claude Desktop
- [ ] **VM snapshot created** for rapid iteration

### **Phase 2: Installation Method Testing**

#### **Method A: NPM Global Package**
```powershell
# Test global installation
npm install -g @endlessblink/clean-cut-mcp

# Verify installation
clean-cut-mcp --version
which clean-cut-mcp

# Expected: Setup runs automatically via postinstall
```

#### **Method B: Direct Build from Source**
```powershell
# Clone and build
git clone https://github.com/endlessblink/clean-cut-mcp.git
cd clean-cut-mcp
npm run setup-universal

# Expected: Full setup including Docker build and Claude config
```

#### **Method C: Installer Scripts**
```powershell
# Test universal installer
.\FINAL-UNIVERSAL-INSTALLER.ps1

# Test bulletproof config
.\BULLETPROOF-CONFIG.ps1 -ServerUrl "http://localhost:6961/mcp"
```

### **Phase 3: Critical Validation Points**

#### **Docker Validation**
```powershell
# Verify image exists
docker images clean-cut-mcp

# Test container creation
docker create --name test-clean-cut clean-cut-mcp
docker rm test-clean-cut

# Test container startup
docker run -d --name clean-cut-mcp -p 6960:6960 -p 6961:6961 clean-cut-mcp
docker ps | findstr clean-cut-mcp
```

#### **Health Check Validation**
```powershell
# Wait for services
Start-Sleep -Seconds 30

# Test MCP server
Invoke-RestMethod -Uri "http://localhost:6961/health"
# Expected: {"status":"healthy","service":"clean-cut-mcp","version":"2.0.0"}

# Test Remotion Studio  
Invoke-WebRequest -Uri "http://localhost:6960"
# Expected: Status 200

# Test MCP tools
Invoke-RestMethod -Uri "http://localhost:6961/mcp" -Method POST `
  -Body '{"jsonrpc":"2.0","method":"tools/list","id":1}' `
  -ContentType "application/json"
# Expected: List of 3 tools (create_animation, list_animations, get_studio_url)
```

#### **Claude Desktop Integration**
```powershell
# Verify config exists
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
Test-Path $configPath

# Verify clean-cut-mcp server configured
$config = Get-Content $configPath | ConvertFrom-Json
$config.mcpServers.'clean-cut-mcp' -ne $null

# Verify backup created
Get-ChildItem "$env:APPDATA\Claude\claude_desktop_config.json.backup-*"
```

#### **End-to-End Animation Test**
1. **Start Claude Desktop**
2. **Wait for MCP initialization** (no connection errors)
3. **Test prompt**: "Create a bouncing ball animation"
4. **Expected response**:
   ```
   ✅ Animation created successfully!
   
   📁 File: bouncing-ball-[timestamp].mp4
   🎬 Type: bouncing-ball  
   ⏱️ Duration: 3s
   📐 Resolution: 1920x1080
   🎨 Studio: http://localhost:6960
   ```
5. **Verify studio access**: http://localhost:6960 loads
6. **Verify video creation**: MP4 file exists in exports

### **Phase 4: Recovery Testing**

#### **Docker Build Failure Recovery**
```powershell
# Simulate missing image
docker rmi clean-cut-mcp -f

# Test auto-recovery
.\install.ps1
# Expected: Offers automatic build and succeeds
```

#### **Claude Config Corruption Recovery**  
```powershell
# Corrupt config
'{"invalid": "json"}' | Set-Content "$env:APPDATA\Claude\claude_desktop_config.json"

# Test recovery
.\BULLETPROOF-CONFIG.ps1 -ServerUrl "http://localhost:6961/mcp"

# Expected: Backup created, valid config restored
```

#### **Port Conflict Recovery**
```powershell
# Start conflicting service on port 6961
$conflict = Start-Process node -ArgumentList "-e", "require('http').createServer().listen(6961)" -PassThru

# Test installer handling
.\install.ps1

# Expected: Graceful error handling or port retry
Stop-Process $conflict
```

## 📋 **Publishing Steps**

### **1. Final Pre-Publishing Checks**
```bash
# Validate package structure
npm run validate

# Test dry run
npm publish --dry-run

# Check what will be published
npm pack --dry-run
```

### **2. Version Management**
```bash
# Update version if needed
npm version patch  # or minor/major

# Tag release
git tag v$(node -p "require('./package.json').version")
git push --tags
```

### **3. NPM Publishing**
```bash
# Publish to npm
npm publish

# Verify published package
npm info @endlessblink/clean-cut-mcp
```

### **4. GitHub Release**
```bash
# Create GitHub release with assets
gh release create v4.5.10 \
  --title "Clean-Cut-MCP v4.5.10 - One-Script Magic" \
  --notes "Bulletproof video animation for Claude Desktop" \
  --attach clean-cut-mcp-4.5.10.tgz
```

## ✅ **Success Criteria**

### **Installation Success**
- [ ] NPM global install completes without errors
- [ ] Docker image builds successfully  
- [ ] Claude Desktop configuration merges safely
- [ ] All services start and respond to health checks
- [ ] No existing MCP servers are overwritten

### **User Experience Success**
- [ ] User asks: "Create a bouncing ball animation"
- [ ] Claude responds: "Animation ready at http://localhost:6960"
- [ ] Animation loads in browser within 30 seconds
- [ ] No JSON-RPC errors in Claude Desktop
- [ ] Process completes in under 60 seconds total

### **Recovery Success**
- [ ] All failure modes recover gracefully
- [ ] Automatic rollback works on errors
- [ ] Backup/restore functions correctly
- [ ] No permanent damage to user's system

## 🚨 **Failure Criteria - Do Not Publish If:**

- [ ] ❌ Package validation fails
- [ ] ❌ Docker build fails on clean VM
- [ ] ❌ Claude Desktop configuration corrupted
- [ ] ❌ End-to-end animation test fails
- [ ] ❌ Recovery mechanisms don't work
- [ ] ❌ Existing MCP servers overwritten or damaged

## 📊 **Testing Timeline**

- **Package Validation**: 30 minutes
- **VM Environment Setup**: 1-2 hours
- **Installation Method Testing**: 2-3 hours  
- **Critical Validation**: 1-2 hours
- **Recovery Testing**: 1-2 hours
- **Publishing Process**: 30 minutes

**Total Estimated Time: 6-9 hours for comprehensive validation**

## 🎯 **Post-Publishing Verification**

```bash
# Test fresh install from npm
npm install -g @endlessblink/clean-cut-mcp

# Verify global availability
clean-cut-mcp --version

# Test complete workflow
# Expected: "One-Script Magic" works end-to-end
```

---

**The goal is bulletproof "One-Script Magic" that works on every Windows system without breaking existing configurations.**

**DO NOT PUBLISH until all checkboxes are complete and success criteria are met.**