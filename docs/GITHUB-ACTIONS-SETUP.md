# GitHub Actions Automated Docker Publishing

## 🚀 Automated Docker Hub Publishing via GitHub Actions

Instead of manually pushing to Docker Hub, this setup automates the entire process through GitHub Actions. Every time you push to the repository, it automatically builds and publishes to Docker Hub!

## ✅ What the GitHub Actions Workflow Does

### **Automatic Triggers**:
- ✅ **Push to master/main** → Builds and pushes `latest` tag
- ✅ **Git tag push** (e.g., `v4.5.11`) → Builds version-specific tag  
- ✅ **Pull requests** → Builds but doesn't push (testing only)
- ✅ **Manual trigger** → Run workflow on-demand

### **Multi-Architecture Support**:
- ✅ **linux/amd64** (Intel/AMD x64)
- ✅ **linux/arm64** (Apple Silicon, ARM servers)

### **Automated Features**:
- ✅ **Docker Hub login** using secrets
- ✅ **Multi-platform builds** via buildx
- ✅ **Smart tagging** (latest, version, branch, SHA)
- ✅ **Automatic README sync** to Docker Hub
- ✅ **Health testing** after build
- ✅ **GitHub releases** for version tags
- ✅ **Security scanning** with Trivy
- ✅ **Build caching** for faster builds

## 📋 Setup Requirements

### Step 1: Create Docker Hub Repository
Using the interface you showed in the screenshot:

1. **Go to**: https://hub.docker.com/repository/create
2. **Repository name**: `clean-cut-mcp`  
3. **Namespace**: `endlessblink`
4. **Visibility**: **Public** ✨
5. **Short description**: `One-Script Magic: Remotion video generation for Claude Desktop`
6. **Click**: "Create Repository"

### Step 2: Generate Docker Hub Access Token
1. **Go to**: https://hub.docker.com/settings/security
2. **Click**: "New Access Token"
3. **Description**: `GitHub Actions - clean-cut-mcp`
4. **Permissions**: `Read, Write, Delete` 
5. **Copy the token** (you'll only see it once!)

### Step 3: Add GitHub Secrets
1. **Go to**: https://github.com/endlessblink/clean-cut-mcp/settings/secrets/actions
2. **Add Repository Secrets**:
   - Name: `DOCKERHUB_USERNAME` → Value: `endlessblink`
   - Name: `DOCKERHUB_TOKEN` → Value: `[paste access token here]`

### Step 4: Push the Workflow
The workflow file is already created at `.github/workflows/docker-publish.yml`

```bash
# Add and commit the workflow
git add .github/workflows/docker-publish.yml
git commit -m "Add automated Docker Hub publishing via GitHub Actions"
git push origin master

# The workflow will automatically trigger and build!
```

## 🎯 Why GitHub Actions > Manual Push

| Feature | Manual Push | GitHub Actions |
|---------|-------------|----------------|
| **Setup Time** | Every time | One-time setup |
| **Multi-Architecture** | Complex | Automatic |
| **Testing** | Manual | Automated |
| **Version Tagging** | Manual | Smart tagging |
| **Documentation Sync** | Manual | Automatic |
| **Security Scanning** | None | Built-in |
| **Error Prone** | High | Low |
| **Team Friendly** | No | Yes |

## 🔄 Automated Workflow Examples

### **Regular Development**:
```bash
# Make changes to code
git add -A
git commit -m "Improve animation performance"
git push origin master

# ✅ Automatically triggers:
# - Docker build for linux/amd64 + linux/arm64
# - Push to endlessblink/clean-cut-mcp:latest
# - Update Docker Hub README
# - Test health endpoints
# - Security vulnerability scan
```

### **Version Release**:
```bash
# Tag a release
git tag v4.5.11
git push origin v4.5.11

# ✅ Automatically triggers:
# - All above actions
# - Push to endlessblink/clean-cut-mcp:v4.5.11
# - Create GitHub Release with installation instructions
# - Attach installer scripts to release
```

### **Testing Changes**:
```bash
# Create PR
git checkout -b feature/better-animations
git push origin feature/better-animations
# Create PR on GitHub

# ✅ Automatically triggers:
# - Build test (no push to Docker Hub)
# - Multi-architecture validation
# - Health endpoint testing
# - PR status checks
```

## 📊 Monitoring & Status

### **Workflow Status**: 
- https://github.com/endlessblink/clean-cut-mcp/actions

### **Docker Hub Repository**: 
- https://hub.docker.com/r/endlessblink/clean-cut-mcp

### **Build Logs**: 
Available in GitHub Actions tab with full build details

## 🧪 Testing the Automated Workflow

Once set up, test with:

```bash
# 1. Make a small change
echo "# Test automated build" >> README.md
git add README.md
git commit -m "Test automated Docker Hub publishing"
git push origin master

# 2. Check GitHub Actions tab for build progress
# 3. Wait ~10-15 minutes for multi-arch build
# 4. Verify image appears on Docker Hub
# 5. Test installation:
docker pull endlessblink/clean-cut-mcp:latest
```

## 🎉 Benefits for VM Testing

Once automated publishing is set up:

✅ **Push code changes** → **Automatic Docker Hub update**  
✅ **VM testing** → **Always latest version**  
✅ **Zero manual steps** → **Focus on development**  
✅ **Multi-architecture** → **Works on all platforms**  
✅ **Version consistency** → **Reproducible builds**  

## 🔧 Troubleshooting

### "Repository does not exist" 
- Create the Docker Hub repository first (Step 1)

### "Authentication failed"
- Check GitHub secrets are set correctly (Step 3)
- Verify Docker Hub access token has write permissions

### "Build failed"
- Check GitHub Actions logs for specific error
- Dockerfile syntax issues will be highlighted

### "Multi-arch build slow"
- Normal! Cross-compilation takes 10-15 minutes
- Consider reducing to single architecture for testing

## 💡 Pro Tips

1. **Branch Protection**: Set up required status checks for PR builds
2. **Scheduled Builds**: Add weekly rebuilds for security updates
3. **Slack Notifications**: Get notified when builds complete
4. **Release Automation**: Auto-update changelog from commits

---

**Result**: Every `git push` automatically publishes to Docker Hub, enabling instant VM testing with zero manual steps! 🚀