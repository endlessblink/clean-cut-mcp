"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const ws_1 = require("ws");
const errorHandler_1 = require("./middleware/errorHandler");
const animation_1 = require("./routes/animation");
const assets_1 = require("./routes/assets");
const projects_1 = require("./routes/projects");
const studio_1 = require("./routes/studio");
const websocket_1 = require("./services/websocket");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({ server });
// Configuration
const PORT = process.env.PORT || 6971;
const NODE_ENV = process.env.NODE_ENV || 'development';
// Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Needed for Remotion Studio
}));
app.use((0, cors_1.default)({
    origin: NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:3000', 'http://localhost:6970'],
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// API Routes
app.use('/api/animations', animation_1.animationRoutes);
app.use('/api/assets', assets_1.assetRoutes);
app.use('/api/projects', projects_1.projectRoutes);
app.use('/api/studio', studio_1.studioRoutes);
// WebSocket setup
(0, websocket_1.setupWebSocket)(wss);
// Error handling
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});
// Start server
server.listen(PORT, () => {
    console.log(`🚀 Clean Cut API Server running on port ${PORT}`);
    console.log(`📊 Environment: ${NODE_ENV}`);
    console.log(`🔗 WebSocket server ready`);
    console.log(`🎬 Remotion Studio will be available on port 6970`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});
exports.default = app;
