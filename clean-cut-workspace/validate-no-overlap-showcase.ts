/**
 * Validation Script for NoOverlapShowcase
 *
 * Run: npx tsx validate-no-overlap-showcase.ts
 *
 * This script validates NoOverlapShowcase's scene timing and reports overlaps
 */

import { validateAnimation, generateValidationReport, SceneDefinition } from './src/utils/animation-validator';

// Define NoOverlapShowcase scenes (from NoOverlapShowcase.tsx)
const scenes: SceneDefinition[] = [
  {
    name: 'Shot1-Logo',
    startFrame: 0,
    endFrame: 70,
    exitType: 'wipe-left',
    exitDuration: 15
  },
  {
    name: 'Shot2-Question',
    startFrame: 55,
    endFrame: 120,
    exitType: 'scale-out',
    exitDuration: 15
  },
  {
    name: 'Shot3-CodeDemo',
    startFrame: 120,
    endFrame: 185,
    exitType: 'hard-cut',
    exitDuration: 0  // Hard cut = instant
  },
  {
    name: 'Shot4-CTA',
    startFrame: 185,
    endFrame: 240,
    exitType: 'hard-cut',
    exitDuration: 0
  }
];

console.log('🔍 Validating NoOverlapShowcase...\n');

// Run validation
const result = validateAnimation(scenes);

// Generate report
const report = generateValidationReport(result);
console.log(report);

// Exit with error code if validation fails
if (!result.valid) {
  console.error('\n❌ VALIDATION FAILED - Fix overlaps before continuing\n');
  process.exit(1);
} else {
  console.log('\n✅ VALIDATION PASSED - No overlaps detected\n');
  process.exit(0);
}

/**
 * Expected output if overlaps exist:
 *
 * # Animation Validation Report
 *
 * ❌ VALIDATION FAILED - 2 error(s) found
 *
 * ## 🚨 CRITICAL ERRORS
 *
 * ### Error 1: OVERLAP
 * **Message**: Frame 55: 2 scenes fully visible (Shot1-Logo, Shot2-Question)
 * **Affected Frames**: 55, 56, 57, ...
 * **Affected Scenes**: Shot1-Logo, Shot2-Question
 *
 * ## 📊 FRAME-BY-FRAME ANALYSIS
 *
 * - Frame 55: Shot1-Logo, Shot2-Question (OVERLAP)
 * - Frame 56: Shot1-Logo, Shot2-Question (OVERLAP)
 * ...
 */
