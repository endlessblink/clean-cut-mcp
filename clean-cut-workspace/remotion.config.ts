import { Config } from '@remotion/cli/config';

// Explicitly set the entry point to src directory (Remotion standard)
Config.setEntryPoint('/workspace/src/index.ts');

// Enable verbose logging for debugging
Config.setLevel('verbose');

// Ensure we're using the correct root directory
Config.setPublicDir('/workspace/public');

// DOCKER FIX: Enable webpack polling for Docker volume mount compatibility
// This fixes hot reload issues in containerized environments
Config.setWebpackPollingInMilliseconds(1000);

// STABILITY FIX: Override webpack config to prevent cache corruption crashes
Config.overrideWebpackConfig((config) => {
  // Disable webpack cache entirely to prevent ENOENT errors on rapid changes
  config.cache = false;

  // Add error resilience for file system issues
  config.watchOptions = {
    ...config.watchOptions,
    poll: 1000,
    aggregateTimeout: 300,
    ignored: /node_modules/
  };

  return config;
});