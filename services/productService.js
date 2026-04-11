const axios = require('axios');
const { shopifyEndpoint, shopifyHeaders } = require('../config/shopify');

const THROTTLE_DELAY = 3000;
let lastRequestTime = 0;

// Helper: format raw product edges into a clean shape
function formatProduct(node) {
  const variants = node?.variants?.edges || [];
  const priceV2 = variants[0]?.node?.priceV2 || {};
  const compareAtPriceV2 = variants[0]?.node?.compareAtPriceV2 || {};
  const images = (node?.images?.edges || []).map((img) => ({
    id: img?.node?.id || null,
    originalSrc: img?.node?.originalSrc || null,
  }));
  const tags = node?.tags || [];

  return {
    id: node?.id || null,
    title: node?.title || 'Unknown Title',
    handle: node?.handle || '',
    description: node?.description || 'No Description',
    price: priceV2?.amount || null,
    compareAtPrice: compareAtPriceV2?.amount || null,
    currencyCode: priceV2?.currencyCode || null,
    images,
    tags,
    isFeatured: tags.includes('trending') || tags.includes('featured') || tags.length > 0,
  };
}

// Fetch products from a specific collection
async function fetchCollection(collectionId, first = 20) {
  const query = `
    query getCollection($collectionId: ID!, $first: Int) {
      collection(id: $collectionId) {
        id
        title
        products(first: $first) {
          edges {
            node {
              id
              title
              description
              tags
              variants(first: 1) {
                edges {
                  node {
                    priceV2 { amount currencyCode }
                    compareAtPriceV2 { amount currencyCode }
                  }
                }
              }
              images(first: 4) {
                edges {
                  node { id originalSrc }
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
    { query, variables: { collectionId, first } },
    { headers: shopifyHeaders }
  );

  const collection = response?.data?.data?.collection;
  if (!collection) throw new Error('Collection not found');

  return collection.products?.edges?.map((edge) => formatProduct(edge.node)) || [];
}

// Search for products by query string (throttled)
async function searchProducts(searchQuery, first = 5) {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < THROTTLE_DELAY) {
    await new Promise((resolve) => setTimeout(resolve, THROTTLE_DELAY - elapsed));
  }

  const query = `
    query searchProducts($query: String!, $first: Int) {
      search(query: $query, first: $first, types: PRODUCT) {
        edges {
          node {
            ... on Product {
              id
              title
              handle
              description
              tags
              variants(first: 1) {
                edges {
                  node {
                    priceV2 { amount currencyCode }
                    compareAtPriceV2 { amount currencyCode }
                  }
                }
              }
              images(first: 10) {
                edges {
                  node { id originalSrc }
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
    { query, variables: { query: searchQuery, first } },
    { headers: shopifyHeaders }
  );

  lastRequestTime = Date.now();

  return (response?.data?.data?.search?.edges || []).map((edge) =>
    formatProduct(edge.node)
  );
}

// Fetch all products (paginated)
async function fetchAllProducts(first = 20) {
  const query = `
    query getAllProducts($first: Int) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            tags
            variants(first: 1) {
              edges {
                node {
                  priceV2 { amount currencyCode }
                  compareAtPriceV2 { amount currencyCode }
                }
              }
            }
            images(first: 10) {
              edges {
                node { id originalSrc }
              }
            }
          }
        }
      }
    }
  `;

  const response = await axios.post(
    shopifyEndpoint,
    { query, variables: { first } },
    { headers: shopifyHeaders }
  );

  return (response?.data?.data?.products?.edges || []).map((edge) =>
    formatProduct(edge.node)
  );
}

// Fetch all collections
async function fetchAllCollections(first = 20) {
  const query = `
    query getCollections($first: Int) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              originalSrc
            }
          }
        }
      }
    }
  `;

  const response = await axios.post(
    shopifyEndpoint,
    { query, variables: { first } },
    { headers: shopifyHeaders }
  );

  return (response?.data?.data?.collections?.edges || []).map((edge) => ({
    id: edge.node.id,
    title: edge.node.title,
    handle: edge.node.handle,
    description: edge.node.description,
    imageUrl: edge.node.image?.originalSrc || null,
  }));
}

// Fetch products from a specific collection by its handle
async function fetchCollectionByHandle(handle, first = 20) {
  const query = `
    query getCollectionByHandle($handle: String!, $first: Int) {
      collection(handle: $handle) {
        id
        title
        products(first: $first) {
          edges {
            node {
              id
              title
              description
              tags
              variants(first: 1) {
                edges {
                  node {
                    priceV2 { amount currencyCode }
                    compareAtPriceV2 { amount currencyCode }
                  }
                }
              }
              images(first: 4) {
                edges {
                  node { id originalSrc }
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
    { query, variables: { handle, first } },
    { headers: shopifyHeaders }
  );

  const collection = response?.data?.data?.collection;
  if (!collection) throw new Error('Collection not found');

  return collection.products?.edges?.map((edge) => formatProduct(edge.node)) || [];
}

module.exports = { 
  fetchCollection, 
  fetchCollectionByHandle,
  searchProducts, 
  fetchAllProducts, 
  fetchAllCollections 
};
