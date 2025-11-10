# Component Architecture Mapping

## 🎬 Animation Component Hierarchy

### Core Structure
```
RemotionRoot (Auto-generated)
├── Main Composition
│   ├── [20+ Individual Animation Components]
│   │   ├── AllGasNoBrakesAnimation
│   │   ├── FloatingOrbs
│   │   ├── GitHubProfileShowcaseEnhanced
│   │   ├── NoOverlapShowcase
│   │   └── [More animations...]
│   └── Shared Components
│       ├── NoOverlapScene.tsx
│       ├── MandatoryTransition.tsx
│       └── EnforcedScene.tsx
```

## 🧩 Component Categories

### 1. Individual Animation Components
**Location**: `clean-cut-workspace/src/assets/animations/`

**Standard Structure**:
```typescript
export const AnimationName: React.FC<AnimationSchema> = ({
  accentColor,
  backgroundColor,
  primaryText,
  secondaryText,
  ...props
}) => {
  return (
    <NoOverlapScene startFrame={0} endFrame={240} exitType="wipe-right">
      <div style={containerStyle}>
        {/* Animation content */}
      </div>
    </NoOverlapScene>
  );
};
```

**Key Animations**:
- `AllGasNoBrakesAnimation.tsx` - High-energy product showcase
- `FloatingOrbs.tsx` - Abstract particle animation
- `GitHubProfileShowcaseEnhanced.tsx` - Profile presentation
- `NoOverlapShowcase.tsx` - Multi-element showcase
- [20+ additional specialized animations]

### 2. Shared Components
**Location**: `clean-cut-workspace/src/components/`

#### NoOverlapScene.tsx
**Purpose**: Prevents element overlaps in multi-scene animations
**Critical**: Required for animations with multiple scenes (PRE-ANIMATION-CHECKLIST Step 8)

```typescript
interface NoOverlapSceneProps {
  startFrame: number;
  endFrame: number;
  exitType?: "wipe-left" | "wipe-right" | "fade" | "scale";
  children: React.ReactNode;
}
```

#### MandatoryTransition.tsx
**Purpose**: Ensures proper scene transitions
**Features**: Configurable transition types and timing

#### EnforcedScene.tsx
**Purpose**: Validates scene boundaries and continuity
**Features**: Boundary detection and continuity validation

### 3. Utility Components
**Location**: `clean-cut-workspace/src/utils/`

#### Animation Utilities
- **kinetic-text.ts**: Advanced text animation with easing
- **camera-controller.ts**: Camera movement and tracking
- **scale-isolation.ts**: Scale validation and isolation
- **crop-detector.ts**: Boundary detection and validation
- **particle-system.tsx**: Particle effects management
- **professional-easing.ts**: Research-validated motion curves

## 🔄 Component Relationships

### Dependency Flow
```
Animation Components → Shared Components → Utility Functions → Configuration
```

### Data Flow
```
User Input → Animation Schema → Component Props → Render Output
```

### Validation Flow
```
Component Code → AST Validation → Rule Application → Auto-correction → Final Output
```

## 🎨 Animation Schema

### Standard Props Interface
```typescript
interface AnimationSchema {
  accentColor: string;
  backgroundColor: string;
  primaryText: string;
  secondaryText?: string;
  duration?: number;
  scale?: number;
  [customProps]: any;
}
```

### Configuration Integration
All components read from `PROJECT_CONFIG.md`:
- Colors: Primary, accent, text, background
- Typography: Font stacks, sizes
- Timing: Entry/exit speeds, stagger delays
- Spacing: xs to xxxl scale

## 🔧 Component Lifecycle

### Creation Process
1. **User Request**: Natural language to animation
2. **Code Generation**: Template-based component creation
3. **Validation**: AST-based rule checking
4. **Auto-correction**: Fix common violations
5. **File Creation**: Save to workspace
6. **Root Sync**: Update composition registry
7. **Hot Reload**: Preview in Studio

### Validation Points
- **Export Pattern**: Proper export syntax
- **Interpolate Safety**: Safe string interpolation
- **Structure Rules**: NoOverlapScene usage
- **Typography**: Font family and sizes
- **Motion**: Blur and duration rules

## 📋 Component Standards

### Code Quality
- TypeScript interfaces for all props
- Professional easing functions
- Responsive design patterns
- Accessibility considerations
- Performance optimization

### Validation Rules
- Font family must be specified
- Minimum font size: 24px
- Minimum padding: 40px
- NoOverlapScene for multi-scene
- Motion blur for fast movement

### Configuration Standards
- Read from PROJECT_CONFIG.md
- No hardcoded values
- Consistent naming conventions
- Proper TypeScript typing

## 🎯 Best Practices

### Component Design
1. **Modular Structure**: Reusable, composable components
2. **Configuration-Driven**: Externalize all configurable values
3. **Validation-Ready**: Pass all validation rules
4. **Performance-Optimized**: Efficient rendering and animation

### Animation Patterns
1. **Professional Timing**: Research-validated durations
2. **Smooth Transitions**: Proper easing functions
3. **Visual Hierarchy**: Clear information architecture
4. **Brand Consistency**: Configurable color schemes

### Development Workflow
1. **Template Selection**: Choose appropriate template
2. **Customization**: Apply user preferences
3. **Validation**: Ensure rule compliance
4. **Testing**: Verify in Remotion Studio
5. **Iteration**: Apply user feedback

## 🔄 Integration Points

### MCP Server Integration
```typescript
// Tool call creates component
handleCreateAnimation({
  componentName: "ProductShowcase",
  template: "product-showcase",
  customizations: { ... }
})
```

### Remotion Studio Integration
```typescript
// Root.tsx auto-generated
export const compositions: Composition[] = [
  {
    id: "AllGasNoBrakesAnimation",
    component: AllGasNoBrakesAnimation,
    durationInFrames: 240,
    fps: 30,
    width: 1920,
    height: 1080
  }
];
```

### Configuration Integration
```typescript
// Components read from config
const config = parseGuidelinesConfig();
const primaryColor = config.colors.primary;
const titleFont = config.typography.fontStacks.primary;