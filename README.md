# 🚗 Vehicle Rental System - Backend API

A comprehensive backend API for a vehicle rental management system built with Node.js, TypeScript, and Express.js. This system handles vehicle inventory management, customer accounts, booking operations, and secure role-based authentication.

## 🌐 Live Deployment

**Live URL:** [https://vehicle-rental-system-server-psi.vercel.app/]

**GitHub Repository:** [https://github.com/iktushar01/vehicle-rental-system-server.git]

## ✨ Features

- **🔐 Authentication & Authorization**
  - User registration and login with JWT tokens
  - Role-based access control (Admin and Customer)
  - Secure password hashing with bcrypt
  - Protected API endpoints with Bearer token authentication

- **🚗 Vehicle Management**
  - Create, read, update, and delete vehicles
  - Support for multiple vehicle types (car, bike, van, SUV)
  - Real-time availability tracking
  - Admin-only vehicle management

- **👥 User Management**
  - User registration and profile management
  - Admin can view and manage all users
  - Customers can update their own profiles
  - Role-based user access control

- **📅 Booking System**
  - Create bookings with automatic price calculation
  - View bookings (role-based: Admin sees all, Customer sees own)
  - Cancel bookings (Customer) or mark as returned (Admin)
  - Automatic vehicle availability updates
  - Auto-return logic for expired bookings

- **💾 Database Management**
  - PostgreSQL database with proper schema
  - Automatic table creation on startup
  - Data validation and constraints
  - Referential integrity with foreign keys

## 🛠️ Technology Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Environment Management:** dotenv
- **Deployment:** Vercel

## 📁 Project Structure

```
Vehicle_Rental_System_Server/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── config/
│   │   ├── index.ts           # Configuration management
│   │   └── db.ts              # Database connection and initialization
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication middleware
│   │   └── logger.ts          # Request logging middleware
│   └── modules/
│       ├── auth/              # Authentication module
│       │   ├── auth.controller.ts
│       │   ├── auth.routes.ts
│       │   └── auth.service.ts
│       ├── users/             # User management module
│       │   ├── users.controller.ts
│       │   ├── users.routes.ts
│       │   └── users.service.ts
│       ├── vehicles/          # Vehicle management module
│       │   ├── vehicles.controller.ts
│       │   ├── vehicles.routes.ts
│       │   └── vehicles.services.ts
│       └── bookings/          # Booking management module
│           ├── bookings.controller.ts
│           ├── bookings.routes.ts
│           └── bookings.service.ts
├── api/
│   └── index.ts               # Vercel serverless function entry point
├── dist/                      # Compiled JavaScript output
├── package.json
├── tsconfig.json
├── vercel.json                # Vercel deployment configuration
└── README.md
```

## 🚀 Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone [your-repository-url]
   cd Vehicle_Rental_System_Server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/vehicle_rental_db
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

4. **Build the TypeScript code**
   ```bash
   npm run build
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

## 📊 Database Schema

### Users Table
- `id` - Auto-generated primary key
- `name` - User's full name (required)
- `email` - Unique email address, lowercase (required)
- `password` - Hashed password, minimum 6 characters (required)
- `phone` - Contact phone number (required)
- `role` - User role: 'admin' or 'customer' (required)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Vehicles Table
- `id` - Auto-generated primary key
- `vehicle_name` - Name of the vehicle (required)
- `type` - Vehicle type: 'car', 'bike', 'van', or 'SUV' (required)
- `registration_number` - Unique registration number (required)
- `daily_rent_price` - Daily rental price, must be positive (required)
- `availability_status` - 'available' or 'booked' (required, default: 'available')
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Bookings Table
- `id` - Auto-generated primary key
- `customer_id` - Foreign key to Users table (required)
- `vehicle_id` - Foreign key to Vehicles table (required)
- `rent_start_date` - Booking start date (required)
- `rent_end_date` - Booking end date, must be after start date (required)
- `total_price` - Calculated total price, must be positive (required)
- `status` - 'active', 'cancelled', or 'returned' (required, default: 'active')
- `created_at` - Timestamp
- `updated_at` - Timestamp

## 🌐 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/signup` | Public | Register new user account |
| POST | `/api/v1/auth/signin` | Public | Login and receive JWT token |

### Vehicle Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/vehicles` | Admin | Add new vehicle |
| GET | `/api/v1/vehicles` | Public | View all vehicles |
| GET | `/api/v1/vehicles/:vehicleId` | Public | View specific vehicle |
| PUT | `/api/v1/vehicles/:vehicleId` | Admin | Update vehicle details |
| DELETE | `/api/v1/vehicles/:vehicleId` | Admin | Delete vehicle |

### User Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/users` | Admin | View all users |
| PUT | `/api/v1/users/:userId` | Admin/Own | Update user profile |
| DELETE | `/api/v1/users/:userId` | Admin | Delete user |

### Booking Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/bookings` | Customer/Admin | Create new booking |
| GET | `/api/v1/bookings` | Role-based | View bookings |
| PUT | `/api/v1/bookings/:bookingId` | Role-based | Update booking status |

## 🔐 Authentication

All protected endpoints require a JWT token in the request header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **Admin**: Full system access to manage vehicles, users, and all bookings
- **Customer**: Can register, view vehicles, and create/manage own bookings

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": "Error details"
}
```

## 💡 Business Logic

### Booking Price Calculation
- `total_price = daily_rent_price × number_of_days`
- `number_of_days = rent_end_date - rent_start_date`

### Vehicle Availability
- When booking is created → Vehicle status changes to "booked"
- When booking is marked as "returned" → Vehicle status changes to "available"
- When booking is "cancelled" → Vehicle status changes to "available"

### Auto-Return Logic
- System automatically marks bookings as "returned" when `rent_end_date` has passed
- Vehicle availability status is updated accordingly

### Deletion Constraints
- Users cannot be deleted if they have active bookings
- Vehicles cannot be deleted if they have active bookings
- Active bookings = bookings with status "active"

## 🚀 Deployment

### Vercel Deployment

This project is configured for deployment on Vercel:

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard:**
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`

3. **Deploy**
   - Vercel will automatically detect the `vercel.json` configuration
   - The build process will compile TypeScript and deploy the serverless function

### Environment Variables for Production

Make sure to set these in your Vercel project settings:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - A secure secret key for JWT token signing
- `NODE_ENV` - Set to `production`

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm test` - Run tests (if configured)

### Development Server

The development server runs on `http://localhost:5000` by default. It uses `tsx` for TypeScript execution with hot reload.

## 📚 Additional Documentation

For detailed API documentation with request/response examples, please refer to the API Reference documentation.

## 🤝 Contributing

This is an assignment project. For contributions or issues, please contact the project maintainer.

## 📄 License

MIT

---

**Built with ❤️ using Node.js, TypeScript, and Express.js**

