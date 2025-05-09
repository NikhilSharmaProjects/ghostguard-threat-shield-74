const express = require('express');
const router = express.Router();
const emailService = require('../services/email-service');
const scanService = require('../services/scan-service');

// Connect to email
router.post('/connect', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await emailService.connect(email, password);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get emails
router.get('/messages', async (req, res) => {
  const { email, folder, limit } = req.query;
  try {
    const messages = await emailService.getEmails(email, folder, limit ? parseInt(limit) : 20);
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scan a URL in an email
router.post('/scan-url', async (req, res) => {
  const { url } = req.body;
  try {
    const result = await scanService.scanUrl(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scan a specific email by ID
router.post('/scan/:emailId', async (req, res) => {
  const { email, folder } = req.body;
  const { emailId } = req.params;
  try {
    const result = await emailService.scanEmail(email, folder, emailId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scan all emails in a folder
router.post('/scan-all', async (req, res) => {
  const { email, folder } = req.body;
  try {
    const result = await emailService.scanAllEmails(email, folder);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Disconnect from email
router.post('/disconnect', async (req, res) => {
  const { email } = req.body;
  try {
    await emailService.disconnect(email);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;