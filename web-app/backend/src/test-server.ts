import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 6972;

// Middleware
app.use(cors());
app.use(express.json());

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

export default app;