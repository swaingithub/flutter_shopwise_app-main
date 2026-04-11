const express = require('express');
const router = express.Router();
const { getCustomerDetails, getCustomerOrders } = require('../controller/customerController');

router.post('/get-customer-details', getCustomerDetails);
router.post('/get-customer-orders', getCustomerOrders);

module.exports = router;
