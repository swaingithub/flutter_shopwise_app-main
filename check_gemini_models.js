const axios = require('axios');
require('dotenv').config();

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Checking available models for your API Key...');
    
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        console.log('\nSUCCESS! Available models:');
        response.data.models.forEach(m => {
            console.log(`- ${m.name.replace('models/', '')} (Supported methods: ${m.supportedGenerationMethods.join(', ')})`);
        });
    } catch (error) {
        console.error('\nFAILED to list models:');
        console.error(error.response?.data || error.message);
    }
}

checkModels();
