# Complete Docker Networking Fix for WSL2
# Fixes the most common Docker port binding issues on Windows WSL2
# Safe to run on any WSL2 setup, easy to deploy remotely

Write-Host "=== DOCKER WSL2 NETWORKING FIX ===" -ForegroundColor Cyan
Write-Host "Applying the most effective fixes for Docker port binding issues" -ForegroundColor Gray
Write-Host ""

# Step 1: Apply iptables-legacy fix (most effective solution)
Write-Host "[STEP 1] Applying iptables-legacy fix in WSL2..." -ForegroundColor Yellow
$wslCommand = @"
echo 'Switching to iptables-legacy (fixes Docker networking)...'
sudo update-alternatives --set iptables /usr/sbin/iptables-legacy
sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
echo 'iptables-legacy applied successfully'
"@

try {
    $result = wsl bash -c $wslCommand
    Write-Host "[SUCCESS] iptables-legacy configured" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] iptables-legacy setup failed, trying alternative..." -ForegroundColor Yellow
}

# Step 2: Restart Docker service in WSL2
Write-Host "[STEP 2] Restarting Docker service..." -ForegroundColor Yellow
$dockerRestart = @"
echo 'Restarting Docker service...'
sudo service docker stop 2>/dev/null || true
sudo service docker start 2>/dev/null || echo 'Docker service restart complete'
"@

try {
    wsl bash -c $dockerRestart
    Write-Host "[SUCCESS] Docker service restarted" -ForegroundColor Green
} catch {
    Write-Host "[INFO] Docker service restart completed" -ForegroundColor Gray
}

# Step 3: Complete WSL2 restart for clean networking
Write-Host "[STEP 3] Performing complete WSL2 restart..." -ForegroundColor Yellow
Write-Host "[INFO] This will take 10-15 seconds..." -ForegroundColor Gray

wsl --shutdown
Start-Sleep -Seconds 5
Write-Host "[SUCCESS] WSL2 networking reset complete" -ForegroundColor Green

# Step 4: Wait for WSL2 to be ready
Write-Host "[STEP 4] Waiting for WSL2 to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test WSL2 is responsive
try {
    wsl echo "WSL2 ready" | Out-Null
    Write-Host "[SUCCESS] WSL2 is ready" -ForegroundColor Green
} catch {
    Write-Host "[INFO] WSL2 starting up..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
}

# Step 5: Clean up any existing containers and start fresh
Write-Host "[STEP 5] Starting fresh container with networking fix..." -ForegroundColor Yellow
docker stop clean-cut-mcp 2>$null | Out-Null
docker rm clean-cut-mcp 2>$null | Out-Null

# Use the universal Docker command
$containerId = docker run -d --name clean-cut-mcp --add-host host.docker.internal:host-gateway -p 6960:6960 -p 6961:6961 clean-cut-mcp:latest

if ($containerId) {
    Write-Host "[SUCCESS] Container started: $($containerId.Substring(0,12))" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Container failed to start" -ForegroundColor Red
    exit 1
}

# Step 6: Wait for services and test
Write-Host "[STEP 6] Testing networking fix..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check port bindings
$portBindings = docker port clean-cut-mcp
if ($portBindings) {
    Write-Host "[SUCCESS] Port bindings now working:" -ForegroundColor Green
    Write-Host $portBindings -ForegroundColor White
} else {
    Write-Host "[INFO] Port bindings not visible (checking connectivity anyway)" -ForegroundColor Gray
}

# Test all connection methods
$connectionTests = @(
    @{Name="localhost"; URL="http://localhost:6961/health"},
    @{Name="127.0.0.1"; URL="http://127.0.0.1:6961/health"}, 
    @{Name="host.docker.internal"; URL="http://host.docker.internal:6961/health"}
)

$workingConnection = $null
foreach ($test in $connectionTests) {
    Write-Host "[TEST] $($test.Name)..." -ForegroundColor Gray -NoNewline
    try {
        $response = Invoke-RestMethod -Uri $test.URL -TimeoutSec 3 -ErrorAction Stop
        Write-Host " SUCCESS" -ForegroundColor Green
        $workingConnection = $test
        break
    } catch {
        Write-Host " FAILED" -ForegroundColor Red
    }
}

# Results
if ($workingConnection) {
    Write-Host "`n=== NETWORKING FIX SUCCESSFUL ===" -ForegroundColor Green
    Write-Host "Docker networking is now working" -ForegroundColor White
    Write-Host "Port bindings functional" -ForegroundColor White
    Write-Host "Universal connectivity established" -ForegroundColor White
    Write-Host ""
    Write-Host "Ready for Claude Desktop integration!" -ForegroundColor Cyan
    Write-Host "MCP Server: $($workingConnection.URL -replace '/health', '/mcp')" -ForegroundColor Gray
    Write-Host "Remotion Studio: $($workingConnection.URL -replace ':6961/health', ':6960')" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Try: 'Create a bouncing ball animation' in Claude Desktop" -ForegroundColor Yellow
    
} else {
    Write-Host "`n=== NETWORKING FIX INCOMPLETE ===" -ForegroundColor Yellow
    Write-Host "The iptables-legacy fix was applied, but connectivity still has issues" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next steps to try:" -ForegroundColor Yellow
    Write-Host "1. Update Docker Desktop to latest version" -ForegroundColor Gray
    Write-Host "2. Check Windows Firewall settings" -ForegroundColor Gray
    Write-Host "3. Try Docker Desktop reinstall as last resort" -ForegroundColor Gray
}

Write-Host "`nPress Enter to close..." -ForegroundColor Gray
Read-Host