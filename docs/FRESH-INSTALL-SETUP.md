# Clean-Cut-MCP - Fresh Installation Setup Guide

## 🎯 Goal: Brand New Windows → "One-Script Magic"

This guide takes you from a **fresh Windows installation** to working **"One-Script Magic"** where you can ask Claude Desktop: *"Create a bouncing ball animation"* and get: *"Animation ready at http://localhost:6960"*

---

## 📋 Prerequisites Check

**Required Software (install in this order):**

### 1. Windows 11 with WSL2 Support
```powershell
# Check Windows version (must be Windows 11 or Windows 10 version 2004+)
winver

# Enable WSL2 feature
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart required
shutdown /r /t 0
```

### 2. WSL2 + Ubuntu Distribution
```powershell
# After restart, set WSL2 as default
wsl --set-default-version 2

# Install Ubuntu (recommended distribution)
wsl --install -d Ubuntu

# Verify WSL2 installation
wsl --list --verbose
```

### 3. Docker Desktop for Windows
- Download from: https://docs.docker.com/desktop/install/windows-install/
- **CRITICAL**: Enable "Use WSL 2 based engine" during setup
- **CRITICAL**: Enable integration with Ubuntu distribution

### 4. Node.js (Windows Installation)
- Download from: https://nodejs.org/en/download/
- **Use Windows installer** (not WSL2 version)
- Required for Claude Desktop MCP server detection

### 5. Claude Desktop
- Download from: https://claude.ai/download
- Install Claude Desktop for Windows

---

## 🚀 Clean-Cut-MCP Installation

### Step 1: Get the Project
```bash
# In WSL2 Ubuntu
cd /mnt/d
git clone [repository-url] clean-cut-mcp
cd clean-cut-mcp
```

### Step 2: Build Docker Container
```bash
# In WSL2, in project directory
docker build -t clean-cut-mcp .

# Verify build success
docker images | grep clean-cut-mcp
```

### Step 3: Initial Container Test
```bash
# Start container
docker run -d --name clean-cut-mcp -p 6960:6960 -p 6961:6961 clean-cut-mcp

# Test container health (should work from WSL2)
curl http://localhost:6961/health

# Expected response: {"status":"healthy",...}
```

---

## 🌐 Network Configuration (The Critical Step)

### Option A: Automatic Network Fix (Recommended)
```powershell
# From Windows PowerShell (Run as Administrator)
cd "D:\clean-cut-mcp"
.\COMPLETE-NETWORK-FIX.ps1
```

**What this does:**
1. **WSL2 Mirrored Networking**: Enables direct localhost forwarding
2. **Port Forwarding Fallback**: If mirrored mode fails, uses netsh portproxy
3. **Claude Desktop Config**: Automatically configures MCP server

### Option B: Manual Network Fix
If automatic fix fails, follow manual steps:

#### Manual Step 1: WSL2 Mirrored Mode
```powershell
# Create .wslconfig file
$wslConfig = @"
[wsl2]
networkingMode=mirrored
dnsTunneling=true
firewall=true

[experimental]
hostAddressLoopback=true
"@

$wslConfig | Out-File "$env:USERPROFILE\.wslconfig" -Encoding UTF8

# Restart WSL2
wsl --shutdown
Start-Sleep 5
wsl -d Ubuntu -e echo "WSL2 restarted"
```

#### Manual Step 2: Test Connectivity
```powershell
# Test if Windows can reach WSL2 container
Invoke-RestMethod http://localhost:6961/health
```

#### Manual Step 3: Port Forwarding (if Step 2 fails)
```powershell
# Get WSL2 IP
$wsl2IP = (wsl hostname -I).Trim()

# Add port forwarding rules (Run as Administrator)
netsh interface portproxy add v4tov4 listenport=6961 listenaddress=127.0.0.1 connectport=6961 connectaddress=$wsl2IP
netsh interface portproxy add v4tov4 listenport=6960 listenaddress=127.0.0.1 connectport=6960 connectaddress=$wsl2IP
```

---

## 🔧 Claude Desktop Configuration

### Option A: Template-Based (Safest)
```powershell
# Use pre-made templates to avoid JSON corruption
cd "D:\clean-cut-mcp"
.\CONFIGURE-TEMPLATE.bat

# Choose option 2: "With Clean-Cut-MCP"
```

### Option B: Automatic Configuration
```powershell
# After networking is fixed
.\safe-claude-config.ps1
```

### Option C: Manual Configuration
Edit `%APPDATA%\Claude\claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "clean-cut-mcp": {
      "url": "http://localhost:6961/mcp",
      "description": "Clean-Cut-MCP - One-Script Magic video animation server"
    }
  }
}
```

---

## ✅ Verification Steps

### 1. Container Health Check
```bash
# From WSL2
docker ps --filter "name=clean-cut-mcp"
# Should show: STATUS = "Up X minutes (healthy)"

curl http://localhost:6961/health
# Should return: {"status":"healthy",...}
```

### 2. Windows Connectivity Check
```powershell
# From Windows PowerShell
Invoke-RestMethod http://localhost:6961/health
# Should return the same health response
```

### 3. Claude Desktop Check
- Start Claude Desktop
- Should start without "Could not load app settings" error
- In Claude conversation, the clean-cut-mcp server should be available

### 4. End-to-End Test
Ask Claude Desktop: **"Create a bouncing ball animation"**

**Expected Response:**
```
I'll create a bouncing ball animation for you using Clean-Cut-MCP.

[Tool: create_animation with type="bouncing-ball"]

Animation ready at http://localhost:6960
```

---

## 🚨 Common Fresh Install Issues

### Issue 1: "Docker not found"
**Solution**: Install Docker Desktop with WSL2 backend enabled

### Issue 2: "wsl command not found"
**Solution**: Enable WSL2 feature and restart Windows

### Issue 3: "Permission denied" in WSL2
```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
# Logout and login to WSL2
```

### Issue 4: "Cannot connect to MCP server"
**Solution**: Run network fix scripts as Administrator

### Issue 5: Claude Desktop JSON errors
**Solution**: Use FIX-CONFIG.bat for emergency recovery

### Issue 6: Container exits immediately
```bash
# Check container logs
docker logs clean-cut-mcp

# Common fix: Rebuild container
docker build -t clean-cut-mcp . --no-cache
```

---

## 📁 File Structure After Setup

```
D:\clean-cut-mcp\
├── Dockerfile                     # ✅ Container definition
├── docker-compose.yml            # Optional: For easier management
├── 
├── COMPLETE-NETWORK-FIX.ps1      # ✅ Automatic network solution
├── safe-claude-config.ps1         # ✅ Bulletproof Claude config
├── CONFIGURE-TEMPLATE.bat         # ✅ Template-based config
├── FIX-CONFIG.bat                 # ✅ Emergency JSON recovery
├── 
├── templates/                     # ✅ Pre-made JSON configs
│   ├── claude_config_minimal.json
│   ├── claude_config_with_clean_cut.json
│   └── claude_config_clean_cut_only.json
├── 
├── mcp-server/                    # ✅ MCP server source
└── FRESH-INSTALL-SETUP.md         # ✅ This file
```

---

## 🎯 Success Criteria

**You know everything is working when:**

1. ✅ **Container Status**: `docker ps` shows clean-cut-mcp as "healthy"
2. ✅ **WSL2 Connectivity**: `curl http://localhost:6961/health` works in WSL2
3. ✅ **Windows Connectivity**: `Invoke-RestMethod http://localhost:6961/health` works in PowerShell
4. ✅ **Claude Desktop Starts**: No JSON parsing errors
5. ✅ **MCP Server Listed**: clean-cut-mcp appears in Claude Desktop settings
6. ✅ **One-Script Magic**: Claude can create animations and respond with localhost:6960 URLs

**Expected workflow time**: 30-45 minutes for complete fresh install

**If you get stuck**: Use the emergency recovery scripts (FIX-CONFIG.bat) and network diagnostics (COMPLETE-NETWORK-FIX.ps1 -TestOnly)