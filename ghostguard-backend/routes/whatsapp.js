const express = require('express');
const router = express.Router();

// Example endpoint for WhatsApp integration
router.get('/', (req, res) => {
  res.json({ message: 'WhatsApp API endpoint' });
});

module.exports = router;