# Claude Desktop Connection Troubleshooting Guide

## VERIFIED WORKING CONFIGURATION ✅

The MCP server is working perfectly - tested manually with successful animation creation. The issue is Claude Desktop connection configuration.

### Step 1: Use the Correct Configuration

**File Location:**
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

**WORKING Configuration:**
```json
{
  "mcpServers": {
    "clean-cut-mcp": {
      "command": "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe",
      "args": ["exec", "-i", "clean-cut-mcp", "node", "/app/mcp-server/dist/clean-stdio-server.js"],
      "transport": "stdio",
      "env": {}
    }
  }
}
```

**Key Fixes Applied:**
1. ✅ **Full Docker Path**: Uses complete path to docker.exe (Windows requirement)
2. ✅ **Explicit Transport**: Added `"transport": "stdio"` (Claude Desktop requirement)
3. ✅ **Escaped Backslashes**: Proper JSON escaping for Windows paths
4. ✅ **Verified Command**: Tested manually - creates animations successfully

### Step 2: Container Must Be Running

**Check Container Status:**
```bash
docker ps --filter "name=clean-cut-mcp"
```

**Should Show:**
```
NAMES           STATUS    PORTS
clean-cut-mcp   Up X min  0.0.0.0:6970->6970/tcp
```

**If Not Running:**
```bash
docker run -d --name clean-cut-mcp -p 6970:6970 -v "$(pwd)/clean-cut-exports:/workspace/out" clean-cut-mcp
```

### Step 3: Test Configuration Manually

**From Windows Command Prompt/PowerShell:**
```cmd
echo {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}} | "C:\Program Files\Docker\Docker\resources\bin\docker.exe" exec -i clean-cut-mcp node /app/mcp-server/dist/clean-stdio-server.js
```

**Expected Response:**
```json
{"result":{"tools":[{"name":"create_custom_animation",...},{"name":"get_studio_url",...}]},"jsonrpc":"2.0","id":1}
```

### Step 4: Restart Claude Desktop

**Important:** Claude Desktop only loads MCP config on startup
1. Close Claude Desktop completely
2. Update the config file
3. Restart Claude Desktop
4. Look for MCP server status indicator in UI

### Step 5: Verify Connection in Claude Desktop

**Check for:**
1. **MCP Server Status**: Should show "running" indicator for clean-cut-mcp
2. **Available Tools**: Ask "What MCP tools are available?"
3. **Expected Response**: Should list `create_custom_animation` and `get_studio_url`

**Test Animation Creation:**
1. Ask: "Create a bouncing blue ball animation"
2. Claude should use `create_custom_animation` tool
3. Should respond with success message and Studio URL
4. Check http://localhost:6970 to see the animation

## Manual Verification Results ✅

**MCP Server Test:** ✅ PASSED
```bash
# Created BouncingredballAnimation.tsx successfully
# Updated Root.tsx with new animation
# File exists at: /workspace/src/BouncingredballAnimation.tsx
```

**Remotion Studio:** ✅ ACCESSIBLE at http://localhost:6970

**Docker Exec Command:** ✅ WORKING from command line

## Common Issues and Solutions

### Issue: "Cannot connect to MCP server"
**Solution:** Use full Docker path in config, not just "docker"

### Issue: "'C:\Program' is not recognized"
**Solution:** Use proper JSON escaping: `"C:\\Program Files\\Docker\\..."`

### Issue: "Connection closed unexpectedly"
**Solution:** Add `"transport": "stdio"` to config

### Issue: "No MCP tools appear"
**Solution:** Restart Claude Desktop completely after config changes

### Issue: Container not accessible
**Solution:** Verify container is running and ports are mapped correctly

## Alternative: HTTP Transport (If STDIO Fails)

If STDIO continues to fail, the container also has an HTTP MCP server available:

**Start HTTP Server:**
```bash
docker exec -d clean-cut-mcp node /app/mcp-server/dist/http-mcp-server.js
```

**HTTP Config:**
```json
{
  "mcpServers": {
    "clean-cut-mcp": {
      "url": "http://localhost:6971/mcp",
      "transport": "http"
    }
  }
}
```

## Expected Workflow After Fix

1. **User:** "Create a twinkling star animation"
2. **Claude Desktop:** Uses `create_custom_animation` tool
3. **MCP Server:** Generates React/Remotion code, writes `.tsx` file
4. **Response:** "Animation created! View at http://localhost:6970"
5. **User:** Opens Studio, sees animation, can export video

The system is fully functional - only the Claude Desktop configuration needs to be corrected.