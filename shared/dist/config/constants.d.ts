export declare const APP_CONFIG: {
    name: string;
    version: string;
    description: string;
    defaults: {
        fps: number;
        width: number;
        height: number;
        duration: number;
        codec: string;
    };
    paths: {
        animations: string;
        components: string;
        utils: string;
        exports: string;
        assets: string;
    };
    validation: {
        maxCodeLength: number;
        maxComponentNameLength: number;
        allowedFileExtensions: string[];
        maxAssetSize: number;
        allowedAssetTypes: string[];
    };
    limits: {
        maxAnimationsPerProject: number;
        maxAssetsPerProject: number;
        maxConcurrentRenders: number;
        renderTimeout: number;
    };
};
export declare const ANIMATION_CATEGORIES: readonly ["basic", "text", "logo", "product", "corporate", "creative", "social-media", "presentation"];
export declare const ANIMATION_PATTERNS: {
    readonly fadeIn: {
        readonly name: "Fade In";
        readonly description: "Smooth opacity transition from 0 to 1";
        readonly duration: 30;
    };
    readonly slideInLeft: {
        readonly name: "Slide In Left";
        readonly description: "Enter from left with smooth motion";
        readonly duration: 45;
    };
    readonly slideInRight: {
        readonly name: "Slide In Right";
        readonly description: "Enter from right with smooth motion";
        readonly duration: 45;
    };
    readonly slideInTop: {
        readonly name: "Slide In Top";
        readonly description: "Enter from top with smooth motion";
        readonly duration: 45;
    };
    readonly slideInBottom: {
        readonly name: "Slide In Bottom";
        readonly description: "Enter from bottom with smooth motion";
        readonly duration: 45;
    };
    readonly scaleIn: {
        readonly name: "Scale In";
        readonly description: "Scale from 0 to 1 with bounce";
        readonly duration: 60;
    };
    readonly rotateIn: {
        readonly name: "Rotate In";
        readonly description: "Rotate 360 degrees while scaling";
        readonly duration: 90;
    };
    readonly bounce: {
        readonly name: "Bounce";
        readonly description: "Bouncing animation with physics";
        readonly duration: 120;
    };
    readonly pulse: {
        readonly name: "Pulse";
        readonly description: "Rhythmic scaling effect";
        readonly duration: 60;
    };
    readonly typewriter: {
        readonly name: "Typewriter";
        readonly description: "Text appears character by character";
        readonly duration: 180;
    };
};
export declare const ERROR_CODES: {
    readonly VALIDATION_FAILED: "VALIDATION_FAILED";
    readonly ANIMATION_NOT_FOUND: "ANIMATION_NOT_FOUND";
    readonly COMPONENT_EXISTS: "COMPONENT_EXISTS";
    readonly INVALID_CODE: "INVALID_CODE";
    readonly RENDER_FAILED: "RENDER_FAILED";
    readonly ASSET_TOO_LARGE: "ASSET_TOO_LARGE";
    readonly UNSUPPORTED_FORMAT: "UNSUPPORTED_FORMAT";
    readonly PROJECT_LIMIT_EXCEEDED: "PROJECT_LIMIT_EXCEEDED";
    readonly RENDER_TIMEOUT: "RENDER_TIMEOUT";
    readonly PERMISSION_DENIED: "PERMISSION_DENIED";
};
