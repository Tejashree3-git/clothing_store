const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { logger } = require('../config/logger');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentInfo,
      notes
    } = req.body;

    // Validation
    if (!shippingAddress || !paymentInfo) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address and payment info are required',
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name images price inStock sizes',
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    // Check stock availability for all items
    const stockIssues = [];
    let totalAmount = 0;
    let taxAmount = 0;
    let shippingAmount = 0;

    // Build order items
    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product._id);

      if (!product || !product.inStock) {
        stockIssues.push(`${cartItem.name} is out of stock`);
        continue;
      }

      const sizeOption = product.sizes.find(s => s.size === cartItem.size);
      if (!sizeOption || sizeOption.stock < cartItem.quantity) {
        stockIssues.push(`Only ${sizeOption?.stock || 0} ${cartItem.size} size available for ${cartItem.name}`);
        continue;
      }

      orderItems.push({
        product: cartItem.product._id,
        name: cartItem.name,
        image: cartItem.image,
        price: cartItem.price,
        size: cartItem.size,
        color: cartItem.color,
        quantity: cartItem.quantity,
        totalPrice: cartItem.totalPrice,
      });

      totalAmount += cartItem.totalPrice;

      // Update stock
      sizeOption.stock -= cartItem.quantity;
      await product.save();
    }

    if (stockIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some items are no longer available',
        issues: stockIssues,
      });
    }

    // Calculate totals (you can customize these calculations)
    const subtotal = totalAmount;
    taxAmount = Math.round(subtotal * 0.1); // 10% tax
    shippingAmount = subtotal > 100 ? 0 : 10; // Free shipping over $100
    totalAmount = subtotal + taxAmount + shippingAmount;

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentInfo: {
        ...paymentInfo,
        transactionId,
      },
      taxAmount,
      shippingAmount,
      totalAmount,
      notes,
    });

    // Clear user's cart
    await cart.clearCart();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        orderStatus: order.orderStatus,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order',
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const orders = await Order.getUserOrders(req.user._id, page, limit);

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
      },
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving orders',
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: 'user',
      select: 'name email',
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if order belongs to user or user is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving order',
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, estimatedDelivery, reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const additionalInfo = {};
    if (trackingNumber) additionalInfo.trackingNumber = trackingNumber;
    if (estimatedDelivery) additionalInfo.estimatedDelivery = new Date(estimatedDelivery);
    if (reason) additionalInfo.reason = reason;

    try {
      await order.updateStatus(status, additionalInfo);

      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        order: order.getOrderSummary(),
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
      message: 'Server error updating order status',
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Only allow cancellation of pending or processing orders
    if (!['pending', 'processing'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage',
      });
    }

    // Restore stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.updateSizeStock(item.size, -item.quantity);
        await product.save();
      }
    }

    await order.updateStatus('cancelled', { reason });

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: order.getOrderSummary(),
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling order',
    });
  }
};

// @desc    Get order tracking info
// @route   GET /api/orders/:id/track
// @access  Private
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select(
      'orderNumber orderStatus trackingNumber estimatedDelivery deliveredAt createdAt'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Create tracking timeline
    const timeline = [
      {
        status: 'pending',
        message: 'Order placed',
        timestamp: order.createdAt,
        completed: true,
      },
      {
        status: 'processing',
        message: 'Order is being processed',
        timestamp: null,
        completed: ['processing', 'confirmed', 'shipped', 'delivered'].includes(order.orderStatus),
      },
      {
        status: 'confirmed',
        message: 'Order confirmed',
        timestamp: null,
        completed: ['confirmed', 'shipped', 'delivered'].includes(order.orderStatus),
      },
      {
        status: 'shipped',
        message: 'Order shipped',
        timestamp: null,
        completed: ['shipped', 'delivered'].includes(order.orderStatus),
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
      },
      {
        status: 'delivered',
        message: 'Order delivered',
        timestamp: order.deliveredAt,
        completed: order.orderStatus === 'delivered',
      },
    ];

    res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        currentStatus: order.orderStatus,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        deliveredAt: order.deliveredAt,
      },
      timeline,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error tracking order',
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const status = req.query.status;

    let filter = {};
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email');

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
      },
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving all orders',
    });
  }
};

// @desc    Get order tracking info
// @route   GET /api/orders/:id/tracking
// @access  Private
const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select('user deliveryStatus deliveryUpdates orderNumber');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if order belongs to user or user is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        deliveryStatus: order.deliveryStatus,
        deliveryUpdates: order.deliveryUpdates,
      },
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving order tracking',
    });
  }
};

// @desc    Update order delivery tracking
// @route   PATCH /api/orders/:id/tracking
// @access  Private (Admin only)
const updateOrderTracking = async (req, res) => {
  try {
    const { deliveryStatus } = req.body;

    // Validation
    if (!deliveryStatus) {
      return res.status(400).json({
        success: false,
        message: 'deliveryStatus is required',
      });
    }

    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    if (!allowedStatuses.includes(deliveryStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid deliveryStatus. Must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update delivery status
    order.deliveryStatus = deliveryStatus;

    // Push update to deliveryUpdates array
    order.deliveryUpdates.push({
      status: deliveryStatus,
      updatedAt: new Date(),
    });

    await order.save();

    res.json({
      success: true,
      message: 'Delivery status updated successfully',
      order: {
        orderNumber: order.orderNumber,
        deliveryStatus: order.deliveryStatus,
        deliveryUpdates: order.deliveryUpdates,
      },
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order tracking',
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  trackOrder,
  getAllOrders,
  getOrderTracking,
  updateOrderTracking,
};
