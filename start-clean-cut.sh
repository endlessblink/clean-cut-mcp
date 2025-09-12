#!/bin/bash
# Clean-Cut-MCP Container Management Script
# Prevents port conflicts by cleaning up old containers and verifying ports

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="clean-cut-mcp"
REMOTION_PORT=6970
MCP_PORT=6971
IMAGE_NAME="clean-cut-mcp"

echo -e "${BLUE}🚀 Clean-Cut-MCP Container Manager${NC}"
echo "=================================="

# Step 1: Clean up existing containers
echo -e "${YELLOW}📦 Cleaning up existing containers...${NC}"
if docker ps -a --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}" | grep -q "${CONTAINER_NAME}"; then
    echo "Found existing containers, removing..."
    docker ps -a --filter "name=${CONTAINER_NAME}" --format "{{.Names}}" | xargs -r docker rm -f
    echo -e "${GREEN}✅ Cleaned up existing containers${NC}"
else
    echo "No existing containers to clean up"
fi

# Step 2: Verify ports are available
echo -e "${YELLOW}🔍 Checking port availability...${NC}"
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ Port $port is already in use${NC}"
        echo "Process using port $port:"
        lsof -Pi :$port -sTCP:LISTEN
        return 1
    else
        echo -e "${GREEN}✅ Port $port is available${NC}"
        return 0
    fi
}

PORT_CHECK_FAILED=false
if ! check_port $REMOTION_PORT; then
    PORT_CHECK_FAILED=true
fi
if ! check_port $MCP_PORT; then
    PORT_CHECK_FAILED=true
fi

if [ "$PORT_CHECK_FAILED" = true ]; then
    echo -e "${RED}⚠️  Port conflicts detected. Please resolve before continuing.${NC}"
    exit 1
fi

# Step 3: Check if image exists
echo -e "${YELLOW}🖼️  Checking Docker image...${NC}"
if ! docker images --format "table {{.Repository}}" | grep -q "^${IMAGE_NAME}$"; then
    echo -e "${RED}❌ Docker image '${IMAGE_NAME}' not found${NC}"
    echo "Please build the image first with: docker build -t ${IMAGE_NAME} ."
    exit 1
fi
echo -e "${GREEN}✅ Docker image found${NC}"

# Step 4: Create exports directory
echo -e "${YELLOW}📁 Setting up exports directory...${NC}"
EXPORTS_DIR="$(pwd)/clean-cut-exports"
mkdir -p "$EXPORTS_DIR"
echo -e "${GREEN}✅ Exports directory ready: $EXPORTS_DIR${NC}"

# Step 5: Start container
echo -e "${YELLOW}🚀 Starting Clean-Cut-MCP container...${NC}"
CONTAINER_ID=$(docker run -d \
    --name "$CONTAINER_NAME" \
    -p "$REMOTION_PORT:6970" \
    -p "$MCP_PORT:6961" \
    -v "$EXPORTS_DIR:/workspace/out" \
    "$IMAGE_NAME")

echo -e "${GREEN}✅ Container started: $CONTAINER_ID${NC}"

# Step 6: Wait for services and verify
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 15

# Check container health
if docker ps --filter "name=${CONTAINER_NAME}" --format "{{.Status}}" | grep -q "healthy"; then
    echo -e "${GREEN}✅ Container is healthy${NC}"
else
    echo -e "${RED}❌ Container health check failed${NC}"
    echo "Container logs:"
    docker logs "$CONTAINER_NAME" --tail 20
    exit 1
fi

# Test service accessibility
echo -e "${YELLOW}🧪 Testing service accessibility...${NC}"

# Test Remotion Studio
if curl -s "http://localhost:$REMOTION_PORT" >/dev/null; then
    echo -e "${GREEN}✅ Remotion Studio accessible at http://localhost:$REMOTION_PORT${NC}"
else
    echo -e "${RED}❌ Remotion Studio not accessible${NC}"
    exit 1
fi

# Test MCP Server
if curl -s "http://localhost:$MCP_PORT/health" >/dev/null; then
    echo -e "${GREEN}✅ MCP Server accessible at http://localhost:$MCP_PORT/mcp${NC}"
else
    echo -e "${RED}❌ MCP Server not accessible${NC}"
    exit 1
fi

# Step 7: Display summary
echo ""
echo -e "${GREEN}🎉 Clean-Cut-MCP is ready!${NC}"
echo "================================"
echo -e "${BLUE}📺 Remotion Studio:${NC} http://localhost:$REMOTION_PORT"
echo -e "${BLUE}🔧 MCP Server:${NC} http://localhost:$MCP_PORT/mcp"
echo -e "${BLUE}📁 Exports Directory:${NC} $EXPORTS_DIR"
echo ""
echo -e "${YELLOW}🔧 Claude Desktop Configuration:${NC}"
echo "{"
echo "  \"mcpServers\": {"
echo "    \"clean-cut-mcp\": {"
echo "      \"url\": \"http://localhost:$MCP_PORT/mcp\""
echo "    }"
echo "  }"
echo "}"
echo ""
echo -e "${GREEN}✨ Enhanced MCP Tools Available:${NC}"
echo "• create_custom_animation - Generate themed animations from descriptions"
echo "• read_animation_file - Read existing animation code"  
echo "• edit_animation - Modify animations with specific changes"
echo ""
echo -e "${BLUE}Try asking: 'Create a twinkling star animation with constellation patterns'${NC}"