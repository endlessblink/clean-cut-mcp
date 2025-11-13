# Clean-Cut-MCP Quick Installer - Bypasses PowerShell Execution Policy
# Usage: In PowerShell, run: powershell -ExecutionPolicy Bypass -File "install-quick.ps1"

Write-Host "🎬 CLEAN-CUT-MCP QUICK INSTALLER" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Step 1: Download main installer
Write-Host "📥 Downloading installer..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/endlessblink/clean-cut-mcp/master/install.ps1" -OutFile "install.ps1" -UseBasicParsing
    Write-Host "✅ Installer downloaded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to download installer: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Run installer with bypassed execution policy
Write-Host "🔧 Running installer..." -ForegroundColor Yellow
try {
    powershell -ExecutionPolicy Bypass -File "install.ps1"
} catch {
    Write-Host "❌ Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart Claude Desktop" -ForegroundColor White
Write-Host "2. Look for 'clean-cut-mcp' in available tools" -ForegroundColor White
Write-Host "3. Test with: 'Create a simple animation'" -ForegroundColor White
Write-Host ""
Write-Host "Remotion Studio: http://localhost:6970" -ForegroundColor Yellow
Write-Host ""