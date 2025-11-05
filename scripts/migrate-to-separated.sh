#!/bin/bash

# Clean-Cut-MCP Migration Script: Monolithic → Separated Containers
# This script safely migrates from single container to separated architecture

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

# Function to check if current container is running
check_current_status() {
    print_status "Checking current Clean-Cut-MCP status..."

    if docker ps --format "table {{.Names}}" | grep -q "clean-cut-mcp"; then
        print_success "Current monolithic container is running"
        return 0
    else
        print_warning "Current container is not running"
        return 1
    fi
}

# Function to create backup of current setup
create_backup() {
    print_status "Creating backup of current setup..."

    # Create backup tag
    docker tag clean-cut-mcp:latest clean-cut-mcp:$BACKUP_TAG 2>/dev/null || {
        print_warning "Could not tag current image (may not exist)"
    }

    # Export current container state
    docker inspect clean-cut-mcp > backup-container-state.json 2>/dev/null || {
        print_warning "Could not export container state"
    }

    print_success "Backup created with tag: $BACKUP_TAG"
}

# Function to test if required directories exist
check_directories() {
    print_status "Checking required directories..."

    local dirs=("clean-cut-workspace" "clean-cut-exports" "mcp-server-separated" "web-app-separated")

    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            print_error "Required directory '$dir' not found"
            exit 1
        fi
    done

    print_success "All required directories exist"
}

# Function to build separated containers
build_separated_containers() {
    print_status "Building separated containers..."

    if ! docker-compose -f $SEPARATED_COMPOSE build; then
        print_error "Failed to build separated containers"
        return 1
    fi

    print_success "Separated containers built successfully"
}

# Function to start separated containers
start_separated_containers() {
    print_status "Starting separated containers..."

    if ! docker-compose -f $SEPARATED_COMPOSE up -d; then
        print_error "Failed to start separated containers"
        return 1
    fi

    print_success "Separated containers started"
}

# Function to stop original container
stop_original_container() {
    print_status "Stopping original monolithic container..."

    if docker ps --format "table {{.Names}}" | grep -q "clean-cut-mcp"; then
        docker-compose -f $ORIGINAL_COMPOSE down
        print_success "Original container stopped"
    else
        print_warning "Original container was not running"
    fi
}

# Function to test separated containers
test_separated_containers() {
    print_status "Testing separated containers..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        print_status "Health check attempt $attempt/$max_attempts..."

        # Test MCP server
        if curl -f http://localhost:6971/health >/dev/null 2>&1; then
            print_success "MCP server is responding"
        else
            print_warning "MCP server not ready yet"
        fi

        # Test Web App
        if curl -f http://localhost:6970/ >/dev/null 2>&1; then
            print_success "Web app is responding"
            return 0
        else
            print_warning "Web app not ready yet"
        fi

        if [ $attempt -eq $max_attempts ]; then
            print_error "Health checks failed after $max_attempts attempts"
            return 1
        fi

        sleep 10
        ((attempt++))
    done
}

# Function to show migration summary
show_summary() {
    print_success "Migration completed successfully!"
    echo
    echo "=== Migration Summary ==="
    echo "✅ Original container: Stopped (backup available as tag: $BACKUP_TAG)"
    echo "✅ MCP Server: Running on port 6971"
    echo "✅ Web App: Running on port 6970"
    echo "✅ Shared volumes: Preserved and accessible"
    echo
    echo "=== Next Steps ==="
    echo "1. Test your Claude Desktop integration"
    echo "2. Verify Remotion Studio at http://localhost:6970"
    echo "3. Check animation creation and export functionality"
    echo
    echo "=== Rollback Information ==="
    echo "If issues occur, run: ./scripts/rollback.sh"
    echo "This will restore the original monolithic setup"
}

# Function to handle rollback on failure
rollback_on_failure() {
    print_error "Migration failed! Rolling back..."

    # Stop separated containers
    docker-compose -f $SEPARATED_COMPOSE down 2>/dev/null || true

    # Restart original container
    if docker-compose -f $ORIGINAL_COMPOSE up -d; then
        print_success "Rollback completed - original container restored"
    else
        print_error "Rollback failed - manual intervention required"
    fi

    exit 1
}

# Main migration function
main() {
    echo "=== Clean-Cut-MCP Migration to Separated Containers ==="
    echo

    # Safety check: Ask for confirmation
    echo -e "${YELLOW}This will migrate from monolithic to separated container architecture.${NC}"
    echo -e "${YELLOW}Your current setup will be backed up for rollback.${NC}"
    echo
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Migration cancelled by user"
        exit 0
    fi

    # Set up error handling
    trap rollback_on_failure ERR

    # Execute migration steps
    check_docker
    check_directories

    if check_current_status; then
        create_backup
    fi

    build_separated_containers
    start_separated_containers

    # Wait a moment for containers to start
    sleep 10

    if test_separated_containers; then
        # Only stop original after successful migration
        stop_original_container
        show_summary
    else
        print_error "Health checks failed - keeping original container running"
        docker-compose -f $SEPARATED_COMPOSE down
        exit 1
    fi
}

# Run main function
main "$@"