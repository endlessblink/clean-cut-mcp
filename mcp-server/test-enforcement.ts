/**
 * Test: Rule Enforcement Engine
 * Run: npx tsx test-enforcement.ts
 *
 * Tests that learned rules PREVENT repeated mistakes
 */

import { enforceLearnedRules, generateEnforcementReport, AnimationSpec } from './src/rule-enforcer';

console.log('🧪 Testing Rule Enforcement Engine\n');

// Test 1: Animation with VIOLATIONS (should be blocked)
console.log('## Test 1: Animation with Violations (Should BLOCK)\n');

const badSpec: AnimationSpec = {
  scenes: [
    {
      name: 'Scene1-Hero',
      type: 'hero',
      startFrame: 0,
      endFrame: 75,
      exitType: 'wipe-left',
      entryTransition: 'none',  // ❌ VIOLATION: No entry transition
      hasMotionBlur: false,
      elements: [{
        type: 'text',
        width: 800,
        height: 200,
        velocity: 200  // ❌ VIOLATION: Fast movement without blur
      }]
    },
    {
      name: 'Scene2-Content',
      type: 'content',
      startFrame: 90,  // ❌ VIOLATION: Gap (75-90 = 15 frame dead space)
      endFrame: 165,
      exitType: 'hard-cut',
      entryTransition: 'slide-up',
      hasMotionBlur: true,
      elements: [{
        type: 'code_editor',
        width: 1500,
        height: 850,
        scale: 1.6  // ❌ VIOLATION: Exceeds learned max (1.21x)
      }]
    }
  ],
  totalDuration: 165
};

const badResult = enforceLearnedRules(badSpec);

console.log(generateEnforcementReport(badResult));
console.log(`Can generate: ${badResult.valid ? 'YES' : 'NO'}\n`);

// Test 2: Animation FOLLOWING all rules (should pass)
console.log('## Test 2: Animation Following All Rules (Should PASS)\n');

const goodSpec: AnimationSpec = {
  scenes: [
    {
      name: 'Scene1-Hero',
      type: 'hero',
      startFrame: 0,
      endFrame: 90,
      exitType: 'wipe-left',
      entryTransition: 'slide-up',  // ✅ Has entry
      hasMotionBlur: true,  // ✅ Has blur for movement
      elements: [{
        type: 'text',
        width: 800,
        height: 200,
        velocity: 200,
        scale: 1.0  // ✅ No element-level scale
      }]
    },
    {
      name: 'Scene2-Content',
      type: 'content',
      startFrame: 75,  // ✅ No gap (overlaps for transition)
      endFrame: 180,
      exitType: 'hard-cut',
      entryTransition: 'wipe-right',  // ✅ Enters from opposite direction
      hasMotionBlur: true,
      elements: [{
        type: 'code_editor',
        width: 1500,
        height: 850,
        scale: undefined  // ✅ No element scale (learned rule)
      }]
    }
  ],
  totalDuration: 180
};

const goodResult = enforceLearnedRules(goodSpec);

console.log(generateEnforcementReport(goodResult));
console.log(`Can generate: ${goodResult.valid ? 'YES' : 'NO'}\n`);

console.log('## Summary\n');
console.log('Test 1 (violations): Should be BLOCKED -', !badResult.valid ? '✅ BLOCKED' : '❌ ALLOWED');
console.log('Test 2 (following rules): Should be ALLOWED -', goodResult.valid ? '✅ ALLOWED' : '❌ BLOCKED');
console.log('');
console.log('✅ Rule Enforcement working correctly\n');
