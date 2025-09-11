# Universal Clean-Cut-MCP Installer for Claude Desktop
# Handles all connection methods and Docker networking scenarios

param(
    [switch]$TestMode,
    [string]$ConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"
)

Write-Host "=== UNIVERSAL CLEAN-CUT-MCP INSTALLER ===" -ForegroundColor Cyan
Write-Host "Cross-platform Docker + Claude Desktop integration" -ForegroundColor Gray
Write-Host ""

# Step 1: Verify Docker and container
Write-Host "[STEP 1] Verifying Docker container..." -ForegroundColor Yellow
try {
    $containerStatus = docker ps --filter name=clean-cut-mcp --format "{{.Status}}" 2>$null
    if (!$containerStatus) {
        Write-Host "[INFO] Container not running, starting..." -ForegroundColor Gray
        docker run -d --name clean-cut-mcp -p 6960:6960 -p 6961:6961 clean-cut-mcp | Out-Null
        Start-Sleep -Seconds 8
    }
    Write-Host "[SUCCESS] Container is ready" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker not available or container failed" -ForegroundColor Red
    Write-Host "Run: .\docker-restart-fix.ps1" -ForegroundColor Yellow
    exit 1
}

# Step 2: Test all connection methods
Write-Host "[STEP 2] Testing connection methods..." -ForegroundColor Yellow

$connectionMethods = @(
    @{Name="localhost"; URL="http://localhost:6961"; Priority=1},
    @{Name="127.0.0.1"; URL="http://127.0.0.1:6961"; Priority=2},
    @{Name="host.docker.internal"; URL="http://host.docker.internal:6961"; Priority=3}
)

# Add container direct IP as fallback
try {
    $containerIP = docker inspect clean-cut-mcp --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 2>$null
    if ($containerIP) {
        $connectionMethods += @{Name="container-direct"; URL="http://${containerIP}:6961"; Priority=4}
    }
} catch {}

$workingMethod = $null
$connectionMethods | Sort-Object Priority | ForEach-Object {
    if (!$workingMethod) {
        $method = $_
        Write-Host "[TEST] $($method.Name)..." -ForegroundColor Gray -NoNewline
        try {
            $response = Invoke-RestMethod -Uri "$($method.URL)/health" -TimeoutSec 3 -ErrorAction Stop
            Write-Host " SUCCESS" -ForegroundColor Green
            $workingMethod = $method
        } catch {
            Write-Host " FAILED" -ForegroundColor Red
        }
    }
}

if (!$workingMethod) {
    Write-Host "[ERROR] No working connection method found" -ForegroundColor Red
    Write-Host "Run: .\docker-restart-fix.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "[SUCCESS] Using connection: $($workingMethod.Name)" -ForegroundColor Green

# Step 3: Create Claude Desktop configuration
Write-Host "[STEP 3] Configuring Claude Desktop..." -ForegroundColor Yellow

$mcpEndpoint = "$($workingMethod.URL)/mcp"
$studioUrl = $workingMethod.URL -replace ':6961', ':6960'

# Create MCP server configuration
$mcpConfig = @{
    clean_cut_mcp = @{
        command = "powershell.exe"
        args = @(
            "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command",
            "& {
                `$headers = @{'Content-Type'='application/json'}
                `$body = [System.Console]::In.ReadToEnd()
                `$response = Invoke-RestMethod -Uri '$mcpEndpoint' -Method POST -Body `$body -Headers `$headers
                `$response | ConvertTo-Json -Compress
            }"
        )
    }
}

# Step 4: Update Claude Desktop config safely
if ($TestMode) {
    Write-Host "[TEST MODE] Would create this configuration:" -ForegroundColor Yellow
    Write-Host ($mcpConfig | ConvertTo-Json -Depth 10) -ForegroundColor Gray
} else {
    # Backup existing config
    if (Test-Path $ConfigPath) {
        $backupPath = $ConfigPath -replace '\.json$', "_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        Copy-Item $ConfigPath $backupPath
        Write-Host "[BACKUP] Saved existing config to: $backupPath" -ForegroundColor Gray
        
        # Load and merge existing config
        try {
            $existingConfig = Get-Content $ConfigPath | ConvertFrom-Json
            if ($existingConfig.mcpServers) {
                $existingConfig.mcpServers | Add-Member -NotePropertyMembers $mcpConfig.clean_cut_mcp -NotePropertyName "clean_cut_mcp" -Force
                $mcpConfig = @{mcpServers = $existingConfig.mcpServers}
            } else {
                $mcpConfig = @{mcpServers = $mcpConfig}
            }
        } catch {
            Write-Host "[WARNING] Could not parse existing config, creating new" -ForegroundColor Yellow
            $mcpConfig = @{mcpServers = $mcpConfig}
        }
    } else {
        # Create directory if it doesn't exist
        $configDir = Split-Path $ConfigPath -Parent
        if (!(Test-Path $configDir)) {
            New-Item -ItemType Directory -Path $configDir -Force | Out-Null
        }
        $mcpConfig = @{mcpServers = $mcpConfig}
    }
    
    # Write new config
    try {
        $mcpConfig | ConvertTo-Json -Depth 10 | Set-Content $ConfigPath -Encoding UTF8
        Write-Host "[SUCCESS] Claude Desktop configuration updated" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Failed to write Claude Desktop config: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Step 5: Final verification
Write-Host "[STEP 4] Final verification..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "$($workingMethod.URL)/health" -TimeoutSec 5
    Write-Host "[SUCCESS] MCP Server is healthy" -ForegroundColor Green
    
    $studioCheck = Invoke-RestMethod -Uri $studioUrl -TimeoutSec 5
    Write-Host "[SUCCESS] Remotion Studio is accessible" -ForegroundColor Green
    
} catch {
    Write-Host "[WARNING] Service verification failed, but config is created" -ForegroundColor Yellow
}

# Success summary
Write-Host "`n=== INSTALLATION COMPLETE ===" -ForegroundColor Green
Write-Host "MCP Server: $mcpEndpoint" -ForegroundColor Cyan
Write-Host "Remotion Studio: $studioUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Claude Desktop will connect automatically on next restart" -ForegroundColor Yellow
Write-Host "Try: 'Create a bouncing ball animation'" -ForegroundColor Gray
Write-Host ""

if (!$TestMode) {
    Write-Host "Press Enter to close..." -ForegroundColor Gray
    Read-Host
}