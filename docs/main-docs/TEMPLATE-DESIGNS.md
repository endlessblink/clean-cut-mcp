# Template Visual Designs

**Purpose:** Visual specifications for first 10 Business/Corporate templates
**Format:** 1920x1080 (16:9)
**Duration:** 10-30 seconds per template

---

## 1. Product Showcase Template

**Duration:** 15 seconds (450 frames)
**Use Case:** SaaS apps, mobile apps, physical products

### Visual Layout:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Frame 0-90 (3s): HERO SECTION                    │
│  ┌───────────────────────────────────────────┐    │
│  │                                           │    │
│  │           [PRODUCT LOGO/ICON]            │    │
│  │               (200x200px)                 │    │
│  │                                           │    │
│  │            ProductName                    │    │
│  │         (72px, bold, center)             │    │
│  │                                           │    │
│  │         Your tagline here                 │    │
│  │          (28px, center)                   │    │
│  │                                           │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  Frame 90-330 (8s): FEATURES (staggered)          │
│  ┌─────────────────────────────────────────┐      │
│  │  ⚡ Feature 1 Title (36px, bold)         │      │
│  │     Brief description (24px)             │      │
│  │                                           │      │
│  │  🚀 Feature 2 Title (36px, bold)         │      │
│  │     Brief description (24px)             │      │
│  │                                           │      │
│  │  ✨ Feature 3 Title (36px, bold)         │      │
│  │     Brief description (24px)             │      │
│  └─────────────────────────────────────────┘      │
│                                                     │
│  Frame 330-450 (4s): CALL TO ACTION               │
│  ┌─────────────────────────────────────────┐      │
│  │                                           │      │
│  │        [ Get Started Now ]               │      │
│  │         (48px, button style)             │      │
│  │                                           │      │
│  │        www.yourproduct.com               │      │
│  │            (24px)                         │      │
│  └─────────────────────────────────────────┘      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Animation Sequence:
- **0-90f**: Logo scales in + title slides up
- **90-150f**: Feature 1 enters from left (wipe transition)
- **150-210f**: Feature 2 enters from left (staggered 60f delay)
- **210-270f**: Feature 3 enters from left (staggered 60f delay)
- **270-330f**: Features group scales + slight rotation
- **330-390f**: CTA button grows with spring animation
- **390-450f**: Website fades in below CTA

### Colors:
- Background: `#0a0a0a` (dark)
- Primary: `#10b981` (green accent)
- Text: `#ffffff` (white)
- Secondary text: `#a0a0a0` (gray)

### Typography:
- Logo text: 72px bold
- Features: 36px bold titles, 24px body
- CTA: 48px bold

---

## 2. GitHub Profile Showcase

**Duration:** 16 seconds (480 frames)
**Use Case:** Developer portfolios, open source promotion

### Visual Layout:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Frame 0-90 (3s): PROFILE HEADER                   │
│  ┌───────────────────────────────────────────┐    │
│  │  [@] endlessblink           [GitHub Logo] │    │
│  │  (48px bold)                 (60x60px)    │    │
│  │                                           │    │
│  │  Full Stack Developer                     │    │
│  │  (28px, gray)                             │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  Frame 90-210 (4s): STATS GRID                    │
│  ┌─────────────┬─────────────┬─────────────┐     │
│  │     52      │     1,234   │    847      │     │
│  │ Repositories│   Stars     │  Commits    │     │
│  │  (48px)     │   (48px)    │   (48px)    │     │
│  │  (24px)     │   (24px)    │   (24px)    │     │
│  └─────────────┴─────────────┴─────────────┘     │
│                                                     │
│  Frame 210-390 (6s): TOP PROJECTS                 │
│  ┌─────────────────────────────────────────┐      │
│  │  📦 clean-cut-mcp                       │      │
│  │     AI video generation for Claude      │      │
│  │     ⭐ 234  🍴 45   TypeScript          │      │
│  ├─────────────────────────────────────────┤      │
│  │  📦 other-project                       │      │
│  │     Description here                     │      │
│  │     ⭐ 123  🍴 23   React               │      │
│  └─────────────────────────────────────────┘      │
│                                                     │
│  Frame 390-480 (3s): TECH STACK                   │
│  [TypeScript] [React] [Node.js] [Docker]          │
│  (32px badges with icons)                          │
└─────────────────────────────────────────────────────┘
```

### Animation Sequence:
- **0-90f**: Profile header slides down, avatar fades in
- **90-150f**: Stats counters animate from 0 to final numbers
- **150-210f**: Stats cards pulse/highlight one by one
- **210-270f**: Project 1 card slides in from right
- **270-330f**: Project 2 card slides in from right (staggered)
- **330-390f**: Project cards subtle float animation
- **390-450f**: Tech stack badges pop in with spring
- **450-480f**: All elements slight zoom out (reveal composition)

### Colors:
- Background: `#0d1117` (GitHub dark)
- Accent: `#58a6ff` (GitHub blue)
- Cards: `#161b22` (GitHub card)
- Text: `#f0f6fc` (GitHub text)
- Stats: `#10b981` (green for numbers)

### Data Requirements:
```typescript
interface GitHubShowcaseData {
  username: string;
  bio?: string;
  stats: {
    repos: number;
    stars: number;
    commits: number;
  };
  topProjects: Array<{
    name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
  }>;
  techStack?: string[];  // ['TypeScript', 'React', 'Docker']
}
```

---

## 3. Company Intro Template

**Duration:** 12 seconds (360 frames)
**Use Case:** About us, team intro, company culture

### Visual Layout:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Frame 0-90 (3s): LOGO + NAME                     │
│  ┌───────────────────────────────────────────┐    │
│  │                                           │    │
│  │          [COMPANY LOGO]                   │    │
│  │           (300x300px)                     │    │
│  │                                           │    │
│  │          CompanyName                      │    │
│  │          (64px, bold)                     │    │
│  │                                           │    │
│  │       Building the future                 │    │
│  │          (28px, gray)                     │    │
│  │                                           │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  Frame 90-240 (5s): MISSION + VALUES              │
│  ┌─────────────────────────────────────────┐      │
│  │  Our Mission                             │      │
│  │  (36px, accent color)                    │      │
│  │                                           │      │
│  │  "Empowering teams to build better      │      │
│  │   products through AI-powered tools"     │      │
│  │  (24px, italic, centered)                │      │
│  │                                           │      │
│  │  ✓ Innovation                            │      │
│  │  ✓ Quality                               │      │
│  │  ✓ Customer Success                      │      │
│  │  (28px, list with checkmarks)            │      │
│  └─────────────────────────────────────────┘      │
│                                                     │
│  Frame 240-360 (4s): TEAM STATS                   │
│  ┌─────────────────────────────────────────┐      │
│  │                                           │      │
│  │   50+ Team Members  |  10 Countries      │      │
│  │      (36px)         |    (36px)          │      │
│  │                                           │      │
│  │          Founded 2020                     │      │
│  │            (24px)                         │      │
│  │                                           │      │
│  └─────────────────────────────────────────┘      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Animation Sequence:
- **0-60f**: Logo fades in + scales from 0.8 to 1.0
- **60-90f**: Company name slides up from below
- **90-150f**: Tagline fades in
- **150-180f**: Wipe transition to mission section
- **180-210f**: Mission text types in (kinetic text)
- **210-270f**: Values checkmarks appear one by one (staggered)
- **270-300f**: Wipe transition to stats
- **300-330f**: Team stats counters animate
- **330-360f**: All elements subtle zoom + fade out

### Colors:
- Background: Gradient (`#0a0a0a` to `#1a1a2e`)
- Primary: `#3b82f6` (blue)
- Accent: `#10b981` (green for checkmarks)
- Text: `#ffffff` (white)

### Data Requirements:
```typescript
interface CompanyIntroData {
  companyName: string;
  tagline: string;
  logo?: string;  // URL or staticFile path
  mission: string;
  values: string[];  // 3-5 core values
  stats: {
    teamSize: number;
    countries: number;
    foundedYear: number;
  };
}
```

---

## Base Component Examples

### SceneTransition Component

**Wipe Left Transition:**
```typescript
<SceneTransition
  type="wipe-left"
  startFrame={90}
  duration={15}
>
  <YourContent />
</SceneTransition>
```

**Visual:** Content slides in from right to left with motion blur

### TextReveal Component

**Word-by-Word Reveal:**
```typescript
<TextReveal
  text="Empowering teams to build better products"
  startFrame={180}
  revealType="word-by-word"
  staggerDelay={5}
  fontSize={24}
/>
```

**Visual:** Each word fades + slides up sequentially

### AnimatedCounter Component

**Number Animation:**
```typescript
<AnimatedCounter
  from={0}
  to={1234}
  startFrame={300}
  duration={30}
  fontSize={48}
  suffix=" Stars"
/>
```

**Visual:** Numbers increment smoothly from 0 to target

---

## Design Principles

### Spacing Hierarchy:
- **Screen padding**: 80px minimum (keeps content safe)
- **Section gaps**: 60px (clear visual separation)
- **Element gaps**: 25px (related items)
- **Card padding**: 40px (comfortable internal spacing)

### Typography Scale:
- **Display (72px)**: Hero headlines, main titles
- **H1 (48px)**: Section headers, important statements
- **H2 (36px)**: Subsection headers, feature titles
- **H3 (28px)**: List items, card titles
- **Body (24px)**: Descriptions, body text (MINIMUM)
- **Small (20px)**: Labels, captions (still readable)

### Color Strategy:
- **Dark backgrounds** (#0a0a0a, #0d1117) - professional, cinematic
- **Bright accents** (#10b981 green, #3b82f6 blue, #a78bfa purple) - draw attention
- **White text** (#ffffff) - maximum contrast
- **Gray secondary** (#a0a0a0) - supporting information

### Motion Principles:
- **Entries**: Slide + fade (20-30 frames)
- **Exits**: Faster than entries (15 frames)
- **Stagger**: 5-8 frame delays between similar elements
- **Emphasis**: Spring animations, scale 1.0 → 1.05 → 1.0
- **Continuous**: Subtle float (Math.sin) on static scenes

---

## Next Templates to Design:

4. Case Study Results (before/after comparison layout)
5. Service Offering (3-step process flow)
6. Corporate Announcement (bold centered text, dramatic)
7. Customer Testimonials (quote card with 5-star animation)
8. Brand Story Timeline (horizontal timeline with milestones)
9. Quarterly Results (chart animations, growing bars)
10. Investor Pitch (problem → solution → market flow)

Each will follow same base rules and use BaseTemplate components.
