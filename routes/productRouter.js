const express = require('express');
const router = express.Router();
const { getCollection, getAllProducts, searchProduct, getCollections } = require('../controller/productController');

router.post('/get-collection', getCollection);
router.post('/get-products', getAllProducts);
router.post('/search-products', searchProduct);
router.post('/get-collections', getCollections);

module.exports = router;
