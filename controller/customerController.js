const { fetchCustomerDetails, fetchCustomerOrders } = require('../services/customerService');

// POST /get-customer-details
exports.getCustomerDetails = async (req, res) => {
  const { accessToken } = req.body;
  try {
    const customer = await fetchCustomerDetails(accessToken);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /get-customer-orders
exports.getCustomerOrders = async (req, res) => {
  const { accessToken } = req.body;
  try {
    const orders = await fetchCustomerOrders(accessToken);
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
