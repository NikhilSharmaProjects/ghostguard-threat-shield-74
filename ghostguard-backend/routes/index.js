const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'GhostGuard Backend API is running.' });
});

module.exports = router;