# CLEAN-CUT-MCP - Claude Desktop Instructions

## 🌍 FOR EXTERNAL USERS - SIMPLE REQUIREMENTS

**🎯 DESIGNED FOR EXTERNAL USERS WITHOUT CLAUDE CODE**

CRITICAL - ALWAYS VALIDATE WITH PLAYWRIGHT MCP AND ACTUALLY LOOK AT THE STATE OF THE REMOTION STUDIO SCREEN BEFORE SAYING THAT EVERYTHING WORKS!!!


  1. Never use backups that contain deleted/broken references
  2. Always clean Root.tsx manually to match actual existing files
  3. Update host and container simultaneously to prevent conflicts
  4. Test each change immediately with Playwright validation

This project works with **ONLY** these requirements:
- ✅ **Docker** (Windows, macOS, or Linux)
- ✅ **Claude Desktop** (free from Anthropic)
- ✅ **This MCP Server** (clone and run)
- ❌ **NO Claude Code needed** - Works with standard Claude Desktop
- ❌ **NO complex setup** - Docker handles everything
- ❌ **NO additional tools** - Complete system in one container

### **🚀 ONE-COMMAND SETUP FOR EXTERNAL USERS:**

```bash
# Clone and run - that's it!
git clone https://github.com/endlessblink/clean-cut-mcp.git
cd clean-cut-mcp

# Windows users:
.\install.ps1

# macOS/Linux users:
docker-compose up -d

# Access Remotion Studio: http://localhost:6970
# Find exported videos: ./clean-cut-exports/
```

**Result**: Claude Desktop can create AI-powered video animations with automatic registration and interactive props - zero complex setup required!

### **🛠️ SIMPLE MAINTENANCE FOR EXTERNAL USERS:**

**If you delete a component through Remotion Studio and get import errors:**

1. **Open your project folder** in any text editor
2. **Edit the file** `clean-cut-workspace/Root.tsx`
3. **Remove 3 lines** related to the deleted component:
   ```typescript
   // Remove the import line:
   import { DeletedComponentName } from './DeletedComponentName';

   // Remove the schema (if exists):
   const DeletedComponentNameSchema = z.object({...});

   // Remove the composition entry:
   <Composition id="DeletedComponentName" component={DeletedComponentName} ... />
   ```
4. **Save the file** - Studio will automatically refresh

**This is rare** - most users create animations, don't delete them. When it happens, it's a 2-minute fix in any text editor.

---

## 📋 PRODUCTION RELEASE DOCUMENTATION (v3.0.0 - BREAKTHROUGH SYSTEM)

**Build Date**: September 19, 2025
**Status**: PRODUCTION-READY - Auto-Sync + Props + Collision Detection
**Ports**: 6970 (Remotion Studio), 6971 (MCP HTTP - Reserved)
**Transport**: STDIO via Docker exec (Production-Ready)
**Animations**: 22+ working animations with auto-sync and meaningful props
**Target Users**: External users with Docker + Claude Desktop ONLY  

## 🚀 BREAKTHROUGH FEATURES (September 19, 2025)

### **Auto-Sync Animation System** - WORKING ✅
- **Automatic Registration**: New animations instantly appear in Remotion Studio
- **Zero Manual Steps**: `create_animation` tool automatically calls sync
- **Proof**: ColorBloom, FluidWave, GeometricMorph, SimpleTest all auto-registered
- **Result**: User asks → Animation appears immediately in Studio

### **Meaningful Props Implementation** - WORKING ✅
- **Smart Props Generation**: Claude creates visual controls, not generic properties
- **Examples**: `primaryColor, morphSpeed, waveIntensity, animationSpeed, showParticles`
- **Schema Integration**: Automatic Zod schema generation for Studio interface
- **Interactive**: Props visible and editable in Remotion Studio right panel

### **Collision Detection System** - WORKING ✅
- **Name Conflict Prevention**: Scans existing animations before creation
- **Smart Alternatives**: Suggests meaningful names (GeometricMorphV2, EnhancedBounce)
- **Fuzzy Matching**: Detects similar names with 70% similarity threshold
- **Semantic Suggestions**: Context-aware alternatives (Bounce→Floating, Circle→Orb)

### **Research-Validated Export Handling** - WORKING ✅
- **Modern Patterns**: Prefers `export const ComponentName: React.FC<Props>` (2024 best practice)
- **No Duplication**: Smart detection prevents webpack "Multiple exports" errors
- **Backward Compatible**: Handles legacy default exports gracefully
- **Zero Conflicts**: Eliminates all export-related bundling issues

### **Advanced Code Validation** - WORKING ✅
- **Infinite Recursion Prevention**: Detects and fixes recursive safeInterpolate calls
- **Pattern Recognition**: Enhanced regex patterns catch complex recursive structures
- **Automatic Fixes**: Replaces problematic code with safe interpolate patterns
- **Studio Stability**: No more "too much recursion" crashes

### 🎯 CORE COMPONENTS:
- **Docker Container**: `clean-cut-mcp` - Production-ready with 22+ animations
- **MCP Server**: Enhanced with collision detection and validation systems
- **Advanced Tools**: `create_animation` (with auto-sync), collision detection, props validation
- **Remotion Studio**: Accessible at http://localhost:6970 with interactive props
- **Video Export**: Persistent volume `/workspace/out` ↔ `./clean-cut-exports`
- **Claude Desktop Integration**: STDIO transport with enhanced tool descriptions

### 🏗️ WORKING ARCHITECTURE:
```
Claude Desktop (Windows) → docker exec → clean-cut-mcp container → Remotion Studio (6970)
                             ↓
                        TRUE AI Tools Execute Claude's Generated React/Remotion Code
                             ↓
                        /workspace/out → ./clean-cut-exports (Persistent Videos)
```

## 🎯 USAGE EXAMPLES FOR EXTERNAL USERS

### **Basic Animation Creation**
```
User: "Create a bouncing ball animation with customizable colors"
Result: BouncingBall animation with props: ballColor, backgroundColor, bounceSpeed
Status: Instantly visible in Studio with interactive controls
```

### **Advanced Animation with Multiple Props**
```
User: "Create a fluid wave animation with physics controls"
Result: FluidWave with 10 props: waveIntensity, flowSpeed, viscosity, temperature, etc.
Status: Full physics simulation with real-time prop adjustments
```

### **Smart Collision Detection**
```
User: "Create a geometric animation" (when GeometricMorph exists)
System: "[NAME CONFLICT] GeometricMorph conflicts with existing component"
Alternatives: GeometricMorphV2, EnhancedGeometric, GeometricMotion
Result: No corruption, user chooses alternative name
```

### **Props-Driven Content Control**
```
Animation Props Created:
- primaryColor: Changes main element colors in real-time
- animationSpeed: Controls movement timing and transitions
- title: Updates text content dynamically
- showParticles: Toggles visual effects on/off
- morphSpeed: Adjusts transformation rates

All props immediately editable in Remotion Studio interface
```

### **Cross-Platform Installation**
```powershell
# Windows (PowerShell)
git clone https://github.com/endlessblink/clean-cut-mcp.git
cd clean-cut-mcp
.\install.ps1

# macOS/Linux
git clone https://github.com/endlessblink/clean-cut-mcp.git
cd clean-cut-mcp
docker-compose up -d

# Access: http://localhost:6970
# Export: ./clean-cut-exports folder
```

### ✅ BREAKTHROUGH ACHIEVEMENTS:
- **Infinite Recursion Elimination**: No more Studio crashes from recursive safeInterpolate calls
- **Export Duplication Prevention**: Research-validated modern export patterns eliminate webpack errors
- **Auto-Sync Perfection**: New animations automatically appear in Studio with zero manual steps
- **Props Revolution**: Claude creates meaningful visual controls, not generic properties
- **Collision Detection**: Smart naming prevents component conflicts with semantic alternatives

## 🛡️ ADVANCED COLLISION DETECTION SYSTEM

### **Intelligent Name Conflict Prevention:**
- **Real-time Scanning**: Automatically scans all existing .tsx files before creation
- **Fuzzy Matching**: Detects similar names using Levenshtein distance (70% threshold)
- **Semantic Alternatives**: Context-aware suggestions based on animation type

### **Smart Alternative Generation:**
```
Motion Synonyms: bounce → floating, pulsing, oscillating, springBounce
Shape Synonyms: circle → sphere, orb, ring, polygon, morphing
Text Synonyms: text → typography, letters, words, writing, script
Pattern Suffixes: Basic → BasicAnimation, BasicEffect, BasicMotion, BasicTransition
Version Control: Component → ComponentV2, ComponentAdvanced, ComponentPro, ComponentPlus
Enhanced Variants: Simple → EnhancedSimple, AdvancedSimple, ImprovedSimple
```

### **Collision Detection Examples:**
```
Scenario: Create "bouncing" animation (conflicts with BouncingBall)
Response: [NAME CONFLICT] "Bouncing" conflicts with existing component
Alternatives: FloatingAnimation, PulsingMotion, OscillatingBall, SpringBounce

Scenario: Create "wave" animation (conflicts with FluidWave)
Response: [NAME CONFLICT] "Wave" conflicts with existing component
Alternatives: WaveMotion, RippleEffect, WaveAnimation, FlowWave

Scenario: Create unique name like "ParticleStorm"
Response: [SUCCESS] No conflicts detected - proceeding with ParticleStorm
```

### **Protection Features:**
- **Exact Match Detection**: Prevents identical component names
- **Case-Insensitive Matching**: Detects conflicts regardless of capitalization
- **Similarity Threshold**: 70% similarity triggers conflict warning
- **Semantic Understanding**: Suggests contextually relevant alternatives
- **Numbering Fallback**: Intelligent numbering (Component2, Component3) when patterns exhaust

## 📊 PRODUCTION VALIDATION

### **Proven Success Metrics:**
- **22+ Animations Working**: Complete preservation + new additions
- **100% Auto-Sync Success**: ColorBloom, FluidWave, GeometricMorph, SimpleTest
- **0% Export Conflicts**: Research-validated modern patterns
- **0% Infinite Recursion**: Advanced validation prevents crashes
- **100% Props Implementation**: All new animations include meaningful controls

### **Quality Standards Met:**
- **Meaningful Props**: Visual controls (colors, speeds) not generic (width, height)
- **TypeScript Integration**: Full interfaces with proper React.FC typing
- **Zod Schema Generation**: Automatic schema creation for Studio interface
- **Modern Export Patterns**: 2024 React best practices (`export const ComponentName: React.FC<Props>`)
- **Cross-Platform Compatibility**: Docker ensures consistent behavior

### 🛠️ TROUBLESHOOTING GUIDE:

**LEGACY Component Registration Errors** (RESOLVED):
- **Old Issue**: "A value of `undefined` was passed to the `component` prop"
- **STATUS**: ✅ FIXED - Auto-sync now handles all import/export patterns correctly
- **Modern Solution**: System automatically detects and fixes export patterns

**Export Duplication Errors** (RESOLVED):
- **Old Issue**: "Multiple exports with the same name ComponentName"
- **STATUS**: ✅ FIXED - Research-validated export handling prevents conflicts
- **Modern Solution**: Smart detection prefers `export const` pattern, prevents duplicates

**Infinite Recursion Crashes** (RESOLVED):
- **Old Issue**: "InternalError: too much recursion" from safeInterpolate functions
- **STATUS**: ✅ FIXED - Advanced validation detects and fixes recursive patterns
- **Modern Solution**: Automatic code validation replaces problematic patterns

**Name Collision Issues** (RESOLVED):
- **Old Issue**: Overwriting existing animations or unclear naming
- **STATUS**: ✅ FIXED - Collision detection with smart alternatives
- **Modern Solution**: Fuzzy matching + semantic suggestions prevent conflicts

**MCP Server Not Responding**:
- **Test**: `curl -I http://localhost:6970` (should return 200 OK for Remotion Studio)
- **Container Check**: `docker ps | grep clean-cut-mcp` (should show "Up" status)
- **Logs**: `docker logs clean-cut-mcp` (check for startup errors)

**Claude Desktop Connection Issues**:
- **Config Path**: Verify docker exec command path in claude_desktop_config.json
- **Container Name**: Must be exactly "clean-cut-mcp" (unique, no conflicts)
- **STDIO Transport**: Use docker exec, not direct HTTP connection

## 🚨 CRITICAL: Proven Claude Desktop Configuration Safety Rules

**NEVER** break Claude Desktop configuration again. These rules are based on validated research:

# ALWAYS, AND I MEAN ALWAYSSSSSS CHECK EVERYTHING BEFORE SAYING IT IS WORKING!!!!!!
# We have to have ONE SCRIPT that installs everything flawlessly, E2E. Nothing else is acceptable!!!!!!
# ALWAYS VALIDATE WHAT YOU ARE NOT SURE ABOUT OR NO KNOW WITH ONLINE RESEARCH

## 🚨 CRITICAL: NEVER BREAK WORKING SYSTEMS WHILE CLEANING

**CATASTROPHIC ERROR PREVENTION (Sept 2025):**

### **ABSOLUTE RULE: NEVER DELETE WORKING DIRECTORIES**
- **NEVER** use `rm -rf clean-cut-workspace` to "clean up" for external users
- **NEVER** replace working workspace directories wholesale
- **ALWAYS** use .gitignore to exclude files from repository without breaking functionality
- **ALWAYS** test system works after each cleanup step

### **WRONG Approach (BREAKS SYSTEM):**
```bash
rm -rf clean-cut-workspace          # DESTROYS working registerRoot() chain
mv clean-workspace-clean clean-cut-workspace  # BREAKS Studio completely
# Result: "Waiting for registerRoot()" error, unusable system
```

### **CORRECT Approach (PRESERVES FUNCTIONALITY):**
```bash
# Add to .gitignore instead:
clean-cut-workspace/PersonalAnimation1.tsx
clean-cut-workspace/PersonalAnimation2.tsx
clean-cut-workspace/TestAnimation*.tsx

# System continues working, files just not committed to repository
# External users get clean repo, functionality preserved
```

### **Why This Rule Exists:**
- **Remotion requires precise entry point chain**: index.ts → Root.tsx → registerRoot()
- **Breaking this chain** = "Waiting for registerRoot()" error = completely unusable Studio
- **External users would abandon project** thinking it's non-functional
- **All features useless** if basic Studio won't start

### **Test After Every Change:**
1. **Studio loads** without registerRoot() errors
2. **Basic composition renders** (Main animation)
3. **MCP tools respond** correctly
4. **External user workflow intact**

**REMEMBER**: Working system > Clean repository. Use .gitignore for cleanup, never directory replacement.

---

## 🚨 CRITICAL: PRETTIER CONFIGURATION FOR REMOTION STUDIO DELETION

**WORKING SOLUTION IMPLEMENTED (Sept 2025):**

### Root Cause Analysis:
- **Remotion Studio deletion feature** requires prettier to be available as LOCAL project dependency
- **NOT sufficient:** Global prettier installation at `/usr/local/bin/prettier`
- **Required:** Prettier binary must exist at `/workspace/node_modules/.bin/prettier`
- **Challenge:** Volume mounts overwrite Docker build-time installations

### Working Configuration:
1. **Dockerfile**: Global prettier installation via `npm install -g prettier@3.6.2`
2. **start.js Runtime Setup**: Creates symlink from global to local path
3. **Symlink Creation**: `/workspace/node_modules/.bin/prettier -> /usr/local/bin/prettier`
4. **Persistence**: Symlink created every container startup, survives volume mounts

### Why Other Approaches Failed:
- ❌ **Pure npm install**: Volume mounts overwrite build-time installations
- ❌ **devDependency only**: Docker build vs runtime conflict
- ❌ **Global prettier only**: Remotion Studio can't find it in local project

### Implementation Details:
```javascript
// In start.js - WORKING APPROACH
const prettierBin = path.join(WORKSPACE, 'node_modules', '.bin', 'prettier');
const prettierBinDir = path.join(WORKSPACE, 'node_modules', '.bin');
if (!(await fileExists(prettierBin))) {
  await fsp.mkdir(prettierBinDir, { recursive: true });
  await fsp.symlink('/usr/local/bin/prettier', prettierBin);
}
```

### Test Verification:
- ✅ `docker exec clean-cut-mcp /workspace/node_modules/.bin/prettier --version` returns `3.6.2`
- ✅ Remotion Studio component deletion no longer shows "Prettier cannot be found"
- ✅ Configuration persists across container rebuilds
- ✅ Works with volume-mounted workspace directories

### DO NOT BREAK THIS CONFIGURATION:
- **Never remove** global prettier from Dockerfile
- **Never remove** symlink creation from start.js
- **Never change** workspace directory structure without testing prettier
- **Always test** component deletion in Remotion Studio after changes

**Research Source**: Based on Remotion official Docker docs, Prettier installation guides, and extensive testing of Docker + volume mount scenarios.


### ✅ SAFE CONFIGURATION PRACTICES:
- **ALWAYS** use full Docker path: `"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe"`
- **ALWAYS** escape backslashes: `C:\\Users\\name` not `C:\Users\name`
- **ALWAYS** backup existing config before changes
- **NEVER** overwrite existing MCP servers - merge safely
- **ALWAYS** validate JSON syntax before writing
- **ALWAYS** use unique container name: `clean-cut-mcp`

### ❌ WAYS TO BREAK CLAUDE DESKTOP:
1. **Wrong Command Path**: Using `docker` instead of full path → "Cannot connect to MCP server"
2. **Wrong File Name**: Writing to `config.json` instead of `claude_desktop_config.json`
3. **JSON Corruption**: PowerShell `ConvertTo-Json` malformed output
4. **Log Pollution**: Using `console.log()` in MCP server → "Unexpected token" errors
5. **Container Conflicts**: Using existing container names → Docker daemon conflicts

## 🎯 PROJECT GOAL: "One-Script Magic"
User asks: "Create a text reveal animation" → Claude responds: "Animation ready at http://localhost:6970"
User exports video from Remotion Studio → Video automatically appears in `./clean-cut-exports` folder

## 🏗️ ARCHITECTURE: Cross-Platform Docker + MCP + Remotion
- **Docker Container**: Cross-platform design - works on Windows Docker Desktop OR WSL2 Docker
- **MCP Server**: HTTP transport in Docker container (NOT STDIO for Docker compatibility)
- **Container Name**: `clean-cut-mcp` (unique, no conflicts)
- **Ports**: 6970 (Remotion Studio), 6971 (MCP HTTP Server)
- **Tools**: `create_animation`, `list_animations`, `get_studio_url`, `get_export_directory`
- **Animation Types**: text-reveal, logo-entrance, shape-morphing, data-visualization, particle-effects, slide-transitions, ui-animations, kinetic-typography
- **Networking**: Container exposes localhost:6970-6971 to Windows for Claude Desktop connection
- **Video Export**: Docker volume mount `/workspace/out` → `./clean-cut-exports` (cross-platform)

## 🔧 LOGGING REQUIREMENTS:
- **NEVER** use `console.log()` in MCP server (pollutes JSON-RPC stdout)
- **ALWAYS** use `console.error()` for logs (stderr only)
- **RESULT**: Clean JSON-RPC communication with Claude Desktop

## 📁 PROJECT STRUCTURE:
```
clean-cut-mcp/
├── src/                    # MCP server source
├── Dockerfile              # Container definition
├── docker-compose.yml      # Cross-platform Docker Compose setup
├── package.json            # Dependencies
├── install.ps1             # Bulletproof installer
├── clean-cut-exports/      # Video export directory (created automatically)
└── CLAUDE.md               # This file
```

## 🎬 VIDEO EXPORT SYSTEM: Cross-Platform External Access

### How It Works
Clean-Cut-MCP uses Docker volume mounting to provide seamless video export access across all platforms:

```
Container: /workspace/out ←→ Host: ./clean-cut-exports
```

### Export Workflow
1. **Create Animation**: Ask Claude to create an animation (bouncing ball, sliding text, etc.)
2. **Open Remotion Studio**: Navigate to http://localhost:6970
3. **Export Video**: Use Remotion Studio's export functionality
4. **Find Your Video**: Ask Claude to use `open_export_directory` tool for instant access
5. **Alternative**: Check the `clean-cut-exports` folder in your project directory manually
6. **Done!**: Video is immediately accessible on your host system

### Cross-Platform Compatibility

**Windows (PowerShell Installer)**:
```powershell
.\install.ps1
# Creates and mounts: .\clean-cut-exports
```

**macOS/Linux (Docker Compose)**:
```bash
docker-compose up -d
# Creates and mounts: ./clean-cut-exports
```

**Manual Docker Run with Full Persistence**:
```bash
# Windows
docker run -d --name clean-cut-mcp -p 6970:6970 -p 6971:6971 -v "%cd%/clean-cut-exports:/workspace/out" -v "%cd%/clean-cut-components:/workspace/src" clean-cut-mcp

# macOS/Linux
docker run -d --name clean-cut-mcp -p 6970:6970 -p 6971:6971 -v "$(pwd)/clean-cut-exports:/workspace/out" -v "$(pwd)/clean-cut-components:/workspace/src" clean-cut-mcp
```

### MCP Tools Available
- `get_export_directory` - Shows detailed export directory information and navigation instructions
- `open_export_directory` - Opens export directory in native file manager (Explorer, Finder, etc.)
- `create_animation` - Creates animations ready for export
- `list_animations` - Lists all available animations  
- `get_studio_url` - Gets Remotion Studio URL

### Technical Implementation
- **Video Export Volume**: `/workspace/out` (container) ↔ `./clean-cut-exports` (host)
- **Component Persistence Volume**: `/workspace/src` (container) ↔ `./clean-cut-components` (host)
- **Auto-Creation**: Both directories created automatically with proper permissions
- **Path Conversion**: Windows paths automatically converted for Docker compatibility
- **Complete Persistence**: Components survive container rebuilds and restarts

## 🛡️ INSTALLATION SAFETY:
The PowerShell installer MUST:
1. Validate Docker installation first
2. Create backup of existing Claude config
3. Safely merge with existing MCP servers (preserve desktop-commander, etc.)
4. Use proper Windows paths with escaped backslashes
5. Test container startup before config changes
6. Automatic rollback if any step fails

## 🔄 DEVELOPMENT WORKFLOW:
1. Build container: `docker build -t clean-cut-mcp .`
2. Test standalone: `docker run -it clean-cut-mcp`
3. Test MCP: Run installer with `-TestMode`
4. Validate: Create animation end-to-end
5. Deploy: Full installation

## 🌐 NETWORKING TROUBLESHOOTING:
**WSL2 to Windows Connection Issues:**
- Container runs in WSL2 Docker but Windows Claude Desktop needs to connect
- WSL2 should auto-forward localhost:6970-6971 to Windows, but sometimes fails
- **Test from Windows PowerShell**: `Invoke-RestMethod http://localhost:6971/health`
- **If connection fails**: Use WSL2 IP address (get with `hostname -I` in WSL2)
- **Windows Firewall**: May block WSL2 port forwarding
- **Alternative**: Run `netsh interface portproxy` commands to force port forwarding

## 🚨 NEVER FORGET:
This project exists because the original `rough-cuts-mcp` had:
- Container name conflicts
- JSON-RPC pollution from logs
- Corrupted Claude Desktop configs
- Complex installation failures

**Clean-Cut-MCP must be bulletproof and never break anything.**
**Docker containers are cross-platform by design - don't move them between platforms.**


# CRITICAL: REMOTION COMPONENT EXPORT PATTERN
When generating React/Remotion components, ALWAYS use this exact export pattern:

```typescript
export const ComponentName: React.FC = () => {
  // component code
};
export default ComponentName;
```

**NEVER use `const ComponentName:` - it causes undefined component errors in Remotion Studio.**

See REMOTION_EXAMPLES.md and REMOTION_GUIDELINES.md for complete reference patterns.

# CRITICAL: NEVER CLAIM SUCCESS WITHOUT THOROUGH VERIFICATION
NEVER say "MISSION ACCOMPLISHED" or claim something is "working" without complete testing!
- ALWAYS test every animation individually in Remotion Studio using Playwright MCP
- ALWAYS check for JavaScript errors in browser console via Playwright
- ALWAYS verify animations actually render without errors before claiming success
- NEVER assume fixing imports means animations work - ALWAYS VALIDATE
- NEVER claim "all animations working" without testing EACH ONE individually
- If you see ANY JavaScript errors, the system is BROKEN - don't claim success
- Use Playwright MCP for EVERY claim about Studio functionality - no exceptions
- MANDATORY: Check browser console messages for errors before any success claims

# CRITICAL: ALWAYS USE PLAYWRIGHT MCP FOR STUDIO TESTING
ALWAYS use the Playwright MCP to check if Remotion Studio is working correctly!
Use `mcp__playwright__browser_navigate` to http://localhost:6970 to verify animations are visible.
This is the ONLY reliable way to test Studio functionality - never assume it works without verification.

# CRITICAL: NO EMOJIS IN CODE - JSON PARSING ERRORS
NEVER use emoji characters in MCP server code, tool responses, or log messages.
These cause "Unexpected token" JSON parsing errors in Claude Desktop.

## BANNED EMOJIS - DO NOT USE
- ❌ NO cross marks - use [ERROR] instead
- ✅ NO checkmarks - use [OK] instead  
- 🚀 NO rockets - use [LAUNCH] instead
- 💡 NO lightbulbs - use [TIP] or [SOLUTION] instead
- 🔥 NO fire - use text like "CRITICAL:" or "HOT:" instead
- 🎯 NO targets - use [TARGET] or remove
- 📊 NO charts - use [STATS] instead
- ⚠️ NO warning signs - use [WARNING] instead
- 🚨 NO sirens - use [ALERT] instead
- 📹 NO cameras - use [VIDEO] instead
- 🛠️ NO tools - use [FIX] or [TOOLS] instead
- 🔧 NO wrenches - use [REPAIR] or [CONFIG] instead
- 📁 NO folders - use "Directory:" instead
- 🎬 NO clappers - use [VIDEO] or remove
- ANY OTHER EMOJI - Replace with appropriate text marker

# CRITICAL: LET USER BUILD DOCKER THEMSELVES
When Docker changes are made, STOP and let user run: `docker build -t rough-cuts-test .`