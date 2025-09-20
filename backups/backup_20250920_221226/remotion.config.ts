import { Config } from '@remotion/cli/config';

// Explicitly set the entry point to workspace root
Config.setEntryPoint('/workspace/index.ts');

// Enable verbose logging for debugging
Config.setLevel('verbose');

// Ensure we're using the correct root directory
Config.setPublicDir('/workspace/public');