const axios = require('axios');
const { shopifyEndpoint, shopifyHeaders } = require('../config/shopify');

// Fetch profile details for a logged-in customer
async function fetchCustomerDetails(accessToken) {
  const query = `
    query getCustomerDetails($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        acceptsMarketing
        email
        phone
        defaultAddress {
          address1
          address2
          city
          province
          country
          zip
        }
      }
    }
  `;

  const response = await axios.post(
    shopifyEndpoint,
    { query, variables: { customerAccessToken: accessToken } },
    { headers: shopifyHeaders }
  );

  return response.data?.data?.customer;
}

// Fetch order history for a logged-in customer
async function fetchCustomerOrders(accessToken) {
  const query = `
    query GetCustomerOrders($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        orders(first: 10) {
          edges {
            node {
              id
              name
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    variant {
                      priceV2 {
                        amount
                        currencyCode
                      }
                      product {
                        images(first: 1) {
                          edges {
                            node {
                              originalSrc
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await axios.post(
    shopifyEndpoint,
    { query, variables: { customerAccessToken: accessToken } },
    { headers: shopifyHeaders }
  );

  const customer = response.data?.data?.customer;
  if (!customer) throw new Error('Customer not found in response');

  return customer.orders?.edges?.map((edge) => edge.node) || [];
}

module.exports = { fetchCustomerDetails, fetchCustomerOrders };
