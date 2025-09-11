#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Fix Docker Hub Authentication Issues
    Resolves credential helper and authentication problems

.DESCRIPTION
    This script diagnoses and fixes common Docker authentication issues:
    - Docker Desktop credential helper not found
    - Web-based authentication failures
    - Repository access permissions

.EXAMPLE
    .\fix-docker-auth.ps1
    # Runs full diagnostic and fix sequence
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

function Test-DockerDesktop {
    Write-ColorOutput "blue" "🔍 Checking Docker Desktop status..."
    
    try {
        $dockerInfo = docker info 2>$null
        if ($dockerInfo) {
            Write-ColorOutput "green" "✅ Docker Desktop is running"
            
            # Check if daemon is responsive
            $version = docker version --format "{{.Server.Version}}" 2>$null
            if ($version) {
                Write-ColorOutput "green" "✅ Docker daemon version: $version"
                return $true
            }
        }
    } catch {
        Write-ColorOutput "red" "❌ Docker Desktop not responding"
    }
    
    Write-ColorOutput "yellow" "⚠️  Docker Desktop needs restart"
    return $false
}

function Test-CredentialHelper {
    Write-ColorOutput "blue" "🔍 Checking Docker credential helper..."
    
    # Check if docker-credential-desktop is in PATH
    try {
        $credHelper = Get-Command "docker-credential-desktop" -ErrorAction SilentlyContinue
        if ($credHelper) {
            Write-ColorOutput "green" "✅ docker-credential-desktop found: $($credHelper.Source)"
            return $true
        }
    } catch {
        # Command not found
    }
    
    # Check Docker Desktop installation path
    $dockerDesktopPaths = @(
        "${env:ProgramFiles}\Docker\Docker\resources\bin\docker-credential-desktop.exe",
        "${env:ProgramFiles(x86)}\Docker\Docker\resources\bin\docker-credential-desktop.exe"
    )
    
    foreach ($path in $dockerDesktopPaths) {
        if (Test-Path $path) {
            Write-ColorOutput "yellow" "⚠️  Credential helper found but not in PATH: $path"
            return "PathIssue"
        }
    }
    
    Write-ColorOutput "red" "❌ docker-credential-desktop not found"
    return $false
}

function Fix-CredentialHelper {
    Write-ColorOutput "blue" "🔧 Attempting to fix credential helper..."
    
    $dockerDesktopPaths = @(
        "${env:ProgramFiles}\Docker\Docker\resources\bin",
        "${env:ProgramFiles(x86)}\Docker\Docker\resources\bin"
    )
    
    foreach ($basePath in $dockerDesktopPaths) {
        if (Test-Path (Join-Path $basePath "docker-credential-desktop.exe")) {
            Write-ColorOutput "yellow" "📁 Found Docker Desktop resources at: $basePath"
            Write-ColorOutput "yellow" "💡 Add to PATH temporarily for this session:"
            Write-ColorOutput "cyan" "   `$env:PATH += `;$basePath`"
            Write-ColorOutput "yellow" "💡 Or restart Docker Desktop to fix automatically"
            return $basePath
        }
    }
    
    return $null
}

function Test-DockerAuth {
    Write-ColorOutput "blue" "🔍 Checking Docker Hub authentication..."
    
    try {
        # Try to get current auth info
        $dockerInfo = docker info 2>$null | Select-String "Username"
        if ($dockerInfo) {
            Write-ColorOutput "green" "✅ Currently logged in: $dockerInfo"
            return $true
        }
        
        Write-ColorOutput "yellow" "⚠️  Not currently authenticated to Docker Hub"
        return $false
    } catch {
        Write-ColorOutput "red" "❌ Cannot check Docker authentication status"
        return $false
    }
}

function Show-AuthOptions {
    Write-ColorOutput "cyan" "`n🔑 Authentication Options:"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "yellow" "Option 1: Restart Docker Desktop (Recommended)"
    Write-ColorOutput "cyan" "   1. Close Docker Desktop completely"
    Write-ColorOutput "cyan" "   2. Restart Docker Desktop"
    Write-ColorOutput "cyan" "   3. Wait for full startup (whale icon in system tray)"
    Write-ColorOutput "cyan" "   4. Try: docker login"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "yellow" "Option 2: Manual Credential Login"
    Write-ColorOutput "cyan" "   1. docker logout"
    Write-ColorOutput "cyan" "   2. docker login -u endlessblink"
    Write-ColorOutput "cyan" "   3. Enter password when prompted"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "yellow" "Option 3: Fix PATH (Temporary)"
    Write-ColorOutput "cyan" "   1. `$env:PATH += `;${env:ProgramFiles}\Docker\Docker\resources\bin`"
    Write-ColorOutput "cyan" "   2. docker login"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "yellow" "Option 4: Use Access Token"
    Write-ColorOutput "cyan" "   1. Generate token at: https://hub.docker.com/settings/security"
    Write-ColorOutput "cyan" "   2. docker login -u endlessblink -p [ACCESS_TOKEN]"
}

function Test-RepositoryAccess {
    param([string]$Repository = "endlessblink/clean-cut-mcp")
    
    Write-ColorOutput "blue" "🔍 Checking Docker Hub repository access..."
    
    try {
        # Try to pull repository info (this will fail if repository doesn't exist)
        $result = docker manifest inspect "$Repository`:latest" 2>$null
        if ($result) {
            Write-ColorOutput "green" "✅ Repository $Repository exists and is accessible"
            return $true
        }
    } catch {
        # Repository might not exist or not accessible
    }
    
    try {
        # Try a different approach - check if we can access the repository
        $curlResult = curl -s "https://registry.hub.docker.com/v2/repositories/$Repository/" 2>$null
        if ($curlResult -and $curlResult -notmatch "not found") {
            Write-ColorOutput "green" "✅ Repository $Repository exists"
            return $true
        }
    } catch {
        # Curl might not be available
    }
    
    Write-ColorOutput "yellow" "⚠️  Repository $Repository may not exist yet"
    Write-ColorOutput "cyan" "💡 Create repository at: https://hub.docker.com/repository/create"
    Write-ColorOutput "cyan" "   Repository name: clean-cut-mcp"
    Write-ColorOutput "cyan" "   Namespace: endlessblink"
    Write-ColorOutput "cyan" "   Visibility: Public"
    
    return $false
}

function Show-NextSteps {
    Write-ColorOutput "green" "`n📋 Next Steps After Authentication Fix:"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "cyan" "1. Create Docker Hub Repository:"
    Write-ColorOutput "cyan" "   • Go to: https://hub.docker.com/repository/create"
    Write-ColorOutput "cyan" "   • Name: clean-cut-mcp"
    Write-ColorOutput "cyan" "   • Namespace: endlessblink"
    Write-ColorOutput "cyan" "   • Visibility: Public"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "cyan" "2. Push Images:"
    Write-ColorOutput "cyan" "   • docker push endlessblink/clean-cut-mcp:latest"
    Write-ColorOutput "cyan" "   • docker push endlessblink/clean-cut-mcp:v4.5.10"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "cyan" "3. Test Installation:"
    Write-ColorOutput "cyan" "   • .\install-dockerhub.ps1 -TestMode"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "cyan" "4. Enable VM Testing:"
    Write-ColorOutput "cyan" "   • docker pull endlessblink/clean-cut-mcp:latest"
    Write-ColorOutput "cyan" "   • Zero build time, zero source code required!"
}

# Main diagnostic sequence
function Main {
    Write-ColorOutput "cyan" "🔧 Docker Authentication Diagnostic & Fix"
    Write-ColorOutput "cyan" "======================================="
    Write-ColorOutput "cyan" ""
    
    # Step 1: Check Docker Desktop
    $dockerOk = Test-DockerDesktop
    if (!$dockerOk) {
        Write-ColorOutput "red" "❌ Docker Desktop needs to be restarted first"
        Write-ColorOutput "yellow" "   Please restart Docker Desktop and run this script again"
        return
    }
    
    # Step 2: Check credential helper
    Write-ColorOutput "cyan" ""
    $credentialHelperStatus = Test-CredentialHelper
    
    # Step 3: Check authentication
    Write-ColorOutput "cyan" ""
    $authOk = Test-DockerAuth
    
    # Step 4: Check repository access
    Write-ColorOutput "cyan" ""
    $repoOk = Test-RepositoryAccess
    
    # Summary and recommendations
    Write-ColorOutput "cyan" "`n📊 Diagnostic Summary:"
    Write-ColorOutput "cyan" "======================"
    Write-Host "Docker Desktop: $(if($dockerOk){'✅ OK'}else{'❌ FAIL'})"
    Write-Host "Credential Helper: $(if($credentialHelperStatus -eq $true){'✅ OK'}elseif($credentialHelperStatus -eq 'PathIssue'){'⚠️ PATH Issue'}else{'❌ MISSING'})"
    Write-Host "Authentication: $(if($authOk){'✅ OK'}else{'❌ NOT LOGGED IN'})"
    Write-Host "Repository Access: $(if($repoOk){'✅ OK'}else{'❌ REPOSITORY MISSING'})"
    
    # Show recommendations based on issues found
    if ($credentialHelperStatus -ne $true -or !$authOk) {
        Show-AuthOptions
    }
    
    if (!$repoOk) {
        Write-ColorOutput "cyan" "`n🏗️ Repository Creation Required:"
        Write-ColorOutput "cyan" "   The Docker Hub repository doesn't exist yet."
        Write-ColorOutput "cyan" "   Create it at: https://hub.docker.com/repository/create"
    }
    
    Show-NextSteps
}

# Run the diagnostic
try {
    Main
} catch {
    Write-ColorOutput "red" "`n💥 Diagnostic failed: $($_.Exception.Message)"
    Write-ColorOutput "yellow" "   Try restarting Docker Desktop and running again"
}