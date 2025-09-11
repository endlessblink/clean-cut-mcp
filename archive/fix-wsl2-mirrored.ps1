#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Complete WSL2 Networking Fix for Clean-Cut-MCP
    
.DESCRIPTION
    Implements WSL2 mirrored networking mode as primary solution,
    with automatic port forwarding fallback if needed.
    
.EXAMPLE
    .\fix-wsl2-mirrored.ps1
    Complete networking fix with automatic fallback
#>

param(
    [switch]$SkipMirrored,
    [switch]$TestOnly
)

$ErrorActionPreference = "Stop"

function Write-NetLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" } 
        "SUCCESS" { "Green" }
        default { "Cyan" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-MCPConnection {
    param([string]$Url = "http://localhost:6961/health")
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5 -ErrorAction Stop
        if ($response.status -eq "healthy") {
            return $true
        }
    }
    catch {
        # Silent failure for testing
    }
    return $false
}

Write-NetLog "=== Clean-Cut-MCP WSL2 Networking Fix ===" "INFO"
Write-NetLog "Container should be running in WSL2 Docker" "INFO"

# Test current connectivity
Write-NetLog "Testing current Windows -> WSL2 connectivity..." "INFO"
if (Test-MCPConnection) {
    Write-NetLog "SUCCESS: Connection already working!" "SUCCESS"
    if ($TestOnly) { exit 0 }
}

if (-not $SkipMirrored) {
    Write-NetLog "Implementing WSL2 Mirrored Networking Mode..." "INFO"
    
    # Create .wslconfig with mirrored networking
    $wslConfigPath = "$env:USERPROFILE\.wslconfig"
    $wslConfig = @"
[wsl2]
networkingMode=mirrored
dnsTunneling=true
firewall=true

[experimental]
hostAddressLoopback=true
"@

    Write-NetLog "Creating/updating $wslConfigPath" "INFO"
    $wslConfig | Out-File $wslConfigPath -Encoding UTF8 -Force
    
    Write-NetLog "Restarting WSL2 to apply mirrored networking..." "INFO"
    wsl --shutdown
    Start-Sleep -Seconds 5
    
    # Start WSL2 back up
    Write-NetLog "Starting WSL2..." "INFO"
    wsl -d Ubuntu -e echo "WSL2 restarted with mirrored networking"
    Start-Sleep -Seconds 3
    
    # Test mirrored mode
    Write-NetLog "Testing mirrored networking..." "INFO"
    if (Test-MCPConnection) {
        Write-NetLog "SUCCESS: Mirrored networking working perfectly!" "SUCCESS"
        Write-NetLog "No port forwarding needed. Clean-Cut-MCP ready!" "SUCCESS"
        if ($TestOnly) { exit 0 }
        return
    }
    else {
        Write-NetLog "Mirrored mode didn't resolve connectivity, trying port forwarding..." "WARN"
    }
}

# Fallback: Port forwarding approach
Write-NetLog "Implementing port forwarding fallback..." "INFO"

# Get WSL2 IP
try {
    $wsl2IP = (wsl hostname -I).Trim().Split()[0]
    Write-NetLog "WSL2 IP detected: $wsl2IP" "INFO"
}
catch {
    Write-NetLog "ERROR: Cannot get WSL2 IP address" "ERROR"
    exit 1
}

# Remove existing port proxy rules
Write-NetLog "Clearing existing port forwarding rules..." "INFO"
netsh interface portproxy delete v4tov4 listenport=6960 listenaddress=127.0.0.1 2>$null
netsh interface portproxy delete v4tov4 listenport=6961 listenaddress=127.0.0.1 2>$null

# Add new port forwarding rules
Write-NetLog "Adding port forwarding rules..." "INFO"
try {
    netsh interface portproxy add v4tov4 listenport=6960 listenaddress=127.0.0.1 connectport=6960 connectaddress=$wsl2IP
    netsh interface portproxy add v4tov4 listenport=6961 listenaddress=127.0.0.1 connectport=6961 connectaddress=$wsl2IP
    Write-NetLog "Port forwarding rules added successfully" "SUCCESS"
}
catch {
    Write-NetLog "ERROR: Failed to add port forwarding rules" "ERROR"
    exit 1
}

# Test connection after port forwarding
Start-Sleep -Seconds 2
Write-NetLog "Testing connection after port forwarding..." "INFO"
if (Test-MCPConnection) {
    Write-NetLog "SUCCESS: Port forwarding working!" "SUCCESS"
    Write-NetLog "Clean-Cut-MCP accessible at localhost:6961" "SUCCESS"
}
else {
    Write-NetLog "ERROR: Connection still failing. Check Windows Firewall." "ERROR"
    Write-NetLog "Manual test: Invoke-RestMethod http://localhost:6961/health" "INFO"
    exit 1
}

Write-NetLog "=== Networking Fix Complete ===" "SUCCESS"
Write-NetLog "Claude Desktop should now connect to Clean-Cut-MCP" "SUCCESS"