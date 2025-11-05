/**
 * Rule Enforcement Engine
 *
 * PREVENTS repeating mistakes by ENFORCING learned rules during generation
 * This is the missing piece that makes learning actually work
 *
 * Problem: preference-applier can apply rules to data, but we generate code directly
 * Solution: Enforce rules as CHECKLIST that must be validated before finalizing
 */
import { loadPreferences } from './preference-learner';
/**
 * Enforce ALL rules: Base (guidelines) + Learned (user corrections)
 */
export function enforceAllRules(spec) {
    // 1. Enforce BASE RULES (from guidelines - always apply)
    const { enforceBaseRules } = require('./base-animation-rules');
    const baseCheck = enforceBaseRules(spec);
    // 2. Enforce LEARNED RULES (from user corrections)
    const learnedCheck = enforceLearnedRules(spec);
    // Combine violations
    const baseViolations = baseCheck.violations.map(v => ({
        rule: 'base_guideline',
        severity: 'critical',
        location: 'animation',
        issue: v,
        fix: 'See PRE-ANIMATION-CHECKLIST.md or guidelines'
    }));
    return {
        valid: baseCheck.valid && learnedCheck.valid,
        violations: [...baseViolations, ...learnedCheck.violations],
        warnings: learnedCheck.warnings,
        mustFix: [...baseCheck.violations, ...learnedCheck.mustFix],
        recommendations: learnedCheck.recommendations
    };
}
/**
 * Enforce LEARNED rules only (original function)
 */
export function enforceLearnedRules(spec) {
    const prefs = loadPreferences();
    const violations = [];
    const warnings = [];
    const mustFix = [];
    const recommendations = [];
    // RULE 1: No instant scene entries (learned from correction-008)
    spec.scenes.forEach((scene, index) => {
        if (!scene.entryTransition || scene.entryTransition === 'instant' || scene.entryTransition === 'none') {
            violations.push({
                rule: 'every_scene_must_have_entry_transition',
                severity: 'critical',
                location: scene.name,
                issue: 'Scene has no entry transition (will pop in)',
                fix: `Add entryTransition: 'slide-up' or 'wipe-left' or 'scale-in'`
            });
            mustFix.push(`${scene.name}: Add entry transition`);
        }
    });
    // RULE 2: Motion blur when velocity > 3px/frame (learned from correction-010)
    spec.scenes.forEach(scene => {
        scene.elements.forEach(element => {
            if (element.velocity && element.velocity > 3 && !scene.hasMotionBlur) {
                violations.push({
                    rule: 'motion_blur_required_for_fast_movement',
                    severity: 'critical',
                    location: `${scene.name}/${element.type}`,
                    issue: `Velocity ${element.velocity}px/frame requires motion blur`,
                    fix: `Add hasMotionBlur: true to scene OR apply calculateMotionBlur(velocity)`
                });
                mustFix.push(`${scene.name}: Add motion blur (velocity: ${element.velocity}px/frame)`);
            }
        });
    });
    // RULE 3: Scale isolation - no element-level scale (learned from correction-002)
    if (prefs.validated_rules.enforce_scale_isolation) {
        spec.scenes.forEach(scene => {
            scene.elements.forEach(element => {
                if (element.scale && element.scale !== 1.0) {
                    violations.push({
                        rule: 'scale_isolation',
                        severity: 'critical',
                        location: `${scene.name}/${element.type}`,
                        issue: `Element has scale ${element.scale}x - risks compound scaling`,
                        fix: `Remove element.scale, apply scale at scene/shot level only`
                    });
                    mustFix.push(`${scene.name}/${element.type}: Remove scale (use shot-level scale only)`);
                }
            });
        });
    }
    // RULE 4: Max safe scales (learned from corrections-001, 004, 005)
    const maxScales = prefs.validated_rules.max_scales_by_element || {};
    spec.scenes.forEach(scene => {
        scene.elements.forEach(element => {
            const key = `${element.type}_${element.width}x${element.height}`;
            const learnedMax = maxScales[key];
            if (learnedMax && element.scale && element.scale > learnedMax) {
                violations.push({
                    rule: 'max_safe_scale',
                    severity: 'critical',
                    location: `${scene.name}/${element.type}`,
                    issue: `Scale ${element.scale}x exceeds learned max ${learnedMax}x (will crop)`,
                    fix: `Reduce scale to ${learnedMax}x or smaller`
                });
                mustFix.push(`${scene.name}/${element.type}: Cap scale at ${learnedMax}x`);
            }
        });
    });
    // RULE 5: No dead space between scenes (learned from corrections-009)
    for (let i = 0; i < spec.scenes.length - 1; i++) {
        const current = spec.scenes[i];
        const next = spec.scenes[i + 1];
        const gap = next.startFrame - current.endFrame;
        if (gap > 0) {
            violations.push({
                rule: 'no_dead_space',
                severity: 'warning',
                location: `${current.name} → ${next.name}`,
                issue: `Gap of ${gap} frames between scenes (dead space)`,
                fix: `Start ${next.name} at frame ${current.endFrame} or earlier for transition overlap`
            });
            warnings.push(`${gap} frame gap between ${current.name} and ${next.name}`);
        }
    }
    // RULE 6: Replacement direction (learned from correction-009)
    for (let i = 0; i < spec.scenes.length - 1; i++) {
        const current = spec.scenes[i];
        const next = spec.scenes[i + 1];
        if (current.exitType === 'wipe-up' && next.entryTransition !== 'slide-up-from-bottom') {
            recommendations.push(`${next.name} should enter from bottom (slide-up) to replace ${current.name} exiting upward`);
        }
        if (current.exitType === 'wipe-left' && next.entryTransition !== 'wipe-right') {
            recommendations.push(`${next.name} should enter from right (wipe-right) to replace ${current.name} exiting left`);
        }
    }
    return {
        valid: violations.filter(v => v.severity === 'critical').length === 0,
        violations,
        warnings,
        mustFix,
        recommendations
    };
}
/**
 * Generate enforcement report (blocks generation if critical violations)
 */
export function generateEnforcementReport(result) {
    let report = '# Rule Enforcement Report\n\n';
    if (result.valid) {
        report += '✅ **ALL CRITICAL RULES PASSED**\n\n';
    }
    else {
        report += `❌ **${result.violations.filter(v => v.severity === 'critical').length} CRITICAL VIOLATIONS**\n\n`;
        report += '**MUST FIX BEFORE GENERATING:**\n';
        result.mustFix.forEach((fix, i) => {
            report += `${i + 1}. ${fix}\n`;
        });
        report += '\n';
    }
    // Show violations
    if (result.violations.length > 0) {
        report += '## Violations\n\n';
        result.violations.forEach((v, i) => {
            const icon = v.severity === 'critical' ? '❌' : '⚠️';
            report += `### ${icon} Violation ${i + 1}: ${v.rule}\n`;
            report += `**Location**: ${v.location}\n`;
            report += `**Issue**: ${v.issue}\n`;
            report += `**Fix**: ${v.fix}\n\n`;
        });
    }
    // Show warnings
    if (result.warnings.length > 0) {
        report += '## Warnings\n\n';
        result.warnings.forEach(w => report += `⚠️ ${w}\n`);
        report += '\n';
    }
    // Show recommendations
    if (result.recommendations.length > 0) {
        report += '## Recommendations\n\n';
        result.recommendations.forEach(r => report += `💡 ${r}\n`);
    }
    return report;
}
/**
 * Quick check: Can we generate or must we fix violations?
 */
export function canGenerate(spec) {
    const result = enforceLearnedRules(spec);
    return result.valid;
}
/**
 * Usage Example:
 *
 * // Before generating Remotion code, validate spec
 * const spec = {
 *   scenes: [
 *     {
 *       name: 'Scene1',
 *       type: 'hero',
 *       startFrame: 0,
 *       endFrame: 75,
 *       exitType: 'wipe-left',
 *       entryTransition: 'none',  // ❌ VIOLATION: No entry transition
 *       hasMotionBlur: false,
 *       elements: [{
 *         type: 'text',
 *         width: 800,
 *         height: 200,
 *         velocity: 200  // ❌ VIOLATION: Fast movement without blur
 *       }]
 *     }
 *   ],
 *   totalDuration: 705
 * };
 *
 * const enforcement = enforceLearnedRules(spec);
 *
 * if (!enforcement.valid) {
 *   console.error(generateEnforcementReport(enforcement));
 *   throw new Error('Fix violations before generating');
 * }
 *
 * // Safe to generate
 * const code = generateRemotionCode(spec);
 */
