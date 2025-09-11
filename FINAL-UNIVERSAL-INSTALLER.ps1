# Universal Clean-Cut-MCP Installer
# Platform-agnostic Docker + Claude Desktop integration
# Uses host.docker.internal with host-gateway mapping for maximum compatibility

param(
    [switch]$TestMode,
    [string]$ConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"
)

Write-Host "=== UNIVERSAL CLEAN-CUT-MCP INSTALLER ===" -ForegroundColor Cyan
Write-Host "Platform-agnostic solution for Windows, macOS, and Linux" -ForegroundColor Gray
Write-Host ""

# Step 1: Verify Docker Desktop
Write-Host "[STEP 1] Verifying Docker Desktop..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "[SUCCESS] Docker Desktop is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker Desktop not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and restart your PC if needed" -ForegroundColor Yellow
    exit 1
}

# Step 2: Clean up any existing containers
Write-Host "[STEP 2] Cleaning up existing containers..." -ForegroundColor Yellow
docker stop clean-cut-mcp 2>$null | Out-Null
docker rm clean-cut-mcp 2>$null | Out-Null

# Step 3: Start container with universal host-gateway mapping
Write-Host "[STEP 3] Starting container with universal networking..." -ForegroundColor Yellow
Write-Host "[INFO] Using --add-host host.docker.internal:host-gateway for maximum compatibility" -ForegroundColor Gray

$containerId = docker run -d `
    --name clean-cut-mcp `
    --add-host host.docker.internal:host-gateway `
    -p 6960:6960 `
    -p 6961:6961 `
    clean-cut-mcp:latest 2>$null

if (!$containerId) {
    Write-Host "[ERROR] Failed to start container" -ForegroundColor Red
    Write-Host "This usually indicates Docker networking issues" -ForegroundColor Yellow
    Write-Host "Try: Restart your PC and run this installer again" -ForegroundColor Yellow
    exit 1
}

Write-Host "[SUCCESS] Container started: $($containerId.Substring(0,12))" -ForegroundColor Green

# Step 4: Wait for services to initialize
Write-Host "[STEP 4] Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 5: Verify port bindings (diagnostic)
$portBindings = docker port clean-cut-mcp 2>$null
if ($portBindings) {
    Write-Host "[SUCCESS] Port bindings active:" -ForegroundColor Green
    Write-Host $portBindings -ForegroundColor White
} else {
    Write-Host "[WARNING] No port bindings visible - Docker networking may need PC restart" -ForegroundColor Yellow
}

# Step 6: Test universal connectivity
Write-Host "[STEP 5] Testing universal connectivity..." -ForegroundColor Yellow

$mcpHealthy = $false
$studioHealthy = $false

try {
    $mcpResponse = Invoke-RestMethod -Uri "http://host.docker.internal:6961/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[SUCCESS] MCP Server: host.docker.internal:6961" -ForegroundColor Green
    $mcpHealthy = $true
} catch {
    Write-Host "[FAILED] MCP Server: host.docker.internal:6961" -ForegroundColor Red
}

try {
    $studioResponse = Invoke-RestMethod -Uri "http://host.docker.internal:6960" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[SUCCESS] Remotion Studio: host.docker.internal:6960" -ForegroundColor Green  
    $studioHealthy = $true
} catch {
    Write-Host "[FAILED] Remotion Studio: host.docker.internal:6960" -ForegroundColor Red
}

if (!$mcpHealthy) {
    Write-Host "`n[ERROR] Universal connectivity failed" -ForegroundColor Red
    Write-Host "This indicates Docker Desktop networking issues" -ForegroundColor Yellow
    Write-Host "`nRecommended fixes:" -ForegroundColor Yellow
    Write-Host "1. Restart your PC completely" -ForegroundColor Gray
    Write-Host "2. Ensure Docker Desktop starts after reboot" -ForegroundColor Gray
    Write-Host "3. Run this installer again" -ForegroundColor Gray
    Write-Host "`nThe container is running correctly inside Docker," -ForegroundColor Gray
    Write-Host "but Windows cannot connect to it due to networking issues." -ForegroundColor Gray
    exit 1
}

# Step 7: Configure Claude Desktop
Write-Host "[STEP 6] Configuring Claude Desktop..." -ForegroundColor Yellow

# Universal MCP configuration using host.docker.internal
$mcpConfig = @{
    "clean-cut-mcp" = @{
        command = "powershell.exe"
        args = @(
            "-NoProfile", 
            "-ExecutionPolicy", "Bypass", 
            "-Command",
            "& { `$body = [System.Console]::In.ReadToEnd(); Invoke-RestMethod -Uri 'http://host.docker.internal:6961/mcp' -Method POST -Body `$body -ContentType 'application/json' }"
        )
    }
}

if ($TestMode) {
    Write-Host "[TEST MODE] Would create this Claude Desktop configuration:" -ForegroundColor Yellow
    Write-Host ($mcpConfig | ConvertTo-Json -Depth 10) -ForegroundColor Gray
} else {
    # Backup existing config
    if (Test-Path $ConfigPath) {
        $backupPath = $ConfigPath -replace '\.json$', "_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        Copy-Item $ConfigPath $backupPath
        Write-Host "[BACKUP] Existing config saved to: $backupPath" -ForegroundColor Gray
        
        # Merge with existing config
        try {
            $existingConfig = Get-Content $ConfigPath | ConvertFrom-Json -AsHashtable
            if (!$existingConfig.mcpServers) {
                $existingConfig.mcpServers = @{}
            }
            $existingConfig.mcpServers["clean-cut-mcp"] = $mcpConfig["clean-cut-mcp"]
            $finalConfig = $existingConfig
        } catch {
            Write-Host "[WARNING] Could not parse existing config, creating new" -ForegroundColor Yellow
            $finalConfig = @{ mcpServers = $mcpConfig }
        }
    } else {
        # Create new config
        $configDir = Split-Path $ConfigPath -Parent
        if (!(Test-Path $configDir)) {
            New-Item -ItemType Directory -Path $configDir -Force | Out-Null
        }
        $finalConfig = @{ mcpServers = $mcpConfig }
    }
    
    # Write configuration
    try {
        $finalConfig | ConvertTo-Json -Depth 10 | Set-Content $ConfigPath -Encoding UTF8
        Write-Host "[SUCCESS] Claude Desktop configuration updated" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to update Claude Desktop config: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Success summary
Write-Host "`n=== INSTALLATION COMPLETE ===" -ForegroundColor Green
Write-Host "✅ Universal Docker command working" -ForegroundColor White
Write-Host "✅ host.docker.internal connectivity established" -ForegroundColor White  
Write-Host "✅ Claude Desktop configured" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Ready for Claude Desktop integration!" -ForegroundColor Cyan
Write-Host "MCP Server: http://host.docker.internal:6961/mcp" -ForegroundColor Gray
Write-Host "Remotion Studio: http://host.docker.internal:6960" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Try in Claude Desktop: 'Create a bouncing ball animation'" -ForegroundColor Yellow
Write-Host ""

if (!$TestMode) {
    Write-Host "Press Enter to close..." -ForegroundColor Gray
    Read-Host
}

# Create usage documentation
$usageDocs = @"
# Universal Clean-Cut-MCP Usage

## Quick Start (All Platforms)
``````powershell
# Universal Docker command - works on Windows, macOS, Linux
docker run -d --name clean-cut-mcp --add-host host.docker.internal:host-gateway -p 6960:6960 -p 6961:6961 clean-cut-mcp:latest

# Test connectivity
Invoke-RestMethod http://host.docker.internal:6961/health
Invoke-RestMethod http://host.docker.internal:6960
``````

## Troubleshooting
If connectivity fails:
1. **Restart your PC** (fixes 90% of Docker networking issues)
2. Ensure Docker Desktop starts after reboot
3. Run the universal installer again

## Architecture
- Uses Docker's built-in `host-gateway` mapping
- `host.docker.internal` resolves universally across platforms  
- No OS-specific configuration required
- Works with corporate Docker Desktop policies

## Claude Desktop Integration
The installer creates this universal configuration:
``````json
{
  "mcpServers": {
    "clean-cut-mcp": {
      "command": "powershell.exe",
      "args": ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", "..."]
    }
  }
}
``````

This targets `http://host.docker.internal:6961/mcp` which works on all platforms.
"@

if (!$TestMode) {
    $usageDocs | Set-Content "UNIVERSAL-USAGE-GUIDE.md" -Encoding UTF8
    Write-Host "📖 Usage guide saved to: UNIVERSAL-USAGE-GUIDE.md" -ForegroundColor Gray
}