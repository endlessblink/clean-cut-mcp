# 📋 ANIMATION GUIDELINES OVERVIEW
**Simple guide to the animation configuration system**

## 🎯 FOR NON-TECHNICAL USERS

### **What You Can Control:**
- **Fonts:** Choose from 6 different text styles (modern, elegant, tech, etc.)
- **Text Size:** Make all text bigger or smaller with one setting
- **Colors:** Change text colors, highlights, and background gradients
- **Speed:** Control how fast animations appear and disappear
- **Spacing:** Adjust gaps between elements

### **Main File to Edit:**
**`PROJECT_CONFIG.md`** - This is your control panel. Change values here to update the entire video.

### **How It Works:**
1. Open `PROJECT_CONFIG.md`
2. Find the setting you want to change
3. Edit the value (follow the examples in the file)
4. Save the file
5. Your video automatically updates!

### **Common Changes:**
- **Make text bigger:** Change `TYPOGRAPHY_SCALE: 1.0` to `TYPOGRAPHY_SCALE: 1.3`
- **Use tech font:** Change `SELECTED_FONT_STACK: primary` to `SELECTED_FONT_STACK: tech`
- **Blue highlight:** Change `accent: #a78bfa` to `accent: #3b82f6`
- **Faster animations:** Change `ENTRY_SPEED: 20` to `ENTRY_SPEED: 10`

## 🔧 FOR DEVELOPERS

### **Technical Files:**
- **`ADVANCED/ANIMATION_PATTERNS.md`** - Code templates and safety rules
- **`ADVANCED/REMOTION_ANIMATION_RULES.md`** - Comprehensive animation guidelines
- **`typography.ts`** - Parser functions and type definitions
- **Component files** - Use the dynamic configuration system

### **Implementation Pattern:**
```typescript
// Read configuration from guidelines
const config = parseGuidelinesConfig(guidelinesContent);

// Generate dynamic styles
const TYPOGRAPHY = generateTypography(
  config.selectedFontStack,
  config.typographyScale,
  config.fontStacks,
  config.baseSizes
);

// Use in components
<h1 style={{...TYPOGRAPHY.h1, color: config.colors.text.primary}}>
  Dynamic Title
</h1>
```

### **MCP Commands:**
```typescript
// Read user configuration
rough-cuts-mcp:read_guidelines_file("PROJECT_CONFIG.md")

// Get developer patterns (if needed)
rough-cuts-mcp:read_guidelines_file("ADVANCED/ANIMATION_PATTERNS.md")

// Create component
rough-cuts-mcp:create_remotion_component(name, code, duration)
```

## 📁 FILE STRUCTURE

```
claude-dev-guidelines/
├── PROJECT_CONFIG.md        ← USER EDITS THIS (visual settings)
├── README.md               ← THIS FILE (overview)
└── ADVANCED/               ← DEVELOPER FILES (technical code)
    ├── ANIMATION_PATTERNS.md
    ├── REMOTION_ANIMATION_RULES.md
    ├── QUICK_REFERENCE.md
    └── TESTING_GUIDE.md
```

## 🎬 WORKFLOW

### **For Content Creators/Designers:**
1. Edit `PROJECT_CONFIG.md` only
2. Change fonts, colors, sizes, timing
3. Preview results in Remotion Studio
4. No code knowledge required!

### **For Developers:**
1. Reference `ADVANCED/ANIMATION_PATTERNS.md` for code templates
2. Build components using the dynamic configuration system
3. Ensure all values come from `PROJECT_CONFIG.md`, not hardcoded
4. Test that user changes in config file update the animations

**🎯 The system separates visual configuration (user-friendly) from code implementation (developer-only).**