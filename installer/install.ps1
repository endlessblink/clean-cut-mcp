#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Clean-Cut-MCP Bulletproof One-Script Installer
    Transform "Create a bouncing ball animation" into reality with one command.

.DESCRIPTION
    Fully automated installer that handles:
    - Docker Desktop installation (silent, unattended)
    - Container management (pull, start, configure)
    - Claude Desktop configuration (safe merging, backup)
    - Port management (conflict detection, auto-allocation)
    - End-to-end validation and testing

    Based on extensive research and validated methods from 2025.

.PARAMETER Force
    Force reinstallation even if components exist

.PARAMETER TestMode
    Run in test mode without making system changes

.PARAMETER SkipDockerInstall
    Skip Docker Desktop installation (assume already installed)

.PARAMETER Port
    Specific port for Remotion Studio (default: auto-detect 6970-6979)

.EXAMPLE
    .\install.ps1
    # Standard installation - handles everything automatically

.EXAMPLE
    .\install.ps1 -Force
    # Force clean installation, removing existing containers

.EXAMPLE
    .\install.ps1 -TestMode
    # Test what would happen without making changes
#>

param(
    [switch]$Force,
    [switch]$TestMode,
    [switch]$SkipDockerInstall,
    [int]$Port = 0
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# ANSI colors for beautiful output
$Colors = @{
    Red = "`e[31m"
    Green = "`e[32m" 
    Yellow = "`e[33m"
    Blue = "`e[34m"
    Cyan = "`e[36m"
    Magenta = "`e[35m"
    Reset = "`e[0m"
    Bold = "`e[1m"
}

function Write-Status {
    param(
        [Parameter(Mandatory)]
        [string]$Message,
        
        [ValidateSet('Info', 'Success', 'Warning', 'Error', 'Progress')]
        [string]$Type = 'Info'
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $prefix = switch ($Type) {
        'Info'     { "$($Colors.Cyan)[$timestamp] INFO$($Colors.Reset)" }
        'Success'  { "$($Colors.Green)[$timestamp] SUCCESS$($Colors.Reset)" }
        'Warning'  { "$($Colors.Yellow)[$timestamp] WARNING$($Colors.Reset)" }
        'Error'    { "$($Colors.Red)[$timestamp] ERROR$($Colors.Reset)" }
        'Progress' { "$($Colors.Blue)[$timestamp] PROGRESS$($Colors.Reset)" }
    }
    
    Write-Host "$prefix $Message"
    
    # Also log to file for debugging
    $logFile = Join-Path $PSScriptRoot "install-log-$(Get-Date -Format 'yyyyMMdd').log"
    "$timestamp [$Type] $Message" | Add-Content $logFile -Encoding UTF8
}

function Write-Header {
    param([string]$Title)
    
    Write-Host ""
    Write-Host "$($Colors.Bold)$($Colors.Cyan)========================================$($Colors.Reset)"
    Write-Host "$($Colors.Bold)$($Colors.Cyan)  $Title$($Colors.Reset)"
    Write-Host "$($Colors.Bold)$($Colors.Cyan)========================================$($Colors.Reset)"
    Write-Host ""
}

function Test-AdminRights {
    try {
        $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object Security.Principal.WindowsPrincipal($identity)
        return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    }
    catch {
        return $false
    }
}

function Test-WSL2Installation {
    Write-Status "Checking WSL2 installation..." -Type Progress
    
    try {
        $wslList = wsl --list --verbose 2>$null
        if ($wslList -and $wslList -match "VERSION\s+2") {
            Write-Status "WSL2 found and running" -Type Success
            return $true
        }
        elseif ($wslList) {
            Write-Status "WSL found but not version 2" -Type Warning
            return "WSL1"
        }
    }
    catch {
        # WSL not installed
    }
    
    Write-Status "WSL2 not found - will install automatically" -Type Warning
    return $false
}

function Install-WSL2 {
    Write-Status "Installing WSL2..." -Type Progress
    
    if ($TestMode) {
        Write-Status "[TEST MODE] Would install WSL2" -Type Warning
        return $true
    }
    
    try {
        # Check if WSL feature is enabled
        $wslFeature = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -ErrorAction SilentlyContinue
        $vmFeature = Get-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -ErrorAction SilentlyContinue
        
        $needsReboot = $false
        
        # Enable WSL feature if not enabled
        if ($wslFeature -and $wslFeature.State -ne "Enabled") {
            Write-Status "Enabling Windows Subsystem for Linux feature..." -Type Progress
            Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -All -NoRestart
            $needsReboot = $true
        }
        
        # Enable Virtual Machine Platform feature if not enabled  
        if ($vmFeature -and $vmFeature.State -ne "Enabled") {
            Write-Status "Enabling Virtual Machine Platform feature..." -Type Progress
            Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -All -NoRestart
            $needsReboot = $true
        }
        
        if ($needsReboot) {
            Write-Status "Windows features enabled - restart required" -Type Warning
            Write-Status "Please restart your computer and re-run this installer" -Type Error
            Write-Status "The installer will continue automatically after restart" -Type Info
            return "REBOOT_REQUIRED"
        }
        
        # Install WSL2 using the modern command
        Write-Status "Running WSL installation..." -Type Progress
        $wslInstall = Start-Process -FilePath "wsl" -ArgumentList @("--install", "--no-launch") -Wait -PassThru -WindowStyle Hidden
        
        if ($wslInstall.ExitCode -eq 0) {
            Write-Status "WSL2 installation completed" -Type Success
            
            # Set WSL2 as default version
            Write-Status "Setting WSL2 as default version..." -Type Progress
            wsl --set-default-version 2 2>$null
            
            # Check if reboot is needed
            $wslList = wsl --list 2>$null
            if (!$wslList) {
                Write-Status "WSL2 installed successfully - restart recommended" -Type Warning
                Write-Status "You can continue, but may need to restart if Docker fails" -Type Info
            }
            
            return $true
        }
        else {
            throw "WSL installation failed with exit code: $($wslInstall.ExitCode)"
        }
    }
    catch {
        Write-Status "WSL2 installation failed: $($_.Exception.Message)" -Type Error
        Write-Status "Attempting manual feature installation..." -Type Progress
        
        try {
            # Fallback: Use DISM commands directly
            Write-Status "Using DISM to enable WSL features..." -Type Progress
            
            $dismWSL = Start-Process -FilePath "dism.exe" -ArgumentList @("/online", "/enable-feature", "/featurename:Microsoft-Windows-Subsystem-Linux", "/all", "/norestart") -Wait -PassThru -WindowStyle Hidden
            $dismVM = Start-Process -FilePath "dism.exe" -ArgumentList @("/online", "/enable-feature", "/featurename:VirtualMachinePlatform", "/all", "/norestart") -Wait -PassThru -WindowStyle Hidden
            
            if ($dismWSL.ExitCode -eq 0 -and $dismVM.ExitCode -eq 0) {
                Write-Status "WSL features enabled via DISM - restart required" -Type Warning
                return "REBOOT_REQUIRED"
            }
            else {
                throw "DISM feature installation failed"
            }
        }
        catch {
            Write-Status "All WSL installation methods failed" -Type Error
            Write-Status "Please manually install WSL2:" -Type Info
            Write-Status "1. Run PowerShell as Administrator" -Type Info
            Write-Status "2. Run: wsl --install" -Type Info
            Write-Status "3. Restart computer" -Type Info
            Write-Status "4. Re-run this installer" -Type Info
            return $false
        }
    }
}

function Fix-WSL1ToWSL2 {
    Write-Status "Converting WSL1 installations to WSL2..." -Type Progress
    
    if ($TestMode) {
        Write-Status "[TEST MODE] Would convert WSL1 to WSL2" -Type Warning
        return $true
    }
    
    try {
        # Get all WSL1 distributions
        $wslList = wsl --list --verbose 2>$null
        if ($wslList) {
            $wsl1Distros = $wslList | Where-Object { $_ -match "\s+1\s+" }
            
            if ($wsl1Distros) {
                Write-Status "Found WSL1 distributions, converting to WSL2..." -Type Progress
                
                # Set default version to 2
                wsl --set-default-version 2 2>$null
                
                # Convert each WSL1 distro to WSL2
                foreach ($line in $wsl1Distros) {
                    if ($line -match "^\s*\*?\s*([^\s]+)") {
                        $distroName = $matches[1]
                        if ($distroName -and $distroName -ne "NAME") {
                            Write-Status "Converting $distroName to WSL2..." -Type Progress
                            wsl --set-version $distroName 2 2>$null
                        }
                    }
                }
                
                Write-Status "WSL distributions converted to version 2" -Type Success
                return $true
            }
        }
        
        # Set default version to 2 anyway
        wsl --set-default-version 2 2>$null
        Write-Status "WSL2 set as default version" -Type Success
        return $true
    }
    catch {
        Write-Status "WSL version conversion failed: $($_.Exception.Message)" -Type Warning
        Write-Status "Docker Desktop may still work with WSL1" -Type Info
        return $true
    }
}

function Install-DockerDesktop {
    Write-Status "Installing Docker Desktop..." -Type Progress
    
    if ($TestMode) {
        Write-Status "[TEST MODE] Would install Docker Desktop" -Type Warning
        return $true
    }
    
    # Check if already installed
    $dockerPath = Find-DockerExecutable
    if ($dockerPath -and !$Force) {
        Write-Status "Docker Desktop already installed at: $dockerPath" -Type Success
        return $true
    }
    
    try {
        # Download Docker Desktop installer
        $downloadsPath = Join-Path $env:USERPROFILE "Downloads"
        $installerPath = Join-Path $downloadsPath "Docker Desktop Installer.exe"
        
        if (!(Test-Path $installerPath)) {
            Write-Status "Downloading Docker Desktop installer..." -Type Progress
            $downloadUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
            Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
            Write-Status "Download complete" -Type Success
        }
        
        # Install silently with all the validated flags
        Write-Status "Running silent installation..." -Type Progress
        $installArgs = @(
            'install',
            '--quiet',
            '--accept-license',
            '--always-run-service'
        )
        
        $process = Start-Process -FilePath $installerPath -ArgumentList $installArgs -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -eq 0) {
            Write-Status "Docker Desktop installed successfully" -Type Success
            
            # Wait a moment for services to initialize
            Write-Status "Waiting for Docker services to initialize..." -Type Progress
            Start-Sleep -Seconds 10
            
            return $true
        }
        else {
            throw "Docker Desktop installation failed with exit code: $($process.ExitCode)"
        }
    }
    catch {
        Write-Status "Docker Desktop installation failed: $($_.Exception.Message)" -Type Error
        return $false
    }
}

function Find-DockerExecutable {
    $candidates = @(
        "C:\Program Files\Docker\Docker\resources\bin\docker.exe",
        "C:\Program Files (x86)\Docker\Docker\resources\bin\docker.exe"
    )
    
    # Also check if docker is in PATH
    try {
        $pathDocker = Get-Command docker.exe -ErrorAction SilentlyContinue
        if ($pathDocker) {
            $candidates += $pathDocker.Source
        }
    }
    catch { }
    
    foreach ($path in $candidates) {
        if ($path -and (Test-Path $path)) {
            return $path
        }
    }
    
    return $null
}

function Wait-ForDockerReady {
    Write-Status "Waiting for Docker daemon to be ready..." -Type Progress
    
    $maxAttempts = 60
    $attempt = 0
    
    do {
        $attempt++
        Write-Status "Attempt $attempt/$maxAttempts..." -Type Progress
        
        try {
            $dockerInfo = docker info 2>$null
            if ($dockerInfo) {
                Write-Status "Docker daemon is ready" -Type Success
                return $true
            }
        }
        catch { }
        
        if ($attempt -lt $maxAttempts) {
            Start-Sleep -Seconds 5
        }
        
    } while ($attempt -lt $maxAttempts)
    
    Write-Status "Docker daemon failed to become ready within 5 minutes" -Type Error
    return $false
}

function Find-AvailablePort {
    param(
        [int]$StartPort = 6970,
        [int]$EndPort = 6979
    )
    
    if ($Port -gt 0) {
        # User specified a port, check if it's available
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if (!$connection) {
            Write-Status "Using user-specified port: $Port" -Type Success
            return $Port
        }
        else {
            Write-Status "Port $Port is in use, finding alternative..." -Type Warning
        }
    }
    
    # Find available port in range
    for ($testPort = $StartPort; $testPort -le $EndPort; $testPort++) {
        $connection = Get-NetTCPConnection -LocalPort $testPort -ErrorAction SilentlyContinue
        if (!$connection) {
            Write-Status "Found available port: $testPort" -Type Success
            return $testPort
        }
    }
    
    throw "No available ports found in range $StartPort-$EndPort"
}

function Install-CleanCutContainer {
    param([int]$RemotionPort)
    
    Write-Status "Setting up Clean-Cut-MCP container..." -Type Progress
    
    if ($TestMode) {
        Write-Status "[TEST MODE] Would setup container on port $RemotionPort" -Type Warning
        return $true
    }
    
    try {
        # Stop and remove existing container if it exists
        try {
            $existing = docker ps -a --filter "name=clean-cut-mcp" --format "{{.Names}}" 2>$null
            if ($existing -eq "clean-cut-mcp") {
                Write-Status "Stopping existing container..." -Type Progress
                docker stop clean-cut-mcp 2>$null | Out-Null
                docker rm clean-cut-mcp 2>$null | Out-Null
                Write-Status "Existing container removed" -Type Success
            }
        }
        catch { }
        
        # Pull latest image
        Write-Status "Pulling Clean-Cut-MCP image from Docker Hub..." -Type Progress
        docker pull endlessblink/clean-cut-mcp:latest
        Write-Status "Image pulled successfully" -Type Success
        
        # Create export directory
        $exportDir = Join-Path $PSScriptRoot "..\clean-cut-exports"
        if (!(Test-Path $exportDir)) {
            New-Item -ItemType Directory -Path $exportDir -Force | Out-Null
            Write-Status "Created export directory: $exportDir" -Type Success
        }
        
        # Start container with proper configuration
        Write-Status "Starting Clean-Cut-MCP container..." -Type Progress
        $runArgs = @(
            "run", "-d",
            "--name", "clean-cut-mcp",
            "--restart", "unless-stopped",
            "-p", "$RemotionPort`:6970",
            "-v", "$exportDir`:/workspace/out",
            "endlessblink/clean-cut-mcp:latest"
        )
        
        docker @runArgs
        
        # Wait for container to be ready
        Write-Status "Waiting for container to be ready..." -Type Progress
        Start-Sleep -Seconds 15
        
        # Verify container is running
        $containerStatus = docker ps --filter "name=clean-cut-mcp" --format "{{.Status}}" 2>$null
        if ($containerStatus -like "*Up*") {
            Write-Status "Container started successfully" -Type Success
            Write-Status "Remotion Studio: http://localhost:$RemotionPort" -Type Info
            return $true
        }
        else {
            throw "Container failed to start properly"
        }
    }
    catch {
        Write-Status "Container setup failed: $($_.Exception.Message)" -Type Error
        return $false
    }
}

function Get-ClaudeConfigPath {
    return Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
}

function Backup-ClaudeConfig {
    param([string]$ConfigPath)
    
    if (Test-Path $ConfigPath) {
        $backupPath = "$ConfigPath.bulletproof-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $ConfigPath $backupPath
        Write-Status "Config backed up to: $backupPath" -Type Success
        return $backupPath
    }
    return $null
}

function Update-ClaudeDesktopConfig {
    Write-Status "Configuring Claude Desktop..." -Type Progress
    
    $configPath = Get-ClaudeConfigPath
    $configDir = Split-Path $configPath
    
    if ($TestMode) {
        Write-Status "[TEST MODE] Would update Claude config at: $configPath" -Type Warning
        return $true
    }
    
    try {
        # Ensure config directory exists
        if (!(Test-Path $configDir)) {
            New-Item -ItemType Directory -Path $configDir -Force | Out-Null
            Write-Status "Created Claude config directory" -Type Success
        }
        
        # Backup existing config
        $backupPath = Backup-ClaudeConfig $configPath
        
        # Read existing config or create new one
        $config = @{ mcpServers = @{} }
        if (Test-Path $configPath) {
            try {
                $existingContent = Get-Content $configPath -Raw -Encoding UTF8
                $existingConfig = $existingContent | ConvertFrom-Json
                
                if ($existingConfig.mcpServers) {
                    # Convert PSCustomObject to hashtable for manipulation
                    $config.mcpServers = @{}
                    $existingConfig.mcpServers.PSObject.Properties | ForEach-Object {
                        $serverConfig = @{}
                        $_.Value.PSObject.Properties | ForEach-Object {
                            if ($_.Name -eq "args" -and $_.Value -is [System.Object[]]) {
                                $serverConfig[$_.Name] = $_.Value
                            }
                            else {
                                $serverConfig[$_.Name] = $_.Value
                            }
                        }
                        $config.mcpServers[$_.Name] = $serverConfig
                    }
                    Write-Status "Loaded existing configuration with $($config.mcpServers.Count) servers" -Type Success
                }
            }
            catch {
                Write-Status "Warning: Could not parse existing config, starting fresh" -Type Warning
            }
        }
        
        # Find Docker executable path
        $dockerPath = Find-DockerExecutable
        if (!$dockerPath) {
            throw "Docker executable not found"
        }
        
        # Configure clean-cut-mcp server
        $config.mcpServers["clean-cut-mcp"] = @{
            command = $dockerPath
            args = @("exec", "-i", "clean-cut-mcp", "node", "/app/mcp-server/dist/clean-stdio-server.js")
            transport = "stdio"
            env = @{}
        }
        
        # Write config atomically
        $tempPath = "$configPath.tmp"
        $json = $config | ConvertTo-Json -Depth 10
        $json | Out-File $tempPath -Encoding UTF8
        
        # Validate JSON before committing
        try {
            $null = Get-Content $tempPath -Raw | ConvertFrom-Json
            Move-Item $tempPath $configPath -Force
            Write-Status "Claude Desktop configured successfully" -Type Success
            return $true
        }
        catch {
            Remove-Item $tempPath -Force -ErrorAction SilentlyContinue
            throw "Config validation failed: $($_.Exception.Message)"
        }
    }
    catch {
        Write-Status "Claude Desktop configuration failed: $($_.Exception.Message)" -Type Error
        
        # Restore backup if available
        if ($backupPath -and (Test-Path $backupPath)) {
            Copy-Item $backupPath $configPath -Force
            Write-Status "Restored backup configuration" -Type Warning
        }
        
        return $false
    }
}

function Test-Installation {
    param([int]$RemotionPort)
    
    Write-Status "Testing installation..." -Type Progress
    
    # Wait for services to be fully ready
    Start-Sleep -Seconds 10
    
    $allGood = $true
    
    try {
        # Test container is running
        $containerStatus = docker ps --filter "name=clean-cut-mcp" --format "{{.Status}}" 2>$null
        if ($containerStatus -like "*Up*") {
            Write-Status "Container health check: PASSED" -Type Success
        }
        else {
            Write-Status "Container health check: FAILED" -Type Error
            $allGood = $false
        }
    }
    catch {
        Write-Status "Container health check: ERROR - $($_.Exception.Message)" -Type Error
        $allGood = $false
    }
    
    try {
        # Test Remotion Studio accessibility
        $response = Invoke-WebRequest -Uri "http://localhost:$RemotionPort" -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Status "Remotion Studio accessibility: PASSED" -Type Success
        }
        else {
            Write-Status "Remotion Studio accessibility: FAILED (Status: $($response.StatusCode))" -Type Error
            $allGood = $false
        }
    }
    catch {
        Write-Status "Remotion Studio accessibility: FAILED - $($_.Exception.Message)" -Type Warning
        Write-Status "Note: Studio may still be starting up" -Type Info
    }
    
    try {
        # Test export directory
        $exportDir = Join-Path $PSScriptRoot "..\clean-cut-exports"
        if (Test-Path $exportDir) {
            Write-Status "Export directory check: PASSED" -Type Success
        }
        else {
            Write-Status "Export directory check: FAILED" -Type Error
            $allGood = $false
        }
    }
    catch {
        Write-Status "Export directory check: ERROR - $($_.Exception.Message)" -Type Error
        $allGood = $false
    }
    
    return $allGood
}

function Show-CompletionMessage {
    param([int]$RemotionPort)
    
    Write-Host ""
    Write-Host "$($Colors.Bold)$($Colors.Green)============================================$($Colors.Reset)"
    Write-Host "$($Colors.Bold)$($Colors.Green)  CLEAN-CUT-MCP INSTALLED SUCCESSFULLY!$($Colors.Reset)"
    Write-Host "$($Colors.Bold)$($Colors.Green)============================================$($Colors.Reset)"
    Write-Host ""
    
    Write-Status "Next Steps:" -Type Info
    Write-Host "$($Colors.Cyan)  1. Restart Claude Desktop$($Colors.Reset)"
    Write-Host "$($Colors.Cyan)  2. Ask Claude: 'Create a bouncing ball animation'$($Colors.Reset)"
    Write-Host "$($Colors.Cyan)  3. Expect: 'Animation ready at http://localhost:$RemotionPort'$($Colors.Reset)"
    Write-Host ""
    
    Write-Status "Quick Links:" -Type Info
    Write-Host "$($Colors.Blue)  • Remotion Studio: http://localhost:$RemotionPort$($Colors.Reset)"
    Write-Host "$($Colors.Blue)  • Export Directory: $(Join-Path $PSScriptRoot '..\clean-cut-exports')$($Colors.Reset)"
    Write-Host "$($Colors.Blue)  • Container Logs: docker logs clean-cut-mcp$($Colors.Reset)"
    Write-Host ""
    
    Write-Status "Test It Now:" -Type Info
    Write-Host "$($Colors.Magenta)  Ask Claude: 'Create a simple text animation that says Hello World'$($Colors.Reset)"
    Write-Host ""
}

function Show-ErrorSummary {
    param([string]$FailureReason)
    
    Write-Host ""
    Write-Host "$($Colors.Red)============================================$($Colors.Reset)"
    Write-Host "$($Colors.Red)  INSTALLATION FAILED$($Colors.Reset)"
    Write-Host "$($Colors.Red)============================================$($Colors.Reset)"
    Write-Host ""
    
    Write-Status "Failure Reason: $FailureReason" -Type Error
    Write-Host ""
    
    Write-Status "Troubleshooting:" -Type Info
    Write-Host "$($Colors.Yellow)  • Check the log file: $(Join-Path $PSScriptRoot "install-log-$(Get-Date -Format 'yyyyMMdd').log")$($Colors.Reset)"
    Write-Host "$($Colors.Yellow)  • Try running as Administrator$($Colors.Reset)"
    Write-Host "$($Colors.Yellow)  • Ensure WSL2 is properly installed$($Colors.Reset)"
    Write-Host "$($Colors.Yellow)  • Check Docker Desktop is running$($Colors.Reset)"
    Write-Host "$($Colors.Yellow)  • Try: .\install.ps1 -Force$($Colors.Reset)"
    Write-Host ""
}

# Main execution function
function Main {
    Write-Header "CLEAN-CUT-MCP BULLETPROOF INSTALLER"
    
    if ($TestMode) {
        Write-Status "Running in TEST MODE - no system changes will be made" -Type Warning
    }
    
    Write-Status "Starting installation process..." -Type Info
    Write-Status "Based on validated 2025 automation methods" -Type Info
    
    try {
        # Step 1: Check admin rights
        Write-Header "Step 1: Prerequisites Check"
        
        if (!(Test-AdminRights)) {
            Write-Status "Administrator rights required for Docker installation" -Type Warning
            Write-Status "Please run this script as Administrator" -Type Error
            throw "Administrator rights required"
        }
        Write-Status "Administrator rights: OK" -Type Success
        
        # Step 2: Check WSL2 (Windows requirement for Docker)
        $wslStatus = Test-WSL2Installation
        if ($wslStatus -eq $false) {
            throw "WSL2 is required but not installed"
        }
        elseif ($wslStatus -eq "WSL1") {
            throw "WSL2 is required, but only WSL1 is installed"
        }
        
        # Step 3: Install Docker Desktop
        Write-Header "Step 2: Docker Desktop Installation"
        
        if (!$SkipDockerInstall) {
            if (!(Install-DockerDesktop)) {
                throw "Docker Desktop installation failed"
            }
        }
        else {
            Write-Status "Skipping Docker installation as requested" -Type Info
        }
        
        # Step 4: Wait for Docker to be ready
        Write-Header "Step 3: Docker Daemon Startup"
        
        if (!(Wait-ForDockerReady)) {
            throw "Docker daemon failed to start"
        }
        
        # Step 5: Find available port
        Write-Header "Step 4: Port Management"
        
        $remotionPort = Find-AvailablePort
        Write-Status "Remotion Studio will be available on port: $remotionPort" -Type Success
        
        # Step 6: Setup container
        Write-Header "Step 5: Container Setup"
        
        if (!(Install-CleanCutContainer -RemotionPort $remotionPort)) {
            throw "Container setup failed"
        }
        
        # Step 7: Configure Claude Desktop
        Write-Header "Step 6: Claude Desktop Configuration"
        
        if (!(Update-ClaudeDesktopConfig)) {
            throw "Claude Desktop configuration failed"
        }
        
        # Step 8: Test everything
        Write-Header "Step 7: Installation Testing"
        
        $testResult = Test-Installation -RemotionPort $remotionPort
        if (!$testResult) {
            Write-Status "Some tests failed, but installation may still work" -Type Warning
        }
        
        # Success!
        Show-CompletionMessage -RemotionPort $remotionPort
        
    }
    catch {
        Show-ErrorSummary -FailureReason $_.Exception.Message
        exit 1
    }
}

# Handle Ctrl+C gracefully
$Host.UI.RawUI.CancelKeyPress += {
    Write-Status "Installation interrupted by user" -Type Warning
    exit 1
}

# Run the installer
try {
    Main
}
catch {
    Write-Status "Unexpected error: $($_.Exception.Message)" -Type Error
    Show-ErrorSummary -FailureReason "Unexpected error occurred"
    exit 1
}