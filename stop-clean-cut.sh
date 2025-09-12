#!/bin/bash
# Clean-Cut-MCP Stop Script
# Safely stops and cleans up Clean-Cut-MCP containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="clean-cut-mcp"

echo -e "${BLUE}🛑 Clean-Cut-MCP Stop Script${NC}"
echo "================================"

# Check if container exists and is running
if docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}" | grep -q "${CONTAINER_NAME}"; then
    echo -e "${YELLOW}🔄 Stopping running container...${NC}"
    docker stop "$CONTAINER_NAME"
    echo -e "${GREEN}✅ Container stopped${NC}"
else
    echo "No running container found"
fi

# Remove container if it exists (running or stopped)
if docker ps -a --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}" | grep -q "${CONTAINER_NAME}"; then
    echo -e "${YELLOW}🗑️  Removing container...${NC}"
    docker rm "$CONTAINER_NAME"
    echo -e "${GREEN}✅ Container removed${NC}"
else
    echo "No container to remove"
fi

# Optional: Clean up Docker system (commented out for safety)
# echo -e "${YELLOW}🧹 Cleaning up Docker system...${NC}"
# docker container prune -f
# docker network prune -f
# echo -e "${GREEN}✅ Docker system cleaned${NC}"

echo -e "${GREEN}🎉 Clean-Cut-MCP stopped and cleaned up!${NC}"
echo ""
echo -e "${BLUE}💡 To start again, run: ./start-clean-cut.sh${NC}"