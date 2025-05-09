
#!/usr/bin/env node

/**
 * This script helps to set up the backend server structure for GhostGuard's WhatsApp integration
 * Run with: node create-backend-script.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const backendDir = path.join(process.cwd(), 'ghostguard-backend');
const dirs = [
  '',
  'routes',
  'services'
];

const files = [
  {
    path: '.env',
    content: `PORT=3001
NODE_ENV=development
SESSION_SECRET=your_secret_key_here
`
  },
  {
    path: 'server.js',
    content: `const express = require('express');
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
  console.log(\`Server running on port \${PORT}\`);
});`
  },
  {
    path: 'routes/index.js',
    content: `const express = require('express');
const router = express.Router();

// Server status endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

// Check feature availability
router.get('/features/:feature', (req, res) => {
  const { feature } = req.params;
  
  switch (feature) {
    case 'whatsapp':
      res.json({ available: true });
      break;
    case 'email':
      res.json({ available: true });
      break;
    case 'both':
      res.json({ available: true });
      break;
    default:
      res.status(404).json({ available: false });
  }
});

// Version endpoint
router.get('/version', (req, res) => {
  res.json({ version: '1.0.0' });
});

module.exports = router;`
  },
  {
    path: 'routes/whatsapp.js',
    content: `const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsapp-service');
const scanService = require('../services/scan-service');

// Initialize WhatsApp and get QR code
router.post('/init', async (req, res) => {
  try {
    const qrCode = await whatsappService.initialize();
    res.json({ qrCodeUrl: qrCode });
  } catch (error) {
    console.error('Error initializing WhatsApp:', error);
    res.status(500).json({ error: error.message });
  }
});

// Restore session if available
router.post('/restore-session', async (req, res) => {
  try {
    const success = await whatsappService.restoreSession(req.body);
    res.json({ success });
  } catch (error) {
    console.error('Error restoring session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Complete authentication
router.post('/authenticate', async (req, res) => {
  try {
    // The actual authentication is handled via QR code in the WhatsApp service
    // This endpoint just confirms the authentication status
    res.json({ 
      session: {
        connected: true,
        lastActive: new Date()
      }
    });
  } catch (error) {
    console.error('Error authenticating WhatsApp:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get contacts (chats)
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await whatsappService.getChats();
    res.json({ contacts });
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a contact
router.get('/messages/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const messages = await whatsappService.getMessages(contactId);
    res.json({ messages });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send a message
router.post('/send', async (req, res) => {
  try {
    const { contactId, text } = req.body;
    
    if (!contactId || !text) {
      return res.status(400).json({ error: 'Contact ID and text are required' });
    }
    
    const message = await whatsappService.sendMessage(contactId, text);
    res.json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Scan a message for threats
router.post('/scan/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = req.body;
    
    // Use the scan service to check for threats
    const scanResult = await scanService.scanUrls(
      message.urls || [], 
      'whatsapp', 
      messageId
    );
    
    res.json({
      isThreat: scanResult.isThreat,
      threatScore: scanResult.threatScore
    });
  } catch (error) {
    console.error('Error scanning message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Scan all unscanned messages
router.post('/scan-all', async (req, res) => {
  try {
    // In a real implementation, you would scan all unscanned messages
    // For demo purposes, we'll just return a simulated result
    res.json({
      scannedCount: Math.floor(Math.random() * 10) + 5,
      threatsFound: Math.floor(Math.random() * 3)
    });
  } catch (error) {
    console.error('Error scanning all messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Disconnect WhatsApp
router.post('/disconnect', async (req, res) => {
  try {
    await whatsappService.disconnect();
    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;`
  },
  {
    path: 'routes/email.js',
    content: `const express = require('express');
const router = express.Router();
const emailService = require('../services/email-service');
const scanService = require('../services/scan-service');

// Connect to email
router.post('/connect', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        connected: false,
        error: 'Email and password are required' 
      });
    }
    
    const status = await emailService.connect(email, password);
    res.json(status);
  } catch (error) {
    console.error('Error connecting to email:', error);
    res.status(500).json({ 
      connected: false,
      error: error.message 
    });
  }
});

// Get emails
router.get('/messages', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }
    
    const messages = await emailService.getEmails(email);
    res.json({ messages });
  } catch (error) {
    console.error('Error getting emails:', error);
    res.status(500).json({ error: error.message });
  }
});

// Scan URL from an email
router.post('/scan-url', async (req, res) => {
  try {
    const { url, emailId } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Use scan service to check for threats
    const threat = await scanService.scanUrl(url, 'email', emailId);
    res.json({ threat });
  } catch (error) {
    console.error('Error scanning URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Scan an email
router.post('/scan/:emailId', async (req, res) => {
  try {
    const { emailId } = req.params;
    const email = req.body;
    
    if (!email || !email.urls) {
      return res.status(400).json({ error: 'Email with URLs is required' });
    }
    
    // Use scan service to check all URLs in the email
    const threats = await scanService.scanUrls(email.urls, 'email', emailId);
    res.json({ threats });
  } catch (error) {
    console.error('Error scanning email:', error);
    res.status(500).json({ error: error.message });
  }
});

// Scan all emails
router.post('/scan-all', async (req, res) => {
  try {
    // In a real implementation, you would scan all unscanned emails
    // For demo purposes, we'll just return a simulated result
    res.json({
      scannedCount: Math.floor(Math.random() * 15) + 10,
      threatsFound: Math.floor(Math.random() * 4)
    });
  } catch (error) {
    console.error('Error scanning all emails:', error);
    res.status(500).json({ error: error.message });
  }
});

// Disconnect email
router.post('/disconnect', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    await emailService.disconnect(email);
    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting email:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;`
  },
  {
    path: 'services/whatsapp-service.js',
    content: `const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

// Store the WhatsApp client instance
let whatsappClient = null;
let qrCodeData = null;
let isInitialized = false;
let isAuthenticated = false;

// Store connections and message listeners
const messageListeners = new Set();
const connectionStatusListeners = new Set();

// Initialize WhatsApp client
const initialize = async () => {
  if (isInitialized) return qrCodeData;
  
  try {
    // Create a new client
    whatsappClient = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        args: ['--no-sandbox'],
      }
    });
    
    // QR code event
    whatsappClient.on('qr', async (qr) => {
      qrCodeData = qr;
      // Generate QR code to data URL for frontend
      try {
        const dataUrl = await qrcode.toDataURL(qr);
        qrCodeData = dataUrl;
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
      
      // Notify listeners
      connectionStatusListeners.forEach(listener => 
        listener({
          event: 'qr',
          data: qrCodeData,
          connected: false
        })
      );
    });
    
    // Ready event
    whatsappClient.on('ready', () => {
      isAuthenticated = true;
      
      // Notify listeners
      connectionStatusListeners.forEach(listener => 
        listener({
          event: 'ready',
          connected: true,
          lastActive: new Date()
        })
      );
      
      console.log('WhatsApp client is ready!');
    });
    
    // Disconnected event
    whatsappClient.on('disconnected', () => {
      isAuthenticated = false;
      
      // Notify listeners
      connectionStatusListeners.forEach(listener => 
        listener({
          event: 'disconnected',
          connected: false
        })
      );
      
      console.log('WhatsApp client disconnected');
    });
    
    // Message event
    whatsappClient.on('message', async (message) => {
      console.log(\`New message from \${message.from}: \${message.body}\`);
      
      // Check for URLs in the message
      const urlRegex = /(https?:\/\/[^\\s]+)/g;
      const urls = message.body.match(urlRegex) || [];
      
      // Format the message for our frontend
      const formattedMessage = {
        id: message.id.id,
        sender: message.from,
        text: message.body,
        timestamp: new Date(message.timestamp * 1000),
        isMine: false,
        containsUrl: urls.length > 0,
        urls: urls.length > 0 ? urls : undefined
      };
      
      // Notify all message listeners
      messageListeners.forEach(listener => 
        listener(formattedMessage)
      );
    });
    
    // Initialize client
    await whatsappClient.initialize();
    isInitialized = true;
    
    return qrCodeData;
  } catch (error) {
    console.error('Error initializing WhatsApp client:', error);
    throw error;
  }
};

// Try to restore a previous session
const restoreSession = async (sessionData) => {
  // In a real implementation, you would use the session data to restore
  // For now, we just check if we already have a client
  if (whatsappClient && isAuthenticated) {
    return true;
  }
  
  // If no active client, we need to initialize and generate a new QR code
  await initialize();
  return false;
};

// Register message listener
const onMessage = (callback) => {
  messageListeners.add(callback);
  return () => messageListeners.delete(callback);
};

// Register connection status listener
const onConnectionStatus = (callback) => {
  connectionStatusListeners.add(callback);
  return () => connectionStatusListeners.delete(callback);
};

// Get all chats
const getChats = async () => {
  if (!whatsappClient || !isAuthenticated) {
    throw new Error('WhatsApp client is not ready');
  }
  
  try {
    const chats = await whatsappClient.getChats();
    
    // Format chats as contacts
    return chats.map(chat => ({
      id: chat.id._serialized,
      name: chat.name || chat.id.user,
      lastMessage: chat.lastMessage?.body?.substring(0, 30),
      lastSeen: chat.lastMessage ? new Date(chat.lastMessage.timestamp * 1000) : new Date(),
      unreadCount: chat.unreadCount || 0
    }));
  } catch (error) {
    console.error('Error getting chats:', error);
    throw error;
  }
};

// Get messages for a chat
const getMessages = async (chatId) => {
  if (!whatsappClient || !isAuthenticated) {
    throw new Error('WhatsApp client is not ready');
  }
  
  try {
    const chat = await whatsappClient.getChatById(chatId);
    const messages = await chat.fetchMessages({
      limit: 50
    });
    
    // Format messages for our frontend
    return messages.map(msg => {
      const urlRegex = /(https?:\/\/[^\\s]+)/g;
      const urls = msg.body.match(urlRegex) || [];
      
      return {
        id: msg.id.id,
        sender: msg.fromMe ? 'Me' : (chat.name || chat.id.user),
        text: msg.body,
        timestamp: new Date(msg.timestamp * 1000),
        isMine: msg.fromMe,
        containsUrl: urls.length > 0,
        urls: urls.length > 0 ? urls : undefined,
        scanned: false
      };
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

// Send a message
const sendMessage = async (chatId, text) => {
  if (!whatsappClient || !isAuthenticated) {
    throw new Error('WhatsApp client is not ready');
  }
  
  try {
    const chat = await whatsappClient.getChatById(chatId);
    const sentMsg = await chat.sendMessage(text);
    
    // Format the sent message for our frontend
    const urlRegex = /(https?:\/\/[^\\s]+)/g;
    const urls = text.match(urlRegex) || [];
    
    const message = {
      id: sentMsg.id.id,
      sender: 'Me',
      text: text,
      timestamp: new Date(),
      isMine: true,
      containsUrl: urls.length > 0,
      urls: urls.length > 0 ? urls : undefined
    };
    
    // Notify message listeners about the sent message
    messageListeners.forEach(listener => listener(message));
    
    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Logout and disconnect
const disconnect = async () => {
  if (!whatsappClient) return;
  
  try {
    await whatsappClient.logout();
    whatsappClient = null;
    isInitialized = false;
    isAuthenticated = false;
    qrCodeData = null;
    
    // Clear all listeners
    messageListeners.clear();
    connectionStatusListeners.clear();
  } catch (error) {
    console.error('Error disconnecting WhatsApp client:', error);
    throw error;
  }
};

module.exports = {
  initialize,
  restoreSession,
  onMessage,
  onConnectionStatus,
  getChats,
  getMessages,
  sendMessage,
  disconnect
};`
  },
  {
    path: 'services/scan-service.js',
    content: `const crypto = require('crypto');

// Known malicious domains for demo purposes
const maliciousDomains = [
  "malicious-site.com",
  "phishing-domain.net",
  "scam-link.org",
  "malware-test.com",
  "phishing.example.net",
];

// Suspicious TLDs
const suspiciousTLDs = [".xyz", ".top", ".info", ".click"];

// URL shortening services
const urlShorteners = ["bit.ly", "t.co", "tinyurl.com", "goo.gl", "tiny.cc"];

// Scan a single URL
const scanUrl = async (url, source, itemId) => {
  try {
    // Basic URL validation
    if (!url.match(/^https?:\\/\\//i)) {
      return {
        isThreat: false,
        threatScore: 0
      };
    }
    
    // Parse URL
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Check against known malicious domains
    if (maliciousDomains.some(domain => hostname.includes(domain))) {
      return {
        isThreat: true,
        threatScore: 90,
        details: 'Known malicious domain detected'
      };
    }
    
    // Check for suspicious TLDs
    if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) {
      return {
        isThreat: true,
        threatScore: 70,
        details: 'Suspicious TLD detected'
      };
    }
    
    // Check for URL shorteners (would need expansion in production)
    if (urlShorteners.includes(hostname)) {
      return {
        isThreat: true,
        threatScore: 50,
        details: 'URL shortener detected - could be hiding malicious content'
      };
    }
    
    // Generate a consistent but "random" score for demo purposes
    // In a real implementation, you would use a proper threat intelligence API
    const hash = crypto.createHash('md5').update(url).digest('hex');
    const hashNumber = parseInt(hash.substring(0, 8), 16);
    const normalizedScore = hashNumber % 100;
    
    return {
      isThreat: normalizedScore > 30,
      threatScore: normalizedScore,
      details: normalizedScore > 70 
        ? 'Highly suspicious URL detected' 
        : normalizedScore > 30 
          ? 'Potentially suspicious URL' 
          : 'No threats detected'
    };
  } catch (error) {
    console.error('Error scanning URL:', error);
    return {
      isThreat: false,
      threatScore: 0,
      error: error.message
    };
  }
};

// Scan multiple URLs
const scanUrls = async (urls, source, itemId) => {
  if (!urls || !urls.length) {
    return {
      isThreat: false,
      threatScore: 0
    };
  }
  
  try {
    // Scan all URLs and get the highest threat score
    const results = await Promise.all(urls.map(url => scanUrl(url, source, itemId)));
    
    // Find max threat score
    const maxResult = results.reduce((max, current) => 
      (current.threatScore > max.threatScore) ? current : max, 
      { isThreat: false, threatScore: 0 });
    
    return maxResult;
  } catch (error) {
    console.error('Error scanning URLs:', error);
    return {
      isThreat: false,
      threatScore: 0,
      error: error.message
    };
  }
};

module.exports = {
  scanUrl,
  scanUrls
};`
  },
  {
    path: 'services/email-service.js',
    content: `// This is a placeholder for the email service
// In a real implementation, you would integrate with an email provider

const activeConnections = new Map();

// Connect to email
const connect = async (email, password) => {
  // For demo purposes, we'll always succeed
  activeConnections.set(email, {
    email,
    provider: email.includes('gmail') ? 'Gmail' : 
              email.includes('outlook') ? 'Outlook' : 
              email.includes('yahoo') ? 'Yahoo' : 'Other',
    lastSyncTime: new Date()
  });
  
  return {
    connected: true,
    email,
    provider: activeConnections.get(email).provider,
    lastSyncTime: new Date()
  };
};

// Get emails
const getEmails = async (email) => {
  if (!activeConnections.has(email)) {
    throw new Error('Not connected to email service');
  }
  
  // Generate some fake emails
  const emails = [];
  for (let i = 0; i < 10; i++) {
    const hasUrl = Math.random() > 0.7;
    const urls = hasUrl ? [
      'https://example.com/document.pdf',
      'https://suspicious-site.xyz/login'
    ] : [];
    
    emails.push({
      id: \`email-\${Date.now()}-\${i}\`,
      sender: \`sender\${i}@example.com\`,
      subject: \`Test Email \${i + 1}\`,
      preview: hasUrl ? 'Please check this document...' : 'Meeting tomorrow at 2pm...',
      body: hasUrl ? 'Please check this document at https://example.com/document.pdf' : 
                    'Meeting tomorrow at 2pm in the conference room.',
      timestamp: new Date(Date.now() - i * 3600000),
      containsUrl: hasUrl,
      urls: urls,
      scanned: false
    });
  }
  
  return emails;
};

// Disconnect
const disconnect = async (email) => {
  activeConnections.delete(email);
  return true;
};

module.exports = {
  connect,
  getEmails,
  disconnect
};`
  },
  {
    path: 'package.json',
    content: `{
  "name": "ghostguard-backend",
  "version": "1.0.0",
  "description": "Backend server for GhostGuard WhatsApp and Email integrations",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "node-imap": "^0.9.6",
    "nodemailer": "^6.9.7",
    "qrcode": "^1.5.3",
    "rate-limiter-flexible": "^3.0.0",
    "whatsapp-web.js": "^1.23.0",
    "ws": "^8.14.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}`
  }
];

// Create directories
console.log('Creating backend directory structure...');
for (const dir of dirs) {
  const dirPath = path.join(backendDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Write files
console.log('\nWriting configuration files...');
for (const file of files) {
  const filePath = path.join(backendDir, file.path);
  fs.writeFileSync(filePath, file.content);
  console.log(`Created file: ${filePath}`);
}

// Inform user about next steps
console.log('\n✅ Backend server structure created successfully!');
console.log('\nNext steps:');
console.log('1. Navigate to the backend directory:');
console.log(`   cd ${backendDir}`);
console.log('2. Install dependencies:');
console.log('   npm install');
console.log('3. Start the server:');
console.log('   npm start');
console.log('\nNote: You need to have Chrome or Chromium installed for WhatsApp Web integration.');
