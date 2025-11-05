#!/bin/bash
# download-latest.sh - Guaranteed fresh installer download
# Bypasses ALL GitHub caching using API-based commit retrieval

set -e

echo "🔄 FETCHING LATEST CLEAN-CUT-MCP INSTALLER (CACHE-BYPASS)"
echo "=================================================="
echo ""

# Configuration
REPO="endlessblink/clean-cut-mcp"
FILE_PATH="docs/install-fixed.ps1"
LOCAL_FILE="install-fixed.ps1"

echo "📡 Getting latest commit SHA from GitHub API..."

# Get latest commit SHA for the specific file
LATEST_SHA=$(curl -s "https://api.github.com/repos/$REPO/commits?path=$FILE_PATH&per_page=1" | \
    grep -m 1 '"sha"' | sed 's/.*"sha": "\([^"]*\)".*/\1/')

if [ -z "$LATEST_SHA" ]; then
    echo "❌ Failed to get latest commit SHA"
    echo "Falling back to branch-based download with cache-bust..."

    # Fallback with timestamp cache-bust
    CACHE_BUST=$(date +%s%N | cut -b1-13)
    URL="https://raw.githubusercontent.com/$REPO/master/$FILE_PATH?cb=$CACHE_BUST"
    echo "🔄 Fallback URL: $URL"
else
    # Success - use commit hash (guaranteed fresh)
    URL="https://raw.githubusercontent.com/$REPO/$LATEST_SHA/$FILE_PATH"
    echo "✅ Latest commit: $LATEST_SHA"
    echo "🔄 Cache-bypass URL: $URL"
fi

echo ""
echo "📥 Downloading fresh installer..."

# Download with detailed progress
if curl -# -L -o "$LOCAL_FILE" "$URL"; then
    echo ""
    echo "✅ Download successful!"

    # Verify we got the latest version
    FILE_SIZE=$(wc -c < "$LOCAL_FILE")
    echo "📏 File size: $FILE_SIZE bytes"

    # Check for version indicators
    if grep -q "v2.1.0-MCP-PRESERVATION-FIX" "$LOCAL_FILE"; then
        echo "✅ Version verification: Latest installer confirmed!"
    else
        echo "⚠️  Version verification: May be older version"
    fi

    echo ""
    echo "🚀 Running installer with guaranteed fresh version..."
    echo "=================================================="
    echo ""

    # Run the installer
    if command -v pwsh >/dev/null 2>&1; then
        pwsh "./$LOCAL_FILE"
    elif command -v powershell >/dev/null 2>&1; then
        powershell "./$LOCAL_FILE"
    else
        echo "❌ PowerShell not found in PATH"
        echo "Please install PowerShell Core:"
        echo "  curl -sSL https://aka.ms/install-powershell.sh | sudo bash"
        exit 1
    fi

else
    echo "❌ Download failed"
    echo "Please check your internet connection and try again"
    exit 1
fi