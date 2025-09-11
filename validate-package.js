#!/usr/bin/env node

/**
 * Clean-Cut-MCP Package Validation Script
 * Validates package structure before publishing to npm
 */

const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m', 
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log('green', `✅ ${description}: ${filePath}`);
    return true;
  } else {
    log('red', `❌ ${description} MISSING: ${filePath}`);
    return false;
  }
}

function checkDirectory(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log('green', `✅ ${description}: ${dirPath}`);
    return true;
  } else {
    log('red', `❌ ${description} MISSING: ${dirPath}`);
    return false;
  }
}

function validatePackageJson() {
  log('blue', '📦 Validating package.json...');
  
  const pkgPath = './package.json';
  if (!checkFile(pkgPath, 'Package file')) return false;
  
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    // Check required fields
    const requiredFields = ['name', 'version', 'description', 'main', 'scripts', 'files'];
    let valid = true;
    
    requiredFields.forEach(field => {
      if (pkg[field]) {
        log('green', `  ✅ ${field}: ${typeof pkg[field] === 'object' ? 'defined' : pkg[field]}`);
      } else {
        log('red', `  ❌ Missing required field: ${field}`);
        valid = false;
      }
    });
    
    // Check files array includes all necessary files
    const requiredFiles = [
      'mcp-server/',
      'setup-universal.js',
      'Dockerfile',
      'start.js'
    ];
    
    requiredFiles.forEach(file => {
      if (pkg.files && pkg.files.includes(file)) {
        log('green', `  ✅ Files array includes: ${file}`);
      } else {
        log('red', `  ❌ Files array missing: ${file}`);
        valid = false;
      }
    });
    
    return valid;
    
  } catch (error) {
    log('red', `❌ Invalid package.json: ${error.message}`);
    return false;
  }
}

function validateFileStructure() {
  log('blue', '📁 Validating file structure...');
  
  let valid = true;
  
  // Core files
  valid &= checkFile('./package.json', 'Package definition');
  valid &= checkFile('./setup-universal.js', 'Universal setup script');  
  valid &= checkFile('./Dockerfile', 'Docker container definition');
  valid &= checkFile('./start.js', 'Container startup script');
  valid &= checkFile('./README.md', 'Documentation');
  
  // MCP server
  valid &= checkDirectory('./mcp-server', 'MCP server directory');
  valid &= checkFile('./mcp-server/package.json', 'MCP server package');
  valid &= checkDirectory('./mcp-server/src', 'MCP server source');
  valid &= checkDirectory('./mcp-server/dist', 'MCP server build output');
  valid &= checkFile('./mcp-server/dist/http-mcp-server.js', 'HTTP MCP server');
  
  // Guidelines
  valid &= checkDirectory('./claude-dev-guidelines', 'Claude guidelines');
  
  return valid;
}

function validateScripts() {
  log('blue', '🔧 Validating npm scripts...');
  
  try {
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    let valid = true;
    
    // Check critical scripts exist
    const criticalScripts = ['postinstall', 'setup-universal', 'start'];
    
    criticalScripts.forEach(script => {
      if (pkg.scripts && pkg.scripts[script]) {
        log('green', `  ✅ Script exists: ${script}`);
      } else {
        log('red', `  ❌ Missing critical script: ${script}`);
        valid = false;
      }
    });
    
    // Validate script references
    if (pkg.scripts.start && !pkg.scripts.start.includes('http-mcp-server.js')) {
      log('red', `  ❌ Start script should reference http-mcp-server.js`);
      valid = false;
    } else if (pkg.scripts.start) {
      log('green', `  ✅ Start script correctly references MCP server`);
    }
    
    return valid;
    
  } catch (error) {
    log('red', `❌ Could not validate scripts: ${error.message}`);
    return false;
  }
}

function validateDockerFiles() {
  log('blue', '🐳 Validating Docker configuration...');
  
  let valid = true;
  
  // Check Dockerfile
  if (fs.existsSync('./Dockerfile')) {
    const dockerfile = fs.readFileSync('./Dockerfile', 'utf8');
    
    if (dockerfile.includes('FROM node:22')) {
      log('green', '  ✅ Dockerfile uses Node.js 22');
    } else {
      log('red', '  ❌ Dockerfile should use Node.js 22');
      valid = false;
    }
    
    if (dockerfile.includes('EXPOSE 6960') && dockerfile.includes('EXPOSE 6961')) {
      log('green', '  ✅ Dockerfile exposes required ports');
    } else {
      log('red', '  ❌ Dockerfile missing port exposure (6960, 6961)');
      valid = false;
    }
    
  } else {
    valid = false;
  }
  
  // Check start.js  
  if (fs.existsSync('./start.js')) {
    const startJs = fs.readFileSync('./start.js', 'utf8');
    
    if (startJs.includes('http-mcp-server.js')) {
      log('green', '  ✅ start.js references correct MCP server file');
    } else {
      log('red', '  ❌ start.js should reference http-mcp-server.js');
      valid = false;
    }
    
  } else {
    valid = false;
  }
  
  return valid;
}

async function main() {
  log('blue', '🔍 Clean-Cut-MCP Package Validation');
  log('blue', '===================================');
  
  let allValid = true;
  
  // Run all validations
  allValid &= validatePackageJson();
  allValid &= validateFileStructure();
  allValid &= validateScripts();
  allValid &= validateDockerFiles();
  
  console.log('');
  
  if (allValid) {
    log('green', '🎉 Package validation PASSED!');
    log('green', '📦 Ready for npm publishing');
    console.log('');
    log('blue', '📋 Next steps:');
    log('blue', '   1. Test on clean VM environment');
    log('blue', '   2. Run: npm publish --dry-run');
    log('blue', '   3. Run: npm publish');
  } else {
    log('red', '❌ Package validation FAILED!');
    log('red', '🔧 Fix the issues above before publishing');
    process.exit(1);
  }
}

main().catch(error => {
  log('red', `💥 Validation failed: ${error.message}`);
  process.exit(1);
});