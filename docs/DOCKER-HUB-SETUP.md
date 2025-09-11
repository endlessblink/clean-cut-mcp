# Docker Hub Repository Setup Guide

## Why Docker Hub Distribution Failed

**Error Analysis from your push attempt:**

1. **Credential Helper Issue**: 
   ```
   failed to store tokens: error storing credentials - err: exec: "docker-credential-desktop": executable file not found in %PATH%
   ```

2. **Repository Access Denied**:
   ```
   push access denied, repository does not exist or may require authorization: server message: insufficient_scope: authorization failed
   ```

**Root Cause**: The Docker Hub repository "endlessblink/clean-cut-mcp" doesn't exist yet, and Docker Desktop's credential helper has PATH issues.

## Step-by-Step Fix

### Phase 1: Fix Docker Authentication

**Option A: Restart Docker Desktop (Recommended)**
1. Close Docker Desktop completely (right-click system tray → Quit)
2. Restart Docker Desktop  
3. Wait for complete startup (whale icon in system tray)
4. Try authentication again:
   ```powershell
   docker login
   ```

**Option B: Manual Authentication**
If credential helper still fails:
```powershell
docker logout
docker login -u endlessblink
# Enter password manually when prompted
```

**Option C: Run the diagnostic script:**
```powershell
.\fix-docker-auth.ps1
```

### Phase 2: Create Docker Hub Repository

1. **Go to Docker Hub**: https://hub.docker.com/repository/create

2. **Repository Settings**:
   - **Repository name**: `clean-cut-mcp`
   - **Namespace**: `endlessblink` (your username)
   - **Visibility**: **Public** ⭐ (critical for testing)
   - **Description**: "One-Script Magic: Remotion video generation for Claude Desktop"

3. **Optional Settings**:
   - **Short description**: "Zero-setup Docker container for Remotion animations in Claude Desktop"
   - **Categories**: Add `developer-tools`, `video`, `ai`
   - **README**: Can copy content from `DOCKERHUB-README.md` 

4. **Click "Create Repository"**

### Phase 3: Push Images

Once repository is created and authentication works:

```powershell
# Verify authentication
docker info | findstr Username

# Push both tags
docker push endlessblink/clean-cut-mcp:latest
docker push endlessblink/clean-cut-mcp:v4.5.10
```

**Expected Output**: 
```
The push refers to repository [docker.io/endlessblink/clean-cut-mcp]
2b1e08942aa0: Pushed
46053b67b390: Pushed
...
latest: digest: sha256:abc123... size: 1234
```

### Phase 4: Test Public Access

From any machine with Docker:

```powershell
# Test pull (should work without authentication)
docker pull endlessblink/clean-cut-mcp:latest

# Test our installer
.\install-dockerhub.ps1 -TestMode
```

## Why This Enables Docker Hub Testing

**Before (Git-based)**:
- Requires: Git + Docker + Build tools
- Time: 5+ minutes (clone + build)
- Complexity: High
- VM friendly: ❌ No

**After (Docker Hub)**:
- Requires: Docker only
- Time: 30 seconds (pull pre-built)
- Complexity: Zero
- VM friendly: ✅ Perfect

## Expected Repository Structure

Once created, your Docker Hub repository will show:

```
endlessblink/clean-cut-mcp
├── Tags
│   ├── latest (2.09GB)
│   └── v4.5.10 (2.09GB)
├── Overview (from DOCKERHUB-README.md)
├── Tags (version history)
└── Dockerfile (auto-detected)
```

## Testing Commands After Setup

```powershell
# VM Testing - Zero source code needed
docker run -d --name clean-cut-mcp --restart unless-stopped -p 6960:6960 -p 6961:6961 -v clean-cut-exports:/workspace/out endlessblink/clean-cut-mcp:latest

# Automated installer
.\install-dockerhub.ps1

# Verify installation
curl http://localhost:6961/health
```

## Common Issues & Solutions

### "Repository does not exist"
- **Solution**: Create repository on Docker Hub first (Phase 2)

### "Authentication failed"  
- **Solution**: Run `.\fix-docker-auth.ps1` or restart Docker Desktop

### "credential helper not found"
- **Solution**: Add Docker Desktop to PATH or use manual login

### "Push timeout"
- **Solution**: Large image (2.09GB) - ensure stable internet connection

## Success Indicators

✅ **Repository Created**: https://hub.docker.com/r/endlessblink/clean-cut-mcp  
✅ **Images Pushed**: Both `latest` and `v4.5.10` tags visible  
✅ **Public Access**: `docker pull endlessblink/clean-cut-mcp:latest` works without authentication  
✅ **VM Testing**: `.\install-dockerhub.ps1` completes successfully on clean VM  

Once complete, you'll have transformed clean-cut-mcp from "developer setup" to "end-user application" - perfect for comprehensive testing!

---

**Next**: After successful push, test the Docker Hub workflow on a clean VM to validate the zero-dependency installation experience.