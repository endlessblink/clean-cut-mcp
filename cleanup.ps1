#Requires -Version 5.1

<#
.SYNOPSIS
    Clean-Cut-MCP Build Environment Cleanup Script
    
.DESCRIPTION
    Cleans the build environment to resolve Docker build issues on Windows.
    Removes node_modules directories and build artifacts that can cause permission problems.
    
.PARAMETER Force
    Force cleanup without confirmation prompts
    
.EXAMPLE
    .\cleanup.ps1
    Interactive cleanup with confirmation prompts
    
.EXAMPLE
    .\cleanup.ps1 -Force
    Automatic cleanup without prompts
#>

param(
    [switch]$Force
)

# Safe logging function
function Write-CleanLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = if($Level -eq "ERROR") { "Red" } elseif($Level -eq "WARN") { "Yellow" } else { "Green" }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Clean-BuildEnvironment {
    Write-CleanLog "Clean-Cut-MCP Build Environment Cleanup" "INFO"
    Write-CleanLog "This will remove files that can cause Docker build issues on Windows" "INFO"
    
    # Items to clean
    $itemsToClean = @(
        @{ Path = "node_modules"; Description = "Root node_modules directory" },
        @{ Path = "mcp-server/node_modules"; Description = "MCP server node_modules" },
        @{ Path = "mcp-server/dist"; Description = "MCP server compiled output" },
        @{ Path = "clean-cut-mcp.log"; Description = "MCP server log file" },
        @{ Path = "clean-cut-install.log"; Description = "Installer log file" }
    )
    
    # Check what exists
    $itemsFound = @()
    $totalSize = 0
    
    foreach ($item in $itemsToClean) {
        if (Test-Path $item.Path) {
            try {
                if ($item.Path -like "*.log") {
                    $size = (Get-Item $item.Path).Length
                }
                else {
                    $size = (Get-ChildItem $item.Path -Recurse -File | Measure-Object -Property Length -Sum).Sum
                }
                $totalSize += $size
                $itemsFound += @{ 
                    Path = $item.Path
                    Description = $item.Description
                    Size = $size
                }
            }
            catch {
                $itemsFound += @{ 
                    Path = $item.Path
                    Description = $item.Description
                    Size = 0
                }
            }
        }
    }
    
    if ($itemsFound.Count -eq 0) {
        Write-CleanLog "Build environment is already clean!" "INFO"
        return $true
    }
    
    # Show what will be cleaned
    Write-CleanLog "Found $($itemsFound.Count) item(s) to clean:" "INFO"
    foreach ($item in $itemsFound) {
        $sizeStr = if ($item.Size -gt 1MB) { 
            "{0:N1} MB" -f ($item.Size / 1MB) 
        } elseif ($item.Size -gt 1KB) {
            "{0:N1} KB" -f ($item.Size / 1KB)
        } else {
            "$($item.Size) bytes"
        }
        Write-CleanLog "  - $($item.Description): $sizeStr" "INFO"
    }
    
    $totalSizeStr = if ($totalSize -gt 1MB) {
        "{0:N1} MB" -f ($totalSize / 1MB)
    } else {
        "{0:N1} KB" -f ($totalSize / 1KB)
    }
    Write-CleanLog "Total size to clean: $totalSizeStr" "INFO"
    
    # Confirm cleanup
    if (-not $Force) {
        Write-CleanLog "" "INFO"
        $response = Read-Host "Continue with cleanup? (y/N)"
        if ($response -ne 'y' -and $response -ne 'Y') {
            Write-CleanLog "Cleanup cancelled by user" "WARN"
            return $false
        }
    }
    
    # Perform cleanup
    Write-CleanLog "Starting cleanup..." "INFO"
    $cleanedCount = 0
    $failedCount = 0
    
    foreach ($item in $itemsFound) {
        try {
            Write-CleanLog "Cleaning $($item.Path)..." "INFO"
            
            if ($item.Path -like "*.log") {
                Remove-Item $item.Path -Force
            }
            else {
                Remove-Item $item.Path -Recurse -Force
            }
            
            Write-CleanLog "Successfully cleaned $($item.Path)" "INFO"
            $cleanedCount++
        }
        catch {
            Write-CleanLog "Failed to clean $($item.Path): $($_.Exception.Message)" "ERROR"
            $failedCount++
        }
    }
    
    # Summary
    Write-CleanLog "" "INFO"
    Write-CleanLog "Cleanup Summary:" "INFO"
    Write-CleanLog "  - Successfully cleaned: $cleanedCount item(s)" "INFO"
    if ($failedCount -gt 0) {
        Write-CleanLog "  - Failed to clean: $failedCount item(s)" "WARN"
    }
    Write-CleanLog "  - Space freed: $totalSizeStr" "INFO"
    
    if ($cleanedCount -gt 0) {
        Write-CleanLog "" "INFO"
        Write-CleanLog "Build environment cleaned! You can now run:" "INFO"
        Write-CleanLog "  docker build -t clean-cut-mcp ." "INFO"
        Write-CleanLog "  or" "INFO"
        Write-CleanLog "  .\\install.ps1" "INFO"
    }
    
    return $cleanedCount -gt 0
}

# Main execution
try {
    Clean-BuildEnvironment
}
catch {
    Write-CleanLog "Cleanup failed: $($_.Exception.Message)" "ERROR"
    exit 1
}