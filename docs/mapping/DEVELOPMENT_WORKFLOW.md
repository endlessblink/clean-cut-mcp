# Development Workflow Mapping

## 🚀 Development Overview

Clean-Cut-MCP follows a containerized development workflow with hot reload capabilities and comprehensive validation. The system is designed for rapid iteration while maintaining professional quality standards.

## 🏗️ Development Environment

### Prerequisites
```bash
# Required software
- Docker & Docker Compose
- Node.js 18+
- Git
- Claude Desktop (for MCP integration)
```

### Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd clean-cut-mcp

# Build and start containers
docker-compose build
docker-compose up -d

# Verify installation
docker logs clean-cut-mcp -f
```

## 📁 Project Structure for Development

```
clean-cut-mcp/
├── Development Workspace
│   ├── mcp-server/          # Server code (TypeScript)
│   ├── clean-cut-workspace/ # Animation workspace
│   └── docs/mapping/        # Documentation (this file)
├── Docker Configuration
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── start.js
└── Configuration
    ├── CLAUDE.md
    └── templates/
```

## 🔄 Development Workflow

### 1. Making Changes to MCP Server

#### Code Changes
```bash
# Navigate to server directory
cd mcp-server

# Make TypeScript changes
# Edit files in src/ directory

# Build the server
npm run build

# Deploy to running container (quick iteration)
docker cp dist/. clean-cut-mcp:/app/mcp-server/dist/

# Restart Claude Desktop to load changes
./kill-claude-clean.ps1  # Windows
# OR kill Claude Desktop process
```

#### Docker Changes
```bash
# For Dockerfile or dependency changes
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify container is running new code
docker exec clean-cut-mcp node -e "console.log('Container updated')"
```

### 2. Animation Development

#### Creating Animations
```bash
# Method 1: Via Claude Desktop (Recommended)
# Use create_animation tool in Claude

# Method 2: Manual Creation
cd clean-cut-workspace/src/assets/animations/
touch NewAnimation.tsx
# Edit file following component standards
```

#### Animation Development Standards
```typescript
// Standard animation component structure
import React from 'react';
import { NoOverlapScene } from '../components/NoOverlapScene';

export const NewAnimation: React.FC<AnimationSchema> = ({
  accentColor,
  backgroundColor,
  primaryText,
  secondaryText
}) => {
  return (
    <NoOverlapScene startFrame={0} endFrame={240} exitType="fade">
      <div style={{
        fontFamily: 'Inter',
        fontSize: 48,
        color: accentColor,
        padding: 40
      }}>
        {primaryText}
      </div>
    </NoOverlapScene>
  );
};
```

### 3. Testing Workflow

#### MCP Server Testing
```bash
# Test MCP server locally (HTTP mode)
cd mcp-server
npm run dev

# Test validation system
node test-validation.js

# Test Root.tsx sync
docker exec clean-cut-mcp node -e "require('/app/mcp-server/dist/root-sync.js').syncRootTsx()"
```

#### Animation Testing
```bash
# Access Remotion Studio
# Navigate to http://localhost:6970

# Check animations load correctly
docker exec clean-cut-mcp ls /workspace/src/assets/animations/ | wc -l

# Test Root.tsx contains all animations
docker exec clean-cut-mcp cat /workspace/src/Root.tsx | grep -c "import.*Animation"
```

#### Integration Testing
```bash
# Test complete workflow via Claude Desktop
1. Start Claude Desktop
2. Use create_animation tool
3. Verify animation appears in Studio
4. Test validation feedback
5. Check learned preferences applied
```

## 🛠️ Common Development Tasks

### Adding New Validation Rules
```typescript
// 1. Edit base-animation-rules.ts
const newRule = {
  name: 'newRule',
  pattern: /pattern-to-match/,
  violation: '❌ NEW RULE: Description',
  fix: 'Suggested fix'
};

// 2. Add to validation function
function validateNewRule(code: string): Violation[] {
  const violations = [];
  // Implementation
  return violations;
}

// 3. Update clean-stdio-server.ts
// Add rule to handleCreateAnimation (lines 1034-1120)
```

### Adding New MCP Tools
```typescript
// 1. Define tool in clean-stdio-server.ts
const newTool = {
  name: 'new_tool',
  description: 'Tool description',
  inputSchema: { /* schema */ }
};

// 2. Implement handler
async function handleNewTool(args: any) {
  // Implementation
  return { success: true, result };
}

// 3. Register tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Add case for new_tool
});
```

### Creating Animation Templates
```typescript
// 1. Create template in template-registry.ts
const newTemplate: AnimationTemplate = {
  name: 'new-template',
  description: 'Template description',
  generate: (params: TemplateParams) => {
    return `// Generated animation code`;
  }
};

// 2. Register template
templates.set('new-template', newTemplate);
```

## 🐛 Debugging Common Issues

### Validation Not Working
```bash
# Check container is rebuilt
docker ps | grep clean-cut-mcp

# Verify code deployed
docker exec clean-cut-mcp ls -la /app/mcp-server/dist/

# Check Claude Desktop restarted
ps aux | grep -i claude

# Test validation manually
docker exec clean-cut-mcp node -e "
const validator = require('/app/mcp-server/dist/animation-validator');
console.log(validator.validateAnimationCode('test code', 'Test'));
"
```

### Animation Files Not Appearing
```bash
# Check file paths
docker exec clean-cut-mcp ls -la /workspace/src/assets/animations/

# Test Root.tsx sync
docker exec clean-cut-mcp node -e "require('/app/mcp-server/dist/root-sync.js').syncRootTsx()"

# Check Root.tsx content
docker exec clean-cut-mcp cat /workspace/src/Root.tsx

# Restart Remotion development server
docker restart clean-cut-mcp
```

### Bind Mount Issues
```bash
# Check bind mounts are working
docker exec clean-cut-mcp ls -la /workspace/

# Verify directories exist
docker exec clean-cut-mcp mkdir -p /workspace/src/components
docker exec clean-cut-mcp mkdir -p /workspace/src/utils
docker exec clean-cut-mcp mkdir -p /workspace/src/assets/animations

# Check permissions
docker exec clean-cut-mcp ls -la /workspace/src/
```

### Hot Reload Not Working
```bash
# Check polling is enabled
docker exec clean-cut-mcp env | grep CHOKIDAR

# Restart development server
docker restart clean-cut-mcp

# Check webpack config
docker exec clean-cut-mdp cat /workspace/remotion.config.ts
```

## 📊 Performance Monitoring

### Container Performance
```bash
# Check container resource usage
docker stats clean-cut-mcp

# Monitor logs
docker logs clean-cut-mcp -f --tail 100

# Check file system usage
docker exec clean-cut-mcp df -h
```

### MCP Server Performance
```bash
# Test response time
time curl -X POST http://localhost:6971/api/test

# Monitor memory usage
docker exec clean-cut-mcp node -e "console.log(process.memoryUsage())"

# Check validation performance
docker exec clean-cut-mcp node -e "
const start = Date.now();
const validator = require('/app/mcp-server/dist/animation-validator');
validator.validateAnimationCode(largeCode, 'Test');
console.log('Validation time:', Date.now() - start, 'ms');
"
```

## 🧪 Testing Strategy

### Unit Tests
```bash
# Run validation tests
cd mcp-server
npm test

# Test individual rules
node -e "
const ruleTest = require('./test/rules.test');
ruleTest.testFontSizeRule();
"
```

### Integration Tests
```bash
# Test complete animation creation workflow
docker exec clean-cut-mcp node -e "
const test = require('./test/integration.test');
test.testCompleteWorkflow();
"

# Test learning system
docker exec clean-cut-mcp node -e "
const learningTest = require('./test/learning.test');
learningTest.testUserCorrectionFlow();
"
```

### End-to-End Tests
```bash
# Test via Claude Desktop
1. Create animation with violations
2. Verify validation feedback
3. Apply suggested fixes
4. Verify animation created successfully
5. Check animation appears in Studio
6. Test learned preferences applied
```

## 📝 Documentation Updates

### Code Documentation
```typescript
/**
 * Validates animation code against professional standards
 * @param code - Animation code to validate
 * @param componentName - Name of the component
 * @returns Validation result with violations and suggestions
 */
function validateAnimationCode(code: string, componentName: string): ValidationResult {
  // Implementation
}
```

### README Updates
```markdown
## New Feature Added

### Description
Brief description of the new feature

### Usage
How to use the new feature

### Example
\`\`\`typescript
// Example code
\`\`\`
```

## 🚀 Deployment Workflow

### Development to Production
```bash
# 1. Test locally
npm run test && npm run build

# 2. Create feature branch
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 3. Create pull request
# Review and merge changes

# 4. Deploy to production
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 5. Verify deployment
docker logs clean-cut-mcp -f
```

### Version Management
```bash
# Update version in package.json
npm version patch  # or minor/major

# Tag release
git tag v1.0.1
git push origin v1.0.1

# Update Docker image
docker-compose build
docker-compose up -d
```

## 📋 Development Checklist

### Before Committing
- [ ] Code follows TypeScript standards
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No hardcoded values
- [ ] Validation rules tested
- [ ] Container rebuilds successfully

### Before Release
- [ ] All tests pass in CI
- [ ] Documentation is complete
- [ ] Performance acceptable
- [ ] Security review completed
- [ ] User acceptance tested
- [ ] Rollback plan prepared

This workflow ensures consistent, high-quality development while maintaining the professional standards required for broadcast video production.