const express = require('express');
const router = express.Router();

// Example endpoint for Email integration
router.get('/', (req, res) => {
  res.json({ message: 'Email API endpoint' });
});

module.exports = router;