"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationController = void 0;
const animationService_1 = require("../services/animationService");
const shared_1 = require("@clean-cut/shared");
class AnimationController {
    constructor() {
        // MCP equivalent: create_animation
        this.createAnimation = async (req, res) => {
            try {
                const { code, componentName, duration, validate = true } = req.body;
                // Validate code if requested
                let validation = { valid: true, violations: [], warnings: [] };
                if (validate) {
                    validation = shared_1.codeGenerator.validateCode(code);
                    if (!validation.valid) {
                        return res.status(400).json({
                            success: false,
                            error: 'VALIDATION_FAILED',
                            message: 'Animation code failed validation',
                            data: validation
                        });
                    }
                }
                // Create animation file
                const result = await this.animationService.createAnimation({
                    code,
                    componentName,
                    duration: duration || 5
                });
                res.json({
                    success: true,
                    data: result,
                    message: `Animation '${componentName}' created successfully`
                });
            }
            catch (error) {
                console.error('Error creating animation:', error);
                res.status(500).json({
                    success: false,
                    error: 'CREATE_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        // MCP equivalent: create_custom_animation
        this.createCustomAnimation = async (req, res) => {
            try {
                const { description, duration, componentName, props } = req.body;
                if (!description) {
                    return res.status(400).json({
                        success: false,
                        error: 'MISSING_DESCRIPTION',
                        message: 'Description is required for custom animation'
                    });
                }
                // Generate code from description
                const generatedCode = shared_1.codeGenerator.generateFromDescription(description, {
                    duration,
                    componentName,
                    props
                });
                // Validate generated code
                const validation = shared_1.codeGenerator.validateCode(generatedCode);
                if (!validation.valid) {
                    return res.status(400).json({
                        success: false,
                        error: 'GENERATION_FAILED',
                        message: 'Generated code failed validation',
                        data: { generatedCode, validation }
                    });
                }
                // Create animation
                const finalComponentName = componentName || this.generateComponentName(description);
                const result = await this.animationService.createAnimation({
                    code: generatedCode,
                    componentName: finalComponentName,
                    duration: duration || 5
                });
                res.json({
                    success: true,
                    data: {
                        ...result,
                        description,
                        generatedCode,
                        validation
                    },
                    message: `Custom animation '${finalComponentName}' created from description`
                });
            }
            catch (error) {
                console.error('Error creating custom animation:', error);
                res.status(500).json({
                    success: false,
                    error: 'CUSTOM_CREATE_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        // MCP equivalent: list_animations
        this.listAnimations = async (req, res) => {
            try {
                const animations = await this.animationService.listAnimations();
                res.json({
                    success: true,
                    data: animations,
                    message: `Found ${animations.length} animations`
                });
            }
            catch (error) {
                console.error('Error listing animations:', error);
                res.status(500).json({
                    success: false,
                    error: 'LIST_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        // MCP equivalent: read_animation_file
        this.readAnimation = async (req, res) => {
            try {
                const { name } = req.params;
                if (!name) {
                    return res.status(400).json({
                        success: false,
                        error: 'MISSING_NAME',
                        message: 'Animation name is required'
                    });
                }
                const animation = await this.animationService.readAnimation(name);
                if (!animation) {
                    return res.status(404).json({
                        success: false,
                        error: 'ANIMATION_NOT_FOUND',
                        message: `Animation '${name}' not found`
                    });
                }
                res.json({
                    success: true,
                    data: animation,
                    message: `Animation '${name}' retrieved successfully`
                });
            }
            catch (error) {
                console.error('Error reading animation:', error);
                res.status(500).json({
                    success: false,
                    error: 'READ_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        // MCP equivalent: edit_animation
        this.editAnimation = async (req, res) => {
            try {
                const { name } = req.params;
                const { changes, preview = false } = req.body;
                if (!name) {
                    return res.status(400).json({
                        success: false,
                        error: 'MISSING_NAME',
                        message: 'Animation name is required'
                    });
                }
                const result = await this.animationService.editAnimation(name, changes, preview);
                res.json({
                    success: true,
                    data: result,
                    message: `Animation '${name}' updated successfully`
                });
            }
            catch (error) {
                console.error('Error editing animation:', error);
                res.status(500).json({
                    success: false,
                    error: 'EDIT_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        // MCP equivalent: delete_component
        this.deleteAnimation = async (req, res) => {
            try {
                const { name } = req.params;
                if (!name) {
                    return res.status(400).json({
                        success: false,
                        error: 'MISSING_NAME',
                        message: 'Animation name is required'
                    });
                }
                await this.animationService.deleteAnimation(name);
                res.json({
                    success: true,
                    data: { deleted: name },
                    message: `Animation '${name}' deleted successfully`
                });
            }
            catch (error) {
                console.error('Error deleting animation:', error);
                res.status(500).json({
                    success: false,
                    error: 'DELETE_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        // MCP equivalent: format_code
        this.formatCode = async (req, res) => {
            try {
                const { code } = req.body;
                if (!code) {
                    return res.status(400).json({
                        success: false,
                        error: 'MISSING_CODE',
                        message: 'Code is required for formatting'
                    });
                }
                const formattedCode = await this.animationService.formatCode(code);
                res.json({
                    success: true,
                    data: { formattedCode },
                    message: 'Code formatted successfully'
                });
            }
            catch (error) {
                console.error('Error formatting code:', error);
                res.status(500).json({
                    success: false,
                    error: 'FORMAT_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        // MCP equivalent: manage_props
        this.validateProps = async (req, res) => {
            try {
                const { componentName, props } = req.body;
                const validation = await this.animationService.validateProps(componentName, props);
                res.json({
                    success: true,
                    data: validation,
                    message: `Props validation completed for '${componentName}'`
                });
            }
            catch (error) {
                console.error('Error validating props:', error);
                res.status(500).json({
                    success: false,
                    error: 'VALIDATION_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        // MCP equivalent: get_animation_guidelines
        this.getAnimationGuidelines = async (req, res) => {
            try {
                const guidelines = await this.animationService.getAnimationGuidelines();
                res.json({
                    success: true,
                    data: guidelines,
                    message: 'Animation guidelines retrieved successfully'
                });
            }
            catch (error) {
                console.error('Error getting guidelines:', error);
                res.status(500).json({
                    success: false,
                    error: 'GUIDELINES_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.animationService = new animationService_1.AnimationService();
    }
    // Helper method to generate component names from descriptions
    generateComponentName(description) {
        const words = description
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .slice(0, 3)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1));
        return words.join('') + 'Animation';
    }
}
exports.AnimationController = AnimationController;
