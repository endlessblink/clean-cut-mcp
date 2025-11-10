# Container Development Workflow

## Overview
Manages the Docker-based development environment for the Clean-Cut-MCP system, handling container operations, performance monitoring, troubleshooting, and development workflow automation.

## When to Use
- Setting up development environment for the first time
- Debugging container-related issues
- Optimizing container performance and resource usage
- Deploying updates and managing container lifecycle
- Monitoring system health and performance

## What It Does

### Container Management
1. **Environment Setup** - Initializes and configures Docker containers
2. **Service Orchestration** - Manages multi-container setup (MCP server, Remotion Studio)
3. **Resource Monitoring** - Tracks CPU, memory, disk usage, and performance
4. **Health Checks** - Monitors container health and automatic recovery

### Development Workflow
5. **Code Deployment** - Syncs local changes to running containers
6. **Hot Reload Setup** - Configures live reload for development
7. **Log Management** - Collects and analyzes container logs
8. **Debug Configuration** - Sets up debugging tools and breakpoints

### Maintenance & Optimization
9. **Performance Tuning** - Optimizes container settings for better performance
10. **Resource Cleanup** - Manages disk space and removes unused containers/images
11. **Backup Management** - Creates and restores container snapshots
12. **Security Updates** - Applies security patches and updates

## MCP Tools Used
This skill primarily manages the underlying infrastructure that enables all other MCP tools to function properly.

## Prerequisites
- Docker and Docker Compose installed
- Sufficient system resources (CPU, RAM, disk space)
- Administrative access for Docker operations
- Network access for container image downloads

## Examples

### Example 1: First-Time Setup
```
User: "Set up the development environment on a new machine"
Process:
1. Verify Docker installation
2. Clone repository and navigate to project
3. Build containers: docker-compose build
4. Start services: docker-compose up -d
5. Verify all services are running
6. Access Remotion Studio at localhost:6970
Features: Complete environment setup with validation
```

### Example 2: Performance Optimization
```
User: "The system is running slow, need to optimize performance"
Analysis:
- Check resource usage: docker stats
- Monitor memory consumption patterns
- Analyze disk I/O bottlenecks
- Review container configuration
Optimizations:
- Adjust memory limits in docker-compose.yml
- Optimize volume mounts for better I/O
- Tune garbage collection settings
- Implement resource monitoring
Results: Improved performance and stability
```

### Example 3: Debugging Container Issues
```
User: "MCP server is not responding, need to troubleshoot"
Diagnostic Process:
1. Check container status: docker-compose ps
2. Review logs: docker logs clean-cut-mcp
3. Test container connectivity
4. Verify bind mounts are working
5. Check port conflicts
Resolution:
- Restart services if needed
- Fix configuration issues
- Clear corrupted cache files
- Rebuild container if necessary
Features: Systematic troubleshooting approach
```

### Example 4: Development Workflow Automation
```
User: "Need efficient workflow for making code changes"
Setup:
- Configure hot reload for development
- Set up automatic container restart on changes
- Create scripts for common operations
- Implement log monitoring and alerts
Workflow:
1. Make code changes locally
2. Auto-sync to container
3. Automatic restart if needed
4. Verify changes in Remotion Studio
5. Run tests and validations
Features: Streamlined development cycle
```

## Error Handling

### Common Issues and Solutions:

**Container Won't Start**
- Error: "Container failed to start" or "Port already in use"
- Solution: Check port conflicts, stop conflicting services, restart containers
- Prevention: Use port mapping configuration, check for conflicts before starting

**Out of Memory**
- Error: "Container killed due to memory limit exceeded"
- Solution: Increase memory limits, optimize application memory usage
- Prevention: Monitor memory usage, set appropriate limits in docker-compose.yml

**Bind Mount Issues**
- Error: "Cannot access mounted volumes" or "Permission denied"
- Solution: Check directory permissions, verify mount paths, restart container
- Prevention: Ensure proper directory structure and permissions before starting

**Network Issues**
- Error: "Cannot connect to services" or "Network unreachable"
- Solution: Check network configuration, restart Docker daemon, verify firewall settings
- Prevention: Use proper network configuration, document port usage

**Disk Space**
- Error: "No space left on device" during operations
- Solution: Clean up unused images and containers, expand disk space
- Prevention: Implement regular cleanup policies, monitor disk usage

## Tips & Best Practices

### Development Setup
- **Use .env files** - Store configuration variables externally
- **Document dependencies** - Keep track of required Docker versions
- **Separate environments** - Use different compose files for dev/prod
- **Version control** - Include Docker configurations in git

### Performance Optimization
- **Resource limits** - Set appropriate CPU and memory limits
- **Volume optimization** - Use bind mounts for development, volumes for production
- **Image optimization** - Use multi-stage builds and minimal base images
- **Caching strategy** - Implement proper layer caching for faster builds

### Monitoring & Maintenance
- **Log management** - Set up log rotation and centralized logging
- **Health checks** - Implement container health monitoring
- **Backup strategy** - Regular backups of important data and configurations
- **Security updates** - Keep Docker and container images updated

### Troubleshooting
- **Start simple** - Test with basic configurations before adding complexity
- **Check logs first** - Container logs often reveal the root cause
- **Isolate issues** - Test containers individually to identify problems
- **Document solutions** - Keep record of common issues and resolutions

## Advanced Features

### Automated Scaling
- Horizontal scaling based on load
- Auto-scaling policies and thresholds
- Load balancing across multiple containers
- Resource optimization algorithms

### Development Tools Integration
- IDE integration with Docker debugging
- Automated testing in containerized environments
- Code coverage and performance profiling
- Continuous integration/deployment pipelines

### Security Hardening
- Container scanning for vulnerabilities
- Runtime security monitoring
- Network segmentation and access control
- Secret management and encryption

### Cloud Integration
- Multi-cloud deployment support
- Container orchestration with Kubernetes
- Cloud storage and backup solutions
- Managed database and service integration

### Monitoring & Analytics
- Real-time performance metrics
- Custom dashboards and alerts
- Historical data analysis
- Predictive maintenance capabilities

This skill ensures the Docker-based development environment runs smoothly, providing the foundation for all other video production workflows to operate efficiently and reliably.