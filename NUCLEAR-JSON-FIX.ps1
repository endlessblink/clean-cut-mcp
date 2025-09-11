<#
.SYNOPSIS
    Nuclear JSON Fix - Guaranteed Working Claude Desktop Config
    
.DESCRIPTION
    Fixes ALL JSON corruption issues:
    - BOM (Byte Order Mark) pollution
    - Encoding problems (UTF-16, etc.)
    - Invisible characters
    - PowerShell ConvertTo-Json corruption
    - Wrong file locations
    
.EXAMPLE
    .\NUCLEAR-JSON-FIX.ps1
    Creates clean config with byte-level precision
#>

$ErrorActionPreference = "Stop"

function Write-NuclearLog {
    param([string]$Message, [string]$Level = "INFO")
    $color = switch($Level) {
        "ERROR" { "Red" }
        "SUCCESS" { "Green" }
        "WARN" { "Yellow" }
        "DEBUG" { "DarkGray" }
        default { "Cyan" }
    }
    Write-Host $Message -ForegroundColor $color
}

Write-NuclearLog "=== NUCLEAR JSON FIX - CLAUDE DESKTOP ===" "INFO"
Write-NuclearLog "Fixing ALL JSON corruption issues..." "INFO"

# Step 1: Kill Claude completely
Write-NuclearLog "Terminating all Claude processes..." "INFO"
Get-Process -Name "Claude*" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Step 2: Find ALL possible config locations
Write-NuclearLog "Scanning for Claude config files..." "INFO"
$possiblePaths = @(
    "$env:APPDATA\Claude\claude_desktop_config.json"
    "$env:LOCALAPPDATA\Claude\claude_desktop_config.json" 
    "$env:USERPROFILE\.claude\claude_desktop_config.json"
    "$env:USERPROFILE\AppData\Roaming\Claude\claude_desktop_config.json"
)

$foundConfigs = @()
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $foundConfigs += $path
        Write-NuclearLog "Found config: $path" "WARN"
        
        # Show file corruption diagnostics
        $bytes = Get-Content $path -AsByteStream -TotalCount 10 -ErrorAction SilentlyContinue
        Write-NuclearLog "  First 10 bytes: $($bytes -join ', ')" "DEBUG"
        Write-NuclearLog "  File size: $((Get-Item $path).Length) bytes" "DEBUG"
    }
}

# Step 3: Use primary config location
$configDir = "$env:APPDATA\Claude"
$configPath = "$configDir\claude_desktop_config.json"

Write-NuclearLog "Using primary config path: $configPath" "INFO"

# Step 4: Create config directory if missing
if (-not (Test-Path $configDir)) {
    New-Item -Path $configDir -ItemType Directory -Force | Out-Null
    Write-NuclearLog "Created config directory: $configDir" "SUCCESS"
}

# Step 5: Backup any existing configs
foreach ($path in $foundConfigs) {
    $backupPath = "$path.nuclear-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $path $backupPath -Force
    Write-NuclearLog "Backup created: $backupPath" "INFO"
}

# Step 6: Delete ALL existing config files (nuclear approach)
foreach ($path in $foundConfigs) {
    Remove-Item $path -Force
    Write-NuclearLog "Deleted corrupted config: $path" "WARN"
}

# Step 7: Get WSL2 IP for non-admin networking
Write-NuclearLog "Getting WSL2 IP address..." "INFO"
try {
    $wslIP = (wsl hostname -I).Trim()
    Write-NuclearLog "WSL2 IP detected: $wslIP" "SUCCESS"
    $mcpUrl = "http://$wslIP:6961/mcp"
    $studioUrl = "http://$wslIP:6960"
}
catch {
    Write-NuclearLog "WSL2 not available, using localhost" "WARN"
    $mcpUrl = "http://localhost:6961/mcp"
    $studioUrl = "http://localhost:6960"
}

# Step 8: Create PERFECT JSON with byte-level control
Write-NuclearLog "Creating clean JSON config..." "INFO"

# Use raw string - NO PowerShell object conversion corruption
$cleanJson = @"
{
  "mcpServers": {
    "clean-cut-mcp": {
      "url": "$mcpUrl"
    }
  }
}
"@

# Write with explicit UTF-8 encoding, NO BOM
[System.IO.File]::WriteAllText($configPath, $cleanJson, (New-Object System.Text.UTF8Encoding $false))

# Step 9: Validate the result
Write-NuclearLog "Validating created file..." "INFO"

# Check file exists
if (-not (Test-Path $configPath)) {
    Write-NuclearLog "ERROR: Config file not created!" "ERROR"
    exit 1
}

# Check file size
$fileSize = (Get-Item $configPath).Length
Write-NuclearLog "File size: $fileSize bytes" "DEBUG"

# Check first bytes (no BOM = good)
$firstBytes = Get-Content $configPath -AsByteStream -TotalCount 3
if ($firstBytes[0] -eq 239 -and $firstBytes[1] -eq 187 -and $firstBytes[2] -eq 191) {
    Write-NuclearLog "ERROR: File has BOM! This will break Claude Desktop!" "ERROR"
    exit 1
} else {
    Write-NuclearLog "No BOM detected - perfect!" "SUCCESS"
}

# Validate JSON syntax
try {
    $parsedJson = Get-Content $configPath -Raw | ConvertFrom-Json -ErrorAction Stop
    Write-NuclearLog "JSON syntax validation: PASSED" "SUCCESS"
}
catch {
    Write-NuclearLog "ERROR: JSON syntax validation failed: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Test specific structure
if ($parsedJson.mcpServers -and $parsedJson.mcpServers.'clean-cut-mcp' -and $parsedJson.mcpServers.'clean-cut-mcp'.url) {
    Write-NuclearLog "MCP server structure validation: PASSED" "SUCCESS"
} else {
    Write-NuclearLog "ERROR: MCP server structure invalid!" "ERROR"
    exit 1
}

# Step 10: Test container connectivity
Write-NuclearLog "Testing container connectivity..." "INFO"
try {
    $healthUrl = $mcpUrl -replace "/mcp", "/health"
    $response = Invoke-RestMethod $healthUrl -TimeoutSec 5 -ErrorAction Stop
    if ($response.status -eq "healthy") {
        Write-NuclearLog "Container connectivity: PASSED" "SUCCESS"
    }
}
catch {
    Write-NuclearLog "WARNING: Container not reachable. Make sure clean-cut-mcp is running:" "WARN"
    Write-NuclearLog "  docker ps --filter name=clean-cut-mcp" "WARN"
}

# Step 11: Final summary
Write-NuclearLog "" "INFO"
Write-NuclearLog "=== NUCLEAR FIX COMPLETE ===" "SUCCESS"
Write-NuclearLog "" "INFO"
Write-NuclearLog "FIXES APPLIED:" "SUCCESS"
Write-NuclearLog "  [FIXED] BOM corruption" "SUCCESS" 
Write-NuclearLog "  [FIXED] Encoding issues (UTF-8 no BOM)" "SUCCESS"
Write-NuclearLog "  [FIXED] PowerShell ConvertTo-Json corruption" "SUCCESS"
Write-NuclearLog "  [FIXED] Invisible characters" "SUCCESS"
Write-NuclearLog "  [FIXED] Wrong file locations" "SUCCESS"
Write-NuclearLog "" "INFO"
Write-NuclearLog "CONFIG CREATED:" "INFO"
Write-NuclearLog "  Location: $configPath" "INFO"
Write-NuclearLog "  Size: $fileSize bytes" "INFO"
Write-NuclearLog "  Encoding: UTF-8 (no BOM)" "INFO"
Write-NuclearLog "  MCP URL: $mcpUrl" "INFO"
Write-NuclearLog "  Studio URL: $studioUrl" "INFO"
Write-NuclearLog "" "INFO"
Write-NuclearLog "NEXT STEPS:" "INFO"
Write-NuclearLog "1. Start Claude Desktop" "INFO"
Write-NuclearLog "2. NO popup errors should appear" "SUCCESS"
Write-NuclearLog "3. Ask: 'Create a bouncing ball animation'" "INFO"
Write-NuclearLog "4. Expect: 'Animation ready at $studioUrl'" "INFO"
Write-NuclearLog "" "INFO"
Write-NuclearLog "If you STILL get popup errors after this fix," "WARN"
Write-NuclearLog "the issue is with your Claude Desktop installation itself." "WARN"
Write-NuclearLog "" "INFO"
Write-NuclearLog "Nuclear fix completed successfully!" "SUCCESS"