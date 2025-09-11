@echo off
echo ==========================================
echo RESTORE CLAUDE DESKTOP CONFIG
echo ==========================================
echo.

echo [RESTORE] Fixing broken Claude Desktop configuration...

echo Copying fixed config to Claude Desktop...
copy "claude_desktop_config_fixed.json" "%APPDATA%\Claude\claude_desktop_config.json"

if %errorlevel% neq 0 (
    echo [ERROR] Failed to restore config!
    pause
    exit /b 1
)

echo.
echo [OK] Claude Desktop config restored with:
echo   - desktop-commander: Working
echo   - rough-cuts-mcp: Added properly
echo.
echo NEXT: Restart Claude Desktop to apply changes
echo.
pause