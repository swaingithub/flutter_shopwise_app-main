const express = require('express');
const router = express.Router();

const { createUser, loginUser } = require('../controller/authController');
const { getCustomerDetails, getCustomerOrders } = require('../controller/customerController');
const { getCollection, getAllProducts, searchProduct } = require('../controller/productController');

// Auth routes
router.post('/create-customer', createUser);
router.post('/user-login', loginUser);

// Customer routes
router.post('/get-customer-details', getCustomerDetails);
router.post('/get-customer-orders', getCustomerOrders);

// Product routes
router.post('/get-collection', getCollection);
router.post('/get-products', getAllProducts);
router.post('/search-products', searchProduct);

module.exports = router;
