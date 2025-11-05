import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { errorHandler } from './middleware/errorHandler';
import { animationRoutes } from './routes/animation';
import { assetRoutes } from './routes/assets';
import { projectRoutes } from './routes/projects';
import { studioRoutes } from './routes/studio';
import { setupWebSocket } from './services/websocket';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Configuration
const PORT = process.env.PORT || 6971;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Needed for Remotion Studio
}));

app.use(cors({
  origin: NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://localhost:6970'],
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/animations', animationRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/studio', studioRoutes);

// WebSocket setup
setupWebSocket(wss);

// Error handling
app.use(errorHandler);

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

export default app;