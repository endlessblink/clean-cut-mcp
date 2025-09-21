import { Config } from '@remotion/cli/config';

// Explicitly set the entry point to src directory (Remotion standard)
Config.setEntryPoint('/workspace/src/index.ts');

// Enable verbose logging for debugging
Config.setLevel('verbose');

// Ensure we're using the correct root directory
Config.setPublicDir('/workspace/public');