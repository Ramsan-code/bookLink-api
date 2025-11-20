# 📚 BookLocator - Book Marketplace API

A comprehensive RESTful API for a peer-to-peer book marketplace with admin approval system, email notifications, and location-based features.

## 🚀 Features

### Core Features
- **User Management**: Registration with admin approval, JWT authentication, role-based access
- **Book Listings**: CRUD operations with approval workflow and featured listings
- **Transaction System**: Buy books with email notifications
- **Review System**: Rate and review books (1-5 stars)
- **Admin Dashboard**: Complete control panel with statistics
- **Email Notifications**: Automated emails for approvals, transactions, and updates
- **Location-Based Search**: Find books near you with geolocation
- **Advanced Search**: Filter by price, category, condition, availability, and more
- **Pagination**: Efficient data retrieval on all list endpoints

### Security Features
- Password hashing with bcryptjs
- JWT token authentication (15-minute expiry)
- Role-based access control (User, Admin)
- Admin approval system for users and books
- Account activation/deactivation
- Rate limiting support

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Email**: Nodemailer with HTML templates
- **Deployment**: Vercel (Serverless)

## 📦 Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd booklocator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` file with your configurations:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/booklocator
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Email Configuration
EMAIL_FROM=noreply@booklocator.com
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password

# Optional
FRONTEND_URL=http://localhost:3000
```

### 4. Seed admin account
```bash
npm run seed:admin
```

**Default Admin Credentials:**
- **Admin**: `admin@booklocator.com` / `Admin@123456`

### 5. Run the application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 👤 READERS (USERS) ENDPOINTS

### Register a new user
```http
POST /api/readers/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "location": {
    "type": "Point",
    "coordinates": [80.2167, 6.0329]
  }
}
```

**Response:**
- ✉️ Sends welcome email
- 🔒 Account requires admin approval before full access
- Returns JWT token (limited access until approved)

### Login
```http
POST /api/readers/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "isApproved": true,
  "isActive": true,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Get all readers
```http
GET /api/readers
```

### Get user profile (Protected)
```http
GET /api/readers/profile
Authorization: Bearer <token>
```

### Update profile (Protected)
```http
PUT /api/readers/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "Book enthusiast",
  "location": {
    "type": "Point",
    "coordinates": [80.2167, 6.0329]
  },
  "password": "newpassword123"
}
```

### Logout (Protected)
```http
POST /api/readers/logout
Authorization: Bearer <token>
```

---

## 📖 BOOKS ENDPOINTS

### Get all books (with advanced filters)
```http
GET /api/books?page=1&limit=10&search=gatsby&category=Fiction&condition=Good&minPrice=10&maxPrice=50&available=true&isApproved=true&isFeatured=false&sort=-price,title&lat=6.0329&lng=80.2167&radius=10
```

**Query Parameters:**
- `search` - Search in title, author, description
- `category` - Fiction, Non-fiction, Education, Comics, Other
- `condition` - New, Good, Used
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `available` - true/false
- `isApproved` - true/false (default: true for non-admins)
- `isFeatured` - true/false
- `owner` - Filter by owner ID
- `sort` - Sort fields (prefix with `-` for descending)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `lat`, `lng`, `radius` - Location-based search (radius in km)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPrevPage": false,
  "data": [...],
  "filters": {
    "search": "gatsby",
    "category": "Fiction",
    "priceRange": { "minPrice": "10", "maxPrice": "50" },
    "location": { "lat": "6.0329", "lng": "80.2167", "radius": "10" }
  }
}
```

### Advanced search
```http
GET /api/books/search/advanced?q=fiction&categories=Fiction,Non-fiction&conditions=New,Good&minPrice=5&maxPrice=100&sortBy=price-asc&page=1&limit=20
```

**Query Parameters:**
- `q` - General search query
- `categories` - Comma-separated categories
- `conditions` - Comma-separated conditions
- `minPrice`, `maxPrice` - Price range
- `sortBy` - relevance, price-asc, price-desc, newest, oldest, title
- `page`, `limit` - Pagination

### Search books nearby
```http
GET /api/books/search/nearby?lat=6.0329&lng=80.2167&maxDistance=5000
```

**Query Parameters:**
- `lat` - Latitude (required)
- `lng` - Longitude (required)
- `maxDistance` - Maximum distance in meters (default: 10000)

### Get featured books
```http
GET /api/books/featured?page=1&limit=10
```

### Get available books
```http
GET /api/books/available?page=1&limit=10
```

**Query Parameters:**
- `page`, `limit` - Pagination

### Get books by category
```http
GET /api/books/category/Fiction?page=1&limit=10&sort=-createdAt&minPrice=10&maxPrice=50
```

### Get book by ID
```http
GET /api/books/:id
```

**Note:** Automatically increments view counter

### Create a new book
```http
POST /api/books
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "category": "Fiction",
  "condition": "Good",
  "price": 15.99,
  "location": {
    "type": "Point",
    "coordinates": [80.2167, 6.0329]
  },
  "owner": "reader_id_here",
  "description": "Classic American novel",
  "image": "https://example.com/image.jpg",
  "available": true
}
```

**Response:**
- 📝 Book created with `approvalStatus: "pending"`
- ⏳ Requires admin approval before visible to users
- ✉️ Admin notified of new submission

### Update a book
```http
PUT /api/books/:id
Content-Type: application/json

{
  "price": 12.99,
  "available": true,
  "description": "Updated description"
}
```

### Delete a book
```http
DELETE /api/books/:id
```

---

## ⭐ REVIEWS ENDPOINTS

### Get all reviews
```http
GET /api/reviews
```

**Response:** All reviews with populated reviewer and book info

### Get reviews for a book
```http
GET /api/reviews/:bookId
```

### Create a review (Protected)
```http
POST /api/reviews/:bookId
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent book! Highly recommended."
}
```

**Validation:**
- Rating must be 1-5
- User can only review a book once
- Must be authenticated

### Delete a review (Protected)
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

**Authorization:** Only the reviewer can delete their own review

---

## 💰 TRANSACTIONS ENDPOINTS

### Create a transaction (Protected)
```http
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": "book_id_here"
}
```

**Business Logic:**
- ❌ Cannot buy your own book
- ✅ Book must be available
- 📧 Seller receives email notification
- 🔒 Book marked as unavailable
- Captures price at time of transaction

**Response:**
```json
{
  "message": "Transaction created successfully. Seller has been notified.",
  "transaction": {
    "_id": "...",
    "book": {...},
    "buyer": {...},
    "seller": {...},
    "price": 15.99,
    "status": "Pending",
    "createdAt": "..."
  }
}
```

### Get user transactions (Protected)
```http
GET /api/transactions
Authorization: Bearer <token>
```

**Response:** All transactions where user is buyer OR seller

### Get transaction by ID (Protected)
```http
GET /api/transactions/:id
Authorization: Bearer <token>
```

**Authorization:** Only buyer or seller can view transaction

### Update transaction status (Protected)
```http
PUT /api/transactions/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Completed"
}
```

**Authorization:** Only seller can update status

**Status Options:**
- `Pending` - Initial state
- `Completed` - Transaction finished (book becomes available again)
- `Cancelled` - Transaction cancelled

---

## 🛡️ ADMIN ENDPOINTS

**All admin routes require:**
- ✅ Authentication (`protect` middleware)
- 👑 Admin role

### Base URL: `/api/admin`

---

### 📊 DASHBOARD

#### Get dashboard statistics (Admin only)
```http
GET /api/admin/dashboard/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalBooks": 320,
    "totalTransactions": 85,
    "totalRevenue": 2450.75,
    "pendingApprovals": 12,
    "activeUsers": 142
  }
}
```

---

### 👥 USER MANAGEMENT

#### Get all users (Admin only)
```http
GET /api/admin/users?page=1&limit=10&role=user&isApproved=true&isActive=true&search=john
```

**Query Parameters:**
- `role` - user, admin
- `isApproved` - true/false
- `isActive` - true/false
- `search` - Search in name/email
- `page`, `limit` - Pagination

#### Get pending user approvals (Admin only)
```http
GET /api/admin/users/pending
Authorization: Bearer <admin_token>
```

#### Approve user (Admin only)
```http
PUT /api/admin/users/:id/approve
Authorization: Bearer <admin_token>
```

**Response:**
- ✅ Sets `isApproved: true`
- ✉️ Sends approval email to user
- 📝 Records `approvedBy` and `approvedAt`

#### Toggle user active status (Admin only)
```http
PUT /api/admin/users/:id/toggle-status
Authorization: Bearer <admin_token>
```

**Response:**
- 🔓 Activates or deactivates user account
- ❌ Cannot deactivate admin users

#### Delete user (Admin only)
```http
DELETE /api/admin/users/:id
Authorization: Bearer <admin_token>
```

**Protection:** Cannot delete admin users

---

### 📚 BOOK MANAGEMENT

#### Get all books (including unapproved) (Admin only)
```http
GET /api/admin/books?page=1&limit=10&approvalStatus=pending&search=gatsby
```

**Query Parameters:**
- `approvalStatus` - pending, approved, rejected
- `search` - Search in title/author
- `page`, `limit` - Pagination

#### Get pending book approvals (Admin only)
```http
GET /api/admin/books/pending
Authorization: Bearer <admin_token>
```

#### Approve book (Admin only)
```http
PUT /api/admin/books/:id/approve
Authorization: Bearer <admin_token>
```

**Response:**
- ✅ Sets `isApproved: true`, `approvalStatus: "approved"`
- ✉️ Sends approval email to book owner
- 📝 Records `approvedBy` and `approvedAt`

#### Reject book (Admin only)
```http
PUT /api/admin/books/:id/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Images are not clear. Please upload better quality photos."
}
```

**Response:**
- ❌ Sets `approvalStatus: "rejected"`
- ✉️ Sends rejection email with reason to owner

#### Toggle featured status (Admin only)
```http
PUT /api/admin/books/:id/toggle-featured
Authorization: Bearer <admin_token>
```

**Response:** Makes book featured or removes featured status

#### Delete book (Admin only)
```http
DELETE /api/admin/books/:id
Authorization: Bearer <admin_token>
```

---

### 💳 TRANSACTION MANAGEMENT

#### Get all transactions (Admin only)
```http
GET /api/admin/transactions?page=1&limit=10&status=Completed
```

**Query Parameters:**
- `status` - Pending, Completed, Cancelled
- `page`, `limit` - Pagination

**Response:** All transactions with populated book, buyer, and seller details

---

### ⭐ REVIEW MANAGEMENT

#### Get all reviews (Admin only)
```http
GET /api/admin/reviews?page=1&limit=10
```

#### Delete review (Admin only)
```http
DELETE /api/admin/reviews/:id
Authorization: Bearer <admin_token>
```

---

## 📊 DATA MODELS

### Reader (User)
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: Enum ["user", "admin"] (default: "user"),
  isApproved: Boolean (default: false),
  isActive: Boolean (default: true),
  approvedBy: ObjectId (ref: Reader),
  approvedAt: Date,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  bio: String,
  avatar: String,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `location` (2dsphere)
- `role`, `isApproved`

### Book
```javascript
{
  title: String (required),
  author: String (required),
  category: Enum ["Fiction", "Non-fiction", "Education", "Comics", "Other"],
  condition: Enum ["New", "Good", "Used"],
  price: Number (required),
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  owner: ObjectId (ref: Reader),
  image: String,
  description: String,
  available: Boolean (default: true),
  isApproved: Boolean (default: false),
  approvalStatus: Enum ["pending", "approved", "rejected"],
  approvedBy: ObjectId (ref: Reader),
  approvedAt: Date,
  rejectionReason: String,
  isFeatured: Boolean (default: false),
  views: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `location` (2dsphere)
- `isApproved`, `approvalStatus`, `isFeatured`

### Review
```javascript
{
  book: ObjectId (ref: Book, required),
  reviewer: ObjectId (ref: Reader, required),
  rating: Number (required, min: 1, max: 5),
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction
```javascript
{
  book: ObjectId (ref: Book, required),
  buyer: ObjectId (ref: Reader, required),
  seller: ObjectId (ref: Reader, required),
  price: Number (required),
  status: Enum ["Pending", "Completed", "Cancelled"],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📧 EMAIL NOTIFICATIONS

The system sends automated emails for:

### 1. Welcome Email
**Trigger:** User registration  
**Recipient:** New user  
**Content:** Welcome message, approval wait notice

### 2. User Approval Email
**Trigger:** Admin approves user  
**Recipient:** Approved user  
**Content:** Approval confirmation, features overview, login link

### 3. Book Approval Email
**Trigger:** Admin approves book  
**Recipient:** Book owner  
**Content:** Approval confirmation, listing visibility, view listing link

### 4. Book Rejection Email
**Trigger:** Admin rejects book  
**Recipient:** Book owner  
**Content:** Rejection notice, reason, improvement suggestions

### 5. Transaction Created Email
**Trigger:** New purchase transaction  
**Recipient:** Book seller  
**Content:** Transaction details, buyer info, next steps

**Email Configuration:**
- Development: Ethereal Email (test SMTP)
- Production: Gmail (requires App Password)
- HTML templates with modern styling
- Preview URLs in development mode

---

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with 15-minute expiration
- Password hashing with bcryptjs (10 salt rounds)
- Role-based access control (User, Admin)
- Protected routes with middleware

### Access Control Levels

| Feature | User | Admin |
|---------|------|-------|
| Browse books | ✅ | ✅ |
| Create listings | ✅* | ✅ |
| Buy books | ✅* | ✅ |
| Leave reviews | ✅* | ✅ |
| Approve users | ❌ | ✅ |
| Approve books | ❌ | ✅ |
| Delete reviews | ❌ | ✅ |
| Manage users | ❌ | ✅ |
| View dashboard | ❌ | ✅ |
| Feature books | ❌ | ✅ |
| Delete any content | ❌ | ✅ |

*Requires approval

### Validation
- Mongoose schema validation
- Email uniqueness enforcement
- One review per user per book
- Cannot buy own books
- Price and rating constraints

### Error Handling
- Custom `AppError` class
- MongoDB error handling (CastError, ValidationError, Duplicate key)
- JWT error handling (Invalid token, Expired token)
- Async error wrapper
- Development/Production error modes

---

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel deploy
```

3. **Set Environment Variables** (Vercel Dashboard)
```
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_production_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@booklocator.com
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

4. **MongoDB Atlas Setup**
- Create cluster
- Whitelist Vercel IPs (0.0.0.0/0 for serverless)
- Create database user
- Get connection string

### Production Checklist
- ✅ Update `JWT_SECRET` to strong random string
- ✅ Configure production email service
- ✅ Set up MongoDB Atlas
- ✅ Configure CORS for your frontend
- ✅ Enable rate limiting
- ✅ Set up monitoring/logging
- ✅ Configure backup strategy

---

## 📝 API Response Formats

### Success Response
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPrevPage": false,
  "data": [...]
}
```

### Error Response
```json
{
  "success": false,
  "message": "Resource not found with id: 123",
  "stack": "..." // Only in development
}
```

### Validation Error Response
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

---

## 🧪 Testing

### Manual Testing with cURL

#### Register User
```bash
curl -X POST http://localhost:5000/api/readers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "location": {"type": "Point", "coordinates": [80.2167, 6.0329]}
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/readers/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@booklocator.com", "password": "Admin@123456"}'
```

#### Create Book (with token)
```bash
curl -X POST http://localhost:5000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Book",
    "author": "Test Author",
    "category": "Fiction",
    "condition": "Good",
    "price": 20.99,
    "location": {"type": "Point", "coordinates": [80.2167, 6.0329]},
    "owner": "USER_ID"
  }'
```

### Postman Collection
Import the following environment variables:
```
base_url = http://localhost:5000/api
token = <your_jwt_token>
admin_token = <admin_jwt_token>
```

---

## 🐛 Common Issues & Solutions

### Issue: Email not sending
**Solution:** 
- Development: Check Ethereal credentials
- Production: Verify Gmail App Password
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

### Issue: Token expired
**Solution:** JWT expires in 15 minutes. Login again to get fresh token.

### Issue: User can't perform actions after login
**Solution:** Check if user is approved (`isApproved: true`). Admin must approve first.

### Issue: Book not showing in public listings
**Solution:** Admin must approve book. Check `approvalStatus` field.

### Issue: Location search not working
**Solution:** Ensure MongoDB 2dsphere index is created on `location` field.

### Issue: Cannot connect to MongoDB
**Solution:**
- Check `MONGO_URI` in `.env`
- Verify MongoDB server is running
- Check network connectivity
- For Atlas: whitelist your IP

---

## 📖 Usage Examples

### Complete User Journey

1. **Register Account**
```bash
POST /api/readers/register
# ✉️ Receives welcome email
# ⏳ Account pending approval
```

2. **Admin Approves User**
```bash
PUT /api/admin/users/:id/approve
# ✉️ User receives approval email
```

3. **User Logs In**
```bash
POST /api/readers/login
# 🔑 Receives JWT token
```

4. **User Creates Book Listing**
```bash
POST /api/books
# 📝 Book created with pending status
```

5. **Admin Approves Book**
```bash
PUT /api/admin/books/:id/approve
# ✉️ Owner receives approval email
# 🌐 Book now visible to all users
```

6. **Another User Buys Book**
```bash
POST /api/transactions
# ✉️ Seller receives transaction email
# 🔒 Book marked unavailable
```

7. **Seller Completes Transaction**
```bash
PUT /api/transactions/:id/status
# ✅ Book available again
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

ISC License

---

## 👨‍💻 Author

**Ramsan**

---

## 🆘 Support

For support:
- 📧 Email: support@booklocator.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 📚 Documentation: This README

---

## 🎯 Future Enhancements

- [ ] Image upload with Cloudinary/AWS S3
- [ ] Real-time chat between buyers/sellers
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Push notifications
- [ ] Book recommendations using ML
- [ ] Wishlist functionality
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Book condition verification with AI
- [ ] Review moderation with AI
- [ ] Seller ratings and badges
- [ ] Shipping integration

---

## 📊 API Rate Limits

**Recommended Implementation:**
```javascript
// Add to app.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 🔗 Quick Links

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [JWT.io](https://jwt.io/)
- [Nodemailer Docs](https://nodemailer.com/)
- [Mongoose Docs](https://mongoosejs.com/)

---

**Last Updated:** November 2025  
**API Version:** 1.0.0  
**Node Version:** >=16.0.0

---

Made with ❤️ by the BookLocator Team