// cleanup-service.js - Always-running background service for real-time deletion cleanup
// Provides seamless deletion experience for external users
// Independent of MCP server - runs continuously during Studio usage

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const WORKSPACE = process.env.WORKSPACE_DIR || '/workspace';
const SRC_DIR = path.join(WORKSPACE, 'src');
const ANIMATIONS_DIR = path.join(SRC_DIR, 'assets', 'animations');
const ROOT_PATH = path.join(SRC_DIR, 'Root.tsx');
const POLL_INTERVAL = 5000; // 5 seconds - research-validated interval

let knownComponents = new Set();
let cleanupInterval = null;

// Logging function (stderr only to avoid pollution)
function log(level, message, data) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [CLEANUP-SERVICE] ${message}`);
  if (data) {
    console.error(JSON.stringify(data, null, 2));
  }
}

// Graceful shutdown handler
function gracefulShutdown(signal) {
  log('info', `Received ${signal}, shutting down gracefully...`);

  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    log('info', 'Cleanup interval cleared');
  }

  log('info', 'Background Cleanup Service shutdown complete');
  process.exit(0);
}

// Error handlers to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
  log('error', 'Unhandled Promise Rejection', { reason, promise: promise.toString() });
  // Don't exit - log and continue
});

process.on('uncaughtException', (error) => {
  log('error', 'Uncaught Exception', { error: error.message, stack: error.stack });
  // Don't exit - log and continue for cleanup service
});

// Signal handlers for graceful shutdown
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

async function fileExists(filePath) {
  try {
    await fsp.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function scanCurrentComponents() {
  try {
    // Scan the correct animations directory
    if (!(await fileExists(ANIMATIONS_DIR))) {
      log('warn', `Animations directory not found: ${ANIMATIONS_DIR}`);
      return new Set();
    }

    const files = await fsp.readdir(ANIMATIONS_DIR);
    const currentComponents = new Set();

    files
      .filter(file => file.endsWith('.tsx'))
      .forEach(file => {
        const componentName = path.basename(file, '.tsx');
        currentComponents.add(componentName);
      });

    return currentComponents;
  } catch (error) {
    log('error', 'Failed to scan components', { error: error.message });
    return new Set();
  }
}

async function cleanupOrphanedReferences(componentName) {
  try {
    if (!(await fileExists(ROOT_PATH))) {
      log('warn', 'Root.tsx not found - skipping cleanup');
      return;
    }

    let rootContent = await fsp.readFile(ROOT_PATH, 'utf-8');
    const originalContent = rootContent;

    // Verify component file doesn't exist before cleaning (use correct animations directory)
    const componentPath = path.join(ANIMATIONS_DIR, `${componentName}.tsx`);
    if (await fileExists(componentPath)) {
      log('info', `Component ${componentName} still exists - skipping cleanup`);
      return;
    }

    log('info', `Cleaning orphaned references for ${componentName}`);

    // Remove import statement
    rootContent = rootContent.replace(
      new RegExp(`import\\s*\\{\\s*${componentName}\\s*\\}\\s*from\\s*['"]\\.\\/${componentName}['"];?\\n?`, 'g'),
      ''
    );

    // Remove schema definition
    rootContent = rootContent.replace(
      new RegExp(`const\\s+${componentName}Schema\\s*=\\s*z\\.object\\([^}]+\\}\\);\\n?`, 'gs'),
      ''
    );

    // Remove composition entries (both self-closing and with schema)
    rootContent = rootContent
      .replace(new RegExp(`\\s*<Composition[^>]*id="${componentName}"[^>]*\\/?>\\n?`, 'gs'), '')
      .replace(new RegExp(`\\s*<Composition[^>]*id="${componentName}"[^>]*>.*?<\\/Composition>\\n?`, 'gs'), '');

    // Only write if changes were made
    if (rootContent !== originalContent) {
      await fsp.writeFile(ROOT_PATH, rootContent);
      log('info', `SUCCESS: Cleaned orphaned references for ${componentName} - Studio will refresh automatically`);
    } else {
      log('info', `No orphaned references found for ${componentName}`);
    }
  } catch (error) {
    log('error', `Failed to cleanup orphaned references for ${componentName}`, { error: error.message });
    // Don't throw - cleanup failure shouldn't crash the service
  }
}

async function performPollingCheck() {
  try {
    const currentComponents = await scanCurrentComponents();

    // Detect deletions by comparing with known components
    for (const componentName of knownComponents) {
      if (!currentComponents.has(componentName)) {
        log('info', `DELETION DETECTED: ${componentName}.tsx - triggering cleanup`);

        // Run cleanup with timeout protection
        try {
          await Promise.race([
            cleanupOrphanedReferences(componentName),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Cleanup timeout')), 10000))
          ]);
        } catch (cleanupError) {
          log('error', `Cleanup failed for ${componentName} (non-fatal)`, { error: cleanupError.message });
          // Continue with other components - don't crash the service
        }
      }
    }

    // Detect new components (for logging)
    for (const componentName of currentComponents) {
      if (!knownComponents.has(componentName)) {
        log('info', `NEW COMPONENT DETECTED: ${componentName}.tsx`);
      }
    }

    // Update known components
    knownComponents = currentComponents;
  } catch (error) {
    log('error', 'Polling check failed (non-fatal)', { error: error.message });
  }
}

async function initializeCleanupService() {
  log('info', 'Starting Background Cleanup Service for real-time deletion detection');
  log('info', 'Designed for seamless external user experience with Docker + Claude Desktop');

  // Initial scan to populate known components
  knownComponents = await scanCurrentComponents();
  log('info', `Initial scan found ${knownComponents.size} components from ${ANIMATIONS_DIR}`);

  // Start polling every 5 seconds (store interval ID for cleanup)
  cleanupInterval = setInterval(performPollingCheck, POLL_INTERVAL);
  log('info', `Polling started - checking for deletions every ${POLL_INTERVAL/1000} seconds`);

  log('info', 'Background Cleanup Service ready - external users can delete components seamlessly');
}

// Start the service
initializeCleanupService().catch((error) => {
  console.error('Failed to start Background Cleanup Service:', error);
  process.exit(1);
});