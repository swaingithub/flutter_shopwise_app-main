require('dotenv').config();

const shopifyEndpoint = `https://${process.env.SHOP_DOMAIN}/api/2023-10/graphql.json`;

const shopifyHeaders = {
  'Content-Type': 'application/json',
  'X-Shopify-Storefront-Access-Token': process.env.STOREFRONT_ACCESS_TOKEN,
};

module.exports = { shopifyEndpoint, shopifyHeaders };
