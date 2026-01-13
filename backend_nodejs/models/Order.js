const mongoose = require('mongoose');

// Order Item Schema
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
});

// Shipping Address Schema
const shippingAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

// Payment Info Schema
const paymentInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery', 'bank_transfer'],
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  paidAt: {
    type: Date,
  },
});

// Order Schema
const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentInfo: paymentInfoSchema,
    taxAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'processing',
        'confirmed',
        'shipped',
        'delivered',
        'cancelled',
        'returned',
        'refunded'
      ],
      default: 'pending',
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot be more than 500 characters'],
    },
    trackingNumber: {
      type: String,
    },
    estimatedDelivery: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
    deliveryStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'],
      default: 'Pending',
    },
    deliveryUpdates: [{
      status: {
        type: String,
        required: true,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ orderNumber: 1 });

// Generate unique order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  
  // Initialize deliveryUpdates if new order
  if (this.isNew && this.deliveryUpdates.length === 0) {
    this.deliveryUpdates.push({
      status: this.deliveryStatus || 'Pending',
      updatedAt: new Date(),
    });
  }
  
  next();
});

// Pre-save middleware to calculate total amount
orderSchema.pre('save', function(next) {
  if (this.isModified('orderItems') || this.isNew) {
    const itemsTotal = this.orderItems.reduce((total, item) => total + item.totalPrice, 0);
    this.totalAmount = itemsTotal + this.taxAmount + this.shippingAmount - this.discountAmount;
  }
  next();
});

// Static method to get user's orders
orderSchema.statics.getUserOrders = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images');
};

// Instance method to update order status
orderSchema.methods.updateStatus = function(newStatus, additionalInfo = {}) {
  this.orderStatus = newStatus;

  // Update specific fields based on status
  switch (newStatus) {
    case 'delivered':
      this.deliveredAt = new Date();
      this.paymentInfo.status = 'completed';
      this.paymentInfo.paidAt = this.paymentInfo.paidAt || new Date();
      break;
    case 'cancelled':
      this.cancelledAt = new Date();
      this.cancellationReason = additionalInfo.reason || 'Order cancelled by user';
      break;
    case 'shipped':
      this.trackingNumber = additionalInfo.trackingNumber;
      this.estimatedDelivery = additionalInfo.estimatedDelivery;
      break;
  }

  return this.save();
};

// Instance method to get order summary
orderSchema.methods.getOrderSummary = function() {
  return {
    orderId: this._id,
    orderNumber: this.orderNumber,
    orderStatus: this.orderStatus,
    totalItems: this.orderItems.length,
    totalAmount: this.totalAmount,
    createdAt: this.createdAt,
    estimatedDelivery: this.estimatedDelivery,
    trackingNumber: this.trackingNumber,
  };
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
      },
    },
  ]);

  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      totalAmount: stat.totalAmount,
    };
    return acc;
  }, {});
};

module.exports = mongoose.model('Order', orderSchema);
