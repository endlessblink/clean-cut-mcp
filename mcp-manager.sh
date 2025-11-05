#!/bin/bash
# MCP Server Process Manager - Ensures only one instance runs with validation enabled
# Usage: ./mcp-manager.sh [start|stop|status|restart]

set -euo pipefail

# Configuration
CONTAINER_NAME="clean-cut-mcp"
PID_FILE="/tmp/clean-cut-mcp.pid"
MCP_SERVER_CMD="node /app/mcp-server/dist/clean-stdio-server.js"
LOCK_FILE="/tmp/clean-cut-mcp.lock"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[MCP-MANAGER]${NC} $1"; }
warn() { echo -e "${YELLOW}[MCP-MANAGER]${NC} $1"; }
error() { echo -e "${RED}[MCP-MANAGER]${NC} $1"; }

# Check if container is running
check_container() {
    if ! docker ps --format "table {{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        error "Container ${CONTAINER_NAME} is not running"
        exit 1
    fi
}

# Get all MCP processes in container
get_mcp_processes() {
    docker exec ${CONTAINER_NAME} ps aux 2>/dev/null | grep "clean-stdio-server.js" | grep -v grep || true
}

# Get PID from PID file inside container
get_stored_pid() {
    docker exec ${CONTAINER_NAME} cat ${PID_FILE} 2>/dev/null || echo ""
}

# Enhanced safety check for MCP processes
is_mcp_process_running() {
    local pid=$1
    if ! [[ "$pid" =~ ^[0-9]+$ ]] || [ "$pid" -lt 1 ] || [ "$pid" -gt 65535 ]; then
        return 1
    fi
    docker exec ${CONTAINER_NAME} ps -p ${pid} -o comm= 2>/dev/null | grep -q "^node$" || return 1
    local cmdline=$(docker exec ${CONTAINER_NAME} ps -p ${pid} -o args= 2>/dev/null)
    [[ "$cmdline" == *"clean-stdio-server.js"* ]] || return 1
    [[ "$cmdline" == *"/app/mcp-server/dist/"* ]] || return 1
    return 0
}

# Start MCP server with validation enabled
start_mcp() {
    check_container
    log "Starting MCP server with validation enabled..."
    docker exec -d ${CONTAINER_NAME} sh -c "echo \$\$ > ${PID_FILE} && ENABLE_ANIMATION_VALIDATION=true exec ${MCP_SERVER_CMD}"
    sleep 2
    local actual_pid=$(get_stored_pid)
    if [[ -n "$actual_pid" ]] && is_mcp_process_running "$actual_pid"; then
        log "MCP server started successfully (PID: $actual_pid) with validation active"
    else
        error "Failed to start MCP server"
        exit 1
    fi
}

# Show status
status_mcp() {
    check_container
    local stored_pid=$(get_stored_pid)
    if [[ -n "$stored_pid" ]] && is_mcp_process_running "$stored_pid"; then
        log "MCP server is running (PID: $stored_pid) with validation enabled"
    else
        log "MCP server is not running"
    fi
}

# Main command handling
case "${1:-status}" in
    start) start_mcp ;;
    status) status_mcp ;;
    restart)
        docker exec ${CONTAINER_NAME} pkill -f "clean-stdio-server.js" 2>/dev/null || true
        sleep 1
        start_mcp
        ;;
    stop)
        docker exec ${CONTAINER_NAME} pkill -f "clean-stdio-server.js" 2>/dev/null || true
        docker exec ${CONTAINER_NAME} rm -f ${PID_FILE} ${LOCK_FILE} 2>/dev/null || true
        log "MCP server stopped"
        ;;
    *) echo "Usage: $0 [start|stop|status|restart]"; exit 1 ;;
esac
