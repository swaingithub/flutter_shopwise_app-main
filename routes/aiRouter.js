const express = require('express');
const router = express.Router();
const aiController = require('../controller/aiController');

router.post('/ai-chat', aiController.chatWithAI);

module.exports = router;
