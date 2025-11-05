import { Request, Response } from 'express';
import { AnimationService } from '../services/animationService';
import { ApiResponse, CreateAnimationRequest, EditAnimationRequest } from '@clean-cut/shared';
import { codeGenerator } from '@clean-cut/shared';

export class AnimationController {
  private animationService: AnimationService;

  constructor() {
    this.animationService = new AnimationService();
  }

  // MCP equivalent: create_animation
  createAnimation = async (req: Request, res: Response) => {
    try {
      const { code, componentName, duration, validate = true } = req.body as CreateAnimationRequest;

      // Validate code if requested
      let validation = { valid: true, violations: [], warnings: [] };
      if (validate) {
        validation = codeGenerator.validateCode(code);
        if (!validation.valid) {
          return res.status(400).json({
            success: false,
            error: 'VALIDATION_FAILED',
            message: 'Animation code failed validation',
            data: validation
          } as ApiResponse);
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
      } as ApiResponse);

    } catch (error) {
      console.error('Error creating animation:', error);
      res.status(500).json({
        success: false,
        error: 'CREATE_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  // MCP equivalent: create_custom_animation
  createCustomAnimation = async (req: Request, res: Response) => {
    try {
      const { description, duration, componentName, props } = req.body;

      if (!description) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_DESCRIPTION',
          message: 'Description is required for custom animation'
        } as ApiResponse);
      }

      // Generate code from description
      const generatedCode = codeGenerator.generateFromDescription(description, {
        duration,
        componentName,
        props
      });

      // Validate generated code
      const validation = codeGenerator.validateCode(generatedCode);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'GENERATION_FAILED',
          message: 'Generated code failed validation',
          data: { generatedCode, validation }
        } as ApiResponse);
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
      } as ApiResponse);

    } catch (error) {
      console.error('Error creating custom animation:', error);
      res.status(500).json({
        success: false,
        error: 'CUSTOM_CREATE_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  // MCP equivalent: list_animations
  listAnimations = async (req: Request, res: Response) => {
    try {
      const animations = await this.animationService.listAnimations();

      res.json({
        success: true,
        data: animations,
        message: `Found ${animations.length} animations`
      } as ApiResponse);

    } catch (error) {
      console.error('Error listing animations:', error);
      res.status(500).json({
        success: false,
        error: 'LIST_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  // MCP equivalent: read_animation_file
  readAnimation = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_NAME',
          message: 'Animation name is required'
        } as ApiResponse);
      }

      const animation = await this.animationService.readAnimation(name);

      if (!animation) {
        return res.status(404).json({
          success: false,
          error: 'ANIMATION_NOT_FOUND',
          message: `Animation '${name}' not found`
        } as ApiResponse);
      }

      res.json({
        success: true,
        data: animation,
        message: `Animation '${name}' retrieved successfully`
      } as ApiResponse);

    } catch (error) {
      console.error('Error reading animation:', error);
      res.status(500).json({
        success: false,
        error: 'READ_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  // MCP equivalent: edit_animation
  editAnimation = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const { changes, preview = false } = req.body as EditAnimationRequest;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_NAME',
          message: 'Animation name is required'
        } as ApiResponse);
      }

      const result = await this.animationService.editAnimation(name, changes, preview);

      res.json({
        success: true,
        data: result,
        message: `Animation '${name}' updated successfully`
      } as ApiResponse);

    } catch (error) {
      console.error('Error editing animation:', error);
      res.status(500).json({
        success: false,
        error: 'EDIT_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  // MCP equivalent: delete_component
  deleteAnimation = async (req: Request, res: Response) => {
    try {
      const { name } = req.params;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_NAME',
          message: 'Animation name is required'
        } as ApiResponse);
      }

      await this.animationService.deleteAnimation(name);

      res.json({
        success: true,
        data: { deleted: name },
        message: `Animation '${name}' deleted successfully`
      } as ApiResponse);

    } catch (error) {
      console.error('Error deleting animation:', error);
      res.status(500).json({
        success: false,
        error: 'DELETE_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  // MCP equivalent: format_code
  formatCode = async (req: Request, res: Response) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_CODE',
          message: 'Code is required for formatting'
        } as ApiResponse);
      }

      const formattedCode = await this.animationService.formatCode(code);

      res.json({
        success: true,
        data: { formattedCode },
        message: 'Code formatted successfully'
      } as ApiResponse);

    } catch (error) {
      console.error('Error formatting code:', error);
      res.status(500).json({
        success: false,
        error: 'FORMAT_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  // MCP equivalent: manage_props
  validateProps = async (req: Request, res: Response) => {
    try {
      const { componentName, props } = req.body;

      const validation = await this.animationService.validateProps(componentName, props);

      res.json({
        success: true,
        data: validation,
        message: `Props validation completed for '${componentName}'`
      } as ApiResponse);

    } catch (error) {
      console.error('Error validating props:', error);
      res.status(500).json({
        success: false,
        error: 'VALIDATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  // MCP equivalent: get_animation_guidelines
  getAnimationGuidelines = async (req: Request, res: Response) => {
    try {
      const guidelines = await this.animationService.getAnimationGuidelines();

      res.json({
        success: true,
        data: guidelines,
        message: 'Animation guidelines retrieved successfully'
      } as ApiResponse);

    } catch (error) {
      console.error('Error getting guidelines:', error);
      res.status(500).json({
        success: false,
        error: 'GUIDELINES_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  // Helper method to generate component names from descriptions
  private generateComponentName(description: string): string {
    const words = description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .slice(0, 3)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1));

    return words.join('') + 'Animation';
  }
}