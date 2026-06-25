const express = require('express');
const router = express.Router();
const { redirect } = require('../controllers/redirectController');

// Root redirect endpoint
router.get('/:shortCode', redirect);

module.exports = router;
