# Claude Desktop MCP Connection Diagnostic Script
# Run this in PowerShell to test the exact same commands Claude Desktop would use

Write-Host "=== Claude Desktop MCP Connection Test ===" -ForegroundColor Green

# Test 1: Check if Docker is accessible
Write-Host "`n1. Testing Docker accessibility..." -ForegroundColor Yellow
try {
    $dockerPath = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
    if (Test-Path $dockerPath) {
        Write-Host "✅ Docker executable found at: $dockerPath" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker executable not found at: $dockerPath" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error accessing Docker path: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Check container status
Write-Host "`n2. Testing container access..." -ForegroundColor Yellow
try {
    $containerStatus = & $dockerPath ps --filter "name=clean-cut-mcp" --format "table {{.Names}}\t{{.Status}}"
    Write-Host "Container Status:" -ForegroundColor Blue
    Write-Host $containerStatus
    
    if ($containerStatus -match "clean-cut-mcp") {
        Write-Host "✅ Container is accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Container not found or not running" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error checking container: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Test MCP STDIO connection (exact Claude Desktop command)
Write-Host "`n3. Testing MCP STDIO connection..." -ForegroundColor Yellow
try {
    $mcpRequest = '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}'
    
    # This is the EXACT command Claude Desktop would execute
    $mcpResponse = $mcpRequest | & $dockerPath exec -i clean-cut-mcp node /app/mcp-server/dist/clean-stdio-server.js
    
    Write-Host "MCP Response:" -ForegroundColor Blue
    Write-Host $mcpResponse
    
    if ($mcpResponse -match '"create_custom_animation"') {
        Write-Host "✅ MCP server responds correctly" -ForegroundColor Green
    } else {
        Write-Host "❌ MCP server response invalid" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error testing MCP connection: $_" -ForegroundColor Red
    exit 1
}

# Test 4: Test animation creation
Write-Host "`n4. Testing animation creation..." -ForegroundColor Yellow
try {
    $animationRequest = '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "create_custom_animation", "arguments": {"description": "test bouncing ball", "duration": 2}}}'
    
    $animationResponse = $animationRequest | & $dockerPath exec -i clean-cut-mcp node /app/mcp-server/dist/clean-stdio-server.js
    
    Write-Host "Animation Creation Response:" -ForegroundColor Blue
    Write-Host $animationResponse
    
    if ($animationResponse -match '"CUSTOM ANIMATION CREATED"') {
        Write-Host "✅ Animation creation works" -ForegroundColor Green
    } else {
        Write-Host "❌ Animation creation failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error testing animation creation: $_" -ForegroundColor Red
}

# Test 5: Check Claude Desktop config location
Write-Host "`n5. Checking Claude Desktop configuration..." -ForegroundColor Yellow
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $configPath) {
    Write-Host "✅ Claude Desktop config found at: $configPath" -ForegroundColor Green
    
    try {
        $config = Get-Content $configPath -Raw | ConvertFrom-Json
        if ($config.mcpServers.'clean-cut-mcp') {
            Write-Host "✅ clean-cut-mcp server found in config" -ForegroundColor Green
            Write-Host "Config:" -ForegroundColor Blue
            Write-Host ($config.mcpServers.'clean-cut-mcp' | ConvertTo-Json -Depth 3)
        } else {
            Write-Host "❌ clean-cut-mcp server not found in config" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error parsing config file: $_" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Claude Desktop config not found at: $configPath" -ForegroundColor Red
}

Write-Host "`n=== Summary ===" -ForegroundColor Green
Write-Host "If all tests pass, Claude Desktop should be able to connect."
Write-Host "If Claude Desktop still doesn't show MCP tools:"
Write-Host "1. Completely restart Claude Desktop (not just refresh)"
Write-Host "2. Look for MCP server status indicators in Claude Desktop UI"
Write-Host "3. Check Claude Desktop logs for connection errors"
Write-Host "4. Try asking 'What MCP tools are available?'"

Write-Host "`nRemote Studio URL: http://localhost:6970" -ForegroundColor Cyan