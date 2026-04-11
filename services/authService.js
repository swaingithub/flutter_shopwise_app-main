const axios = require('axios');
const { shopifyEndpoint, shopifyHeaders } = require('../config/shopify');

// Create a new Shopify customer
async function createCustomer({ email, password, firstName, lastName }) {
  const trimmedPassword = password.substring(0, 40);

  const mutation = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          displayName
          email
        }
        customerUserErrors {
          field
          message
        }
      }
    }
  `;

  const response = await axios.post(
    shopifyEndpoint,
    { query: mutation, variables: { input: { email, password: trimmedPassword, firstName, lastName } } },
    { headers: shopifyHeaders }
  );

  return response.data;
}

// Login and return a Shopify customer access token
async function loginCustomer({ email, password }) {
  const mutation = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  const response = await axios.post(
    shopifyEndpoint,
    { query: mutation, variables: { input: { email, password } } },
    { headers: shopifyHeaders }
  );

  return response.data;
}

// Renew a Shopify customer access token
async function renewCustomerToken(customerAccessToken) {
  const mutation = `
    mutation customerAccessTokenRenew($customerAccessToken: String!) {
      customerAccessTokenRenew(customerAccessToken: $customerAccessToken) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await axios.post(
    shopifyEndpoint,
    { query: mutation, variables: { customerAccessToken } },
    { headers: shopifyHeaders }
  );

  return response.data;
}

// Delete a Shopify customer access token
async function logoutCustomer(customerAccessToken) {
  const mutation = `
    mutation customerAccessTokenDelete($customerAccessToken: String!) {
      customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
        deletedAccessToken
        deletedCustomerAccessTokenId
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await axios.post(
    shopifyEndpoint,
    { query: mutation, variables: { customerAccessToken } },
    { headers: shopifyHeaders }
  );

  return response.data;
}

module.exports = { createCustomer, loginCustomer, renewCustomerToken, logoutCustomer };


