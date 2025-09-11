#Requires -Version 5.1

<#
.SYNOPSIS
    Bulletproof Claude Desktop Configuration Manager
    
.DESCRIPTION
    Safely adds Clean-Cut-MCP to Claude Desktop without corrupting existing configuration.
    Implements military-grade safety checks and atomic JSON operations.
    
.PARAMETER TestMode
    Run in test mode without making actual changes
    
.PARAMETER Force
    Force update even if Clean-Cut-MCP already exists
    
.EXAMPLE
    .\safe-claude-config.ps1 -TestMode
    Test the configuration changes without applying them
    
.EXAMPLE
    .\safe-claude-config.ps1
    Safely add Clean-Cut-MCP to Claude Desktop
#>

param(
    [switch]$TestMode,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# PATHS AND CONFIGURATION
$ClaudeConfigDir = "$env:APPDATA\Claude"
$ClaudeConfigFile = "$ClaudeConfigDir\claude_desktop_config.json"
$BackupSuffix = "safe-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$ContainerName = "clean-cut-mcp"

# LOGGING
function Write-SafeLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" } 
        "SUCCESS" { "Green" }
        default { "Cyan" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# JSON VALIDATION FUNCTION
function Test-ValidJson {
    param([string]$JsonString)
    
    try {
        $null = $JsonString | ConvertFrom-Json -ErrorAction Stop
        return $true
    }
    catch {
        Write-SafeLog "JSON Validation Failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# EMERGENCY RECOVERY FUNCTION
function Repair-ClaudeConfig {
    param([string]$ConfigPath = $ClaudeConfigFile)
    
    Write-SafeLog "Emergency config recovery initiated..." "WARN"
    
    # Try restoring from latest backup
    $backups = Get-ChildItem "$ConfigPath.*backup*" -ErrorAction SilentlyContinue | 
               Sort-Object LastWriteTime -Descending
    
    foreach ($backup in $backups) {
        Write-SafeLog "Testing backup: $($backup.Name)" "INFO"
        $backupContent = Get-Content $backup.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($backupContent -and (Test-ValidJson $backupContent)) {
            Copy-Item $backup.FullName $ConfigPath -Force
            Write-SafeLog "Successfully restored from: $($backup.Name)" "SUCCESS"
            return $true
        }
    }
    
    # Create minimal config if no good backups
    Write-SafeLog "No valid backups found, creating minimal config..." "WARN"
    $minimalConfig = '{"mcpServers":{}}'
    $minimalConfig | Out-File $ConfigPath -Encoding UTF8
    Write-SafeLog "Minimal configuration created" "SUCCESS"
    return $true
}

# WSL2 CONNECTIVITY TESTING FUNCTION  
function Test-WSL2Connectivity {
    param([string]$BaseUrl = "http://localhost:6961")
    
    Write-SafeLog "Testing WSL2 connectivity..." "INFO"
    
    # Try localhost first
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
        if ($response.status -eq "healthy") {
            Write-SafeLog "SUCCESS: localhost connectivity working" "SUCCESS"
            return $BaseUrl
        }
    }
    catch {
        Write-SafeLog "Localhost failed: $($_.Exception.Message)" "WARN"
    }
    
    # Try WSL2 IP as fallback
    try {
        $wsl2IP = (wsl hostname -I 2>$null)
        if ($wsl2IP) {
            $wsl2IP = ($wsl2IP -split '\s+')[0].Trim()
            $wsl2Url = $BaseUrl -replace 'localhost', $wsl2IP
            Write-SafeLog "Trying WSL2 IP: $wsl2Url" "INFO"
            
            $response = Invoke-RestMethod -Uri "$wsl2Url/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
            if ($response.status -eq "healthy") {
                Write-SafeLog "SUCCESS: WSL2 IP connectivity working" "SUCCESS"
                return $wsl2Url
            }
        }
    } catch {
        Write-SafeLog "Failed to get WSL2 IP: $($_.Exception.Message)" "WARN"
    }
    
    Write-SafeLog "Both localhost and WSL2 IP failed - check networking" "ERROR"
    return $null
}

# SAFE JSON MERGE FUNCTION
function Merge-ClaudeConfig {
    param(
        [hashtable]$ExistingConfig,
        [hashtable]$NewMcpServer
    )
    
    # Create deep copy to avoid reference issues
    $mergedConfig = @{}
    
    # Copy all existing properties
    foreach ($key in $ExistingConfig.Keys) {
        if ($key -eq "mcpServers") {
            # Handle MCP servers specially
            $mergedConfig["mcpServers"] = @{}
            
            # Copy existing MCP servers
            if ($ExistingConfig["mcpServers"] -is [hashtable]) {
                foreach ($serverKey in $ExistingConfig["mcpServers"].Keys) {
                    $mergedConfig["mcpServers"][$serverKey] = $ExistingConfig["mcpServers"][$serverKey]
                }
            }
        } else {
            $mergedConfig[$key] = $ExistingConfig[$key]
        }
    }
    
    # Ensure mcpServers exists
    if (-not $mergedConfig.ContainsKey("mcpServers")) {
        $mergedConfig["mcpServers"] = @{}
    }
    
    # Add or update Clean-Cut-MCP server
    $mergedConfig["mcpServers"]["clean-cut-mcp"] = $NewMcpServer
    
    return $mergedConfig
}

# MAIN CONFIGURATION FUNCTION
function Update-ClaudeDesktopConfig {
    Write-SafeLog "Starting bulletproof Claude Desktop configuration..." "INFO"
    
    # 1. VERIFY PREREQUISITES
    Write-SafeLog "Checking prerequisites..." "INFO"
    
    if (-not (Test-Path $ClaudeConfigDir)) {
        Write-SafeLog "Creating Claude config directory..." "INFO"
        New-Item -ItemType Directory -Path $ClaudeConfigDir -Force | Out-Null
    }
    
    # 2. VERIFY DOCKER CONTAINER
    Write-SafeLog "Verifying Clean-Cut-MCP container..." "INFO"
    
    $containerRunning = docker ps --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
    $containerExists = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
    
    if (-not $containerExists) {
        throw "Clean-Cut-MCP container not found. Please run Docker build first."
    }
    
    if (-not $containerRunning) {
        Write-SafeLog "Starting Clean-Cut-MCP container..." "INFO"
        docker start $ContainerName | Out-Null
        Start-Sleep -Seconds 3
    }
    
    # 3. TEST MCP SERVER HEALTH WITH WSL2 CONNECTIVITY
    Write-SafeLog "Testing MCP server health with WSL2 networking..." "INFO"
    $workingUrl = Test-WSL2Connectivity -BaseUrl "http://localhost:6961"
    
    if (-not $workingUrl) {
        if (-not $Force) {
            throw "MCP server not accessible. Run fix-wsl2-networking.ps1 first or use -Force to skip"
        } else {
            Write-SafeLog "Forcing configuration despite connectivity issues..." "WARN"
            $workingUrl = "http://localhost:6961"  # Use default for forced config
        }
    }
    
    # 4. READ EXISTING CONFIGURATION
    $existingConfig = @{}
    
    if (Test-Path $ClaudeConfigFile) {
        Write-SafeLog "Reading existing Claude Desktop configuration..." "INFO"
        
        # Create backup first
        $backupFile = "$ClaudeConfigFile.$BackupSuffix"
        Copy-Item $ClaudeConfigFile $backupFile -Force
        Write-SafeLog "Backup created: $backupFile" "INFO"
        
        # Read and validate existing config
        $existingJsonString = Get-Content $ClaudeConfigFile -Raw -Encoding UTF8
        
        if (-not (Test-ValidJson $existingJsonString)) {
            throw "Existing Claude Desktop configuration is corrupted. Please restore from backup."
        }
        
        $existingConfigObject = $existingJsonString | ConvertFrom-Json
        
        # Convert PSCustomObject to hashtable for easier manipulation
        if ($existingConfigObject) {
            $existingConfig = @{}
            $existingConfigObject.PSObject.Properties | ForEach-Object {
                if ($_.Name -eq "mcpServers" -and $_.Value) {
                    $existingConfig["mcpServers"] = @{}
                    $_.Value.PSObject.Properties | ForEach-Object {
                        $existingConfig["mcpServers"][$_.Name] = $_.Value
                    }
                } else {
                    $existingConfig[$_.Name] = $_.Value
                }
            }
        }
    } else {
        Write-SafeLog "No existing configuration found. Creating new one." "INFO"
    }
    
    # 5. CHECK IF CLEAN-CUT-MCP ALREADY EXISTS
    if ($existingConfig.ContainsKey("mcpServers") -and 
        $existingConfig["mcpServers"].ContainsKey("clean-cut-mcp") -and 
        -not $Force) {
        Write-SafeLog "Clean-Cut-MCP already configured in Claude Desktop" "WARN"
        Write-SafeLog "Use -Force to update existing configuration" "INFO"
        return
    }
    
    # 6. CREATE CLEAN-CUT-MCP CONFIGURATION WITH WORKING URL
    $cleanCutMcpConfig = @{
        url = "$workingUrl/mcp"
        description = "Clean-Cut-MCP - One-Script Magic video animation server"
    }
    
    Write-SafeLog "Using MCP endpoint: $workingUrl/mcp" "INFO"
    
    # 7. MERGE CONFIGURATIONS
    Write-SafeLog "Merging configurations..." "INFO"
    $mergedConfig = Merge-ClaudeConfig -ExistingConfig $existingConfig -NewMcpServer $cleanCutMcpConfig
    
    # 8. CONVERT TO JSON AND VALIDATE
    Write-SafeLog "Converting to JSON and validating..." "INFO"
    
    try {
        # Use recommended depth to avoid PowerShell JSON corruption
        $jsonOutput = $mergedConfig | ConvertTo-Json -Depth 15 -Compress:$false
        
        # Validate the generated JSON
        if (-not (Test-ValidJson $jsonOutput)) {
            throw "Generated JSON is invalid"
        }
        
        # Pretty format the JSON (avoid double conversion, use existing JSON)
        $formattedJson = $jsonOutput
        
    }
    catch {
        throw "Failed to generate valid JSON configuration: $($_.Exception.Message)"
    }
    
    # 9. WRITE CONFIGURATION (ATOMIC OPERATION)
    if ($TestMode) {
        Write-SafeLog "TEST MODE: Configuration would be written to:" "INFO"
        Write-SafeLog $ClaudeConfigFile "INFO"
        Write-SafeLog "Configuration preview:" "INFO"
        Write-Host $formattedJson -ForegroundColor DarkGray
        return
    }
    
    Write-SafeLog "Writing new configuration to Claude Desktop..." "INFO"
    
    try {
        # Use atomic write operation
        $tempFile = "$ClaudeConfigFile.tmp"
        $formattedJson | Out-File -FilePath $tempFile -Encoding UTF8 -NoNewline
        
        # Validate the temp file
        $tempContent = Get-Content $tempFile -Raw -Encoding UTF8
        if (-not (Test-ValidJson $tempContent)) {
            throw "Temp file validation failed"
        }
        
        # Atomic move
        Move-Item $tempFile $ClaudeConfigFile -Force
        
        Write-SafeLog "Configuration written successfully!" "SUCCESS"
        
    }
    catch {
        # Clean up temp file if it exists
        if (Test-Path "$ClaudeConfigFile.tmp") {
            Remove-Item "$ClaudeConfigFile.tmp" -Force -ErrorAction SilentlyContinue
        }
        throw "Failed to write configuration: $($_.Exception.Message)"
    }
    
    # 10. FINAL VALIDATION
    Write-SafeLog "Performing final validation..." "INFO"
    
    $finalContent = Get-Content $ClaudeConfigFile -Raw -Encoding UTF8
    if (-not (Test-ValidJson $finalContent)) {
        # Restore from backup
        Copy-Item $backupFile $ClaudeConfigFile -Force
        throw "Final validation failed. Configuration restored from backup."
    }
    
    # 11. SUCCESS
    Write-SafeLog "Claude Desktop configuration completed successfully!" "SUCCESS"
    Write-SafeLog "Clean-Cut-MCP is now available in Claude Desktop" "SUCCESS"
    Write-SafeLog "Restart Claude Desktop to see the changes" "INFO"
    
    # Show what was configured
    Write-SafeLog "Configuration details:" "INFO"
    Write-SafeLog "  Server Name: clean-cut-mcp" "INFO"
    Write-SafeLog "  Transport: HTTP" "INFO"
    Write-SafeLog "  MCP Endpoint: http://localhost:6961/mcp" "INFO"
    Write-SafeLog "  Health Check: http://localhost:6961/health" "INFO"
    Write-SafeLog "  Remotion Studio: http://localhost:6960" "INFO"
}

# ERROR HANDLING WRAPPER
try {
    Update-ClaudeDesktopConfig
}
catch {
    Write-SafeLog "FATAL ERROR: $($_.Exception.Message)" "ERROR"
    Write-SafeLog "Configuration was not modified due to error" "ERROR"
    
    if (-not $TestMode) {
        Write-SafeLog "Troubleshooting steps:" "INFO"
        Write-SafeLog "1. Verify Docker container is running: docker ps" "INFO"
        Write-SafeLog "2. Test MCP health: curl http://localhost:6961/health" "INFO"
        Write-SafeLog "3. Check Claude config: Get-Content `"$ClaudeConfigFile`"" "INFO"
        Write-SafeLog "4. Restore from backup if needed" "INFO"
    }
    
    exit 1
}