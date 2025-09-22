<#
.SYNOPSIS
    Clean-Cut-MCP One-Click Installer for Claude Desktop

.DESCRIPTION
    Automatically installs and configures Clean-Cut-MCP with Claude Desktop.
    Handles all networking, Docker, and configuration automatically.
    No Administrator privileges required.

    USER INSTRUCTIONS:
    1. Right-click this file → "Run with PowerShell"
    2. Wait for "SUCCESS" message
    3. Restart Claude Desktop
    
.EXAMPLE
    Right-click → "Run with PowerShell"

.PARAMETER Update
    Download the latest version of this installer from GitHub

.EXAMPLE
    .\install.ps1 -Update
#>

param(
    [switch]$Update
)

# Cross-platform OS detection for PowerShell Core compatibility
if (-not (Get-Variable -Name 'IsWindows' -ErrorAction SilentlyContinue)) {
    # Backwards compatibility for Windows PowerShell 5.1
    $script:IsWindows = $true
    $script:IsLinux = $false
    $script:IsMacOS = $false
} else {
    # Use built-in variables for PowerShell Core 6+
    $script:IsWindows = $IsWindows
    $script:IsLinux = $IsLinux
    $script:IsMacOS = $IsMacOS
}

# Platform-specific settings
if ($script:IsWindows) {
    $dockerCmd = "wsl docker"
    $dockerComposeCmd = "wsl bash -c"
    $useWSL = $true
} else {
    $dockerCmd = "docker"
    $dockerComposeCmd = "bash -c"
    $useWSL = $false
}

# Simple user interface
Clear-Host
Write-Host ""
Write-Host "🎬 CLEAN-CUT-MCP INSTALLER" -ForegroundColor Cyan
Write-Host "   Cross-Platform Setup for Claude Desktop" -ForegroundColor Cyan
if ($script:IsWindows) { Write-Host "   Platform: Windows + WSL2" -ForegroundColor Gray }
elseif ($script:IsLinux) { Write-Host "   Platform: Linux" -ForegroundColor Gray }
elseif ($script:IsMacOS) { Write-Host "   Platform: macOS" -ForegroundColor Gray }
Write-Host ""

# Handle update parameter first
if ($Update) {
    Write-Host ""
    Write-Host "🔄 UPDATING CLEAN-CUT-MCP INSTALLER" -ForegroundColor Cyan
    Write-Host ""

    try {
        $latestUrl = "https://raw.githubusercontent.com/endlessblink/clean-cut-mcp/master/install.ps1"
        $currentScript = $MyInvocation.MyCommand.Path
        $backupPath = "$currentScript.backup"

        Write-Host "Downloading latest installer..." -ForegroundColor Yellow

        # Backup current version
        Copy-Item $currentScript $backupPath -Force

        # Download latest version
        if ($script:IsWindows) {
            Invoke-WebRequest -Uri $latestUrl -OutFile $currentScript -UseBasicParsing
        } else {
            # Use curl on Linux/macOS as fallback
            & curl -fsSL $latestUrl -o $currentScript
        }

        Write-Host "✓ Installer updated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Run the script again to install with latest version." -ForegroundColor Cyan
        Write-Host ""

    } catch {
        Write-Host "✗ Update failed: $($_.Exception.Message)" -ForegroundColor Red

        # Restore backup if download failed
        if (Test-Path $backupPath) {
            Copy-Item $backupPath $currentScript -Force
            Remove-Item $backupPath -Force
        }
    }

    Read-Host "Press Enter to exit"
    exit
}

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

    if ($script:IsWindows) {
        # Windows-specific checks (WSL2 required)
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
    } else {
        # Linux/macOS checks (native Docker)
        try {
            $dockerStatus = docker --version 2>$null
            if (-not $dockerStatus) {
                if ($script:IsLinux) {
                    $issues += "Docker not installed. Please install Docker using: 'sudo apt install docker.io' or equivalent."
                } else {
                    $issues += "Docker not installed. Please install Docker Desktop for Mac."
                }
            }
        } catch {
            $issues += "Docker not accessible. Please ensure Docker is running."
        }

        # Check docker-compose
        try {
            $composeStatus = docker compose version 2>$null
            if (-not $composeStatus) {
                $issues += "Docker Compose not available. Please ensure Docker Compose is installed."
            }
        } catch {
            $issues += "Docker Compose not accessible."
        }
    }

    return $issues
}

function Start-CleanCutMCP {
    Write-UserMessage "🐳 Building and starting Clean-Cut-MCP container..." -Type Step

    try {
        # Check if container exists and is running (platform-specific)
        $containerStatus = if ($script:IsWindows) {
            wsl docker ps -a --filter "name=clean-cut-mcp" --format "{{.Status}}" 2>$null
        } else {
            docker ps -a --filter "name=clean-cut-mcp" --format "{{.Status}}" 2>$null
        }

        if ($containerStatus -like "*Up*") {
            Write-UserMessage "✓ Container already running" -Type Success
            return $true
        } elseif ($containerStatus) {
            # Container exists but stopped
            Write-UserMessage "Starting existing container..." -Type Info
            if ($script:IsWindows) {
                wsl docker start clean-cut-mcp | Out-Null
            } else {
                docker start clean-cut-mcp | Out-Null
            }
        } else {
            # Container doesn't exist - pull and start it
            Write-UserMessage "Pulling Clean-Cut-MCP image from Docker Hub..." -Type Info

            # Pull the pre-built image (platform-specific)
            $pullResult = if ($script:IsWindows) {
                wsl docker pull endlessblink/clean-cut-mcp:latest 2>&1
            } else {
                docker pull endlessblink/clean-cut-mcp:latest 2>&1
            }

            if ($LASTEXITCODE -ne 0) {
                Write-UserMessage "Docker Hub pull failed, building locally..." -Type Warning

                # Fallback to local build (platform-specific)
                $currentDir = (Get-Location).Path
                Write-UserMessage "Building from: $currentDir" -Type Info

                if ($script:IsWindows) {
                    $wslPath = $currentDir -replace '\\', '/' -replace 'C:', '/mnt/c' -replace 'D:', '/mnt/d'
                    $buildResult = wsl bash -c "cd '$wslPath' && docker-compose up -d" 2>&1
                } else {
                    Set-Location $currentDir
                    $buildResult = docker compose up -d 2>&1
                }

                if ($LASTEXITCODE -ne 0) {
                    Write-UserMessage "✗ Container build failed: $buildResult" -Type Error
                    return $false
                }
            } else {
                # Start container with pulled image (platform-specific)
                $currentDir = (Get-Location).Path

                if ($script:IsWindows) {
                    $wslPath = $currentDir -replace '\\', '/' -replace 'C:', '/mnt/c' -replace 'D:', '/mnt/d'
                    $startResult = wsl bash -c "cd '$wslPath' && docker-compose up -d" 2>&1
                } else {
                    Set-Location $currentDir
                    $startResult = docker compose up -d 2>&1
                }

                if ($LASTEXITCODE -ne 0) {
                    Write-UserMessage "✗ Container start failed: $startResult" -Type Error
                    return $false
                }
            }

            Write-UserMessage "✓ Container ready successfully" -Type Success
        }
        
        # Wait for container to be ready (platform-specific)
        $attempts = 0
        while ($attempts -lt 15) {
            $status = if ($script:IsWindows) {
                wsl docker ps --filter "name=clean-cut-mcp" --format "{{.Status}}" 2>$null
            } else {
                docker ps --filter "name=clean-cut-mcp" --format "{{.Status}}" 2>$null
            }

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
        @{Name = "Localhost"; Url = "http://localhost:6970"},
        @{Name = "WSL2 IP"; Url = "http://$($(wsl hostname -I 2>$null).Trim()):6970"}
    )
    
    foreach ($method in $methods) {
        Write-UserMessage "Testing $($method.Name)..." -Type Info
        
        try {
            $response = Invoke-RestMethod "$($method.Url)/" -TimeoutSec 5 -ErrorAction Stop
            Write-UserMessage "✓ $($method.Name) works!" -Type Success
            return $method.Url
        } catch {
            Write-UserMessage "✗ $($method.Name) failed" -Type Warning
        }
    }
    
    return $null
}

function Test-NetworkAccess {
    Write-UserMessage "🌐 Testing network connectivity..." -Type Step

    try {
        if ($script:IsWindows) {
            Write-UserMessage "Testing WSL2 Docker access..." -Type Info
            $dockerTest = wsl docker --version 2>$null
            if (-not $dockerTest) {
                Write-UserMessage "✗ Docker not accessible in WSL2" -Type Error
                return $false
            }
            Write-UserMessage "✓ Docker accessible in WSL2" -Type Success
        } else {
            Write-UserMessage "Testing native Docker access..." -Type Info
            $dockerTest = docker --version 2>$null
            if (-not $dockerTest) {
                Write-UserMessage "✗ Docker not accessible" -Type Error
                return $false
            }
            Write-UserMessage "✓ Docker accessible natively" -Type Success
        }

        Write-UserMessage "✓ Using Docker's automatic port forwarding (no admin required)" -Type Success
        return $true

    } catch {
        Write-UserMessage "Network test failed: $($_.Exception.Message)" -Type Error
        return $false
    }
}

function Install-ClaudeConfiguration {

    Write-UserMessage "📝 Configuring Claude Desktop..." -Type Step

    try {
        # Kill Claude Desktop if running (cross-platform)
        if ($script:IsWindows) {
            Get-Process -Name "Claude*" -ErrorAction SilentlyContinue | Stop-Process -Force
        } else {
            # Linux/macOS - kill Claude processes if running
            & pkill -f "claude" 2>/dev/null | Out-Null
        }
        Start-Sleep -Seconds 2

        # Platform-specific configuration paths
        if ($script:IsWindows) {
            $configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
        } elseif ($script:IsLinux) {
            $configPath = "$env:HOME/.config/Claude/claude_desktop_config.json"
        } elseif ($script:IsMacOS) {
            $configPath = "$env:HOME/Library/Application Support/Claude/claude_desktop_config.json"
        } else {
            throw "Unsupported operating system"
        }

        $configDir = Split-Path $configPath -Parent
        Write-UserMessage "Using config path: $configPath" -Type Info
        
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
        
        # Create new configuration - STDIO transport (cross-platform)
        if ($script:IsWindows) {
            # Windows: Use Docker Desktop via WSL2
            $dockerCommand = "docker"  # Docker Desktop makes docker command available in Windows
            $dockerArgs = @("exec", "clean-cut-mcp", "node", "/app/mcp-server/dist/clean-stdio-server.js")
        } else {
            # Linux/macOS: Use native Docker
            $dockerCommand = "docker"
            $dockerArgs = @("exec", "clean-cut-mcp", "node", "/app/mcp-server/dist/clean-stdio-server.js")
        }

        $config = @{
            mcpServers = @{
                "clean-cut-mcp" = @{
                    command = $dockerCommand
                    args = $dockerArgs
                }
            }
        }
        
        # Save configuration with proper encoding
        $jsonContent = $config | ConvertTo-Json -Depth 10
        
        # Validate JSON (with fallback for older PowerShell versions)
        $jsonValid = $false
        try {
            # Try Test-Json cmdlet (PowerShell 6.1+)
            $jsonValid = Test-Json -Json $jsonContent -ErrorAction Stop
        } catch {
            # Fallback: Basic JSON validation by parsing
            try {
                $jsonContent | ConvertFrom-Json | Out-Null
                $jsonValid = $true
            } catch {
                $jsonValid = $false
            }
        }

        if (-not $jsonValid) {
            throw "Generated configuration is invalid JSON"
        }

        # Atomic save (temp file then move)
        $tempFile = "$configPath.tmp"
        $jsonContent | Out-File $tempFile -Encoding UTF8 -Force

        # Validate temp file (with fallback)
        $tempValid = $false
        try {
            $tempValid = Test-Json -Path $tempFile -ErrorAction Stop
        } catch {
            try {
                Get-Content $tempFile | ConvertFrom-Json | Out-Null
                $tempValid = $true
            } catch {
                $tempValid = $false
            }
        }

        if ($tempValid) {
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
    Write-Host "🎬 Remotion Studio: http://localhost:6970" -ForegroundColor Yellow
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
    if ($script:IsWindows) {
        Write-Host "• Make sure Docker Desktop is running" -ForegroundColor White
        Write-Host "• Ensure WSL2 integration is enabled in Docker Desktop" -ForegroundColor White
        Write-Host "• Check Windows Firewall settings" -ForegroundColor White
    } elseif ($script:IsLinux) {
        Write-Host "• Make sure Docker is running: sudo systemctl start docker" -ForegroundColor White
        Write-Host "• Add user to docker group: sudo usermod -aG docker `$USER" -ForegroundColor White
        Write-Host "• Install PowerShell Core: curl -sSL https://aka.ms/install-powershell.sh | sudo bash" -ForegroundColor White
    } else {
        Write-Host "• Make sure Docker Desktop is running" -ForegroundColor White
        Write-Host "• Install PowerShell Core: brew install powershell" -ForegroundColor White
    }
    Write-Host "• Restart your computer and try again" -ForegroundColor White
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
    
    # Step 2: Test network access
    if (-not (Test-NetworkAccess)) {
        Show-ErrorHelp
        Read-Host "Press Enter to exit"
        exit 1
    }

    # Step 3: Start container
    if (-not (Start-CleanCutMCP)) {
        Show-ErrorHelp
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    # Step 4: Verify container is running and accessible
    Write-UserMessage "🔍 Verifying container is ready..." -Type Step

    # Test container accessibility (platform-specific)
    $containerRunning = $false
    for ($i = 1; $i -le 10; $i++) {
        try {
            $result = if ($script:IsWindows) {
                wsl docker exec clean-cut-mcp echo "Container accessible" 2>$null
            } else {
                docker exec clean-cut-mcp echo "Container accessible" 2>$null
            }

            if ($result -eq "Container accessible") {
                $containerRunning = $true
                break
            }
        } catch {}

        if ($i -lt 10) {
            Write-UserMessage "Waiting for container startup... (attempt $i/10)" -Type Info
            Start-Sleep -Seconds 3
        }
    }

    if (-not $containerRunning) {
        Write-UserMessage "❌ Container not accessible via docker exec" -Type Error
        Show-ErrorHelp
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-UserMessage "✓ Container accessible - Remotion Studio and MCP server ready" -Type Success

    # Step 5: Configure Claude Desktop for STDIO transport
    if (-not (Install-ClaudeConfiguration)) {
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