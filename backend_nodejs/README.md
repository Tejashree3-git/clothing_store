# Clothing Store Backend API

A complete Node.js/Express backend for an Online Clothing Store MVP with authentication, product management, cart functionality, and order processing.

## 🚀 Features

### Authentication
- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes with middleware

### Product Management
- CRUD operations for products
- Product image upload support
- Advanced filtering (category, price range, size, color)
- Featured products
- Search functionality

### Shopping Cart
- Add, update, and remove items
- Real-time cart calculations
- Stock validation
- Persistent cart storage

### Order Management
- Complete order lifecycle
- Order tracking and status updates
- Payment integration ready
- Inventory management

## 🛠 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Password Hashing**: bcryptjs
- **Validation**: Express Validator

## 📁 Project Structure

```
backend_nodejs/
│── package.json
│── server.js
│── .env
│── ClothingStoreAPI.postman_collection.json
│── config/
│   └── db.js
│── models/
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   └── Order.js
│── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── cartController.js
│   └── orderController.js
│── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   └── orderRoutes.js
│── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
│── utils/
│   ├── generateToken.js
│   └── upload.js
└── uploads/ (created automatically)
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone or navigate to the backend directory**
   ```bash
   cd backend_nodejs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy the `.env` file and update the values:
   ```env
   MONGO_URI=mongodb://localhost:27017/clothing-store
   JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
   PORT=5000
   ```

4. **Start MongoDB**
   - Ensure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/clothing-store`

### Running the Application

1. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

2. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| GET | `/auth/me` | Get current user | Private |
| PUT | `/auth/me` | Update profile | Private |
| PUT | `/auth/change-password` | Change password | Private |

### Product Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/products` | Get all products (with filters) | Public |
| GET | `/products/:id` | Get single product | Public |
| GET | `/products/featured` | Get featured products | Public |
| GET | `/products/category/:category` | Get products by category | Public |
| GET | `/products/categories` | Get all categories | Public |
| POST | `/products` | Create product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Delete product | Admin |

### Cart Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/cart` | Get user cart | Private |
| POST | `/cart` | Add item to cart | Private |
| PUT | `/cart/:itemId` | Update cart item quantity | Private |
| DELETE | `/cart/:itemId` | Remove item from cart | Private |
| DELETE | `/cart` | Clear cart | Private |
| GET | `/cart/count` | Get cart item count | Private |

### Order Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/orders` | Create order | Private |
| GET | `/orders` | Get user orders | Private |
| GET | `/orders/:id` | Get single order | Private |
| PUT | `/orders/:id/cancel` | Cancel order | Private |
| GET | `/orders/:id/track` | Track order | Private |
| PUT | `/orders/:id/status` | Update order status | Admin |
| GET | `/orders/admin/all` | Get all orders | Admin |

## 🔐 Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📋 Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Products with Filters
```bash
GET /api/products?category=T-Shirts&minPrice=20&maxPrice=50&page=1&limit=12
```

### Add to Cart
```bash
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439011",
  "size": "M",
  "color": "Black",
  "quantity": 1
}
```

### Create Order
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentInfo": {
    "method": "credit_card",
    "transactionId": "txn_12345"
  },
  "notes": "Please handle with care"
}
```

## 🧪 Testing with Postman

1. Import the `ClothingStoreAPI.postman_collection.json` file
2. Set up environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `auth_token`: (will be set automatically after login)
3. Start testing the endpoints!

### Test Flow:
1. Register a new user or login
2. The auth token will be automatically saved
3. Test product endpoints
4. Add items to cart
5. Create an order
6. Track order status

## 🔍 Product Filtering

The API supports extensive filtering options:

- **Category**: `?category=T-Shirts`
- **Price Range**: `?minPrice=20&maxPrice=100`
- **Size**: `?size=M`
- **Color**: `?color=Black`
- **Gender**: `?gender=Men`
- **Brand**: `?brand=Nike`
- **In Stock**: `?inStock=true`
- **Search**: `?search=cotton t-shirt`
- **Sorting**: `?sortBy=price&sortOrder=desc`
- **Pagination**: `?page=1&limit=12`

## 📦 Product Model

```javascript
{
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  category: String,
  sizes: [{ size: String, stock: Number }],
  colors: [String],
  images: [{ public_id: String, url: String, alt: String }],
  featured: Boolean,
  inStock: Boolean,
  gender: String,
  brand: String,
  material: String,
  tags: [String]
}
```

## 🛒 Cart Model

```javascript
{
  user: ObjectId,
  items: [{
    product: ObjectId,
    name: String,
    image: String,
    price: Number,
    size: String,
    color: String,
    quantity: Number,
    totalPrice: Number
  }],
  totalItems: Number,
  totalAmount: Number
}
```

## 📋 Order Model

```javascript
{
  user: ObjectId,
  orderItems: [...cartItems],
  shippingAddress: {...},
  paymentInfo: {
    method: String,
    transactionId: String,
    status: String
  },
  totalAmount: Number,
  orderStatus: String,
  orderNumber: String,
  trackingNumber: String,
  estimatedDelivery: Date
}
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/clothing-store
JWT_SECRET=your-production-jwt-secret
PORT=5000
```

### PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start server.js --name "clothing-store"
pm2 startup
pm2 save
```

## 🔧 Development Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# Seed database
npm run seed

# Clear database (in seed.js)
node seed.js -d
```

## 🐛 Error Handling

The API includes comprehensive error handling:

- **Validation Errors**: 400 status with detailed messages
- **Authentication Errors**: 401 status for invalid tokens
- **Authorization Errors**: 403 status for insufficient permissions
- **Not Found Errors**: 404 status for missing resources
- **Server Errors**: 500 status with generic messages in production

## 📊 Data Validation

- User input validation using express-validator
- MongoDB schema validation
- Password strength requirements
- Email format validation
- File upload validation (images only, 5MB max)

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token expiration
- CORS enabled
- Input sanitization
- Rate limiting (can be added)
- Helmet.js security headers (can be added)

## 🎯 Future Enhancements

- Email notifications
- Payment gateway integration (Stripe, PayPal)
- File upload to cloud storage (Cloudinary, AWS S3)
- Advanced search with Elasticsearch
- Order history and analytics
- Wishlist functionality
- Product reviews and ratings
- Admin dashboard
- Real-time notifications with Socket.io

## 📞 Support

For questions or issues, please check the code comments or create an issue in the repository.

## 📝 License

This project is licensed under the ISC License.
