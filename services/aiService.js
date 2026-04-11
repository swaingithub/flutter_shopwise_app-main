const axios = require('axios');
const { fetchAllProducts, fetchAllCollections } = require('./productService');

async function generateChatResponse(userMessage, chatHistory = []) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "PLACEHOLDER_KEY") {
        return "My apologies, I am currently resting. Please ensure the GEMINI_API_KEY is correctly set in your environment.";
    }

    try {
        // 1. Fetch products and collections for real-time context
        const [products, collections] = await Promise.all([
            fetchAllProducts(50),
            fetchAllCollections(20)
        ]);

        const shopUrl = `https://${process.env.SHOP_DOMAIN || '3boxesgifts.com'}`;

        const catalogContext = products.map(p => 
            `- ${p.title}: ${p.description} (Price: ${p.currencyCode} ${p.price}) [LINK: ${shopUrl}/products/${p.handle}]`
        ).join('\n');

        const collectionsContext = collections.map(c => 
            `- ${c.title} [LINK: ${shopUrl}/collections/${c.handle}]`
        ).join('\n');

        const systemPersona = `
You are "Luxury Assistant", the elite shopping concierge for 3Boxes Gifts. 
Your tone is sophisticated, elegant, and highly helpful.

REAL-TIME SHOP DATA:
COLLECTIONS:
${collectionsContext}

PRODUCTS:
${catalogContext}

Rules:
1. When recommending a product, ALWAYS provide its clickable link in Markdown format: [View Product](URL)
2. When mentioning a collection, provide its link.
3. Use the product links provided in the 'PRODUCTS' list above.
4. Keep replies concise and luxurious.
5. If a user asks for something outside the catalog, suggest the closest luxury alternative from our collection.
`;

        // Format history for raw API
        const contents = [
            { role: "user", parts: [{ text: "Context: " + systemPersona }] },
            { role: "model", parts: [{ text: "Understood. I will provide clickable [View Product](link) buttons for all recommendations using your shop data." }] },
            ...chatHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            })),
            { role: "user", parts: [{ text: userMessage }] }
        ];

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
            { contents },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return reply || "I am reflecting on your request. How else may I assist you today?";

    } catch (error) {
        console.error("AI Error:", error.response?.data || error.message);
        return "I apologize, but I am experiencing a brief pause in my service. I suggests exploring our Scented Candles section.";
    }
}

module.exports = { generateChatResponse };
