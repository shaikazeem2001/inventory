const Product = require('../models/Product');
const ActivityLog = require('../models/ActivityLog');
const sendEmail = require('../utils/sendEmail');

// @desc    Get products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { keyword, category, sort, page = 1, limit = 10 } = req.query;
    const query = {};

    // Search by name
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: Newest
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'quantity_asc') sortOption = { quantity: 1 };
    if (sort === 'quantity_desc') sortOption = { quantity: -1 };

    // Pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sortOption)
      .limit(Number(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      products,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const { name, category, description, price, quantity, sku, imageUrl } = req.body;

    // Check if SKU exists
    const skuExists = await Product.findOne({ sku });
    if (skuExists) {
      return res.status(400).json({ message: 'SKU already exists' });
    }

    const product = await Product.create({
      name,
      category,
      description,
      price,
      quantity,
      sku,
      imageUrl,
    });

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'CREATE_PRODUCT',
      details: `Created product: ${product.name} (${product.sku})`,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'UPDATE_PRODUCT',
      details: `Updated product: ${updatedProduct.name} (${updatedProduct.sku})`,
    });

    // Check for low stock
    if (updatedProduct.quantity < 10) {
      try {
        await sendEmail({
          email: process.env.FROM_EMAIL, // Send to admin (self)
          subject: `Low Stock Alert: ${updatedProduct.name}`,
          message: `The product "${updatedProduct.name}" (SKU: ${updatedProduct.sku}) is running low on stock. Current quantity: ${updatedProduct.quantity}.`,
        });
      } catch (error) {
        console.error('Email send failed:', error);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'DELETE_PRODUCT',
      details: `Deleted product: ${product.name} (${product.sku})`,
    });

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
