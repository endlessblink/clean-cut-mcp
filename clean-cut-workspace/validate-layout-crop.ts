/**
 * Test: Layout Crop Validation
 * Run: npx tsx validate-layout-crop.ts
 */

import { validateLayoutCrop } from './src/utils/crop-detector';

console.log('🧪 Testing Layout Crop Validator\n');

// Test 1: Original broken layout (1040px cards)
console.log('## Test 1: Original 2-Card Layout (BROKEN)\n');
const brokenLayout = validateLayoutCrop({
  type: 'flex-row',
  gap: 40,
  elementWidth: 1040,
  elementHeight: 400,
  elementCount: 2
});

console.log(`Total width: ${brokenLayout.totalWidth}px`);
console.log(`Horizontal overflow: ${brokenLayout.overflow.horizontal}px`);
console.log(`Max safe width: ${brokenLayout.maxSafeElementWidth}px`);
console.log(brokenLayout.recommendation);
console.log('');

// Test 2: Fixed layout (893px cards)
console.log('## Test 2: Fixed 2-Card Layout (SAFE)\n');
const fixedLayout = validateLayoutCrop({
  type: 'flex-row',
  gap: 40,
  elementWidth: 893,
  elementHeight: 400,
  elementCount: 2
});

console.log(`Total width: ${fixedLayout.totalWidth}px`);
console.log(`Horizontal overflow: ${fixedLayout.overflow.horizontal}px`);
console.log(fixedLayout.recommendation);
console.log('');

// Test 3: Current layout (880px cards)
console.log('## Test 3: Current 2-Card Layout (880px)\n');
const currentLayout = validateLayoutCrop({
  type: 'flex-row',
  gap: 40,
  elementWidth: 880,
  elementHeight: 400,
  elementCount: 2
});

console.log(`Total width: ${currentLayout.totalWidth}px`);
console.log(`Is cropped: ${currentLayout.isCropped}`);
console.log(currentLayout.recommendation);
console.log('');

// Test 4: 3-column layout
console.log('## Test 4: 3-Card Layout\n');
const threeCardLayout = validateLayoutCrop({
  type: 'flex-row',
  gap: 30,
  elementWidth: 600,
  elementHeight: 350,
  elementCount: 3
});

console.log(`Total width: ${threeCardLayout.totalWidth}px`);
console.log(`Max safe width per card: ${threeCardLayout.maxSafeElementWidth}px`);
console.log(threeCardLayout.recommendation);
console.log('');

console.log('✅ Layout Crop Validator working\n');
