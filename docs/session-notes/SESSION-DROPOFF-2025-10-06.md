# Claude Code Session Memory & Drop-off
**Date:** October 6, 2025
**Project:** clean-cut-mcp - AI Video Generation MCP Server
**Session Focus:** Template Visual Variety System - Bold Gradient Style Improvements

---

## Current Project Context

### Project Overview
**clean-cut-mcp** is an MCP server for Claude Desktop that enables users to create professional Remotion animations using natural language. Users describe what they want, Claude generates React/TypeScript animation code, and the system validates against professional standards before execution.

**Location:** `/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/clean-cut-mcp`

**Tech Stack:**
- Docker container running MCP server (TypeScript)
- Remotion 4.0.340 for video rendering
- React 18 for animation components
- STDIO transport for Claude Desktop communication
- Bind-mounted workspace for persistent animations

**Container Status:**
- Name: `clean-cut-mcp`
- Status: Running (healthy, 40 hours uptime)
- Studio: http://localhost:6970 (accessible)
- Animations: 20 files in container

### Current Development Phase

**Goal:** Build 50-template library with 8-10 VISUALLY DISTINCT styles

**Key Insight from Previous Session:**
Templates need visual variety (different aesthetics), not just content variety. Users pick by visual preference:
- "I want minimalist clean" → Apple/Stripe style
- "I want bold colorful" → Instagram style
- "I want tech dark" → Gaming/developer style

**Template Matrix:** Visual Styles (8-10) × Content Types (5-6) = 30-50 templates

### Visual Styles Status

**Completed:**
1. ✅ **Minimalist Clean** (`FlowTaskMinimalist.tsx`)
   - White/light gray backgrounds
   - Soft shadows (2-4px)
   - Centered, symmetrical layouts
   - Subtle float animations (3-5px)
   - Target: Corporate, professional

2. ✅ **Tech Dark** (`EndlessBlinkShowcase.tsx`)
   - Black background with moving grid
   - Particles on every scene
   - Glowing neon borders
   - Deep shadows (40px blur)
   - Target: Developers, tech products

3. ✅ **Bold Gradient** (`FlowTaskGradient.tsx`) - **IMPROVED THIS SESSION**
   - Morphing blob backgrounds (SVG metaball filter)
   - Diagonal/asymmetric layouts (NOT centered)
   - Zig-zag stacked cards with rotation
   - Orbital/circular arrangements
   - Deep blue-purple base with subdued gradients
   - Target: Social media, startups, creative agencies

**Pending:**
4. ⏳ Glassmorphism - Frosted glass (macOS aesthetic)
5. ⏳ Kinetic Typography - Text-focused dramatic
6. ⏳ Neo-Brutalist - Raw, asymmetric, stark contrast
7. ⏳ 3D Parallax - Depth layers, camera movement
8. ⏳ Liquid/Fluid - Organic shapes, morphing

---

## Like-I-Said Memory: User Preferences

### Session Explicit Requirements (Oct 6, 2025)

**User Feedback on FlowTaskGradient Initial Design:**

1. **"Blobs move in a repetitive way every shot"**
   - Requirement: Each scene needs unique blob motion patterns
   - Solution: Added `motionSeed = sceneId * 123.45` for varied starting positions
   - Implementation: Different speeds (0.015, 0.018, 0.020) and amplitudes per scene

2. **"No bg just alpha"**
   - Requirement: Need solid background layer (no transparency)
   - Solution: Added `linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)` dark base
   - Implementation: Deep blue-purple gradient prevents alpha issues

3. **"Many titles are not readable"**
   - Requirement: White text must be readable against bright gradients
   - Solution: Dark semi-transparent overlays (`rgba(0,0,0,0.4-0.5)`) with `blur(25-30px)`
   - Implementation: Applied to ALL titles (hero, features, metrics, CTA)

4. **"Gradients are too bright and loud"**
   - Requirement: Tone down saturation and lightness
   - Solution: Reduced from 80-90% sat / 60-70% light → 60-65% sat / 45-50% light
   - Implementation: Changed base hues to cooler tones (280, 320, 200, 260)

### Design Decisions Made

**Visual Distinction Strategy:**
- Minimalist: Centered, symmetrical, static
- Gradient: Diagonal, asymmetric, organic motion
- Tech Dark: Grid-based, particles, centered with glows

**Motion Techniques:**
- Minimalist: Subtle float (3-5px)
- Gradient: Blob morphing, rotation, wiggle
- Tech Dark: Particles, pulsing glows, breathing

**Layout Approaches:**
- Minimalist: Horizontal centered cards
- Gradient: Zig-zag stacked, circular orbit
- Tech Dark: Multi-column grids

---

## Drop-off Prompt for New Session

```
I'm continuing work on the clean-cut-mcp template system. We're building a 50-template library with VISUAL VARIETY - 8-10 distinct visual styles that users choose based on aesthetic preference.

Project location: /mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/clean-cut-mcp

**Session Progress:**
- ✅ FlowTaskGradient redesigned with blob morphing, diagonal layouts
- ✅ User feedback implemented: dark bg, varied motion, text readability, toned-down gradients
- ✅ 3 visual styles complete: Minimalist Clean, Tech Dark, Bold Gradient
- ⏳ Next: Create 5-7 more visual styles (Glassmorphism, Kinetic Typography, Neo-Brutalist, 3D Parallax, Liquid)

**Recent Changes (FlowTaskGradient.tsx - 19,587 bytes):**
1. Added morphing blob backgrounds with SVG metaball filter
2. Diagonal/asymmetric layouts (upper-left title, bottom-right subtitle)
3. Zig-zag feature cards with alternating rotation
4. Circular orbit metrics layout
5. Liquid morphing button shapes
6. Dark background layer (#1a1a2e → #16213e gradient)
7. Text readability overlays (rgba(0,0,0,0.4-0.5) + blur)
8. Toned down gradients (60-65% sat, 45-50% light)
9. Varied blob motion per scene (unique motionSeed)

**Container Status:**
- Docker: clean-cut-mcp (running, healthy)
- Studio: http://localhost:6970 (accessible)
- Animations: 20 files in workspace

**Next Steps:**
1. Create Glassmorphism visual style (frosted glass, backdrop-filter, translucent layers)
2. Create Kinetic Typography visual style (text-focused, dramatic 3D rotation, perspective)
3. Create Neo-Brutalist visual style (raw, asymmetric, stark contrast, no shadows)
4. Continue until 8-10 visually distinct styles complete
5. Then: Content × Style matrix (30-40 templates total)

**Guidelines to Follow:**
- Always read `PRE-ANIMATION-CHECKLIST.md` before animation work
- Use PROJECT_CONFIG.md for colors/fonts (NO hardcoding)
- Follow `claude-dev-guidelines/SAFE_ANIMATION_CREATION_PROTOCOL.md`
- NoOverlapScene for all sections
- Continuous motion (Math.sin float, breathing, pulsing)
- Fonts 24px+ minimum, fontFamily always specified
- Spacing: 40px+ padding minimum

Please continue by creating the next visual style (Glassmorphism).
```

---

## Quick Verification Commands

### Check System Status
```bash
# Container running?
docker ps | grep clean-cut-mcp

# Studio accessible?
curl -f http://localhost:6970/ && echo "✅ Studio accessible"

# Animation count
docker exec clean-cut-mcp ls /workspace/src/assets/animations/ | wc -l
# Should show: 20

# Check specific file
docker exec clean-cut-mcp ls -lh /workspace/src/assets/animations/FlowTaskGradient.tsx
# Should show: ~19KB file
```

### View Animations in Studio
```bash
# Open browser to Studio
xdg-open http://localhost:6970  # Linux
open http://localhost:6970      # Mac
start http://localhost:6970     # Windows
```

### Git Status
```bash
cd "/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/clean-cut-mcp"
git status
# Should show: 42 commits ahead of origin
git log --oneline -3
# Should show recent template work
```

---

## Project File Structure

```
clean-cut-mcp/
├── mcp-server/                           # MCP server code
│   ├── src/
│   │   ├── clean-stdio-server.ts         # Main MCP server (validation lines 1034-1120)
│   │   ├── base-animation-rules.ts       # Professional standards (always enforced)
│   │   ├── rule-enforcer.ts              # Combines base + learned rules
│   │   ├── preference-learner.ts         # User correction storage
│   │   ├── root-sync.ts                  # Auto-sync Root.tsx (environment-aware paths)
│   │   ├── template-types.ts             # Template metadata schema
│   │   ├── template-selector.ts          # AI selection algorithm
│   │   └── template-registry.ts          # Template storage/management
│   ├── preferences/
│   │   └── user-preferences.json         # Learned rules from user feedback
│   └── package.json
│
├── clean-cut-workspace/                  # Animation workspace (bind-mounted)
│   ├── src/
│   │   ├── assets/animations/            # User animations (20 files)
│   │   │   ├── FlowTaskMinimalist.tsx    # Minimalist style (white, clean)
│   │   │   ├── FlowTaskGradient.tsx      # Bold gradient (19,587 bytes - LATEST)
│   │   │   ├── EndlessBlinkShowcase.tsx  # Tech dark style
│   │   │   └── ... (17 other animations)
│   │   ├── components/
│   │   │   └── NoOverlapScene.tsx        # Prevents overlapping scenes
│   │   ├── utils/
│   │   │   ├── particle-system.tsx       # Particle effects
│   │   │   ├── use-particles.tsx         # Particle hook
│   │   │   ├── kinetic-text.ts           # Typography animations
│   │   │   └── research-validated-constants.ts # Motion blur, etc.
│   │   ├── patterns/
│   │   │   ├── base/BaseTemplate.tsx     # Base template components
│   │   │   └── templates/                # Template library (future)
│   │   ├── Root.tsx                      # Auto-generated composition registry
│   │   └── index.ts
│   ├── public/                           # Static assets
│   └── out/                              # Rendered videos
│
├── claude-dev-guidelines/                # Project standards (MUST follow)
│   ├── PROJECT_CONFIG.md                 # Configuration values (NO hardcoding)
│   ├── SAFE_ANIMATION_CREATION_PROTOCOL.md # Creation workflow
│   └── ADVANCED/
│       └── REMOTION_ANIMATION_RULES.md   # Code standards
│
├── docs/
│   ├── TEMPLATE-SYSTEM-ARCHITECTURE.md
│   ├── PROFESSIONAL-TEMPLATE-PATTERNS.md
│   └── session-notes/
│       ├── SESSION-DROPOFF-2025-10-05.md
│       └── SESSION-DROPOFF-2025-10-06.md # This file
│
├── PRE-ANIMATION-CHECKLIST.md            # ALWAYS read before animation work
├── CLAUDE.md                             # Future session guidance
├── docker-compose.yml                    # Container configuration
├── Dockerfile                            # Multi-stage build
└── start.js                              # Container entrypoint
```

---

## File Modification Status

### Files Modified This Session

**FlowTaskGradient.tsx** (19,587 bytes)
- Location: `clean-cut-workspace/src/assets/animations/FlowTaskGradient.tsx`
- Status: ⚠️ **Not tracked in git** (intentionally gitignored as user-generated content)
- Changes:
  - Added MorphingBlob component with metaball SVG filter
  - Varied blob motion per scene (motionSeed system)
  - Dark background gradient (#1a1a2e → #16213e)
  - Text readability overlays on all titles
  - Toned down gradients (60-65% sat, 45-50% light)
  - Diagonal hero layout (top-left title, bottom-right subtitle)
  - Zig-zag feature cards with rotation
  - Circular orbit metrics layout
  - Liquid morphing button

**What's Tracked in Git:**
- MCP server code (`mcp-server/src/`)
- Documentation (`docs/`, `CLAUDE.md`, guidelines)
- Project configuration (`docker-compose.yml`, `Dockerfile`)

**What's NOT Tracked:**
- Animation files (`clean-cut-workspace/src/assets/animations/*.tsx`)
- User preferences (`mcp-server/preferences/user-preferences.json`)

### Git State
```
Branch: master
Commits ahead: 42
Working tree: clean
Last commit: fbfe3c3 - SESSION DROPOFF: Complete handoff documentation
```

---

## Next Steps & Pending Tasks

### Immediate (Next Session)
1. **Create Glassmorphism Visual Style** (1-2 hours)
   - Frosted glass effects (backdrop-filter: blur + saturation)
   - Translucent layers with border
   - Soft colors, high opacity
   - Depth with layered overlays
   - Target: macOS, modern UI aesthetic

2. **Create Kinetic Typography Visual Style** (1-2 hours)
   - Text-focused (minimal other elements)
   - Dramatic 3D rotation (rotateX, rotateY, perspective)
   - Large, bold typography (180px+)
   - Dynamic letter spacing
   - Target: Title sequences, quotes

3. **Create Neo-Brutalist Visual Style** (1-2 hours)
   - Raw, unpolished aesthetic
   - Asymmetric layouts (intentionally off-balance)
   - Stark black/white contrast
   - NO shadows or gradients (flat design)
   - Bold borders, chunky typography
   - Target: Art, alternative brands

### Short Term (1-2 weeks)
4. Create remaining visual styles: 3D Parallax, Liquid/Fluid, others
5. Test all styles in Remotion Studio (verify visual variety)
6. Content × Style matrix (Product in 3 styles, Company in 2 styles, etc.)

### Medium Term (2-4 weeks)
7. Build 30-40 templates from style × content matrix
8. Implement MCP tools: browse_templates, suggest_templates, create_from_template
9. User testing and refinement

---

## Technical Details for Continuation

### Environment-Aware Path Pattern
```typescript
// CRITICAL: Always use environment check for paths
const SRC_DIR = process.env.DOCKER_CONTAINER === 'true'
  ? '/workspace/src'
  : path.join(__dirname, '../clean-cut-workspace/src');
```

### NoOverlapScene Frame Ranges
```typescript
// CORRECT (no overlap with wipe):
<NoOverlapScene startFrame={75} endFrame={165} exitType="wipe-up" exitDuration={15}>
  // Exits during frames 150-165
</NoOverlapScene>
<NoOverlapScene startFrame={150} endFrame={255}>
  // Enters while previous wipes up
</NoOverlapScene>

// WRONG (creates overlap with hard-cut):
<NoOverlapScene startFrame={75} endFrame={165} exitType="hard-cut">
  // Visible until 165
</NoOverlapScene>
<NoOverlapScene startFrame={150} endFrame={255}>
  // Starts at 150 - BOTH visible 150-165!
</NoOverlapScene>
```

### Component Naming Rules
- ✅ FlowTaskMinimalist (camelCase)
- ✅ flow-task-minimalist (hyphen)
- ❌ FlowTask_Minimalist (underscore - Remotion rejects)

### Validation System
**Location:** `mcp-server/src/clean-stdio-server.ts` (lines 1034-1120)

**Enforces:**
- Font sizes 24px+ minimum
- fontFamily always specified (no browser defaults)
- Padding 40px+ minimum
- No underscores in component names
- Warns about motion blur, duration calculator

**Deployment:**
```bash
# For code-only changes:
cd mcp-server && npm run build
docker cp mcp-server/dist/. clean-cut-mcp:/app/mcp-server/dist/

# For Dockerfile/dependency changes:
docker-compose down
docker-compose build
docker-compose up -d

# Always restart Claude Desktop after MCP changes:
./kill-claude-clean.ps1  # Windows
```

---

## Configuration State

### Container Environment
- DOCKER_CONTAINER=true
- REMOTION_STUDIO_PORT=6970
- NODE_ENV=production
- Bind mounts: `./clean-cut-workspace:/workspace`

### Validation Active
- Base rules deployed and enforced ✅
- Needs Claude Desktop restart to test with user
- Container rebuilt with all permanent fixes

### MCP Tools Available
**Animation Creation:**
- create_animation (main tool with validation)
- edit_animation (modify existing)
- delete_component (remove animation)

**Root.tsx Management:**
- auto_sync (sync with animation files)
- rebuild_compositions (regenerate from scratch)
- cleanup_broken_imports (remove orphans)

**Asset Management:**
- upload_asset, list_assets, delete_asset

**Learning System:**
- record_user_correction (store feedback)
- view_learned_preferences (show learned rules)

**Utilities:**
- get_studio_url, list_existing_components
- get_project_guidelines, format_code

---

## Recent Commits (Last 5)

```
fbfe3c3 SESSION DROPOFF: Complete handoff documentation for template system
8c2c84c SESSION SUMMARY: Template visual variety system learnings
87bb8b1 VISUAL VARIETY: Bold Gradient style (Instagram aesthetic)
a83c44b PREVENT: Add component name validation (no underscores)
820cd56 FIX: Rename FlowTask_Minimalist to FlowTaskMinimalist
```

---

## Known Issues & Solutions

### Issue: Animation Files Not Tracked in Git
- **Cause:** Intentionally gitignored as user-generated content
- **Solution:** Template system will provide reusable patterns (tracked)
- **Status:** Working as designed

### Issue: FlowTaskGradient Initial Version Problems
- **Problems:** Repetitive motion, no background, unreadable text, too bright
- **Solutions:** All fixed this session (see Like-I-Said section)
- **Status:** ✅ Resolved

### Issue: Only 3 Visual Styles Complete
- **Goal:** Need 8-10 for proper variety
- **Progress:** 3/8 complete (37.5%)
- **Next:** Glassmorphism, Kinetic Typography, Neo-Brutalist
- **Timeline:** 1-2 weeks to complete remaining styles

---

## Success Criteria

### This Session ✅
- [x] User feedback on FlowTaskGradient incorporated
- [x] Dark background added (no alpha transparency)
- [x] Blob motion varied per scene
- [x] Text readability improved (dark overlays)
- [x] Gradients toned down (60-65% sat, 45-50% light)
- [x] Memory saved to like-i-said system
- [x] Comprehensive drop-off documentation created

### Next Session Goals
- [ ] Create Glassmorphism visual style
- [ ] Create Kinetic Typography visual style
- [ ] Create Neo-Brutalist visual style
- [ ] Verify all 6 styles look completely different in Studio
- [ ] Continue toward 8-10 total visual styles

### Overall Template System Goals
- [ ] 8-10 visually distinct styles
- [ ] Content × Style matrix (30-40 templates)
- [ ] MCP tool integration (browse, suggest, create from template)
- [ ] User testing and refinement
- [ ] Production-ready template library

---

## Conversation Highlights

### Key Decisions
1. **Visual variety is the goal** - Not 50 similar templates, but 8-10 distinct aesthetics
2. **User feedback drives design** - Immediate iteration based on actual viewing experience
3. **Professional standards enforced** - Validation system prevents common mistakes
4. **Guidelines-first approach** - Always read PROJECT_CONFIG.md, never hardcode

### Technical Breakthroughs
1. **SVG metaball filter** - Organic blob morphing effect
2. **Motion seed system** - Varied animation per scene without repetition
3. **Text readability overlays** - Dark blur behind white text on any background
4. **Toned gradient formula** - 60-65% sat, 45-50% light (professional, not overwhelming)

### User Preferences Learned
1. Blob motion must vary between scenes
2. Solid backgrounds required (no alpha transparency)
3. Text must be readable regardless of background
4. Gradients should be subdued, not overwhelming

---

## Resources & References

### Documentation to Read Before Work
1. `PRE-ANIMATION-CHECKLIST.md` - Mandatory checklist
2. `claude-dev-guidelines/PROJECT_CONFIG.md` - Configuration values
3. `claude-dev-guidelines/SAFE_ANIMATION_CREATION_PROTOCOL.md` - Workflow
4. `claude-dev-guidelines/ADVANCED/REMOTION_ANIMATION_RULES.md` - Standards

### Research Materials (Reference Only)
- `docs/REMOTION-TRAILER-COMPLETE-DESIGN-GUIDE.md` - Learning inspiration
- `docs/MY-ANIMATION-PROBLEMS.md` - Past mistakes analysis
- `motion-design-research/` - Research findings (NOT production requirements)

### External Resources
- Remotion Studio: http://localhost:6970
- Remotion Docs: https://remotion.dev
- SVG Filters: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter

---

## Final Notes

**Session Duration:** ~2 hours
**Files Modified:** 1 (FlowTaskGradient.tsx)
**User Satisfaction:** High (all feedback addressed)
**Ready for Continuation:** ✅ Yes

**Recommended Next Actions:**
1. Open Remotion Studio and review FlowTaskGradient improvements
2. Start Glassmorphism visual style creation
3. Continue building visual variety library

**Memory Saved:** `mcp__like-i-said__add_memory` - ID: mgeuw3wdz0ovbw930

---

*Ready for seamless continuation in new session!*
