# Agent Development Guide - Clean Cut MCP

## Build/Test Commands
- **Install**: `npm install && npm run build-mcp` (builds MCP server + dependencies)
- **Dev Server**: `npm run dev` (Remotion Studio on port 6970)
- **MCP Server Build**: `cd mcp-server && npm run build` (TypeScript → dist/)
- **MCP Server Dev**: `cd mcp-server && npm run dev` (watch mode)
- **Test MCP**: `npm run test-mcp` (runs MCP server in development)
- **Setup for Claude**: `npm run install-for-claude` (full setup + universal installer)

## Code Style (Prettier)
- **Quotes**: Single quotes, JSX double quotes
- **Semicolons**: Always use
- **Line Width**: 120 characters max
- **Indentation**: 2 spaces (no tabs)
- **Trailing Commas**: ES5 style
- **Arrow Params**: Avoid parens when possible (`x => x` not `(x) => x`)

## TypeScript Config
- **Target**: ES2022, ESNext modules
- **Strict Mode**: Disabled (`strict: false`, `noImplicitAny: false`)
- **Module Resolution**: Node-style
- **Import Style**: ES modules (`import { X } from 'remotion'`)

## Remotion Component Patterns
- **Export Pattern**: `export const ComponentName: React.FC<PropsInterface> = (props) => { ... }`
- **Required Imports**: `import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion'`
- **Props**: Always define TypeScript interface with default values
- **Animation**: Use `interpolate()` with explicit `extrapolateLeft/Right: 'clamp'`
- **Easing**: Import from Remotion (`Easing.bezier()`, `Easing.out()`, etc.)

## Naming Conventions
- **Components**: PascalCase (`FloatingOrbs.tsx`, `EndlessBlinkExtended.tsx`)
- **Props Interfaces**: `ComponentNameProps`
- **Files**: Match component name exactly
- **Folders**: kebab-case (`clean-cut-workspace`, `mcp-server`)

## Error Handling
- **MCP Server**: Use stderr-only logging (`console.error()`) - never `console.log()` in STDIO mode
- **Validation**: Non-breaking optional validation (`ENABLE_ANIMATION_VALIDATION` env var)
- **File Operations**: Use `fs/promises` for async, `fs` (sync) for config reads

## CRITICAL PRE-WORK REQUIREMENTS
**ALWAYS read these files BEFORE creating/modifying animations:**
1. `PRE-ANIMATION-CHECKLIST.md` (determines Learning vs Implementation phase)
2. `claude-dev-guidelines/PROJECT_CONFIG.md` (colors, typography, timing - NO hardcoding)
3. `claude-dev-guidelines/SAFE_ANIMATION_CREATION_PROTOCOL.md` (safe file modification process)
4. `claude-dev-guidelines/ADVANCED/REMOTION_ANIMATION_RULES.md` (Remotion-specific rules)

**Document Hierarchy (when conflicts occur):**
1. `claude-dev-guidelines/` (PROJECT STANDARDS - highest priority)
2. `PROJECT_CONFIG.md` values (configuration - never hardcode these)
3. `docs/`, `motion-design-research/` (REFERENCE ONLY - not production requirements)

## Safe Animation Creation Process
1. **Create backup**: `./backup-before-changes.sh`
2. **Create animation file ONLY** in `clean-cut-workspace/src/assets/animations/`
3. **Test syntax** - verify React.FC pattern and imports
4. **THEN add to Root.tsx** - import + composition entry
5. **Emergency restore**: `./restore-backup.sh [TIMESTAMP]` or `git reset --hard 9679310 && docker restart clean-cut-mcp`

## Port Configuration
- **Remotion Studio**: 6970 (standardized)
- **Preview Server**: 6971
- **Docker Container**: Uses `/app` workspace when `DOCKER_CONTAINER=true`
