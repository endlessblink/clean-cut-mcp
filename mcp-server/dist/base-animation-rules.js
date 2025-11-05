/**
 * Base Animation Rules - ALWAYS Enforced
 *
 * These are NOT learned - they are professional standards from guidelines
 * Extracted from:
 * - PRE-ANIMATION-CHECKLIST.md
 * - REMOTION_ANIMATION_RULES.md
 * - PROJECT_CONFIG.md
 * - Research-validated constants
 *
 * These rules apply to EVERY animation, regardless of user corrections
 */
export const BASE_ANIMATION_RULES = {
    // Typography (from guidelines + broadcast standards)
    typography: {
        default_font_stack: "'-apple-system', 'BlinkMacOSFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        never_use_serif_unless_requested: true,
        min_font_sizes_1920x1080: {
            headline: 48, // Broadcast standard
            body: 24,
            caption: 18
        },
        letter_spacing: {
            headline: '-0.02em', // Tight for impact
            body: '0em'
        }
    },
    // Structure (from PRE-ANIMATION-CHECKLIST.md)
    components: {
        must_use_no_overlap_scene: true, // Step 8: MANDATORY
        must_have_continuous_motion: true, // Step 9: MANDATORY
        must_use_unified_transforms: true, // Step 10: MANDATORY
        must_enforce_scale_isolation: true, // Step 11: MANDATORY
        forbidden_patterns: [
            'opacity-only-transitions', // Must have movement
            'element-level-scale', // Scale at shot level only
            'static-holds' // Continuous motion required
        ]
    },
    // Motion Blur (from research)
    motion_blur: {
        velocity_threshold_px_per_frame: 3,
        blur_formula: 'min(velocity * 0.1, 10)',
        apply_during: ['entry', 'exit'],
        never_during: ['hold'],
        automatic: true // Auto-apply, don't ask
    },
    // Duration (from research + calculator)
    duration: {
        use_formula: true, // (scenes × 75) + (transitions × 15)
        frames_per_scene: 75, // 2.5 seconds (research-validated)
        frames_per_transition: 15, // 0.5 seconds (professional standard)
        never_arbitrary: true // Don't use random 240 frames
    },
    // Transitions (from REMOTION_ANIMATION_RULES.md)
    transitions: {
        every_scene_must_have_entry: true, // No instant pops
        must_have_movement_component: true, // translateX/Y or scale, never opacity-only
        overlap_for_smooth_flow: 15, // frames
        no_dead_space: true
    },
    // Scale (from scale-isolation discoveries)
    scaling: {
        shot_level_only: true, // NEVER at element level
        validate_compound: true, // Detect parent × child
        max_safe_scale_formula: 'min(viewport/element) * 0.95',
        run_crop_detector: true
    },
    // Validation (from our validators)
    validation: {
        must_pass_overlap_validator: true,
        must_pass_crop_detector: true,
        must_pass_scale_isolation: true,
        block_if_critical_violations: true
    },
    // Spacing (from PROJECT_CONFIG.md)
    spacing: {
        container_padding_min: 80, // pixels
        section_margin_min: 60, // pixels
        grid_gap_min: 25 // pixels
    },
    // Colors (from validated palettes)
    colors: {
        tech_default: {
            primary: '#0a0a0a',
            accent: '#10b981',
            text: '#f0f6fc',
            grid: '#3a3a3a'
        },
        contrast_ratio_min: 7.0, // WCAG AAA
        validate_contrast: true
    }
};
/**
 * Enforce base rules (before learned rules)
 */
export function enforceBaseRules(spec) {
    const violations = [];
    // Check font
    if (!spec.font || spec.font.includes('serif')) {
        if (!spec.explicitlyRequestedSerif) {
            violations.push('FONT: Using serif font without explicit request. Use sans-serif by default.');
        }
    }
    // Check NoOverlapScene usage
    const usesNoOverlap = spec.scenes?.every(s => s.component === 'NoOverlapScene');
    if (!usesNoOverlap) {
        violations.push('STRUCTURE: Must use NoOverlapScene component for all scenes (PRE-ANIMATION-CHECKLIST Step 8)');
    }
    // Check static holds
    const hasStaticHolds = spec.scenes?.some(s => !s.continuous_motion);
    if (hasStaticHolds) {
        violations.push('MOTION: Scenes have static holds. Continuous motion required (PRE-ANIMATION-CHECKLIST Step 9)');
    }
    // Check element-level scaling
    const hasElementScale = spec.scenes?.some(s => s.elements?.some(e => e.scale && e.scale !== 1.0));
    if (hasElementScale) {
        violations.push('SCALE: Element-level scaling detected. Scale at shot level only (PRE-ANIMATION-CHECKLIST Step 11)');
    }
    // Check motion blur on fast movement
    const missingBlur = spec.scenes?.some(s => s.elements?.some(e => e.velocity > 3 && !s.hasMotionBlur));
    if (missingBlur) {
        violations.push('MOTION BLUR: Fast movement without blur. Apply when velocity > 3px/frame (Research-validated)');
    }
    // Check arbitrary duration
    if (spec.duration && !spec.duration_calculated_by_formula) {
        violations.push('DURATION: Using arbitrary duration. Must use calculateSceneBasedDuration() formula');
    }
    return {
        valid: violations.length === 0,
        violations
    };
}
/**
 * This runs BEFORE learned rules
 * Ensures professional standards even with zero user corrections
 */
