/**
 * Template Selection Algorithm
 *
 * AI-powered template matching based on user prompts
 * Uses weighted scoring: keywords (40%), content (30%), platform (20%), style (10%)
 */

import type {
  AnimationTemplate,
  UserRequest,
  TemplateMatch,
  Platform,
  AspectRatio,
  TemplateCategory
} from './template-types';

/**
 * Analyze user prompt and extract matching criteria
 */
export function analyzeUserRequest(prompt: string): UserRequest {
  const lowerPrompt = prompt.toLowerCase();

  // Extract keywords (remove only truly generic words, keep important ones like "github", "profile")
  const stopWords = new Set(['a', 'an', 'the', 'for', 'to', 'of', 'and', 'or', 'but', 'in', 'on', 'at', 'with']);
  // Keep important action words: 'my', 'create', 'make', 'show' → help with intent detection
  const keywords = lowerPrompt
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .map(word => word.replace(/[^\w]/g, ''))
    .filter(word => word.length > 0); // Remove empty strings after cleanup

  // Detect platform
  const platform = detectPlatform(lowerPrompt);

  // Detect aspect ratio from platform or explicit mention
  const aspectRatio = detectAspectRatio(lowerPrompt, platform);

  // Detect energy level (1-10)
  const energy = detectEnergy(lowerPrompt);

  // Detect professionalism level (1-10)
  const professional = detectProfessionalism(lowerPrompt);

  // Check for data visualization indicators
  const hasData = /\b(chart|graph|metric|number|stat|data|result|growth|revenue|performance)\b/i.test(prompt);

  return {
    originalPrompt: prompt,
    keywords,
    platform,
    aspectRatio,
    energy,
    professional,
    hasData
  };
}

/**
 * Detect platform from prompt
 */
function detectPlatform(prompt: string): Platform | undefined {
  if (/\b(youtube|yt)\b/i.test(prompt)) return 'youtube';
  if (/\b(instagram|insta|ig)\b/i.test(prompt)) return 'instagram';
  if (/\b(tiktok|tik tok)\b/i.test(prompt)) return 'tiktok';
  if (/\b(linkedin)\b/i.test(prompt)) return 'linkedin';
  if (/\b(twitter|x\.com)\b/i.test(prompt)) return 'twitter';
  if (/\b(facebook|fb)\b/i.test(prompt)) return 'facebook';
  return undefined;
}

/**
 * Detect aspect ratio from prompt or platform
 */
function detectAspectRatio(prompt: string, platform?: Platform): AspectRatio | undefined {
  // Explicit mentions
  if (/\b(vertical|portrait|9:16|story|reel|short)\b/i.test(prompt)) return '9:16';
  if (/\b(square|1:1)\b/i.test(prompt)) return '1:1';
  if (/\b(horizontal|landscape|16:9)\b/i.test(prompt)) return '16:9';
  if (/\b(4:5)\b/i.test(prompt)) return '4:5';

  // Platform defaults
  if (platform === 'instagram' || platform === 'tiktok') return '9:16';
  if (platform === 'youtube') return '16:9';

  return undefined;
}

/**
 * Detect energy level (1=calm, 10=energetic)
 */
function detectEnergy(prompt: string): number {
  // High energy indicators
  const highEnergy = /\b(energetic|fast|quick|exciting|dynamic|bold|powerful|intense)\b/i;
  // Low energy indicators
  const lowEnergy = /\b(calm|slow|smooth|gentle|peaceful|minimal|subtle|quiet)\b/i;

  if (highEnergy.test(prompt)) return 8;
  if (lowEnergy.test(prompt)) return 3;
  return 5; // Default moderate
}

/**
 * Detect professionalism level (1=playful, 10=corporate)
 */
function detectProfessionalism(prompt: string): number {
  // High professionalism
  const corporate = /\b(professional|corporate|business|enterprise|investor|quarterly|formal)\b/i;
  // Low professionalism (playful/casual)
  const casual = /\b(fun|playful|casual|quirky|whimsical|creative|artistic)\b/i;

  if (corporate.test(prompt)) return 9;
  if (casual.test(prompt)) return 3;
  return 6; // Default moderate-professional
}

/**
 * Calculate keyword overlap between two sets
 * Improved: bidirectional matching and partial word matching
 */
function keywordOverlap(templateKeywords: string[], userKeywords: string[]): number {
  if (templateKeywords.length === 0) return 0;

  // Count how many template keywords are matched by user keywords
  const matches = templateKeywords.filter(tk => {
    return userKeywords.some(uk => {
      // Exact match
      if (uk === tk) return true;
      // Substring match (bidirectional)
      if (uk.includes(tk) || tk.includes(uk)) return true;
      // Stemming: "github" matches "git", "profile" matches "prof"
      if (uk.length >= 4 && tk.length >= 4 && uk.startsWith(tk.slice(0, 4))) return true;
      return false;
    });
  });

  return matches.length / templateKeywords.length;
}

/**
 * Score a single template against user request
 */
export function scoreTemplate(template: AnimationTemplate, userRequest: UserRequest): number {
  let score = 0;

  // 1. Keyword matching (50% weight - increased from 40% for better accuracy)
  const keywordScore = keywordOverlap(template.keywords, userRequest.keywords);

  // Bonus: If 2+ keywords match, give extra boost (strong intent signal)
  const matchedCount = template.keywords.filter(tk =>
    userRequest.keywords.some(uk => uk === tk || uk.includes(tk) || tk.includes(uk))
  ).length;
  const keywordBonus = matchedCount >= 2 ? 0.15 : 0;

  score += (keywordScore * 0.5) + keywordBonus;

  // 2. Content type matching (30% weight)
  let contentScore = 0;
  if (userRequest.hasData && template.dataVisualization) {
    contentScore += 1.0; // Perfect match
  } else if (!userRequest.hasData && !template.dataVisualization) {
    contentScore += 0.5; // Compatible but not required
  }
  score += contentScore * 0.3;

  // 3. Platform matching (20% weight)
  let platformScore = 0;
  if (userRequest.platform && template.platforms.includes(userRequest.platform)) {
    platformScore = 1.0;
  } else if (userRequest.aspectRatio && template.aspectRatio === userRequest.aspectRatio) {
    platformScore = 0.7; // Aspect ratio match as fallback
  }
  score += platformScore * 0.2;

  // 4. Style matching (10% weight)
  let styleScore = 0;

  // Energy similarity
  const energyDiff = Math.abs(userRequest.energy - template.energy);
  const energySimilarity = 1 - (energyDiff / 10);

  // Professionalism similarity
  const profDiff = Math.abs(userRequest.professional - template.professional);
  const profSimilarity = 1 - (profDiff / 10);

  styleScore = (energySimilarity + profSimilarity) / 2;
  score += styleScore * 0.1;

  return score;
}

/**
 * Find best matching templates for user request
 */
export function selectTemplates(
  templates: AnimationTemplate[],
  userPrompt: string,
  topN: number = 3
): TemplateMatch[] {
  // 1. Analyze user request
  const userRequest = analyzeUserRequest(userPrompt);

  // 2. Score all templates
  const scored = templates.map(template => {
    const score = scoreTemplate(template, userRequest);
    const matchedKeywords = template.keywords.filter(tk =>
      userRequest.keywords.some(uk => uk.includes(tk) || tk.includes(uk))
    );

    // Generate reason
    const reason = generateMatchReason(template, userRequest, score, matchedKeywords);

    // Generate warnings if any
    const warnings = generateWarnings(template, userRequest);

    return {
      template,
      score,
      reason,
      matchedKeywords,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  });

  // 3. Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // 4. Return top N
  return scored.slice(0, topN);
}

/**
 * Generate human-readable reason for template match
 */
function generateMatchReason(
  template: AnimationTemplate,
  userRequest: UserRequest,
  score: number,
  matchedKeywords: string[]
): string {
  const reasons: string[] = [];

  // Keyword matches
  if (matchedKeywords.length > 0) {
    reasons.push(`Matches keywords: ${matchedKeywords.slice(0, 3).join(', ')}`);
  }

  // Platform match
  if (userRequest.platform && template.platforms.includes(userRequest.platform)) {
    reasons.push(`Optimized for ${userRequest.platform}`);
  }

  // Content match
  if (userRequest.hasData && template.dataVisualization) {
    reasons.push('Includes data visualization');
  }

  // Style match
  if (Math.abs(userRequest.professional - template.professional) < 2) {
    const style = template.professional > 7 ? 'professional' : template.professional < 4 ? 'casual' : 'balanced';
    reasons.push(`${style} style matches your request`);
  }

  return reasons.join('. ') || `${template.name} (${(score * 100).toFixed(0)}% match)`;
}

/**
 * Generate warnings for potential mismatches
 */
function generateWarnings(template: AnimationTemplate, userRequest: UserRequest): string[] {
  const warnings: string[] = [];

  // Aspect ratio mismatch
  if (userRequest.aspectRatio && template.aspectRatio !== userRequest.aspectRatio) {
    warnings.push(`Template is ${template.aspectRatio}, you requested ${userRequest.aspectRatio}`);
  }

  // Platform mismatch
  if (userRequest.platform && !template.platforms.includes(userRequest.platform)) {
    warnings.push(`Template optimized for ${template.platforms[0]}, not ${userRequest.platform}`);
  }

  // Energy mismatch
  const energyDiff = Math.abs(userRequest.energy - template.energy);
  if (energyDiff > 4) {
    const userStyle = userRequest.energy > 7 ? 'energetic' : 'calm';
    const templateStyle = template.energy > 7 ? 'energetic' : 'calm';
    warnings.push(`Template is ${templateStyle}, you want ${userStyle}`);
  }

  return warnings;
}

/**
 * Get template by ID
 */
export function getTemplateById(templates: AnimationTemplate[], id: string): AnimationTemplate | null {
  return templates.find(t => t.id === id) || null;
}

/**
 * Filter templates by category
 */
export function filterByCategory(templates: AnimationTemplate[], category: TemplateCategory): AnimationTemplate[] {
  return templates.filter(t => t.category === category);
}

/**
 * Filter templates by platform
 */
export function filterByPlatform(templates: AnimationTemplate[], platform: Platform): AnimationTemplate[] {
  return templates.filter(t => t.platforms.includes(platform));
}

/**
 * Get all unique categories from templates
 */
export function getCategories(templates: AnimationTemplate[]): TemplateCategory[] {
  const categories = new Set(templates.map(t => t.category));
  return Array.from(categories);
}
