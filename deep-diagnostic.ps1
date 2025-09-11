#Requires -Version 5.1

<#
.SYNOPSIS
    Deep Diagnostic for Clean-Cut-MCP Connection Issues
.DESCRIPTION
    Comprehensive debugging to find why container connections fail
#>

$ErrorActionPreference = 'Continue'

function Write-Diag {
    param([string]$Message, [string]$Type = "Info")
    $colors = @{ "Info" = "White"; "Success" = "Green"; "Warning" = "Yellow"; "Error" = "Red"; "Step" = "Cyan"; "Debug" = "Gray" }
    Write-Host $Message -ForegroundColor $colors[$Type]
}

Clear-Host
Write-Diag "=== DEEP DIAGNOSTIC FOR CLEAN-CUT-MCP ===" -Type Step
Write-Host ""

# 1. Container Status Deep Dive
Write-Diag "[1] CONTAINER STATUS ANALYSIS" -Type Step
Write-Diag "─────────────────────────────────────" -Type Debug

Write-Diag "Container List:" -Type Info
try {
    $containers = wsl docker ps -a --filter "name=clean-cut-mcp" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}" 2>$null
    if ($containers) {
        Write-Diag "$containers" -Type Debug
    } else {
        Write-Diag "No clean-cut-mcp container found!" -Type Error
    }
} catch {
    Write-Diag "Error getting container status: $($_.Exception.Message)" -Type Error
}

Write-Diag "`nContainer Logs (last 20 lines):" -Type Info
try {
    $logs = wsl docker logs clean-cut-mcp --tail 20 2>$null
    if ($logs) {
        Write-Diag "$logs" -Type Debug
    } else {
        Write-Diag "No logs available or container not found" -Type Warning
    }
} catch {
    Write-Diag "Error getting container logs: $($_.Exception.Message)" -Type Error
}

Write-Diag "`nContainer Process List:" -Type Info
try {
    $processes = wsl docker exec clean-cut-mcp ps aux 2>$null
    if ($processes) {
        Write-Diag "$processes" -Type Debug
    } else {
        Write-Diag "Cannot access container processes" -Type Warning
    }
} catch {
    Write-Diag "Error getting container processes: $($_.Exception.Message)" -Type Error
}

# 2. Network Analysis
Write-Host ""
Write-Diag "[2] NETWORK ANALYSIS" -Type Step  
Write-Diag "────────────────────" -Type Debug

Write-Diag "Container Network Settings:" -Type Info
try {
    $networkInfo = wsl docker inspect clean-cut-mcp --format "{{.NetworkSettings.IPAddress}} {{.NetworkSettings.Ports}}" 2>$null
    if ($networkInfo) {
        Write-Diag "$networkInfo" -Type Debug
    }
} catch {
    Write-Diag "Error getting network info: $($_.Exception.Message)" -Type Error
}

Write-Diag "`nPort Bindings:" -Type Info
try {
    $portInfo = wsl docker port clean-cut-mcp 2>$null
    if ($portInfo) {
        Write-Diag "$portInfo" -Type Debug
    } else {
        Write-Diag "No port bindings found" -Type Warning
    }
} catch {
    Write-Diag "Error getting port info: $($_.Exception.Message)" -Type Error
}

# 3. Direct WSL2 Testing
Write-Host ""
Write-Diag "[3] DIRECT WSL2 TESTING" -Type Step
Write-Diag "───────────────────────" -Type Debug

Write-Diag "Testing from inside WSL2:" -Type Info

$testUrls = @(
    "http://localhost:6960",
    "http://localhost:6961", 
    "http://localhost:6961/health",
    "http://127.0.0.1:6961/health"
)

foreach ($url in $testUrls) {
    Write-Diag "Testing: $url" -Type Info
    try {
        $result = wsl curl -s -w "HTTP_CODE:%{http_code} TIME:%{time_total}s" $url 2>$null
        if ($result) {
            Write-Diag "  Result: $result" -Type Debug
        } else {
            Write-Diag "  No response" -Type Warning
        }
    } catch {
        Write-Diag "  Error: $($_.Exception.Message)" -Type Error
    }
}

# 4. Container Internal Testing
Write-Host ""
Write-Diag "[4] CONTAINER INTERNAL TESTING" -Type Step
Write-Diag "──────────────────────────────" -Type Debug

Write-Diag "Testing services inside container:" -Type Info
try {
    # Test if services are listening inside container
    $listening = wsl docker exec clean-cut-mcp netstat -tlnp 2>$null
    if ($listening) {
        Write-Diag "Listening ports inside container:" -Type Info
        Write-Diag "$listening" -Type Debug
    }
} catch {
    Write-Diag "Cannot check container internal ports" -Type Warning
}

try {
    # Test internal health check
    $internalHealth = wsl docker exec clean-cut-mcp curl -s localhost:6961/health 2>$null
    if ($internalHealth) {
        Write-Diag "Internal health check result:" -Type Info
        Write-Diag "$internalHealth" -Type Debug
    } else {
        Write-Diag "Internal health check failed" -Type Error
    }
} catch {
    Write-Diag "Cannot perform internal health check" -Type Error
}

# 5. Windows Firewall Check
Write-Host ""
Write-Diag "[5] WINDOWS FIREWALL CHECK" -Type Step
Write-Diag "───────────────────────────" -Type Debug

Write-Diag "Checking Windows Firewall rules for ports 6960-6961:" -Type Info
try {
    $firewallRules = Get-NetFirewallRule | Where-Object { $_.DisplayName -like "*6960*" -or $_.DisplayName -like "*6961*" -or $_.DisplayName -like "*clean-cut*" }
    if ($firewallRules) {
        $firewallRules | ForEach-Object {
            Write-Diag "  Rule: $($_.DisplayName) - $($_.Action)" -Type Debug
        }
    } else {
        Write-Diag "No specific firewall rules found for these ports" -Type Warning
    }
} catch {
    Write-Diag "Cannot check Windows Firewall: $($_.Exception.Message)" -Type Error
}

# 6. Alternative Connection Methods
Write-Host ""
Write-Diag "[6] ALTERNATIVE CONNECTION TESTS" -Type Step
Write-Diag "─────────────────────────────────" -Type Debug

Write-Diag "Testing PowerShell Invoke-RestMethod alternatives:" -Type Info

# Test with WebRequest instead of RestMethod
foreach ($ip in @("localhost", "127.0.0.1", "192.168.5.45")) {
    Write-Diag "Testing $ip with Invoke-WebRequest:" -Type Info
    try {
        $response = Invoke-WebRequest -Uri "http://$ip:6961/health" -TimeoutSec 3 -ErrorAction Stop
        Write-Diag "  Success: HTTP $($response.StatusCode)" -Type Success
        Write-Diag "  Content: $($response.Content)" -Type Debug
    } catch {
        Write-Diag "  Failed: $($_.Exception.Message)" -Type Warning
    }
}

# 7. Docker Desktop Status
Write-Host ""
Write-Diag "[7] DOCKER DESKTOP STATUS" -Type Step
Write-Diag "─────────────────────────" -Type Debug

Write-Diag "Docker version info:" -Type Info
try {
    $dockerVersion = wsl docker version 2>$null
    if ($dockerVersion) {
        Write-Diag "$dockerVersion" -Type Debug
    }
} catch {
    Write-Diag "Cannot get Docker version" -Type Error
}

Write-Diag "`nDocker system info:" -Type Info
try {
    $dockerInfo = wsl docker system info 2>$null | Select-String "Server Version|Operating System|Architecture"
    if ($dockerInfo) {
        $dockerInfo | ForEach-Object { Write-Diag "  $_" -Type Debug }
    }
} catch {
    Write-Diag "Cannot get Docker system info" -Type Error
}

# 8. Recommendations
Write-Host ""
Write-Diag "[8] DIAGNOSTIC SUMMARY AND RECOMMENDATIONS" -Type Step
Write-Diag "──────────────────────────────────────────" -Type Debug

Write-Diag "Based on this diagnostic, try these solutions in order:" -Type Info
Write-Diag "1. If container logs show errors - Fix Dockerfile/container code" -Type Info
Write-Diag "2. If ports not listening internally - Container services not starting" -Type Info  
Write-Diag "3. If WSL2 curl works but Windows fails - Networking/firewall issue" -Type Info
Write-Diag "4. If no port bindings shown - Container start command issue" -Type Info
Write-Diag "5. If Docker issues - Restart Docker Desktop" -Type Info

Write-Host ""
Write-Diag "Press Enter to exit..." -Type Info
Read-Host