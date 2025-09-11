# Clean-Cut-MCP - Docker Restart Fix
# Handles Docker Desktop networking issues with automatic restart and reconnection

Write-Host "=== DOCKER DESKTOP NETWORKING FIX ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Docker is running
Write-Host "[STEP 1] Checking Docker Desktop status..." -ForegroundColor Yellow
$dockerRunning = $false
try {
    docker version | Out-Null
    $dockerRunning = $true
    Write-Host "[SUCCESS] Docker Desktop is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker Desktop is not running" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and run this script again" -ForegroundColor Yellow
    exit 1
}

# Step 2: Stop container cleanly
Write-Host "[STEP 2] Stopping clean-cut-mcp container..." -ForegroundColor Yellow
docker stop clean-cut-mcp 2>$null | Out-Null

# Step 3: Restart Docker Desktop
Write-Host "[STEP 3] Restarting Docker Desktop to fix networking..." -ForegroundColor Yellow
Write-Host "[INFO] This will take 30-60 seconds..." -ForegroundColor Gray

# Kill Docker processes
Get-Process "*docker*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait for processes to fully stop
Start-Sleep -Seconds 5

# Restart Docker Desktop
Write-Host "[INFO] Starting Docker Desktop..." -ForegroundColor Gray
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -WindowStyle Hidden

# Wait for Docker to fully start
Write-Host "[INFO] Waiting for Docker to start..." -ForegroundColor Gray
$attempts = 0
$maxAttempts = 30
$dockerReady = $false

while ($attempts -lt $maxAttempts -and !$dockerReady) {
    Start-Sleep -Seconds 2
    $attempts++
    try {
        docker version | Out-Null
        $dockerReady = $true
        Write-Host "[SUCCESS] Docker Desktop is ready" -ForegroundColor Green
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if (!$dockerReady) {
    Write-Host "`n[ERROR] Docker Desktop failed to start after $($maxAttempts * 2) seconds" -ForegroundColor Red
    exit 1
}

# Step 4: Restart container
Write-Host "[STEP 4] Starting clean-cut-mcp container..." -ForegroundColor Yellow
$containerId = docker run -d --name clean-cut-mcp -p 6960:6960 -p 6961:6961 clean-cut-mcp 2>$null

if ($containerId) {
    Write-Host "[SUCCESS] Container started: $($containerId.Substring(0,12))" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to start container" -ForegroundColor Red
    # Remove any existing container and try again
    docker rm clean-cut-mcp 2>$null | Out-Null
    $containerId = docker run -d --name clean-cut-mcp -p 6960:6960 -p 6961:6961 clean-cut-mcp
    if ($containerId) {
        Write-Host "[RETRY SUCCESS] Container started: $($containerId.Substring(0,12))" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Container start failed completely" -ForegroundColor Red
        exit 1
    }
}

# Step 5: Wait for services to start
Write-Host "[STEP 5] Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 6: Test all connection methods
Write-Host "[STEP 6] Testing connection methods..." -ForegroundColor Yellow

$workingEndpoint = $null
$testEndpoints = @(
    @{Name="localhost"; URL="http://localhost:6961/health"},
    @{Name="127.0.0.1"; URL="http://127.0.0.1:6961/health"},
    @{Name="host.docker.internal"; URL="http://host.docker.internal:6961/health"}
)

foreach ($endpoint in $testEndpoints) {
    Write-Host "[TEST] Testing $($endpoint.Name)..." -ForegroundColor Gray -NoNewline
    try {
        $response = Invoke-RestMethod -Uri $endpoint.URL -TimeoutSec 5 -ErrorAction Stop
        Write-Host " SUCCESS" -ForegroundColor Green
        $workingEndpoint = $endpoint
        break
    } catch {
        Write-Host " FAILED" -ForegroundColor Red
    }
}

if ($workingEndpoint) {
    Write-Host "`n[COMPLETE] Docker networking is now working!" -ForegroundColor Green
    Write-Host "MCP Server: $($workingEndpoint.URL -replace '/health', '/mcp')" -ForegroundColor Cyan
    Write-Host "Remotion Studio: $($workingEndpoint.URL -replace ':6961/health', ':6960')" -ForegroundColor Cyan
    
    Write-Host "`n[NEXT] Ready for Claude Desktop configuration!" -ForegroundColor Yellow
    
} else {
    Write-Host "`n[WARNING] Connection still failing after restart" -ForegroundColor Yellow
    Write-Host "This may indicate a deeper Docker Desktop configuration issue" -ForegroundColor Gray
    Write-Host "`nTry these manual steps:" -ForegroundColor Yellow
    Write-Host "1. Open Docker Desktop Settings" -ForegroundColor Gray
    Write-Host "2. Go to General > Network" -ForegroundColor Gray
    Write-Host "3. Try switching network modes and restart" -ForegroundColor Gray
}

Write-Host "`nPress Enter to close..." -ForegroundColor Gray
Read-Host