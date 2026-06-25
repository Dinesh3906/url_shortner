const express = require('express');
const router = express.Router();
const { shorten, getUserUrls, deleteUrl } = require('../controllers/urlController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { shortenLimiter } = require('../middleware/rateLimitMiddleware');

// URL endpoints
router.post('/shorten', optionalProtect, shortenLimiter, shorten);
router.get('/my-urls', protect, getUserUrls);
router.delete('/:id', protect, deleteUrl);

module.exports = router;
