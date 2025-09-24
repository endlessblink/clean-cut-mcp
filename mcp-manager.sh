#!/bin/bash
# MCP Server Process Manager - Ensures only one instance runs
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

log() {
    echo -e "${GREEN}[MCP-MANAGER]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[MCP-MANAGER]${NC} $1"
}

error() {
    echo -e "${RED}[MCP-MANAGER]${NC} $1"
}

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

# Check if a specific PID is running the MCP server (ENHANCED SAFETY)
is_mcp_process_running() {
    local pid=$1

    # Safety check: PID must be numeric and reasonable
    if ! [[ "$pid" =~ ^[0-9]+$ ]] || [ "$pid" -lt 1 ] || [ "$pid" -gt 65535 ]; then
        return 1
    fi

    # Verify process exists and is node
    docker exec ${CONTAINER_NAME} ps -p ${pid} -o comm= 2>/dev/null | grep -q "^node$" || return 1

    # Verify exact command line (safety: must contain full path)
    local cmdline=$(docker exec ${CONTAINER_NAME} ps -p ${pid} -o args= 2>/dev/null)
    [[ "$cmdline" == *"clean-stdio-server.js"* ]] || return 1
    [[ "$cmdline" == *"/app/mcp-server/dist/"* ]] || return 1

    return 0
}

# Clean up stale PID file
cleanup_stale_pid() {
    local stored_pid=$(get_stored_pid)
    if [[ -n "$stored_pid" ]]; then
        if ! is_mcp_process_running "$stored_pid"; then
            warn "Cleaning up stale PID file (process $stored_pid not running)"
            docker exec ${CONTAINER_NAME} rm -f ${PID_FILE}
        fi
    fi
}

# Kill all MCP server processes (ENHANCED SAFETY)
kill_all_mcp_processes() {
    local processes=$(get_mcp_processes)
    if [[ -n "$processes" ]]; then
        echo "$processes" | while read line; do
            local pid=$(echo "$line" | awk '{print $2}')

            # SAFETY: Double-verify this is our MCP process before killing
            if is_mcp_process_running "$pid"; then
                log "Gracefully stopping MCP process $pid"
                docker exec ${CONTAINER_NAME} kill -TERM $pid 2>/dev/null || true
            else
                warn "Skipping PID $pid - not a valid MCP process"
            fi
        done

        # Wait up to 5 seconds for graceful shutdown
        local timeout=5
        while [ $timeout -gt 0 ]; do
            processes=$(get_mcp_processes)
            [[ -z "$processes" ]] && break
            sleep 1
            ((timeout--))
        done

        # Force kill only verified MCP processes if still running
        processes=$(get_mcp_processes)
        if [[ -n "$processes" ]]; then
            echo "$processes" | while read line; do
                local pid=$(echo "$line" | awk '{print $2}')
                if is_mcp_process_running "$pid"; then
                    warn "Force killing stubborn MCP process $pid"
                    docker exec ${CONTAINER_NAME} kill -9 $pid 2>/dev/null || true
                fi
            done
        fi
    fi
    docker exec ${CONTAINER_NAME} rm -f ${PID_FILE} ${LOCK_FILE} 2>/dev/null || true
}

# Start MCP server if not running
start_mcp() {
    check_container
    cleanup_stale_pid

    local stored_pid=$(get_stored_pid)
    if [[ -n "$stored_pid" ]] && is_mcp_process_running "$stored_pid"; then
        log "MCP server already running (PID: $stored_pid)"
        return 0
    fi

    # Kill any orphaned processes
    local existing_processes=$(get_mcp_processes)
    if [[ -n "$existing_processes" ]]; then
        warn "Found orphaned MCP processes, cleaning up..."
        kill_all_mcp_processes
        sleep 1
    fi

    # Acquire lock to prevent race conditions
    if docker exec ${CONTAINER_NAME} test -f ${LOCK_FILE}; then
        error "Another MCP manager instance is running (lock file exists)"
        exit 1
    fi

    docker exec ${CONTAINER_NAME} touch ${LOCK_FILE}

    # Start new MCP server
    log "Starting MCP server..."
    local pid=$(docker exec -d ${CONTAINER_NAME} sh -c "
        # Write PID to file and start server
        echo \$\$ > ${PID_FILE} && exec ${MCP_SERVER_CMD}
    ")

    # Wait a moment for startup
    sleep 2

    # Verify it started successfully
    local actual_pid=$(get_stored_pid)
    if [[ -n "$actual_pid" ]] && is_mcp_process_running "$actual_pid"; then
        log "MCP server started successfully (PID: $actual_pid)"
        docker exec ${CONTAINER_NAME} rm -f ${LOCK_FILE}
        return 0
    else
        error "Failed to start MCP server"
        docker exec ${CONTAINER_NAME} rm -f ${LOCK_FILE}
        exit 1
    fi
}

# Stop MCP server
stop_mcp() {
    check_container
    log "Stopping MCP server..."
    kill_all_mcp_processes
    log "MCP server stopped"
}

# Show MCP server status
status_mcp() {
    check_container
    cleanup_stale_pid

    local stored_pid=$(get_stored_pid)
    local processes=$(get_mcp_processes)

    if [[ -n "$stored_pid" ]] && is_mcp_process_running "$stored_pid"; then
        log "MCP server is running (PID: $stored_pid)"
        echo "Process details:"
        docker exec ${CONTAINER_NAME} ps -p ${stored_pid} -o pid,ppid,cmd
    elif [[ -n "$processes" ]]; then
        warn "MCP server processes found but no valid PID file:"
        echo "$processes"
    else
        log "MCP server is not running"
    fi

    echo ""
    echo "All Node.js processes in container:"
    docker exec ${CONTAINER_NAME} ps aux | grep node || echo "No Node.js processes found"
}

# Restart MCP server
restart_mcp() {
    stop_mcp
    sleep 1
    start_mcp
}

# Main command handling
case "${1:-status}" in
    start)
        start_mcp
        ;;
    stop)
        stop_mcp
        ;;
    status)
        status_mcp
        ;;
    restart)
        restart_mcp
        ;;
    *)
        echo "Usage: $0 [start|stop|status|restart]"
        echo ""
        echo "Commands:"
        echo "  start   - Start MCP server (only if not already running)"
        echo "  stop    - Stop all MCP server processes"
        echo "  status  - Show current MCP server status"
        echo "  restart - Stop and start MCP server"
        exit 1
        ;;
esac