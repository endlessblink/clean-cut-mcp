/**
 * Test: Content Analyzer
 * Run: npx tsx test-content-analyzer.ts
 */

import { analyzeContent, analyzeScenes } from './src/content-analyzer';

console.log('🧪 Testing Content Analyzer\n');

// Test 1: Energy detection
console.log('## Test 1: Energy Detection\n');

const testCases = [
  { content: "Fast, dynamic, explosive action sequence", expected: "high (>0.6)" },
  { content: "Calm, gentle, elegant presentation", expected: "low (<0.4)" },
  { content: "Professional software documentation", expected: "moderate (~0.5)" }
];

testCases.forEach(test => {
  const analysis = analyzeContent(test.content, 1);
  console.log(`Content: "${test.content}"`);
  console.log(`Energy: ${analysis.energy.toFixed(2)} (expected: ${test.expected})`);
  console.log(`Keywords: ${analysis.keywords.join(', ')}\n`);
});

// Test 2: Feature extraction
console.log('## Test 2: Feature Extraction\n');

const technicalContent = "Show the API code function with developer tools";
const techAnalysis = analyzeContent(technicalContent, 1);
console.log(`Content: "${technicalContent}"`);
console.log(`Has technical content: ${techAnalysis.features.hasTechnicalContent}`);
console.log(`Has code examples: ${techAnalysis.features.hasCodeExamples}`);
console.log(`Energy: ${techAnalysis.energy.toFixed(2)}\n`);

// Test 3: Scene analysis
console.log('## Test 3: Scene Analysis\n');

const scenes = [
  "Welcome to our product",
  "Here are the key features and benefits",
  "Get started today with our free trial"
];

const sceneAnalysis = analyzeScenes(scenes);
sceneAnalysis.forEach(s => {
  console.log(`Scene ${s.sceneIndex + 1}: "${s.content}"`);
  console.log(`  Role: ${s.scene_role}`);
  console.log(`  Energy: ${s.energy.toFixed(2)}`);
  console.log(`  Similarity to next: ${(s.similarity_to_next * 100).toFixed(0)}%`);
  console.log(`  Recommended duration: ${s.recommended_duration} frames\n`);
});

// Test 4: Transition selection (using analyzed data)
console.log('## Test 4: Transition Selection Based on Analysis\n');

for (let i = 0; i < sceneAnalysis.length - 1; i++) {
  const current = sceneAnalysis[i];
  const next = sceneAnalysis[i + 1];
  const energyChange = Math.abs(current.energy - next.energy);

  let recommendedTransition;
  if (energyChange > 0.5) {
    recommendedTransition = 'hard-cut';
  } else if (current.similarity_to_next > 0.7) {
    recommendedTransition = 'crossfade';
  } else if (energyChange > 0.3) {
    recommendedTransition = 'wipe';
  } else {
    recommendedTransition = 'crossfade';
  }

  console.log(`Scene ${i + 1} → Scene ${i + 2}:`);
  console.log(`  Energy change: ${energyChange.toFixed(2)}`);
  console.log(`  Similarity: ${(current.similarity_to_next * 100).toFixed(0)}%`);
  console.log(`  Recommended: ${recommendedTransition}\n`);
}

console.log('✅ Content Analyzer test complete\n');
