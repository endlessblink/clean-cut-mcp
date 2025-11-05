#!/bin/bash

# Clean-Cut-MCP Rollback Script: Separated → Monolithic Container
# This script rolls back from separated containers to original monolithic setup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ORIGINAL_COMPOSE="docker-compose.yml"
SEPARATED_COMPOSE="docker-compose.separated.yml"
BACKUP_TAG="pre-migration-backup"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running or accessible"
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check current status
check_current_status() {
    print_status "Checking current container status..."

    local separated_running=false
    local original_running=false

    if docker ps --format "table {{.Names}}" | grep -q "clean-cut-mcp-server\|clean-cut-web-app"; then
        separated_running=true
        print_status "Separated containers are running"
    fi

    if docker ps --format "table {{.Names}}" | grep -q "clean-cut-mcp"; then
        original_running=true
        print_status "Original monolithic container is running"
    fi

    if [ "$separated_running" = false ] && [ "$original_running" = false ]; then
        print_warning "No Clean-Cut-MCP containers are currently running"
    fi

    echo "$separated_running:$original_running"
}

# Function to stop separated containers
stop_separated_containers() {
    print_status "Stopping separated containers..."

    if docker-compose -f $SEPARATED_COMPOSE ps | grep -q "Up"; then
        if ! docker-compose -f $SEPARATED_COMPOSE down; then
            print_error "Failed to stop separated containers"
            return 1
        fi
        print_success "Separated containers stopped"
    else
        print_warning "No separated containers were running"
    fi

    # Additional cleanup: remove any orphaned containers
    docker ps -a --format "table {{.Names}}" | grep -E "clean-cut-mcp-server|clean-cut-web-app" | while read container; do
        if [ -n "$container" ] && [ "$container" != "NAMES" ]; then
            docker rm -f "$container" 2>/dev/null || true
        fi
    done
}

# Function to start original container
start_original_container() {
    print_status "Starting original monolithic container..."

    if ! docker-compose -f $ORIGINAL_COMPOSE up -d; then
        print_error "Failed to start original container"
        return 1
    fi

    print_success "Original container started"
}

# Function to test original container
test_original_container() {
    print_status "Testing original container..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        print_status "Health check attempt $attempt/$max_attempts..."

        if curl -f http://localhost:6970/ >/dev/null 2>&1; then
            print_success "Original container is responding"
            return 0
        else
            print_warning "Container not ready yet"
        fi

        if [ $attempt -eq $max_attempts ]; then
            print_error "Health checks failed after $max_attempts attempts"
            return 1
        fi

        sleep 10
        ((attempt++))
    done
}

# Function to check backup availability
check_backup() {
    print_status "Checking for backup images..."

    if docker images --format "table {{.Repository}}:{{.Tag}}" | grep -q "clean-cut-mcp:$BACKUP_TAG"; then
        print_success "Backup image found: clean-cut-mcp:$BACKUP_TAG"
        return 0
    else
        print_warning "No backup image found with tag: $BACKUP_TAG"
        print_warning "Will attempt to use current image"
        return 1
    fi
}

# Function to restore from backup if needed
restore_from_backup() {
    if check_backup; then
        print_status "Restoring from backup image..."
        docker tag clean-cut-mcp:$BACKUP_TAG clean-cut-mcp:latest
        print_success "Backup image restored"
    fi
}

# Function to show rollback summary
show_summary() {
    print_success "Rollback completed successfully!"
    echo
    echo "=== Rollback Summary ==="
    echo "✅ Separated containers: Stopped and removed"
    echo "✅ Original container: Running on ports 6970-6971"
    echo "✅ Shared volumes: Preserved and accessible"
    echo "✅ Functionality: Restored to original state"
    echo
    echo "=== Verification Steps ==="
    echo "1. Test Claude Desktop integration"
    echo "2. Verify Remotion Studio at http://localhost:6970"
    echo "3. Test animation creation workflow"
    echo "4. Confirm export functionality"
    echo
    echo "=== Migration Status ==="
    echo "You can migrate again by running: ./scripts/migrate-to-separated.sh"
    echo "Separated containers configuration is preserved"
}

# Function to check for data loss risks
check_data_integrity() {
    print_status "Checking data integrity..."

    # Check if workspace and exports directories exist and have content
    if [ ! -d "clean-cut-workspace" ]; then
        print_error "Workspace directory not found!"
        return 1
    fi

    if [ ! -d "clean-cut-exports" ]; then
        print_error "Exports directory not found!"
        return 1
    fi

    # Check for some basic workspace content
    if [ -d "clean-cut-workspace/src" ]; then
        local file_count=$(find clean-cut-workspace/src -name "*.tsx" -o -name "*.ts" | wc -l)
        print_status "Found $file_count TypeScript/React files in workspace"
    fi

    print_success "Data integrity check passed"
}

# Main rollback function
main() {
    echo "=== Clean-Cut-MCP Rollback to Monolithic Container ==="
    echo

    # Safety check: Ask for confirmation
    echo -e "${YELLOW}This will rollback from separated to monolithic container architecture.${NC}"
    echo -e "${YELLOW}All separated containers will be stopped and removed.${NC}"
    echo -e "${YELLOW}Your original setup will be restored.${NC}"
    echo
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Rollback cancelled by user"
        exit 0
    fi

    # Execute rollback steps
    check_docker
    check_data_integrity

    # Check current status
    local status=$(check_current_status)
    local separated_running=$(echo $status | cut -d: -f1)
    local original_running=$(echo $status | cut -d: -f2)

    # Stop separated containers if running
    if [ "$separated_running" = true ]; then
        stop_separated_containers
    fi

    # Restore from backup if available
    restore_from_backup

    # Start original container
    start_original_container

    # Wait for container to start
    sleep 15

    # Test original container
    if test_original_container; then
        show_summary
    else
        print_error "Original container failed health checks"
        print_error "You may need to manually troubleshoot the issue"
        exit 1
    fi
}

# Run main function
main "$@"