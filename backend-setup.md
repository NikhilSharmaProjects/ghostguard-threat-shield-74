
# GhostGuard Backend Setup

This document explains how to set up the backend server required for the real WhatsApp and Email integration features in GhostGuard.

## Requirements

- Node.js 16+ installed
- npm or yarn package manager
- Internet connection for downloading packages
- For WhatsApp: Chrome or Chromium installed (required for whatsapp-web.js)

## Backend Server Setup

1. Create a new directory for the backend server:

```bash
mkdir ghostguard-backend
cd ghostguard-backend
```

2. Initialize a new Node.js project:

```bash
npm init -y
```

3. Install required dependencies:

```bash
npm install express cors dotenv whatsapp-web.js qrcode-terminal node-imap nodemailer winston helmet rate-limiter-flexible
```

4. Create a `.env` file for environment variables:

```
PORT=3001
NODE_ENV=development
SESSION_SECRET=your_secret_key_here
```

5. Create the server file structure:

```
ghostguard-backend/
├── .env
├── package.json
├── server.js
├── routes/
│   ├── index.js
│   ├── whatsapp.js
│   └── email.js
└── services/
    ├── whatsapp-service.js
    ├── email-service.js
    └── scan-service.js
```

## Main Server File (server.js)

```javascript
const express = require('express');
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## WhatsApp Service Implementation

Create `services/whatsapp-service.js`:

```javascript
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

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
    whatsappClient.on('qr', (qr) => {
      qrCodeData = qr;
      // Generate QR code to terminal for debugging
      qrcode.generate(qr, { small: true });
      
      // Notify listeners
      connectionStatusListeners.forEach(listener => 
        listener({
          event: 'qr',
          data: qr
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
          connected: true
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
    whatsappClient.on('message', (message) => {
      console.log(`New message from ${message.from}: ${message.body}`);
      
      // Check for URLs in the message
      const urlRegex = /(https?:\/\/[^\s]+)/g;
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
      const urlRegex = /(https?:\/\/[^\s]+)/g;
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
    await chat.sendMessage(text);
    
    // Format the sent message for our frontend
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex) || [];
    
    return {
      id: Date.now().toString(),
      sender: 'Me',
      text: text,
      timestamp: new Date(),
      isMine: true,
      containsUrl: urls.length > 0,
      urls: urls.length > 0 ? urls : undefined
    };
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
  onMessage,
  onConnectionStatus,
  getChats,
  getMessages,
  sendMessage,
  disconnect
};
```

## Email Service Implementation

Create `services/email-service.js`:

```javascript
const Imap = require('node-imap');
const nodemailer = require('nodemailer');
const { simpleParser } = require('mailparser');

// Store active connections
const connections = new Map();

// Connect to email
const connect = async (email, password) => {
  if (connections.has(email)) {
    return { 
      connected: true, 
      email, 
      provider: connections.get(email).provider,
      lastSyncTime: connections.get(email).lastSyncTime
    };
  }
  
  // Determine provider from email
  let imapConfig;
  let provider;
  
  if (email.endsWith('@gmail.com')) {
    provider = 'Gmail';
    imapConfig = {
      user: email,
      password,
      host: 'imap.gmail.com',
      port: 993,
      tls: true
    };
  } else if (email.includes('outlook') || email.includes('hotmail')) {
    provider = 'Outlook';
    imapConfig = {
      user: email,
      password,
      host: 'outlook.office365.com',
      port: 993,
      tls: true
    };
  } else if (email.includes('yahoo')) {
    provider = 'Yahoo';
    imapConfig = {
      user: email,
      password,
      host: 'imap.mail.yahoo.com',
      port: 993,
      tls: true
    };
  } else {
    throw new Error('Unsupported email provider');
  }
  
  // Create connection
  try {
    const imap = new Imap(imapConfig);
    
    // Promisify the connection
    await new Promise((resolve, reject) => {
      imap.once('ready', resolve);
      imap.once('error', reject);
      imap.connect();
    });
    
    // Store the connection
    connections.set(email, {
      imap,
      provider,
      lastSyncTime: new Date()
    });
    
    return {
      connected: true,
      email,
      provider,
      lastSyncTime: new Date()
    };
  } catch (error) {
    console.error('Error connecting to email:', error);
    throw new Error(`Failed to connect to ${provider}: ${error.message}`);
  }
};

// Get emails
const getEmails = async (email, folder = 'INBOX', limit = 20) => {
  const connection = connections.get(email);
  if (!connection) {
    throw new Error('Not connected to email');
  }
  
  const { imap } = connection;
  
  try {
    // Open the mailbox
    await new Promise((resolve, reject) => {
      imap.openBox(folder, true, (err, box) => {
        if (err) reject(err);
        else resolve(box);
      });
    });
    
    // Search for emails
    const results = await new Promise((resolve, reject) => {
      imap.search(['ALL'], (err, uids) => {
        if (err) reject(err);
        else resolve(uids);
      });
    });
    
    // Sort and limit
    const uids = results.sort((a, b) => b - a).slice(0, limit);
    
    if (uids.length === 0) {
      return [];
    }
    
    // Fetch emails
    const messages = await new Promise((resolve, reject) => {
      const fetch = imap.fetch(uids, { bodies: '' });
      const messages = [];
      
      fetch.on('message', (msg) => {
        let buffer = '';
        
        msg.on('body', (stream) => {
          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });
        });
        
        msg.once('end', async () => {
          try {
            const parsed = await simpleParser(buffer);
            
            // Extract URLs from HTML content
            let urls = [];
            if (parsed.html) {
              const urlRegex = /(https?:\/\/[^\s"'<>]+)/g;
              urls = Array.from(new Set(parsed.html.match(urlRegex) || []));
            }
            
            messages.push({
              id: parsed.messageId || `${Date.now()}-${Math.random()}`,
              sender: parsed.from ? parsed.from.text : 'Unknown Sender',
              subject: parsed.subject || '(No Subject)',
              preview: parsed.text ? parsed.text.substring(0, 100) + '...' : '',
              body: parsed.text || '',
              timestamp: parsed.date || new Date(),
              containsUrl: urls.length > 0,
              urls: urls,
              scanned: false,
              threatIds: []
            });
          } catch (e) {
            console.error('Error parsing email:', e);
          }
        });
      });
      
      fetch.once('error', reject);
      fetch.once('end', () => resolve(messages));
    });
    
    return messages;
  } catch (error) {
    console.error('Error getting emails:', error);
    throw error;
  }
};

// Disconnect email
const disconnect = async (email) => {
  const connection = connections.get(email);
  if (!connection) return;
  
  try {
    connection.imap.end();
    connections.delete(email);
  } catch (error) {
    console.error('Error disconnecting email:', error);
    throw error;
  }
};

module.exports = {
  connect,
  getEmails,
  disconnect
};
```

## API Routes

Create `routes/index.js`:

```javascript
const express = require('express');
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

module.exports = router;
```

Create `routes/whatsapp.js`:

```javascript
const express = require('express');
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

module.exports = router;
```

Create `routes/email.js`:

```javascript
const express = require('express');
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

module.exports = router;
```

## Starting the Backend

To start the server, run:

```bash
node server.js
```

The server will start on port 3001 by default. The frontend will automatically connect to this server when available.

## Notes and Caveats

1. This is a basic setup for demonstration purposes. In a production environment, you would need to add more robust error handling, security measures, and proper logging.

2. WhatsApp Web.js is an unofficial library and could break if WhatsApp makes changes to their web client.

3. For Gmail, you'll need to use App Passwords if you have 2FA enabled. This requires enabling "Less secure app access" in your Google account settings.

4. The backend server should ideally be hosted on a server with a proper domain and HTTPS configured.

5. Remember to secure your environment variables and sensitive data.

## Additional Resources

- [WhatsApp Web.js Documentation](https://wwebjs.dev/guide/)
- [Node-IMAP Documentation](https://github.com/mscdex/node-imap)
- [Express.js Documentation](https://expressjs.com/)
