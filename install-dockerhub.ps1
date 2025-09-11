#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Clean-Cut-MCP Docker Hub Installation Script
    One-command installation using pre-built Docker images

.DESCRIPTION
    This script installs Clean-Cut-MCP from Docker Hub, eliminating the need for:
    - Git installation
    - Local Docker builds  
    - Source code downloads
    
    Perfect for VM testing and end-user deployments.

.PARAMETER Version
    Docker image version to install (default: latest)

.PARAMETER TestMode
    Run in test mode without making system changes

.EXAMPLE
    .\install-dockerhub.ps1
    # Installs latest version from Docker Hub

.EXAMPLE
    .\install-dockerhub.ps1 -Version v4.5.10
    # Installs specific version
#>

param(
    [string]$Version = "latest",
    [switch]$TestMode,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# ANSI colors for console output
$colors = @{
    green = "`e[32m"
    red = "`e[31m" 
    yellow = "`e[33m"
    blue = "`e[34m"
    cyan = "`e[36m"
    reset = "`e[0m"
}

function Write-ColorOutput {
    param([string]$Color, [string]$Message)
    Write-Host "$($colors[$Color])$Message$($colors.reset)"
}

function Test-DockerInstallation {
    Write-ColorOutput "blue" "Checking Docker installation..."
    
    try {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion) {
            Write-ColorOutput "green" "✅ Docker found: $dockerVersion"
            return $true
        }
    } catch {
        Write-ColorOutput "red" "❌ Docker not found or not running"
        Write-ColorOutput "yellow" "   Install Docker Desktop: https://docs.docker.com/desktop/"
        return $false
    }
    
    return $false
}

function Get-ClaudeConfigPath {
    if ($IsWindows -or $PSVersionTable.PSVersion.Major -le 5) {
        return Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
    } elseif ($IsMacOS) {
        return Join-Path $HOME "Library/Application Support/Claude/claude_desktop_config.json"
    } else {
        return Join-Path $HOME ".config/Claude/claude_desktop_config.json"
    }
}

function Backup-ClaudeConfig {
    param([string]$ConfigPath)
    
    if (Test-Path $ConfigPath) {
        $backupPath = "$ConfigPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $ConfigPath $backupPath
        Write-ColorOutput "green" "✅ Backed up existing config to: $backupPath"
        return $backupPath
    }
    return $null
}

function Install-FromDockerHub {
    param([string]$ImageVersion)
    
    $imageName = "endlessblink/clean-cut-mcp:$ImageVersion"
    Write-ColorOutput "blue" "📥 Pulling Docker image: $imageName"
    
    if ($TestMode) {
        Write-ColorOutput "yellow" "[TEST MODE] Would pull: $imageName"
        return $true
    }
    
    try {
        # Pull the image
        docker pull $imageName
        Write-ColorOutput "green" "✅ Image pulled successfully"
        
        # Stop and remove existing container if it exists
        try {
            docker stop clean-cut-mcp 2>$null | Out-Null
            docker rm clean-cut-mcp 2>$null | Out-Null
            Write-ColorOutput "green" "✅ Cleaned up existing container"
        } catch {
            # No existing container, that's fine
        }
        
        # Start the container
        Write-ColorOutput "blue" "🚀 Starting Clean-Cut-MCP container..."
        
        $runArgs = @(
            "run", "-d"
            "--name", "clean-cut-mcp"
            "--restart", "unless-stopped"
            "-p", "6960:6960"
            "-p", "6961:6961"
            "-v", "clean-cut-exports:/workspace/out"
            $imageName
        )
        
        docker @runArgs
        
        # Wait for container to start
        Start-Sleep -Seconds 5
        
        # Check container status
        $containerStatus = docker ps --filter "name=clean-cut-mcp" --format "{{.Status}}" 2>$null
        
        if ($containerStatus -like "*Up*") {
            Write-ColorOutput "green" "✅ Container started successfully"
            Write-ColorOutput "cyan" "   MCP Server: http://localhost:6961"
            Write-ColorOutput "cyan" "   Remotion Studio: http://localhost:6960"
            return $true
        } else {
            Write-ColorOutput "red" "❌ Container failed to start"
            return $false
        }
        
    } catch {
        Write-ColorOutput "red" "❌ Docker Hub installation failed: $($_.Exception.Message)"
        return $false
    }
}

function Configure-ClaudeDesktop {
    $configPath = Get-ClaudeConfigPath
    $configDir = Split-Path $configPath
    
    Write-ColorOutput "blue" "⚙️ Configuring Claude Desktop..."
    
    if ($TestMode) {
        Write-ColorOutput "yellow" "[TEST MODE] Would configure: $configPath"
        return $true
    }
    
    # Ensure config directory exists
    if (!(Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
        Write-ColorOutput "green" "✅ Created config directory: $configDir"
    }
    
    # Backup existing config
    $backupPath = Backup-ClaudeConfig $configPath
    
    # Read existing config or create new one
    $config = @{}
    if (Test-Path $configPath) {
        try {
            $configContent = Get-Content $configPath -Raw
            $config = $configContent | ConvertFrom-Json -AsHashtable
        } catch {
            Write-ColorOutput "yellow" "⚠️ Existing config invalid, creating new one"
            $config = @{}
        }
    }
    
    # Ensure mcpServers object exists
    if (!$config.mcpServers) {
        $config.mcpServers = @{}
    }
    
    # Configure clean-cut-mcp server using HTTP transport
    $config.mcpServers["clean-cut-mcp"] = @{
        "command" = if ($IsWindows -or $PSVersionTable.PSVersion.Major -le 5) { "powershell.exe" } else { "sh" }
        "args" = if ($IsWindows -or $PSVersionTable.PSVersion.Major -le 5) {
            @(
                "-NoProfile",
                "-ExecutionPolicy", "Bypass", 
                "-Command",
                '& { $body = [System.Console]::In.ReadToEnd(); Invoke-RestMethod -Uri "http://localhost:6961/mcp" -Method POST -Body $body -ContentType "application/json" }'
            )
        } else {
            @(
                "-c",
                'curl -X POST -H "Content-Type: application/json" -d @- http://localhost:6961/mcp'
            )
        }
    }
    
    # Write config
    try {
        $config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
        Write-ColorOutput "green" "✅ Claude Desktop configured successfully"
        Write-ColorOutput "cyan" "   Config location: $configPath"
        return $true
    } catch {
        Write-ColorOutput "red" "❌ Failed to write config: $($_.Exception.Message)"
        
        # Restore backup if available
        if ($backupPath -and (Test-Path $backupPath)) {
            Copy-Item $backupPath $configPath
            Write-ColorOutput "yellow" "⚠️ Restored backup config"
        }
        
        return $false
    }
}

function Test-Installation {
    Write-ColorOutput "blue" "🧪 Testing installation..."
    
    Start-Sleep -Seconds 10  # Wait for services to be ready
    
    try {
        # Test MCP server health
        if ($IsWindows -or $PSVersionTable.PSVersion.Major -le 5) {
            Invoke-RestMethod -Uri "http://localhost:6961/health" -TimeoutSec 5 | Out-Null
        } else {
            curl -f http://localhost:6961/health | Out-Null
        }
        Write-ColorOutput "green" "✅ MCP server health check passed"
    } catch {
        Write-ColorOutput "yellow" "⚠️ MCP server not ready yet (may still be starting)"
    }
    
    try {
        # Test Remotion Studio
        if ($IsWindows -or $PSVersionTable.PSVersion.Major -le 5) {
            Invoke-WebRequest -Uri "http://localhost:6960" -TimeoutSec 5 | Out-Null
        } else {
            curl -f http://localhost:6960 | Out-Null
        }
        Write-ColorOutput "green" "✅ Remotion Studio accessible"
    } catch {
        Write-ColorOutput "yellow" "⚠️ Remotion Studio not ready yet (may still be starting)"
    }
    
    return $true
}

function Show-CompletionMessage {
    Write-ColorOutput "green" "`n🎉 Clean-Cut-MCP installed successfully from Docker Hub!"
    Write-ColorOutput "cyan" "`n📋 Next steps:"
    Write-ColorOutput "cyan" "   1. Restart Claude Desktop"
    Write-ColorOutput "cyan" "   2. Ask Claude: `"Create a bouncing ball animation`""
    Write-ColorOutput "cyan" "   3. Expect: `"Animation ready at http://localhost:6960`""
    Write-ColorOutput "cyan" "`n🔗 Links:"
    Write-ColorOutput "cyan" "   • Remotion Studio: http://localhost:6960"
    Write-ColorOutput "cyan" "   • MCP Server: http://localhost:6961/health"
    Write-ColorOutput "cyan" "   • Docker Hub: https://hub.docker.com/r/endlessblink/clean-cut-mcp"
    Write-ColorOutput "cyan" "`n💡 Benefits of Docker Hub install:"
    Write-ColorOutput "cyan" "   • No Git required"
    Write-ColorOutput "cyan" "   • No build time (instant install)"
    Write-ColorOutput "cyan" "   • Version-locked consistency"
    Write-ColorOutput "cyan" "   • Perfect for VMs and testing"
}

function Show-ErrorMessage {
    Write-ColorOutput "red" "`n❌ Installation failed"
    Write-ColorOutput "yellow" "`n🔧 Troubleshooting:"
    Write-ColorOutput "yellow" "   1. Ensure Docker Desktop is running"
    Write-ColorOutput "yellow" "   2. Check internet connection"
    Write-ColorOutput "yellow" "   3. Try: docker pull endlessblink/clean-cut-mcp:latest"
    Write-ColorOutput "yellow" "   4. Try: .\install-dockerhub.ps1 -Force"
    Write-ColorOutput "cyan" "`n📖 Full documentation: https://github.com/endlessblink/clean-cut-mcp"
}

# Main execution
function Main {
    Write-ColorOutput "cyan" "🎬 Clean-Cut-MCP Docker Hub Installer"
    Write-ColorOutput "cyan" "===================================="
    
    if ($TestMode) {
        Write-ColorOutput "yellow" "🧪 Running in TEST MODE - no system changes will be made"
    }
    
    $success = $true
    
    # Step 1: Check Docker
    if (!$(Test-DockerInstallation)) {
        $success = $false
    }
    
    # Step 2: Install from Docker Hub
    if ($success -and !$(Install-FromDockerHub $Version)) {
        $success = $false
    }
    
    # Step 3: Configure Claude Desktop
    if ($success -and !$(Configure-ClaudeDesktop)) {
        $success = $false
    }
    
    # Step 4: Test installation
    if ($success) {
        Test-Installation | Out-Null
    }
    
    # Final status
    if ($success) {
        Show-CompletionMessage
    } else {
        Show-ErrorMessage
        exit 1
    }
}

# Handle graceful shutdown
$Host.UI.RawUI.CancelKeyPress += {
    Write-ColorOutput "yellow" "`n⚠️ Installation interrupted"
    exit 1
}

# Run the installer
try {
    Main
} catch {
    Write-ColorOutput "red" "`n💥 Installation failed: $($_.Exception.Message)"
    Show-ErrorMessage
    exit 1
}