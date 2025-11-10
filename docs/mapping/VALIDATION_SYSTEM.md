# Validation System Architecture

## 🛡️ Validation Overview

The validation system is the core quality control mechanism that ensures all generated animations meet professional broadcast standards. It combines base rules (always enforced) with learned rules (from user corrections).

### Validation Philosophy
- **Professional Standards**: Broadcast-ready quality requirements
- **User Learning**: Adapts to user preferences over time
- **Prevention**: Blocks violations before they reach production
- **Education**: Provides clear feedback and fix suggestions

## 🏗️ Validation Architecture

### Validation Pipeline
```
Input Code
    │
    ▼
┌─────────────────┐
│  Base Rules     │ ← Always Enforced (Blocking)
│  (Professional  │
│   Standards)    │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Learned Rules  │ ← User Corrections (Warnings)
│  (Preferences)  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Syntax Check   │ ← TypeScript Validation
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Auto-Correction│ ← Apply Fixes
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│  Final Output   │ ← Validated Animation
└─────────────────┘
```

### Validation Location
**Primary Validation**: `clean-stdio-server.ts` lines 1034-1120
**Supporting Modules**: `animation-validator.ts`, `base-animation-rules.ts`

## ✅ Base Rules (Always Enforced)

### 1. Typography Rules
```typescript
// Font Family Validation (Line 1044)
const fontValidation = {
  // Must specify font family (no browser defaults)
  rule: "fontFamily must be specified",
  violation: "❌ FONT: Missing fontFamily declaration",
  fix: "Add fontFamily: 'Inter' or appropriate font stack"
};

// Serif Font Detection (Line 1046)
const serifValidation = {
  // Detects serif fonts (excludes 'sans-serif')
  pattern: /fontFamily[^;]*(serif|Georgia|Times|Palatino)/i,
  violation: "❌ FONT: Detected serif font (not recommended for video)",
  exception: "User explicitly allows serif fonts"
};

// Font Size Validation (Line 1056)
const fontSizeValidation = {
  // Minimum 24px for 1920x1080 resolution
  minSize: 24,
  violation: "❌ FONT SIZE: Tiny fonts detected (minimum 24px for video)",
  fix: "Increase font size to meet broadcast standards"
};
```

### 2. Structure Rules
```typescript
// NoOverlapScene Enforcement (Line 1072)
const structureValidation = {
  // Required for multi-scene animations
  rule: "Sequence without NoOverlapScene",
  violation: "❌ STRUCTURE: Multiple scenes require NoOverlapScene",
  fix: "Wrap scenes in <NoOverlapScene> component",
  reference: "PRE-ANIMATION-CHECKLIST.md Step 8"
};

// Export Pattern Validation
const exportValidation = {
  // Must have proper export pattern
  pattern: /^export\s+const\s+\w+/,
  violation: "❌ EXPORT: Invalid export pattern",
  fix: "Use: export const ComponentName = () => { ... }"
};
```

### 3. Motion Rules
```typescript
// Motion Blur Validation (Line 1083)
const motionValidation = {
  // Required for fast movements
  condition: "fast movement detected",
  requirement: "motionBlur property",
  violation: "⚠️ MOTION BLUR: Fast movement should include motionBlur",
  suggestion: "Add motionBlur={true} for smooth fast motion"
};

// Duration Validation
const durationValidation = {
  // No arbitrary duration values
  rule: "Use predefined duration constants",
  violation: "⚠️ DURATION: Avoid arbitrary duration values",
  suggestion: "Use durationInFrames from config"
};
```

### 4. Layout Rules
```typescript
// Padding Validation (Line 1095)
const layoutValidation = {
  // Minimum 40px padding
  minPadding: 40,
  violation: "❌ SPACING: Cramped layout (minimum 40px padding)",
  fix: "Increase padding for professional spacing"
};

// Element Size Validation (Line 1100)
const sizeValidation = {
  // Elements must be visible on 1920x1080
  minSize: 100, // pixels
  violation: "❌ ELEMENT SIZE: Elements too small for video",
  fix: "Increase element size for visibility"
};
```

### 5. Import Rules
```typescript
// Dynamic Import Prevention
const importValidation = {
  // No dynamic imports allowed
  pattern: /import\s*\(/,
  violation: "❌ IMPORT: Dynamic imports not allowed",
  reason: "Security and performance"
};
```

## 🧠 Learned Rules (User Corrections)

### Learning Mechanism
```typescript
// User Correction Flow
User Feedback → record_user_correction → Store Preference → Apply to Future
```

### Preference Storage
```typescript
// preferences/user-preferences.json
interface UserPreference {
  id: string;
  pattern: string;           // Regex pattern to match
  correction: string;        // Suggested correction
  context: string;          // When to apply
  applications: number;     // How many times applied
  success: number;          // How many times accepted
  timestamp: number;        // Last updated
}

interface LearnedPreferences {
  corrections: UserPreference[];
  preferences: {
    maxScale?: number;
    preferredTransitions?: string[];
    colorAdjustments?: object;
    timingPreferences?: object;
  };
}
```

### Common Learned Rules
```typescript
// Scale Preferences
const scaleRules = [
  {
    pattern: /scale:\s*([2-9]\d*\.?\d*)/,
    correction: "Keep scale between 0.8 and 1.5 for readability",
    context: "logo-scale"
  },
  {
    pattern: /transform:\s*.*scale\([2-9]/,
    correction: "Consider reducing scale for better readability",
    context: "text-scale"
  }
];

// Color Preferences
const colorRules = [
  {
    pattern: /color:\s*#[0-9a-f]{3,6}/i,
    correction: "Consider using brand colors from config",
    context: "brand-colors"
  }
];

// Timing Preferences
const timingRules = [
  {
    pattern: /durationInFrames:\s*([1-9]\d+)/,
    correction: "Use standard duration from config",
    context: "animation-duration"
  }
];
```

## 🔍 Validation Implementation

### Main Validation Function
```typescript
// clean-stdio-server.ts lines 1034-1120
function handleCreateAnimation(args) {
  const { code, componentName, duration } = args;
  const violations = [];
  const warnings = [];

  // 1. Base Rules Validation
  const baseViolations = validateBaseRules(code);
  violations.push(...baseViolations);

  // 2. Learned Rules Application
  const learnedWarnings = applyLearnedRules(code);
  warnings.push(...learnedWarnings);

  // 3. TypeScript Syntax Validation
  const syntaxErrors = validateTypeScript(code);
  violations.push(...syntaxErrors);

  // 4. Auto-correction
  const fixedCode = applyAutoFixes(code, violations, warnings);

  // 5. Return results
  return {
    isValid: violations.length === 0,
    fixedCode,
    violations,
    warnings,
    suggestions: generateSuggestions(violations, warnings)
  };
}
```

### AST-Based Validation
```typescript
// animation-validator.ts
import * as ts from 'typescript';

function validateWithAST(code: string): ValidationResult {
  const sourceFile = ts.createSourceFile(
    'animation.tsx',
    code,
    ts.ScriptTarget.Latest,
    true
  );

  const violations = [];

  // Walk the AST
  ts.forEachChild(sourceFile, (node) => {
    // Validate JSX attributes
    if (ts.isJsxElement(node)) {
      validateJSXElement(node, violations);
    }

    // Validate style objects
    if (ts.isJsxAttribute(node)) {
      validateStyleAttribute(node, violations);
    }
  });

  return { violations };
}
```

### Auto-Correction System
```typescript
const autoFixes = [
  {
    name: "font-size-fix",
    pattern: /font-size:\s*(\d+)px/g,
    condition: (match) => parseInt(match[1]) < 24,
    fix: (match) => `font-size: 24px`
  },
  {
    name: "font-family-fix",
    pattern: /style={{\s*}}/g,
    condition: () => true,
    fix: () => 'style={{ fontFamily: "Inter", ... }}'
  },
  {
    name: "padding-fix",
    pattern: /padding:\s*(\d+)px/g,
    condition: (match) => parseInt(match[1]) < 40,
    fix: (match) => `padding: 40px`
  }
];

function applyAutoFixes(code: string, violations: Violation[]): string {
  let fixedCode = code;

  autoFixes.forEach(fix => {
    if (violations.some(v => v.rule === fix.name)) {
      fixedCode = fixedCode.replace(fix.pattern, fix.fix);
    }
  });

  return fixedCode;
}
```

## 📊 Rule Categories & Severity

### Violation Levels
1. **BLOCKING** (❌) - Must be fixed before proceeding
   - Typography issues (font family, size)
   - Structure problems (NoOverlapScene)
   - Security concerns (dynamic imports)

2. **WARNING** (⚠️) - Should be fixed but not blocking
   - Motion recommendations
   - Duration suggestions
   - Performance optimizations

3. **INFO** (ℹ️) - Best practice suggestions
   - Code style improvements
   - Alternative approaches

### Rule Priorities
```typescript
const rulePriorities = {
  SECURITY: 100,      // Highest priority
  STRUCTURE: 90,      // Critical for functionality
  TYPOGRAPHY: 80,     // Broadcast standards
  LAYOUT: 70,         // Professional appearance
  MOTION: 60,         // Animation quality
  PERFORMANCE: 50,    // Optimization
  STYLE: 40           // Code quality
};
```

## 🎯 Validation Rules Reference

### Complete Rule Set
```typescript
const validationRules = {
  // Typography Rules
  fontFamilyRequired: {
    pattern: /fontFamily\s*:/,
    violation: "❌ FONT: Missing fontFamily declaration",
    fix: "Add fontFamily: 'Inter'"
  },
  fontSizeMinimum: {
    pattern: /font-size:\s*(\d+)px/,
    minSize: 24,
    violation: "❌ FONT SIZE: Too small for video (min 24px)",
    fix: "Increase font size"
  },
  serifFontWarning: {
    pattern: /(Georgia|Times|serif)/i,
    exception: /sans-serif/i,
    violation: "❌ FONT: Serif font detected",
    fix: "Use sans-serif fonts for video"
  },

  // Structure Rules
  noOverlapScene: {
    condition: (code) => code.includes('Sequence') && !code.includes('NoOverlapScene'),
    violation: "❌ STRUCTURE: Sequence requires NoOverlapScene",
    fix: "Wrap in <NoOverlapScene>"
  },
  exportPattern: {
    pattern: /^export\s+const\s+\w+/,
    violation: "❌ EXPORT: Invalid export pattern",
    fix: "Use proper export syntax"
  },

  // Layout Rules
  paddingMinimum: {
    pattern: /padding:\s*(\d+)px/,
    minPadding: 40,
    violation: "❌ SPACING: Padding too small (min 40px)",
    fix: "Increase padding"
  },
  elementSize: {
    pattern: /width:\s*(\d+)px/,
    minWidth: 100,
    violation: "❌ ELEMENT: Too small for video",
    fix: "Increase element size"
  },

  // Motion Rules
  motionBlurRequired: {
    condition: (code) => hasFastMotion(code) && !code.includes('motionBlur'),
    violation: "⚠️ MOTION: Fast movement needs motionBlur",
    fix: "Add motionBlur={true}"
  },
  durationStandard: {
    pattern: /durationInFrames:\s*\d+/,
    violation: "⚠️ DURATION: Use standard durations",
    fix: "Use duration from config"
  }
};
```

## 🔄 Learning System Integration

### User Feedback Processing
```typescript
function recordUserCorrection(params: {
  componentName: string;
  originalIssue: string;
  appliedFix: string;
  userFeedback: 'accepted' | 'rejected';
}) {
  const correction = {
    id: generateId(),
    pattern: createPattern(params.originalIssue),
    correction: params.appliedFix,
    context: params.componentName,
    success: params.userFeedback === 'accepted',
    timestamp: Date.now(),
    applications: 1
  };

  // Store in preferences
  updateUserPreferences(correction);
}
```

### Preference Application
```typescript
function applyLearnedPreferences(code: string, preferences: LearnedPreferences): string {
  let modifiedCode = code;

  preferences.corrections.forEach(correction => {
    if (correction.success > correction.applications * 0.7) {
      // Apply only successful corrections (>70% success rate)
      const regex = new RegExp(correction.pattern, 'g');
      modifiedCode = modifiedCode.replace(regex, correction.correction);
    }
  });

  return modifiedCode;
}
```

## 📈 Validation Performance

### Optimization Strategies
1. **Caching**: Cache validation results for identical code
2. **Parallel Processing**: Validate multiple rules simultaneously
3. **Incremental Validation**: Only validate changed parts
4. **Rule Pre-compilation**: Pre-compile regex patterns

### Monitoring
```typescript
// Validation metrics
interface ValidationMetrics {
  totalValidations: number;
  averageTime: number;
  violationRate: number;
  fixSuccessRate: number;
  userSatisfactionScore: number;
}

// Track validation performance
function trackValidation(validation: ValidationResult) {
  metrics.totalValidations++;
  metrics.averageTime = (metrics.averageTime + validation.time) / 2;

  if (validation.violations.length > 0) {
    metrics.violationRate++;
  }
}
```

This validation system ensures consistent, professional-quality animations while learning from user preferences to improve over time.