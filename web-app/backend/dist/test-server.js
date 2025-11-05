"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 6972;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// Basic animation endpoints (simplified)
app.get('/api/animations', (req, res) => {
    res.json({
        success: true,
        data: [],
        message: 'Animations endpoint working'
    });
});
app.post('/api/animations/create', (req, res) => {
    const { code, componentName } = req.body;
    res.json({
        success: true,
        data: {
            componentName: componentName || 'TestAnimation',
            code: code || '// Test animation code',
            filePath: '/test/path'
        },
        message: 'Animation created successfully'
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Test API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API ready for testing`);
});
exports.default = app;
