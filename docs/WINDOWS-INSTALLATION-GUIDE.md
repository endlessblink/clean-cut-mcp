# Windows Installation Guide - Clean-Cut-MCP

## 🖥️ **Windows Prerequisites & Complete Setup**

### **Step 1: Enable WSL2 (Windows Subsystem for Linux)**

WSL2 is **required** for Docker Desktop on Windows. Most Windows 10/11 systems need this installed first.

#### **Quick WSL2 Installation**:

**Option A: One-Command Install (Windows 10 version 2004+ / Windows 11)**
```powershell
# Run as Administrator in PowerShell
wsl --install

# Restart your computer when prompted
```

**Option B: Manual Installation (Older Windows versions)**
```powershell
# Run as Administrator in PowerShell

# 1. Enable WSL feature
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# 2. Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# 3. Restart computer
Restart-Computer

# 4. After restart, set WSL2 as default
wsl --set-default-version 2

# 5. Install Ubuntu (or preferred Linux distribution)
wsl --install -d Ubuntu
```

#### **Verify WSL2 Installation**:
```powershell
# Check WSL version
wsl --list --verbose

# Should show:
# NAME      STATE           VERSION
# Ubuntu    Running         2
```

### **Step 2: Install Docker Desktop**

1. **Download**: https://docs.docker.com/desktop/install/windows/
2. **Run installer**: `Docker Desktop Installer.exe`
3. **Important**: During installation, ensure "Use WSL 2 instead of Hyper-V" is **checked**
4. **Restart** when prompted
5. **Start Docker Desktop** and wait for complete initialization

#### **Verify Docker Installation**:
```powershell
docker --version
docker run hello-world
```

### **Step 3: Install Clean-Cut-MCP**

Now that prerequisites are ready:

```powershell
# Download installer
curl -o install-dockerhub.ps1 https://raw.githubusercontent.com/endlessblink/clean-cut-mcp/master/install-dockerhub.ps1

# Run installer
.\install-dockerhub.ps1
```

**Or manual installation**:
```powershell
# Pull and run the Docker container
docker run -d --name clean-cut-mcp --restart unless-stopped -p 6960:6960 -p 6961:6961 -v clean-cut-exports:/workspace/out endlessblink/clean-cut-mcp:latest
```

## 🔧 **Complete Installation Checklist**

### **Windows System Requirements**:
- ✅ Windows 10 version 2004+ (Build 19041+) or Windows 11
- ✅ 64-bit processor with Second Level Address Translation (SLAT)
- ✅ 4GB+ RAM (8GB+ recommended)
- ✅ Hardware virtualization enabled in BIOS/UEFI
- ✅ Administrator privileges for initial setup

### **Installation Verification Steps**:

**1. WSL2 Working**:
```powershell
wsl --list --verbose
# Should show version 2 for your Linux distribution
```

**2. Docker Desktop Working**:
```powershell
docker --version
docker run hello-world
# Should complete without errors
```

**3. Clean-Cut-MCP Working**:
```powershell
# Check container is running
docker ps | findstr clean-cut-mcp

# Test MCP server
curl http://localhost:6961/health

# Test Remotion Studio
curl http://localhost:6960
```

**4. Claude Desktop Integration**:
- Restart Claude Desktop
- Ask: "Create a bouncing ball animation"
- Expect: "Animation ready at http://localhost:6960"

## ❌ **Common Issues & Solutions**

### **WSL2 Installation Issues**:

**"WSL 2 requires an update to its kernel component"**
```powershell
# Download and install WSL2 kernel update
# Visit: https://aka.ms/wsl2kernel
# Run the downloaded .msi file
```

**"Please enable the Virtual Machine Platform Windows feature"**
```powershell
# Run as Administrator
Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -NoRestart
Restart-Computer
```

**"Hardware virtualization is not enabled"**
- Restart computer and enter BIOS/UEFI setup
- Look for "Virtualization Technology", "Intel VT-x", or "AMD-V"
- Enable virtualization features
- Save and restart

### **Docker Desktop Issues**:

**"Docker Desktop requires WSL2"**
- Complete WSL2 installation first (Step 1)
- Uninstall and reinstall Docker Desktop
- Ensure "Use WSL 2" option is selected during installation

**"WSL 2 installation is incomplete"**
- Run: `wsl --update`
- Restart Docker Desktop
- Check Docker settings: Settings → General → "Use the WSL 2 based engine"

**"Port conflicts (6960/6961 already in use)"**
```powershell
# Find what's using the ports
netstat -ano | findstr :6960
netstat -ano | findstr :6961

# Kill conflicting processes or use different ports
docker run -d --name clean-cut-mcp -p 7960:6960 -p 7961:6961 endlessblink/clean-cut-mcp:latest
```

### **Clean-Cut-MCP Issues**:

**"Container won't start"**
```powershell
# Check container logs
docker logs clean-cut-mcp

# Restart container
docker restart clean-cut-mcp

# Remove and recreate container
docker stop clean-cut-mcp
docker rm clean-cut-mcp
docker run -d --name clean-cut-mcp --restart unless-stopped -p 6960:6960 -p 6961:6961 -v clean-cut-exports:/workspace/out endlessblink/clean-cut-mcp:latest
```

**"Claude Desktop can't connect"**
- Restart Claude Desktop after installation
- Check container is running: `docker ps`
- Test MCP endpoint: `curl http://localhost:6961/health`
- Check Windows Firewall isn't blocking ports 6960/6961

## 🚀 **Enterprise/Corporate Network Setup**

### **Proxy Configuration**:
If behind corporate firewall:

```powershell
# Configure Docker Desktop proxy
# Settings → Resources → Proxies
# Add your corporate proxy settings

# Configure WSL2 proxy (in Ubuntu/WSL2 terminal)
export http_proxy=http://proxy.company.com:8080
export https_proxy=http://proxy.company.com:8080
```

### **Offline Installation**:
For air-gapped environments:

1. **Download Docker Desktop installer** on internet-connected machine
2. **Transfer installer** to target machine
3. **Install Docker Desktop** offline
4. **Save Docker image** on internet-connected machine:
   ```bash
   docker pull endlessblink/clean-cut-mcp:latest
   docker save -o clean-cut-mcp.tar endlessblink/clean-cut-mcp:latest
   ```
5. **Transfer and load image** on target machine:
   ```bash
   docker load -i clean-cut-mcp.tar
   docker run -d --name clean-cut-mcp -p 6960:6960 -p 6961:6961 endlessblink/clean-cut-mcp:latest
   ```

## 🎯 **Installation Time Expectations**

| Component | First Install | Subsequent |
|-----------|---------------|------------|
| **WSL2** | 10-15 minutes + restart | Already installed |
| **Docker Desktop** | 5-10 minutes + restart | Updates only |
| **Clean-Cut-MCP** | 2-5 minutes (image download) | 30 seconds |
| **Total** | **~20-30 minutes** | **30 seconds** |

## 🧪 **Testing Your Installation**

### **Basic Functionality Test**:
```powershell
# 1. Container health
docker ps | findstr clean-cut-mcp
# Should show: "Up X minutes (healthy)"

# 2. MCP server
curl http://localhost:6961/health
# Should return: {"status":"healthy"}

# 3. Remotion Studio
start http://localhost:6960
# Should open Remotion Studio in browser
```

### **Claude Desktop Integration Test**:
1. **Restart Claude Desktop** completely
2. **Ask Claude**: "Create a simple bouncing ball animation"
3. **Expected Response**: "I'll create a bouncing ball animation for you using Clean-Cut-MCP..."
4. **Should receive**: Animation ready at http://localhost:6960

### **Video Export Test**:
1. **In Remotion Studio**: Click "Render"
2. **Wait for render** to complete
3. **Check exports**:
   ```powershell
   # List exported videos
   docker exec clean-cut-mcp ls -la /workspace/out
   
   # Copy video to Windows
   docker cp clean-cut-mcp:/workspace/out/video.mp4 ./my-video.mp4
   ```

---

## 📞 **Support Resources**

- **Docker Desktop**: https://docs.docker.com/desktop/troubleshoot/
- **WSL2 Documentation**: https://docs.microsoft.com/en-us/windows/wsl/
- **Clean-Cut-MCP Issues**: https://github.com/endlessblink/clean-cut-mcp/issues
- **Remotion Documentation**: https://remotion.dev

**Installation successful?** You should now have a zero-setup video generation system that responds to natural language requests in Claude Desktop! 🎬