/**
 * Professional Quality Presets for Portfolio Video Rendering
 * Optimized for different presentation scenarios and client work
 */
export const QUALITY_PRESETS = {
    // PREMIUM PORTFOLIO - Highest quality for client presentations
    portfolio_premium: {
        name: 'Portfolio Premium',
        description: 'Ultra-high quality for client presentations and portfolio showcase',
        codec: 'h264',
        bitrate: '25m', // 25 Mbps for excellent quality
        crf: 16, // Near-lossless quality
        pixelFormat: 'yuv420p',
        preset: 'slow', // Better compression
        resolution: { width: 1920, height: 1080 },
        frameRate: 30,
        audioBitrate: '320k',
        useCase: 'Client presentations, portfolio website, professional showcases',
        estimatedFileSize: '180MB/min'
    },
    // WEB PORTFOLIO - Optimized for online viewing
    portfolio_web: {
        name: 'Portfolio Web',
        description: 'High quality optimized for web streaming and online portfolios',
        codec: 'h264',
        bitrate: '12m', // 12 Mbps for web
        crf: 20, // Excellent quality for web
        pixelFormat: 'yuv420p',
        preset: 'medium', // Balance quality and speed
        resolution: { width: 1920, height: 1080 },
        frameRate: 30,
        audioBitrate: '256k',
        useCase: 'Website portfolio, Vimeo/YouTube uploads, online sharing',
        estimatedFileSize: '90MB/min'
    },
    // CINEMA - Ultra-high quality for cinema/broadcast
    portfolio_cinema: {
        name: 'Portfolio Cinema',
        description: 'Cinema-grade quality for professional film festivals and broadcast',
        codec: 'h264',
        bitrate: '40m', // 40 Mbps cinema quality
        crf: 14, // Very high quality
        pixelFormat: 'yuv420p',
        preset: 'veryslow', // Maximum compression efficiency
        resolution: { width: 3840, height: 2160 }, // 4K
        frameRate: 60, // Smooth motion
        audioBitrate: '320k',
        useCase: 'Film festivals, broadcast television, cinema presentations',
        estimatedFileSize: '300MB/min'
    },
    // SOCIAL MEDIA - Optimized for social platforms
    portfolio_social: {
        name: 'Portfolio Social',
        description: 'Optimized for Instagram, LinkedIn, Twitter social media posts',
        codec: 'h264',
        bitrate: '8m', // 8 Mbps for social platforms
        crf: 22, // Good quality for social media
        pixelFormat: 'yuv420p',
        preset: 'fast', // Quick rendering for iterations
        resolution: { width: 1080, height: 1080 }, // Square format
        frameRate: 30,
        audioBitrate: '192k',
        useCase: 'Instagram posts, LinkedIn content, social media portfolio',
        estimatedFileSize: '60MB/min'
    },
    // DEMO REEL - High quality for demo reels
    portfolio_demo: {
        name: 'Portfolio Demo Reel',
        description: 'Professional demo reel quality with smooth motion and clarity',
        codec: 'h264',
        bitrate: '18m', // 18 Mbps for demo reels
        crf: 18, // High quality for motion graphics
        pixelFormat: 'yuv420p',
        preset: 'slow',
        resolution: { width: 1920, height: 1080 },
        frameRate: 60, // Smooth for motion graphics
        audioBitrate: '320k',
        useCase: 'Demo reels, motion graphics showcases, animation portfolios',
        estimatedFileSize: '135MB/min'
    }
};
// DEFAULT QUALITY SETTINGS
export const DEFAULT_QUALITY = QUALITY_PRESETS.portfolio_premium;
// QUALITY SELECTION HELPERS
export function getQualityPreset(name) {
    const preset = QUALITY_PRESETS[name];
    if (!preset) {
        console.warn(`Quality preset "${name}" not found, using default portfolio_premium`);
        return DEFAULT_QUALITY;
    }
    return preset;
}
export function listQualityPresets() {
    return Object.entries(QUALITY_PRESETS).map(([key, preset]) => ({ key, preset }));
}
export function getQualityForUseCase(useCase) {
    switch (useCase) {
        case 'presentation':
            return QUALITY_PRESETS.portfolio_premium;
        case 'web':
            return QUALITY_PRESETS.portfolio_web;
        case 'cinema':
            return QUALITY_PRESETS.portfolio_cinema;
        case 'social':
            return QUALITY_PRESETS.portfolio_social;
        case 'demo':
            return QUALITY_PRESETS.portfolio_demo;
        default:
            return DEFAULT_QUALITY;
    }
}
// RENDER CONFIGURATION GENERATOR
export function generateRenderConfig(preset) {
    return {
        codec: preset.codec,
        bitrate: preset.bitrate,
        crf: preset.crf || 18,
        pixelFormat: preset.pixelFormat,
        preset: preset.preset,
        frameRate: preset.frameRate,
        audioCodec: 'aac',
        audioBitrate: preset.audioBitrate
    };
}
// PROFESSIONAL STANDARDS COMPLIANCE
export const PROFESSIONAL_STANDARDS = {
    // Broadcasting standards
    broadcast: {
        minBitrate: '20m',
        maxBitrate: '50m',
        minFrameRate: 30,
        maxFrameRate: 60,
        supportedCodecs: ['h264', 'h265'],
        colorSpace: 'bt709'
    },
    // Web streaming standards
    webStreaming: {
        minBitrate: '5m',
        maxBitrate: '15m',
        minFrameRate: 24,
        maxFrameRate: 30,
        supportedCodecs: ['h264'],
        colorSpace: 'bt709'
    },
    // Social media standards
    socialMedia: {
        minBitrate: '3m',
        maxBitrate: '10m',
        minFrameRate: 24,
        maxFrameRate: 30,
        supportedCodecs: ['h264'],
        colorSpace: 'bt709'
    }
};
