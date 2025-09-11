#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Clean-Cut-MCP - Complete Installation from Scratch
    
.DESCRIPTION
    Installs and configures Clean-Cut-MCP on a fresh Windows system.
    Assumes Docker Desktop and WSL2 are already installed.
    
.PARAMETER SkipBuild
    Skip Docker container build (if already built)
    
.PARAMETER SkipNetworkFix
    Skip networking configuration (if already working)
    
.EXAMPLE
    .\INSTALL-FROM-SCRATCH.ps1
    Complete installation from scratch
    
.EXAMPLE  
    .\INSTALL-FROM-SCRATCH.ps1 -SkipBuild
    Install without rebuilding Docker container
#>

param(
    [switch]$SkipBuild,
    [switch]$SkipNetworkFix,
    [switch]$TestMode
)

$ErrorActionPreference = "Stop"

function Write-InstallLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" } 
        "SUCCESS" { "Green" }
        "SECTION" { "Magenta" }
        default { "Cyan" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Test-Prerequisites {
    Write-InstallLog "Checking prerequisites..." "INFO"
    
    # Check if running as Administrator
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $isAdmin) {
        Write-InstallLog "ERROR: This script requires Administrator privileges" "ERROR"
        return $false
    }
    
    # Check WSL2
    try {
        $wslVersion = wsl --status 2>$null
        Write-InstallLog "✅ WSL2 is available" "SUCCESS"
    }
    catch {
        Write-InstallLog "❌ WSL2 not found or not working" "ERROR"
        return $false
    }
    
    # Check Docker
    try {
        docker --version | Out-Null
        Write-InstallLog "✅ Docker is available" "SUCCESS"
    }
    catch {
        Write-InstallLog "❌ Docker not found or not working" "ERROR"
        return $false
    }
    
    # Check Claude Desktop config directory
    $claudeDir = "$env:APPDATA\Claude"
    if (-not (Test-Path $claudeDir)) {
        Write-InstallLog "⚠️ Claude Desktop not detected, will create config anyway" "WARN"
    } else {
        Write-InstallLog "✅ Claude Desktop config directory found" "SUCCESS"
    }
    
    return $true
}

function Start-DockerContainer {
    Write-InstallLog "=== DOCKER CONTAINER SETUP ===" "SECTION"
    
    # Stop and remove existing container
    Write-InstallLog "Cleaning up existing container..." "INFO"
    docker stop clean-cut-mcp 2>$null | Out-Null
    docker rm clean-cut-mcp 2>$null | Out-Null
    
    if (-not $SkipBuild) {
        # Build container in WSL2
        Write-InstallLog "Building Docker container in WSL2..." "INFO"
        $buildResult = wsl -d Ubuntu -e bash -c "cd '/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/clean-cut-mcp' && docker build -t clean-cut-mcp . 2>&1"
        
        if ($LASTEXITCODE -eq 0) {
            Write-InstallLog "✅ Docker container built successfully" "SUCCESS"
        } else {
            Write-InstallLog "❌ Docker build failed: $buildResult" "ERROR"
            throw "Container build failed"
        }
    } else {
        Write-InstallLog "Skipping container build..." "INFO"
    }
    
    # Start container
    Write-InstallLog "Starting Clean-Cut-MCP container..." "INFO"
    docker run -d --name clean-cut-mcp -p 6960:6960 -p 6961:6961 clean-cut-mcp
    
    if ($LASTEXITCODE -eq 0) {
        Write-InstallLog "✅ Container started successfully" "SUCCESS"
    } else {
        throw "Failed to start container"
    }
    
    # Wait for container to be healthy
    Write-InstallLog "Waiting for container to be healthy..." "INFO"
    $maxAttempts = 12
    $attempts = 0
    
    do {
        Start-Sleep -Seconds 5
        $attempts++
        $containerStatus = docker ps --filter "name=clean-cut-mcp" --format "{{.Status}}"
        
        if ($containerStatus -like "*healthy*") {
            Write-InstallLog "✅ Container is healthy and ready" "SUCCESS"
            return $true
        }
        
        Write-InstallLog "Container status: $containerStatus (attempt $attempts/$maxAttempts)" "INFO"
    } while ($attempts -lt $maxAttempts)
    
    Write-InstallLog "⚠️ Container may not be fully healthy yet, continuing..." "WARN"
    return $true
}

# MAIN INSTALLATION PROCESS
Write-InstallLog "=== CLEAN-CUT-MCP INSTALLATION FROM SCRATCH ===" "SECTION"
Write-InstallLog "Starting complete installation process..." "INFO"

try {
    # Step 1: Prerequisites
    if (-not (Test-Prerequisites)) {
        Write-InstallLog "Prerequisites check failed. Please install required software first." "ERROR"
        Write-InstallLog "See FRESH-INSTALL-SETUP.md for detailed requirements" "INFO"
        exit 1
    }
    
    # Step 2: Docker Container
    Start-DockerContainer
    
    # Step 3: Network Fix
    if (-not $SkipNetworkFix) {
        Write-InstallLog "=== NETWORK CONFIGURATION ===" "SECTION"
        
        if (Test-Path "./COMPLETE-NETWORK-FIX.ps1") {
            Write-InstallLog "Running complete network fix..." "INFO"
            & "./COMPLETE-NETWORK-FIX.ps1" -TestOnly:$TestMode
        } else {
            Write-InstallLog "⚠️ Network fix script not found, manual configuration may be needed" "WARN"
        }
    }
    
    # Step 4: Final Validation
    Write-InstallLog "=== FINAL VALIDATION ===" "SECTION"
    
    # Test container health
    try {
        $healthResponse = Invoke-RestMethod -Uri "http://localhost:6961/health" -Method Get -TimeoutSec 10
        Write-InstallLog "✅ MCP server health check passed" "SUCCESS"
        Write-InstallLog "Response: $($healthResponse | ConvertTo-Json -Compress)" "INFO"
    }
    catch {
        Write-InstallLog "⚠️ MCP server health check failed: $($_.Exception.Message)" "WARN"
        Write-InstallLog "This may indicate networking issues need manual fixing" "WARN"
    }
    
    # Test Remotion Studio
    try {
        $studioResponse = Invoke-WebRequest -Uri "http://localhost:6960" -Method Get -TimeoutSec 5 -UseBasicParsing
        if ($studioResponse.StatusCode -eq 200) {
            Write-InstallLog "✅ Remotion Studio accessible" "SUCCESS"
        }
    }
    catch {
        Write-InstallLog "⚠️ Remotion Studio not accessible: $($_.Exception.Message)" "WARN"
    }
    
    # Installation Summary
    Write-InstallLog "=== INSTALLATION COMPLETE ===" "SUCCESS"
    Write-InstallLog "" "INFO"
    Write-InstallLog "🎯 NEXT STEPS:" "SECTION"
    Write-InstallLog "1. Start Claude Desktop" "INFO"
    Write-InstallLog "2. Verify no JSON parsing errors" "INFO"
    Write-InstallLog "3. Test: Ask Claude 'Create a bouncing ball animation'" "INFO"
    Write-InstallLog "4. Expected: 'Animation ready at http://localhost:6960'" "INFO"
    Write-InstallLog "" "INFO"
    Write-InstallLog "🔧 TROUBLESHOOTING:" "SECTION"
    Write-InstallLog "- Config issues: Run FIX-CONFIG.bat" "INFO"
    Write-InstallLog "- Network issues: Run COMPLETE-NETWORK-FIX.ps1" "INFO"
    Write-InstallLog "- Container issues: Check docker logs clean-cut-mcp" "INFO"
    Write-InstallLog "" "INFO"
    Write-InstallLog "🎉 ONE-SCRIPT MAGIC SHOULD BE READY!" "SUCCESS"
    
}
catch {
    Write-InstallLog "INSTALLATION FAILED: $($_.Exception.Message)" "ERROR"
    Write-InstallLog "Check the error above and run manual steps from FRESH-INSTALL-SETUP.md" "ERROR"
    exit 1
}