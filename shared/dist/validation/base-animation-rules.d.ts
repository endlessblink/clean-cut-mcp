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
export declare const BASE_ANIMATION_RULES: {
    typography: {
        default_font_stack: string;
        never_use_serif_unless_requested: boolean;
        min_font_sizes_1920x1080: {
            headline: number;
            body: number;
            caption: number;
        };
        letter_spacing: {
            headline: string;
            body: string;
        };
    };
    components: {
        must_use_no_overlap_scene: boolean;
        must_have_continuous_motion: boolean;
        must_use_unified_transforms: boolean;
        must_enforce_scale_isolation: boolean;
        forbidden_patterns: string[];
    };
    motion_blur: {
        velocity_threshold_px_per_frame: number;
        blur_formula: string;
        apply_during: string[];
        never_during: string[];
        automatic: boolean;
    };
    duration: {
        use_formula: boolean;
        frames_per_scene: number;
        frames_per_transition: number;
        never_arbitrary: boolean;
    };
    transitions: {
        every_scene_must_have_entry: boolean;
        must_have_movement_component: boolean;
        overlap_for_smooth_flow: number;
        no_dead_space: boolean;
    };
    scaling: {
        shot_level_only: boolean;
        validate_compound: boolean;
        max_safe_scale_formula: string;
        run_crop_detector: boolean;
    };
    validation: {
        must_pass_overlap_validator: boolean;
        must_pass_crop_detector: boolean;
        must_pass_scale_isolation: boolean;
        block_if_critical_violations: boolean;
    };
    spacing: {
        container_padding_min: number;
        section_margin_min: number;
        grid_gap_min: number;
    };
    colors: {
        tech_default: {
            primary: string;
            accent: string;
            text: string;
            grid: string;
        };
        contrast_ratio_min: number;
        validate_contrast: boolean;
    };
};
export interface AnimationSpec {
    font?: string;
    explicitlyRequestedSerif?: boolean;
    scenes?: Array<{
        component?: string;
        continuous_motion?: boolean;
        hasMotionBlur?: boolean;
        elements?: Array<{
            scale?: number;
            velocity?: number;
        }>;
    }>;
    duration?: number;
    duration_calculated_by_formula?: boolean;
}
export interface ValidationResult {
    valid: boolean;
    violations: string[];
}
/**
 * Enforce base rules (before learned rules)
 */
export declare function enforceBaseRules(spec: AnimationSpec): ValidationResult;
/**
 * This runs BEFORE learned rules
 * Ensures professional standards even with zero user corrections
 */ 
