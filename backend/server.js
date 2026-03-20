const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Restrict in production to your Vercel domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-version', 'x-client-id', 'x-client-secret'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
try {
  const tournamentRoutes = require('./routes/tournaments');
  const indexRoutes = require('./routes/index');
  const paymentRoutes = require('./routes/payment');

  // Health check endpoint
  app.use('/api/health', indexRoutes);

  // API Routes
  app.use('/api/tournaments', tournamentRoutes);
  app.use('/api/payment', paymentRoutes);
  
  console.log('✅ Routes loaded successfully');
  console.log('💰 Payment routes initialized (Cashfree integrated)');
} catch (error) {
  console.error('❌ Error loading routes:', error);
  throw error;
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'ArenaX Gaming API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      tournaments: '/api/tournaments',
      payment: {
        createOrder: 'POST /api/payment/create-order',
        verify: 'GET /api/payment/verify/:orderId',
        webhook: 'POST /api/payment/webhook'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎮 ArenaX Gaming Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💰 Payment API: http://localhost:${PORT}/api/payment`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
});

module.exports = app;
