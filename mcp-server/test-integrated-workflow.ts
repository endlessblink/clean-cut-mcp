/**
 * Test: Complete Integrated Workflow
 * Run: npx tsx test-integrated-workflow.ts
 *
 * Tests the FULL pipeline: analyze → brand → preferences → enforce → validate → generate
 */

import { generateAnimation } from './src/integrated-generator';

console.log('🧪 Testing Complete Integrated Workflow\n');
console.log('='.repeat(60) + '\n');

// Test: Generate GitHub profile animation
const request = {
  content: "Show endlessblink GitHub profile with projects and achievements",
  scenes: [
    "endlessblink - AI Developer",
    "89 stars, 6 repositories",
    "Like-I-Said MCP - Advanced Memory Management",
    "Comfy-Guru - ComfyUI Error Helper",
    "clean-cut-mcp - Animation Generator",
    "Achievements: Starstruck, YOLO, Quickdraw",
    "Tech Stack: TypeScript, JavaScript, Python",
    "Explore more at github.com/endlessblink"
  ],
  style: "tech",
  userPreferences: "apply" as const  // Apply learned rules
};

generateAnimation(request)
  .then(result => {
    console.log('='.repeat(60));
    console.log('\n✅ GENERATION SUCCESSFUL\n');
    console.log('## Result Summary:\n');
    console.log(`Scenes: ${result.spec.scenes.length}`);
    console.log(`Duration: ${result.metadata.duration.total_frames} frames (${result.metadata.duration.total_seconds.toFixed(1)}s)`);
    console.log(`Energy: ${result.metadata.analysis.energy.toFixed(2)}`);
    console.log(`Brand: ${result.metadata.brand.source} (${result.metadata.brand.accent})`);
    console.log(`\nEnforcement:`);
    console.log(`  Valid: ${result.metadata.enforcement.valid}`);
    console.log(`  Violations: ${result.metadata.enforcement.violations.length}`);
    console.log(`  Warnings: ${result.metadata.enforcement.warnings.length}`);
    console.log(`  Recommendations: ${result.metadata.enforcement.recommendations.length}`);

    if (result.metadata.enforcement.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      result.metadata.enforcement.recommendations.forEach(r => console.log(`  - ${r}`));
    }

    console.log('\n## Generated Code Preview:\n');
    console.log(result.code.slice(0, 500) + '...\n');

    console.log('✅ Complete workflow test PASSED\n');
  })
  .catch(error => {
    console.error('\n❌ GENERATION BLOCKED:\n');
    console.error(error.message);
    console.error('\n');
    process.exit(1);
  });
