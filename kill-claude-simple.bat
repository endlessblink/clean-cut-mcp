@echo off
echo Kill Claude Desktop + Clear Cache
echo ==================================

echo Killing Claude Desktop processes...
taskkill /F /IM "Claude.exe" >nul 2>&1
taskkill /F /IM "claude.exe" >nul 2>&1
taskkill /F /IM "Claude Desktop.exe" >nul 2>&1
taskkill /F /IM "claude-desktop.exe" >nul 2>&1

echo Processes killed.

echo.
echo Clearing Claude Desktop cache...

if exist "%LOCALAPPDATA%\Claude\Logs" (
    echo Clearing logs...
    rmdir /s /q "%LOCALAPPDATA%\Claude\Logs" 2>nul
    mkdir "%LOCALAPPDATA%\Claude\Logs" 2>nul
)

if exist "%LOCALAPPDATA%\Claude\Cache" (
    echo Clearing cache...
    rmdir /s /q "%LOCALAPPDATA%\Claude\Cache" 2>nul
)

if exist "%LOCALAPPDATA%\Claude\Local Storage" (
    echo Clearing local storage...
    rmdir /s /q "%LOCALAPPDATA%\Claude\Local Storage" 2>nul
)

if exist "%LOCALAPPDATA%\Claude\Session Storage" (
    echo Clearing session storage...
    rmdir /s /q "%LOCALAPPDATA%\Claude\Session Storage" 2>nul
)

if exist "%LOCALAPPDATA%\Claude\IndexedDB" (
    echo Clearing IndexedDB...
    rmdir /s /q "%LOCALAPPDATA%\Claude\IndexedDB" 2>nul
)

echo.
echo COMPLETE! Cache cleared and processes killed.
echo You can now restart Claude Desktop.
echo Enhanced clean-cut-mcp tools will be available.
echo.
pause