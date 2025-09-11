#Requires -Version 5.1

<#
.SYNOPSIS
    Fix Clean-Cut-MCP Port Binding Issue
.DESCRIPTION
    Recreates the container with proper port binding to Windows
#>

Write-Host "=== FIXING PORT BINDING ISSUE ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[STEP 1] Stopping and removing existing container..." -ForegroundColor Yellow
try {
    wsl docker stop clean-cut-mcp 2>$null | Out-Null
    wsl docker rm clean-cut-mcp 2>$null | Out-Null
    Write-Host "[SUCCESS] Existing container removed" -ForegroundColor Green
} catch {
    Write-Host "[INFO] No existing container to remove" -ForegroundColor Gray
}

Write-Host "`n[STEP 2] Starting container with proper port binding..." -ForegroundColor Yellow
try {
    # Start with explicit port binding to all interfaces (0.0.0.0)
    $containerId = wsl docker run -d --name clean-cut-mcp -p 0.0.0.0:6960:6960 -p 0.0.0.0:6961:6961 clean-cut-mcp 2>$null
    
    if ($containerId) {
        Write-Host "[SUCCESS] Container started with ID: $($containerId.Substring(0,12))" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to start container" -ForegroundColor Red
        Write-Host "[INFO] Checking if image exists..." -ForegroundColor Gray
        
        $imageExists = wsl docker images clean-cut-mcp -q 2>$null
        if (-not $imageExists) {
            Write-Host "[BUILD] Building Docker image first..." -ForegroundColor Yellow
            wsl docker build -t clean-cut-mcp .
            
            # Try starting container again
            $containerId = wsl docker run -d --name clean-cut-mcp -p 0.0.0.0:6960:6960 -p 0.0.0.0:6961:6961 clean-cut-mcp 2>$null
            
            if ($containerId) {
                Write-Host "[SUCCESS] Container started after build" -ForegroundColor Green
            } else {
                Write-Host "[ERROR] Still failed to start container" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "[ERROR] Image exists but container won't start" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "[ERROR] Container start failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n[STEP 3] Waiting for container to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n[STEP 4] Verifying port bindings..." -ForegroundColor Yellow
try {
    $ports = wsl docker port clean-cut-mcp 2>$null
    if ($ports) {
        Write-Host "[SUCCESS] Port bindings active:" -ForegroundColor Green
        Write-Host $ports -ForegroundColor White
    } else {
        Write-Host "[ERROR] Still no port bindings!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Cannot check port bindings: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n[STEP 5] Testing connections..." -ForegroundColor Yellow

# Test localhost first (most likely to work)
try {
    $response = Invoke-RestMethod -Uri "http://localhost:6961/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[SUCCESS] localhost:6961 is working!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor White
    
    Write-Host "`n[COMPLETE] Port binding fix successful!" -ForegroundColor Green
    Write-Host "MCP Server: http://localhost:6961/mcp" -ForegroundColor Cyan
    Write-Host "Remotion Studio: http://localhost:6960" -ForegroundColor Cyan
    
} catch {
    Write-Host "[WARNING] localhost test failed: $($_.Exception.Message)" -ForegroundColor Yellow
    
    # Try 127.0.0.1 as backup
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:6961/health" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "[SUCCESS] 127.0.0.1:6961 is working!" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor White
        
        Write-Host "`n[COMPLETE] Port binding fix successful!" -ForegroundColor Green
        Write-Host "MCP Server: http://127.0.0.1:6961/mcp" -ForegroundColor Cyan  
        Write-Host "Remotion Studio: http://127.0.0.1:6960" -ForegroundColor Cyan
        
    } catch {
        Write-Host "[ERROR] Both localhost and 127.0.0.1 failed" -ForegroundColor Red
        Write-Host "This may be a Windows Firewall or Docker Desktop issue" -ForegroundColor Yellow
        
        Write-Host "`nTry these manual steps:" -ForegroundColor Yellow
        Write-Host "1. Restart Docker Desktop completely" -ForegroundColor White
        Write-Host "2. Check Windows Firewall settings" -ForegroundColor White
        Write-Host "3. Try: netsh advfirewall firewall add rule name='clean-cut-mcp' dir=in action=allow protocol=TCP localport=6961" -ForegroundColor Gray
    }
}

Write-Host "`nPress Enter to close..." -ForegroundColor Gray
Read-Host