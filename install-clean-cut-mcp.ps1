#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Clean-Cut-MCP One-Click Installer for Claude Desktop

.DESCRIPTION
    Automatically installs and configures Clean-Cut-MCP with Claude Desktop.
    Handles all networking, Docker, and configuration automatically.
    
    USER INSTRUCTIONS:
    1. Right-click this file → "Run with PowerShell"
    2. Click "Yes" when prompted for Administrator
    3. Wait for "SUCCESS" message
    4. Restart Claude Desktop
    
.EXAMPLE
    Right-click → "Run with PowerShell"
#>

# Simple user interface
Clear-Host
Write-Host ""
Write-Host "🎬 CLEAN-CUT-MCP INSTALLER" -ForegroundColor Cyan
Write-Host "   One-Click Setup for Claude Desktop" -ForegroundColor Cyan
Write-Host ""

# Error handling for users
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

function Test-Prerequisites {
    Write-UserMessage "🔍 Checking system requirements..." -Type Step
    
    $issues = @()
    
    # Check if running as admin
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    if (-not $isAdmin) {
        $issues += "Must run as Administrator (right-click → Run as Administrator)"
    }
    
    # Check WSL2
    try {
        $wslVersion = wsl --status 2>$null
        if (-not $wslVersion) {
            $issues += "WSL2 not installed. Please install WSL2 first."
        }
    } catch {
        $issues += "WSL2 not accessible. Please ensure WSL2 is installed."
    }
    
    # Check Docker in WSL2
    try {
        $dockerStatus = wsl docker --version 2>$null
        if (-not $dockerStatus) {
            $issues += "Docker not installed in WSL2. Please install Docker Desktop."
        }
    } catch {
        $issues += "Docker not accessible in WSL2."
    }
    
    return $issues
}

function Start-CleanCutMCP {
    Write-UserMessage "🐳 Starting Clean-Cut-MCP container..." -Type Step
    
    try {
        # Check if container exists and is running
        $containerStatus = wsl docker ps -a --filter "name=clean-cut-mcp" --format "{{.Status}}" 2>$null
        
        if ($containerStatus -like "*Up*") {
            Write-UserMessage "✓ Container already running" -Type Success
            return $true
        } elseif ($containerStatus) {
            # Container exists but stopped
            Write-UserMessage "Starting existing container..." -Type Info
            wsl docker start clean-cut-mcp | Out-Null
        } else {
            Write-UserMessage "Container not found. Please build/pull the clean-cut-mcp image first." -Type Error
            return $false
        }
        
        # Wait for container to be ready
        $attempts = 0
        while ($attempts -lt 15) {
            $status = wsl docker ps --filter "name=clean-cut-mcp" --format "{{.Status}}" 2>$null
            if ($status -like "*Up*") {
                Write-UserMessage "✓ Container is running" -Type Success
                return $true
            }
            Start-Sleep -Seconds 2
            $attempts++
        }
        
        Write-UserMessage "✗ Container failed to start properly" -Type Error
        return $false
        
    } catch {
        Write-UserMessage "✗ Failed to start container: $($_.Exception.Message)" -Type Error
        return $false
    }
}

function Find-WorkingConnection {
    Write-UserMessage "🔍 Finding best connection method..." -Type Step
    
    $methods = @(
        @{Name = "Localhost"; Url = "http://localhost:6961"},
        @{Name = "WSL2 IP"; Url = "http://$($(wsl hostname -I 2>$null).Trim()):6961"}
    )
    
    foreach ($method in $methods) {
        Write-UserMessage "Testing $($method.Name)..." -Type Info
        
        try {
            $response = Invoke-RestMethod "$($method.Url)/health" -TimeoutSec 5 -ErrorAction Stop
            Write-UserMessage "✓ $($method.Name) works!" -Type Success
            return "$($method.Url)/mcp"
        } catch {
            Write-UserMessage "✗ $($method.Name) failed" -Type Warning
        }
    }
    
    return $null
}

function Enable-NetworkAccess {
    Write-UserMessage "🌐 Configuring network access..." -Type Step
    
    try {
        # Method 1: Try WSL2 mirrored mode
        Write-UserMessage "Enabling WSL2 mirrored networking..." -Type Info
        
        $wslConfig = @"
[wsl2]
networkingMode=mirrored
dnsTunneling=true
firewall=true

[experimental]
hostAddressLoopback=true
"@
        
        $wslConfigPath = "$env:USERPROFILE\.wslconfig"
        $wslConfig | Out-File $wslConfigPath -Encoding UTF8
        
        Write-UserMessage "Restarting WSL2 (this takes 30 seconds)..." -Type Info
        wsl --shutdown 2>$null
        Start-Sleep -Seconds 5
        wsl echo "WSL2 restarted" 2>$null | Out-Null
        Start-Sleep -Seconds 3
        
        # Test if mirrored mode worked
        try {
            Invoke-RestMethod "http://localhost:6961/health" -TimeoutSec 5 | Out-Null
            Write-UserMessage "✓ Mirrored networking enabled successfully" -Type Success
            return $true
        } catch {
            Write-UserMessage "Mirrored mode didn't work, trying port forwarding..." -Type Info
        }
        
        # Method 2: Port forwarding fallback
        $wslIP = (wsl hostname -I 2>$null).Trim()
        if ($wslIP) {
            Write-UserMessage "Setting up port forwarding to $wslIP..." -Type Info
            
            # Clear existing rules
            netsh interface portproxy delete v4tov4 listenport=6961 listenaddress=127.0.0.1 2>$null
            netsh interface portproxy delete v4tov4 listenport=6960 listenaddress=127.0.0.1 2>$null
            
            # Add new rules
            netsh interface portproxy add v4tov4 listenport=6961 listenaddress=127.0.0.1 connectport=6961 connectaddress=$wslIP
            netsh interface portproxy add v4tov4 listenport=6960 listenaddress=127.0.0.1 connectport=6960 connectaddress=$wslIP
            
            # Add firewall rules
            New-NetFirewallRule -DisplayName "Clean-Cut-MCP-6961" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 6961 -ErrorAction SilentlyContinue
            New-NetFirewallRule -DisplayName "Clean-Cut-MCP-6960" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 6960 -ErrorAction SilentlyContinue
            
            Start-Sleep -Seconds 3
            
            # Test port forwarding
            try {
                Invoke-RestMethod "http://localhost:6961/health" -TimeoutSec 5 | Out-Null
                Write-UserMessage "✓ Port forwarding configured successfully" -Type Success
                return $true
            } catch {
                Write-UserMessage "Port forwarding didn't work either" -Type Warning
            }
        }
        
        return $false
        
    } catch {
        Write-UserMessage "Network configuration failed: $($_.Exception.Message)" -Type Error
        return $false
    }
}

function Install-ClaudeConfiguration {
    param([string]$ServerUrl)
    
    Write-UserMessage "📝 Configuring Claude Desktop..." -Type Step
    
    try {
        # Kill Claude Desktop if running
        Get-Process -Name "Claude*" -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Seconds 2
        
        # Prepare configuration
        $configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
        $configDir = Split-Path $configPath -Parent
        
        # Create directory if needed
        if (-not (Test-Path $configDir)) {
            New-Item -ItemType Directory -Path $configDir -Force | Out-Null
        }
        
        # Backup existing config
        if (Test-Path $configPath) {
            $backupPath = "$configPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
            Copy-Item $configPath $backupPath -Force
            Write-UserMessage "✓ Existing configuration backed up" -Type Info
        }
        
        # Create new configuration
        $config = @{
            mcpServers = @{
                "clean-cut-mcp" = @{
                    url = $ServerUrl
                }
            }
        }
        
        # Save configuration with proper encoding
        $jsonContent = $config | ConvertTo-Json -Depth 10
        
        # Validate before saving
        if (-not (Test-Json -Json $jsonContent)) {
            throw "Generated configuration is invalid"
        }
        
        # Atomic save (temp file then move)
        $tempFile = "$configPath.tmp"
        $jsonContent | Out-File $tempFile -Encoding UTF8 -Force
        
        if (Test-Json -Path $tempFile) {
            Move-Item $tempFile $configPath -Force
            Write-UserMessage "✓ Claude Desktop configured successfully" -Type Success
            return $true
        } else {
            Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
            throw "Temporary configuration file is invalid"
        }
        
    } catch {
        Write-UserMessage "✗ Claude configuration failed: $($_.Exception.Message)" -Type Error
        return $false
    }
}

function Show-UserInstructions {
    Write-Host ""
    Write-Host "🎉 INSTALLATION COMPLETE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start Claude Desktop" -ForegroundColor White
    Write-Host "2. Open a new conversation" -ForegroundColor White  
    Write-Host "3. Look for 'clean-cut-mcp' in available tools" -ForegroundColor White
    Write-Host "4. Test with: 'Create a bouncing ball animation'" -ForegroundColor White
    Write-Host ""
    Write-Host "🎬 Remotion Studio: http://localhost:6960" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If you have issues:" -ForegroundColor Cyan
    Write-Host "• Run this installer again" -ForegroundColor White
    Write-Host "• Check that Docker is running" -ForegroundColor White
    Write-Host "• Restart Claude Desktop" -ForegroundColor White
    Write-Host ""
}

function Show-ErrorHelp {
    Write-Host ""
    Write-Host "❌ INSTALLATION FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common solutions:" -ForegroundColor Yellow
    Write-Host "• Make sure Docker Desktop is running" -ForegroundColor White
    Write-Host "• Restart your computer and try again" -ForegroundColor White
    Write-Host "• Run as Administrator (right-click → Run as Administrator)" -ForegroundColor White
    Write-Host "• Check Windows Firewall settings" -ForegroundColor White
    Write-Host ""
    Write-Host "For help: Check the project documentation" -ForegroundColor Cyan
    Write-Host ""
}

# Main installation process
try {
    # Step 1: Check prerequisites
    Write-UserMessage "Starting Clean-Cut-MCP installation..." -Type Step
    $issues = Test-Prerequisites
    
    if ($issues.Count -gt 0) {
        Write-UserMessage "❌ System requirements not met:" -Type Error
        foreach ($issue in $issues) {
            Write-UserMessage "  • $issue" -Type Error
        }
        Write-Host ""
        Write-Host "Please fix these issues and run the installer again." -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-UserMessage "✓ System requirements OK" -Type Success
    
    # Step 2: Start container
    if (-not (Start-CleanCutMCP)) {
        Show-ErrorHelp
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    # Step 3: Configure networking
    $networkingOK = Enable-NetworkAccess
    
    # Step 4: Find working connection
    $serverUrl = Find-WorkingConnection
    if (-not $serverUrl) {
        Write-UserMessage "❌ Cannot establish connection to MCP server" -Type Error
        Show-ErrorHelp
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-UserMessage "✓ Using connection: $serverUrl" -Type Success
    
    # Step 5: Configure Claude Desktop
    if (-not (Install-ClaudeConfiguration -ServerUrl $serverUrl)) {
        Show-ErrorHelp
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    # Success!
    Show-UserInstructions
    
} catch {
    Write-UserMessage "💥 Unexpected error: $($_.Exception.Message)" -Type Error
    Show-ErrorHelp
} finally {
    Write-Host "Press Enter to close..." -ForegroundColor Gray
    Read-Host
}