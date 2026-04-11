const { generateChatResponse } = require('../services/aiService');

// POST /ai-chat
exports.chatWithAI = async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        const reply = await generateChatResponse(message, history || []);
        res.json({ reply });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
