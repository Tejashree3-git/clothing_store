const fs = require('fs');
const path = require('path');

// Load environment variables from backend_nodejs/.env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');

// Import models
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Import database connection
const connectDB = require('../config/db');

// Map JSON format to Mongoose schema
function mapProductToSchema(productJson) {
  try {
    // Default values for required fields
    const defaultValues = {
      price: Math.floor(Math.random() * 500) + 99, // Random price between 100-599
      stock: Math.floor(Math.random() * 50) + 10,  // Random stock between 10-60
      sizes: ['S', 'M', 'L', 'XL'], // Default sizes with XL added
      gender: 'Unisex', // Default gender
      brand: 'Generic' // Default brand
    };

    // Truncate and clean name
    const name = (productJson['display name'] || 'Unnamed Product').substring(0, 50).trim();
    
    // Truncate and clean description
    const description = (productJson.description || 'No description available')
      .substring(0, 1000)
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    // Ensure price is a number and has a reasonable value
    const price = Math.max(10, Math.min(9999, Number(productJson.price) || defaultValues.price));
    
    // Category mapping with more comprehensive list
    const categoryMap = {
      'Shirt': 'Shirts',
      'T-Shirt': 'T-Shirts',
      'Tshirt': 'T-Shirts',
      'Top': 'T-Shirts',
      'Jeans': 'Jeans',
      'Pant': 'Pants',
      'Trouser': 'Pants',
      'Dress': 'Dresses',
      'Kurta': 'Dresses',
      'Skirt': 'Dresses',
      'Jacket': 'Jackets',
      'Sweater': 'Sweaters',
      'Hoodie': 'Sweaters',
      'Shoe': 'Shoes',
      'Sport': 'Shoes',
      'Heel': 'Shoes',
      'Accessory': 'Accessories',
      'Sunglass': 'Accessories',
      'Watch': 'Accessories',
      'Belt': 'Accessories',
      'Sock': 'Accessories',
      'Bag': 'Bags',
      'Underwear': 'Underwear',
      'Bra': 'Underwear'
    };

    // Clean and map the category
    const cleanCategory = (productJson.category || 'Clothing').trim();
    const mappedCategory = Object.entries(categoryMap).find(([key]) => 
      cleanCategory.toLowerCase().includes(key.toLowerCase())
    )?.[1] || 'Clothing';

    // Get brand from product name or use default
    const brand = (productJson.brand || name.split(' ')[0] || defaultValues.brand)
      .substring(0, 30)
      .trim();
      
    const gender = defaultValues.gender; // Default to Unisex
  
  // Process sizes with random stock distribution
  const sizes = defaultValues.sizes.map(size => ({
    size: size,
    stock: Math.floor((defaultValues.stock / defaultValues.sizes.length) * (0.8 + Math.random() * 0.4)) // Random stock within 80-120% of average
  }));

  // Process images - handle both single image string and array of images
  const images = [];
  const processImageUrl = (img) => {
    if (!img) return null;
    // If it's already a full URL or starts with /uploads, use as is
    if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('/uploads'))) {
      return img;
    }
    // Otherwise, assume it's a filename and prepend uploads path
    return `/uploads/products/${img}`;
  };

  // Handle single image or array of images
  if (Array.isArray(productJson.images)) {
    productJson.images.slice(0, 5).forEach((img, index) => {
      const imgUrl = processImageUrl(img);
      if (imgUrl) {
        images.push({
          url: imgUrl,
          alt: `${name} - Image ${index + 1}`,
          isPrimary: index === 0
        });
      }
    });
  } else if (productJson.image) {
    const imgUrl = processImageUrl(productJson.image);
    if (imgUrl) {
      images.push({
        url: imgUrl,
        alt: name,
        isPrimary: true
      });
    }
  }

  // Add a placeholder if no images were added
  if (images.length === 0) {
    images.push({
      url: '/uploads/placeholder.jpg',
      alt: 'No image available for ' + name,
      isPrimary: true
    });
  }


  // Generate random but realistic product data
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1); // 3.5 - 5.0
  const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Gray', 'Navy', 'Beige'];
  const selectedColors = [];
  
  // Select 1-3 random colors
  const numColors = Math.min(3, Math.max(1, Math.floor(Math.random() * 4)));
  while (selectedColors.length < numColors) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    if (!selectedColors.includes(color)) {
      selectedColors.push(color);
    }
  }

  // Add some products with discounts (about 30% of products)
  const hasDiscount = Math.random() < 0.3;
  const originalPrice = hasDiscount 
    ? Math.ceil(price * (1.1 + Math.random() * 0.4)) // 10-50% more than price
    : null;

  return {
    name: name,
    description: description,
    price: price,
    originalPrice: originalPrice,
    category: mappedCategory,
    gender: gender,
    sizes: sizes,
    colors: selectedColors,
    images: images,
    rating: parseFloat(rating),
    inStock: Math.random() > 0.1, // 90% chance of being in stock
    numReviews: Math.floor(Math.random() * 50),
    brand: brand,
    featured: Math.random() < 0.2, // 20% chance of being featured
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 90)), // Random date in last 90 days
    updatedAt: new Date()
  };
  } catch (error) {
    console.error('Error processing product:', {
      name: productJson['display name'],
      error: error.message
    });
    // Instead of skipping, return a minimal valid product to prevent skipping
    return {
      name: (productJson['display name'] || 'Unnamed Product').substring(0, 50).trim(),
      description: (productJson.description || 'No description available').substring(0, 1000).trim(),
      price: 99,
      originalPrice: null,
      category: 'Clothing',
      gender: 'Unisex',
      sizes: [{ size: 'M', stock: 10 }],
      colors: ['Black'],
      images: [{ url: '/uploads/placeholder.jpg', alt: 'No image available', isPrimary: true }],
      rating: 4.0,
      inStock: true,
      numReviews: 0,
      brand: 'Generic',
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

// Main seeding function
async function seedProducts() {
  let insertedCount = 0;
  let updatedCount = 0;

  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await connectDB();

    // Read products.json
    const productsPath = path.join(__dirname, 'products.json');
    console.log(`Reading products from ${productsPath}...`);
    
    if (!fs.existsSync(productsPath)) {
      throw new Error(`Products file not found at ${productsPath}`);
    }

    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    console.log(`Found ${productsData.length} products to process...\n`);

    // Don't clear existing products, we'll update them
    console.log('Preparing to update existing products...');

    // Process products in batches to avoid memory issues
    const batchSize = 50;
    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;

    console.log('Processing products...');
    
    // Process products in batches
    for (let i = 0; i < productsData.length; i += batchSize) {
      const batch = productsData.slice(i, i + batchSize);
      const productPromises = [];
      
      for (const productJson of batch) {
        processedCount++;
        
        try {
          const productData = mapProductToSchema(productJson);
          if (!productData) continue;
          
          // Try to find existing product by name or create new one
          const existingProduct = await Product.findOneAndUpdate(
            { name: productData.name },
            { $set: productData },
            { upsert: true, new: true, runValidators: true }
          );
          
          if (existingProduct) {
            updatedCount++;
          } else {
            createdCount++;
          }
          
          // Update progress
          if (processedCount % 10 === 0 || processedCount === productsData.length) {
            process.stdout.write(`\rProcessed: ${processedCount}/${productsData.length} | ` +
                              `Created: ${createdCount} | ` +
                              `Updated: ${updatedCount}`);
          }
        } catch (error) {
          console.error(`\nError processing product at index ${i}:`, error.message);
          skippedProducts++;
        }
      }
      
      // Wait for batch to complete
      await Promise.all(productPromises);
    }

    console.log('\n\n✅ Product seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Processed: ${processedCount} products`);
    console.log(`   - Created: ${createdCount} new products`);
    console.log(`   - Updated: ${updatedCount} existing products`);
    console.log(`   - Total in database: ${await Product.countDocuments()}`);

    // Seed sample orders if we have enough products
    const productCount = await Product.countDocuments();
    if (productCount > 10) {
      console.log('\n🛒 Seeding sample orders...');
      await seedOrders();
    } else {
      console.log('\n⚠️  Not enough products to create sample orders');
    }

  } catch (error) {
    console.error('\n❌ Error during seeding:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    try {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed.');
    } catch (closeError) {
      console.error('Error closing connection:', closeError.message);
    }
    process.exit(0);
  }
}

// Seed sample orders
async function seedOrders() {
  try {
    // Get or create test users
    let testUser1 = await User.findOne({ email: 'testuser1@example.com' });
    if (!testUser1) {
      testUser1 = await User.create({
        name: 'Test User 1',
        email: 'testuser1@example.com',
        password: 'password123',
        role: 'user',
      });
      console.log('Created test user 1');
    }

    let testUser2 = await User.findOne({ email: 'testuser2@example.com' });
    if (!testUser2) {
      testUser2 = await User.create({
        name: 'Test User 2',
        email: 'testuser2@example.com',
        password: 'password123',
        role: 'user',
      });
      console.log('Created test user 2');
    }

    // Get sample products
    const products = await Product.find().limit(6);
    if (products.length < 2) {
      console.log('⚠️  Not enough products to create orders. Skipping order seeding.');
      return;
    }

    // Clear existing test orders
    await Order.deleteMany({
      user: { $in: [testUser1._id, testUser2._id] }
    });

    // Create sample order 1 for user 1
    const order1 = await Order.create({
      user: testUser1._id,
      orderItems: [
        {
          product: products[0]._id,
          name: products[0].name,
          image: products[0].images[0]?.url || '',
          price: products[0].price,
          size: products[0].sizes[0]?.size || 'M',
          color: products[0].colors[0] || 'Black',
          quantity: 1,
          totalPrice: products[0].price,
        },
        {
          product: products[1]._id,
          name: products[1].name,
          image: products[1].images[0]?.url || '',
          price: products[1].price,
          size: products[1].sizes[0]?.size || 'L',
          color: products[1].colors[0] || 'Blue',
          quantity: 2,
          totalPrice: products[1].price * 2,
        },
      ],
      shippingAddress: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'India',
      },
      paymentInfo: {
        method: 'credit_card',
        transactionId: `TXN-${Date.now()}-001`,
        status: 'completed',
        paidAt: new Date(),
      },
      taxAmount: Math.round(products[0].price * 0.1),
      shippingAmount: 50,
      totalAmount: products[0].price + (products[1].price * 2) + Math.round(products[0].price * 0.1) + 50,
      orderStatus: 'processing',
      deliveryStatus: 'Pending',
      deliveryUpdates: [
        {
          status: 'Pending',
          updatedAt: new Date(Date.now() - 86400000), // 1 day ago
        },
      ],
    });

    // Create sample order 2 for user 1
    const order2 = await Order.create({
      user: testUser1._id,
      orderItems: [
        {
          product: products[2]._id,
          name: products[2].name,
          image: products[2].images[0]?.url || '',
          price: products[2].price,
          size: products[2].sizes[0]?.size || 'M',
          color: products[2].colors[0] || 'Red',
          quantity: 1,
          totalPrice: products[2].price,
        },
      ],
      shippingAddress: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'India',
      },
      paymentInfo: {
        method: 'debit_card',
        transactionId: `TXN-${Date.now()}-002`,
        status: 'completed',
        paidAt: new Date(),
      },
      taxAmount: Math.round(products[2].price * 0.1),
      shippingAmount: 50,
      totalAmount: products[2].price + Math.round(products[2].price * 0.1) + 50,
      orderStatus: 'shipped',
      trackingNumber: 'TRK123456789',
      estimatedDelivery: new Date(Date.now() + 86400000 * 3), // 3 days from now
      deliveryStatus: 'Shipped',
      deliveryUpdates: [
        {
          status: 'Pending',
          updatedAt: new Date(Date.now() - 172800000), // 2 days ago
        },
        {
          status: 'Processing',
          updatedAt: new Date(Date.now() - 86400000), // 1 day ago
        },
        {
          status: 'Shipped',
          updatedAt: new Date(Date.now() - 43200000), // 12 hours ago
        },
      ],
    });

    // Create sample order 3 for user 2
    const order3 = await Order.create({
      user: testUser2._id,
      orderItems: [
        {
          product: products[3]._id,
          name: products[3].name,
          image: products[3].images[0]?.url || '',
          price: products[3].price,
          size: products[3].sizes[0]?.size || 'S',
          color: products[3].colors[0] || 'White',
          quantity: 1,
          totalPrice: products[3].price,
        },
        {
          product: products[4]._id,
          name: products[4].name,
          image: products[4].images[0]?.url || '',
          price: products[4].price,
          size: products[4].sizes[0]?.size || 'M',
          color: products[4].colors[0] || 'Green',
          quantity: 1,
          totalPrice: products[4].price,
        },
        {
          product: products[5]._id,
          name: products[5].name,
          image: products[5].images[0]?.url || '',
          price: products[5].price,
          size: products[5].sizes[0]?.size || 'L',
          color: products[5].colors[0] || 'Black',
          quantity: 1,
          totalPrice: products[5].price,
        },
      ],
      shippingAddress: {
        street: '456 Sample Avenue',
        city: 'Sample City',
        state: 'Sample State',
        zipCode: '67890',
        country: 'India',
      },
      paymentInfo: {
        method: 'paypal',
        transactionId: `TXN-${Date.now()}-003`,
        status: 'completed',
        paidAt: new Date(),
      },
      taxAmount: Math.round((products[3].price + products[4].price + products[5].price) * 0.1),
      shippingAmount: 0,
      totalAmount: products[3].price + products[4].price + products[5].price + Math.round((products[3].price + products[4].price + products[5].price) * 0.1),
      orderStatus: 'pending',
      deliveryStatus: 'Pending',
      deliveryUpdates: [
        {
          status: 'Pending',
          updatedAt: new Date(),
        },
      ],
    });

    console.log('✅ Sample orders created successfully!');
    console.log(`   - Order 1 (${order1.orderNumber}) for ${testUser1.email} - Status: ${order1.deliveryStatus}`);
    console.log(`   - Order 2 (${order2.orderNumber}) for ${testUser1.email} - Status: ${order2.deliveryStatus}`);
    console.log(`   - Order 3 (${order3.orderNumber}) for ${testUser2.email} - Status: ${order3.deliveryStatus}`);
    console.log('\n📧 Test User Credentials:');
    console.log('   User 1: testuser1@example.com / password123');
    console.log('   User 2: testuser2@example.com / password123');

  } catch (error) {
    console.error('Error seeding orders:', error.message);
    throw error;
  }
}

// Run the seeder
seedProducts();

