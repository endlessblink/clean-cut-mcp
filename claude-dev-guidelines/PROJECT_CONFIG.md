# 🎨 PROJECT CONFIGURATION
**Master settings for all Remotion animations - Change these to update the entire project**

## 📐 TYPOGRAPHY SETTINGS

### **Selected Font Stack:**
```
SELECTED_FONT_STACK: primary
```

### **Typography Scale:**
```
TYPOGRAPHY_SCALE: 1.0
```

### **Available Font Stacks:**
```
primary: Clean, modern sans-serif (Inter, SF Pro Display)
modern: Geometric, friendly (Satoshi, Inter)
tech: Monospace, code-like (JetBrains Mono, SF Mono)
elegant: Approachable, rounded (Poppins, Nunito Sans)
minimal: Swiss, precise (Neue Haas Grotesk, Helvetica Now)
corporate: Professional, strong (Circular, Gotham, Proxima Nova)
```

### **Text Sizes:**
```
display: 72px    (Large headlines)
h1: 48px         (Main titles)
h2: 36px         (Section headers)
h3: 24px         (Subsection headers)
body: 18px       (Regular text)
small: 16px      (Fine print)
badge: 14px      (Labels and tags)
```

## ⏱️ ANIMATION TIMING

### **Scene Transitions:**
```
ENTRY_SPEED: 20      (How fast things appear - lower = faster)
EXIT_SPEED: 15       (How fast things disappear - lower = faster)
STAGGER_DELAY: 8     (Delay between multiple items - lower = faster)
```

### **Movement Style:**
```
ENTRY_DISTANCE: 40px    (How far elements slide in from)
EXIT_DISTANCE: 60px     (How far elements slide out to)
SCALE_START: 0.9        (Starting size - 1.0 = full size, 0.5 = half size)
SCALE_END: 1.0          (Ending size)
```

## 🎨 COLORS

### **Text Colors:**
```
primary: #ffffff      (Main text - bright white)
secondary: #e5e5e5    (Secondary text - light gray)
tertiary: #cccccc     (Supporting text - medium gray)
muted: #b3b3b3        (Subtle text - darker gray)
accent: #a78bfa       (Highlight color - purple)
error: #ef4444        (Error/warning - red)
success: #10b981      (Success/positive - green)
warning: #f59e0b      (Caution - orange)
```

### **Background Colors:**
```
bg_hue_start: 260     (Starting color hue - 0=red, 120=green, 240=blue)
bg_hue_end: 320       (Ending color hue)
bg_saturation: 45     (Color intensity - 0=gray, 100=vibrant)
bg_lightness_1: 12    (Dark end - 0=black, 100=white)
bg_lightness_2: 20    (Light end)
```

## 📏 SPACING

### **Layout Spacing:**
```
xs: 4px      (Tiny gaps)
sm: 8px      (Small gaps)
md: 16px     (Medium gaps)
lg: 24px     (Large gaps)
xl: 32px     (Extra large gaps)
xxl: 48px    (Huge gaps)
xxxl: 64px   (Maximum gaps)
```

## 📝 HOW TO USE

### **Making Changes:**
1. **Font Style:** Change `SELECTED_FONT_STACK` to any option above
2. **Text Size:** Increase `TYPOGRAPHY_SCALE` (1.2 = 20% bigger, 0.8 = 20% smaller)
3. **Speed:** Lower numbers = faster animations
4. **Colors:** Use hex codes (#ffffff) or adjust hue/saturation numbers
5. **Spacing:** Increase pixel values for more space between elements

### **Examples:**
- **Bigger text:** Change `TYPOGRAPHY_SCALE: 1.0` to `TYPOGRAPHY_SCALE: 1.3`
- **Tech look:** Change `SELECTED_FONT_STACK: primary` to `SELECTED_FONT_STACK: tech`
- **Faster animations:** Change `ENTRY_SPEED: 20` to `ENTRY_SPEED: 10`
- **Blue theme:** Change `accent: #a78bfa` to `accent: #3b82f6`
- **More spacing:** Change `lg: 24px` to `lg: 36px`

### **Color Help:**
- **Red tones:** #ef4444, #dc2626, #b91c1c
- **Blue tones:** #3b82f6, #2563eb, #1d4ed8
- **Green tones:** #10b981, #059669, #047857
- **Purple tones:** #a78bfa, #8b5cf6, #7c3aed
- **Orange tones:** #f59e0b, #d97706, #b45309

### **Background Colors:**
- **Blue gradient:** `bg_hue_start: 200, bg_hue_end: 260`
- **Green gradient:** `bg_hue_start: 120, bg_hue_end: 180`
- **Warm gradient:** `bg_hue_start: 0, bg_hue_end: 60`
- **More vibrant:** Increase `bg_saturation` to 60-80
- **More subtle:** Decrease `bg_saturation` to 20-30

**💡 Tip:** Make small changes first and preview the results. All animations will update automatically when you change these values!