import { Config } from '@remotion/cli/config';

// Disable browser opening after renders to prevent xdg-open errors in Docker
try {
  Config.setOpenInBrowser(false);
} catch (e) {
  // Fallback for different Remotion versions
  console.error('[CONFIG] setOpenInBrowser not available:', e.message);
}

// Studio configuration - don't auto-open browser in Docker
try {
  if (Config.setStudioOpenInBrowser) {
    Config.setStudioOpenInBrowser(false);
  }
} catch (e) {
  console.error('[CONFIG] setStudioOpenInBrowser not available:', e.message);
}

// Ensure headless Chrome mode for Docker environment  
try {
  Config.setChromeMode('headless-shell');
} catch (e) {
  console.error('[CONFIG] setChromeMode not available:', e.message);
}

// Export configuration
export default {};