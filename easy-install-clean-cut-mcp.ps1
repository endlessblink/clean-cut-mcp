#Requires -Version 5.1

<#
.SYNOPSIS
    Clean-Cut-MCP Simple User Installer (No Administrator Required)

.DESCRIPTION
    Installs Clean-Cut-MCP for Claude Desktop without requiring Administrator privileges.
    Uses WSL2 IP directly instead of port forwarding to avoid admin requirements.
    
    USER INSTRUCTIONS:
    1. Double-click this file
    2. Wait for "SUCCESS" message  
    3. Restart Claude Desktop
    
    No Administrator permissions needed!
    
.EXAMPLE
    Double-click the file to run
#>

# Simple user interface
Clear-Host
Write-Host ""
Write-Host "[CLEAN-CUT-MCP] EASY INSTALLER" -ForegroundColor Cyan
Write-Host "   No Administrator Required!" -ForegroundColor Green
Write-Host ""

# User-friendly error handling
$ErrorActionPreference = 'Continue'

function Write-UserMessage {
    param([string]$Message, [string]$Type = "Info")
    
    $colors = @{
        "Info" = "White"
        "Success" = "Green" 
        "Warning" = "Yellow"
        "Error" = "Red"
        "Step" = "Cyan"
    }
    
    Write-Host $Message -ForegroundColor $colors[$Type]
}

function Test-BasicRequirements {
    Write-UserMessage "[CHECK] Checking basic requirements..." -Type Step
    
    $issues = @()
    
    # Check WSL2 (user-level check)
    try {
        $wslInfo = wsl --status 2>$null
        if (-not $wslInfo) {
            $issues += "WSL2 not found. Please install WSL2 from Microsoft Store."
        }
    } catch {
        $issues += "WSL2 not accessible. Please ensure WSL2 is installed."
    }
    
    # Check Docker (user-level check)
    try {
        $dockerStatus = wsl docker version 2>$null
        if (-not $dockerStatus) {
            $issues += "Docker not found in WSL2. Please install Docker Desktop."
        }
    } catch {
        $issues += "Docker not accessible. Please start Docker Desktop."
    }
    
    return $issues
}

function Start-ContainerIfNeeded {
    Write-UserMessage "[DOCKER] Checking Clean-Cut-MCP container..." -Type Step
    
    try {
        # First check if Docker image exists
        $imageExists = wsl docker images clean-cut-mcp -q 2>$null
        
        if (-not $imageExists) {
            Write-UserMessage "[BUILD] Docker image not found. Building Clean-Cut-MCP..." -Type Step
            Write-UserMessage "This may take 2-5 minutes on first run..." -Type Info
            
            # Build the Docker image
            $buildResult = wsl docker build -t clean-cut-mcp . 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-UserMessage "[SUCCESS] Docker image built successfully!" -Type Success
            } else {
                Write-UserMessage "[ERROR] Failed to build Docker image:" -Type Error
                Write-UserMessage "$buildResult" -Type Error
                return $false
            }
        }
        
        # Check if container exists and get status
        $containerInfo = wsl docker ps -a --filter "name=clean-cut-mcp" --format "{{.Names}}\t{{.Status}}" 2>$null
        
        if (-not $containerInfo) {
            Write-UserMessage "[DOCKER] Creating new container..." -Type Info
            # Container doesn't exist, create and start it
            $runResult = wsl docker run -d --name clean-cut-mcp -p 6960:6960 -p 6961:6961 clean-cut-mcp 2>$null
            
            if (-not $runResult) {
                Write-UserMessage "[ERROR] Failed to create container" -Type Error
                return $false
            }
        }
        
        if ($containerInfo -like "*Up*") {
            Write-UserMessage "[SUCCESS] Container is already running" -Type Success
            return $true
        }
        
        # Container exists but is stopped - start it
        Write-UserMessage "Starting container..." -Type Info
        $startResult = wsl docker start clean-cut-mcp 2>$null
        
        if ($startResult) {
            # Wait for container to be ready
            $attempts = 0
            while ($attempts -lt 10) {
                $status = wsl docker ps --filter "name=clean-cut-mcp" --format "{{.Status}}" 2>$null
                if ($status -like "*Up*") {
                    Write-UserMessage "[SUCCESS] Container started successfully" -Type Success
                    return $true
                }
                Start-Sleep -Seconds 2
                $attempts++
            }
        }
        
        Write-UserMessage "[ERROR] Failed to start container" -Type Error
        return $false
        
    } catch {
        Write-UserMessage "[ERROR] Error checking container: $($_.Exception.Message)" -Type Error
        return $false
    }
}

function Get-WSL2IPAddress {
    Write-UserMessage "[NETWORK] Getting WSL2 network address..." -Type Step
    
    try {
        # Method 1: hostname -I (most reliable)
        $ip1 = wsl hostname -I 2>$null
        Write-UserMessage "[DEBUG] hostname -I result: '$ip1'" -Type Info
        if ($ip1 -and $ip1.Trim() -match '^\d+\.\d+\.\d+\.\d+') {
            $cleanIP = ($ip1.Trim() -split '\s+')[0]
            Write-UserMessage "[SUCCESS] Found WSL2 IP: $cleanIP" -Type Success
            return $cleanIP
        }
        
        # Method 2: ip addr show eth0
        $ip2 = wsl sh -c "ip addr show eth0 | grep 'inet ' | awk '{print \$2}' | cut -d/ -f1" 2>$null
        Write-UserMessage "[DEBUG] eth0 result: '$ip2'" -Type Info
        if ($ip2 -and $ip2.Trim() -match '^\d+\.\d+\.\d+\.\d+') {
            Write-UserMessage "[SUCCESS] Found WSL2 IP via eth0: $($ip2.Trim())" -Type Success
            return $ip2.Trim()
        }
        
        # Method 3: Simple ping method
        $ip3 = wsl bash -c "ip route | grep default | awk '{print \$3}'" 2>$null
        Write-UserMessage "[DEBUG] default route result: '$ip3'" -Type Info
        if ($ip3 -and $ip3.Trim() -match '^\d+\.\d+\.\d+\.\d+') {
            # This gets the gateway, but WSL2 IP is usually gateway + 1
            $gatewayIP = $ip3.Trim()
            $ipParts = $gatewayIP -split '\.'
            $wslIP = "$($ipParts[0]).$($ipParts[1]).$($ipParts[2]).$([int]$ipParts[3] + 1)"
            Write-UserMessage "[SUCCESS] Found WSL2 IP via gateway calculation: $wslIP" -Type Success
            return $wslIP
        }

        # Method 4: Use a known working IP as last resort
        Write-UserMessage "[DEBUG] All methods failed, trying known IP: 192.168.5.45" -Type Info
        return "192.168.5.45"
        
    } catch {
        Write-UserMessage "[ERROR] Failed to get WSL2 IP: $($_.Exception.Message)" -Type Error
        Write-UserMessage "[FALLBACK] Using default WSL2 IP: 192.168.5.45" -Type Info
        return "192.168.5.45"
    }
}

function Test-ServerConnection {
    param([string]$IPAddress)
    
    Write-UserMessage "[CONNECT] Testing connection to MCP server..." -Type Step
    Write-UserMessage "[DEBUG] Received IP parameter: '$IPAddress'" -Type Info
    
    # Validate IP parameter
    if (-not $IPAddress -or $IPAddress.Trim() -eq "" -or -not ($IPAddress -match '^\d+\.\d+\.\d+\.\d+$')) {
        Write-UserMessage "[ERROR] Invalid IP address received: '$IPAddress'" -Type Error
        return $null
    }
    
    # Build URLs with explicit string formatting to avoid PowerShell interpolation issues
    $healthUrl = "http://${IPAddress}:6961/health"
    $statusUrl = "http://${IPAddress}:6961/status"
    
    $testUrls = @($healthUrl, $statusUrl)
    
    Write-UserMessage "[DEBUG] Test URLs: $($testUrls -join ', ')" -Type Info
    
    foreach ($url in $testUrls) {
        try {
            Write-UserMessage "Testing: $url" -Type Info
            $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 8 -ErrorAction Stop
            
            if ($response) {
                Write-UserMessage "[SUCCESS] Server is responding!" -Type Success
                Write-UserMessage "Response: $(if($response.status){$response.status}else{'OK'})" -Type Info
                return "http://$IPAddress:6961/mcp"
            }
        } catch {
            Write-UserMessage "[ERROR] $url failed: $($_.Exception.Message)" -Type Warning
        }
    }
    
    return $null
}

function Configure-ClaudeDesktop {
    param([string]$ServerUrl)
    
    Write-UserMessage "[CONFIG] Configuring Claude Desktop..." -Type Step
    
    try {
        # Stop Claude Desktop if running
        $claudeProcesses = Get-Process -Name "Claude*" -ErrorAction SilentlyContinue
        if ($claudeProcesses) {
            Write-UserMessage "Stopping Claude Desktop..." -Type Info
            $claudeProcesses | Stop-Process -Force
            Start-Sleep -Seconds 3
        }
        
        # Prepare configuration paths
        $configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
        $configDir = Split-Path $configPath -Parent
        
        # Create Claude directory if it doesn't exist
        if (-not (Test-Path $configDir)) {
            Write-UserMessage "Creating Claude configuration directory..." -Type Info
            New-Item -ItemType Directory -Path $configDir -Force | Out-Null
        }
        
        # Backup existing configuration
        if (Test-Path $configPath) {
            $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
            $backupPath = "$configPath.backup-$timestamp"
            Copy-Item $configPath $backupPath -Force
            Write-UserMessage "[INFO] Existing configuration backed up to: $(Split-Path $backupPath -Leaf)" -Type Info
        }
        
        # Create new configuration using raw JSON (prevents PowerShell corruption)
        $jsonContent = @"
{
  "mcpServers": {
    "clean-cut-mcp": {
      "url": "$ServerUrl"
    }
  }
}
"@
        
        # Validate JSON before saving
        try {
            $null = $jsonContent | ConvertFrom-Json
            Write-UserMessage "[SUCCESS] Configuration validated" -Type Success
        } catch {
            throw "Generated configuration is not valid JSON: $($_.Exception.Message)"
        }
        
        # Save configuration with proper encoding (user-level operation)
        try {
            # Use .NET method for guaranteed UTF-8 without BOM
            [System.IO.File]::WriteAllText($configPath, $jsonContent, [System.Text.UTF8Encoding]($false))
            Write-UserMessage "[SUCCESS] Configuration saved successfully" -Type Success
            
            # Verify the saved file
            if (Test-Path $configPath) {
                $savedContent = [System.IO.File]::ReadAllText($configPath, [System.Text.UTF8Encoding]($false))
                $null = $savedContent | ConvertFrom-Json  # Validate saved content
                Write-UserMessage "[SUCCESS] Saved configuration verified" -Type Success
                return $true
            } else {
                throw "Configuration file was not created"
            }
            
        } catch {
            throw "Failed to save configuration: $($_.Exception.Message)"
        }
        
    } catch {
        Write-UserMessage "[ERROR] Claude Desktop configuration failed: $($_.Exception.Message)" -Type Error
        
        # Try to restore backup if something went wrong
        $backups = Get-ChildItem "$configPath.backup-*" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
        if ($backups) {
            $latestBackup = $backups[0]
            Write-UserMessage "Attempting to restore backup..." -Type Warning
            try {
                Copy-Item $latestBackup.FullName $configPath -Force
                Write-UserMessage "[SUCCESS] Backup restored" -Type Success
            } catch {
                Write-UserMessage "[ERROR] Could not restore backup" -Type Error
            }
        }
        
        return $false
    }
}

function Show-SuccessInstructions {
    param([string]$ServerUrl, [string]$StudioUrl)
    
    Write-Host ""
    Write-Host "[SUCCESS] Clean-Cut-MCP is ready to use!" -ForegroundColor Green
    Write-Host ""
    Write-Host "[INFO] Configuration Details:" -ForegroundColor Cyan
    Write-Host "   • MCP Server: $ServerUrl" -ForegroundColor White
    Write-Host "   • Remotion Studio: $StudioUrl" -ForegroundColor White
    Write-Host ""
    Write-Host "[NEXT] Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Start Claude Desktop" -ForegroundColor White
    Write-Host "   2. Open a new conversation" -ForegroundColor White
    Write-Host "   3. Look for 'clean-cut-mcp' in available tools" -ForegroundColor White
    Write-Host "   4. Test with: 'Create a bouncing ball animation'" -ForegroundColor White
    Write-Host ""
    Write-Host "[STUDIO] Remotion Studio (for advanced users):" -ForegroundColor Yellow
    Write-Host "   Open your browser to: $StudioUrl" -ForegroundColor White
    Write-Host ""
}

function Show-FailureHelp {
    param([string]$MainIssue)
    
    Write-Host ""
    Write-Host "[FAILED] Installation Failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Main Issue: $MainIssue" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "[HELP] Common Solutions:" -ForegroundColor Cyan
    Write-Host "   • Make sure Docker Desktop is running" -ForegroundColor White
    Write-Host "   • Check that the clean-cut-mcp container exists:" -ForegroundColor White
    Write-Host "     wsl docker ps -a" -ForegroundColor Gray
    Write-Host "   • Restart Docker Desktop and try again" -ForegroundColor White
    Write-Host "   • Make sure WSL2 is properly installed" -ForegroundColor White
    Write-Host ""
    Write-Host "[RETRY] You can run this installer again after fixing the issue." -ForegroundColor Green
    Write-Host ""
}

# Main installation process
function Start-Installation {
    try {
        Write-UserMessage "Starting Clean-Cut-MCP installation..." -Type Step
        Write-UserMessage "No Administrator permissions required!" -Type Success
        Write-Host ""
        
        # Step 1: Check basic requirements
        $issues = Test-BasicRequirements
        if ($issues.Count -gt 0) {
            Write-UserMessage "[ERROR] Missing requirements:" -Type Error
            foreach ($issue in $issues) {
                Write-UserMessage "   • $issue" -Type Error
            }
            Show-FailureHelp -MainIssue "Missing system requirements"
            return $false
        }
        Write-UserMessage "[SUCCESS] Basic requirements met" -Type Success
        
        # Step 2: Check/start container
        if (-not (Start-ContainerIfNeeded)) {
            Show-FailureHelp -MainIssue "Clean-Cut-MCP container not available"
            return $false
        }
        
        # Step 3: Get WSL2 IP address
        $wslIP = Get-WSL2IPAddress
        Write-UserMessage "[DEBUG] Returned WSL2 IP: '$wslIP'" -Type Info
        
        # Ensure we have a valid IP
        if (-not $wslIP -or $wslIP.Trim() -eq "" -or -not ($wslIP -match '^\d+\.\d+\.\d+\.\d+$')) {
            Write-UserMessage "[FALLBACK] Using hardcoded WSL2 IP: 192.168.5.45" -Type Warning
            $wslIP = "192.168.5.45"
        }
        
        Write-UserMessage "[INFO] Using WSL2 IP: $wslIP" -Type Success
        
        # Step 3.5: Wait for container to be fully ready
        Write-UserMessage "[WAIT] Waiting for container to be fully ready..." -Type Info
        Start-Sleep -Seconds 5
        
        # Step 4: Test server connection
        $serverUrl = Test-ServerConnection -IPAddress $wslIP
        if (-not $serverUrl) {
            Show-FailureHelp -MainIssue "Cannot connect to Clean-Cut-MCP server at $wslIP"
            return $false
        }
        
        # Step 5: Configure Claude Desktop
        if (-not (Configure-ClaudeDesktop -ServerUrl $serverUrl)) {
            Show-FailureHelp -MainIssue "Failed to configure Claude Desktop"
            return $false
        }
        
        # Success!
        $studioUrl = "http://$wslIP:6960"
        Show-SuccessInstructions -ServerUrl $serverUrl -StudioUrl $studioUrl
        return $true
        
    } catch {
        Write-UserMessage "[FATAL] Unexpected error: $($_.Exception.Message)" -Type Error
        Show-FailureHelp -MainIssue "Unexpected error occurred"
        return $false
    }
}

# Run the installation
$installationSuccess = Start-Installation

# Keep window open so user can read the results
Write-Host ""
if ($installationSuccess) {
    Write-Host "Press Enter to close this window..." -ForegroundColor Green
} else {
    Write-Host "Press Enter to close this window..." -ForegroundColor Red
}
Read-Host