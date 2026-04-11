const axios = require('axios');
require('dotenv').config();

const THROTTLE_DELAY = 3000; 
let lastRequestTime = 0;

const shopifyStorefrontEndpoint = `https://${process.env.SHOP_DOMAIN}/api/2023-10/graphql.json`;


// Controller for user registration (create customer)
exports.createUser = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  const trimmedPassword = password.substring(0, 40);

  const customerCreateMutation = `
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

  const input = { email, password: trimmedPassword, firstName, lastName };

  try {
    const response = await axios.post(
      shopifyStorefrontEndpoint,
      {
        query: customerCreateMutation,
        variables: { input },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': process.env.STOREFRONT_ACCESS_TOKEN,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    // console.error('Error creating customer:', error.response.data);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller for user loginsuman
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const loginMutation = `
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
      shopifyStorefrontEndpoint,
      {
        query: loginMutation,
        variables: {
          input: {
            email,
            password,
          },
        },
      },
      {
        headers: {
          'X-Shopify-Storefront-Access-Token': process.env.STOREFRONT_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    const responseData = response.data.data.customerAccessTokenCreate;

    if (responseData && responseData.customerAccessToken) {
      const accessToken = responseData.customerAccessToken.accessToken;
      // console.log('Login successful');
      res.json({ accessToken });
    } else {
      // console.log('Error during login: Invalid data in response');
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    // console.error('Error during login:', error.response?.data || error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Controller for getting customer details
exports.getCustomerDetails = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const headers = {
      'X-Shopify-Storefront-Access-Token': process.env.STOREFRONT_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    };

    const query = `
      query getCustomerDetails($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          id
          firstName
          lastName
          acceptsMarketing
          email
          phone
        }
      }
    `;

    const variables = { customerAccessToken: accessToken };

    const response = await axios.post(
      shopifyStorefrontEndpoint,
      { query, variables },
      { headers }
    );

    res.json(response.data.data.customer);
   
  } catch (error) {
    // console.error('Error fetching customer details:', error.response?.data || error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getCustomerOrders = async (req, res) => {
  try {
    const { accessToken } = req.body;

    const headers = {
      'X-Shopify-Storefront-Access-Token': process.env.STOREFRONT_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    };

    const variables = { customerAccessToken: accessToken };

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
      shopifyStorefrontEndpoint,
      { query, variables },
      { headers }
    );

    // console.log('Server Response:', response.data);

    const responseData = response.data.data;
    if (!responseData || !responseData.customer) {
      // console.error('Invalid response format or missing "customer" property');
      // console.log('Response Data:', responseData);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const customerData = responseData.customer;

    const orders = customerData.orders?.edges?.map((edge) => edge.node) || [];

    res.json({ orders });
  } catch (error) {
    // console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getCollection = async (req, res) => {
  const { collectionId } = req.body;
  if (!collectionId) {
    return res.status(400).json({ error: 'Collection ID is required' });
  }

  try {
    const response = await axios.post(
      shopifyStorefrontEndpoint,
      {
        query: `query getCollection($collectionId: ID!, $first: Int) {
          collection(id: $collectionId) {
            id
            title
            products(first: $first) {
              edges {
                node {
                  id
                  title
                  description 
                  
                  variants(first: 1) {
                    edges {
                      node {
                        priceV2 {
                          amount
                          currencyCode
                        } 
                        compareAtPriceV2 {
                          amount
                          currencyCode
                        } 
                        
                      }
                    }
                  }
                  images(first: 4) { 
                    edges {
                      node {
                        id
                        originalSrc
                      }
                    }
                  }
                  
                }
              }
            }
          }
        }`,
        variables: {
          collectionId: collectionId,
          first: 20, // Adjust the number of products to fetch as needed
        },
      },
      {
        headers: {
          'X-Shopify-Storefront-Access-Token': process.env.STOREFRONT_ACCESS_TOKEN,
        },
      }
    );

    const collection = response?.data?.data?.collection || null;

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const products = collection.products?.edges || [];

    // Extract 'id', 'title', 'price', 'currencyCode', and 'images' properties for each product with additional checks
    const formattedProducts = await Promise.all(products.map(async (edge) => {
      const variants = edge?.node?.variants?.edges || [];
      const priceV2 = variants[0]?.node?.priceV2 || {};
      const compareAtPriceV2 = variants[0]?.node?.compareAtPriceV2 || {};
      const description = edge?.node?.description || 'No Description';

      const images = edge?.node?.images?.edges || [];
      const formattedImages = images.slice(0, 4).map((image) => ({
        id: image?.node?.id || null,
        originalSrc: image?.node?.originalSrc || null,
      }));

      return {
        id: edge?.node?.id || null,
        title: edge?.node?.title || 'Unknown Title',
        description: description,
        price: priceV2?.amount || null,
        compareAtPrice: compareAtPriceV2?.amount || null,
        currencyCode: priceV2?.currencyCode || null,
        images: formattedImages,
      };
    }));

    res.json(formattedProducts);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.searchProduct = async (req, res) => {
  const { query } = req.body;

  const currentTime = Date.now();
  const elapsedTime = currentTime - lastRequestTime;

  if (elapsedTime < THROTTLE_DELAY) {
    // Delay the request to respect the throttle limit
    const delayTime = THROTTLE_DELAY - elapsedTime;
    await new Promise((resolve) => setTimeout(resolve, delayTime));
  }

  try {
    const response = await axios.post(
      shopifyStorefrontEndpoint,
      {
        query: `query searchProducts($query: String!, $first: Int) {
          search(query: $query, first: $first, types: PRODUCT) {
            edges {
              node {
                ... on Product {
                  id
                  title
                  description 
                  variants(first: 1) {
                    edges {
                      node {
                        priceV2 {
                          amount
                          currencyCode
                        }
                        compareAtPriceV2{
                          amount
                          currencyCode
                        } 
                      }
                    }
                  }
                  images(first: 10) {
                    edges {
                      node {
                        id
                        originalSrc
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
        variables: {
          query: query,
          first: 5, // Adjust the number of products to fetch as needed
        },
      },
      {
        headers: {
          'X-Shopify-Storefront-Access-Token': process.env.STOREFRONT_ACCESS_TOKEN,
        },
      }
    );

    lastRequestTime = Date.now();

    const products = response?.data?.data?.search?.edges || [];

    // Extract 'id', 'title', 'price', 'currencyCode', and 'images' properties for each product with additional checks
    const formattedProducts = products.map((edge) => {
      const variants = edge?.node?.variants?.edges || [];
      const priceV2 = variants[0]?.node?.priceV2 || {};
      const compareAtPriceV2 = variants[0]?.node?.compareAtPriceV2 || {};
      const images = edge?.node?.images?.edges || [];
      const description = edge?.node?.description || 'No Description';
      const formattedImages = images.map((image) => ({
        id: image?.node?.id || null,
        originalSrc: image?.node?.originalSrc || null,
      }));

      return {
        id: edge?.node?.id || null,
        title: edge?.node?.title || 'Unknown Title',
        price: priceV2?.amount || null,
        compareAtPrice: compareAtPriceV2?.amount || null,
        description: description,
        currencyCode: priceV2?.currencyCode || null,
        images: formattedImages,
      };
    });

    res.json(formattedProducts);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const response = await axios.post(
      shopifyStorefrontEndpoint,
      {
        query: `
          query getAllProducts($first: Int) {
            products(first: $first) {
              edges {
                node {
                  id
                  title
                  description 
                  variants(first: 1) {
                    edges {
                      node {
                        priceV2 {
                          amount
                          currencyCode
                        } 
                        compareAtPriceV2 {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                  images(first: 10) {
                    edges {
                      node {
                        id
                        originalSrc
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          first: 20,
        },
      },
      {
        headers: {
          'X-Shopify-Storefront-Access-Token': process.env.STOREFRONT_ACCESS_TOKEN,
        },
      }
    );

    const products = response?.data?.data?.products?.edges || [];

    const formattedProducts = products.map((edge) => {
      const variants = edge?.node?.variants?.edges || [];
      const priceV2 = variants[0]?.node?.priceV2 || {};
      const compareAtPriceV2 = variants[0]?.node?.compareAtPriceV2 || {};
      const description = edge?.node?.description || 'No Description';
      const images = edge?.node?.images?.edges || [];
      const formattedImages = images.map((image) => ({
        id: image?.node?.id || null,
        originalSrc: image?.node?.originalSrc || null,
      }));

      return {
        id: edge?.node?.id || null,
        title: edge?.node?.title || 'Unknown Title',
        description: description,
        price: priceV2?.amount || null,
        compareAtPrice: compareAtPriceV2?.amount || null,
        currencyCode: priceV2?.currencyCode || null,
        images: formattedImages,
      };
    });

    res.json(formattedProducts);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};







