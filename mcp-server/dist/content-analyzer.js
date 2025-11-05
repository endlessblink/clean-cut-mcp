/**
 * Content Analyzer - Simple Keyword-Based Feature Extraction
 *
 * NO ML models - uses keywords, heuristics, and simple text analysis
 * Provides energy levels, complexity, and features for motion algorithm decisions
 */
/**
 * Analyze content for motion graphics generation
 */
export function analyzeContent(content, sceneCount = 1) {
    const words = content.split(/\s+/);
    const wordCount = words.length;
    return {
        energy: detectEnergyLevel(content),
        complexity: estimateComplexity(content, sceneCount),
        features: extractFeatures(content),
        estimatedDuration: calculateDuration(wordCount), // Deprecated
        calculated_duration: calculateSceneBasedDuration(sceneCount), // NEW: Formula-based
        sceneCount,
        readingTime: wordCount / 180 * 60, // 180 WPM average reading
        keywords: extractKeywords(content)
    };
}
/**
 * Detect energy level from keywords (0.0-1.0)
 */
function detectEnergyLevel(content) {
    const text = content.toLowerCase();
    // High energy keywords
    const highEnergyWords = [
        'fast', 'quick', 'rapid', 'action', 'dynamic', 'power', 'explosive',
        'exciting', 'intense', 'aggressive', 'bold', 'dramatic', 'impact'
    ];
    // Low energy keywords
    const lowEnergyWords = [
        'calm', 'gentle', 'smooth', 'soft', 'subtle', 'quiet', 'peaceful',
        'elegant', 'graceful', 'slow', 'relaxed', 'minimal', 'simple'
    ];
    const highCount = highEnergyWords.filter(w => text.includes(w)).length;
    const lowCount = lowEnergyWords.filter(w => text.includes(w)).length;
    // Base energy: 0.5 (moderate)
    // +0.1 per high energy word, -0.1 per low energy word
    const energy = 0.5 + (highCount * 0.1) - (lowCount * 0.1);
    // Clamp to 0.3-0.8 range
    return Math.max(0.3, Math.min(0.8, energy));
}
/**
 * Estimate complexity from content analysis
 */
function estimateComplexity(content, sceneCount) {
    const wordCount = content.split(/\s+/).length;
    const hasCode = /```|code|function|class|const|import/.test(content);
    const hasList = /\n-|\n\d\.|\n\*/.test(content);
    // Simple heuristics
    if (sceneCount === 1 && wordCount < 50 && !hasCode && !hasList) {
        return 'simple';
    }
    if (sceneCount > 4 || wordCount > 200 || (hasCode && hasList)) {
        return 'complex';
    }
    return 'medium';
}
/**
 * Extract boolean features from content
 */
function extractFeatures(content) {
    return {
        hasTechnicalContent: /code|API|function|class|developer|technical|software/i.test(content),
        hasListContent: /features|benefits|steps|\n-|\n\d\./i.test(content),
        hasCodeExamples: /```|function|const|import|export|class/i.test(content),
        hasQuestions: /\?|how to|what is|why|when/i.test(content),
        hasCallToAction: /start|try|get|download|sign up|learn more|contact/i.test(content)
    };
}
/**
 * Calculate animation duration based on scene count (RESEARCH-VALIDATED FORMULA)
 *
 * Formula: duration = (sceneCount × framesPerScene) + (transitionCount × framesPerTransition)
 *
 * Research basis:
 * - Minimum scene duration: 60 frames (2 seconds) for comprehension
 * - Optimal scene duration: 75 frames (2.5 seconds) for comfortable reading
 * - Maximum scene duration: 90 frames (3 seconds) before attention loss
 * - Transition duration: 15 frames (0.5 seconds) professional standard
 *
 * @param sceneCount Number of scenes in animation
 * @param framesPerScene Optional override (default: 75 frames = 2.5 seconds)
 * @param fps Optional frame rate (default: 30)
 * @returns Duration breakdown with total frames and seconds
 */
export function calculateSceneBasedDuration(sceneCount, framesPerScene = 75, fps = 30) {
    // Validate inputs
    if (sceneCount < 1)
        sceneCount = 1;
    if (framesPerScene < 60)
        framesPerScene = 60; // Minimum for comprehension
    if (framesPerScene > 90)
        framesPerScene = 90; // Maximum before boredom
    const transitionCount = sceneCount - 1; // Transitions between scenes
    const transitionDuration = 15; // Professional standard
    const sceneFrames = sceneCount * framesPerScene;
    const transitionFrames = transitionCount * transitionDuration;
    const totalFrames = sceneFrames + transitionFrames;
    return {
        total_frames: totalFrames,
        total_seconds: totalFrames / fps,
        scene_frames: sceneFrames,
        transition_frames: transitionFrames,
        formula: `(${sceneCount} scenes × ${framesPerScene} frames) + (${transitionCount} transitions × ${transitionDuration} frames) = ${totalFrames} frames (${(totalFrames / fps).toFixed(1)}s @ ${fps}fps)`
    };
}
/**
 * Calculate estimated duration (milliseconds) - DEPRECATED
 * Use calculateSceneBasedDuration() instead for formula-based calculation
 */
function calculateDuration(wordCount) {
    const WPM = 60; // 60 words per minute (research-validated)
    const readingTimeMs = (wordCount / WPM) * 60 * 1000;
    // Add time for visual processing (30% overhead)
    const withProcessingTime = readingTimeMs * 1.3;
    // Minimum 2 seconds, maximum 60 seconds
    return Math.max(2000, Math.min(60000, withProcessingTime));
}
/**
 * Extract important keywords
 */
function extractKeywords(content) {
    const words = content.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/)
        .filter(w => w.length > 3); // Filter short words
    // Count frequency
    const frequency = {};
    words.forEach(w => {
        frequency[w] = (frequency[w] || 0) + 1;
    });
    // Return top 10 most frequent
    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
}
/**
 * Analyze individual scenes
 */
export function analyzeScenes(scenes) {
    return scenes.map((content, index) => {
        const nextScene = scenes[index + 1];
        return {
            sceneIndex: index,
            content,
            energy: detectEnergyLevel(content),
            similarity_to_next: nextScene ? calculateSimilarity(content, nextScene) : 0,
            recommended_duration: estimateSceneDuration(content),
            scene_role: detectSceneRole(index, scenes.length)
        };
    });
}
/**
 * Calculate content similarity (simple word overlap)
 */
function calculateSimilarity(content1, content2) {
    const words1 = new Set(content1.toLowerCase().split(/\s+/));
    const words2 = new Set(content2.toLowerCase().split(/\s+/));
    const intersection = [...words1].filter(w => words2.has(w));
    const union = new Set([...words1, ...words2]);
    return intersection.length / union.size; // Jaccard similarity
}
/**
 * Estimate scene duration (frames at 30fps)
 */
function estimateSceneDuration(content) {
    const words = content.split(/\s+/).length;
    const readingTimeMs = (words / 60) * 60 * 1000; // 60 WPM
    const minDuration = 2000; // 2 seconds minimum
    const maxDuration = 8000; // 8 seconds maximum
    const duration = Math.max(minDuration, Math.min(maxDuration, readingTimeMs * 1.5));
    return Math.round((duration / 1000) * 30); // Convert to frames at 30fps
}
/**
 * Detect scene role in narrative
 */
function detectSceneRole(index, total) {
    if (index === 0)
        return 'intro';
    if (index === total - 1)
        return 'outro';
    if (index === Math.floor(total * 0.7))
        return 'climax'; // ~70% through
    return 'body';
}
/**
 * Usage Example:
 *
 * // Analyze overall content
 * const analysis = analyzeContent("How do you create professional motion graphics?", 3);
 * console.log(`Energy: ${analysis.energy}`);  // 0.5
 * console.log(`Has questions: ${analysis.features.hasQuestions}`);  // true
 * console.log(`Estimated duration: ${analysis.estimatedDuration}ms`);
 *
 * // Analyze individual scenes
 * const scenes = [
 *   "Welcome to our product",
 *   "Here are the key features",
 *   "Get started today"
 * ];
 * const sceneAnalysis = analyzeScenes(scenes);
 * sceneAnalysis.forEach(s => {
 *   console.log(`Scene ${s.sceneIndex}: ${s.scene_role}, energy ${s.energy}`);
 * });
 *
 * // Use for transition selection
 * const energyChange = Math.abs(sceneAnalysis[0].energy - sceneAnalysis[1].energy);
 * const similarity = sceneAnalysis[0].similarity_to_next;
 * // Feed to selectTransitionType(energyChange, similarity)
 */
