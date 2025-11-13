# Clean-Cut-MCP: AI Video Generation for Claude Desktop

**Transform natural language into professional videos using Claude Desktop + Remotion.**

Simply describe your animation, and watch Claude create stunning React-powered videos in a persistent studio environment.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green) ![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-blue) ![License](https://img.shields.io/badge/License-Remotion%20%2B%20MIT-orange)

---

## 🚀 **INSTALLATION (5 minutes)**

### **Step 1: Pull Container**
```bash
docker pull endlessblink/clean-cut-mcp:latest
```

### **Step 2: Run Container**
```bash
docker run -d --name clean-cut-mcp -p 6970:6970 -v ./clean-cut-exports:/workspace/out -v ./clean-cut-workspace:/workspace --restart unless-stopped endlessblink/clean-cut-mcp:latest
```

### **Step 3: Configure Claude Desktop**

**Option A: Quick Installer (Recommended for Windows)**
```powershell
powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/endlessblink/clean-cut-mcp/master/install-quick.ps1' -OutFile 'install-quick.ps1'; powershell -ExecutionPolicy Bypass -File 'install-quick.ps1'"
```

**Option B: Manual Installation**
```bash
# Windows PowerShell:
powershell -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/endlessblink/clean-cut-mcp/master/install.ps1' -OutFile 'install.ps1'; powershell -ExecutionPolicy Bypass -File 'install.ps1'"

# Linux/macOS:
curl -fsSL https://raw.githubusercontent.com/endlessblink/clean-cut-mcp/master/install.ps1 | pwsh -ExecutionPolicy Bypass -
```

### **Step 4: Restart Claude Desktop**
Close Claude Desktop completely and restart it.

**✅ Result:** Remotion Studio at http://localhost:6970 + Claude Desktop integration ready

---

## 🆕 **What's New in v2.1.0**

- **🛡️ Animation Validation System**: Prevents syntax errors in generated code
- **🔧 MCP Singleton Management**: No more duplicate processes or conflicts
- **📝 Config Preservation**: Safely preserves existing MCP servers during installation
- **🎯 Auto-Fix System**: Automatically corrects common TypeScript issues
- **⚡ PowerShell Execution Bypass**: No more security policy issues

---

## 🎬 **Quick Demo Test**

After installation, try these commands in Claude Desktop:

```
User: "Create a simple welcome animation with the text 'Hello AI Video Generation'"
User: "List all existing animation components"
User: "Get the Remotion Studio URL"
```

---

## 🎯 **Use Cases**

### **Content Creators**
- **YouTube Intros**: Professional animated intros with your branding
- **Social Media**: Quick animations for Instagram, TikTok stories
- **Explainer Videos**: Animated sequences for complex topics
- **Brand Animations**: Logo reveals, product showcases

### **Marketers & Businesses**
- **Ad Creatives**: Animated ads for multiple platforms
- **Presentation Graphics**: Data visualizations, animated charts
- **Website Assets**: Loading animations, interactive elements
- **A/B Testing**: Generate multiple animation variants quickly

### **Educators & Trainers**
- **Course Content**: Visual explanations of complex concepts
- **Interactive Lessons**: Animated diagrams and processes
- **Student Projects**: Help students create professional presentations
- **Training Materials**: Animated guides and tutorials

---

## 🏗️ **Architecture**

```
Claude Desktop (Windows/Mac/Linux)
    ↓ MCP Protocol (STDIO transport)
Docker Container (clean-cut-mcp)
    ↓ Internal Services
Remotion Studio (Port 6970) + MCP Server + Node.js Runtime
    ↓ Volume Mount
./clean-cut-exports/ (Your Videos)
```

### **System Requirements**
- **Docker Desktop** installed and running
- **Claude Desktop** installed
- **4GB RAM** recommended for video rendering
- **2GB disk space** for container and videos

---

## 🛠️ **Available MCP Tools**

Clean-Cut-MCP provides 18 professional animation tools:

**Core Animation Tools:**
- `create_animation` - Generate animations from natural language
- `list_existing_components` - View available animation templates
- `rebuild_compositions` - Refresh animation registry
- `delete_component` - Remove animations safely

**Professional Features:**
- `generate_with_learning` - AI-powered animation with learned preferences
- `record_user_correction` - System learns from your feedback
- `upload_asset` - Add images, logos, audio to animations
- `format_code` - Professional code formatting

---

## 🔧 **Troubleshooting**

### **Installation Issues**
```bash
# Check container is running
docker ps | grep clean-cut-mcp

# Check Remotion Studio is accessible
curl http://localhost:6970

# Check Claude Desktop configuration
cat ~/.config/Claude/claude_desktop_config.json | grep clean-cut-mcp
```

### **PowerShell Security Issues**
If you get execution policy errors, use the bypass commands shown in Step 3.

### **Port Conflicts**
If port 6970 is in use:
```bash
# Use alternative port
docker run -d --name clean-cut-mcp -p 6971:6970 -v ./clean-cut-exports:/workspace/out -v ./clean-cut-workspace:/workspace --restart unless-stopped endlessblink/clean-cut-mcp:latest
```

---

## 📚 **Documentation**

- **[User Guide](docs/USER-GUIDE.md)** - Complete tool reference
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Examples](docs/EXAMPLES.md)** - Sample animations and use cases

---

## 🤝 **Community & Support**

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Share animations, ask questions
- **Docker Hub**: Pre-built container images

---

## 📄 **License**

**This project uses Remotion**, which has special licensing requirements:

- **Free for**: Individuals, organizations ≤3 employees, non-profits, evaluation
- **Company license required**: For-profit organizations >3 employees
- **Details**: Check [remotion.pro](https://remotion.pro) for complete licensing terms

**Clean-Cut-MCP container/MCP server code**: MIT License
**Remotion dependency**: Subject to Remotion's license terms

---

**🎬 Ready to start creating? Follow the 4 installation steps above!**

**Questions or issues?** → Check the [Troubleshooting](docs/TROUBLESHOOTING.md) guide