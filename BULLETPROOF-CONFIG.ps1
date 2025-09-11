<#
.SYNOPSIS
    Bulletproof Claude Desktop MCP Configuration 
    
.DESCRIPTION
    Creates Claude Desktop MCP configs with proper validation.
    Prevents transport type mixing and validation errors.
    
.PARAMETER ServerName
    Name of the MCP server
    
.PARAMETER ServerUrl  
    URL for HTTP transport (e.g., http://localhost:6961/mcp)
    
.PARAMETER Command
    Command for stdio transport (e.g., node)
    
.PARAMETER Args
    Arguments array for stdio transport
    
.EXAMPLE
    .\BULLETPROOF-CONFIG.ps1 -ServerName "clean-cut-mcp" -ServerUrl "http://localhost:6961/mcp"
    Create HTTP transport config
    
.EXAMPLE
    .\BULLETPROOF-CONFIG.ps1 -ServerName "my-server" -Command "node" -Args @("server.js")
    Create stdio transport config
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerName,
    
    [Parameter(ParameterSetName='HTTP', Mandatory=$true)]
    [string]$ServerUrl,
    
    [Parameter(ParameterSetName='STDIO', Mandatory=$true)]
    [string]$Command,
    
    [Parameter(ParameterSetName='STDIO', Mandatory=$true)]
    [string[]]$Args,
    
    [switch]$TestMode
)

$ErrorActionPreference = "Stop"

function Write-ConfigLog {
    param([string]$Message, [string]$Level = "INFO")
    $color = switch($Level) {
        "ERROR" { "Red" }
        "SUCCESS" { "Green" }
        "WARN" { "Yellow" }
        default { "Cyan" }
    }
    Write-Host "[$Level] $Message" -ForegroundColor $color
}

function Test-ClaudeDesktopValidation {
    param([hashtable]$Config)
    
    Write-ConfigLog "Validating Claude Desktop MCP structure..." "INFO"
    
    # Check top-level structure
    if (-not $Config.ContainsKey("mcpServers")) {
        throw "Missing 'mcpServers' key"
    }
    
    # Check each server
    foreach ($serverName in $Config["mcpServers"].Keys) {
        $server = $Config["mcpServers"][$serverName]
        Write-ConfigLog "Validating server: $serverName" "INFO"
        
        # Must have either URL or Command+Args, never both
        $hasUrl = $server.ContainsKey("url")
        $hasCommand = $server.ContainsKey("command")
        $hasArgs = $server.ContainsKey("args")
        
        if ($hasUrl -and ($hasCommand -or $hasArgs)) {
            throw "Server '$serverName' has mixed transport types (url + command/args)"
        }
        
        if ($hasCommand -and -not $hasArgs) {
            throw "Server '$serverName' has command but no args"
        }
        
        if ($hasArgs -and -not $hasCommand) {
            throw "Server '$serverName' has args but no command"
        }
        
        if (-not $hasUrl -and -not $hasCommand) {
            throw "Server '$serverName' has no transport method (needs url OR command+args)"
        }
        
        Write-ConfigLog "✓ Server '$serverName' structure is valid" "SUCCESS"
    }
    
    Write-ConfigLog "✓ All servers passed validation" "SUCCESS"
    return $true
}

function Set-ClaudeDesktopConfig {
    param([hashtable]$Config)
    
    $configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
    
    # Create config directory if needed
    $configDir = Split-Path $configPath -Parent
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
        Write-ConfigLog "Created config directory: $configDir" "INFO"
    }
    
    # Create backup
    if (Test-Path $configPath) {
        $backupPath = "$configPath.bulletproof-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $configPath $backupPath
        Write-ConfigLog "Backup created: $backupPath" "INFO"
    }
    
    # Validate structure
    Test-ClaudeDesktopValidation -Config $Config
    
    # Convert to JSON with proper depth
    $json = $Config | ConvertTo-Json -Depth 10 -Compress:$false
    
    # Validate JSON syntax
    try {
        $null = $json | ConvertFrom-Json -ErrorAction Stop
        Write-ConfigLog "✓ JSON syntax validation passed" "SUCCESS"
    }
    catch {
        throw "Generated invalid JSON: $($_.Exception.Message)"
    }
    
    if ($TestMode) {
        Write-ConfigLog "TEST MODE: Would write to $configPath" "WARN"
        Write-ConfigLog "Configuration preview:" "INFO"
        Write-Host $json -ForegroundColor DarkGray
        return $true
    }
    
    # Write atomically
    $tempPath = "$configPath.tmp"
    $json | Out-File $tempPath -Encoding UTF8
    
    # Final validation of written file
    try {
        $null = Get-Content $tempPath -Raw | ConvertFrom-Json -ErrorAction Stop
        Move-Item $tempPath $configPath -Force
        Write-ConfigLog "✓ Configuration written successfully" "SUCCESS"
    }
    catch {
        Remove-Item $tempPath -Force -ErrorAction SilentlyContinue
        throw "Final validation failed: $($_.Exception.Message)"
    }
    
    return $true
}

# MAIN EXECUTION
Write-ConfigLog "=== BULLETPROOF CLAUDE DESKTOP CONFIG ===" "INFO"

try {
    # Read existing config if it exists
    $configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
    $existingConfig = @{ mcpServers = @{} }
    
    if (Test-Path $configPath) {
        try {
            $existingJson = Get-Content $configPath -Raw -ErrorAction Stop
            $existingParsed = $existingJson | ConvertFrom-Json -ErrorAction Stop
            
            if ($existingParsed.mcpServers) {
                # Convert to hashtable for manipulation
                $existingConfig.mcpServers = @{}
                $existingParsed.mcpServers.PSObject.Properties | ForEach-Object {
                    $serverConfig = @{}
                    $_.Value.PSObject.Properties | ForEach-Object {
                        if ($_.Name -eq "args" -and $_.Value -is [System.Object[]]) {
                            $serverConfig[$_.Name] = $_.Value
                        } else {
                            $serverConfig[$_.Name] = $_.Value
                        }
                    }
                    $existingConfig.mcpServers[$_.Name] = $serverConfig
                }
                Write-ConfigLog "Loaded existing configuration with $($existingConfig.mcpServers.Count) servers" "INFO"
            }
        }
        catch {
            Write-ConfigLog "Warning: Could not parse existing config, starting fresh" "WARN"
        }
    }
    
    # Create new server config
    if ($PSCmdlet.ParameterSetName -eq "HTTP") {
        Write-ConfigLog "Creating HTTP transport server: $ServerName" "INFO"
        $serverConfig = @{
            url = $ServerUrl
        }
    }
    else {
        Write-ConfigLog "Creating stdio transport server: $ServerName" "INFO"
        $serverConfig = @{
            command = $Command
            args = $Args
            env = @{}
        }
    }
    
    # Add/update server
    $existingConfig.mcpServers[$ServerName] = $serverConfig
    
    # Set configuration
    Set-ClaudeDesktopConfig -Config $existingConfig
    
    Write-ConfigLog "=== CONFIGURATION COMPLETE ===" "SUCCESS"
    Write-ConfigLog "✓ Server '$ServerName' configured successfully" "SUCCESS"
    Write-ConfigLog "✓ Transport: $($PSCmdlet.ParameterSetName)" "SUCCESS"
    Write-ConfigLog "✓ All validation checks passed" "SUCCESS"
    
    if (-not $TestMode) {
        Write-ConfigLog "" "INFO"
        Write-ConfigLog "NEXT: Restart Claude Desktop to apply changes" "INFO"
    }
    
}
catch {
    Write-ConfigLog "CONFIGURATION FAILED: $($_.Exception.Message)" "ERROR"
    Write-ConfigLog "Check the error above and try manual configuration" "ERROR"
    exit 1
}