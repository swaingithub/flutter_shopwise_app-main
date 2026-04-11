require('dotenv').config();
const { fetchAllCollections } = require('./services/productService');

(async () => {
    try {
        console.log('Fetching collections...');
        const collections = await fetchAllCollections();
        console.log('Collections:', JSON.stringify(collections, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('API Error Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
})();
