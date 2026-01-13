const mongoose = require('mongoose');

// Product Schema for Clothing Store
const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: {
        values: [
          'Shirts',
          'T-Shirts',
          'Pants',
          'Jeans',
          'Dresses',
          'Skirts',
          'Jackets',
          'Sweaters',
          'Shoes',
          'Accessories',
          'Bags',
          'Underwear',
        ],
        message: 'Please select a valid category',
      },
    },
    subcategory: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    sizes: [{
      size: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'EU35', 'EU36', 'EU37', 'EU38', 'EU39', 'EU40', 'EU41', 'EU42', 'EU43', 'EU44', 'EU45'],
        required: true,
      },
      stock: {
        type: Number,
        required: true,
        min: [0, 'Stock cannot be negative'],
        default: 0,
      },
    }],
    colors: [String],
    material: {
      type: String,
      trim: true,
    },
    images: [
      {
        public_id: String,
        url: String,
        alt: String,
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    tags: [String],
    gender: {
      type: String,
      enum: ['Men', 'Women', 'Unisex', 'Kids'],
      default: 'Unisex',
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be above 0'],
      max: [5, 'Rating must not be above 5'],
      set: val => Math.round(val * 10) / 10, // Round to 1 decimal place
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
productSchema.index({ category: 1, price: 1, rating: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for calculating average rating
productSchema.virtual('averageRating').get(function() {
  return this.rating;
});

// Instance method to calculate total stock
productSchema.methods.getTotalStock = function() {
  return this.sizes.reduce((total, size) => total + size.stock, 0);
};

// Instance method to update stock for a size
productSchema.methods.updateSizeStock = function(sizeToUpdate, quantity) {
  const sizeIndex = this.sizes.findIndex(size => size.size === sizeToUpdate);
  if (sizeIndex !== -1) {
    this.sizes[sizeIndex].stock -= quantity;
    if (this.sizes[sizeIndex].stock < 0) {
      this.sizes[sizeIndex].stock = 0;
    }
  }
};

// Static method to get products by category with filters
productSchema.statics.getProductsByFilters = function(filters) {
  const query = {};

  if (filters.category) query.category = filters.category;
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = filters.minPrice;
    if (filters.maxPrice) query.price.$lte = filters.maxPrice;
  }
  if (filters.size) query['sizes.size'] = filters.size;
  if (filters.color) query.colors = filters.color;
  if (filters.gender) query.gender = filters.gender;
  if (filters.brand) query.brand = filters.brand;
  if (filters.inStock !== undefined) query.inStock = filters.inStock;

  return this.find(query);
};

module.exports = mongoose.model('Product', productSchema);
