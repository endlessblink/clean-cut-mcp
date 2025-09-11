#Requires -Version 5.1

<#
.SYNOPSIS
    Universal Clean-Cut-MCP Installer - Works on Any Fresh VM
.DESCRIPTION
    Handles all WSL2 networking scenarios and container configurations
    for maximum compatibility across different Windows/WSL2 setups.
#>

$ErrorActionPreference = 'Continue'

function Write-Log {
    param([string]$Message, [string]$Type = "Info")
    $colors = @{ "Info" = "White"; "Success" = "Green"; "Warning" = "Yellow"; "Error" = "Red"; "Step" = "Cyan" }
    Write-Host $Message -ForegroundColor $colors[$Type]
}

Clear-Host
Write-Log "[UNIVERSAL INSTALLER] Clean-Cut-MCP for Any Windows VM" -Type Step
Write-Log "Handles all WSL2 networking scenarios automatically" -Type Info
Write-Host ""

# Step 1: Comprehensive Container Management
function Ensure-ContainerRunning {
    Write-Log "[STEP 1] Ensuring Clean-Cut-MCP container is running..." -Type Step
    
    try {
        # Check if image exists
        $imageExists = wsl docker images clean-cut-mcp -q 2>$null
        if (-not $imageExists) {
            Write-Log "[BUILD] Building Docker image (first time setup)..." -Type Step
            $buildResult = wsl docker build -t clean-cut-mcp . 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Log "[ERROR] Docker build failed: $buildResult" -Type Error
                return $false
            }
            Write-Log "[SUCCESS] Docker image built successfully" -Type Success
        }
        
        # Stop any existing container to ensure clean state
        wsl docker stop clean-cut-mcp 2>$null | Out-Null
        wsl docker rm clean-cut-mcp 2>$null | Out-Null
        
        # Start fresh container with explicit port binding to ALL interfaces
        Write-Log "[DOCKER] Starting container with universal port binding..." -Type Info
        $containerId = wsl docker run -d --name clean-cut-mcp -p 0.0.0.0:6960:6960 -p 0.0.0.0:6961:6961 clean-cut-mcp 2>$null
        
        if (-not $containerId) {
            Write-Log "[ERROR] Failed to start container" -Type Error
            return $false
        }
        
        # Wait for container to be fully ready
        Write-Log "[WAIT] Waiting for container startup..." -Type Info
        $attempts = 0
        while ($attempts -lt 15) {
            $status = wsl docker ps --filter "name=clean-cut-mcp" --format "{{.Status}}" 2>$null
            if ($status -like "*Up*") {
                Start-Sleep -Seconds 3  # Extra time for MCP server to initialize
                Write-Log "[SUCCESS] Container is running and ready" -Type Success
                return $true
            }
            Start-Sleep -Seconds 2
            $attempts++
        }
        
        Write-Log "[ERROR] Container failed to start properly" -Type Error
        return $false
        
    } catch {
        Write-Log "[ERROR] Container setup failed: $($_.Exception.Message)" -Type Error
        return $false
    }
}

# Step 2: Universal Connection Testing
function Test-UniversalConnection {
    Write-Log "[STEP 2] Testing connection methods..." -Type Step
    
    # Method 1: Try localhost (works with WSL2 mirrored mode)
    Write-Log "[TEST] Method 1: Testing localhost (mirrored mode)..." -Type Info
    if (Test-SingleConnection -IP "localhost" -Port 6961) {
        Write-Log "[SUCCESS] Localhost connection works (mirrored networking)" -Type Success
        return @{
            IP = "localhost"
            McpUrl = "http://localhost:6961/mcp"
            StudioUrl = "http://localhost:6960"
        }
    }
    
    # Method 2: Try 127.0.0.1 explicitly
    Write-Log "[TEST] Method 2: Testing 127.0.0.1..." -Type Info
    if (Test-SingleConnection -IP "127.0.0.1" -Port 6961) {
        Write-Log "[SUCCESS] 127.0.0.1 connection works" -Type Success
        return @{
            IP = "127.0.0.1"
            McpUrl = "http://127.0.0.1:6961/mcp"
            StudioUrl = "http://127.0.0.1:6960"
        }
    }
    
    # Method 3: Get WSL2 IP and test direct connection
    Write-Log "[TEST] Method 3: Testing WSL2 direct IP..." -Type Info
    $wslIP = Get-WSL2IP
    if ($wslIP -and (Test-SingleConnection -IP $wslIP -Port 6961)) {
        Write-Log "[SUCCESS] WSL2 IP connection works: $wslIP" -Type Success
        return @{
            IP = $wslIP
            McpUrl = "http://$wslIP:6961/mcp"  
            StudioUrl = "http://$wslIP:6960"
        }
    }
    
    # Method 4: Try Windows host network interfaces
    Write-Log "[TEST] Method 4: Testing Windows network interfaces..." -Type Info
    try {
        $interfaces = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -match '^192\.168\.|^172\.|^10\.' }
        foreach ($interface in $interfaces) {
            $testIP = $interface.IPAddress
            Write-Log "[TEST] Trying interface IP: $testIP" -Type Info
            if (Test-SingleConnection -IP $testIP -Port 6961) {
                Write-Log "[SUCCESS] Interface IP works: $testIP" -Type Success
                return @{
                    IP = $testIP
                    McpUrl = "http://$testIP:6961/mcp"
                    StudioUrl = "http://$testIP:6960"
                }
            }
        }
    } catch {
        Write-Log "[WARNING] Network interface test failed: $($_.Exception.Message)" -Type Warning
    }
    
    return $null
}

function Get-WSL2IP {
    try {
        # Method 1: hostname -I
        $ip1 = wsl hostname -I 2>$null
        if ($ip1 -and $ip1.Trim() -match '^\d+\.\d+\.\d+\.\d+') {
            return ($ip1.Trim() -split '\s+')[0]
        }
        
        # Method 2: ip route
        $gateway = wsl ip route show default 2>$null | wsl awk '{print $3}' 2>$null
        if ($gateway -and $gateway.Trim() -match '^\d+\.\d+\.\d+\.\d+') {
            $parts = $gateway.Trim() -split '\.'
            return "$($parts[0]).$($parts[1]).$($parts[2]).$([int]$parts[3] + 1)"
        }
        
        return $null
    } catch {
        return $null
    }
}

function Test-SingleConnection {
    param([string]$IP, [int]$Port)
    
    try {
        $healthUrl = "http://${IP}:${Port}/health"
        $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 5 -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Step 3: Claude Desktop Configuration  
function Configure-ClaudeDesktop {
    param([hashtable]$ConnectionInfo)
    
    Write-Log "[STEP 3] Configuring Claude Desktop..." -Type Step
    
    try {
        # Kill Claude processes
        Get-Process -Name "Claude*" -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Seconds 2
        
        $configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
        $configDir = Split-Path $configPath -Parent
        
        if (-not (Test-Path $configDir)) {
            New-Item -ItemType Directory -Path $configDir -Force | Out-Null
        }
        
        # Backup existing config
        if (Test-Path $configPath) {
            $backupPath = "$configPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
            Copy-Item $configPath $backupPath -Force
            Write-Log "[INFO] Config backed up to: $(Split-Path $backupPath -Leaf)" -Type Info
        }
        
        # Create configuration with working connection
        $jsonContent = @"
{
  "mcpServers": {
    "clean-cut-mcp": {
      "url": "$($ConnectionInfo.McpUrl)"
    }
  }
}
"@
        
        # Save with proper encoding
        [System.IO.File]::WriteAllText($configPath, $jsonContent, [System.Text.UTF8Encoding]($false))
        
        # Validate saved config
        $savedContent = [System.IO.File]::ReadAllText($configPath, [System.Text.UTF8Encoding]($false))
        $null = $savedContent | ConvertFrom-Json
        
        Write-Log "[SUCCESS] Claude Desktop configured successfully" -Type Success
        Write-Log "[INFO] MCP Server: $($ConnectionInfo.McpUrl)" -Type Info
        Write-Log "[INFO] Remotion Studio: $($ConnectionInfo.StudioUrl)" -Type Info
        
        return $true
        
    } catch {
        Write-Log "[ERROR] Claude Desktop configuration failed: $($_.Exception.Message)" -Type Error
        return $false
    }
}

# Main Installation Process
try {
    # Step 1: Container
    if (-not (Ensure-ContainerRunning)) {
        Write-Log "[FAILED] Container setup failed" -Type Error
        exit 1
    }
    
    # Step 2: Connection
    $connectionInfo = Test-UniversalConnection
    if (-not $connectionInfo) {
        Write-Log "[FAILED] No working connection method found" -Type Error
        Write-Log "[HELP] Try these manual steps:" -Type Warning
        Write-Log "1. Check Docker Desktop is running" -Type Info
        Write-Log "2. Run: wsl docker ps -a" -Type Info  
        Write-Log "3. Restart Docker Desktop" -Type Info
        exit 1
    }
    
    # Step 3: Claude Desktop
    if (-not (Configure-ClaudeDesktop -ConnectionInfo $connectionInfo)) {
        Write-Log "[FAILED] Claude Desktop configuration failed" -Type Error
        exit 1
    }
    
    # Success!
    Write-Host ""
    Write-Log "[SUCCESS] Installation Complete!" -Type Success
    Write-Host ""
    Write-Log "Next Steps:" -Type Step
    Write-Log "1. Start Claude Desktop" -Type Info
    Write-Log "2. Ask: 'Create a bouncing ball animation'" -Type Info  
    Write-Log "3. Animation will appear at: $($connectionInfo.StudioUrl)" -Type Info
    Write-Host ""
    Write-Log "Connection method: $($connectionInfo.IP)" -Type Success
    Write-Log "This will work on any fresh VM with the same setup!" -Type Success
    
} catch {
    Write-Log "[FATAL] Unexpected error: $($_.Exception.Message)" -Type Error
}

Write-Host ""
Write-Log "Press Enter to close..." -Type Info
Read-Host