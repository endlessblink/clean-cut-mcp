<#
.SYNOPSIS
    Zero Admin Required - Claude Desktop Fix for WSL2
    
.DESCRIPTION
    Uses WSL2 IP directly - NO ADMIN PRIVILEGES REQUIRED
    Perfect for "One-Script Magic" user experience
#>

$ErrorActionPreference = "Stop"

function Write-ZeroLog {
    param([string]$Message, [string]$Level = "INFO")
    $color = switch($Level) {
        "ERROR" { "Red" }
        "SUCCESS" { "Green" }
        "WARN" { "Yellow" }
        default { "Cyan" }
    }
    Write-Host $Message -ForegroundColor $color
}

Write-ZeroLog "=== ZERO-ADMIN CLAUDE DESKTOP FIX ===" "INFO"
Write-ZeroLog "No administrator privileges required!" "SUCCESS"

# Step 1: Get WSL2 IP address
Write-ZeroLog "Getting WSL2 IP address..." "INFO"
try {
    $wslIP = (wsl hostname -I).Trim()
    Write-ZeroLog "WSL2 IP: $wslIP" "SUCCESS"
}
catch {
    Write-ZeroLog "ERROR: Cannot get WSL2 IP. Is WSL2 running?" "ERROR"
    Write-ZeroLog "Try: wsl --status" "INFO"
    exit 1
}

# Step 2: Test connectivity to WSL2 container
Write-ZeroLog "Testing WSL2 container health..." "INFO"
try {
    $healthUrl = "http://$wslIP:6961/health"
    $response = Invoke-RestMethod $healthUrl -TimeoutSec 5
    if ($response.status -eq "healthy") {
        Write-ZeroLog "Container health check passed!" "SUCCESS"
        Write-ZeroLog "MCP Server: http://$wslIP:6961/mcp" "SUCCESS"
        Write-ZeroLog "Remotion Studio: http://$wslIP:6960" "SUCCESS"
    }
}
catch {
    Write-ZeroLog "ERROR: Cannot reach container. Is clean-cut-mcp running?" "ERROR"
    Write-ZeroLog "Try: docker ps --filter name=clean-cut-mcp" "INFO"
    exit 1
}

# Step 3: Kill Claude processes  
Write-ZeroLog "Stopping Claude Desktop..." "INFO"
Get-Process -Name "Claude*" -ErrorAction SilentlyContinue | Stop-Process -Force

# Step 4: Create backup of existing config
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $configPath) {
    $backupPath = "$configPath.zero-admin-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $configPath $backupPath
    Write-ZeroLog "Backup created: $backupPath" "INFO"
}

# Step 5: Read existing config and merge safely
$finalConfig = @{
    mcpServers = @{}
}

# Preserve existing servers (like desktop-commander)
if (Test-Path $configPath) {
    try {
        $existingConfig = Get-Content $configPath -Raw | ConvertFrom-Json
        if ($existingConfig.mcpServers) {
            $existingConfig.mcpServers.PSObject.Properties | ForEach-Object {
                if ($_.Name -ne "clean-cut-mcp") {
                    $finalConfig.mcpServers[$_.Name] = $_.Value
                }
            }
        }
    }
    catch {
        Write-ZeroLog "Existing config corrupted, starting fresh" "WARN"
    }
}

# Step 6: Add clean-cut-mcp with WSL2 IP (NO localhost!)
$finalConfig.mcpServers["clean-cut-mcp"] = @{
    url = "http://$wslIP:6961/mcp"
}

# Step 7: Write config with proper JSON
$configJson = $finalConfig | ConvertTo-Json -Depth 10 -Compress:$false
$configJson | Out-File $configPath -Encoding UTF8

# Step 8: Validate JSON syntax
try {
    $null = Get-Content $configPath -Raw | ConvertFrom-Json -ErrorAction Stop
    Write-ZeroLog "JSON validation passed!" "SUCCESS"
}
catch {
    Write-ZeroLog "JSON validation failed: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Step 9: Show final result
Write-ZeroLog "" "INFO"
Write-ZeroLog "=== CONFIGURATION COMPLETE ===" "SUCCESS"
Write-ZeroLog "Using WSL2 IP: $wslIP (no localhost issues)" "SUCCESS"
Write-ZeroLog "Config location: $configPath" "INFO"
Write-ZeroLog "" "INFO"
Write-ZeroLog "ENDPOINTS READY:" "SUCCESS"
Write-ZeroLog "  MCP Server: http://$wslIP:6961/mcp" "SUCCESS"
Write-ZeroLog "  Remotion Studio: http://$wslIP:6960" "SUCCESS"
Write-ZeroLog "  Health Check: http://$wslIP:6961/health" "SUCCESS"
Write-ZeroLog "" "INFO"
Write-ZeroLog "NEXT STEPS:" "INFO"
Write-ZeroLog "1. Start Claude Desktop" "INFO"
Write-ZeroLog "2. Ask: 'Create a bouncing ball animation'" "INFO"
Write-ZeroLog "3. Expect: 'Animation ready at http://$wslIP:6960'" "INFO"
Write-ZeroLog "" "INFO"
Write-ZeroLog "One-Script Magic is ready! [ZERO ADMIN REQUIRED]" "SUCCESS"