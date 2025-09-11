#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Push Clean-Cut-MCP to Docker Hub
    Handles authentication, repository creation, and image pushing

.DESCRIPTION
    Complete workflow to publish clean-cut-mcp images to Docker Hub:
    - Diagnoses authentication issues
    - Guides through repository creation
    - Pushes multiple image tags
    - Validates successful upload

.PARAMETER Force
    Force push even if validation checks fail

.PARAMETER DryRun
    Show what would be pushed without actually pushing

.EXAMPLE
    .\push-to-dockerhub.ps1
    # Full push workflow with validation

.EXAMPLE
    .\push-to-dockerhub.ps1 -DryRun
    # Preview what would be pushed
#>

param(
    [switch]$Force,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# ANSI colors
$colors = @{
    green = "`e[32m"
    red = "`e[31m" 
    yellow = "`e[33m"
    blue = "`e[34m"
    cyan = "`e[36m"
    magenta = "`e[35m"
    reset = "`e[0m"
}

function Write-ColorOutput {
    param([string]$Color, [string]$Message)
    Write-Host "$($colors[$Color])$Message$($colors.reset)"
}

function Test-DockerImages {
    Write-ColorOutput "blue" "🔍 Checking local Docker images..."
    
    $images = @(
        "endlessblink/clean-cut-mcp:latest",
        "endlessblink/clean-cut-mcp:v4.5.10"
    )
    
    $foundImages = @()
    
    foreach ($image in $images) {
        try {
            $imageInfo = docker image inspect $image 2>$null | ConvertFrom-Json
            if ($imageInfo) {
                $size = [math]::Round($imageInfo[0].Size / 1GB, 2)
                Write-ColorOutput "green" "✅ Found: $image ($size GB)"
                $foundImages += $image
            }
        } catch {
            Write-ColorOutput "red" "❌ Missing: $image"
        }
    }
    
    if ($foundImages.Count -eq 0) {
        Write-ColorOutput "red" "❌ No Docker Hub tagged images found"
        Write-ColorOutput "yellow" "💡 Run these commands first:"
        Write-ColorOutput "cyan" "   docker tag clean-cut-mcp:latest endlessblink/clean-cut-mcp:latest"
        Write-ColorOutput "cyan" "   docker tag clean-cut-mcp:latest endlessblink/clean-cut-mcp:v4.5.10"
        return $false
    }
    
    Write-ColorOutput "green" "✅ Found $($foundImages.Count) images ready for push"
    return $foundImages
}

function Test-DockerAuthentication {
    Write-ColorOutput "blue" "🔍 Checking Docker Hub authentication..."
    
    try {
        # Check if logged in
        $dockerInfo = docker info 2>$null | Select-String "Username:"
        if ($dockerInfo) {
            $username = ($dockerInfo -split ":")[1].Trim()
            Write-ColorOutput "green" "✅ Authenticated as: $username"
            
            if ($username -eq "endlessblink") {
                return $true
            } else {
                Write-ColorOutput "yellow" "⚠️  Logged in as '$username' but need 'endlessblink'"
                return "WrongUser"
            }
        }
    } catch {
        # Not logged in or other error
    }
    
    Write-ColorOutput "red" "❌ Not authenticated to Docker Hub"
    return $false
}

function Show-AuthenticationHelp {
    Write-ColorOutput "cyan" "`n🔑 Docker Hub Authentication Required"
    Write-ColorOutput "cyan" "====================================="
    Write-ColorOutput "yellow" ""
    Write-ColorOutput "yellow" "Method 1: Restart Docker Desktop (Recommended)"
    Write-ColorOutput "cyan" "   1. Close Docker Desktop completely"
    Write-ColorOutput "cyan" "   2. Restart Docker Desktop"  
    Write-ColorOutput "cyan" "   3. Run: docker login"
    Write-ColorOutput "cyan" "   4. Re-run this script"
    Write-ColorOutput "yellow" ""
    Write-ColorOutput "yellow" "Method 2: Manual Login"
    Write-ColorOutput "cyan" "   1. Run: docker login -u endlessblink"
    Write-ColorOutput "cyan" "   2. Enter your Docker Hub password"
    Write-ColorOutput "cyan" "   3. Re-run this script"
    Write-ColorOutput "yellow" ""
    Write-ColorOutput "yellow" "Method 3: Use Access Token"
    Write-ColorOutput "cyan" "   1. Create token: https://hub.docker.com/settings/security"
    Write-ColorOutput "cyan" "   2. Run: docker login -u endlessblink -p [TOKEN]"
    Write-ColorOutput "yellow" ""
    Write-ColorOutput "yellow" "Method 4: Fix Credential Helper"
    Write-ColorOutput "cyan" "   1. Run: .\fix-docker-auth.ps1"
    Write-ColorOutput "cyan" "   2. Follow the diagnostic recommendations"
}

function Test-RepositoryExists {
    param([string]$Repository = "endlessblink/clean-cut-mcp")
    
    Write-ColorOutput "blue" "🔍 Checking if Docker Hub repository exists..."
    
    try {
        # Try to get repository metadata from Docker Hub API
        $repoUrl = "https://registry.hub.docker.com/v2/repositories/$Repository/"
        
        if (Get-Command curl -ErrorAction SilentlyContinue) {
            $response = curl -s $repoUrl 2>$null
            if ($response -and $response -notmatch '"message":"Object not found"') {
                Write-ColorOutput "green" "✅ Repository exists: https://hub.docker.com/r/$Repository"
                return $true
            }
        }
        
        # Alternative: try docker manifest (requires authentication)
        $manifest = docker manifest inspect "$Repository`:latest" 2>$null
        if ($manifest) {
            Write-ColorOutput "green" "✅ Repository exists and has latest tag"
            return $true
        }
        
    } catch {
        # API call failed, repository probably doesn't exist
    }
    
    Write-ColorOutput "red" "❌ Repository doesn't exist on Docker Hub"
    return $false
}

function Show-RepositoryCreationHelp {
    Write-ColorOutput "cyan" "`n🏗️ Docker Hub Repository Creation Required"
    Write-ColorOutput "cyan" "=========================================="
    Write-ColorOutput "yellow" ""
    Write-ColorOutput "yellow" "Step 1: Go to Docker Hub"
    Write-ColorOutput "cyan" "   URL: https://hub.docker.com/repository/create"
    Write-ColorOutput "yellow" ""
    Write-ColorOutput "yellow" "Step 2: Repository Settings"
    Write-ColorOutput "cyan" "   Repository name: clean-cut-mcp"
    Write-ColorOutput "cyan" "   Namespace: endlessblink"
    Write-ColorOutput "cyan" "   Visibility: Public (IMPORTANT for testing)"
    Write-ColorOutput "cyan" "   Description: One-Script Magic: Remotion video generation for Claude Desktop"
    Write-ColorOutput "yellow" ""
    Write-ColorOutput "yellow" "Step 3: Click 'Create Repository'"
    Write-ColorOutput "yellow" ""
    Write-ColorOutput "yellow" "Step 4: Re-run this script"
    Write-ColorOutput "cyan" "   .\push-to-dockerhub.ps1"
}

function Push-DockerImages {
    param([array]$Images)
    
    Write-ColorOutput "blue" "🚀 Pushing images to Docker Hub..."
    
    $successCount = 0
    $totalSize = 0
    
    foreach ($image in $Images) {
        Write-ColorOutput "cyan" "`n📤 Pushing $image..."
        
        if ($DryRun) {
            Write-ColorOutput "yellow" "[DRY RUN] Would push: $image"
            $successCount++
            continue
        }
        
        try {
            # Get image size for progress tracking
            $imageInfo = docker image inspect $image 2>$null | ConvertFrom-Json
            $sizeGB = [math]::Round($imageInfo[0].Size / 1GB, 2)
            $totalSize += $sizeGB
            
            Write-ColorOutput "blue" "   Size: $sizeGB GB - This may take several minutes..."
            
            # Push with progress
            $pushResult = docker push $image 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "green" "✅ Successfully pushed: $image"
                $successCount++
                
                # Extract digest from push output if available
                $digestLine = $pushResult | Select-String "digest: sha256:"
                if ($digestLine) {
                    $digest = ($digestLine -split " ")[-2]
                    Write-ColorOutput "cyan" "   Digest: $digest"
                }
            } else {
                Write-ColorOutput "red" "❌ Failed to push: $image"
                Write-ColorOutput "yellow" "   Error output:"
                $pushResult | ForEach-Object { Write-ColorOutput "yellow" "   $_" }
            }
        } catch {
            Write-ColorOutput "red" "❌ Push failed: $($_.Exception.Message)"
        }
    }
    
    Write-ColorOutput "cyan" "`n📊 Push Summary:"
    Write-ColorOutput "cyan" "================"
    Write-ColorOutput "cyan" "Successfully pushed: $successCount / $($Images.Count) images"
    if ($totalSize -gt 0) {
        Write-ColorOutput "cyan" "Total size pushed: $totalSize GB"
    }
    
    return $successCount -eq $Images.Count
}

function Test-PushSuccess {
    Write-ColorOutput "blue" "🧪 Validating push success..."
    
    $testImages = @("endlessblink/clean-cut-mcp:latest")
    
    foreach ($image in $testImages) {
        Write-ColorOutput "blue" "   Testing public pull: $image"
        
        try {
            # Try to pull the manifest (lightweight test)
            $manifest = docker manifest inspect $image 2>$null
            if ($manifest) {
                Write-ColorOutput "green" "✅ Image publicly accessible: $image"
            } else {
                Write-ColorOutput "red" "❌ Image not accessible: $image"
                return $false
            }
        } catch {
            Write-ColorOutput "red" "❌ Cannot validate image: $image"
            return $false
        }
    }
    
    Write-ColorOutput "green" "✅ All images successfully published and accessible"
    return $true
}

function Show-SuccessMessage {
    Write-ColorOutput "green" "`n🎉 Docker Hub Push Completed Successfully!"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "cyan" "📋 What's Now Available:"
    Write-ColorOutput "cyan" "   • Docker Hub: https://hub.docker.com/r/endlessblink/clean-cut-mcp"
    Write-ColorOutput "cyan" "   • Public pull: docker pull endlessblink/clean-cut-mcp:latest"
    Write-ColorOutput "cyan" "   • Zero-dependency installs: .\install-dockerhub.ps1"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "cyan" "🧪 Test Your Docker Hub Distribution:"
    Write-ColorOutput "cyan" "   1. VM Testing: .\install-dockerhub.ps1 -TestMode"
    Write-ColorOutput "cyan" "   2. Clean Pull: docker run -d --name test-clean-cut -p 6960:6960 -p 6961:6961 endlessblink/clean-cut-mcp:latest"
    Write-ColorOutput "cyan" "   3. Verify: curl http://localhost:6961/health"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "cyan" "💡 Benefits Unlocked:"
    Write-ColorOutput "cyan" "   • Install time: 5+ minutes → 30 seconds"
    Write-ColorOutput "cyan" "   • Prerequisites: Git + Docker → Docker only"
    Write-ColorOutput "cyan" "   • Build time: 3+ minutes → Zero (pre-built)"
    Write-ColorOutput "cyan" "   • VM friendly: Complex setup → One command"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "green" "🚀 Ready for production Docker Hub distribution!"
}

function Show-FailureMessage {
    Write-ColorOutput "red" "`n❌ Docker Hub Push Failed"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "yellow" "🔧 Troubleshooting Steps:"
    Write-ColorOutput "cyan" "   1. Check authentication: docker info | findstr Username"
    Write-ColorOutput "cyan" "   2. Verify repository exists: https://hub.docker.com/r/endlessblink/clean-cut-mcp"
    Write-ColorOutput "cyan" "   3. Test connectivity: docker pull hello-world"
    Write-ColorOutput "cyan" "   4. Check Docker Desktop is running"
    Write-ColorOutput "cyan" "   5. Try manual push: docker push endlessblink/clean-cut-mcp:latest"
    Write-ColorOutput "cyan" ""
    Write-ColorOutput "yellow" "📖 Full diagnostic: .\fix-docker-auth.ps1"
    Write-ColorOutput "yellow" "📖 Setup guide: See DOCKER-HUB-SETUP.md"
}

# Main execution flow
function Main {
    Write-ColorOutput "cyan" "🐳 Docker Hub Push - Clean-Cut-MCP"
    Write-ColorOutput "cyan" "================================="
    
    if ($DryRun) {
        Write-ColorOutput "yellow" "🧪 DRY RUN MODE - No images will be pushed"
    }
    
    # Step 1: Check local images
    Write-ColorOutput "cyan" "`nStep 1: Checking Local Images"
    $imagesToPush = Test-DockerImages
    if (!$imagesToPush) {
        Write-ColorOutput "red" "❌ Cannot proceed without tagged images"
        exit 1
    }
    
    # Step 2: Check authentication
    Write-ColorOutput "cyan" "`nStep 2: Checking Authentication"
    $authStatus = Test-DockerAuthentication
    if ($authStatus -ne $true) {
        if (!$Force) {
            Show-AuthenticationHelp
            Write-ColorOutput "yellow" "`n💡 Run with -Force to skip authentication check"
            exit 1
        } else {
            Write-ColorOutput "yellow" "⚠️  Proceeding despite authentication issues (Force mode)"
        }
    }
    
    # Step 3: Check repository exists
    Write-ColorOutput "cyan" "`nStep 3: Checking Repository"
    $repoExists = Test-RepositoryExists
    if (!$repoExists) {
        if (!$Force) {
            Show-RepositoryCreationHelp
            Write-ColorOutput "yellow" "`n💡 Run with -Force to skip repository check"
            exit 1
        } else {
            Write-ColorOutput "yellow" "⚠️  Proceeding despite repository issues (Force mode)"
        }
    }
    
    # Step 4: Push images
    Write-ColorOutput "cyan" "`nStep 4: Pushing Images"
    $pushSuccess = Push-DockerImages -Images $imagesToPush
    
    if (!$DryRun -and $pushSuccess) {
        # Step 5: Validate push
        Write-ColorOutput "cyan" "`nStep 5: Validating Push"
        $validationSuccess = Test-PushSuccess
        
        if ($validationSuccess) {
            Show-SuccessMessage
        } else {
            Write-ColorOutput "yellow" "⚠️  Push completed but validation failed"
            Write-ColorOutput "yellow" "   Images may still be uploading or there may be access issues"
        }
    } elseif ($DryRun) {
        Write-ColorOutput "green" "`n✅ DRY RUN COMPLETED - Ready for actual push"
        Write-ColorOutput "cyan" "   Run without -DryRun to push: .\push-to-dockerhub.ps1"
    } else {
        Show-FailureMessage
        exit 1
    }
}

# Handle interruption
$Host.UI.RawUI.CancelKeyPress += {
    Write-ColorOutput "yellow" "`n⚠️  Push interrupted"
    exit 1
}

# Run the push workflow
try {
    Main
} catch {
    Write-ColorOutput "red" "`n💥 Push failed: $($_.Exception.Message)"
    Show-FailureMessage
    exit 1
}