# Template System Architecture

**Date**: October 5, 2025
**Status**: Design Phase
**Goal**: 50-template library with intelligent AI selection

---

## System Overview

**Template-based generation** allows users to create professional animations in seconds instead of minutes by selecting and customizing pre-built templates rather than generating code from scratch.

### Benefits

1. **Speed**: 10-30 seconds vs 2-5 minutes for custom generation
2. **Consistency**: All templates pre-validated against base rules
3. **Quality**: Battle-tested designs with proven effectiveness
4. **Choice**: 50 templates covering all major use cases
5. **Learning**: System learns which templates users prefer

---

## Architecture Layers

### Layer 1: Template Metadata (Research-Based)

Based on Pictory/InVideo template selection approach:

```typescript
interface AnimationTemplate {
  // Identity
  id: string;
  name: string;
  category: 'business' | 'social' | 'tech' | 'education' | 'creative';

  // Matching (40% of selection score)
  keywords: string[];
  description: string;

  // Technical specs
  defaultDuration: number;
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  complexity: 'simple' | 'moderate' | 'complex';

  // Content characteristics (30% of selection score)
  textHeavy: boolean;
  dataVisualization: boolean;
  characterCount: 'none' | 'minimal' | 'multiple';

  // Style attributes (10% of selection score)
  energy: number;  // 1-10
  professional: number;  // 1-10
  colorfulness: number;  // 1-10

  // Platform optimization (20% of selection score)
  platforms: Platform[];

  // Customization
  requiredFields: string[];
  optionalFields: string[];
  componentPath: string;
}
```

### Layer 2: Base Components (After Effects .mogrt pattern)

Reusable building blocks that all templates use:

1. **BaseTemplate** - Abstract class enforcing base rules
2. **SceneTransition** - Consistent transitions (wipe, slide, fade)
3. **TextReveal** - Kinetic typography animations
4. **DataVisualization** - Charts, counters, progress bars
5. **BrandElements** - Logo animations, branded overlays

### Layer 3: Template Components (50 Total)

Concrete implementations extending base components:

**Business/Corporate (10):** Product Showcase, Company Intro, GitHub Showcase, Case Study, Service Offering, Announcement, Testimonials, Brand Story, Quarterly Results, Investor Pitch

**Social Media (10):** Instagram Story, YouTube Intro, TikTok Trend, Twitter Post, LinkedIn Post, Facebook Ad, Podcast Clip, Live Stream, Poll/Quiz, Reel/Short

**Tech/Developer (10):** Code Walkthrough, API Docs, Tech Stack, OSS Contribution, Tutorial, Bug Fix, Performance Comparison, Architecture, Release Notes, GitHub Profile

**Education/Explainer (10):** Concept Explanation, Tutorial, Comparison, Timeline, Process Flow, Math/Science, Language Learning, Quiz, Infographic, Summary

**Creative/Entertainment (10):** Title Sequence, Credits, Music Visualizer, Event Invite, Countdown, Quote, Behind-the-Scenes, Portfolio, Travel, Recipe

### Layer 4: Selection Algorithm

**Intelligent matching (from AI video generation research):**

```typescript
function selectBestTemplate(userPrompt: string): TemplateMatch[] {
  // 1. Extract user intent
  const keywords = extractKeywords(userPrompt);
  const platform = detectPlatform(userPrompt);  // YouTube, Instagram, etc.
  const energy = analyzeEnergy(userPrompt);  // Calm vs energetic
  const hasData = /chart|graph|metric|number|stat/i.test(userPrompt);

  // 2. Score all templates
  const scores = templates.map(t => ({
    template: t,
    score: calculateScore(t, {keywords, platform, energy, hasData}),
    reason: explainMatch(t, userPrompt)
  }));

  // 3. Return top 3 ranked
  return scores.sort((a, b) => b.score - a.score).slice(0, 3);
}

function calculateScore(template, userInput): number {
  let score = 0;

  // Keyword matching (40%)
  score += keywordOverlap(template.keywords, userInput.keywords) * 0.4;

  // Content type (30%)
  if (userInput.hasData && template.dataVisualization) score += 0.3;

  // Platform match (20%)
  if (template.platforms.includes(userInput.platform)) score += 0.2;

  // Energy similarity (10%)
  score += (1 - Math.abs(userInput.energy - template.energy) / 10) * 0.1;

  return score;
}
```

### Layer 5: MCP Tools

**User-facing tools:**
- `browse_templates(filters)` - Browse catalog
- `suggest_templates(prompt)` - AI-powered recommendations
- `create_from_template(id, data)` - Instantiate template
- `preview_template(id)` - See template with mock data
- `get_template_fields(id)` - Get customization options

---

## Implementation Phases

### Phase 1: Design (1-2 days) ✅
- [x] Research competitor approaches
- [x] Design metadata schema
- [x] Create selection algorithm
- [x] Define TypeScript interfaces

### Phase 2: Base Architecture (2-3 days)
- [ ] Create BaseTemplate abstract class
- [ ] Build reusable components (transitions, text, data viz)
- [ ] Integrate with PROJECT_CONFIG.md
- [ ] Add base rule enforcement

### Phase 3: First 10 Templates (5-7 days)
- [ ] Business/Corporate category (highest priority)
- [ ] Test with real use cases
- [ ] Validate selection algorithm works
- [ ] Gather user feedback

### Phase 4: MCP Tool Integration (3-4 days)
- [ ] Implement browse/suggest/create tools
- [ ] Add to clean-stdio-server.ts
- [ ] Test end-to-end workflow
- [ ] Document usage

### Phase 5: Remaining 40 Templates (3-4 weeks)
- [ ] Social Media (Week 1)
- [ ] Tech/Developer (Week 2)
- [ ] Education (Week 3)
- [ ] Creative (Week 4)

**Total Timeline:** ~5-6 weeks for complete 50-template system

---

## Selection Algorithm Examples

**Example 1: GitHub Profile**
```
User: "Create my GitHub profile showcase"
  ↓
Extract: keywords=[github, profile], platform=youtube, energy=5
  ↓
Scores:
- GitHubShowcase: 0.92 (keyword match + data viz)
- PortfolioPiece: 0.67 (general portfolio)
- TechStack: 0.54 (tech-related)
  ↓
Recommend: GitHubShowcase
```

**Example 2: Product Launch**
```
User: "Announcement video for our new product launch"
  ↓
Extract: keywords=[announcement, product, launch], platform=linkedin, energy=8
  ↓
Scores:
- Announcement: 0.88 (keyword match + professional)
- ProductShowcase: 0.79 (product-focused)
- CompanyIntro: 0.45 (company-focused)
  ↓
Recommend: Announcement
```

---

## Template Quality Standards

**Every template must:**
1. ✅ Pass all base rule validation (fonts 24px+, padding 40px+, fontFamily)
2. ✅ Use PROJECT_CONFIG.md (no hardcoded colors/fonts)
3. ✅ Include Zod schema for props
4. ✅ Have proper TypeScript types
5. ✅ Render in < 2 minutes
6. ✅ Work on 1920x1080 AND vertical formats
7. ✅ Include usage examples
8. ✅ Have comprehensive metadata

---

## File Structure

```
clean-cut-workspace/src/patterns/
├── base/
│   ├── BaseTemplate.tsx          # Abstract base class
│   ├── SceneTransition.tsx       # Reusable transitions
│   ├── TextReveal.tsx            # Typography animations
│   ├── DataVisualization.tsx     # Charts and counters
│   └── BrandElements.tsx         # Logo, overlays
│
├── templates/
│   ├── business/
│   │   ├── ProductShowcase.tsx
│   │   ├── CompanyIntro.tsx
│   │   └── ...
│   ├── social/
│   │   ├── InstagramStory.tsx
│   │   └── ...
│   ├── tech/
│   ├── education/
│   └── creative/
│
└── metadata/
    ├── template-registry.json     # All templates indexed
    └── selection-weights.json     # Algorithm tuning
```

---

## MCP Server Integration

**New modules to create:**
- `template-manager.ts` - Template loading and registry
- `template-selector.ts` - Selection algorithm implementation
- `template-customizer.ts` - Apply user data to templates

**Update to clean-stdio-server.ts:**
- Add 5 new MCP tools (browse, suggest, create, preview, get_fields)
- Integrate with existing validation
- Share preferences system (learn from selections)

---

## Success Metrics

**Template usage:**
- 70%+ of animations use templates (vs 30% custom generation)
- Average creation time < 1 minute
- 90%+ user satisfaction with template matches

**Selection accuracy:**
- Top suggestion is chosen 80%+ of time
- Users override selection < 20% of time
- Zero templates never used (all 50 have value)

---

## Next Steps

1. Create TypeScript interfaces for metadata schema
2. Build BaseTemplate and base components
3. Implement first template (ProductShowcase) as proof of concept
4. Build selection algorithm
5. Add MCP tools
6. Test end-to-end workflow
7. Create remaining templates in phases
