require('dotenv').config();
const { fetchAllProducts } = require('./services/productService');

(async () => {
    try {
        console.log('Fetching all products...');
        const products = await fetchAllProducts();
        console.log('Products found:', products.length);
        if (products.length > 0) {
            console.log('Sample product:', JSON.stringify(products[0], null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
