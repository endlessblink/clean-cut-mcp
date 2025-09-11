# Quick rebuild and test script for Clean-Cut-MCP
# Rebuilds the Docker image and tests container startup

param(
    [switch]$NoCache,
    [switch]$TestOnly
)

Write-Host "=== Clean-Cut-MCP Rebuild and Test ===" -ForegroundColor Cyan

if (-not $TestOnly) {
    Write-Host "Step 1: Rebuilding Docker image..." -ForegroundColor Yellow
    $buildArgs = @("build", "-t", "clean-cut-mcp", ".")
    if ($NoCache) {
        $buildArgs += "--no-cache"
    }
    
    & docker @buildArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Docker build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Docker build completed successfully!" -ForegroundColor Green
}

Write-Host "Step 2: Testing container startup..." -ForegroundColor Yellow

# Stop and remove existing container
docker stop clean-cut-mcp 2>$null
docker rm clean-cut-mcp 2>$null

# Start new container in background
Write-Host "Starting container..." -ForegroundColor Yellow
docker run -d --name clean-cut-mcp -p 6960:6960 -p 6961:6961 clean-cut-mcp

# Wait a moment for startup
Start-Sleep -Seconds 3

# Check container status
Write-Host "Container status:" -ForegroundColor Yellow
docker ps --filter "name=clean-cut-mcp" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Show recent logs
Write-Host "Recent logs:" -ForegroundColor Yellow
docker logs clean-cut-mcp

Write-Host "Test complete! Use .\monitor-container.ps1 to watch live logs" -ForegroundColor Green