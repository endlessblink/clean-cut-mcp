// Application constants
export const APP_CONFIG = {
  name: 'Clean Cut Video Generator',
  version: '1.0.0',
  description: 'AI-powered video generation platform',

  // Default animation settings
  defaults: {
    fps: 30,
    width: 1920,
    height: 1080,
    duration: 5, // seconds
    codec: 'h264'
  },

  // File paths
  paths: {
    animations: '/workspace/src/assets/animations',
    components: '/workspace/src/components',
    utils: '/workspace/src/utils',
    exports: '/workspace/out',
    assets: '/workspace/public'
  },

  // Validation settings
  validation: {
    maxCodeLength: 50000, // characters
    maxComponentNameLength: 50,
    allowedFileExtensions: ['.tsx', '.ts', '.jsx', '.js'],
    maxAssetSize: 50 * 1024 * 1024, // 50MB
    allowedAssetTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
  },

  // API limits
  limits: {
    maxAnimationsPerProject: 100,
    maxAssetsPerProject: 50,
    maxConcurrentRenders: 5,
    renderTimeout: 300000 // 5 minutes
  }
};

// Animation template categories
export const ANIMATION_CATEGORIES = [
  'basic',
  'text',
  'logo',
  'product',
  'corporate',
  'creative',
  'social-media',
  'presentation'
] as const;

// Common animation patterns
export const ANIMATION_PATTERNS = {
  fadeIn: {
    name: 'Fade In',
    description: 'Smooth opacity transition from 0 to 1',
    duration: 30 // frames
  },

  slideInLeft: {
    name: 'Slide In Left',
    description: 'Enter from left with smooth motion',
    duration: 45
  },

  slideInRight: {
    name: 'Slide In Right',
    description: 'Enter from right with smooth motion',
    duration: 45
  },

  slideInTop: {
    name: 'Slide In Top',
    description: 'Enter from top with smooth motion',
    duration: 45
  },

  slideInBottom: {
    name: 'Slide In Bottom',
    description: 'Enter from bottom with smooth motion',
    duration: 45
  },

  scaleIn: {
    name: 'Scale In',
    description: 'Scale from 0 to 1 with bounce',
    duration: 60
  },

  rotateIn: {
    name: 'Rotate In',
    description: 'Rotate 360 degrees while scaling',
    duration: 90
  },

  bounce: {
    name: 'Bounce',
    description: 'Bouncing animation with physics',
    duration: 120
  },

  pulse: {
    name: 'Pulse',
    description: 'Rhythmic scaling effect',
    duration: 60
  },

  typewriter: {
    name: 'Typewriter',
    description: 'Text appears character by character',
    duration: 180
  }
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  ANIMATION_NOT_FOUND: 'ANIMATION_NOT_FOUND',
  COMPONENT_EXISTS: 'COMPONENT_EXISTS',
  INVALID_CODE: 'INVALID_CODE',
  RENDER_FAILED: 'RENDER_FAILED',
  ASSET_TOO_LARGE: 'ASSET_TOO_LARGE',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  PROJECT_LIMIT_EXCEEDED: 'PROJECT_LIMIT_EXCEEDED',
  RENDER_TIMEOUT: 'RENDER_TIMEOUT',
  PERMISSION_DENIED: 'PERMISSION_DENIED'
} as const;