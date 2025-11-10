# MCP Server Architecture Mapping

## 🏗️ Server Overview

The MCP (Model Context Protocol) Server is the core component that bridges Claude Desktop with the animation generation system. It handles validation, code generation, and animation management.

### Server Modes
1. **STDIO Server** (`clean-stdio-server.ts`) - Production mode for Claude Desktop
2. **HTTP Server** (`http-mcp-server.ts`) - Development/testing mode

## 🔧 Core Architecture

### Server Entry Points
```
┌─────────────────────────────┐
│        clean-stdio-server.ts │  ← Production Entry Point
│  (STDIO transport for Claude)│
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│         Validation System    │  ← Lines 1034-1120
│    (Base + Learned Rules)   │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│       Code Generation        │
│   (Template-based creation) │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│      File System Ops        │
│    (Workspace management)   │
└─────────────────────────────┘
```

### Module Structure
```
mcp-server/src/
├── clean-stdio-server.ts         # Main server (production)
├── http-mcp-server.ts           # HTTP server (development)
├── animation-validator.ts       # Animation validation logic
├── base-animation-rules.ts      # Professional standards
├── preference-learner.ts        # User correction learning
├── rule-enforcer.ts             # Combined rules application
├── root-sync.ts                 # Root.tsx auto-sync system
├── template-registry.ts         # Animation template management
└── preference-applier.ts        # Apply learned preferences
```

## 🛠️ MCP Tools (18 Available)

### Animation Creation Tools
```typescript
// Main creation tool with comprehensive validation
create_animation({
  code: string,              // Animation code
  componentName: string,     // Component name
  duration: number,          // Animation duration
  template?: string,         // Optional template
  customizations?: object    // Custom parameters
})

// Modify existing animations
update_composition({
  componentName: string,
  updates: object,
  preview?: boolean
})

// Manage component properties
manage_props({
  componentName: string,
  action: "add" | "remove" | "modify",
  props: object
})
```

### Root Management Tools
```typescript
// Auto-sync Root.tsx with animations
auto_sync()

// Regenerate Root.tsx from scratch
rebuild_compositions()

// Remove orphaned imports
cleanup_broken_imports()
```

### Asset Management Tools
```typescript
// Upload images/logos to public folder
upload_asset({
  filename: string,
  content: string,  // base64
  type: string
})

// List available assets
list_assets()

// Remove asset files
delete_asset({
  filename: string
})
```

### Learning System Tools
```typescript
// Apply learned preferences to animation
generate_with_learning({
  baseAnimation: string,
  preferences: object
})

// Store user feedback for future animations
record_user_correction({
  componentName: string,
  correction: string,
  originalIssue: string
})

// Show learned rules and preferences
view_learned_preferences()
```

### Utility Tools
```typescript
// Get Remotion Studio URL
get_studio_url()

// List all animation components
list_existing_components()

// Read guidelines files
get_project_guidelines({
  file: string
})

// Format code with Prettier
format_code({
  code: string
})

// Get export directory info
get_export_directory()
```

## ✅ Validation System

### Validation Engine (Lines 1034-1120)
```typescript
handleCreateAnimation(args) {
  // 1. Base Rules Validation (ALWAYS ENFORCED)
  const baseViolations = validateBaseRules(code);

  // 2. Learned Rules Application (User corrections)
  const learnedWarnings = applyLearnedRules(code);

  // 3. TypeScript Syntax Validation
  const syntaxErrors = validateTypeScript(code);

  // 4. Export Pattern Validation
  const exportIssues = validateExportPattern(code);

  // 5. Return consolidated feedback
  return {
    isValid: violations.length === 0,
    fixedCode: applyAutoFixes(code),
    warnings: learnedWarnings,
    violations: baseViolations
  };
}
```

### Base Rules (Always Enforced)
```typescript
// Font Validation (Line 1044)
if (hasSerifFont && !args.allowSerifFont) {
  violations.push('❌ FONT: Detected serif font...');
}

// NoOverlapScene Enforcement (Line 1072)
if (!code.includes('NoOverlapScene') && hasSequence) {
  violations.push('❌ STRUCTURE: Sequence without NoOverlapScene...');
}

// Font Size Validation (Line 1056)
if (tinyFonts.length > 0) {
  violations.push('❌ FONT SIZE: Minimum 24px for video...');
}

// Motion Blur Validation (Line 1083)
if (hasFastMotion && !code.includes('motionBlur')) {
  warnings.push('⚠️ MOTION BLUR: Fast movement detected...');
}

// Padding Validation (Line 1095)
if (crampedSpacing.length > 0) {
  violations.push('❌ SPACING: Minimum 40px padding required...');
}
```

### Learned Rules (User Corrections)
```typescript
// Stored in preferences/user-preferences.json
interface LearnedRule {
  id: string;
  pattern: string;
  correction: string;
  context: string;
  timestamp: number;
  applications: number;
}

// Application example
if (code.includes('scale: 2.5') && learnedRules.maxScale) {
  warnings.push(`⚠️ User prefers max scale ${learnedRules.maxScale}`);
}
```

## 🔄 Code Generation Pipeline

### Template System
```typescript
// Template Registry
const templates = {
  'product-showcase': ProductShowcaseTemplate,
  'profile-presentation': ProfileTemplate,
  'text-animation': TextAnimationTemplate,
  // ... more templates
};

// Template Application
function generateFromTemplate(templateName: string, customizations: object) {
  const template = templates[templateName];
  const baseCode = template.generate(customizations);
  const validatedCode = validateAndFix(baseCode);
  return validatedCode;
}
```

### Auto-Correction System
```typescript
// Common fixes applied automatically
const autoFixes = [
  {
    pattern: /font-size:\s*(\d+)px/,
    condition: (size) => size < 24,
    fix: (match) => `font-size: 24px` // Minimum for video
  },
  {
    pattern: /style={{\s*}}/,
    condition: () => true,
    fix: () => 'style={{ fontFamily: "Inter", ... }}' // Add font
  }
];
```

## 📁 File System Management

### Environment-Aware Paths
```typescript
// Critical for Docker compatibility
const SRC_DIR = process.env.DOCKER_CONTAINER === 'true'
  ? '/workspace/src'                    // Docker container
  : path.join(__dirname, '../clean-cut-workspace/src');  // Local development

// Animation directory
const ANIMATIONS_DIR = process.env.DOCKER_CONTAINER === 'true'
  ? '/workspace/src/assets/animations'
  : path.join(__dirname, '../clean-cut-workspace/src/assets/animations');
```

### Directory Initialization
```typescript
// Ensures all directories exist (critical for bind mounts)
function ensureDirectories() {
  const dirs = [
    '/workspace/src/components',
    '/workspace/src/utils',
    '/workspace/src/patterns',
    '/workspace/src/assets/animations',
    '/workspace/src/validated-params'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}
```

## 🎯 Root.tsx Auto-Sync System

### Sync Trigger
```typescript
// Automatically called after animation creation
function syncRootTsx() {
  // 1. Scan for all animation files
  const animationFiles = scanAnimationFiles();

  // 2. Generate imports
  const imports = generateImports(animationFiles);

  // 3. Generate composition entries
  const compositions = generateCompositions(animationFiles);

  // 4. Write Root.tsx
  writeRootTsx(imports, compositions);
}
```

### Root.tsx Structure
```typescript
// Auto-generated content
import { AllGasNoBrakesAnimation } from './assets/animations/AllGasNoBrakesAnimation';
import { FloatingOrbs } from './assets/animations/FloatingOrbs';
// ... more imports

export const compositions: Composition[] = [
  {
    id: 'AllGasNoBrakesAnimation',
    component: AllGasNoBrakesAnimation,
    durationInFrames: 240,
    fps: 30,
    width: 1920,
    height: 1080
  },
  // ... more compositions
];
```

## 🧠 Learning System

### User Correction Flow
```
User Feedback → record_user_correction → Store in JSON → Apply to Future Animations
```

### Preference Storage
```typescript
// preferences/user-preferences.json
{
  "corrections": [
    {
      "id": "scale-limit",
      "pattern": "scale\\s*:\\s*([\\d.]+)",
      "correction": "Keep scale between 0.8 and 1.5",
      "context": "logo-scale",
      "applications": 5,
      "timestamp": 1704067200000
    }
  ],
  "preferences": {
    "maxScale": 1.5,
    "preferredTransitions": ["fade", "slide"],
    "colorAdjustments": {...}
  }
}
```

### Preference Application
```typescript
function applyLearnedPreferences(code: string, preferences: UserPreferences) {
  let modifiedCode = code;

  // Apply scale preferences
  preferences.corrections.forEach(correction => {
    const regex = new RegExp(correction.pattern, 'g');
    modifiedCode = modifiedCode.replace(regex, correction.correction);
  });

  return modifiedCode;
}
```

## 🔐 Security & Validation

### Security Measures
1. **AST-Based Validation**: Prevents code injection
2. **Pattern Matching**: Detects potential security issues
3. **Sandbox Environment**: Docker isolation
4. **No Dynamic Imports**: Prevents arbitrary code execution

### Input Sanitization
```typescript
// Sanitize user inputs
function sanitizeComponentName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^[0-9]/, 'Component$&')
    .replace(/^./, char => char.toUpperCase());
}
```

## 🚀 Performance Optimizations

### Caching Strategy
- **Template Cache**: Pre-compiled templates
- **Validation Cache**: Cached validation results
- **File System Cache**: Cached directory scans

### Async Operations
```typescript
// Non-blocking operations
async function handleCreateAnimation(args) {
  const validatedCode = await validateCodeAsync(args.code);
  const filePath = await writeFileAsync(validatedCode);
  await syncRootTsxAsync();
  return { success: true, filePath };
}
```

## 📊 Monitoring & Logging

### Operation Logging
```typescript
// Log all operations for debugging
function logOperation(operation: string, details: object) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    details,
    environment: process.env.DOCKER_CONTAINER ? 'docker' : 'local'
  };

  console.log(JSON.stringify(logEntry));
}
```

### Error Handling
```typescript
// Comprehensive error handling
try {
  const result = await processAnimationRequest(args);
  return result;
} catch (error) {
  logError('Animation creation failed', error);
  return {
    success: false,
    error: error.message,
    suggestions: getErrorSuggestions(error)
  };
}
```

This architecture provides a robust, scalable, and secure foundation for AI-powered animation generation with comprehensive validation and learning capabilities.