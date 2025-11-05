/**
 * Test: Preference Learning System
 * Run: npx tsx test-preference-learning.ts
 */

import {
  recordCorrection,
  loadPreferences,
  findMatchingRule,
  generateLearningReport
} from './src/preference-learner';

import {
  applyLearnedRules,
  suggestImprovements,
  getLearningStats,
  AnimationScene
} from './src/preference-applier';

console.log('🧪 Testing Preference Learning System\n');

// Test 1: Record a new correction
console.log('## Test 1: Recording User Correction\n');

const correction = recordCorrection({
  issue_type: 'crop',
  issue_description: 'Large text block cropped when zoomed to 1.5x',
  original_parameters: {
    element_type: 'text_block',
    element_size: { width: 800, height: 200 },
    scale: 1.5
  },
  corrected_parameters: {
    scale: 1.3,
    reason: 'Reduced scale to fit within viewport'
  },
  learned_rule: 'text_block_max_scale_800x200',
  confidence: 'high',
  element_context: {
    type: 'text_block',
    size: { width: 800, height: 200 }
  }
});

console.log(`Recorded: ${correction.id}`);
console.log(`Learned rule: ${correction.learned_rule}`);
console.log(`Timestamp: ${correction.timestamp}\n`);

// Test 2: Find learned rule
console.log('## Test 2: Finding Learned Rules\n');

const learnedScale = findMatchingRule('text_block', { width: 800, height: 200 }, 'max_scale');
console.log(`Learned max scale for text_block 800x200: ${learnedScale}x\n`);

// Test 3: Apply learned rules to new animation
console.log('## Test 3: Applying Learned Rules\n');

const mockAnimation: AnimationScene[] = [
  {
    name: 'Shot1',
    content: 'Title text',
    startFrame: 0,
    endFrame: 70,
    exitType: 'wipe-left',
    elements: [
      {
        type: 'text_block',
        size: { width: 800, height: 200 },
        position: { x: 560, y: 440 },
        transforms: {
          scale: 1.5  // This will be corrected to 1.3!
        }
      }
    ]
  }
];

const result = applyLearnedRules(mockAnimation);

console.log(`Applied rules: ${result.appliedRules.length}`);
result.appliedRules.forEach(rule => {
  console.log(`  - ${rule.rule_type}: ${rule.applied_to}`);
  console.log(`    Original: ${rule.original_value} → New: ${rule.new_value}`);
  console.log(`    Reason: ${rule.reason}`);
});

console.log(`\nPrevented issues: ${result.prevented_issues.join(', ')}\n`);

// Test 4: Get suggestions
console.log('## Test 4: Improvement Suggestions\n');

const suggestions = suggestImprovements(mockAnimation);
suggestions.forEach(s => console.log(`💡 ${s}`));
console.log();

// Test 5: Learning statistics
console.log('## Test 5: Learning Statistics\n');

const stats = getLearningStats();
console.log(`Total rules learned: ${stats.total_rules}`);
console.log(`Rules by type:`, stats.rules_by_type);
console.log(`Confidence distribution:`, stats.confidence_distribution);
console.log();

// Test 6: Generate learning report
console.log('## Test 6: Learning Report\n');

const report = generateLearningReport();
console.log(report);

console.log('✅ Preference Learning test complete\n');
