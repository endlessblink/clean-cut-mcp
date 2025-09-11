Write-Host "=== CLEAN-CUT-MCP QUICK DIAGNOSTIC ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1] CONTAINER STATUS" -ForegroundColor Yellow
try {
    $containers = wsl docker ps -a --filter "name=clean-cut-mcp" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
    if ($containers) {
        Write-Host $containers -ForegroundColor White
    } else {
        Write-Host "No clean-cut-mcp container found!" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n[2] CONTAINER LOGS" -ForegroundColor Yellow
try {
    $logs = wsl docker logs clean-cut-mcp --tail 10 2>$null
    if ($logs) {
        Write-Host $logs -ForegroundColor Gray
    } else {
        Write-Host "No logs available" -ForegroundColor Red
    }
} catch {
    Write-Host "Error getting logs: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n[3] PORT BINDINGS" -ForegroundColor Yellow
try {
    $ports = wsl docker port clean-cut-mcp 2>$null
    if ($ports) {
        Write-Host $ports -ForegroundColor White
    } else {
        Write-Host "No port bindings found" -ForegroundColor Red
    }
} catch {
    Write-Host "Error getting ports: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n[4] INTERNAL SERVICE CHECK" -ForegroundColor Yellow
try {
    $internal = wsl docker exec clean-cut-mcp curl -s localhost:6961/health 2>$null
    if ($internal) {
        Write-Host "Internal health check: $internal" -ForegroundColor Green
    } else {
        Write-Host "Internal health check failed" -ForegroundColor Red
    }
} catch {
    Write-Host "Cannot check internal services: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n[5] WSL2 CONNECTIVITY TEST" -ForegroundColor Yellow
try {
    $wslTest = wsl curl -s -w "HTTP_CODE:%{http_code}" "http://localhost:6961/health" 2>$null
    if ($wslTest) {
        Write-Host "WSL2 test: $wslTest" -ForegroundColor Green
    } else {
        Write-Host "WSL2 test failed" -ForegroundColor Red
    }
} catch {
    Write-Host "WSL2 test error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n[6] WINDOWS CONNECTION TEST" -ForegroundColor Yellow
$testIPs = @("localhost", "127.0.0.1", "192.168.5.45")
foreach ($ip in $testIPs) {
    try {
        $healthUrl = "http://${ip}:6961/health"
        $response = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 3 -ErrorAction Stop
        Write-Host "Windows test $ip`: SUCCESS" -ForegroundColor Green
        Write-Host "Response: $response" -ForegroundColor White
        break
    } catch {
        Write-Host "Windows test $ip`: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== DIAGNOSTIC COMPLETE ===" -ForegroundColor Cyan
Write-Host "Press Enter to close..." -ForegroundColor Gray
Read-Host