#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Complete WSL2 Networking Fix - Mirrored Mode + Port Forwarding + Claude Config
    
.DESCRIPTION
    Implements the complete solution for WSL2 to Windows networking issues:
    1. WSL2 Mirrored Networking Mode (preferred)
    2. Port Forwarding Fallback (if mirrored mode fails)
    3. Clean-Cut-MCP Configuration (automatic)
    
.EXAMPLE
    .\COMPLETE-NETWORK-FIX.ps1
    Run complete networking fix and configure Claude Desktop
#>

param(
    [switch]$SkipMirrored,
    [switch]$SkipPortForwarding,
    [switch]$TestOnly
)

$ErrorActionPreference = "Stop"

function Write-NetworkLog {
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

function Test-NetworkConnectivity {
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

Write-NetworkLog "=== COMPLETE WSL2 NETWORKING FIX ===" "INFO"
Write-NetworkLog "Clean-Cut-MCP Docker container should be running" "INFO"

# Check if running as Administrator
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-NetworkLog "ERROR: This script requires Administrator privileges" "ERROR"
    Write-NetworkLog "Please run PowerShell as Administrator and try again" "ERROR"
    exit 1
}

# Test current connectivity
Write-NetworkLog "Testing current Windows → WSL2 connectivity..." "INFO"
if (Test-NetworkConnectivity) {
    Write-NetworkLog "SUCCESS: Connection already working!" "SUCCESS"
    if ($TestOnly) { exit 0 }
} else {
    Write-NetworkLog "Connection not working, applying fixes..." "WARN"
}

# STEP 1: WSL2 MIRRORED NETWORKING MODE
if (-not $SkipMirrored) {
    Write-NetworkLog "=== STEP 1: WSL2 Mirrored Networking Mode ===" "INFO"
    
    $wslConfigPath = "$env:USERPROFILE\.wslconfig"
    $wslConfig = @"
[wsl2]
networkingMode=mirrored
dnsTunneling=true
firewall=true

[experimental]
hostAddressLoopback=true
"@

    Write-NetworkLog "Creating/updating $wslConfigPath" "INFO"
    $wslConfig | Out-File $wslConfigPath -Encoding UTF8 -Force
    
    Write-NetworkLog "Restarting WSL2 to apply mirrored networking..." "INFO"
    wsl --shutdown
    Start-Sleep -Seconds 5
    
    # Start WSL2 back up
    Write-NetworkLog "Starting WSL2..." "INFO"
    try {
        wsl -d Ubuntu -e echo "WSL2 restarted with mirrored networking" | Out-Null
    } catch {
        Write-NetworkLog "Warning: Could not start Ubuntu distribution" "WARN"
    }
    Start-Sleep -Seconds 5
    
    # Test mirrored mode
    Write-NetworkLog "Testing mirrored networking..." "INFO"
    if (Test-NetworkConnectivity) {
        Write-NetworkLog "SUCCESS: Mirrored networking working perfectly!" "SUCCESS"
        Write-NetworkLog "No port forwarding needed. Proceeding to Claude config..." "SUCCESS"
        $networkingFixed = $true
    } else {
        Write-NetworkLog "Mirrored mode didn't work, trying port forwarding..." "WARN"
        $networkingFixed = $false
    }
} else {
    Write-NetworkLog "Skipping mirrored networking mode..." "INFO"
    $networkingFixed = $false
}

# STEP 2: PORT FORWARDING FALLBACK
if (-not $networkingFixed -and -not $SkipPortForwarding) {
    Write-NetworkLog "=== STEP 2: Port Forwarding Fallback ===" "INFO"
    
    # Get WSL2 IP
    try {
        $wsl2IP = (wsl hostname -I 2>$null)
        if ($wsl2IP) {
            $wsl2IP = ($wsl2IP -split '\s+')[0].Trim()
            Write-NetworkLog "WSL2 IP detected: $wsl2IP" "INFO"
        } else {
            throw "Could not get WSL2 IP"
        }
    }
    catch {
        Write-NetworkLog "ERROR: Cannot get WSL2 IP address" "ERROR"
        Write-NetworkLog "Make sure WSL2 is running with Ubuntu distribution" "ERROR"
        exit 1
    }
    
    # Remove existing port proxy rules
    Write-NetworkLog "Clearing existing port forwarding rules..." "INFO"
    netsh interface portproxy delete v4tov4 listenport=6960 listenaddress=127.0.0.1 2>$null
    netsh interface portproxy delete v4tov4 listenport=6961 listenaddress=127.0.0.1 2>$null
    
    # Add new port forwarding rules
    Write-NetworkLog "Adding port forwarding rules..." "INFO"
    try {
        netsh interface portproxy add v4tov4 listenport=6960 listenaddress=127.0.0.1 connectport=6960 connectaddress=$wsl2IP
        netsh interface portproxy add v4tov4 listenport=6961 listenaddress=127.0.0.1 connectport=6961 connectaddress=$wsl2IP
        Write-NetworkLog "Port forwarding rules added successfully" "SUCCESS"
    }
    catch {
        Write-NetworkLog "ERROR: Failed to add port forwarding rules" "ERROR"
        exit 1
    }
    
    # Test connection after port forwarding
    Start-Sleep -Seconds 3
    Write-NetworkLog "Testing connection after port forwarding..." "INFO"
    if (Test-NetworkConnectivity) {
        Write-NetworkLog "SUCCESS: Port forwarding working!" "SUCCESS"
        $networkingFixed = $true
    } else {
        Write-NetworkLog "ERROR: Connection still failing after port forwarding" "ERROR"
        Write-NetworkLog "Check Windows Firewall settings" "WARN"
    }
}

# STEP 3: CONFIGURE CLAUDE DESKTOP
if ($networkingFixed -and -not $TestOnly) {
    Write-NetworkLog "=== STEP 3: Configure Claude Desktop ===" "INFO"
    
    if (Test-Path "./safe-claude-config.ps1") {
        Write-NetworkLog "Running safe Claude Desktop configuration..." "INFO"
        try {
            & "./safe-claude-config.ps1"
            Write-NetworkLog "Claude Desktop configured successfully!" "SUCCESS"
        }
        catch {
            Write-NetworkLog "Claude Desktop configuration failed: $($_.Exception.Message)" "ERROR"
        }
    } else {
        Write-NetworkLog "safe-claude-config.ps1 not found, skipping Claude config" "WARN"
    }
}

# FINAL SUMMARY
Write-NetworkLog "=== NETWORKING FIX COMPLETE ===" "SUCCESS"

if ($networkingFixed) {
    Write-NetworkLog "✅ WSL2 to Windows networking is working" "SUCCESS"
    Write-NetworkLog "✅ MCP server accessible at: http://localhost:6961" "SUCCESS"
    Write-NetworkLog "✅ Remotion Studio accessible at: http://localhost:6960" "SUCCESS"
    
    if (-not $TestOnly) {
        Write-NetworkLog "🚀 ONE-SCRIPT MAGIC READY!" "SUCCESS"
        Write-NetworkLog "Ask Claude Desktop: 'Create a bouncing ball animation'" "SUCCESS"
        Write-NetworkLog "Expected response: 'Animation ready at http://localhost:6960'" "SUCCESS"
    }
} else {
    Write-NetworkLog "❌ Networking fix failed" "ERROR"
    Write-NetworkLog "Manual troubleshooting required:" "ERROR"
    Write-NetworkLog "1. Check Windows Firewall settings" "ERROR"
    Write-NetworkLog "2. Verify WSL2 distribution is running" "ERROR"
    Write-NetworkLog "3. Check Docker container status" "ERROR"
}

Write-NetworkLog "Script completed." "INFO"