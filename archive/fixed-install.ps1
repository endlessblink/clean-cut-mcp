# Clean-Cut-MCP Simple Installer - FIXED VERSION
# Run with: .\fixed-install.ps1

Clear-Host
Write-Host ""
Write-Host "Clean-Cut-MCP Installer (Fixed)" -ForegroundColor Cyan
Write-Host "No Administrator Required" -ForegroundColor Green
Write-Host ""

function Write-Status {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    
    switch ($Type) {
        "Success" { Write-Host $Message -ForegroundColor Green }
        "Error" { Write-Host $Message -ForegroundColor Red }
        "Warning" { Write-Host $Message -ForegroundColor Yellow }
        "Info" { Write-Host $Message -ForegroundColor Cyan }
        default { Write-Host $Message -ForegroundColor White }
    }
}

try {
    Write-Status "Step 1: Checking requirements..." "Info"
    
    # Check WSL2
    $wslOutput = & wsl --status 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "WSL2 not available. Please install WSL2 first."
    }
    Write-Status "WSL2 is available" "Success"
    
    # Check Docker
    $dockerOutput = & wsl docker version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not available in WSL2. Please start Docker Desktop."
    }
    Write-Status "Docker is available" "Success"
    
    Write-Host ""
    Write-Status "Step 2: Checking container..." "Info"
    
    # Check container status
    $containerStatus = & wsl docker ps -a --filter "name=clean-cut-mcp" --format "{{.Status}}" 2>&1
    if (-not $containerStatus -or $containerStatus -like "*error*") {
        throw "Container 'clean-cut-mcp' not found. Please build it first: docker build -t clean-cut-mcp ."
    }
    
    # Start container if needed
    if ($containerStatus -notlike "*Up*") {
        Write-Status "Starting container..." "Warning"
        & wsl docker start clean-cut-mcp | Out-Null
        Start-Sleep -Seconds 5
    }
    
    # Verify running
    $runningStatus = & wsl docker ps --filter "name=clean-cut-mcp" --format "{{.Status}}" 2>&1
    if ($runningStatus -like "*Up*") {
        Write-Status "Container is running" "Success"
    } else {
        throw "Failed to start container"
    }
    
    Write-Host ""
    Write-Status "Step 3: Getting network address..." "Info"
    
    # Get WSL2 IP address - FIXED METHOD
    $ipCommand = & wsl sh -c "hostname -I | awk '{print `$1}'" 2>&1
    if ($LASTEXITCODE -ne 0 -or -not $ipCommand) {
        # Fallback method
        $ipCommand = & wsl sh -c "ip route | grep default | awk '{print `$3}'" 2>&1
    }
    
    if (-not $ipCommand) {
        throw "Could not determine WSL2 IP address"
    }
    
    $wslIP = $ipCommand.ToString().Trim()
    Write-Status "Raw IP output: '$wslIP'" "Info"
    
    # Validate IP format
    if ($wslIP -notmatch "^\d+\.\d+\.\d+\.\d+$") {
        throw "Invalid IP address format: '$wslIP'"
    }
    
    Write-Status "WSL2 IP: $wslIP" "Success"
    
    Write-Host ""
    Write-Status "Step 4: Testing connection..." "Info"
    
    # Test server connection - BETTER ERROR HANDLING
    $healthUrl = "http://$wslIP`:6961/health"
    Write-Status "Testing URL: $healthUrl" "Info"
    
    try {
        $response = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 10 -ErrorAction Stop
        Write-Status "Server is responding!" "Success"
        Write-Status "Response: $($response | ConvertTo-Json -Compress)" "Info"
    } catch {
        Write-Status "Direct connection failed. Trying alternative methods..." "Warning"
        
        # Try localhost (in case port forwarding is set up)
        try {
            $localhostUrl = "http://localhost:6961/health"
            Write-Status "Testing localhost: $localhostUrl" "Info"
            $response = Invoke-RestMethod -Uri $localhostUrl -TimeoutSec 5 -ErrorAction Stop
            Write-Status "Localhost works! Using localhost instead." "Success"
            $wslIP = "localhost"
        } catch {
            # Test from inside WSL2
            $wslTest = & wsl curl -s "http://localhost:6961/health" 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Status "Server works from WSL2 but not from Windows" "Warning"
                Write-Status "This is a networking issue. Server response from WSL2: $wslTest" "Info"
                throw "Server is running but Windows cannot access it. This is a WSL2 networking issue."
            } else {
                throw "Server is not responding from WSL2 either. Server may not be fully started."
            }
        }
    }
    
    Write-Host ""
    Write-Status "Step 5: Configuring Claude Desktop..." "Info"
    
    # Stop Claude if running
    Get-Process -Name "Claude*" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    
    # Setup paths
    $configPath = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
    $configDir = Split-Path $configPath -Parent
    
    # Create directory if needed
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    
    # Backup existing config
    if (Test-Path $configPath) {
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $backupPath = Join-Path $configDir "claude_desktop_config.json.backup-$timestamp"
        Copy-Item $configPath $backupPath -Force
        Write-Status "Existing config backed up" "Warning"
    }
    
    # Create new configuration
    $mcpUrl = "http://$wslIP`:6961/mcp"
    Write-Status "Using MCP URL: $mcpUrl" "Info"
    
    $config = @{
        mcpServers = @{
            "clean-cut-mcp" = @{
                url = $mcpUrl
            }
        }
    }
    
    # Convert to JSON
    $jsonContent = $config | ConvertTo-Json -Depth 10
    
    # Validate JSON before saving
    try {
        $null = $jsonContent | ConvertFrom-Json
    } catch {
        throw "Generated configuration is not valid JSON"
    }
    
    # Save configuration
    $jsonContent | Out-File -FilePath $configPath -Encoding UTF8 -Force
    
    # Verify saved file
    if (Test-Path $configPath) {
        $verifyContent = Get-Content $configPath -Raw
        $null = $verifyContent | ConvertFrom-Json
        Write-Status "Claude Desktop configured successfully" "Success"
    } else {
        throw "Failed to save configuration file"
    }
    
    # Show success message
    Write-Host ""
    Write-Status "SUCCESS! Installation complete!" "Success"
    Write-Host ""
    Write-Host "Configuration details:" -ForegroundColor Cyan
    Write-Host "  MCP Server: $mcpUrl" -ForegroundColor White
    Write-Host "  Remotion Studio: http://$wslIP`:6960" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Start Claude Desktop" -ForegroundColor White
    Write-Host "  2. Open a new conversation" -ForegroundColor White
    Write-Host "  3. Say: 'Create a bouncing ball animation'" -ForegroundColor White
    Write-Host "  4. Look for 'clean-cut-mcp' in available tools" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Status "Installation failed: $($_.Exception.Message)" "Error"
    Write-Host ""
    Write-Host "Diagnostic information:" -ForegroundColor Yellow
    
    # Show diagnostic info
    Write-Host "WSL2 IP detection:" -ForegroundColor Cyan
    try {
        $diagIP = & wsl hostname -I 2>&1
        Write-Host "  hostname -I result: '$diagIP'" -ForegroundColor White
    } catch {
        Write-Host "  hostname -I failed" -ForegroundColor Red
    }
    
    Write-Host "Container status:" -ForegroundColor Cyan
    try {
        $diagContainer = & wsl docker ps --filter "name=clean-cut-mcp" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>&1
        Write-Host "  $diagContainer" -ForegroundColor White
    } catch {
        Write-Host "  Cannot get container status" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Common solutions:" -ForegroundColor Yellow
    Write-Host "  - Make sure Docker Desktop is running" -ForegroundColor White
    Write-Host "  - Restart the container: wsl docker restart clean-cut-mcp" -ForegroundColor White
    Write-Host "  - Check container logs: wsl docker logs clean-cut-mcp" -ForegroundColor White
    Write-Host "  - Test manually: wsl curl http://localhost:6961/health" -ForegroundColor White
    Write-Host ""
}

Write-Host "Press Enter to close..." -ForegroundColor Gray
$null = Read-Host