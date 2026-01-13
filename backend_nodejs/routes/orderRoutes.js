const express = require('express');
const router = express.Router();

const {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  trackOrder,
  getAllOrders,
  getOrderTracking,
  updateOrderTracking,
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *               - paymentInfo
 *             properties:
 *               shippingAddress:
 *                 type: object
 *               paymentInfo:
 *                 type: object
 *     responses:
 *       201:
 *         description: Order created
 *       400:
 *         description: Cart is empty
 */
router.post('/', protect, createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get('/', protect, getUserOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get single order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order data
 *       404:
 *         description: Order not found
 */
router.get('/:id', protect, getOrder);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.put('/:id/cancel', protect, cancelOrder);

/**
 * @swagger
 * /api/orders/{id}/track:
 *   get:
 *     summary: Track an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order tracking info
 */
router.get('/:id/track', protect, trackOrder);

/**
 * @swagger
 * /api/orders/{id}/tracking:
 *   get:
 *     summary: Get order delivery tracking
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery tracking info
 */
router.get('/:id/tracking', protect, getOrderTracking);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}/tracking:
 *   patch:
 *     summary: Update delivery tracking (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryStatus
 *             properties:
 *               deliveryStatus:
 *                 type: string
 *                 enum: [Pending, Processing, Shipped, Out for Delivery, Delivered]
 *     responses:
 *       200:
 *         description: Delivery status updated
 */
router.patch('/:id/tracking', protect, authorize('admin'), updateOrderTracking);

/**
 * @swagger
 * /api/orders/admin/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get('/admin/all', protect, authorize('admin'), getAllOrders);

module.exports = router;
