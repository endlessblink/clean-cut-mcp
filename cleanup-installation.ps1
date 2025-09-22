#Requires -Version 5.1

<#
.SYNOPSIS
    Complete Clean-Cut-MCP Installation Cleanup Script

.DESCRIPTION
    Removes all traces of Clean-Cut-MCP installations including:
    - Docker containers and images
    - Claude Desktop configuration entries
    - Docker volumes and networks
    - WSL2 mount cache (Windows)

.EXAMPLE
    .\cleanup-installation.ps1
#>

# Cross-platform OS detection
if (-not (Get-Variable -Name 'IsWindows' -ErrorAction SilentlyContinue)) {
    $script:IsWindows = $true
    $script:IsLinux = $false
    $script:IsMacOS = $false
} else {
    $script:IsWindows = $IsWindows
    $script:IsLinux = $IsLinux
    $script:IsMacOS = $IsMacOS
}

function Write-CleanupMessage {
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

function Remove-DockerResources {
    Write-CleanupMessage "🐳 Cleaning Docker resources..." -Type Step

    $dockerCmd = if ($script:IsWindows) { "wsl docker" } else { "docker" }

    try {
        # Stop and remove containers
        Write-CleanupMessage "Stopping containers..." -Type Info
        & $dockerCmd stop clean-cut-mcp clean-cut-mcp-test clean-cut-v2 2>$null | Out-Null
        & $dockerCmd rm clean-cut-mcp clean-cut-mcp-test clean-cut-v2 2>$null | Out-Null

        # Remove images
        Write-CleanupMessage "Removing images..." -Type Info
        & $dockerCmd rmi endlessblink/clean-cut-mcp:latest 2>$null | Out-Null
        & $dockerCmd rmi clean-cut-mcp:latest 2>$null | Out-Null
        & $dockerCmd rmi clean-cut-mcp-clean-cut-mcp:latest 2>$null | Out-Null

        # Remove networks and volumes
        Write-CleanupMessage "Removing networks and volumes..." -Type Info
        & $dockerCmd network rm clean-cut-mcp-network 2>$null | Out-Null
        & $dockerCmd volume rm clean-cut-mcp_clean-cut-node-modules 2>$null | Out-Null
        & $dockerCmd volume rm clean-cut-node-modules 2>$null | Out-Null

        # System cleanup
        Write-CleanupMessage "Running Docker system cleanup..." -Type Info
        & $dockerCmd system prune -f 2>$null | Out-Null

        Write-CleanupMessage "✓ Docker resources cleaned" -Type Success

    } catch {
        Write-CleanupMessage "Warning: Some Docker cleanup failed: $($_.Exception.Message)" -Type Warning
    }
}

function Remove-ClaudeConfiguration {
    Write-CleanupMessage "📝 Cleaning Claude Desktop configuration..." -Type Step

    try {
        # Platform-specific config paths
        if ($script:IsWindows) {
            $configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
        } elseif ($script:IsLinux) {
            $configPath = "$env:HOME/.config/Claude/claude_desktop_config.json"
        } elseif ($script:IsMacOS) {
            $configPath = "$env:HOME/Library/Application Support/Claude/claude_desktop_config.json"
        }

        if (Test-Path $configPath) {
            # Backup current config
            $backupPath = "$configPath.pre-cleanup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
            Copy-Item $configPath $backupPath -Force
            Write-CleanupMessage "✓ Config backed up to: $backupPath" -Type Info

            # Read and clean config
            $config = Get-Content $configPath | ConvertFrom-Json

            if ($config.mcpServers -and $config.mcpServers."clean-cut-mcp") {
                # Remove clean-cut-mcp entry
                $config.mcpServers.PSObject.Properties.Remove("clean-cut-mcp")

                # Save cleaned config
                $config | ConvertTo-Json -Depth 10 | Out-File $configPath -Encoding UTF8 -Force
                Write-CleanupMessage "✓ Removed clean-cut-mcp from Claude Desktop config" -Type Success
            } else {
                Write-CleanupMessage "No clean-cut-mcp entries found in config" -Type Info
            }
        } else {
            Write-CleanupMessage "No Claude Desktop config found" -Type Info
        }

        # Remove backup files
        Get-ChildItem -Path (Split-Path $configPath -Parent) -Filter "*.backup*" -ErrorAction SilentlyContinue |
        Remove-Item -Force
        Write-CleanupMessage "✓ Removed config backup files" -Type Info

    } catch {
        Write-CleanupMessage "Error cleaning Claude config: $($_.Exception.Message)" -Type Error
    }
}

function Remove-WSLMountCache {
    if ($script:IsWindows) {
        Write-CleanupMessage "🗂️ Cleaning WSL2 mount cache..." -Type Step

        try {
            # Clean WSL2 bind mount cache
            $mountPath = "/mnt/wsl/docker-desktop-bind-mounts/Ubuntu/"

            if ($script:IsWindows) {
                $cleanupResult = wsl bash -c "sudo find '$mountPath' -name '*clean-cut*' -type d -exec rm -rf {} + 2>/dev/null || true"
                Write-CleanupMessage "✓ WSL2 mount cache cleaned" -Type Success
            }

        } catch {
            Write-CleanupMessage "WSL2 cleanup failed (non-critical): $($_.Exception.Message)" -Type Warning
        }
    }
}

function Show-CleanupInstructions {
    Write-Host ""
    Write-Host "🧹 CLEANUP COMPLETE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "What was cleaned:" -ForegroundColor Cyan
    Write-Host "• All clean-cut-mcp Docker containers and images" -ForegroundColor White
    Write-Host "• Docker networks and volumes" -ForegroundColor White
    Write-Host "• Claude Desktop configuration entries" -ForegroundColor White
    Write-Host "• WSL2 mount cache (Windows)" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart Claude Desktop" -ForegroundColor White
    Write-Host "2. Download fresh installer:" -ForegroundColor White
    Write-Host "   curl -O https://raw.githubusercontent.com/endlessblink/clean-cut-mcp/master/install.ps1" -ForegroundColor Gray
    Write-Host "3. Run: pwsh install.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "The fresh install will use the latest Docker Hub image!" -ForegroundColor Green
    Write-Host ""
}

# Main cleanup process
try {
    Clear-Host
    Write-Host ""
    Write-Host "🧹 CLEAN-CUT-MCP INSTALLATION CLEANUP" -ForegroundColor Red
    Write-Host "   Removing all traces of previous installations" -ForegroundColor Red
    Write-Host ""

    Remove-DockerResources
    Remove-ClaudeConfiguration
    Remove-WSLMountCache

    Show-CleanupInstructions

} catch {
    Write-CleanupMessage "💥 Cleanup error: $($_.Exception.Message)" -Type Error
} finally {
    Write-Host "Press Enter to close..." -ForegroundColor Gray
    Read-Host
}