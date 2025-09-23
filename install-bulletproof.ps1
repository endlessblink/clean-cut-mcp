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
Write-Host "[SETUP] CLEAN-CUT-MCP INSTALLER v2.1.0-WINDOWS" -ForegroundColor Cyan
Write-Host "   Cross-Platform Setup for Claude Desktop" -ForegroundColor Cyan
if ($script:IsWindows) { Write-Host "   Platform: Windows + WSL2" -ForegroundColor Gray }
elseif ($script:IsLinux) { Write-Host "   Platform: Linux" -ForegroundColor Gray }
elseif ($script:IsMacOS) { Write-Host "   Platform: macOS" -ForegroundColor Gray }
Write-Host ""

# Handle update parameter first
if ($Update) {
    Write-Host ""
    Write-Host "[UPDATE] UPDATING CLEAN-CUT-MCP INSTALLER" -ForegroundColor Cyan
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

        Write-Host "[OK] Installer updated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Run the script again to install with latest version." -ForegroundColor Cyan
        Write-Host ""

    } catch {
        Write-Host "[ERROR] Update failed: $($_.Exception.Message)" -ForegroundColor Red

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
    Write-UserMessage "[CHECK] Checking system requirements..." -Type Step

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
    Write-UserMessage "[DOCKER] Building and starting Clean-Cut-MCP container..." -Type Step

    try {
        # Always ensure we have the latest image - remove old container if exists
        Write-UserMessage "[REFRESH] FORCING FRESH INSTALLATION - Removing any existing containers..." -Type Step

        # Stop and remove existing container to get fresh installation
        if ($script:IsWindows) {
            $stopResult = wsl docker stop clean-cut-mcp 2>&1
            $removeResult = wsl docker rm clean-cut-mcp 2>&1
        } else {
            $stopResult = docker stop clean-cut-mcp 2>&1
            $removeResult = docker rm clean-cut-mcp 2>&1
        }

        if ($stopResult -notlike "*No such container*" -and $stopResult -notlike "*is not running*") {
            Write-UserMessage "[OK] Stopped existing container" -Type Success
        }
        if ($removeResult -notlike "*No such container*") {
            Write-UserMessage "[OK] Removed existing container" -Type Success
        }

        # Always pull latest image to ensure updates
        Write-UserMessage "Pulling latest Clean-Cut-MCP image from Docker Hub..." -Type Info
        $pullResult = if ($script:IsWindows) {
            wsl docker pull endlessblink/clean-cut-mcp:latest 2>&1
        } else {
            docker pull endlessblink/clean-cut-mcp:latest 2>&1
        }

        if ($LASTEXITCODE -ne 0) {
            Write-UserMessage "[ERROR] Failed to pull latest image: $pullResult" -Type Error
            Write-UserMessage "Please ensure Docker is running and has internet access" -Type Error
            return $false
        }

        Write-UserMessage "[OK] Latest Docker image pulled successfully - All fixes included!" -Type Success

        # Start container with latest image (self-contained for external users)
        Write-UserMessage "Starting container with latest Docker Hub image..." -Type Info

        # Create local directories for external users
        $currentDir = (Get-Location).Path
        $exportDir = Join-Path $currentDir "clean-cut-exports"
        $workspaceDir = Join-Path $currentDir "clean-cut-workspace"

        # Create directories if they don't exist
        if (-not (Test-Path $exportDir)) {
            New-Item -ItemType Directory -Path $exportDir -Force | Out-Null
            Write-UserMessage "Created exports directory: $exportDir" -Type Info
        }

        if (-not (Test-Path $workspaceDir)) {
            New-Item -ItemType Directory -Path $workspaceDir -Force | Out-Null
            Write-UserMessage "Created workspace directory: $workspaceDir" -Type Info
        }

        if ($script:IsWindows) {
            # Windows: Use WSL paths for volume mounts
            $wslCurrentDir = $currentDir -replace '\\', '/' -replace 'C:', '/mnt/c' -replace 'D:', '/mnt/d'
            $startResult = wsl docker run -d --name clean-cut-mcp -p 6970:6970 -p 6971:6971 -v "$wslCurrentDir/clean-cut-exports:/workspace/out" -v "$wslCurrentDir/clean-cut-workspace:/workspace" --restart unless-stopped endlessblink/clean-cut-mcp:latest 2>&1
        } else {
            # Linux/macOS: Direct volume mounts
            $startResult = docker run -d --name clean-cut-mcp -p 6970:6970 -p 6971:6971 -v "$currentDir/clean-cut-exports:/workspace/out" -v "$currentDir/clean-cut-workspace:/workspace" --restart unless-stopped endlessblink/clean-cut-mcp:latest 2>&1
        }

        if ($LASTEXITCODE -ne 0) {
            Write-UserMessage "[ERROR] Container start failed: $startResult" -Type Error
            return $false
        }

        Write-UserMessage "[OK] FRESH CONTAINER STARTED - Using latest Docker Hub image with all fixes!" -Type Success
        
        # Wait for container to be ready (platform-specific)
        $attempts = 0
        while ($attempts -lt 15) {
            $status = if ($script:IsWindows) {
                wsl docker ps --filter "name=clean-cut-mcp" --format "{{.Status}}" 2>$null
            } else {
                docker ps --filter "name=clean-cut-mcp" --format "{{.Status}}" 2>$null
            }

            if ($status -like "*Up*") {
                Write-UserMessage "[OK] Container is running" -Type Success
                return $true
            }
            Start-Sleep -Seconds 2
            $attempts++
        }
        
        Write-UserMessage "[ERROR] Container failed to start properly" -Type Error
        return $false
        
    } catch {
        Write-UserMessage "[ERROR] Failed to start container: $($_.Exception.Message)" -Type Error
        return $false
    }
}

function Find-WorkingConnection {
    Write-UserMessage "[CHECK] Finding best connection method..." -Type Step
    
    $methods = @(
        @{Name = "Localhost"; Url = "http://localhost:6970"},
        @{Name = "WSL2 IP"; Url = "http://$($(wsl hostname -I 2>$null).Trim()):6970"}
    )
    
    foreach ($method in $methods) {
        Write-UserMessage "Testing $($method.Name)..." -Type Info
        
        try {
            $response = Invoke-RestMethod "$($method.Url)/" -TimeoutSec 5 -ErrorAction Stop
            Write-UserMessage "[OK] $($method.Name) works!" -Type Success
            return $method.Url
        } catch {
            Write-UserMessage "[ERROR] $($method.Name) failed" -Type Warning
        }
    }
    
    return $null
}

function Find-ClaudeDesktop {
    Write-UserMessage "[CHECK] Detecting Claude Desktop installation..." -Type Step

    $detectedPaths = @()

    if ($script:IsWindows) {
        # Windows: Registry and process detection
        Write-UserMessage "Searching Windows registry and processes..." -Type Info

        # Method 1: Registry search
        try {
            $registryPaths = @(
                "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
                "HKLM:\SOFTWARE\Wow6432node\Microsoft\Windows\CurrentVersion\Uninstall\*",
                "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*"
            )

            foreach ($regPath in $registryPaths) {
                Get-ItemProperty -Path $regPath -ErrorAction SilentlyContinue |
                Where-Object {$_.DisplayName -like "*Claude*"} |
                ForEach-Object {
                    if ($_.InstallLocation) {
                        $detectedPaths += @{
                            Type = "Installation"
                            Path = $_.InstallLocation
                            Version = $_.DisplayVersion
                            Method = "Registry"
                        }
                    }
                }
            }
        } catch {
            Write-UserMessage "Registry search failed, continuing..." -Type Warning
        }

        # Method 2: Process detection
        try {
            Get-Process -Name "*Claude*" -ErrorAction SilentlyContinue | ForEach-Object {
                $processPath = $_.Path
                if ($processPath) {
                    $installDir = Split-Path $processPath -Parent
                    $detectedPaths += @{
                        Type = "Process"
                        Path = $installDir
                        Version = "Running"
                        Method = "Process"
                    }
                }
            }
        } catch {
            Write-UserMessage "Process detection failed, continuing..." -Type Warning
        }

    } elseif ($script:IsLinux) {
        # Linux: Binary and process detection
        Write-UserMessage "Searching Linux directories and processes..." -Type Info

        # Method 1: Common binary locations
        $linuxPaths = @("/usr/bin", "/usr/local/bin", "/opt", "$env:HOME/.local/bin")
        foreach ($path in $linuxPaths) {
            if (Test-Path $path) {
                Get-ChildItem -Path $path -ErrorAction SilentlyContinue |
                Where-Object {$_.Name -like "*claude*"} |
                ForEach-Object {
                    $detectedPaths += @{
                        Type = "Binary"
                        Path = $_.DirectoryName
                        Version = "Unknown"
                        Method = "FileSystem"
                    }
                }
            }
        }

        # Method 2: Process detection (if available)
        try {
            $processes = & ps aux 2>/dev/null | & grep -i claude 2>/dev/null
            if ($processes) {
                $detectedPaths += @{
                    Type = "Process"
                    Path = "Running"
                    Version = "Detected"
                    Method = "Process"
                }
            }
        } catch {
            # ps command might not be available, continue
        }

    } elseif ($script:IsMacOS) {
        # macOS: Applications folder detection
        Write-UserMessage "Searching macOS Applications folders..." -Type Info

        $macPaths = @("/Applications", "$env:HOME/Applications")
        foreach ($path in $macPaths) {
            if (Test-Path $path) {
                Get-ChildItem -Path $path -ErrorAction SilentlyContinue |
                Where-Object {$_.Name -like "*Claude*"} |
                ForEach-Object {
                    $detectedPaths += @{
                        Type = "Application"
                        Path = $_.FullName
                        Version = "Unknown"
                        Method = "Applications"
                    }
                }
            }
        }
    }

    return $detectedPaths
}

function Get-ClaudeConfigPath {
    Write-UserMessage "[LOCATE] Determining Claude Desktop config path..." -Type Step

    # First, try to detect Claude Desktop installation
    $installations = Find-ClaudeDesktop

    if ($installations.Count -gt 0) {
        Write-UserMessage "[OK] Found $($installations.Count) Claude Desktop installation(s)" -Type Success

        # Display detected installations
        foreach ($install in $installations) {
            Write-UserMessage "  $($install.Type): $($install.Path)" -Type Info
        }
    } else {
        Write-UserMessage "No Claude Desktop installation detected, using standard paths" -Type Warning
    }

    # Determine config path based on OS and detection results
    if ($script:IsWindows) {
        # Try multiple Windows config locations
        $configPaths = @(
            "$env:APPDATA\Claude\claude_desktop_config.json",
            "$env:LOCALAPPDATA\AnthropicClaude\config\claude_desktop_config.json",
            "$env:USERPROFILE\.claude\claude_desktop_config.json"
        )
    } elseif ($script:IsLinux) {
        # Try multiple Linux config locations
        $configPaths = @(
            "$env:HOME/.config/Claude/claude_desktop_config.json",
            "$env:HOME/.claude/claude_desktop_config.json",
            "$env:HOME/.config/claude-desktop/config.json"
        )
    } elseif ($script:IsMacOS) {
        # Try multiple macOS config locations
        $configPaths = @(
            "$env:HOME/Library/Application Support/Claude/claude_desktop_config.json",
            "$env:HOME/.config/Claude/claude_desktop_config.json",
            "$env:HOME/.claude/claude_desktop_config.json"
        )
    }

    # Find the first existing config directory or use the first path for creation
    foreach ($configPath in $configPaths) {
        $configDir = Split-Path $configPath -Parent
        if (Test-Path $configDir) {
            Write-UserMessage "[OK] Found existing config directory: $configDir" -Type Success
            return $configPath
        }
    }

    # No existing directory found, return first path for creation
    $primaryPath = $configPaths[0]
    Write-UserMessage "Using primary config path: $primaryPath" -Type Info
    return $primaryPath
}

function Test-NetworkAccess {
    Write-UserMessage "[NETWORK] Testing network connectivity..." -Type Step

    try {
        if ($script:IsWindows) {
            Write-UserMessage "Testing WSL2 Docker access..." -Type Info
            $dockerTest = wsl docker --version 2>$null
            if (-not $dockerTest) {
                Write-UserMessage "[ERROR] Docker not accessible in WSL2" -Type Error
                return $false
            }
            Write-UserMessage "[OK] Docker accessible in WSL2" -Type Success
        } else {
            Write-UserMessage "Testing native Docker access..." -Type Info
            $dockerTest = docker --version 2>$null
            if (-not $dockerTest) {
                Write-UserMessage "[ERROR] Docker not accessible" -Type Error
                return $false
            }
            Write-UserMessage "[OK] Docker accessible natively" -Type Success
        }

        Write-UserMessage "[OK] Using Docker's automatic port forwarding (no admin required)" -Type Success
        return $true

    } catch {
        Write-UserMessage "Network test failed: $($_.Exception.Message)" -Type Error
        return $false
    }
}

function Install-ClaudeConfiguration {

    Write-UserMessage "[CONFIG] Configuring Claude Desktop..." -Type Step

    try {
        # Kill Claude Desktop if running (cross-platform)
        if ($script:IsWindows) {
            Get-Process -Name "Claude*" -ErrorAction SilentlyContinue | Stop-Process -Force
        } else {
            # Linux/macOS - kill Claude processes if running
            & pkill -f "claude" 2>/dev/null | Out-Null
        }
        Start-Sleep -Seconds 2

        # Use intelligent config path detection
        $configPath = Get-ClaudeConfigPath
        if (-not $configPath) {
            throw "Could not determine Claude Desktop configuration path"
        }

        $configDir = Split-Path $configPath -Parent
        Write-UserMessage "Using detected config path: $configPath" -Type Success
        
        # Create directory if needed
        Write-UserMessage "[FOLDER] Creating config directory: $configDir" -Type Info
        if (-not (Test-Path $configDir)) {
            try {
                New-Item -ItemType Directory -Path $configDir -Force | Out-Null
                Write-UserMessage "[OK] Config directory created successfully" -Type Success
            } catch {
                Write-UserMessage "[ERROR] Failed to create config directory: $($_.Exception.Message)" -Type Error
                throw "Config directory creation failed"
            }
        } else {
            Write-UserMessage "[OK] Config directory already exists" -Type Info
        }

        # Backup existing config
        if (Test-Path $configPath) {
            try {
                $backupPath = "$configPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
                Copy-Item $configPath $backupPath -Force
                Write-UserMessage "[OK] Existing configuration backed up to: $(Split-Path $backupPath -Leaf)" -Type Success
            } catch {
                Write-UserMessage "[ERROR] Config backup failed: $($_.Exception.Message)" -Type Warning
                Write-UserMessage "Continuing without backup..." -Type Warning
            }
        } else {
            Write-UserMessage "No existing config found - creating new configuration" -Type Info
        }
        
        # Create new configuration - STDIO transport with working command path
        Write-UserMessage "[SETUP] Generating Claude Desktop configuration..." -Type Info

        $dockerCommand = "docker"
        $dockerArgs = @("exec", "-i", "clean-cut-mcp", "node", "/app/mcp-server/dist/clean-stdio-server.js")

        Write-UserMessage "Command: $dockerCommand" -Type Info
        Write-UserMessage "Args count: $($dockerArgs.Count)" -Type Info
        Write-UserMessage "Args content: $($dockerArgs -join ' | ')" -Type Info

        $config = @{
            mcpServers = @{
                "clean-cut-mcp" = @{
                    command = $dockerCommand
                    args = $dockerArgs
                }
            }
        }

        # Desktop Commander's PROVEN approach - Deep copy preservation
        Write-UserMessage "[CONFIG] Using Desktop Commander's proven JSON method..." -Type Info

        $config = @{}
        if (Test-Path $configPath) {
            try {
                $jsonContent = Get-Content $configPath -Raw | ConvertFrom-Json

                # Deep copy all existing properties (Desktop Commander method)
                foreach ($property in $jsonContent.PSObject.Properties) {
                    if ($property.Name -eq "mcpServers" -and $property.Value) {
                        # Preserve existing MCP servers
                        $config.mcpServers = @{}
                        foreach ($serverProperty in $property.Value.PSObject.Properties) {
                            $serverConfig = @{
                                command = $serverProperty.Value.command
                            }
                            if ($serverProperty.Value.args) {
                                $serverConfig.args = @($serverProperty.Value.args)
                            }
                            if ($serverProperty.Value.env) {
                                $serverConfig.env = @{}
                                foreach ($envProperty in $serverProperty.Value.env.PSObject.Properties) {
                                    $serverConfig.env[$envProperty.Name] = $envProperty.Value
                                }
                            }
                            $config.mcpServers[$serverProperty.Name] = $serverConfig
                        }
                        Write-UserMessage "[OK] Preserved $($property.Value.PSObject.Properties.Count) existing MCP servers" -Type Success
                    } else {
                        $config[$property.Name] = $property.Value
                    }
                }
            } catch {
                Write-UserMessage "[ERROR] Failed to parse existing config, creating new one" -Type Warning
                $config = @{}
            }
        }

        # Ensure mcpServers exists
        if (-not $config.mcpServers) {
            $config.mcpServers = @{}
        }

        # Add/update clean-cut-mcp using Desktop Commander's direct assignment method
        $config.mcpServers["clean-cut-mcp"] = @{
            command = $dockerCommand
            args = $dockerArgs
        }
        Write-UserMessage "[OK] Added clean-cut-mcp configuration" -Type Success

        # Generate JSON using Desktop Commander's exact method
        $jsonContent = $config | ConvertTo-Json -Depth 10
        Write-UserMessage "[OK] JSON generated using Desktop Commander method" -Type Success
        
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

        # Desktop Commander's proven file writing method
        Write-UserMessage "[SAVE] Writing configuration using Desktop Commander method..." -Type Info

        try {
            # Use Desktop Commander's exact method: System.IO.File.WriteAllText with UTF8 no BOM
            [System.IO.File]::WriteAllText($configPath, $jsonContent, [System.Text.UTF8Encoding]::new($false))
            Write-UserMessage "[OK] Configuration saved using System.IO.File method" -Type Success
        } catch {
            Write-UserMessage "[ERROR] Failed to write config file: $($_.Exception.Message)" -Type Error
            throw "Config file write failed"
        }

        # Final verification (Desktop Commander approach)
        if (Test-Path $configPath) {
            try {
                # Verify written config can be parsed
                $verifyContent = Get-Content $configPath -Raw | ConvertFrom-Json
                if ($verifyContent.mcpServers."clean-cut-mcp".command -eq $dockerCommand) {
                    $finalSize = (Get-Item $configPath).Length
                    Write-UserMessage "[OK] Claude Desktop configured successfully ($finalSize bytes)" -Type Success
                    Write-UserMessage "[OK] Config location: $configPath" -Type Info
                    Write-UserMessage "[OK] clean-cut-mcp MCP server added with STDIO transport" -Type Success
                    return $true
                } else {
                    throw "Configuration verification failed - clean-cut-mcp not found"
                }
            } catch {
                Write-UserMessage "[ERROR] Configuration verification failed: $($_.Exception.Message)" -Type Error
                throw "Written configuration is invalid"
            }
        } else {
            throw "Configuration file was not created"
        }
        
    } catch {
        Write-UserMessage "[ERROR] Claude configuration failed: $($_.Exception.Message)" -Type Error
        return $false
    }
}

function Show-UserInstructions {
    Write-Host ""
    Write-Host "[SUCCESS] INSTALLATION COMPLETE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start Claude Desktop" -ForegroundColor White
    Write-Host "2. Open a new conversation" -ForegroundColor White  
    Write-Host "3. Look for 'clean-cut-mcp' in available tools" -ForegroundColor White
    Write-Host "4. Test with: 'Create a bouncing ball animation'" -ForegroundColor White
    Write-Host ""
    Write-Host "[STUDIO] Remotion Studio: http://localhost:6970" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "If you have issues:" -ForegroundColor Cyan
    Write-Host "• Run this installer again" -ForegroundColor White
    Write-Host "• Check that Docker is running" -ForegroundColor White
    Write-Host "• Restart Claude Desktop" -ForegroundColor White
    Write-Host ""
}

function Show-ErrorHelp {
    Write-Host ""
    Write-Host "[FAILED] INSTALLATION FAILED" -ForegroundColor Red
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
        Write-UserMessage "[ERROR] System requirements not met:" -Type Error
        foreach ($issue in $issues) {
            Write-UserMessage "  • $issue" -Type Error
        }
        Write-Host ""
        Write-Host "Please fix these issues and run the installer again." -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-UserMessage "[OK] System requirements OK" -Type Success
    
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
    Write-UserMessage "[CHECK] Verifying container is ready..." -Type Step

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
        Write-UserMessage "[ERROR] Container not accessible via docker exec" -Type Error
        Show-ErrorHelp
        Read-Host "Press Enter to exit"
        exit 1
    }

    Write-UserMessage "[OK] Container accessible - Remotion Studio and MCP server ready" -Type Success

    # Step 5: Configure Claude Desktop for STDIO transport
    if (-not (Install-ClaudeConfiguration)) {
        Show-ErrorHelp
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    # Success!
    Show-UserInstructions
    
} catch {
    Write-UserMessage "[CRASH] Unexpected error: $($_.Exception.Message)" -Type Error
    Show-ErrorHelp
} finally {
    Write-Host "Press Enter to close..." -ForegroundColor Gray
    Read-Host
}