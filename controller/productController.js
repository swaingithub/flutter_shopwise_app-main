const { fetchCollection, fetchCollectionByHandle, searchProducts, fetchAllProducts, fetchAllCollections } = require('../services/productService');

// POST /get-collections
exports.getCollections = async (req, res) => {
  try {
    const collections = await fetchAllCollections();
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /get-collection
exports.getCollection = async (req, res) => {
  const { collectionId, handle } = req.body;
  
  if (!collectionId && !handle) {
    return res.status(400).json({ error: 'Collection ID or Handle is required' });
  }

  try {
    let products;
    if (collectionId) {
      products = await fetchCollection(collectionId);
    } else {
      products = await fetchCollectionByHandle(handle);
    }
    res.json(products);
  } catch (error) {
    if (error.message === 'Collection not found') {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /search-products
exports.searchProduct = async (req, res) => {
  const { query } = req.body;
  try {
    const products = await searchProducts(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /get-products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await fetchAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
