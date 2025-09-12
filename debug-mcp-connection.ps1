#!/usr/bin/env pwsh
# Debug MCP Connection Issues
# Check what's preventing Claude Desktop from using our enhanced tools

Write-Host "=== MCP Connection Debug ===" -ForegroundColor Cyan

# 1. Check if our container is running
Write-Host "`n1. Checking Docker Container Status..." -ForegroundColor Yellow
$container = docker ps --filter "name=clean-cut-mcp" --format "{{.Names}}\t{{.Status}}\t{{.Ports}}"
if ($container) {
    Write-Host "✅ Container running: $container" -ForegroundColor Green
} else {
    Write-Host "❌ Container NOT running!" -ForegroundColor Red
    Write-Host "Run: .\start-clean-cut.sh" -ForegroundColor Yellow
    exit 1
}

# 2. Test our STDIO bridge directly
Write-Host "`n2. Testing STDIO Bridge Tool List..." -ForegroundColor Yellow
$testInput = @"
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{"roots":{"listChanged":true},"sampling":{},"logging":{}},"clientInfo":{"name":"claude-desktop","version":"1.0.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
"@

$result = $testInput | docker exec -i clean-cut-mcp node /app/mcp-server/dist/stdio-bridge.js

# Parse the result to check for enhanced tools
if ($result -match "create_custom_animation") {
    Write-Host "✅ Enhanced tools found in STDIO bridge" -ForegroundColor Green
} else {
    Write-Host "❌ Enhanced tools NOT found in STDIO bridge!" -ForegroundColor Red
}

if ($result -match "create_animation.*bouncing-ball") {
    Write-Host "⚠️  Old generic tools still present" -ForegroundColor Yellow
}

# 3. Check Claude Desktop config file
Write-Host "`n3. Checking Claude Desktop Config..." -ForegroundColor Yellow
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $configPath) {
    Write-Host "✅ Config file exists: $configPath" -ForegroundColor Green
    $config = Get-Content $configPath | ConvertFrom-Json
    
    if ($config.mcpServers."clean-cut-mcp") {
        Write-Host "✅ clean-cut-mcp server configured" -ForegroundColor Green
        $serverConfig = $config.mcpServers."clean-cut-mcp"
        Write-Host "   Command: $($serverConfig.command)" -ForegroundColor Cyan
        Write-Host "   Args: $($serverConfig.args -join ' ')" -ForegroundColor Cyan
    } else {
        Write-Host "❌ clean-cut-mcp server NOT configured!" -ForegroundColor Red
        Write-Host "Available servers: $($config.mcpServers | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Config file NOT found: $configPath" -ForegroundColor Red
}

# 4. Check for conflicting MCP servers
Write-Host "`n4. Checking for MCP Server Name Conflicts..." -ForegroundColor Yellow
if (Test-Path $configPath) {
    $config = Get-Content $configPath | ConvertFrom-Json
    $allServers = $config.mcpServers | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
    Write-Host "All configured MCP servers:" -ForegroundColor Cyan
    foreach ($server in $allServers) {
        if ($server -like "*clean*" -or $server -like "*cut*" -or $server -like "*animation*") {
            Write-Host "   ⚠️  $server (POTENTIAL CONFLICT)" -ForegroundColor Yellow
        } else {
            Write-Host "   $server" -ForegroundColor White
        }
    }
}

# 5. Test exact command Claude Desktop would run
Write-Host "`n5. Testing Exact Claude Desktop Command..." -ForegroundColor Yellow
try {
    $testCommand = "docker exec -i clean-cut-mcp node /app/mcp-server/dist/stdio-bridge.js"
    Write-Host "Testing: $testCommand" -ForegroundColor Cyan
    
    # This simulates what Claude Desktop does
    $process = Start-Process -FilePath "docker" -ArgumentList "exec", "-i", "clean-cut-mcp", "node", "/app/mcp-server/dist/stdio-bridge.js" -NoNewWindow -PassThru
    Start-Sleep -Seconds 2
    
    if (!$process.HasExited) {
        Write-Host "✅ Command starts successfully (process running)" -ForegroundColor Green
        $process.Kill()
    } else {
        Write-Host "❌ Command failed to start" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Command execution failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== RECOMMENDATIONS ===" -ForegroundColor Cyan
Write-Host "1. If container is not running: .\start-clean-cut.sh" -ForegroundColor White
Write-Host "2. If enhanced tools not found: Rebuild container" -ForegroundColor White  
Write-Host "3. If config not found: Check config file location" -ForegroundColor White
Write-Host "4. If name conflicts exist: Rename MCP server" -ForegroundColor White
Write-Host "5. If command fails: Check Docker permissions" -ForegroundColor White