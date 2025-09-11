@echo off
echo ==========================================
echo TEMPLATE-BASED CLAUDE CONFIGURATION
echo ==========================================
echo.

echo Available configurations:
echo 1. Minimal (desktop-commander only)
echo 2. With Clean-Cut-MCP (desktop-commander + Clean-Cut-MCP)  
echo 3. Clean-Cut-MCP only
echo.

set /p choice="Choose configuration (1-3): "

if "%choice%"=="1" (
    set template_file=claude_config_minimal.json
    echo Using minimal configuration...
) else if "%choice%"=="2" (
    set template_file=claude_config_with_clean_cut.json
    echo Using configuration with Clean-Cut-MCP...
) else if "%choice%"=="3" (
    set template_file=claude_config_clean_cut_only.json
    echo Using Clean-Cut-MCP only configuration...
) else (
    echo Invalid choice! Exiting.
    pause
    exit /b 1
)

echo.
echo [STEP 1] Killing Claude processes...
taskkill /f /im Claude.exe /t >nul 2>&1

echo [STEP 2] Creating backup...
if exist "%APPDATA%\Claude\claude_desktop_config.json" (
    copy "%APPDATA%\Claude\claude_desktop_config.json" "%APPDATA%\Claude\claude_desktop_config.json.template-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%" >nul 2>&1
    echo [OK] Backup created
)

echo [STEP 3] Applying template configuration...
copy "templates\%template_file%" "%APPDATA%\Claude\claude_desktop_config.json" >nul 2>&1

if %errorlevel% neq 0 (
    echo [ERROR] Failed to apply template!
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Configuration applied successfully!
echo Template used: %template_file%
echo.
echo Configuration includes:
if "%choice%"=="1" echo   - desktop-commander: Working
if "%choice%"=="2" (
    echo   - desktop-commander: Working
    echo   - clean-cut-mcp: Ready for One-Script Magic
)
if "%choice%"=="3" echo   - clean-cut-mcp: Ready for One-Script Magic
echo.
echo NEXT: Start Claude Desktop and test configuration
echo.
pause