// Export validation logic
export { BASE_ANIMATION_RULES, enforceBaseRules, type AnimationSpec, type ValidationResult } from './validation/base-animation-rules';

// Export types (will add more as we extract them)
export * from './types/animation';
export * from './types/api';

// Export utilities (will add more as we extract them)
export { TemplateEngine, templateEngine } from './utils/template-engine';
export { CodeGenerator, codeGenerator } from './utils/code-generator';

// Export configuration
export { APP_CONFIG, ANIMATION_CATEGORIES, ANIMATION_PATTERNS, ERROR_CODES } from './config/constants';