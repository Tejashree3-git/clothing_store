const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { logger } = require('../config/logger');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name images price inStock sizes',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json({
      success: true,
      cart: cart.getCartSummary(),
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving cart',
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const { productId, size, color, quantity = 1 } = req.body;

    // Validation
    if (!productId || !size || !color) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productId, size, and color',
      });
    }

    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 10',
      });
    }

    // Check if product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (!product.inStock) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock',
      });
    }

    // Check if selected size exists and has stock
    const sizeOption = product.sizes.find(s => s.size === size);
    if (!sizeOption) {
      return res.status(400).json({
        success: false,
        message: `Size ${size} not available for this product`,
      });
    }

    if (sizeOption.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${sizeOption.stock} items available for size ${size}`,
      });
    }

    // Check if selected color is available
    if (!product.colors.includes(color)) {
      return res.status(400).json({
        success: false,
        message: `Color ${color} not available for this product`,
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Add item to cart
    try {
      await cart.addItem(product, size, color, quantity);
      await cart.populate({
        path: 'items.product',
        select: 'name images price inStock sizes',
      });

      res.json({
        success: true,
        message: 'Item added to cart successfully',
        cart: cart.getCartSummary(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error adding item to cart',
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 0 || quantity > 10) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 0 and 10',
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    try {
      await cart.updateItemQuantity(req.params.itemId, quantity);
      await cart.populate({
        path: 'items.product',
        select: 'name images price inStock sizes',
      });

      res.json({
        success: true,
        message: 'Cart item updated successfully',
        cart: cart.getCartSummary(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error updating cart item',
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    try {
      await cart.removeItem(req.params.itemId);
      await cart.populate({
        path: 'items.product',
        select: 'name images price inStock sizes',
      });

      res.json({
        success: true,
        message: 'Item removed from cart successfully',
        cart: cart.getCartSummary(),
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error removing item from cart',
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: cart.getCartSummary(),
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error clearing cart',
    });
  }
};

// @desc    Get cart item count
// @route   GET /api/cart/count
// @access  Private
const getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    const count = cart ? cart.items.length : 0;

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error getting cart count',
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
};
