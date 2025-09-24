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
Write-Host "🎬 CLEAN-CUT-MCP INSTALLER v2.1.0-VALIDATION" -ForegroundColor Cyan
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
        # Always ensure we have the latest image - remove old container if exists
        Write-UserMessage "🔄 FORCING FRESH INSTALLATION - Removing any existing containers..." -Type Step

        # Stop and remove existing container to get fresh installation
        if ($script:IsWindows) {
            $stopResult = wsl docker stop clean-cut-mcp 2>&1
            $removeResult = wsl docker rm clean-cut-mcp 2>&1
        } else {
            $stopResult = docker stop clean-cut-mcp 2>&1
            $removeResult = docker rm clean-cut-mcp 2>&1
        }

        if ($stopResult -notlike "*No such container*" -and $stopResult -notlike "*is not running*") {
            Write-UserMessage "✓ Stopped existing container" -Type Success
        }
        if ($removeResult -notlike "*No such container*") {
            Write-UserMessage "✓ Removed existing container" -Type Success
        }

        # Always pull latest image to ensure updates
        Write-UserMessage "Pulling latest Clean-Cut-MCP image from Docker Hub..." -Type Info
        $pullResult = if ($script:IsWindows) {
            wsl docker pull endlessblink/clean-cut-mcp:latest 2>&1
        } else {
            docker pull endlessblink/clean-cut-mcp:latest 2>&1
        }

        if ($LASTEXITCODE -ne 0) {
            Write-UserMessage "✗ Failed to pull latest image: $pullResult" -Type Error
            Write-UserMessage "Please ensure Docker is running and has internet access" -Type Error
            return $false
        }

        Write-UserMessage "✓ Latest Docker image pulled successfully - All fixes included!" -Type Success

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
            Write-UserMessage "✗ Container start failed: $startResult" -Type Error
            return $false
        }

        Write-UserMessage "✓ FRESH CONTAINER STARTED - Using latest Docker Hub image with all fixes!" -Type Success
        
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

function Find-ClaudeDesktop {
    Write-UserMessage "🔍 Detecting Claude Desktop installation..." -Type Step

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
    Write-UserMessage "📍 Determining Claude Desktop config path..." -Type Step

    # First, try to detect Claude Desktop installation
    $installations = Find-ClaudeDesktop

    if ($installations.Count -gt 0) {
        Write-UserMessage "✓ Found $($installations.Count) Claude Desktop installation(s)" -Type Success

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
            Write-UserMessage "✓ Found existing config directory: $configDir" -Type Success
            return $configPath
        }
    }

    # No existing directory found, return first path for creation
    $primaryPath = $configPaths[0]
    Write-UserMessage "Using primary config path: $primaryPath" -Type Info
    return $primaryPath
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

        # Use intelligent config path detection
        $configPath = Get-ClaudeConfigPath
        if (-not $configPath) {
            throw "Could not determine Claude Desktop configuration path"
        }

        $configDir = Split-Path $configPath -Parent
        Write-UserMessage "Using detected config path: $configPath" -Type Success
        
        # Create directory if needed
        Write-UserMessage "📁 Creating config directory: $configDir" -Type Info
        if (-not (Test-Path $configDir)) {
            try {
                New-Item -ItemType Directory -Path $configDir -Force | Out-Null
                Write-UserMessage "✓ Config directory created successfully" -Type Success
            } catch {
                Write-UserMessage "✗ Failed to create config directory: $($_.Exception.Message)" -Type Error
                throw "Config directory creation failed"
            }
        } else {
            Write-UserMessage "✓ Config directory already exists" -Type Info
        }

        # Backup existing config
        if (Test-Path $configPath) {
            try {
                $backupPath = "$configPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
                Copy-Item $configPath $backupPath -Force
                Write-UserMessage "✓ Existing configuration backed up to: $(Split-Path $backupPath -Leaf)" -Type Success
            } catch {
                Write-UserMessage "✗ Config backup failed: $($_.Exception.Message)" -Type Warning
                Write-UserMessage "Continuing without backup..." -Type Warning
            }
        } else {
            Write-UserMessage "No existing config found - creating new configuration" -Type Info
        }
        
        # Create new configuration - STDIO transport with working command path
        Write-UserMessage "🔧 Generating Claude Desktop configuration..." -Type Info

        $dockerCommand = "docker"
        $dockerArgs = @("exec", "-i", "clean-cut-mcp", "node", "/app/mcp-server/dist/clean-stdio-server.js")

        Write-UserMessage "Command: $dockerCommand" -Type Info
        Write-UserMessage "Args count: $($dockerArgs.Count)" -Type Info
        Write-UserMessage "Args content: $($dockerArgs -join ' | ')" -Type Info

        # DESKTOP COMMANDER APPROACH: Safe configuration merging that preserves existing MCP servers
        Write-UserMessage "📝 Configuring Claude Desktop (Desktop Commander method - preserves existing MCPs)..." -Type Info

        # Load existing configuration if it exists
        $existingConfig = $null
        if (Test-Path $configPath) {
            Write-UserMessage "✓ Found existing Claude Desktop configuration" -Type Info
            try {
                $existingContent = Get-Content $configPath -Raw
                $existingConfig = $existingContent | ConvertFrom-Json
                Write-UserMessage "✓ Parsed existing configuration successfully" -Type Success
            } catch {
                Write-UserMessage "⚠️ Could not parse existing config, will create backup and start fresh" -Type Warning
                $existingConfig = $null
            }
        } else {
            Write-UserMessage "✓ No existing config found - will create new configuration" -Type Info
        }

        # Load existing configuration or create new one
        if ($existingConfig) {
            Write-UserMessage "✓ Found existing configuration, preserving other MCP servers..." -Type Info

            # Ensure mcpServers object exists
            if (-not $existingConfig.mcpServers) {
                $existingConfig | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value @{} -Force
                Write-UserMessage "✓ Created mcpServers section in existing config" -Type Info
            }

            # Count existing servers before modification
            $existingServerNames = @($existingConfig.mcpServers.PSObject.Properties.Name | Where-Object {$_ -ne "clean-cut-mcp"})
            $existingCount = $existingServerNames.Count

            # Remove any old "clean-cut-mcp" entry (Desktop Commander pattern: remove then add)
            if ($existingConfig.mcpServers."clean-cut-mcp") {
                $existingConfig.mcpServers.PSObject.Properties.Remove("clean-cut-mcp")
                Write-UserMessage "✓ Removed old clean-cut-mcp configuration" -Type Info
            }

            # Add new clean-cut-mcp server configuration (Desktop Commander pattern)
            $existingConfig.mcpServers | Add-Member -MemberType NoteProperty -Name "clean-cut-mcp" -Value @{
                command = $dockerCommand
                args = $dockerArgs
            } -Force

            $config = $existingConfig
            Write-UserMessage "✓ Preserved $existingCount existing MCP servers: $($existingServerNames -join ', ')" -Type Success
            Write-UserMessage "✓ Added clean-cut-mcp with validation system" -Type Success

        } else {
            # Create new configuration (no existing config found)
            $config = @{
                mcpServers = @{
                    "clean-cut-mcp" = @{
                        command = $dockerCommand
                        args = $dockerArgs
                    }
                }
            }
            Write-UserMessage "✓ Created new configuration with clean-cut-mcp" -Type Success
        }

        # Generate JSON using Desktop Commander's exact method (PowerShell native conversion)
        try {
            $jsonContent = $config | ConvertTo-Json -Depth 10
            Write-UserMessage "✓ JSON generated using Desktop Commander method" -Type Success
        } catch {
            Write-UserMessage "✗ JSON generation failed: $($_.Exception.Message)" -Type Error
            throw "JSON generation failed"
        }

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

        # Atomic save (temp file then move) with detailed logging
        Write-UserMessage "💾 Writing configuration file..." -Type Info
        $tempFile = "$configPath.tmp"

        try {
            $jsonContent | Out-File $tempFile -Encoding UTF8 -Force
            Write-UserMessage "✓ Temporary config file written: $(Split-Path $tempFile -Leaf)" -Type Success
        } catch {
            Write-UserMessage "✗ Failed to write temp config file: $($_.Exception.Message)" -Type Error
            throw "Config file write failed"
        }

        # Validate temp file with detailed logging
        Write-UserMessage "🔍 Validating written configuration..." -Type Info
        $tempValid = $false
        try {
            $tempValid = Test-Json -Path $tempFile -ErrorAction Stop
            Write-UserMessage "✓ JSON validation successful (Test-Json)" -Type Success
        } catch {
            Write-UserMessage "Test-Json not available, using fallback validation..." -Type Warning
            try {
                $testContent = Get-Content $tempFile | ConvertFrom-Json
                if ($testContent.mcpServers."clean-cut-mcp".args.Count -eq 5) {
                    Write-UserMessage "✓ JSON validation successful (ConvertFrom-Json)" -Type Success
                    Write-UserMessage "✓ Args array has correct count: $($testContent.mcpServers."clean-cut-mcp".args.Count)" -Type Success
                    $tempValid = $true
                } else {
                    Write-UserMessage "✗ Args array count wrong: $($testContent.mcpServers."clean-cut-mcp".args.Count)" -Type Error
                    $tempValid = $false
                }
            } catch {
                Write-UserMessage "✗ JSON parsing failed: $($_.Exception.Message)" -Type Error
                $tempValid = $false
            }
        }

        if ($tempValid) {
            try {
                Move-Item $tempFile $configPath -Force
                Write-UserMessage "✓ Configuration file moved to final location" -Type Success

                # Final verification
                if (Test-Path $configPath) {
                    $finalSize = (Get-Item $configPath).Length
                    Write-UserMessage "✓ Claude Desktop configured successfully ($finalSize bytes)" -Type Success
                    Write-UserMessage "✓ Config location: $configPath" -Type Info
                } else {
                    throw "Config file disappeared after move"
                }

                return $true
            } catch {
                Write-UserMessage "✗ Failed to move config to final location: $($_.Exception.Message)" -Type Error
                throw "Config file move failed"
            }
        } else {
            Remove-Item $tempFile -Force -ErrorAction SilentlyContinue
            Write-UserMessage "✗ Configuration validation failed - config not updated" -Type Error
            throw "Temporary configuration file is invalid"
        }
        
    } catch {
        Write-UserMessage "✗ Claude configuration failed: $($_.Exception.Message)" -Type Error
        return $false
    }
}

function Install-ManagementUtilities {
    Write-UserMessage "[UTILS] Installing management utilities..." -Type Step

    try {
        $currentDir = Get-Location

        # Install MCP Manager Script (Universal)
        $mcpManagerContent = @'
#!/bin/bash
# MCP Server Process Manager - Ensures only one instance runs with validation enabled
# Usage: ./mcp-manager.sh [start|stop|status|restart]

set -euo pipefail

CONTAINER_NAME="clean-cut-mcp"
PID_FILE="/tmp/clean-cut-mcp.pid"
MCP_SERVER_CMD="node /app/mcp-server/dist/clean-stdio-server.js"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[MCP-MANAGER]${NC} $1"; }
warn() { echo -e "${YELLOW}[MCP-MANAGER]${NC} $1"; }
error() { echo -e "${RED}[MCP-MANAGER]${NC} $1"; }

# Check if container is running
check_container() {
    if ! docker ps --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        error "Container ${CONTAINER_NAME} is not running"
        exit 1
    fi
}

# Start MCP server with validation enabled
start_mcp() {
    check_container
    log "Starting MCP server with validation enabled..."
    docker exec -d ${CONTAINER_NAME} sh -c "echo \$\$ > ${PID_FILE} && ENABLE_ANIMATION_VALIDATION=true exec ${MCP_SERVER_CMD}"
    sleep 2
    local actual_pid=$(docker exec ${CONTAINER_NAME} cat ${PID_FILE} 2>/dev/null)
    if [[ -n "$actual_pid" ]]; then
        log "MCP server started successfully (PID: $actual_pid) with validation active"
    else
        error "Failed to start MCP server"
        exit 1
    fi
}

# Show status
status_mcp() {
    check_container
    local stored_pid=$(docker exec ${CONTAINER_NAME} cat ${PID_FILE} 2>/dev/null || echo "")
    if [[ -n "$stored_pid" ]]; then
        log "MCP server is running (PID: $stored_pid) with validation enabled"
    else
        log "MCP server is not running"
    fi
}

# Main command handling
case "${1:-status}" in
    start) start_mcp ;;
    status) status_mcp ;;
    restart)
        docker exec ${CONTAINER_NAME} pkill -f "clean-stdio-server.js" 2>/dev/null || true
        sleep 1
        start_mcp
        ;;
    stop)
        docker exec ${CONTAINER_NAME} pkill -f "clean-stdio-server.js" 2>/dev/null || true
        docker exec ${CONTAINER_NAME} rm -f ${PID_FILE} 2>/dev/null || true
        log "MCP server stopped"
        ;;
    *) echo "Usage: $0 [start|stop|status|restart]"; exit 1 ;;
esac
'@

        $mcpManagerPath = Join-Path $currentDir "mcp-manager.sh"
        Set-Content -Path $mcpManagerPath -Value $mcpManagerContent -Encoding UTF8

        # Make executable
        if ($script:IsWindows) {
            wsl chmod +x "./mcp-manager.sh" 2>$null
        } else {
            chmod +x $mcpManagerPath
        }

        Write-UserMessage "[OK] Installed mcp-manager.sh for process management" -Type Success

        # Install Kill Claude Utility (Windows only)
        if ($script:IsWindows) {
            $killClaudeContent = @'
#!/usr/bin/env pwsh
Write-Host "Kill Claude Desktop + Clear Cache" -ForegroundColor Cyan
$claudeProcesses = @("Claude", "claude", "Claude Desktop", "claude-desktop")
foreach ($processName in $claudeProcesses) {
    Get-Process -Name $processName -ErrorAction SilentlyContinue | Stop-Process -Force
}
$cacheLocations = @("$env:LOCALAPPDATA\Claude\Logs", "$env:LOCALAPPDATA\Claude\Cache")
foreach ($location in $cacheLocations) {
    if (Test-Path $location) {
        Remove-Item -Path "$location\*" -Recurse -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "COMPLETE! You can now restart Claude Desktop." -ForegroundColor Green
'@
            $killClaudePath = Join-Path $currentDir "kill-claude-clean.ps1"
            Set-Content -Path $killClaudePath -Value $killClaudeContent -Encoding UTF8
            Write-UserMessage "[OK] Installed kill-claude-clean.ps1 for cache clearing" -Type Success
        }

    } catch {
        Write-UserMessage "[WARNING] Utility installation failed, but main installation completed" -Type Warning
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
    Write-Host ""
    Write-Host "🆕 NEW v2.1.0 Features:" -ForegroundColor Yellow
    Write-Host "• Animation validation system (prevents syntax errors)" -ForegroundColor White
    Write-Host "• MCP singleton management (no process conflicts)" -ForegroundColor White
    Write-Host "• Automatic error fixing (React.FC type issues)" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Management Utilities:" -ForegroundColor Yellow
    Write-Host "• ./mcp-manager.sh status   - Check MCP server status" -ForegroundColor White
    Write-Host "• ./mcp-manager.sh restart  - Restart MCP server" -ForegroundColor White
    if ($script:IsWindows) {
        Write-Host "• ./kill-claude-clean.ps1   - Clear Claude cache (if issues)" -ForegroundColor White
    }
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
    
    # Install management utilities
    Install-ManagementUtilities

    # Success!
    Show-UserInstructions
    
} catch {
    Write-UserMessage "💥 Unexpected error: $($_.Exception.Message)" -Type Error
    Show-ErrorHelp
} finally {
    Write-Host "Press Enter to close..." -ForegroundColor Gray
    Read-Host
}