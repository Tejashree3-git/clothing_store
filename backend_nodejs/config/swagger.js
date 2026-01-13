const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Clothing Store API',
      version: '1.0.0',
      description: 'API documentation for Clothing E-commerce Store',
      contact: {
        name: 'API Support',
        email: 'support@clothingstore.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              description: 'User role',
            },
            isVerified: {
              type: 'boolean',
              description: 'Email verification status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Product ID',
            },
            name: {
              type: 'string',
              description: 'Product name',
            },
            description: {
              type: 'string',
              description: 'Product description',
            },
            price: {
              type: 'number',
              description: 'Product price',
            },
            category: {
              type: 'string',
              enum: ['Shirts', 'T-Shirts', 'Pants', 'Jeans', 'Dresses', 'Skirts', 'Jackets', 'Sweaters', 'Shoes', 'Accessories', 'Bags', 'Underwear'],
            },
            gender: {
              type: 'string',
              enum: ['Men', 'Women', 'Unisex', 'Kids'],
            },
            sizes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  size: { type: 'string' },
                  stock: { type: 'number' },
                },
              },
            },
            colors: {
              type: 'array',
              items: { type: 'string' },
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
            },
            inStock: {
              type: 'boolean',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Order ID',
            },
            orderNumber: {
              type: 'string',
              description: 'Order number',
            },
            user: {
              type: 'string',
              description: 'User ID',
            },
            orderItems: {
              type: 'array',
              items: { type: 'object' },
            },
            totalAmount: {
              type: 'number',
            },
            orderStatus: {
              type: 'string',
              enum: ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'],
            },
            deliveryStatus: {
              type: 'string',
              enum: ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
            },
            errors: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

