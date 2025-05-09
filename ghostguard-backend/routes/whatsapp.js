const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsapp-service');

// Get QR code for WhatsApp login
router.get('/qr', async (req, res) => {
  try {
    const qr = await whatsappService.initialize();
    res.json({ qr });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get WhatsApp chats
router.get('/chats', async (req, res) => {
  try {
    const chats = await whatsappService.getChats();
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send WhatsApp message
router.post('/send', async (req, res) => {
  const { to, message } = req.body;
  try {
    await whatsappService.sendMessage(to, message);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;