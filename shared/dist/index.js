"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = exports.ANIMATION_PATTERNS = exports.ANIMATION_CATEGORIES = exports.APP_CONFIG = exports.codeGenerator = exports.CodeGenerator = exports.templateEngine = exports.TemplateEngine = exports.enforceBaseRules = exports.BASE_ANIMATION_RULES = void 0;
// Export validation logic
var base_animation_rules_1 = require("./validation/base-animation-rules");
Object.defineProperty(exports, "BASE_ANIMATION_RULES", { enumerable: true, get: function () { return base_animation_rules_1.BASE_ANIMATION_RULES; } });
Object.defineProperty(exports, "enforceBaseRules", { enumerable: true, get: function () { return base_animation_rules_1.enforceBaseRules; } });
// Export types (will add more as we extract them)
__exportStar(require("./types/animation"), exports);
__exportStar(require("./types/api"), exports);
// Export utilities (will add more as we extract them)
var template_engine_1 = require("./utils/template-engine");
Object.defineProperty(exports, "TemplateEngine", { enumerable: true, get: function () { return template_engine_1.TemplateEngine; } });
Object.defineProperty(exports, "templateEngine", { enumerable: true, get: function () { return template_engine_1.templateEngine; } });
var code_generator_1 = require("./utils/code-generator");
Object.defineProperty(exports, "CodeGenerator", { enumerable: true, get: function () { return code_generator_1.CodeGenerator; } });
Object.defineProperty(exports, "codeGenerator", { enumerable: true, get: function () { return code_generator_1.codeGenerator; } });
// Export configuration
var constants_1 = require("./config/constants");
Object.defineProperty(exports, "APP_CONFIG", { enumerable: true, get: function () { return constants_1.APP_CONFIG; } });
Object.defineProperty(exports, "ANIMATION_CATEGORIES", { enumerable: true, get: function () { return constants_1.ANIMATION_CATEGORIES; } });
Object.defineProperty(exports, "ANIMATION_PATTERNS", { enumerable: true, get: function () { return constants_1.ANIMATION_PATTERNS; } });
Object.defineProperty(exports, "ERROR_CODES", { enumerable: true, get: function () { return constants_1.ERROR_CODES; } });
