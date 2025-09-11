Write-Host "=== REBUILDING WITH FIXED SERVER BINDING ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[STEP 1] Stopping existing container..." -ForegroundColor Yellow
wsl docker stop clean-cut-mcp 2>$null | Out-Null
wsl docker rm clean-cut-mcp 2>$null | Out-Null

Write-Host "[STEP 2] Rebuilding Docker image with fixed server binding..." -ForegroundColor Yellow
$buildResult = wsl docker build -t clean-cut-mcp . 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Docker image rebuilt successfully" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Docker build failed:" -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Gray
    exit 1
}

Write-Host "[STEP 3] Starting container with proper port binding..." -ForegroundColor Yellow
$containerId = wsl docker run -d --name clean-cut-mcp -p 0.0.0.0:6960:6960 -p 0.0.0.0:6961:6961 clean-cut-mcp 2>$null

if ($containerId) {
    Write-Host "[SUCCESS] Container started: $($containerId.Substring(0,12))" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to start container" -ForegroundColor Red
    exit 1
}

Write-Host "[STEP 4] Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "[STEP 5] Testing port bindings..." -ForegroundColor Yellow
$ports = wsl docker port clean-cut-mcp 2>$null
if ($ports) {
    Write-Host "[SUCCESS] Port bindings active:" -ForegroundColor Green
    Write-Host $ports -ForegroundColor White
} else {
    Write-Host "[ERROR] Still no port bindings!" -ForegroundColor Red
    exit 1
}

Write-Host "[STEP 6] Testing connections..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:6961/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[SUCCESS] HTTP connection working!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor White
    
    Write-Host "`n[COMPLETE] Rebuild successful!" -ForegroundColor Green
    Write-Host "MCP Server: http://localhost:6961/mcp" -ForegroundColor Cyan
    Write-Host "Remotion Studio: http://localhost:6960" -ForegroundColor Cyan
    
} catch {
    Write-Host "[ERROR] Connection still failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "This may indicate additional networking issues" -ForegroundColor Yellow
}

Write-Host "`nPress Enter to close..." -ForegroundColor Gray
Read-Host