#Requires -Version 5.1

<#
.SYNOPSIS
    Simple Test Script for Clean-Cut-MCP Connection
.DESCRIPTION
    Tests if we can connect to the clean-cut-mcp container directly
#>

$ErrorActionPreference = 'Continue'

Write-Host "[TEST] Clean-Cut-MCP Connection Test" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if WSL2 is available
Write-Host "[1] Testing WSL2 availability..." -ForegroundColor Yellow
try {
    $wslStatus = wsl --status 2>$null
    if ($wslStatus) {
        Write-Host "[SUCCESS] WSL2 is available" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] WSL2 not available" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] WSL2 test failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Get WSL2 IP methods
Write-Host "`n[2] Testing WSL2 IP detection methods..." -ForegroundColor Yellow

Write-Host "Method 1 - hostname -I:" -ForegroundColor Gray
$ip1 = wsl hostname -I 2>$null
Write-Host "  Raw result: '$ip1'" -ForegroundColor White
if ($ip1) {
    $cleanIP1 = ($ip1.Trim() -split '\s+')[0]
    Write-Host "  Cleaned: '$cleanIP1'" -ForegroundColor White
}

Write-Host "Method 2 - ip addr eth0:" -ForegroundColor Gray
$ip2 = wsl sh -c "ip addr show eth0 | grep 'inet ' | awk '{print \$2}' | cut -d/ -f1" 2>$null
Write-Host "  Raw result: '$ip2'" -ForegroundColor White

Write-Host "Method 3 - ip route default:" -ForegroundColor Gray
$ip3 = wsl bash -c "ip route | grep default | awk '{print \$3}'" 2>$null
Write-Host "  Raw result: '$ip3'" -ForegroundColor White

# Test 3: Use the most likely IP
$testIP = "192.168.5.45"
Write-Host "`n[3] Testing connection to $testIP..." -ForegroundColor Yellow

# Build URLs with explicit string formatting
$healthUrl = "http://${testIP}:6961/health"
$statusUrl = "http://${testIP}:6961/status"
$testUrls = @($healthUrl, $statusUrl)

foreach ($url in $testUrls) {
    Write-Host "Testing: $url" -ForegroundColor Gray
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 5 -ErrorAction Stop
        Write-Host "[SUCCESS] $url responded!" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor White
    } catch {
        Write-Host "[ERROR] $url failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Check Docker container status
Write-Host "`n[4] Checking Docker container status..." -ForegroundColor Yellow
try {
    $containerStatus = wsl docker ps -a --filter "name=clean-cut-mcp" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
    if ($containerStatus) {
        Write-Host "[INFO] Container status:" -ForegroundColor Green
        Write-Host "$containerStatus" -ForegroundColor White
    } else {
        Write-Host "[ERROR] No clean-cut-mcp container found" -ForegroundColor Red
    }
} catch {
    Write-Host "[ERROR] Docker check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n[COMPLETE] Connection test finished" -ForegroundColor Cyan
Write-Host "Press Enter to exit..." -ForegroundColor Gray
Read-Host