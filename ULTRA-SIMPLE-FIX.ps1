<#
.SYNOPSIS
    Ultra-Simple Claude Desktop MCP Fix - No Complexity
    
.DESCRIPTION
    Creates absolutely minimal, guaranteed-working Claude Desktop config
    for Clean-Cut-MCP HTTP transport only.
#>

$ErrorActionPreference = "Stop"

function Write-SimpleLog {
    param([string]$Message, [string]$Level = "INFO")
    $color = switch($Level) {
        "ERROR" { "Red" }
        "SUCCESS" { "Green" }
        default { "Cyan" }
    }
    Write-Host $Message -ForegroundColor $color
}

Write-SimpleLog "=== ULTRA-SIMPLE CLAUDE DESKTOP FIX ===" "INFO"

# Step 1: Kill Claude
Write-SimpleLog "Killing all Claude processes..." "INFO"
Get-Process -Name "Claude*" -ErrorAction SilentlyContinue | Stop-Process -Force

# Step 2: Navigate to config directory
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
Write-SimpleLog "Config path: $configPath" "INFO"

# Step 3: Create backup
if (Test-Path $configPath) {
    $backupPath = "$configPath.ultra-simple-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $configPath $backupPath
    Write-SimpleLog "Backup created: $backupPath" "INFO"
}

# Step 4: Create absolutely minimal config (HTTP transport only)
$minimalConfig = @'
{
  "mcpServers": {
    "clean-cut-mcp": {
      "url": "http://localhost:6961/mcp"
    }
  }
}
'@

# Step 5: Write config
$minimalConfig | Out-File $configPath -Encoding UTF8
Write-SimpleLog "Minimal config written" "SUCCESS"

# Step 6: Validate JSON
try {
    $null = Get-Content $configPath -Raw | ConvertFrom-Json -ErrorAction Stop
    Write-SimpleLog "✓ JSON validation passed" "SUCCESS"
}
catch {
    Write-SimpleLog "✗ JSON validation failed: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Step 7: Show final config
Write-SimpleLog "Final configuration:" "INFO"
Write-Host (Get-Content $configPath -Raw) -ForegroundColor DarkGray

Write-SimpleLog "" "INFO"
Write-SimpleLog "=== COMPLETE ===" "SUCCESS"
Write-SimpleLog "✓ Claude Desktop config reset to minimal HTTP-only structure" "SUCCESS"  
Write-SimpleLog "✓ Only contains: clean-cut-mcp with url transport" "SUCCESS"
Write-SimpleLog "✓ No mixed transport types" "SUCCESS"
Write-SimpleLog "" "INFO"
Write-SimpleLog "NEXT: Start Claude Desktop and test" "INFO"
Write-SimpleLog "Expected: No validation errors" "INFO"