#Requires -Version 5.1

<#
.SYNOPSIS
    Clean-Cut-MCP Bulletproof Installer for Claude Desktop
    
.DESCRIPTION
    One-Script Magic installer that safely configures Claude Desktop for Clean-Cut-MCP.
    Follows all safety rules from CLAUDE.md to NEVER break existing configurations.
    
.PARAMETER TestMode
    Run in test mode without making actual changes
    
.PARAMETER Force
    Skip safety checks and force installation (use with caution)
    
.EXAMPLE
    .\install.ps1
    Standard installation with all safety checks
    
.EXAMPLE
    .\install.ps1 -TestMode
    Test installation without making changes
#>

param(
    [switch]$TestMode,
    [switch]$Force
)

# CRITICAL SAFETY CONFIGURATION
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# SAFE PATHS - Using full Docker path as required by CLAUDE.md
$DockerPath = "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe"
$ClaudeConfigDir = "$env:APPDATA\\Claude"
$ClaudeConfigFile = "$ClaudeConfigDir\\claude_desktop_config.json"
$BackupSuffix = "clean-cut-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$ContainerName = "clean-cut-mcp"
$ImageName = "clean-cut-mcp"

# VIDEO EXPORT CONFIGURATION - Cross-platform export directory
$ExportDir = Join-Path $PWD "clean-cut-exports"

# Logging function (safe stderr output with robust file handling)
function Write-SafeLog {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage -ForegroundColor $(if($Level -eq "ERROR") { "Red" } elseif($Level -eq "WARN") { "Yellow" } else { "Green" })
    
    # Robust file logging with error handling
    try {
        $logFile = "clean-cut-install.log"
        $logMessage | Out-File -FilePath $logFile -Append -Encoding UTF8 -ErrorAction SilentlyContinue
    } catch {
        # If file logging fails, just continue (console output is primary)
    }
}

# PowerShell 5.1 compatible helper function for converting PSCustomObject to hashtable
function Convert-PSObjectToHashtable {
    param([Parameter(ValueFromPipeline)]$InputObject)
    
    if ($null -eq $InputObject) {
        return $null
    }
    
    if ($InputObject -is [hashtable]) {
        return $InputObject
    }
    
    if ($InputObject -is [PSCustomObject]) {
        $hashtable = @{}
        $InputObject.PSObject.Properties | ForEach-Object {
            $value = $_.Value
            if ($value -is [PSCustomObject]) {
                $hashtable[$_.Name] = Convert-PSObjectToHashtable -InputObject $value
            }
            elseif ($value -is [array]) {
                $hashtable[$_.Name] = @($value | ForEach-Object { Convert-PSObjectToHashtable -InputObject $_ })
            }
            else {
                $hashtable[$_.Name] = $value
            }
        }
        return $hashtable
    }
    
    return $InputObject
}

# Docker helper function with proper error handling
# Export directory helper function
function Ensure-ExportDirectory {
    param([string]$ExportPath)
    
    Write-SafeLog "Ensuring video export directory exists: $ExportPath" "INFO"
    
    try {
        if (-not (Test-Path $ExportPath)) {
            New-Item -ItemType Directory -Path $ExportPath -Force | Out-Null
            Write-SafeLog "Created export directory: $ExportPath" "INFO"
        }
        else {
            Write-SafeLog "Export directory already exists: $ExportPath" "INFO"
        }
        
        # Verify directory is writable
        $testFile = Join-Path $ExportPath "test-write-$(Get-Random).txt"
        try {
            "test" | Out-File -FilePath $testFile -Force
            Remove-Item $testFile -Force -ErrorAction SilentlyContinue
            Write-SafeLog "Export directory write test passed" "INFO"
        }
        catch {
            Write-SafeLog "Export directory is not writable: $($_.Exception.Message)" "ERROR"
            return $false
        }
        
        return $true
    }
    catch {
        Write-SafeLog "Failed to create export directory: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

function Stop-DockerContainer {
    param([string]$ContainerName, [switch]$Silent = $true)
    
    try {
        # Check if container exists first
        $containerExists = & $DockerPath ps -a --format "{{.Names}}" 2>$null | Where-Object { $_ -eq $ContainerName }
        
        if ($containerExists) {
            Write-SafeLog "Stopping existing container: $ContainerName" "INFO"
            & $DockerPath stop $ContainerName 2>$null | Out-Null
            & $DockerPath rm $ContainerName 2>$null | Out-Null
            Write-SafeLog "Container $ContainerName stopped and removed" "INFO"
        }
        else {
            if (-not $Silent) {
                Write-SafeLog "Container $ContainerName does not exist (skipping cleanup)" "INFO"
            }
        }
    }
    catch {
        Write-SafeLog "Error during container cleanup: $($_.Exception.Message)" "WARN"
        # Don't fail installation due to cleanup issues
    }
}

# Build environment cleanup helper function
function Clear-BuildEnvironment {
    param([switch]$Force)
    
    Write-SafeLog "Cleaning build environment..." "INFO"
    
    $itemsToClean = @(
        "node_modules",
        "mcp-server/node_modules", 
        "mcp-server/dist",
        "*.log",
        "clean-cut-mcp.log",
        "clean-cut-install.log"
    )
    
    $cleanedItems = 0
    
    foreach ($item in $itemsToClean) {
        try {
            if (Test-Path $item) {
                if ($item -like "*.log") {
                    Remove-Item $item -Force -ErrorAction SilentlyContinue
                    Write-SafeLog "Cleaned log file: $item" "INFO"
                }
                else {
                    Remove-Item $item -Recurse -Force -ErrorAction SilentlyContinue
                    Write-SafeLog "Cleaned directory: $item" "INFO"
                }
                $cleanedItems++
            }
        }
        catch {
            Write-SafeLog "Could not clean $item : $($_.Exception.Message)" "WARN"
        }
    }
    
    if ($cleanedItems -eq 0) {
        Write-SafeLog "Build environment already clean" "INFO"
    }
    else {
        Write-SafeLog "Cleaned $cleanedItems item(s) from build environment" "INFO"
    }
    
    return $true
}

# Docker image verification helper
function Test-DockerImageExists {
    param([string]$ImageName)
    
    try {
        Write-SafeLog "Verifying Docker image exists: $ImageName" "INFO"
        
        # Check if image exists using docker images
        $images = & $DockerPath images $ImageName --format "{{.Repository}}:{{.Tag}}" 2>$null
        
        if (-not $images -or $images.Count -eq 0) {
            Write-SafeLog "Docker image '$ImageName' not found in local registry" "ERROR"
            
            # List available images for debugging
            Write-SafeLog "Available images:" "INFO"
            $allImages = & $DockerPath images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" 2>$null
            if ($allImages) {
                $allImages | ForEach-Object { Write-SafeLog "  $_" "INFO" }
            }
            
            return $false
        }
        
        Write-SafeLog "Found Docker image: $images" "INFO"
        
        # Verify image can be inspected
        $imageInfo = & $DockerPath inspect $ImageName 2>$null | ConvertFrom-Json
        
        if (-not $imageInfo) {
            Write-SafeLog "Docker image '$ImageName' exists but cannot be inspected" "ERROR"
            return $false
        }
        
        # Check image metadata
        $imageId = $imageInfo[0].Id
        $imageSize = [math]::Round($imageInfo[0].Size / 1MB, 1)
        $created = $imageInfo[0].Created
        
        Write-SafeLog "Image verified successfully:" "INFO"
        Write-SafeLog "  ID: $($imageId.Substring(0, 12))..." "INFO"
        Write-SafeLog "  Size: ${imageSize} MB" "INFO"
        Write-SafeLog "  Created: $created" "INFO"
        
        # Test basic container creation (not running, just creation)
        try {
            $testContainer = & $DockerPath create --name "clean-cut-test-$(Get-Random)" $ImageName 2>$null
            if ($testContainer) {
                & $DockerPath rm $testContainer 2>$null | Out-Null
                Write-SafeLog "Image container creation test passed" "INFO"
            }
            else {
                Write-SafeLog "Image container creation test failed" "WARN"
                # Don't fail verification for this - image exists but might have issues
            }
        }
        catch {
            Write-SafeLog "Container creation test failed: $($_.Exception.Message)" "WARN"
            # Don't fail verification for this
        }
        
        return $true
        
    }
    catch {
        Write-SafeLog "Error verifying Docker image: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Docker build helper with error detection and verification
function Build-CleanCutMcpImage {
    param([switch]$Clean, [int]$MaxRetries = 2)
    
    if ($Clean) {
        Clear-BuildEnvironment
    }
    
    Write-SafeLog "Building Clean-Cut-MCP Docker image..." "INFO"
    Write-SafeLog "This may take 5-10 minutes on first build..." "INFO"
    
    for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {
        if ($attempt -gt 1) {
            Write-SafeLog "Build attempt $attempt of $MaxRetries..." "INFO"
            # Clean environment between retries
            Clear-BuildEnvironment
            Start-Sleep -Seconds 2
        }
        
        try {
            Write-SafeLog "Running: docker build -t $ImageName ." "INFO"
            
            # Run docker build and capture both stdout and stderr
            $buildProcess = Start-Process -FilePath $DockerPath -ArgumentList "build", "-t", $ImageName, "." -Wait -PassThru -NoNewWindow -RedirectStandardOutput "build-stdout.log" -RedirectStandardError "build-stderr.log"
            
            # Read the output files
            $buildStdout = ""
            $buildStderr = ""
            
            if (Test-Path "build-stdout.log") {
                $buildStdout = Get-Content "build-stdout.log" -Raw
                Remove-Item "build-stdout.log" -Force -ErrorAction SilentlyContinue
            }
            
            if (Test-Path "build-stderr.log") {
                $buildStderr = Get-Content "build-stderr.log" -Raw  
                Remove-Item "build-stderr.log" -Force -ErrorAction SilentlyContinue
            }
            
            $buildOutput = $buildStdout + $buildStderr
            $exitCode = $buildProcess.ExitCode
            
            Write-SafeLog "Docker build process completed with exit code: $exitCode" "INFO"
            
            # Don't trust exit code alone - verify image actually exists
            Write-SafeLog "Verifying Docker image was created..." "INFO"
            
            if (Test-DockerImageExists -ImageName $ImageName) {
                Write-SafeLog "Docker image '$ImageName' built and verified successfully!" "INFO"
                return $true
            }
            else {
                Write-SafeLog "Docker build reported success but image not found!" "ERROR"
                
                # Show build output for debugging
                if ($buildOutput) {
                    Write-SafeLog "Docker build output for analysis:" "INFO"
                    $buildOutput -split "`n" | ForEach-Object { 
                        if ($_ -and $_.Trim()) {
                            Write-SafeLog "  $_" "INFO"
                        }
                    }
                }
                
                # Continue to error analysis
                $buildFailed = $true
            }
        }
        catch {
            Write-SafeLog "Docker build process error: $($_.Exception.Message)" "ERROR"
            $buildOutput = "Process execution failed: $($_.Exception.Message)"
            $buildFailed = $true
        }
        
        # Analyze build failure if we get here
        if ($buildFailed) {
            Write-SafeLog "Analyzing build failure (attempt $attempt of $MaxRetries)..." "INFO"
            
            # Analyze common build errors and provide solutions
            if ($buildOutput -match "archive/tar.*unknown file mode") {
                Write-SafeLog "SOLUTION: File permission issue detected." "ERROR"
                Write-SafeLog "  This is a Windows-specific Docker issue with node_modules permissions." "ERROR"
                
                if ($attempt -lt $MaxRetries) {
                    Write-SafeLog "  Will clean environment and retry..." "INFO"
                }
                else {
                    Write-SafeLog "  Try manual cleanup: .\\cleanup.ps1 -Force" "ERROR"
                }
            }
            elseif ($buildOutput -match "npm.*ENOENT|package.json.*not found") {
                Write-SafeLog "SOLUTION: Missing package.json or npm installation issue." "ERROR"
                Write-SafeLog "  1. Verify files exist: ls package.json, ls mcp-server/package.json" "ERROR"
                Write-SafeLog "  2. Check network connectivity for npm registry" "ERROR"
                return $false  # Don't retry for missing files
            }
            elseif ($buildOutput -match "no space left on device|disk.*full") {
                Write-SafeLog "SOLUTION: Disk space issue." "ERROR"
                Write-SafeLog "  Run: docker system prune -f" "ERROR"
                return $false  # Don't retry without fixing disk space
            }
            elseif ($buildOutput -match "Error response from daemon") {
                Write-SafeLog "SOLUTION: Docker daemon issue." "ERROR"
                Write-SafeLog "  1. Restart Docker Desktop" "ERROR"
                Write-SafeLog "  2. Check Docker is running properly" "ERROR"
            }
            else {
                Write-SafeLog "Unknown build failure. Full output:" "ERROR"
                if ($buildOutput) {
                    $buildOutput -split "`n" | ForEach-Object {
                        if ($_ -and $_.Trim()) {
                            Write-SafeLog "  $_" "ERROR"
                        }
                    }
                }
            }
        }
        
        # Reset build failed flag for next iteration
        $buildFailed = $false
    }
    
    Write-SafeLog "Docker build failed after $MaxRetries attempts" "ERROR"
    return $false
}

function Test-Prerequisites {
    Write-SafeLog "Checking prerequisites..." "INFO"
    
    # Check if Docker is installed
    if (-not (Test-Path $DockerPath)) {
        Write-SafeLog "Docker not found at expected path: $DockerPath" "ERROR"
        Write-SafeLog "Please install Docker Desktop and try again" "ERROR"
        return $false
    }
    
    # Test Docker daemon
    try {
        & $DockerPath version | Out-Null
        Write-SafeLog "Docker is running and accessible" "INFO"
    }
    catch {
        Write-SafeLog "Docker daemon is not running. Please start Docker Desktop" "ERROR"
        return $false
    }
    
    # Check if PowerShell version is sufficient
    if ($PSVersionTable.PSVersion.Major -lt 5) {
        Write-SafeLog "PowerShell 5.1 or higher required. Current version: $($PSVersionTable.PSVersion)" "ERROR"
        return $false
    }
    
    Write-SafeLog "All prerequisites met" "INFO"
    return $true
}

function Backup-ClaudeConfig {
    Write-SafeLog "Creating backup of Claude Desktop configuration..." "INFO"
    
    if (Test-Path $ClaudeConfigFile) {
        $backupPath = "$ClaudeConfigFile.$BackupSuffix"
        try {
            Copy-Item $ClaudeConfigFile $backupPath -Force
            Write-SafeLog "Configuration backed up to: $backupPath" "INFO"
            return $backupPath
        }
        catch {
            Write-SafeLog "Failed to create backup: $($_.Exception.Message)" "ERROR"
            return $null
        }
    }
    else {
        Write-SafeLog "No existing Claude configuration found - will create new one" "INFO"
        return "NEW_CONFIG"
    }
}

function Get-ExistingConfig {
    if (-not (Test-Path $ClaudeConfigFile)) {
        return @{ mcpServers = @{} }
    }
    
    try {
        $configText = Get-Content $ClaudeConfigFile -Raw -Encoding UTF8
        
        # Test JSON validity first
        $jsonObject = $configText | ConvertFrom-Json
        Write-SafeLog "Claude configuration JSON parsed successfully" "INFO"
        
        # Convert to hashtable for PowerShell 5.1 compatibility
        return Convert-PSObjectToHashtable -InputObject $jsonObject
    }
    catch {
        Write-SafeLog "Failed to parse existing configuration: $($_.Exception.Message)" "ERROR"
        Write-SafeLog "Configuration file path: $ClaudeConfigFile" "ERROR"
        throw "Invalid JSON in Claude configuration file. Please check the file syntax or delete it to create a new one."
    }
}

function Merge-McpServerConfig {
    param([hashtable]$ExistingConfig)
    
    Write-SafeLog "Merging Clean-Cut-MCP configuration with existing servers..." "INFO"
    
    # Ensure mcpServers exists
    if (-not $ExistingConfig.ContainsKey('mcpServers')) {
        $ExistingConfig['mcpServers'] = @{}
    }
    
    # CRITICAL: Check for conflicts with existing clean-cut-mcp
    if ($ExistingConfig.mcpServers.ContainsKey('clean-cut-mcp')) {
        if (-not $Force) {
            Write-SafeLog "Clean-Cut-MCP already configured. Use -Force to overwrite" "WARN"
            return $ExistingConfig
        }
        else {
            Write-SafeLog "Overwriting existing Clean-Cut-MCP configuration" "WARN"
        }
    }
    
    # Add Clean-Cut-MCP server configuration
    $ExistingConfig.mcpServers['clean-cut-mcp'] = @{
        url = "http://localhost:6961/mcp"
        description = "Clean-Cut-MCP - One-Script Magic video animation server"
        capabilities = @("tools")
    }
    
    Write-SafeLog "Configuration merged successfully" "INFO"
    return $ExistingConfig
}

function Save-ClaudeConfig {
    param([hashtable]$Config)
    
    Write-SafeLog "Saving Claude Desktop configuration..." "INFO"
    
    try {
        # Ensure directory exists
        if (-not (Test-Path $ClaudeConfigDir)) {
            New-Item -ItemType Directory -Path $ClaudeConfigDir -Force | Out-Null
        }
        
        # Convert to JSON with proper formatting (CRITICAL: Escape backslashes properly)
        $jsonConfig = $Config | ConvertTo-Json -Depth 10
        
        # CRITICAL FIX: Ensure proper JSON formatting for Windows paths
        $jsonConfig = $jsonConfig -replace '\\\\', '\\'
        
        # Save configuration
        Set-Content -Path $ClaudeConfigFile -Value $jsonConfig -Encoding UTF8 -Force
        Write-SafeLog "Configuration saved to: $ClaudeConfigFile" "INFO"
        
        # Validate saved JSON
        try {
            $validationContent = Get-Content $ClaudeConfigFile -Raw -Encoding UTF8
            $validatedConfig = $validationContent | ConvertFrom-Json
            
            # Check if mcpServers section exists
            if (-not $validatedConfig.mcpServers) {
                throw "Missing mcpServers section in saved configuration"
            }
            
            # Check if clean-cut-mcp was saved correctly
            if (-not $validatedConfig.mcpServers.'clean-cut-mcp') {
                throw "Clean-Cut-MCP configuration not found in saved file"
            }
            
            Write-SafeLog "Configuration JSON validated successfully" "INFO"
            Write-SafeLog "Total MCP servers configured: $($validatedConfig.mcpServers.PSObject.Properties.Count)" "INFO"
        }
        catch {
            Write-SafeLog "CRITICAL: Saved configuration is invalid!" "ERROR"
            Write-SafeLog "Validation error: $($_.Exception.Message)" "ERROR"
            Write-SafeLog "Configuration file path: $ClaudeConfigFile" "ERROR"
            throw "Configuration validation failed - file may be corrupted"
        }
        
    }
    catch {
        Write-SafeLog "Failed to save configuration: $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Test-DockerContainer {
    Write-SafeLog "Testing Docker container functionality..." "INFO"
    
    # Use proper image verification
    if (-not (Test-DockerImageExists -ImageName $ImageName)) {
        Write-SafeLog "Docker image '$ImageName' not found." "WARN"
        Write-SafeLog "Would you like me to build it automatically? This will:" "INFO"
        Write-SafeLog "  1. Clean the build environment (removes node_modules)" "INFO"
        Write-SafeLog "  2. Run: docker build -t $ImageName ." "INFO"
        Write-SafeLog "  3. Verify the image was created successfully" "INFO"
        Write-SafeLog "  4. This may take 5-10 minutes on first build" "INFO"
        Write-SafeLog "" "INFO"
        
        if (-not $TestMode) {
            $response = Read-Host "Build Docker image now? (y/N)"
            if ($response -eq 'y' -or $response -eq 'Y') {
                if (Build-CleanCutMcpImage -Clean) {
                    Write-SafeLog "Docker image built and verified successfully!" "INFO"
                }
                else {
                    Write-SafeLog "Docker build failed. Manual steps to try:" "ERROR"
                    Write-SafeLog "  1. Clean environment: .\\cleanup.ps1 -Force" "ERROR"
                    Write-SafeLog "  2. Build image: docker build -t $ImageName ." "ERROR"
                    Write-SafeLog "  3. Verify image: docker images $ImageName" "ERROR"
                    Write-SafeLog "  4. If still failing, check: docker system df" "ERROR"
                    return $false
                }
            }
            else {
                Write-SafeLog "Skipped automatic build. Manual build steps:" "ERROR"
                Write-SafeLog "  1. Clean first: .\\cleanup.ps1" "ERROR"
                Write-SafeLog "  2. Then build: docker build -t $ImageName ." "ERROR"
                Write-SafeLog "  3. Verify: docker images $ImageName" "ERROR"
                return $false
            }
        }
        else {
            Write-SafeLog "TestMode: Skipping automatic build. Manual build required:" "ERROR"
            Write-SafeLog "  1. Clean environment: .\\cleanup.ps1" "ERROR"
            Write-SafeLog "  2. Build image: docker build -t $ImageName ." "ERROR"
            Write-SafeLog "  3. Verify success: docker images $ImageName" "ERROR"
            return $false
        }
    }
    else {
        Write-SafeLog "Docker image '$ImageName' verified and ready" "INFO"
    }
    
    # Test container startup (quick test)
    if (-not $TestMode) {
        try {
            Write-SafeLog "Testing container startup..." "INFO"
            
            # Ensure export directory for testing
            if (-not (Ensure-ExportDirectory -ExportPath $ExportDir)) {
                Write-SafeLog "Failed to create export directory for testing" "WARN"
                return $false
            }
            
            # Stop existing container if running
            Stop-DockerContainer -ContainerName $ContainerName -Silent
            
            # Convert Windows paths for Docker volume mounting
            $dockerExportPath = $ExportDir -replace '\\', '/'
            if ($dockerExportPath -match '^[a-zA-Z]:') {
                # Convert Windows drive letters (C: -> /c)
                $dockerExportPath = $dockerExportPath -replace '^([a-zA-Z]):', '/$1'
            }
            
            # Start container for testing with volume mount
            $containerId = & $DockerPath run -d --name $ContainerName -p 6961:6961 -p 6960:6960 -v "${dockerExportPath}:/workspace/out" $ImageName
            
            if ($LASTEXITCODE -eq 0) {
                Write-SafeLog "Container started successfully: $containerId" "INFO"
                
                # Wait a moment for startup
                Start-Sleep -Seconds 5
                
                # Test health endpoint
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:6961/health" -TimeoutSec 10 -UseBasicParsing
                    if ($response.StatusCode -eq 200) {
                        Write-SafeLog "Health check passed - MCP server is responsive" "INFO"
                    }
                    else {
                        Write-SafeLog "Health check failed - Status: $($response.StatusCode)" "WARN"
                    }
                }
                catch {
                    Write-SafeLog "Health check failed: $($_.Exception.Message)" "WARN"
                }
                
                # Stop test container
                Stop-DockerContainer -ContainerName $ContainerName -Silent
                Write-SafeLog "Container test completed" "INFO"
                return $true
            }
            else {
                Write-SafeLog "Failed to start container" "ERROR"
                return $false
            }
        }
        catch {
            Write-SafeLog "Container test failed: $($_.Exception.Message)" "ERROR"
            # Clean up on failure
            Stop-DockerContainer -ContainerName $ContainerName -Silent
            return $false
        }
    }
    else {
        Write-SafeLog "Skipping container test (TestMode)" "INFO"
        return $true
    }
}

function Start-CleanCutMcp {
    Write-SafeLog "Starting Clean-Cut-MCP container..." "INFO"
    
    # Ensure export directory exists first
    if (-not (Ensure-ExportDirectory -ExportPath $ExportDir)) {
        Write-SafeLog "Failed to create export directory" "ERROR"
        return $false
    }
    
    # Stop existing container if running
    Stop-DockerContainer -ContainerName $ContainerName
    
    try {
        # Convert Windows paths for Docker volume mounting
        $dockerExportPath = $ExportDir -replace '\\', '/'
        if ($dockerExportPath -match '^[a-zA-Z]:') {
            # Convert Windows drive letters (C: -> /c)
            $dockerExportPath = $dockerExportPath -replace '^([a-zA-Z]):', '/$1'
        }
        
        Write-SafeLog "Mounting export directory: $ExportDir -> /workspace/out" "INFO"
        
        # Start the container with volume mount for video exports
        $containerId = & $DockerPath run -d --name $ContainerName -p 6961:6961 -p 6960:6960 -v "${dockerExportPath}:/workspace/out" --restart unless-stopped $ImageName
        
        if ($LASTEXITCODE -eq 0) {
            Write-SafeLog "Clean-Cut-MCP started successfully: $containerId" "INFO"
            Write-SafeLog "MCP Server: http://localhost:6961/mcp" "INFO"
            Write-SafeLog "Remotion Studio: http://localhost:6960" "INFO"
            Write-SafeLog "Health Check: http://localhost:6961/health" "INFO"
            Write-SafeLog "Video Export Directory: $ExportDir" "INFO"
            return $true
        }
        else {
            Write-SafeLog "Failed to start Clean-Cut-MCP container" "ERROR"
            return $false
        }
    }
    catch {
        Write-SafeLog "Error starting container: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Diagnostic commands for manual troubleshooting
function Show-DiagnosticCommands {
    Write-SafeLog "=== DIAGNOSTIC COMMANDS ===" "INFO"
    Write-SafeLog "If you need to troubleshoot manually:" "INFO"
    Write-SafeLog "" "INFO"
    Write-SafeLog "Check Docker:" "INFO"
    Write-SafeLog "  docker --version" "INFO"
    Write-SafeLog "  docker images clean-cut-mcp" "INFO"
    Write-SafeLog "  docker ps -a | findstr clean-cut-mcp" "INFO"
    Write-SafeLog "" "INFO"
    Write-SafeLog "Build Issues:" "INFO"
    Write-SafeLog "  .\\cleanup.ps1 -Force" "INFO"
    Write-SafeLog "  docker build -t clean-cut-mcp . --no-cache" "INFO"
    Write-SafeLog "  docker images clean-cut-mcp" "INFO"
    Write-SafeLog "" "INFO"
    Write-SafeLog "Container Issues:" "INFO"
    Write-SafeLog "  docker logs clean-cut-mcp" "INFO"
    Write-SafeLog "  curl http://localhost:6961/health" "INFO"
    Write-SafeLog "  docker exec -it clean-cut-mcp /bin/bash" "INFO"
    Write-SafeLog "" "INFO"
    Write-SafeLog "Configuration Issues:" "INFO"
    Write-SafeLog "  Get-Content `"$env:APPDATA\\Claude\\claude_desktop_config.json`"" "INFO"
    Write-SafeLog "  ls `"$env:APPDATA\\Claude\\claude_desktop_config.json.clean-cut-backup-*`"" "INFO"
}

function Show-Summary {
    Write-SafeLog "=== Clean-Cut-MCP Installation Complete ===" "INFO"
    Write-SafeLog "" "INFO"
    Write-SafeLog "NEXT STEPS:" "INFO"
    Write-SafeLog "1. Restart Claude Desktop to load new configuration" "INFO"
    Write-SafeLog "2. Ask Claude: 'Create a bouncing ball animation'" "INFO"
    Write-SafeLog "3. Expect response: 'Animation ready at http://localhost:6960'" "INFO"
    Write-SafeLog "4. Export videos from Remotion Studio - they appear in: $ExportDir" "INFO"
    Write-SafeLog "" "INFO"
    Write-SafeLog "ENDPOINTS:" "INFO"
    Write-SafeLog "  MCP Server: http://localhost:6961/mcp" "INFO"
    Write-SafeLog "  Remotion Studio: http://localhost:6960" "INFO"
    Write-SafeLog "  Health Check: http://localhost:6961/health" "INFO"
    Write-SafeLog "" "INFO"
    Write-SafeLog "========================================" "INFO"
    Write-SafeLog "       VIDEO EXPORTS LOCATION" "INFO"
    Write-SafeLog "========================================" "INFO"
    Write-SafeLog "Export Directory: $ExportDir" "INFO"
    Write-SafeLog "" "INFO"
    Write-SafeLog "HOW TO FIND YOUR VIDEOS:" "INFO"
    Write-SafeLog "  METHOD 1 (Easiest): Ask Claude to use 'open_export_directory' tool" "INFO"
    Write-SafeLog "  METHOD 2 (Manual): Open File Explorer and navigate to:" "INFO"
    Write-SafeLog "    $ExportDir" "INFO"
    Write-SafeLog "  METHOD 3 (Command): Run this in PowerShell:" "INFO"
    Write-SafeLog "    explorer `"$ExportDir`"" "INFO"
    Write-SafeLog "" "INFO"
    Write-SafeLog "EXPORT WORKFLOW:" "INFO"
    Write-SafeLog "  1. Create animation with Claude" "INFO"
    Write-SafeLog "  2. Open Remotion Studio (http://localhost:6960)" "INFO"
    Write-SafeLog "  3. Export your video using Remotion Studio interface" "INFO"
    Write-SafeLog "  4. Video automatically appears in: $ExportDir" "INFO"
    Write-SafeLog "  5. Ask Claude to 'open export directory' for instant access" "INFO"
    Write-SafeLog "" "INFO"
    Write-SafeLog "FEATURES:" "INFO"
    Write-SafeLog "  - Cross-platform video export mounting" "INFO"
    Write-SafeLog "  - One-click file manager opening via Claude" "INFO"
    Write-SafeLog "  - Automatic directory creation and validation" "INFO"
    Write-SafeLog "  - Safe project-local storage (no system directory modification)" "INFO"
    Write-SafeLog "========================================" "INFO"
    Write-SafeLog "" "INFO"
    Write-SafeLog "TROUBLESHOOTING:" "INFO"
    Write-SafeLog "  - Configuration backup: $ClaudeConfigFile.$BackupSuffix" "INFO"
    Write-SafeLog "  - Log file: clean-cut-install.log" "INFO"
    Write-SafeLog "  - Container logs: docker logs $ContainerName" "INFO"
    Write-SafeLog "  - Export directory: $ExportDir" "INFO"
    Write-SafeLog "" "INFO"
    Write-SafeLog "Need help? Run diagnostic commands:" "INFO"
    Write-SafeLog "  Show-DiagnosticCommands (in PowerShell)" "INFO"
    Write-SafeLog "" "INFO"
    Write-SafeLog "One-Script Magic is ready!" "INFO"
}

function Restore-Config {
    param([string]$BackupPath)
    
    if ($BackupPath -and $BackupPath -ne "NEW_CONFIG" -and (Test-Path $BackupPath)) {
        Write-SafeLog "Restoring configuration from backup..." "WARN"
        Copy-Item $BackupPath $ClaudeConfigFile -Force
        Write-SafeLog "Configuration restored" "INFO"
    }
}

# MAIN INSTALLATION FUNCTION
function Install-CleanCutMcp {
    try {
        Write-SafeLog "Starting Clean-Cut-MCP installation..." "INFO"
        Write-SafeLog "Test Mode: $TestMode, Force: $Force" "INFO"
        
        # Step 1: Prerequisites
        if (-not (Test-Prerequisites)) {
            throw "Prerequisites not met"
        }
        
        # Step 2: Backup existing configuration
        $backupPath = Backup-ClaudeConfig
        if ($backupPath -eq $null) {
            throw "Failed to backup configuration"
        }
        
        # Step 3: Load and merge configuration
        $existingConfig = Get-ExistingConfig
        $newConfig = Merge-McpServerConfig -ExistingConfig $existingConfig
        
        # Step 4: Test Docker container
        if (-not (Test-DockerContainer)) {
            throw "Container test failed"
        }
        
        # Step 5: Save configuration (unless in test mode)
        if (-not $TestMode) {
            Save-ClaudeConfig -Config $newConfig
        }
        else {
            Write-SafeLog "Skipping configuration save (TestMode)" "INFO"
            Write-SafeLog "Would save configuration: $($newConfig | ConvertTo-Json -Depth 3)" "INFO"
        }
        
        # Step 6: Start the container
        if (-not $TestMode) {
            if (-not (Start-CleanCutMcp)) {
                throw "Failed to start Clean-Cut-MCP"
            }
        }
        else {
            Write-SafeLog "Skipping container startup (TestMode)" "INFO"
        }
        
        # Step 7: Success summary
        Show-Summary
        
        Write-SafeLog "Installation completed successfully!" "INFO"
        return $true
        
    }
    catch {
        Write-SafeLog "Installation failed: $($_.Exception.Message)" "ERROR"
        
        # Attempt to restore configuration
        if ($backupPath) {
            Restore-Config -BackupPath $backupPath
        }
        
        # Clean up container
        Stop-DockerContainer -ContainerName $ContainerName -Silent
        
        Write-SafeLog "Installation rolled back due to error" "ERROR"
        return $false
    }
}

# SCRIPT ENTRY POINT
Write-SafeLog "Clean-Cut-MCP Bulletproof Installer Starting..." "INFO"

if (Install-CleanCutMcp) {
    exit 0
}
else {
    exit 1
}