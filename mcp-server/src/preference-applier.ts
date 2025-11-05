/**
 * Preference Application Engine
 *
 * Applies learned rules to new animation generations
 * Prevents repeating past mistakes automatically
 */

import { loadPreferences, UserPreferences, findMatchingRule } from './preference-learner';

export interface AnimationScene {
  name: string;
  content: string;
  elements: AnimationElement[];
  startFrame: number;
  endFrame: number;
  exitType?: string;
}

export interface AnimationElement {
  type: string;
  size: { width: number; height: number };
  position: { x: number; y: number };
  transforms: {
    scale?: number;
    translateX?: number;
    translateY?: number;
    rotate?: number;
  };
  content?: string;
}

export interface ApplicationResult {
  original: AnimationScene[];
  modified: AnimationScene[];
  appliedRules: AppliedRule[];
  prevented_issues: string[];
}

export interface AppliedRule {
  rule_type: string;
  rule_name: string;
  applied_to: string;
  original_value: any;
  new_value: any;
  reason: string;
}

/**
 * Apply all learned rules to animation
 */
export function applyLearnedRules(scenes: AnimationScene[]): ApplicationResult {
  const preferences = loadPreferences();
  const appliedRules: AppliedRule[] = [];
  const preventedIssues: string[] = [];

  const modifiedScenes = scenes.map(scene => {
    const modifiedElements = scene.elements.map(element => {
      let modified = { ...element };

      // 1. Apply max scale rules
      const maxScale = findLearnedMaxScale(element, preferences);
      if (maxScale && element.transforms.scale && element.transforms.scale > maxScale) {
        appliedRules.push({
          rule_type: 'max_scale',
          rule_name: getElementKey(element),
          applied_to: `${scene.name}/${element.type}`,
          original_value: element.transforms.scale,
          new_value: maxScale,
          reason: `Learned max safe scale from previous crop issue`
        });

        modified.transforms.scale = maxScale;
        preventedIssues.push(`Prevented crop in ${scene.name}/${element.type}`);
      }

      // 2. Enforce scale isolation
      if (preferences.validated_rules.enforce_scale_isolation) {
        const violation = detectScaleIsolationViolation(scene, element);
        if (violation) {
          appliedRules.push({
            rule_type: 'scale_isolation',
            rule_name: 'enforce_scale_isolation',
            applied_to: `${scene.name}/${element.type}`,
            original_value: element.transforms.scale,
            new_value: undefined,
            reason: 'Scale isolation - removed element-level scale to prevent compound scaling'
          });

          delete modified.transforms.scale;
          preventedIssues.push(`Prevented compound scaling in ${scene.name}/${element.type}`);
        }
      }

      // 3. Apply timing preferences
      const timingPref = preferences.validated_rules.timing_preferences;
      if (timingPref) {
        // Apply learned timing adjustments
        // (Would need timing properties on elements to apply)
      }

      return modified;
    });

    // Apply scene-level preferences
    let modifiedScene = { ...scene, elements: modifiedElements };

    // Apply preferred transitions
    if (preferences.validated_rules.preferred_transitions) {
      const nextScene = scenes[scenes.indexOf(scene) + 1];
      if (nextScene) {
        const transitionKey = `${scene.name}_to_${nextScene.name}`;
        const preferredTransition = preferences.validated_rules.preferred_transitions[transitionKey];

        if (preferredTransition && preferredTransition !== scene.exitType) {
          appliedRules.push({
            rule_type: 'transition',
            rule_name: transitionKey,
            applied_to: scene.name,
            original_value: scene.exitType,
            new_value: preferredTransition,
            reason: 'Learned transition preference from user feedback'
          });

          modifiedScene.exitType = preferredTransition;
        }
      }
    }

    return modifiedScene;
  });

  return {
    original: scenes,
    modified: modifiedScenes,
    appliedRules,
    prevented_issues: preventedIssues
  };
}

/**
 * Find learned max scale for element
 */
function findLearnedMaxScale(element: AnimationElement, preferences: UserPreferences): number | null {
  const rules = preferences.validated_rules.max_scales_by_element || {};
  const elementKey = getElementKey(element);

  return rules[elementKey] || null;
}

/**
 * Generate element key for rule matching
 */
function getElementKey(element: AnimationElement): string {
  return `${element.type}_${element.size.width}x${element.size.height}`;
}

/**
 * Detect scale isolation violation
 */
function detectScaleIsolationViolation(scene: AnimationScene, element: AnimationElement): boolean {
  // If scene has scale AND element has scale = violation
  const sceneHasScale = scene.elements.some(e => e !== element && e.transforms.scale);
  const elementHasScale = element.transforms.scale && element.transforms.scale !== 1.0;

  return sceneHasScale && elementHasScale;
}

/**
 * Suggest improvements based on learned patterns
 */
export function suggestImprovements(scenes: AnimationScene[]): string[] {
  const preferences = loadPreferences();
  const suggestions: string[] = [];

  // Check for known problematic patterns
  scenes.forEach(scene => {
    scene.elements.forEach(element => {
      // Check if element size matches a known crop issue
      const maxScale = findLearnedMaxScale(element, preferences);
      if (maxScale && (!element.transforms.scale || element.transforms.scale > maxScale)) {
        suggestions.push(
          `Element ${element.type} in ${scene.name}: Recommend max scale ${maxScale}x based on past crop issues`
        );
      }

      // Check for compound scaling risk
      if (element.transforms.scale && element.transforms.scale > 1.1) {
        const parentHasScale = scenes.some(s => s.name === scene.name && s.elements.some(e => e.transforms.scale));
        if (parentHasScale) {
          suggestions.push(
            `Element ${element.type} in ${scene.name}: Risk of compound scaling - consider removing element-level scale`
          );
        }
      }
    });
  });

  return suggestions;
}

/**
 * Get statistics on learning effectiveness
 */
export function getLearningStats(): {
  total_rules: number;
  rules_by_type: Record<string, number>;
  confidence_distribution: Record<string, number>;
  most_useful_rule: string;
} {
  const preferences = loadPreferences();

  const rulesByType: Record<string, number> = {};
  const confidenceDistribution: Record<string, number> = { high: 0, medium: 0, low: 0 };

  preferences.corrections.forEach(c => {
    rulesByType[c.issue_type] = (rulesByType[c.issue_type] || 0) + 1;
    confidenceDistribution[c.confidence]++;
  });

  return {
    total_rules: preferences.corrections.length,
    rules_by_type: rulesByType,
    confidence_distribution: confidenceDistribution,
    most_useful_rule: preferences.learning_metadata.most_reliable_rule
  };
}

/**
 * Usage Example:
 *
 * // 1. Generate animation
 * let animation = generateInitial(userRequest);
 *
 * // 2. Apply learned rules automatically
 * const result = applyLearnedRules(animation.scenes);
 * console.log(`Applied ${result.appliedRules.length} learned rules`);
 * console.log(`Prevented: ${result.prevented_issues.join(', ')}`);
 *
 * // 3. Use modified animation
 * animation.scenes = result.modified;
 *
 * // 4. Get suggestions
 * const suggestions = suggestImprovements(animation.scenes);
 * suggestions.forEach(s => console.log(`💡 ${s}`));
 */
