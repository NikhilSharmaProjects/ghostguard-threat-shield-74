const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let whatsappClient = null;
let qrCodeData = null;
let isInitialized = false;
let isAuthenticated = false;

const messageListeners = new Set();
const connectionStatusListeners = new Set();

const initialize = async () => {
  if (isInitialized) return qrCodeData;

  whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox'] }
  });

  whatsappClient.on('qr', (qr) => {
    qrCodeData = qr;
    qrcode.generate(qr, { small: true });
    connectionStatusListeners.forEach(listener => listener({ event: 'qr', data: qr }));
  });

  whatsappClient.on('ready', () => {
    isAuthenticated = true;
    connectionStatusListeners.forEach(listener => listener({ event: 'ready', connected: true }));
    console.log('WhatsApp client is ready!');
  });

  whatsappClient.on('disconnected', () => {
    isAuthenticated = false;
    connectionStatusListeners.forEach(listener => listener({ event: 'disconnected', connected: false }));
    console.log('WhatsApp client disconnected');
  });

  whatsappClient.on('message', (message) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.body.match(urlRegex) || [];
    const formattedMessage = {
      id: message.id.id,
      sender: message.from,
      text: message.body,
      timestamp: new Date(message.timestamp * 1000),
      isMine: false,
      containsUrl: urls.length > 0,
      urls: urls.length > 0 ? urls : undefined
    };
    messageListeners.forEach(listener => listener(formattedMessage));
  });

  await whatsappClient.initialize();
  isInitialized = true;
  return qrCodeData;
};

const onMessage = (callback) => {
  messageListeners.add(callback);
  return () => messageListeners.delete(callback);
};

const onConnectionStatus = (callback) => {
  connectionStatusListeners.add(callback);
  return () => connectionStatusListeners.delete(callback);
};

const getChats = async () => {
  if (!whatsappClient || !isAuthenticated) throw new Error('WhatsApp client is not ready');
  return await whatsappClient.getChats();
};

const sendMessage = async (to, message) => {
  if (!whatsappClient || !isAuthenticated) throw new Error('WhatsApp client is not ready');
  await whatsappClient.sendMessage(to, message);
};

module.exports = {
  initialize,
  onMessage,
  onConnectionStatus,
  getChats,
  sendMessage
};