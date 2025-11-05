# PRD: Clean-Cut-MCP Container Separation Project

**Version**: 1.0
**Date**: 2025-11-05
**Author**: Claude Code Assistant
**Status**: Draft

## Executive Summary

**Objective**: Separate the monolithic Clean-Cut-MCP container into dedicated MCP server and web app containers while maintaining 100% backward compatibility and zero downtime for existing users.

**Current State**: Single container running both MCP server (STDIO) and Remotion Studio web interface on ports 6970-6971.

**Target State**: Two specialized containers with clear separation of concerns, communicating via shared volumes and network.

## Requirements Analysis

### Functional Requirements

#### FR1: Preserve Existing MCP Functionality
- **CRITICAL**: All existing MCP tools must continue working exactly as before
- Claude Desktop integration must remain unchanged
- STDIO transport must be preserved
- No breaking changes to MCP API or tool signatures
- All existing animation templates and validation rules must persist

#### FR2: Maintain Web Interface Features
- Remotion Studio accessible at http://localhost:6970
- Real-time preview of animations
- Access to all 16+ animation templates
- Export functionality to clean-cut-exports directory
- Hot reload and development features

#### FR3: Enable Independent Scaling
- MCP server can be restarted without affecting web interface
- Web app can be updated without breaking Claude Desktop integration
- Resource allocation per container (MCP: lightweight, Web: GPU/CPU intensive)

### Non-Functional Requirements

#### NFR1: Zero Downtime Migration
- Existing users should not experience any service interruption
- Current container continues working during migration
- Rolling deployment with fallback capability

#### NFR2: Backward Compatibility
- All existing installations continue working
- No changes required to user's Claude Desktop configuration
- Volume mounts and directory structures preserved

#### NFR3: Performance
- No performance degradation compared to monolithic setup
- Improved resource utilization through specialization
- Faster startup times for individual services

## Technical Architecture

### Current Architecture Analysis
```
┌─────────────────────────────────────┐
│        clean-cut-mcp container       │
│  ┌─────────────────────────────────┐ │
│  │      MCP Server (STDIO)         │ │
│  │   - Port 6971                   │ │
│  │   - Animation validation        │ │
│  │   - Claude Desktop integration  │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │      Remotion Studio            │ │
│  │   - Port 6970                   │ │
│  │   - Web interface               │ │
│  │   - Video rendering             │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │     Shared Resources           │ │
│  │   - /workspace volume          │ │
│  │   - Animation files            │ │
│  │   - Export directory           │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Proposed Target Architecture
```
┌─────────────────┐    ┌─────────────────┐
│  mcp-server     │    │   web-app       │
│  container      │    │   container     │
│                 │    │                 │
│ • MCP Server    │    │ • Remotion      │
│ • Validation    │    │   Studio        │
│ • Claude API    │    │ • Web UI        │
│ • Port 6971     │    │ • Port 6970     │
│                 │    │ • Rendering     │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────┬───────────┘
                     │
    ┌─────────────────────────────────┐
    │        Shared Resources         │
    │   • clean-cut-workspace volume │
    │   • clean-cut-exports volume   │
    │   • Docker network             │
    └─────────────────────────────────┘
```

## Migration Strategy

### Phase 1: Preparation (Zero Risk)
1. **Create New Container Definitions**
   - `mcp-server/Dockerfile` - MCP-only container
   - `web-app/Dockerfile` - Remotion Studio container
   - `docker-compose.separated.yml` - New configuration

2. **Preserve Current Setup**
   - Keep existing `docker-compose.yml` untouched
   - Maintain current container as fallback
   - Create parallel infrastructure without disrupting existing users

### Phase 2: Development & Testing (Isolated)
1. **Build Separated Containers**
   - Develop new container configurations
   - Test in isolated environment
   - Validate all MCP tools work identically

2. **Integration Testing**
   - Test container-to-container communication
   - Validate shared volume access
   - Test independent container scaling

### Phase 3: Gradual Migration (Zero Downtime)
1. **Parallel Deployment**
   - Deploy separated containers alongside existing
   - Use different ports (6972-6973) for testing
   - Allow users to opt-in to new architecture

2. **Migration Path**
   - Provide migration script for existing users
   - Update documentation with both setups
   - Maintain backward compatibility for 6 months

### Phase 4: Deprecation (Long Term)
1. **Phase Out Monolithic**
   - Mark monolithic setup as deprecated
   - Provide automated migration tools
   - Eventually remove in future major version

## Detailed Implementation Plan

### Container 1: MCP Server (`mcp-server`)
**Purpose**: Pure MCP functionality and animation management
**Resources**: Lightweight (256MB RAM, minimal CPU)
**Ports**: 6971 (MCP server), optional health check port

**Key Components**:
- `clean-stdio-server.ts` - Main MCP server
- Animation validation system
- File system operations
- Claude Desktop integration

**Volume Mounts**:
- `./clean-cut-workspace:/workspace` (read/write for animation files)
- `./clean-cut-exports:/workspace/out` (for exports)
- `./mcp-server/preferences:/app/mcp-server/preferences` (for learned rules)

### Container 2: Web App (`web-app`)
**Purpose**: Remotion Studio and visual interface
**Resources**: Heavy (1GB+ RAM, GPU acceleration if available)
**Ports**: 6970 (Remotion Studio)

**Key Components**:
- Remotion Studio server
- Video rendering pipeline
- Web interface assets
- Development tools

**Volume Mounts**:
- `./clean-cut-workspace:/workspace` (read access to source files)
- `./clean-cut-exports:/workspace/out` (write access for exports)
- Chrome/Chromium for rendering

### Communication Architecture

#### File-Based Communication
- **MCP Server** writes animation files to `/workspace/src/assets/animations/`
- **Web App** reads files via hot reload (file watching)
- **Root.tsx** synchronization handled by MCP server

#### Shared State Management
- Animation files in shared workspace
- Export directory for rendered videos
- Configuration files accessible to both containers

## Risk Assessment & Mitigations

### High-Risk Items

#### Risk 1: Breaking Claude Desktop Integration
**Impact**: Users lose MCP functionality
**Probability**: Medium
**Mitigation**:
- Keep existing monolithic setup as fallback
- Test Claude Desktop integration extensively
- Preserve exact STDIO interface
- Maintain same tool signatures and responses

#### Risk 2: Volume Mount Conflicts
**Impact**: Animation files not accessible between containers
**Probability**: High
**Mitigation**:
- Use Docker volumes instead of bind mounts initially
- Implement file permission testing
- Add health checks for volume accessibility
- Provide automated volume repair scripts

#### Risk 3: Performance Degradation
**Impact**: Slower animation creation/rendering
**Probability**: Medium
**Mitigation**:
- Benchmark monolithic vs separated performance
- Optimize container resource allocation
- Implement caching strategies
- Use Docker networks for efficient communication

### Medium-Risk Items

#### Risk 4: Complex User Migration
**Impact**: Users confused by new setup
**Probability**: High
**Mitigation**:
- Provide automated migration script
- Maintain both setups in parallel
- Clear documentation with migration paths
- Video tutorials for migration process

#### Risk 5: Development Complexity
**Impact**: Harder to maintain and debug
**Probability**: Medium
**Mitigation**:
- Comprehensive logging across containers
- Unified docker-compose for development
- Debugging tools and health checks
- Clear separation of concerns in code

## Success Criteria

### Must-Have (Go/No-Go)
1. **100% MCP Functionality**: All existing MCP tools work identically
2. **Zero Downtime**: Existing users unaffected during migration
3. **Performance Parity**: No degradation in animation creation/rendering speed
4. **Claude Desktop Compatibility**: No changes required to user configuration

### Should-Have
1. **Independent Scaling**: Containers can be restarted independently
2. **Improved Resource Usage**: Better CPU/RAM utilization
3. **Simplified Development**: Easier to debug and maintain individual services
4. **Enhanced Monitoring**: Separate health checks and logging

### Could-Have
1. **Enhanced Security**: Isolated network policies per container
2. **Multi-Environment Support**: Easy switching between dev/prod configurations
3. **Advanced Monitoring**: Prometheus metrics and Grafana dashboards
4. **Automated Testing**: Container integration tests in CI/CD

## Rollback Procedures

### Immediate Rollback (< 5 minutes)
1. **Stop New Containers**: `docker-compose -f docker-compose.separated.yml down`
2. **Start Original**: `docker-compose up -d`
3. **Verify Functionality**: Test Claude Desktop integration
4. **Communicate**: Notify users of rollback

### Partial Rollback (< 30 minutes)
1. **Identify Issue**: Check logs and health status
2. **Selective Rollback**: Use monolithic for problematic components only
3. **Fix Issue**: Address root cause in separated containers
4. **Resume Migration**: Continue with fixed implementation

### Full Rollback Strategy
- Maintain monolithic docker-compose.yml for 6 months
- Automated rollback script available
- User documentation for manual rollback
- Support channels for migration issues

## Timeline & Milestones

### Week 1: Planning & Setup
- [ ] Finalize architecture design
- [ ] Create development environment
- [ ] Set up CI/CD for new containers
- [ ] Document migration procedures

### Week 2: Development
- [ ] Create mcp-server container
- [ ] Create web-app container
- [ ] Develop docker-compose.separated.yml
- [ ] Implement health checks and monitoring

### Week 3: Testing & Validation
- [ ] Unit tests for both containers
- [ ] Integration tests with Claude Desktop
- [ ] Performance benchmarking
- [ ] User acceptance testing

### Week 4: Gradual Rollout
- [ ] Deploy to subset of users
- [ ] Monitor performance and issues
- [ ] Gather feedback and fix issues
- [ ] Prepare full migration guide

### Week 5-6: Full Migration & Cleanup
- [ ] Migrate all existing users
- [ ] Update documentation
- [ ] Deprecate monolithic setup
- [ ] Clean up legacy code

## File Structure Changes

### Current Structure
```
clean-cut-mcp/
├── docker-compose.yml          # Monolithic setup
├── Dockerfile                  # Combined container
├── start.js                    # Combined entrypoint
├── mcp-server/                 # MCP source code
├── clean-cut-workspace/        # Animation workspace
└── clean-cut-exports/          # Video exports
```

### Target Structure
```
clean-cut-mcp/
├── docker-compose.yml          # Monolithic (preserved)
├── docker-compose.separated.yml # New separated setup
├── Dockerfile                  # Combined (preserved)
├── mcp-server/
│   ├── Dockerfile              # MCP-only container
│   └── src/                    # MCP source code
├── web-app/
│   ├── Dockerfile              # Web-only container
│   ├── package.json
│   └── src/                    # Remotion Studio source
├── scripts/
│   ├── migrate-to-separated.sh # Migration script
│   └── rollback.sh             # Rollback script
├── clean-cut-workspace/        # Shared workspace
└── clean-cut-exports/          # Shared exports
```

## Implementation Notes

### Key Technical Decisions

1. **File-Based Communication**: Containers communicate through shared files rather than API calls to maintain simplicity and reliability.

2. **Volume Strategy**: Use named Docker volumes for better performance and reliability vs bind mounts.

3. **Network Isolation**: Containers on same Docker network but with isolated responsibilities.

4. **Health Checks**: Implement comprehensive health checks for early failure detection.

5. **Logging Strategy**: Unified logging format across containers for easier debugging.

### Monitoring & Observability

1. **Health Check Endpoints**:
   - MCP Server: `/health` for validation system status
   - Web App: `/` for Remotion Studio availability

2. **Log Aggregation**: Structured JSON logs with container identification

3. **Metrics Collection**:
   - MCP: Request count, validation success rate, file operations
   - Web App: Render queue length, video export count, user sessions

## Conclusion

This container separation project will significantly improve the Clean-Cut-MCP architecture while maintaining complete backward compatibility. The phased approach with zero-downtime migration ensures existing users are protected while enabling future scalability and maintainability improvements.

The key success factor is maintaining the existing monolithic setup as a fallback during the entire migration period, ensuring we can instantly rollback if any issues arise.

---

**Next Steps**: Upon approval, proceed with Phase 1 implementation while maintaining existing setup as fallback.