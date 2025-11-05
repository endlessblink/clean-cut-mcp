/**
 * Crop Safety Validation for NoOverlapShowcase
 *
 * Run: npx tsx validate-crop-safety.ts
 *
 * Validates that zoom levels don't crop content outside viewport
 */

import {
  validateShotCropSafety,
  generateCropReport,
  ElementBounds,
  calculateMaxSafeScale
} from './src/utils/crop-detector';

// Viewport dimensions
const viewport = { width: 1920, height: 1080 };

// Define elements in each shot (approximate centered positions + sizes)
const elements = {
  shot1Logo: {
    x: (1920 - 1120) / 2,  // Centered horizontally
    y: (1080 - 200) / 2,   // Centered vertically
    width: 1120,           // "CLEAN-CUT" width approx
    height: 200            // Height with subtitle
  } as ElementBounds,

  shot2Question: {
    x: (1920 - 900) / 2,
    y: (1080 - 180) / 2,
    width: 900,            // Text width (80% max-width)
    height: 180            // 2 lines at 72px
  } as ElementBounds,

  shot3CodeEditor: {
    x: (1920 - 1500) / 2,  // Centered
    y: (1080 - 850) / 2,   // Centered
    width: 1500,           // Code editor width
    height: 850            // Code editor height
  } as ElementBounds,

  shot4CTA: {
    x: (1920 - 800) / 2,
    y: (1080 - 200) / 2,
    width: 800,
    height: 200
  } as ElementBounds
};

console.log('🔍 Validating Crop Safety for NoOverlapShowcase...\n');

// Calculate max safe scales for each element
console.log('## Maximum Safe Scales\n');
Object.entries(elements).forEach(([name, bounds]) => {
  const maxScale = calculateMaxSafeScale(bounds, viewport);
  console.log(`${name}: ${maxScale.toFixed(2)}x`);
});
console.log('\n');

// Validate each shot's scale progression
const validations = [
  // Shot 1: No continuous zoom, just entry scale 0.95 → 1.0
  validateShotCropSafety(
    'Shot1-Logo',
    elements.shot1Logo,
    [
      { frame: 0, scale: 0.95 },
      { frame: 15, scale: 1.0 },
      { frame: 70, scale: 1.0 }
    ],
    viewport
  ),

  // Shot 2: Zooms from 1.0 → 1.15 (FIXED - reduced to stay safe)
  validateShotCropSafety(
    'Shot2-Question',
    elements.shot2Question,
    [
      { frame: 0, scale: 1.0 },
      { frame: 30, scale: 1.075 },
      { frame: 65, scale: 1.15 }
    ],
    viewport
  ),

  // Shot 3: Zooms from 1.15 → 1.21 (FIXED - capped at max safe scale)
  validateShotCropSafety(
    'Shot3-CodeEditor',
    elements.shot3CodeEditor,
    [
      { frame: 0, scale: 1.15 },
      { frame: 30, scale: 1.18 },
      { frame: 65, scale: 1.21 }  // FIXED - at max safe limit
    ],
    viewport
  ),

  // Shot 4: No continuous zoom, just rotation
  validateShotCropSafety(
    'Shot4-CTA',
    elements.shot4CTA,
    [
      { frame: 0, scale: 1.0 },
      { frame: 30, scale: 1.0 },
      { frame: 55, scale: 1.0 }
    ],
    viewport
  )
];

// Generate report
const report = generateCropReport(validations);
console.log(report);

// Specific calculations for Shot 3 (code editor - most critical)
console.log('## Shot 3 Code Editor Analysis\n');
const codeEditorMaxSafe = calculateMaxSafeScale(elements.shot3CodeEditor, viewport);
console.log(`Code editor size: ${elements.shot3CodeEditor.width}×${elements.shot3CodeEditor.height}`);
console.log(`Max safe scale: ${codeEditorMaxSafe.toFixed(2)}x`);
console.log(`Current max scale: 1.21x (capped at safe limit)`);

if (1.21 > codeEditorMaxSafe) {
  const overflow = (1.21 / codeEditorMaxSafe * 100 - 100);
  console.log(`Overflow amount: ${overflow.toFixed(1)}% over safe limit\n`);
  console.log(`❌ PROBLEM: Code editor at 1.21x exceeds safe scale of ${codeEditorMaxSafe.toFixed(2)}x`);
  console.log(`   Recommendation: Reduce Shot 3 zoom to ${codeEditorMaxSafe.toFixed(2)}x\n`);
  process.exit(1);
} else {
  console.log(`\n✅ All scales within safe limits\n`);
  process.exit(0);
}
