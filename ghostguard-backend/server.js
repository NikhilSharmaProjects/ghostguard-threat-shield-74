const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { RateLimiterMemory } = require('rate-limiter-flexible');

// Load environment variables
dotenv.config();

// Import routes
const indexRoutes = require('./routes/index');
const whatsappRoutes = require('./routes/whatsapp');
const emailRoutes = require('./routes/email');

// Initialize app
const app = express();
const PORT = process.env.PORT || 3001;

// Setup rate limiter
const rateLimiter = new RateLimiterMemory({
  points: 100, // Number of points
  duration: 60, // Per 60 seconds
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (error) {
    res.status(429).send('Too Many Requests');
  }
});

// Routes
app.use('/api', indexRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/email', emailRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Import WebSocket handlers
const whatsappService = require('./services/whatsapp-service');

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Register this client for WhatsApp notifications
  const removeMessageListener = whatsappService.onMessage(message => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'new_message',
        message
      }));
    }
  });
  
  // Register for connection status updates
  const removeStatusListener = whatsappService.onConnectionStatus(status => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'connection_status',
        status
      }));
    }
  });
  
  // Handle messages from client
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      // Handle different message types
      if (data.type === 'restore_session') {
        // Try to restore session
        try {
          await whatsappService.restoreSession(data.data);
        } catch (error) {
          console.error('Failed to restore session:', error);
        }
      } else if (data.type === 'send_message') {
        try {
          await whatsappService.sendMessage(data.contactId, data.text);
        } catch (error) {
          console.error('Failed to send message:', error);
        }
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });
  
  // Handle client disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
    removeMessageListener();
    removeStatusListener();
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});