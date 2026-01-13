const mongoose = require('mongoose');

// Cart Item Schema
const cartItemSchema = new mongoose.Schema({
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
    min: [1, 'Quantity must be at least 1'],
    max: [10, 'Quantity cannot exceed 10'],
  },
  totalPrice: {
    type: Number,
    required: true,
  },
});

// Cart Schema
const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
cartSchema.index({ user: 1 });

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.length;
  this.totalAmount = this.items.reduce((total, item) => total + item.totalPrice, 0);
  next();
});

// Instance method to add item to cart
cartSchema.methods.addItem = function(product, size, color, quantity = 1) {
  // Check if item already exists in cart (same product, size, color)
  const existingItem = this.items.find(
    item => item.product.toString() === product._id.toString() &&
             item.size === size &&
             item.color === color
  );

  if (existingItem) {
    // Update quantity and total price
    existingItem.quantity += quantity;
    existingItem.totalPrice = existingItem.price * existingItem.quantity;
  } else {
    // Add new item
    const newItem = {
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.price,
      size,
      color,
      quantity,
      totalPrice: product.price * quantity,
    };
    this.items.push(newItem);
  }
  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (!item) {
    throw new Error('Cart item not found');
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    this.items.pull(itemId);
  } else {
    item.quantity = quantity;
    item.totalPrice = item.price * quantity;
  }

  return this.save();
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = function(itemId) {
  this.items.pull(itemId);
  return this.save();
};

// Instance method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.totalItems = 0;
  this.totalAmount = 0;
  return this.save();
};

// Instance method to get cart summary
cartSchema.methods.getCartSummary = function() {
  return {
    items: this.items,
    totalItems: this.totalItems,
    totalAmount: this.totalAmount,
    itemCount: this.items.length,
  };
};

module.exports = mongoose.model('Cart', cartSchema);
