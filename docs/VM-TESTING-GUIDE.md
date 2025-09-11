# Clean-Cut-MCP - VM Testing Guide for Publishing

## 🎯 **GOAL: Validate "One-Script Magic" Before Publishing**

**Success Criteria**: User asks "Create a bouncing ball animation" → Claude responds "Animation ready at http://localhost:6960"

This guide ensures clean-cut-mcp works flawlessly on fresh systems before npm/GitHub publication.

---

## 📋 **VM Testing Phases**

### **Phase 1: VM Environment Setup**

#### **1.1 Create Windows 11 VM**
```powershell
# VM Specifications (minimum)
- OS: Windows 11 Pro (latest)
- RAM: 8GB minimum, 16GB recommended
- Disk: 50GB minimum, 100GB recommended  
- Network: NAT with internet access
- Virtualization: Enable nested virtualization for Docker
```

#### **1.2 Install Prerequisites**
```powershell
# 1. Node.js 18+ LTS
# Download: https://nodejs.org/en/download/
# Verify: node --version && npm --version

# 2. Docker Desktop
# Download: https://docs.docker.com/desktop/install/windows-install/
# Verify: docker --version && docker ps

# 3. Claude Desktop  
# Download: https://claude.ai/desktop
# Verify: Check %APPDATA%\Claude\ directory exists
```

#### **1.3 VM Checkpoint**
Create VM snapshot after clean prerequisite installation for rapid testing iterations.

---

### **Phase 2: Installation Method Testing**

Test each installation method independently on fresh VM snapshots:

#### **Method A: NPM Global Package (Primary Distribution)**

```powershell
# Test NPM package installation
npm install -g @endlessblink/clean-cut-mcp

# Expected postinstall behavior
# - Should run setup-universal.js
# - Should configure Claude Desktop automatically
# - Should offer Docker build if image missing

# Validation checkpoints
clean-cut-mcp --version
# OR
npx clean-cut-mcp
```

**❌ CRITICAL ISSUE IDENTIFIED**: `setup-universal.js` is missing from package.json files array but referenced in postinstall script. This will cause NPM installation to fail.

#### **Method B: Direct Build from Source**

```powershell  
# Clone repository
git clone https://github.com/endlessblink/clean-cut-mcp.git
cd clean-cut-mcp

# Build Docker image
docker build -t clean-cut-mcp .

# Run installer
.\install.ps1

# Alternative: Manual install
.\FINAL-UNIVERSAL-INSTALLER.ps1
```

#### **Method C: Universal Installer Script**

```powershell
# Test standalone installer
.\FINAL-UNIVERSAL-INSTALLER.ps1

# Test with various scenarios
.\FINAL-UNIVERSAL-INSTALLER.ps1 -TestMode  # Preview mode
```

---

### **Phase 3: Critical Validation Checkpoints**

#### **3.1 Docker Build Validation**
```powershell
# Verify image exists
docker images clean-cut-mcp
# Must show: clean-cut-mcp   latest   [image-id]   [created]   [size]

# Test container creation
docker create --name test-clean-cut clean-cut-mcp
docker rm test-clean-cut

# Verify container startup
docker run -d --name clean-cut-mcp -p 6960:6960 -p 6961:6961 clean-cut-mcp
docker ps | findstr clean-cut-mcp
```

#### **3.2 Health Check Validation**
```powershell
# Wait for services to initialize
Start-Sleep -Seconds 30

# Test MCP server health
$mcpHealth = Invoke-RestMethod -Uri "http://localhost:6961/health"
Write-Output "MCP Health: $($mcpHealth.status)"

# Test Remotion Studio
$studioResponse = Invoke-WebRequest -Uri "http://localhost:6960" -TimeoutSec 10
Write-Output "Studio Status: $($studioResponse.StatusCode)"

# Test MCP tools endpoint
$toolsTest = Invoke-RestMethod -Uri "http://localhost:6961/mcp" -Method POST -Body '{"jsonrpc":"2.0","method":"tools/list","id":1}' -ContentType "application/json"
Write-Output "Tools Available: $($toolsTest.result.tools.Count)"
```

#### **3.3 Claude Desktop Integration**
```powershell
# Verify configuration file
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$config = Get-Content $configPath | ConvertFrom-Json

# Check clean-cut-mcp server exists
if ($config.mcpServers.'clean-cut-mcp') {
    Write-Output "✅ Claude Desktop configuration successful"
} else {
    Write-Output "❌ Claude Desktop configuration failed"
}

# Verify configuration structure
$server = $config.mcpServers.'clean-cut-mcp'
if ($server.command -and $server.args) {
    Write-Output "✅ MCP server configuration valid"
} else {
    Write-Output "❌ MCP server configuration invalid"
}
```

#### **3.4 End-to-End Animation Test**
**Manual Test in Claude Desktop:**

1. **Start Claude Desktop**
2. **Wait for MCP server initialization** (check no connection errors)
3. **Ask Claude**: "Create a bouncing ball animation"  
4. **Expected Response**: 
   ```
   ✅ Animation created successfully!
   
   📁 File: bouncing-ball-[timestamp].mp4
   🎬 Type: bouncing-ball
   ⏱️ Duration: 3s
   📐 Resolution: 1920x1080
   🎨 Studio: http://localhost:6960
   
   The animation has been rendered and saved to your videos directory.
   ```
5. **Verify Studio Access**: Open http://localhost:6960 in browser
6. **Check Video Output**: Confirm MP4 file created

---

### **Phase 4: Failure Recovery Testing**

#### **4.1 Docker Build Failure Recovery**
```powershell
# Simulate build failure
docker rmi clean-cut-mcp -f

# Test installer auto-build
.\install.ps1
# Should detect missing image and offer automatic build

# Test cleanup and retry
.\cleanup.ps1 -Force
.\install.ps1
```

#### **4.2 Claude Configuration Corruption Recovery**
```powershell
# Backup original config
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$backupPath = $configPath -replace '\.json$', '.original-backup.json'
Copy-Item $configPath $backupPath

# Corrupt configuration
'{"invalid": json}' | Set-Content $configPath

# Test recovery
.\BULLETPROOF-CONFIG.ps1 -ServerName "clean-cut-mcp" -ServerUrl "http://localhost:6961/mcp"

# Verify recovery created backup
Get-ChildItem "$env:APPDATA\Claude\claude_desktop_config.json.backup-*"
```

#### **4.3 Networking Issues Recovery**
```powershell
# Test WSL2 connectivity issues
.\COMPLETE-NETWORK-FIX.ps1

# Test port conflicts
# Start service on port 6961
$conflictProcess = Start-Process "node" -ArgumentList "-e", "require('http').createServer().listen(6961)" -PassThru

# Test installer port conflict handling
.\install.ps1

# Cleanup
Stop-Process $conflictProcess
```

---

### **Phase 5: Cross-Platform Compatibility**

#### **5.1 Windows Variations**
- **Windows 10** (v1903+)
- **Windows 11** 
- **Windows Server 2019/2022**
- **PowerShell 5.1** vs **PowerShell 7**

#### **5.2 Docker Configurations**
- **Docker Desktop** with WSL2
- **Docker Desktop** with Hyper-V  
- **Docker Engine** on Windows Server

---

## 🚨 **CRITICAL ISSUES TO FIX BEFORE PUBLISHING**

### **Issue 1: Missing setup-universal.js**
```javascript
// package.json files array missing setup-universal.js
"files": [
  "mcp-server/",
  "claude-dev-guidelines/", 
  "setup-universal.js",  // ← ADD THIS
  "remotion.config.ts",
  "tsconfig.json", 
  "README.md",
  "src/"
]
```

### **Issue 2: Invalid Package.json Scripts**
```javascript
// Current (broken):
"postinstall": "node setup-universal.js"

// Fix: Add file existence check
"postinstall": "[ -f setup-universal.js ] && node setup-universal.js || echo 'Setup script not found'"
```

### **Issue 3: Docker Image Reference**
```dockerfile
# start.js references non-existent file:
const mcp = spawnBackground('node', ['/app/mcp-server/dist/http-mcp-server.js'], {

# Should be:
const mcp = spawnBackground('node', ['/app/mcp-server/dist/http-server.js'], {
```

---

## 📊 **VM Testing Checklist**

### **Pre-Publishing Validation**

- [ ] **Fresh VM Setup** - Clean Windows 11 with prerequisites
- [ ] **Method A Testing** - NPM global package installation  
- [ ] **Method B Testing** - Direct build from source
- [ ] **Method C Testing** - Universal installer script
- [ ] **Docker Health** - Container builds and runs correctly
- [ ] **Claude Integration** - Configuration merge works safely
- [ ] **E2E Animation** - Complete user workflow functions
- [ ] **Recovery Testing** - Failure modes recover gracefully
- [ ] **Cross-Platform** - Multiple Windows configurations tested

### **Success Criteria**
- ✅ **Zero-friction Installation**: Single command success
- ✅ **No Breaking Changes**: Existing MCP servers preserved  
- ✅ **Robust Recovery**: All failure modes recoverable
- ✅ **"One-Script Magic"**: User gets animation in under 60 seconds

### **Publishing Readiness**
- [ ] All critical issues resolved
- [ ] VM testing passes on 3+ Windows configurations  
- [ ] NPM package validates correctly
- [ ] Documentation updated with VM test results
- [ ] GitHub release artifacts prepared

---

## 🎯 **EXPECTED PUBLISHING TIMELINE**

1. **Fix Critical Issues** (2-4 hours)
2. **VM Environment Setup** (1-2 hours) 
3. **Method Testing** (4-6 hours)
4. **Recovery Testing** (2-3 hours)
5. **Documentation** (1 hour)
6. **NPM Publishing** (30 minutes)

**Total Estimated Time: 10-16 hours for comprehensive validation**

---

**The goal is bulletproof "One-Script Magic" that works on every Windows system without breaking existing configurations.**