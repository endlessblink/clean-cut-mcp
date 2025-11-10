# Clean-Cut-MCP Project Structure Mapping

## Overview
Clean-Cut-MCP is an AI-powered video generation system that runs as an MCP (Model Context Protocol) server in Docker containers. It enables users to create professional Remotion animations using natural language through Claude Desktop.

## 🏗️ Architecture Overview

### System Components
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Claude Desktop│────│  MCP Server      │────│  Remotion Studio    │
│   (User Interface)   │  (Validation &   │    │  (Animation Preview) │
│                      │   Code Generation)│    │                      │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Docker          │
                       │  Container       │
                       │  (Isolated       │
                       │   Environment)   │
                       └──────────────────┘
```

### Technology Stack
- **MCP Server**: TypeScript with STDIO transport
- **Animation Engine**: Remotion 4.0.340 + React 18
- **Containerization**: Docker with multi-stage builds
- **Validation**: Custom AST-based validation system
- **Learning**: User preference learning system

## 📂 Directory Structure

### Core Server (`mcp-server/`)
```
mcp-server/src/
├── clean-stdio-server.ts      # Main MCP server (production)
├── http-mcp-server.ts         # HTTP server (development)
├── animation-validator.ts     # Animation validation logic
├── base-animation-rules.ts    # Professional standards
├── preference-learner.ts      # User correction learning
├── rule-enforcer.ts           # Combined rules application
├── root-sync.ts              # Root.tsx auto-sync system
├── template-registry.ts      # Animation template management
└── preference-applier.ts     # Apply learned preferences
```

### Animation Workspace (`clean-cut-workspace/`)
```
clean-cut-workspace/src/
├── assets/animations/          # Individual animation components
├── components/               # Shared React components
├── utils/                    # Animation utilities
├── patterns/                 # Design patterns
├── validated-params/         # Pre-validated parameters
├── Root.tsx                  # Auto-generated composition registry
└── Composition.tsx           # Main composition
```

### Documentation (`claude-dev-guidelines/`)
```
claude-dev-guidelines/
├── PROJECT_CONFIG.md         # Master configuration
├── PRE-ANIMATION-CHECKLIST.md # Validation steps
├── SAFE_ANIMATION_CREATION_PROTOCOL.md # Creation workflow
└── ADVANCED/                 # Technical documentation
```

## 🔧 Key Components

### MCP Server Tools (18 available)
1. **Animation Creation**
   - `create_animation`: Main tool with validation
   - `update_composition`: Modify existing animations
   - `manage_props`: Component property management

2. **Root Management**
   - `auto_sync`: Auto-sync Root.tsx with animations
   - `rebuild_compositions`: Regenerate Root.tsx
   - `cleanup_broken_imports`: Remove orphaned imports

3. **Asset Management**
   - `upload_asset`: Upload images/logos
   - `list_assets`: List available assets
   - `delete_asset`: Remove assets

4. **Learning System**
   - `generate_with_learning`: Apply learned preferences
   - `record_user_correction`: Store user feedback
   - `view_learned_preferences`: Show learned rules

### Validation System
Located in `clean-stdio-server.ts` lines 1034-1120

**Base Rules (Always Enforced):**
- Font family must be specified (no browser defaults)
- Minimum font size: 24px for 1920x1080 resolution
- Minimum padding: 40px (no cramped layouts)
- NoOverlapScene for multi-scene animations
- Motion blur for fast movements
- No dynamic imports

**Learned Rules (From User Corrections):**
- Scale limits for specific elements
- Preferred transition patterns
- Timing preferences
- Color corrections

### Animation Pipeline
```
User Request → Validation → Code Generation → File Creation → Root.tsx Sync → Studio Hot Reload
```

## 🐳 Docker Architecture

### Container Configuration
- **Multi-stage build**: Builder + Runtime stages
- **Bind mounts**: Workspace and exports directories
- **Environment variables**: Path resolution and configuration
- **Entry point**: `start.js` with directory initialization

### Critical Bind Mounts
```yaml
volumes:
  - ./clean-cut-workspace:/workspace      # Animation source
  - ./clean-cut-exports:/workspace/out    # Rendered videos
  - clean-cut-node-modules:/workspace/node_modules  # Avoid conflicts
```

## 🔄 Data Flow

### Request Processing
1. **Input**: Claude Desktop calls MCP tool
2. **Validation**: Base rules + learned rules applied
3. **Code Processing**: Auto-fixing and formatting
4. **File Creation**: Environment-aware path resolution
5. **Sync**: Root.tsx auto-update
6. **Preview**: Hot reload in Remotion Studio

### Learning System
```
User Correction → Preference Learning → Rule Application → Future Improvements
```

## 📋 Key Files & Purposes

### Essential Files
- `clean-stdio-server.ts`: Main MCP server with validation
- `root-sync.ts`: Auto-sync Root.tsx with animations
- `base-animation-rules.ts`: Professional standards
- `PROJECT_CONFIG.md`: Configuration source of truth
- `NoOverlapScene.tsx`: Prevents animation overlaps
- `Dockerfile`: Multi-stage container build

### Configuration Hierarchy
1. `PROJECT_CONFIG.md` - Master configuration
2. `base-animation-rules.ts` - Professional standards
3. `user-preferences.json` - User corrections
4. Pattern JSON files - Design templates

## 🎯 Development Workflow

### Build Process
```bash
# Full rebuild
docker-compose down && docker-compose build --no-cache && docker-compose up -d

# Quick deploy (code changes)
cd mcp-server && npm run build
docker cp mcp-server/dist/. clean-cut-mcp:/app/mcp-server/dist/
```

### Testing
- **MCP Server**: `npm run dev` (HTTP mode)
- **Validation**: `node test-validation.js`
- **Studio**: http://localhost:6970
- **Root Sync**: Test auto-sync functionality

### Critical Gotchas
1. **Path Resolution**: Use `process.env.DOCKER_CONTAINER` checks
2. **Directory Creation**: Container must create dirs at startup
3. **Validation**: Requires rebuild + deploy + Claude restart
4. **Root.tsx**: Auto-syncs after each animation creation

## 🚀 Key Features

### Professional Quality
- AST-based validation system
- User preference learning
- Template-based animations
- Professional motion curves
- Broadcast-ready standards

### Developer Experience
- Hot reload in Remotion Studio
- Comprehensive validation feedback
- Auto-correction capabilities
- Rich documentation
- Modular architecture

### Integration
- Claude Desktop via MCP protocol
- Docker containerization
- STDIO transport for production
- HTTP transport for development