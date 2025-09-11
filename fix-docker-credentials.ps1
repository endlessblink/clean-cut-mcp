#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Fix Docker Credential Helper Issues
    Resolves "docker-credential-desktop: executable file not found in %PATH%" error

.DESCRIPTION
    This script fixes the common Docker credential helper issue on Windows by:
    - Backing up existing Docker config
    - Removing problematic credStore/credsStore entries
    - Configuring Windows native credential storage
    - Testing authentication

.EXAMPLE
    .\fix-docker-credentials.ps1
    # Fixes credential helper and tests authentication
#>

$ErrorActionPreference = "Stop"

# ANSI colors
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

function Get-DockerConfigPath {
    if ($IsWindows -or $PSVersionTable.PSVersion.Major -le 5) {
        return Join-Path $env:USERPROFILE ".docker\config.json"
    } else {
        return Join-Path $HOME ".docker/config.json"
    }
}

function Backup-DockerConfig {
    param([string]$ConfigPath)
    
    if (Test-Path $ConfigPath) {
        $backupPath = "$ConfigPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $ConfigPath $backupPath
        Write-ColorOutput "green" "✅ Backed up Docker config to: $backupPath"
        return $backupPath
    }
    
    Write-ColorOutput "yellow" "⚠️  No existing Docker config found"
    return $null
}

function Fix-DockerConfig {
    param([string]$ConfigPath)
    
    Write-ColorOutput "blue" "🔧 Fixing Docker credential configuration..."
    
    $config = @{}
    
    # Read existing config if it exists
    if (Test-Path $ConfigPath) {
        try {
            $configContent = Get-Content $ConfigPath -Raw
            $config = $configContent | ConvertFrom-Json -AsHashtable
            Write-ColorOutput "green" "✅ Read existing Docker config"
        } catch {
            Write-ColorOutput "yellow" "⚠️  Invalid config file, creating new one"
            $config = @{}
        }
    } else {
        Write-ColorOutput "blue" "📝 Creating new Docker config file"
    }
    
    # Remove problematic credential store entries
    $fixesApplied = @()
    
    if ($config.ContainsKey("credsStore")) {
        $oldValue = $config["credsStore"]
        $config.Remove("credsStore")
        $fixesApplied += "Removed credsStore: $oldValue"
        Write-ColorOutput "yellow" "🔧 Removed problematic credsStore: $oldValue"
    }
    
    if ($config.ContainsKey("credStore")) {
        $oldValue = $config["credStore"]
        if ($oldValue -eq "desktop" -or $oldValue -eq "desktop.exe") {
            $config.Remove("credStore")
            $fixesApplied += "Removed problematic credStore: $oldValue"
            Write-ColorOutput "yellow" "🔧 Removed problematic credStore: $oldValue"
        }
    }
    
    # Configure Windows native credential storage (optional)
    if ($IsWindows -or $PSVersionTable.PSVersion.Major -le 5) {
        # Use wincred for Windows - more reliable than desktop helper
        $config["credStore"] = "wincred"
        $fixesApplied += "Configured Windows credential storage"
        Write-ColorOutput "green" "✅ Configured Windows native credential storage"
    }
    
    # Ensure config directory exists
    $configDir = Split-Path $ConfigPath
    if (!(Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
        Write-ColorOutput "green" "✅ Created Docker config directory: $configDir"
    }
    
    # Write fixed config
    try {
        $config | ConvertTo-Json -Depth 10 | Set-Content $ConfigPath -Encoding UTF8
        Write-ColorOutput "green" "✅ Fixed Docker config written to: $ConfigPath"
    } catch {
        Write-ColorOutput "red" "❌ Failed to write config: $($_.Exception.Message)"
        return $false
    }
    
    # Show what was fixed
    if ($fixesApplied.Count -gt 0) {
        Write-ColorOutput "cyan" "`n📋 Fixes Applied:"
        foreach ($fix in $fixesApplied) {
            Write-ColorOutput "cyan" "   • $fix"
        }
    } else {
        Write-ColorOutput "green" "✅ Config was already correct"
    }
    
    return $true
}

function Test-DockerAuth {
    Write-ColorOutput "blue" "🧪 Testing Docker authentication..."
    
    try {
        # Test if already authenticated
        $dockerInfo = docker info 2>$null | Select-String "Username:"
        if ($dockerInfo) {
            $username = ($dockerInfo -split ":")[1].Trim()
            Write-ColorOutput "green" "✅ Already authenticated as: $username"
            return $true
        }
    } catch {
        # Not authenticated yet
    }
    
    Write-ColorOutput "yellow" "⚠️  Not currently authenticated"
    return $false
}

function Show-NextSteps {
    Write-ColorOutput "green" "`n🎯 Next Steps:"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "cyan" "1. Restart Docker Desktop:"
    Write-ColorOutput "cyan" "   • Close Docker Desktop completely"
    Write-ColorOutput "cyan" "   • Restart Docker Desktop"
    Write-ColorOutput "cyan" "   • Wait for full startup (whale icon in system tray)"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "cyan" "2. Test Authentication:"
    Write-ColorOutput "cyan" "   • docker login -u endlessblink"
    Write-ColorOutput "cyan" "   • Use your Docker Hub password"
    Write-ColorOutput "cyan" "   • Should work without credential helper errors"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "cyan" "3. Push to Docker Hub:"
    Write-ColorOutput "cyan" "   • docker push endlessblink/clean-cut-mcp:latest"
    Write-ColorOutput "cyan" "   • docker push endlessblink/clean-cut-mcp:v4.5.10"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "cyan" "4. Verify Repository:"
    Write-ColorOutput "cyan" "   • https://hub.docker.com/r/endlessblink/clean-cut-mcp"
}

function Main {
    Write-ColorOutput "cyan" "🔧 Docker Credential Helper Fix"
    Write-ColorOutput "cyan" "============================="
    Write-ColorOutput "cyan" ""
    
    # Get Docker config path
    $configPath = Get-DockerConfigPath
    Write-ColorOutput "blue" "📁 Docker config location: $configPath"
    
    # Backup existing config
    Write-ColorOutput "cyan" "`nStep 1: Backup Configuration"
    $backupPath = Backup-DockerConfig $configPath
    
    # Fix the configuration
    Write-ColorOutput "cyan" "`nStep 2: Fix Configuration"
    $fixSuccess = Fix-DockerConfig $configPath
    
    if (!$fixSuccess) {
        Write-ColorOutput "red" "❌ Failed to fix Docker configuration"
        if ($backupPath) {
            Write-ColorOutput "yellow" "🔄 Restore backup with: Copy-Item '$backupPath' '$configPath'"
        }
        exit 1
    }
    
    # Test current authentication
    Write-ColorOutput "cyan" "`nStep 3: Test Current Authentication"
    $authOk = Test-DockerAuth
    
    # Show next steps
    Show-NextSteps
    
    Write-ColorOutput "green" "`n✅ Docker credential helper fix completed!"
    Write-ColorOutput "yellow" "📝 IMPORTANT: Restart Docker Desktop before testing authentication"
}

# Handle interruption
$Host.UI.RawUI.CancelKeyPress += {
    Write-ColorOutput "yellow" "`n⚠️  Fix interrupted"
    exit 1
}

# Run the fix
try {
    Main
} catch {
    Write-ColorOutput "red" "`n💥 Fix failed: $($_.Exception.Message)"
    Write-ColorOutput "yellow" "   Try running as administrator or check Docker Desktop installation"
    exit 1
}