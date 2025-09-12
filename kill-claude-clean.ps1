#!/usr/bin/env pwsh
# Kill All Claude Desktop Instances + Clear Cache
# Clean restart for MCP configuration reload

Write-Host "Kill Claude Desktop + Clear Cache" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Kill all Claude Desktop processes
$claudeProcesses = @("Claude", "claude", "Claude Desktop", "claude-desktop", "ClaudeDesktop")
$killedAny = $false

foreach ($processName in $claudeProcesses) {
    try {
        $processes = Get-Process -Name $processName -ErrorAction SilentlyContinue
        if ($processes) {
            Write-Host "Found $($processes.Count) instance(s) of '$processName'" -ForegroundColor Yellow
            
            foreach ($process in $processes) {
                try {
                    Stop-Process -Id $process.Id -Force -ErrorAction Stop
                    $killedAny = $true
                    Write-Host "Killed PID $($process.Id)" -ForegroundColor Green
                } catch {
                    Write-Host "Failed to kill PID $($process.Id)" -ForegroundColor Red
                }
            }
        }
    } catch {
        # Process name not found, continue
    }
}

if (-not $killedAny) {
    Write-Host "No Claude Desktop instances found running" -ForegroundColor Green
} else {
    Write-Host "Waiting 3 seconds for processes to terminate..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Write-Host "All Claude Desktop instances terminated" -ForegroundColor Green
}

# Clear Claude Desktop Cache and Logs
Write-Host ""
Write-Host "Clearing Claude Desktop Cache..." -ForegroundColor Yellow

$cacheLocations = @(
    "$env:LOCALAPPDATA\Claude\Logs",
    "$env:LOCALAPPDATA\Claude\Cache", 
    "$env:LOCALAPPDATA\Claude\Local Storage",
    "$env:LOCALAPPDATA\Claude\Session Storage",
    "$env:LOCALAPPDATA\Claude\IndexedDB"
)

$clearedAny = $false

foreach ($location in $cacheLocations) {
    if (Test-Path $location) {
        try {
            Write-Host "Clearing: $location" -ForegroundColor Yellow
            Remove-Item -Path "$location\*" -Recurse -Force -ErrorAction SilentlyContinue
            $clearedAny = $true
            Write-Host "Cleared cache at: $location" -ForegroundColor Green
        } catch {
            Write-Host "Could not clear: $location" -ForegroundColor Yellow
        }
    }
}

# Clear MCP logs specifically
$mcpLogs = Get-ChildItem -Path "$env:LOCALAPPDATA\Claude\Logs\mcp*.log" -ErrorAction SilentlyContinue
if ($mcpLogs) {
    Write-Host "Clearing MCP logs..." -ForegroundColor Yellow
    $mcpLogs | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "Cleared MCP logs" -ForegroundColor Green
    $clearedAny = $true
}

if (-not $clearedAny) {
    Write-Host "No cache files found to clear" -ForegroundColor Green
}

Write-Host ""
Write-Host "COMPLETE! Cache cleared and processes killed." -ForegroundColor Green
Write-Host "You can now restart Claude Desktop." -ForegroundColor Cyan
Write-Host "Enhanced clean-cut-mcp tools will be available." -ForegroundColor Cyan