/**
 * Test Template Selection Algorithm
 *
 * Verify scoring and matching logic works correctly
 */
import { analyzeUserRequest, selectTemplates, scoreTemplate } from './template-selector.js';
// Mock template data for testing
const mockTemplates = [
    {
        id: 'product-showcase',
        name: 'Product Showcase',
        category: 'business',
        description: 'Showcase your product features and benefits',
        keywords: ['product', 'showcase', 'feature', 'saas', 'app', 'demo', 'benefits'],
        defaultDuration: 450, // 15 seconds
        aspectRatio: '16:9',
        complexity: 'moderate',
        textHeavy: true,
        dataVisualization: false,
        characterCount: 'none',
        energy: 6,
        professional: 8,
        colorfulness: 7,
        platforms: ['youtube', 'linkedin', 'twitter'],
        requiredFields: ['productName', 'features'],
        optionalFields: ['pricing', 'ctaText', 'logo'],
        exampleData: {
            productName: 'MyApp',
            features: ['Fast Performance', 'Secure', 'Easy to Use']
        },
        componentPath: './patterns/templates/business/ProductShowcase.tsx',
        createdAt: '2025-10-05',
        version: '1.0.0',
        author: 'clean-cut-mcp'
    },
    {
        id: 'github-showcase',
        name: 'GitHub Profile Showcase',
        category: 'tech',
        description: 'Showcase your GitHub profile with stats and projects',
        keywords: ['github', 'profile', 'portfolio', 'developer', 'repos', 'contributions', 'opensource'],
        defaultDuration: 480, // 16 seconds
        aspectRatio: '16:9',
        complexity: 'moderate',
        textHeavy: false,
        dataVisualization: true,
        characterCount: 'none',
        energy: 5,
        professional: 7,
        colorfulness: 6,
        platforms: ['youtube', 'linkedin', 'twitter'],
        requiredFields: ['username'],
        optionalFields: ['topRepos', 'techStack'],
        exampleData: {
            username: 'endlessblink',
            topRepos: ['clean-cut-mcp', 'other-project']
        },
        componentPath: './patterns/templates/tech/GitHubShowcase.tsx',
        createdAt: '2025-10-05',
        version: '1.0.0',
        author: 'clean-cut-mcp'
    },
    {
        id: 'instagram-story',
        name: 'Instagram Story',
        category: 'social',
        description: 'Vertical story template with text overlays',
        keywords: ['instagram', 'story', 'social', 'vertical', 'mobile'],
        defaultDuration: 270, // 9 seconds
        aspectRatio: '9:16',
        complexity: 'simple',
        textHeavy: true,
        dataVisualization: false,
        characterCount: 'minimal',
        energy: 8,
        professional: 4,
        colorfulness: 9,
        platforms: ['instagram', 'tiktok'],
        requiredFields: ['headline', 'text'],
        optionalFields: ['image', 'stickers'],
        exampleData: {
            headline: 'New Post!',
            text: 'Check this out'
        },
        componentPath: './patterns/templates/social/InstagramStory.tsx',
        createdAt: '2025-10-05',
        version: '1.0.0',
        author: 'clean-cut-mcp'
    }
];
// Test cases
console.log('🧪 Testing Template Selection Algorithm\n');
// Test 1: GitHub profile request
console.log('TEST 1: "Create my GitHub profile showcase"');
const test1 = selectTemplates(mockTemplates, 'Create my GitHub profile showcase', 3);
console.log('Results ranked:');
test1.forEach((match, i) => {
    console.log(`  ${i + 1}. ${match.template.name}: ${(match.score * 100).toFixed(1)}% - ${match.reason}`);
});
console.log('Expected: GitHub Profile Showcase should be #1\n');
// Test 2: Product showcase
console.log('TEST 2: "Product showcase for my SaaS app"');
const test2 = selectTemplates(mockTemplates, 'Product showcase for my SaaS app features', 3);
console.log('Top match:', test2[0].template.name, `(${(test2[0].score * 100).toFixed(1)}%)`);
console.log('Reason:', test2[0].reason);
console.log('Expected: Product Showcase\n');
// Test 3: Instagram story
console.log('TEST 3: "Create vertical Instagram story"');
const test3 = selectTemplates(mockTemplates, 'Create vertical Instagram story announcement', 3);
console.log('Top match:', test3[0].template.name, `(${(test3[0].score * 100).toFixed(1)}%)`);
console.log('Reason:', test3[0].reason);
console.log('Expected: Instagram Story\n');
// Test 4: User request analysis
console.log('TEST 4: Request Analysis');
const request = analyzeUserRequest('Create energetic LinkedIn post with growth metrics');
console.log('Keywords:', request.keywords);
console.log('Platform:', request.platform);
console.log('Energy:', request.energy);
console.log('Professional:', request.professional);
console.log('Has Data:', request.hasData);
console.log('');
// Test 5: Scoring details
console.log('TEST 5: Detailed Scoring');
const productTemplate = mockTemplates[0];
const userReq = analyzeUserRequest('Show my product features');
const score = scoreTemplate(productTemplate, userReq);
console.log('Template:', productTemplate.name);
console.log('User request:', userReq.originalPrompt);
console.log('Score:', (score * 100).toFixed(1) + '%');
console.log('Keywords matched:', userReq.keywords.filter(k => productTemplate.keywords.includes(k)));
console.log('\n✅ All tests completed');
