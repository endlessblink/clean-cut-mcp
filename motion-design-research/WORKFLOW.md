# Validated Parameter Sets - Workflow Guide

## The New Approach: Extract Complete Configurations, Not Just Patterns

### What We Extract

**From professional template:**
```typescript
// Professional designer's template code
export const HeroScene: React.FC = () => {
  const spring = useSpring({ damping: 100, stiffness: 200 });
  return (
    <h1 style={{
      fontSize: '72px',
      fontWeight: 800,
      color: '#f0f6fc',
      letterSpacing: '-0.02em'
    }}>
      Product Name
    </h1>
  );
};
```

**What we extract to JSON:**
```json
{
  "fixed_parameters": {
    "spring_damping": 100,  // Don't change
    "spring_stiffness": 200,  // Don't change
    "font_weight": 800  // Don't change
  },
  "flexible_parameters": {
    "font_size": 72,  // Can adjust ±10px
    "color": "#f0f6fc",  // Can change for branding
    "content": "Product Name"  // Safe to replace
  },
  "adaptation_rules": {
    "if content.length > 15": "reduce font_size by 15%"
  }
}
```

## Step-by-Step Workflow

### Step 1: Find Professional Template

**Sources:**
1. remotiontemplates.dev - Browse templates
2. Remotion showcase - Official examples
3. GitHub - Search "remotion template"

**Selection criteria:**
- High quality (curated/featured)
- Similar to needed style (tech, minimal, etc.)
- Code available for analysis

### Step 2: Analyze Template Code

**Extract these categories:**

**Animation Parameters:**
```typescript
// Find all spring physics configs
const springs = findAllSpringConfigs(templateCode);
// Result: { damping: 100, stiffness: 200 } - FIXED

// Find all timing values
const timings = findAllDurations(templateCode);
// Result: { entry: 20, exit: 15, hold: 40 } - FIXED
```

**Typography Parameters:**
```typescript
// Find all font specifications
const typography = extractTypography(templateCode);
// Result:
// FIXED: weights (800, 700, 400), letterSpacing (-0.02em)
// FLEXIBLE: sizes (can adjust ±10%)
```

**Color Parameters:**
```typescript
// Find all color values
const colors = extractColors(templateCode);
// Result: ALL FLEXIBLE (safe to rebrand)
```

**Layout Parameters:**
```typescript
// Find all spacing and positioning
const layout = extractLayout(templateCode);
// Result:
// FIXED: padding (80px), gaps (60px), maxWidth (80%)
// FLEXIBLE: specific positions (can center/align differently)
```

### Step 3: Test Flexibility Boundaries

**Create test variations:**
```bash
# Test with different content lengths
npm run test:param-set --set hero-v1 --content "SHORT"
npm run test:param-set --set hero-v1 --content "VERY LONG PRODUCT NAME HERE"

# Test with different colors
npm run test:param-set --set hero-v1 --color "#3b82f6"
npm run test:param-set --set hero-v1 --color "#ef4444"

# Test with different sizes
npm run test:param-set --set hero-v1 --size 80
npm run test:param-set --set hero-v1 --size 60
```

**Determine safe ranges:**
- If all tests look good: Mark as FLEXIBLE
- If some tests look bad: Mark as FIXED or add ADAPTATION RULE
- If all tests look bad when changed: Mark as FIXED (required for quality)

### Step 4: Document Rules

**Create adaptation rules from test results:**

```json
{
  "adaptation_rules": {
    "long_content": {
      "test_result": "72px font too large for 20+ character headlines",
      "condition": "headline.length > 20",
      "action": "reduce fontSize to 60px",
      "validated": true
    },
    "short_content": {
      "test_result": "72px font too small for 3-character logos",
      "condition": "headline.length < 4",
      "action": "increase fontSize to 90px",
      "validated": true
    }
  }
}
```

### Step 5: Export Validated Set

**Final JSON structure:**
```json
{
  "id": "bold-centered-hero-v1",
  "source": "remotion-template-techlaunch",
  "quality_rating": 95,
  "tests_passed": 47,
  "tests_failed": 3,

  "fixed_parameters": { /* ... */ },
  "flexible_parameters": { /* ... */ },
  "adaptation_rules": { /* ... */ },
  "constraints": { /* ... */ },

  "usage_examples": [
    "Tech product launches",
    "Software showcases",
    "Developer tool intros"
  ],

  "test_results": {
    "content_length_range": "3-25 characters (tested)",
    "color_variations": "8 different palettes (all passed)",
    "size_adjustments": "60-90px range (validated)"
  }
}
```

## How MCP Uses This

### Example: User Requests Animation

```typescript
// User: "Create hero scene for CLEAN-CUT with green accent"

// 1. MCP identifies requirements
const requirements = {
  sceneType: 'hero',
  brandStyle: 'tech',
  content: { headline: 'CLEAN-CUT', body: 'Professional Video Generation' },
  branding: { accent: '#10b981' }
};

// 2. Find matching validated parameter set
const paramSet = findBestMatch(requirements, validatedSets);
// Returns: "bold-centered-hero-v1" (matches context: tech, hero, dark theme)

// 3. Apply fixed parameters (NO judgment)
const animation = {
  springConfig: paramSet.fixed_parameters.animation,  // Use exact values
  typography: paramSet.fixed_parameters.typography,   // Use exact weights
  spacing: paramSet.fixed_parameters.spacing         // Use exact spacing
};

// 4. Apply flexible parameters (safe customization)
animation.colors = { ...paramSet.flexible_parameters.colors, accent: '#10b981' };
animation.content = requirements.content;

// 5. Apply adaptation rules (automatic adjustments)
if (requirements.content.headline.length > 15) {
  animation.headlineSize = paramSet.flexible_parameters.size_adjustments.headline_size_px * 0.85;
}

// 6. Generate code with validated parameters
return generateRemotionComponent(animation);
```

## Benefits of This Approach

### ✅ Advantages
1. **Professional quality** - Parameters from successful professional work
2. **Controlled flexibility** - Clear rules for what can/cannot change
3. **No aesthetic judgment** - AI just applies validated configurations
4. **Adaptable** - Rules handle different content automatically
5. **Testable** - Parameter sets include test results

### ⚠️ Limitations
1. **Limited to analyzed templates** - Only as good as template library
2. **Requires initial analysis work** - Must extract parameters from templates
3. **Adaptation rules need testing** - Rules must be validated
4. **Context matching** - Must correctly identify which set to use

## Getting Started

### Quick Start: Analyze First Template

```bash
# 1. Download a Remotion template
git clone https://github.com/remotion-dev/template-example template-sources/example-1

# 2. Analyze it
npm run analyze:template -- --input template-sources/example-1

# 3. Review extracted parameters
cat validated-parameter-sets/extracted-from-example-1.json

# 4. Test with variations
npm run test:param-set -- --set extracted-from-example-1 --variations 10

# 5. Finalize and export
npm run finalize:param-set -- --set extracted-from-example-1 --output hero-scenes.json
```

### Next Steps

1. Analyze 10-20 professional Remotion templates
2. Extract validated parameter sets for different scene types
3. Test flexibility boundaries
4. Document adaptation rules
5. Integrate with clean-cut-mcp MCP

---

**This approach bridges AI's technical strength with human aesthetic judgment by using complete validated configurations from professional designers.**
