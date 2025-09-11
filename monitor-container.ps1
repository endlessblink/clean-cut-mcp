# Container Live Log Monitor for Clean-Cut-MCP
# Monitors the clean-cut-mcp container and shows real-time logs

param(
    [switch]$Follow = $true
)

Write-Host "=== Clean-Cut-MCP Container Monitor ===" -ForegroundColor Cyan
Write-Host "Monitoring container: clean-cut-mcp" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
Write-Host "=" * 50

# Check if container exists
$container = docker ps -a --filter "name=clean-cut-mcp" --format "{{.Names}}"
if (-not $container) {
    Write-Host "Container 'clean-cut-mcp' not found. Available containers:" -ForegroundColor Red
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    exit 1
}

# Show container status
Write-Host "Container Status:" -ForegroundColor Green
docker ps --filter "name=clean-cut-mcp" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host ""

# Start monitoring logs
if ($Follow) {
    Write-Host "Live logs (following):" -ForegroundColor Green
    docker logs -f clean-cut-mcp
} else {
    Write-Host "Recent logs:" -ForegroundColor Green
    docker logs clean-cut-mcp
}