/**
 * Preference Learning Engine
 *
 * Records user corrections and extracts reusable rules
 * Builds knowledge base over time to prevent repeating mistakes
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PREFERENCES_PATH = path.join(__dirname, '../preferences/user-preferences.json');
/**
 * Load user preferences from disk
 */
export function loadPreferences() {
    if (!fs.existsSync(PREFERENCES_PATH)) {
        return createDefaultPreferences();
    }
    const data = fs.readFileSync(PREFERENCES_PATH, 'utf-8');
    return JSON.parse(data);
}
/**
 * Save preferences to disk
 */
export function savePreferences(preferences) {
    preferences.last_updated = new Date().toISOString();
    fs.writeFileSync(PREFERENCES_PATH, JSON.stringify(preferences, null, 2), 'utf-8');
}
/**
 * Create default preferences structure
 */
function createDefaultPreferences() {
    return {
        version: '1.0.0',
        created: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        corrections: [],
        validated_rules: {},
        element_type_mappings: {},
        learning_metadata: {
            total_corrections: 0,
            total_generations: 0,
            success_rate: 0,
            most_common_issue: 'none',
            most_reliable_rule: 'none'
        }
    };
}
/**
 * Record a user correction
 */
export function recordCorrection(correction) {
    const preferences = loadPreferences();
    const fullCorrection = {
        ...correction,
        id: `correction-${String(preferences.corrections.length + 1).padStart(3, '0')}`,
        timestamp: new Date().toISOString()
    };
    preferences.corrections.push(fullCorrection);
    preferences.learning_metadata.total_corrections++;
    // Extract and add rule
    const rule = extractRuleFromCorrection(fullCorrection);
    if (rule) {
        updateValidatedRules(preferences, rule);
    }
    // Update metadata
    updateLearningMetadata(preferences);
    savePreferences(preferences);
    return fullCorrection;
}
/**
 * Extract reusable rule from correction
 */
function extractRuleFromCorrection(correction) {
    switch (correction.issue_type) {
        case 'crop':
            // Extract max safe scale for element type/size
            if (correction.element_context?.size && correction.corrected_parameters.scale) {
                const sizeKey = `${correction.element_context.type}_${correction.element_context.size.width}x${correction.element_context.size.height}`;
                return {
                    type: 'max_scale',
                    rule: {
                        [sizeKey]: correction.corrected_parameters.scale
                    }
                };
            }
            break;
        case 'transition_type':
            // Extract preferred transition between scene types
            if (correction.original_parameters.transition_from && correction.original_parameters.transition_to) {
                const transitionKey = `${correction.original_parameters.transition_from}_to_${correction.original_parameters.transition_to}`;
                return {
                    type: 'preferred_transition',
                    rule: {
                        [transitionKey]: correction.corrected_parameters.transition_type
                    }
                };
            }
            break;
        case 'timing':
            // Extract timing preferences
            if (correction.corrected_parameters.duration || correction.corrected_parameters.delay) {
                return {
                    type: 'timing',
                    rule: correction.corrected_parameters
                };
            }
            break;
        case 'compound_scaling':
            // Reinforce scale isolation rule
            return {
                type: 'scale_isolation',
                rule: {
                    enforce: true,
                    max_levels_with_scale: 1
                }
            };
    }
    return null;
}
/**
 * Update validated rules with new learning
 */
function updateValidatedRules(preferences, extracted) {
    switch (extracted.type) {
        case 'max_scale':
            if (!preferences.validated_rules.max_scales_by_element) {
                preferences.validated_rules.max_scales_by_element = {};
            }
            Object.assign(preferences.validated_rules.max_scales_by_element, extracted.rule);
            break;
        case 'preferred_transition':
            if (!preferences.validated_rules.preferred_transitions) {
                preferences.validated_rules.preferred_transitions = {};
            }
            Object.assign(preferences.validated_rules.preferred_transitions, extracted.rule);
            break;
        case 'timing':
            if (!preferences.validated_rules.timing_preferences) {
                preferences.validated_rules.timing_preferences = {};
            }
            Object.assign(preferences.validated_rules.timing_preferences, extracted.rule);
            break;
        case 'scale_isolation':
            preferences.validated_rules.enforce_scale_isolation = true;
            break;
    }
}
/**
 * Update learning metadata (statistics)
 */
function updateLearningMetadata(preferences) {
    const meta = preferences.learning_metadata;
    // Count issue types
    const issueCounts = {};
    preferences.corrections.forEach(c => {
        issueCounts[c.issue_type] = (issueCounts[c.issue_type] || 0) + 1;
    });
    // Find most common issue
    const mostCommon = Object.entries(issueCounts).sort((a, b) => b[1] - a[1])[0];
    meta.most_common_issue = mostCommon ? mostCommon[0] : 'none';
    // Calculate success rate (placeholder - would track successful generations)
    meta.success_rate = meta.total_generations > 0
        ? 1 - (meta.total_corrections / meta.total_generations)
        : 0;
}
/**
 * Find matching rule for given context
 */
export function findMatchingRule(elementType, elementSize, ruleType) {
    const preferences = loadPreferences();
    if (ruleType === 'max_scale') {
        const sizeKey = `${elementType}_${elementSize.width}x${elementSize.height}`;
        return preferences.validated_rules.max_scales_by_element?.[sizeKey] || null;
    }
    return null;
}
/**
 * Get all learned rules of specific type
 */
export function getLearnedRules(ruleType) {
    const preferences = loadPreferences();
    switch (ruleType) {
        case 'max_scales':
            return preferences.validated_rules.max_scales_by_element || {};
        case 'transitions':
            return preferences.validated_rules.preferred_transitions || {};
        case 'timing':
            return preferences.validated_rules.timing_preferences || {};
        case 'scale_isolation':
            return preferences.validated_rules.scale_isolation_rules || {};
        default:
            return {};
    }
}
/**
 * Generate learning report (for user review)
 */
export function generateLearningReport() {
    const preferences = loadPreferences();
    const meta = preferences.learning_metadata;
    let report = '# Preference Learning Report\n\n';
    report += `**Total Corrections**: ${meta.total_corrections}\n`;
    report += `**Total Generations**: ${meta.total_generations}\n`;
    report += `**Success Rate**: ${(meta.success_rate * 100).toFixed(1)}%\n`;
    report += `**Most Common Issue**: ${meta.most_common_issue}\n`;
    report += `**Most Reliable Rule**: ${meta.most_reliable_rule}\n\n`;
    report += '## Learned Rules\n\n';
    // Max scales
    const maxScales = preferences.validated_rules.max_scales_by_element || {};
    if (Object.keys(maxScales).length > 0) {
        report += '### Maximum Safe Scales\n';
        Object.entries(maxScales).forEach(([element, scale]) => {
            report += `- **${element}**: ${scale}x\n`;
        });
        report += '\n';
    }
    // Preferred transitions
    const transitions = preferences.validated_rules.preferred_transitions || {};
    if (Object.keys(transitions).length > 0) {
        report += '### Preferred Transitions\n';
        Object.entries(transitions).forEach(([key, type]) => {
            report += `- **${key}**: ${type}\n`;
        });
        report += '\n';
    }
    // Recent corrections
    report += '## Recent Corrections\n\n';
    const recent = preferences.corrections.slice(-5).reverse();
    recent.forEach(c => {
        report += `### ${c.id} (${c.timestamp.split('T')[0]})\n`;
        report += `- **Issue**: ${c.issue_description}\n`;
        report += `- **Learned**: ${c.learned_rule}\n`;
        report += `- **Confidence**: ${c.confidence}\n\n`;
    });
    return report;
}
/**
 * Usage Examples:
 *
 * // 1. Record user correction
 * recordCorrection({
 *   issue_type: 'crop',
 *   issue_description: 'Code editor cropped at 1.6x scale',
 *   original_parameters: { scale: 1.6, element_type: 'code_editor' },
 *   corrected_parameters: { scale: 1.19 },
 *   learned_rule: 'code_editor_max_scale_1500x850',
 *   confidence: 'high',
 *   element_context: {
 *     type: 'code_editor',
 *     size: { width: 1500, height: 850 }
 *   }
 * });
 *
 * // 2. Find learned rule for element
 * const maxScale = findMatchingRule('code_editor', { width: 1500, height: 850 }, 'max_scale');
 * console.log(`Learned max scale: ${maxScale}x`);
 *
 * // 3. Generate learning report
 * const report = generateLearningReport();
 * console.log(report);
 */
