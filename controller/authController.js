const { createCustomer, loginCustomer, renewCustomerToken, logoutCustomer } = require('../services/authService');


// POST /create-customer
exports.createUser = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    const data = await createCustomer({ email, password, firstName, lastName });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /user-login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await loginCustomer({ email, password });
    const tokenData = data?.data?.customerAccessTokenCreate;

    if (tokenData?.customerAccessToken) {
      res.json({ 
        accessToken: tokenData.customerAccessToken.accessToken,
        expiresAt: tokenData.customerAccessToken.expiresAt
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /renew-token
exports.renewToken = async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }
  try {
    const data = await renewCustomerToken(accessToken);
    const renewData = data?.data?.customerAccessTokenRenew;

    if (renewData?.customerAccessToken) {
      res.json({ 
        accessToken: renewData.customerAccessToken.accessToken,
        expiresAt: renewData.customerAccessToken.expiresAt
      });
    } else {
      res.status(401).json({ error: 'Token renewal failed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /user-logout
exports.logoutUser = async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }
  try {
    const data = await logoutCustomer(accessToken);
    const logoutData = data?.data?.customerAccessTokenDelete;

    if (logoutData?.deletedAccessToken || logoutData?.deletedCustomerAccessTokenId) {
      res.json({ success: true, message: 'Logged out successfully' });
    } else {
      res.status(401).json({ error: 'Logout failed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

