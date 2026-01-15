# ⚽ VENUE UNDIP - Sports Field Booking Platform

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Apollo GraphQL](https://img.shields.io/badge/Apollo%20GraphQL-311C87?style=for-the-badge&logo=apollo-graphql&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![MinIO](https://img.shields.io/badge/MinIO-C72E49?style=for-the-badge&logo=minio&logoColor=white)

*A modern, scalable GraphQL API for sports field booking and reservation management at Universitas Diponegoro*

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation) • [Architecture](#-architecture)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Development](#-development)
- [Deployment](#-deployment)
- [Configuration Notes](#-configuration-notes)
- [Team](#-team)
- [License](#-license)

---

## 🌟 Overview

**VENUE UNDIP** is a comprehensive backend system designed for **sports field booking and reservation management** at Universitas Diponegoro. The platform enables students, staff, and external parties to easily book sports fields (basketball courts, football fields, volleyball courts, etc.) with real-time availability checking, automated booking management, and integrated payment tracking.

### Key Highlights

- 🎯 **GraphQL API** - Efficient data fetching with Apollo Server
- 🔐 **JWT Authentication** - Secure admin authentication system
- 📦 **Type-Safe Database** - Prisma ORM with MySQL
- 📁 **File Management** - MinIO integration for document and image uploads
- 🏢 **Academic Support** - Special handling for institutional bookings
- 📊 **Admin Dashboard** - Comprehensive activity logging
- 🚀 **Production Ready** - Built with TypeScript for type safety

---

## ✨ Features

### Core Booking System

- **📅 Field Booking & Reservation**
  - Real-time field availability checking
  - Unique booking code generation (auto-generated)
  - Multi-field booking in single transaction
  - Hourly booking slots
  - Booking date and time management
  - Automatic subtotal calculation per field
  - Conflict detection and prevention

- **👥 User Types & Access**
  - **Academic Bookings** - For university organizations (with official letter upload)
  - **Public Bookings** - For general public and external parties
  - Contact information collection (name, email, phone, institution)
  - Document upload support (Surat/Official Letter)

- **💳 Payment & Status Management**
  - Payment status tracking (Unpaid/Paid)
  - Booking status workflow:
    - `PENDING` - Awaiting admin approval
    - `APPROVED` - Confirmed by admin
    - `DONE` - Booking completed
    - `CANCELLED` - Booking cancelled
  - Total price calculation across multiple fields

### Sports Venue Management

- **🏟️ Stadium/Venue Information**
  - Stadium profiles with descriptions
  - Location mapping (Google Maps integration)
  - Multi-image galleries per stadium
  - Facility listings (parking, restrooms, changing rooms, etc.)
  - Status management (Active/Inactive)

- **⚽ Sports Field Management**
  - Field configuration per stadium
  - Field-specific pricing per hour
  - Field descriptions and specifications
  - Image galleries for each field
  - Field availability status
  - Support for multiple sports types

- **🎛️ Operating Hours**
  - Configurable daily operating hours
  - System-wide booking time restrictions
  - Open and close hour management

### Administrative Features

- **👤 Admin Authentication**
  - Secure login with JWT
  - Password hashing with bcrypt
  - Token-based authorization

- **📝 Activity Logging**
  - Comprehensive admin action tracking
  - Target table and ID logging
  - Timestamp recording

### File Management

- **📤 Upload System**
  - MinIO object storage integration
  - Support for images and documents
  - Automatic file validation
  - URL generation for stored assets

---

## 🛠 Tech Stack

### Core Technologies

| Technology           | Version    | Purpose                              |
|---------------------|------------|--------------------------------------|
| **TypeScript**      | Latest     | Type-safe programming language       |
| **Node.js**         | >= 18.x    | JavaScript runtime environment       |
| **Express**         | ^5.1.0     | Web application framework            |
| **Apollo Server**   | ^5.0.0     | GraphQL server implementation        |
| **Prisma**          | ^6.18.0    | Modern database ORM                  |
| **MySQL**           | >= 8.0     | Relational database                  |
| **MinIO**           | ^8.0.6     | S3-compatible object storage         |

### Key Libraries

- **graphql** - GraphQL implementation
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **yup** - Schema validation
- **dayjs** - Date manipulation
- **dotenv** - Environment configuration
- **cors** - Cross-Origin Resource Sharing

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.x
- **npm** or **yarn** or **pnpm**
- **MySQL** >= 8.0
- **MinIO** server (or S3-compatible storage)
- **Git**

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/dipo-devs/DIPSPORT-BE.git
cd DIPSPORT-BE
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MYSQL_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=your-minio-access-key
MINIO_SECRET_KEY=your-minio-secret-key
MINIO_BUCKET_NAME=bucket_name

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate:dev

# (Optional) Seed initial data
npm run prisma:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The GraphQL API will be available at `http://localhost:4000/graphql`

---

## 🔧 Environment Variables

| Variable              | Description                                  | Required | Default                |
|-----------------------|----------------------------------------------|----------|------------------------|
| `PORT`                | Server port                                  | No       | `4000`                 |
| `NODE_ENV`            | Environment mode                             | No       | `development`          |
| `MYSQL_URL`           | Database connection string                   | **Yes**  | -                      |
| `JWT_SECRET`          | Secret key for JWT signing                   | **Yes**  | -                      |
| `MINIO_ENDPOINT`      | MinIO server endpoint                        | **Yes**  | -                      |
| `MINIO_PORT`          | MinIO server port                            | **Yes**  | `9000`                 |
| `MINIO_USE_SSL`       | Enable SSL for MinIO                         | No       | `false`                |
| `MINIO_ACCESS_KEY`    | MinIO access key                             | **Yes**  | -                      |
| `MINIO_SECRET_KEY`    | MinIO secret key                             | **Yes**  | -                      |
| `MINIO_BUCKET_NAME`   | MinIO bucket name                            | **Yes**  | -                      |
| `CORS_ORIGINS`        | Allowed CORS origins (comma-separated)       | No       | `http://localhost:3000`|

---

## 🗄️ Database Schema

### Core Models

```
┌─────────────┐
│   Stadion   │──┐
└─────────────┘  │
       │         │
       ├─────────┼──> StadionFacility ──> Facility
       │         │
       ├─────────┼──> ImageStadion
       │         │
       └─────────┴──> Field ──┬──> ImageField
                               │
                               └──> BookingDetail ──> Booking
```

### Key Relationships

- **Stadion** (Venue) contains multiple **Fields** (sports courts/fields)
- **Stadion** has associated **Facilities** (amenities like parking, restrooms)
- **Booking** is the main reservation entity with customer information
- **BookingDetail** links bookings to specific **Fields** with date/time slots
- **Field** availability is calculated from existing **BookingDetails**
- **Admin** actions are tracked via **AdminLog** for audit trail

### Status Enums

- **Status**: `ACTIVE`, `INACTIVE`
- **BookingStatus**: `PENDING`, `APPROVED`, `CANCELLED`, `DONE`
- **PaymentStatus**: `UNPAID`, `PAID`

---

## 📚 API Documentation

### GraphQL Endpoint

```
POST http://localhost:4000/graphql
```

### Authentication

Include JWT token in request headers:

```
Authorization: Bearer <your-jwt-token>
```

### Sample Queries

#### Get All Stadiums

```graphql
query GetStadiums {
  stadions {
    id
    name
    description
    mapUrl
    status
    facilities {
      id
      name
      icon
    }
    images {
      id
      imageUrl
    }
    fields {
      id
      name
      pricePerHour
      status
    }
  }
}
```

#### Create a Booking

```graphql
mutation CreateBooking($input: BookingInput!) {
  createBooking(input: $input) {
    id
    bookingCode
    name
    email
    contact
    totalPrice
    status
    paymentStatus
    details {
      fieldId
      bookingDate
      startHour
      subtotal
    }
  }
}
```

#### Admin Login

```graphql
mutation AdminLogin($email: String!, $password: String!) {
  adminLogin(email: $email, password: $password) {
    token
    admin {
      id
      name
      email
    }
  }
}
```

### File Upload

```graphql
mutation UploadFile($file: Upload!, $folder: String!) {
  uploadFile(file: $file, folder: $folder) {
    url
    filename
  }
}
```

---

## 📁 Project Structure

```
DIPSPORT-BE/
├── prisma/
│   ├── schema.prisma                       # Database schema definition
│   ├── seed.ts                             # Database seeding script
│   └── migrations/                         # Database migration files
│
├── src/
│   ├── index.ts                            # Application entry point
│   │
│   ├── lib/
│   │   ├── auth.ts                         # JWT authentication utilities
│   │   ├── context.ts                      # GraphQL context builder
│   │   ├── prisma.ts                       # Prisma client instance
│   │   ├── minioClient.ts                  # MinIO client configuration
│   │   └── uploadToMinio.ts                # File upload helper
│   │
│   └── schema/
│       ├── typeDefs.ts                     # GraphQL type definitions
│       │
│       └── resolvers/
│           ├── index.ts                    # Resolver aggregator
│           ├── stadionResolver.ts          # Stadium operations
│           ├── fieldResolver.ts            # Field operations
│           ├── facilityResolver.ts         # Facility operations
│           ├── bookingResolver.ts          # Booking operations
│           ├── operatingHourResolver.ts    # Hours management
│           ├── uploadToMinioResolver.ts    # File uploads
│           │
│           └── validators/                 # Input validation schemas
│               ├── stadionSchema.ts
│               ├── fieldSchema.ts
│               ├── facilitySchema.ts
│               ├── bookingSchema.ts
│               └── operatingHourSchema.ts
│
├── .env                                    # Environment variables
├── package.json                            # Project dependencies
├── tsconfig.json                           # TypeScript configuration
├── prisma.config.ts                        # Prisma configuration
└── README.md                               # Project documentation
```

---

## 🏗️ Architecture

### System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│   (Web App / Mobile App / Admin Dashboard)                   │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ GraphQL over HTTP
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   API Gateway Layer                          │
│                                                              │
│  ┌──────────────┐   ┌───────────────┐   ┌───────────────┐    │
│  │   Express    │──▶│ Apollo Server │──▶│ GraphQL API  │    │
│  └──────────────┘   └───────────────┘   └───────────────┘    │
│                                                              │
│  ┌──────────────┐   ┌───────────────┐                        │
│  │ CORS + Auth  │   │  File Upload  │                        │
│  └──────────────┘   └───────────────┘                        │
└────────────────────────┬─────────────────────────────────────┘
                         │
           ┌─────────────┼─────────────┐
           │             │             │
┌──────────▼──────────┐  │  ┌──────────▼──────────┐
│   Business Logic    │  │  │   Data Access       │
│                     │  │  │                     │
│  ┌───────────────┐  │  │  │  ┌──────────────┐   │
│  │  Resolvers    │  │  │  │  │   Prisma     │   │
│  └───────────────┘  │  │  │  └──────────────┘   │
│                     │  │  │                     │
│  ┌───────────────┐  │  │  │  ┌──────────────┐   │
│  │  Validators   │  │  │  │  │    MySQL     │   │
│  └───────────────┘  │  │  │  └──────────────┘   │
└─────────────────────┘  │  └─────────────────────┘
                         │
                  ┌──────▼──────┐
                  │   Storage   │
                  │             │
                  │  ┌────────┐ │
                  │  │ MinIO  │ │
                  │  └────────┘ │
                  └─────────────┘
```

### Request Flow

1. **Client Request** → GraphQL query/mutation sent to `/graphql`
2. **Middleware** → CORS, body parsing, file upload handling
3. **Authentication** → JWT validation (for protected routes)
4. **Context Building** → User/admin info attached to context
5. **Resolver Execution** → Business logic processing
6. **Validation** → Input validation using Yup schemas
7. **Data Layer** → Prisma queries to MySQL
8. **File Operations** → MinIO uploads (if needed)
9. **Response** → JSON response with requested data

---

## 💻 Development

### Available Scripts

| Command                         | Description                                      |
|---------------------------------|--------------------------------------------------|
| `npm run dev`                   | Start development server with tsx                |
| `npm run dev:nodemon`           | Start dev server with auto-reload                |
| `npm run build`                 | Compile TypeScript to JavaScript                 |
| `npm start`                     | Run production server                            |
| `npm run prisma:generate`       | Generate Prisma client                           |
| `npm run prisma:migrate:dev`    | Create and apply migrations (development)        |
| `npm run prisma:migrate:deploy` | Apply migrations (production)                    |
| `npm run prisma:seed`           | Seed database with initial data                  |

### Development Workflow

1. **Feature Development**
   ```bash
   git checkout -b feature/your-feature-name
   npm run dev
   # Make changes and test
   ```

2. **Database Changes**
   ```bash
   # Edit prisma/schema.prisma
   npm run prisma:migrate:dev --name your_migration_name
   npm run prisma:generate
   ```

3. **Testing GraphQL API**
   - Open `http://localhost:4000/graphql`
   - Use Apollo Studio Explorer
   - Test queries and mutations

### Code Quality

- **TypeScript** for type safety
- **Yup** for input validation
- **Prisma** for type-safe database access
- **ESM** module system

---

### Docker Deployment (Optional)

```dockerfile
# Example Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build
RUN npm run prisma:generate

EXPOSE 4000

CMD ["npm", "start"]
```

---

## ⚙️ Configuration Notes

### Generate JWT Secret

Before running the application, generate a secure JWT secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or using OpenSSL
openssl rand -base64 32
```

Add the generated secret to your `.env` file as `JWT_SECRET`.

---

## � Team

### Development Team

- **Rico Aldy Kusuma**
- **Muhammad Irfan Irsyad**
- **Zoe Mohamed**

### Institution

**Program Magang DSTI - Universitas Diponegoro**  
*Periode: September - Desember 2025*

---

## 🔗 Related Repositories

- **Front End**: [DIPSPORT-FE](https://github.com/dipo-devs/DIPSPORT-FE.git)

---

## 🙏 Acknowledgments

- **Universitas Diponegoro** - For project support
- **Apollo GraphQL** - For excellent GraphQL tooling
- **Prisma Team** - For the amazing ORM
- **MinIO** - For object storage solution

---

## 📝 License

This project is developed as part of the internship program at Universitas Diponegoro and is intended for educational purposes.

---

<div align="center">

**Built with ❤️ by VENUE UNDIP Team**

*Simplifying sports field booking for Universitas Diponegoro community*

**[⬆ Back to Top](#-venue-undip---sports-field-booking-platform)**

</div>