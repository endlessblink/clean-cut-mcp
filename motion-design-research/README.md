# Motion Design Research Project

**Status**: Internal research project (not shipped with clean-cut-mcp)

## Purpose

Extract **validated parameter sets with flexibility rules** from professional motion graphics templates.

**The Problem**: AI lacks subjective aesthetic judgment ("taste")
**The Solution**: Extract complete parameter sets from human-designed professional work, with rules for what can/cannot be changed

## Key Difference from Previous Approach

**❌ Old approach**: Extract "patterns" (slide-up, stagger, etc.)
- Problem: AI still had to make aesthetic decisions about WHEN and HOW to use patterns
- Result: Technically correct but aesthetically poor animations

**✅ New approach**: Extract "validated parameter sets with flexibility rules"
- Solution: Complete parameter configurations from professional designers
- Includes: FIXED values (must not change), FLEXIBLE values (safe to adapt), RULES for adaptation
- Result: Professional aesthetic foundation with controlled flexibility

## Architecture

```
motion-design-research/
├── analysis-tools/                    # Scripts to analyze templates
│   ├── template-analyzer.ts          # Analyze Remotion templates
│   ├── parameter-extractor.ts        # Extract validated parameter sets
│   └── flexibility-rule-generator.ts # Determine what can/cannot change
│
├── template-sources/                  # Downloaded professional templates
│   ├── remotion-templates/           # From remotiontemplates.dev
│   ├── vimeo-examples/               # Vimeo Staff Pick examples
│   └── behance-examples/             # Behance featured work
│
├── validated-parameter-sets/         # JSON parameter sets (committed to git)
│   ├── hero-scenes.json              # Validated hero scene configurations
│   ├── transition-sets.json          # Transition parameter sets
│   ├── layout-configurations.json    # Layout parameter sets
│   └── typography-sets.json          # Typography configurations
│
├── experiments/                       # Test implementations (gitignored)
└── notebooks/                         # Analysis notebooks (gitignored)
```

## Workflow

### Phase 1: Template Collection
```bash
# Download/clone professional Remotion templates
npm run collect:remotion-templates
npm run collect:vimeo-examples
```

### Phase 2: Parameter Extraction
```bash
# Analyze template code to extract parameter sets
npm run analyze:template --input template-sources/remotion-templates/hero-1
```

**What gets extracted:**
- FIXED parameters (spring damping: 100 - DO NOT CHANGE)
- FLEXIBLE parameters (colors, content text - SAFE to change)
- ADAPTATION rules (if text.length > 10, reduce fontSize by 20%)
- CONTEXT (when to use this parameter set)

### Phase 3: Validation
```bash
# Test parameter sets with different content
npm run test:parameter-set --set hero-scenes/bold-centered-v1
```

### Phase 4: Export
```bash
# Export validated sets to JSON
npm run export:validated-sets
```

### Phase 5: MCP Integration
```typescript
// In clean-cut-mcp MCP server:
import paramSets from '../motion-design-research/validated-parameter-sets/hero-scenes.json';

// Generate animation using validated parameters
const scene = generateScene({
  parameterSet: paramSets.find(s => s.context === 'tech-product-launch'),
  content: userContent,  // Flexible
  // All aesthetic decisions come from parameter set
});
```

## What Gets Extracted (NEW APPROACH)

### Complete Parameter Sets with Flexibility Rules

Instead of extracting individual "patterns", we extract **complete validated configurations**:

**1. Fixed Parameters** (Aesthetic Core - Don't Touch)
- Spring physics values (damping, stiffness)
- Typography weights (800 for headlines, 400 for body)
- Timing durations (20 frames entry, 15 frames exit)
- Spacing values (80px padding, 60px margins)
- Motion parameters (slide distance, scale ranges)

**2. Flexible Parameters** (Safe to Customize)
- Colors (background, text, accent)
- Content (text, images, logos)
- Size adjustments (±10% within safe ranges)

**3. Adaptation Rules** (Context-Specific Logic)
- If text longer than X → reduce size by Y%
- If background dark → ensure text light
- If multiple elements → increase spacing
- If high energy scene → reduce transition duration

**4. Usage Context** (When to Use This Set)
- Scene type (hero, feature list, CTA, etc.)
- Brand style (tech, elegant, playful, etc.)
- Energy level (calm, moderate, energetic)
- Complexity (simple, medium, complex)

## Application in MCP

**New approach** - Generate from validated parameter sets:

```typescript
// User request: "Create hero scene for tech product"

// MCP finds matching parameter set
const paramSet = findValidatedSet({
  sceneType: 'hero',
  brandStyle: 'tech',
  energyLevel: 'moderate'
});

// Generate scene with NO aesthetic judgment
const scene = generateFromParameterSet({
  set: paramSet,
  content: {
    headline: "CLEAN-CUT",  // User content
    body: "Professional Video Generation MCP"
  },
  customizations: {
    accentColor: "#10b981"  // User branding (within flexible params)
  }
});

// Result: Professional quality with controlled flexibility
```

## Data Sources

### Professional Datasets
- **Vimeo Staff Picks**: Award-winning motion graphics
- **Behance Featured**: Curated professional portfolios
- **Dribbble Popular**: Community-validated motion design
- **Remotion Templates**: Pre-validated React animation templates
- **Awwwards Motion**: Award-winning web animations

### Academic Datasets (Future)
- **Anita Dataset**: 16,000+ professional animation keyframes
- **Motion-X**: 81.1K professional motion sequences
- **LottieFiles**: 800,000+ professional animations

## Installation

### Node.js Tools
```bash
cd motion-design-research
npm install
```

### Python Tools (for computer vision analysis)
```bash
pip install opencv-python scikit-learn jupyter numpy pandas matplotlib seaborn
```

### Optional: GPU Acceleration
```bash
pip install opencv-contrib-python  # For GPU-accelerated CV operations
```

## Usage Examples

### Download Professional Examples
```bash
npm run download:vimeo -- --count 100 --min-likes 1000
```

### Extract Patterns
```bash
npm run analyze:colors -- --input datasets/vimeo-staff-picks --output extracted-patterns/colors.json
```

### Apply to MCP
```typescript
// In mcp-server/src/animation-generator.ts
import { professionalPatterns } from '../../motion-design-research/extracted-patterns';
```

## Research Questions

### Current Focus
1. What color combinations appear most in award-winning motion graphics?
2. What spatial proportions create professional-looking layouts?
3. What typography weight progressions signal quality?
4. What timing patterns feel smooth and professional?

### Future Research
1. Can we train a model to score aesthetic quality objectively?
2. What motion choreography patterns create visual interest?
3. How do professional transitions differ from amateur ones?
4. What makes text animation feel "kinetic" vs "static"?

## Output Format

All extracted patterns are exported as JSON for easy import:

```json
{
  "color_palettes": [
    {
      "id": "dark-developer-theme",
      "primary": "#0a0a0a",
      "accent": "#10b981",
      "text": "#f0f6fc",
      "grid": "#2a2a2a",
      "source": "vimeo-staff-pick-12345",
      "rating": 95,
      "context": "developer tool showcase"
    }
  ],
  "layout_proportions": [...],
  "typography_rules": [...],
  "timing_patterns": [...]
}
```

## Integration with clean-cut-mcp

This research project **informs** clean-cut-mcp but is **not shipped** with it:

- ✅ **Extracted patterns**: Committed to git, imported by MCP
- ❌ **Analysis tools**: Not shipped to users
- ❌ **Datasets**: Too large, gitignored
- ❌ **Experiments**: Development only, gitignored

## Contributing Patterns

When you discover effective patterns manually:

```bash
# Add to extracted-patterns/*.json
# Document source and context
# Commit to git for MCP to use
```

## License

Internal research project for clean-cut-mcp development. Extracted patterns become part of clean-cut-mcp's knowledge base.

## References

- [Remotion Trailer Analysis](../docs/REMOTION-TRAILER-COMPLETE-DESIGN-GUIDE.md)
- [Animation Problems Analysis](../docs/MY-ANIMATION-PROBLEMS.md)
- [Computer Vision for Motion Analysis](../docs/perplexity-query-visual-design-gap.md)

---

**Next Steps**: Build analysis tools to extract patterns from professional datasets
