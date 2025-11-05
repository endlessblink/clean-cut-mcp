# MCP Integration Guide
**How to wire the learning system into clean-stdio-server.ts**

## Status
- ✅ Tools added to ListToolsRequestSchema (lines 544-669)
- ✅ Tool routing added to CallToolRequestSchema (lines 708-715)
- ⏸️ Handler methods need to be implemented

## Handler Methods to Add

Add these methods to the `TrueAiStdioMcpServer` class before the `run()` method (around line 2770):

```typescript
  /**
   * Handler: generate_with_learning
   */
  private async handleGenerateWithLearning(args: any) {
    const { generateAnimation } = await import('./integrated-generator.js');

    try {
      const result = await generateAnimation({
        content: args.content,
        scenes: args.scenes,
        brandLogo: args.brandLogo,
        style: args.style || 'tech',
        userPreferences: 'apply'
      });

      return {
        content: [{
          type: 'text',
          text: `[GENERATION SUCCESSFUL]

Duration: ${result.metadata.duration.total_frames} frames (${result.metadata.duration.total_seconds.toFixed(1)}s)
Scenes: ${result.spec.scenes.length}
Energy: ${result.metadata.analysis.energy.toFixed(2)}
Brand: ${result.metadata.brand.source}

Enforcement:
  Violations: ${result.metadata.enforcement.violations.length}
  Warnings: ${result.metadata.enforcement.warnings.length}
  Recommendations: ${result.metadata.enforcement.recommendations.length}

${result.metadata.enforcement.recommendations.length > 0 ? '💡 Recommendations:\n' + result.metadata.enforcement.recommendations.map(r => `  - ${r}`).join('\n') : ''}

Generated Code:
${result.code}
`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `[GENERATION BLOCKED]

${error.message}

Fix violations before generating.`
        }],
        isError: true
      };
    }
  }

  /**
   * Handler: record_user_correction
   */
  private async handleRecordCorrection(args: any) {
    const { recordCorrection } = await import('./preference-learner.js');

    const correction = recordCorrection({
      issue_type: args.issue_type,
      issue_description: args.issue_description,
      original_parameters: args.original_value,
      corrected_parameters: args.corrected_value,
      learned_rule: `auto_generated_${args.issue_type}_${Date.now()}`,
      confidence: 'medium',  // Could be enhanced with confidence scoring
      element_context: args.element_context
    });

    return {
      content: [{
        type: 'text',
        text: `[CORRECTION RECORDED]

ID: ${correction.id}
Issue: ${correction.issue_description}
Learned: ${correction.learned_rule}
Confidence: ${correction.confidence}

This rule will be applied to future generations automatically.`
      }]
    };
  }

  /**
   * Handler: view_learned_preferences
   */
  private async handleViewPreferences(args: any) {
    const { generateLearningReport } = await import('./preference-learner.js');

    const report = generateLearningReport();

    return {
      content: [{
        type: 'text',
        text: report
      }]
    };
  }

  /**
   * Handler: sync_root_file
   */
  private async handleSyncRoot(args: any) {
    const { syncRootTsx } = await import('./root-sync.js');

    const result = await syncRootTsx();

    return {
      content: [{
        type: 'text',
        text: `[ROOT.TSX SYNCED]

Animations: ${result.animations}
Changes:
${result.changes.map(c => `  - ${c}`).join('\n')}

Root.tsx is now synchronized with animation files.`
      }]
    };
  }
```

## Import Statements to Add

At the top of clean-stdio-server.ts, add:

```typescript
// Learning system imports (add around line 14)
import type { GenerationRequest } from './integrated-generator.js';
```

## Testing After Integration

```bash
# 1. Rebuild MCP server
cd mcp-server
npm run build

# 2. Restart Claude Desktop
./kill-claude-clean.ps1

# 3. Test commands in Claude Desktop:
# "Use generate_with_learning to create..."
# "Record this correction using record_user_correction..."
# "Show me view_learned_preferences"
# "Run sync_root_file"
```

## Expected Behavior

**generate_with_learning:**
- Analyzes content
- Applies learned rules
- Enforces violations (blocks if found)
- Returns code with metadata

**record_user_correction:**
- Saves correction to preferences.json
- Extracts reusable rule
- Updates metadata
- Returns confirmation

**view_learned_preferences:**
- Shows all 10+ corrections
- Lists learned rules
- Shows statistics
- Returns formatted report

**sync_root_file:**
- Scans animations directory
- Regenerates Root.tsx
- Returns change summary

## File Locations

Add handlers to:
`mcp-server/src/clean-stdio-server.ts` (around line 2770, before `run()` method)

Imports needed:
- `./integrated-generator.js`
- `./preference-learner.js`
- `./root-sync.js`

## Next Steps

1. Add handler methods to clean-stdio-server.ts
2. Rebuild: `npm run build`
3. Copy to Docker: `docker cp dist/ clean-cut-mcp:/app/mcp-server/`
4. Restart Claude Desktop
5. Test all 4 new commands
