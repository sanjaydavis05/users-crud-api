# Task 01 - Users CRUD API

A RESTful Users API with full CRUD operations built with Express.js, better-sqlite3, and JWT authentication.

## Features

- Full CRUD: Create, Read, Update, Delete users
- JWT authentication (register, login, protected routes)
- Role-based access control (admin / user)
- Search users by name or email (`?search=`)
- Pagination (`?page=` & `?limit=`)
- Input validation (Zod schemas)
- Centralized error handling with proper HTTP status codes
- Security headers (Helmet), CORS, rate limiting
- Request logging (Morgan)
- Example Posts resource with CRUD

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite (better-sqlite3)
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Validation:** Zod
- **Security:** Helmet, express-rate-limit, CORS

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login, get JWT token |
| GET | `/api/auth/me` | Yes | Get current user profile |

### Users (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Admin | List users (`?search=`, `?role=`, `?page=`, `?limit=`) |
| GET | `/api/users/:id` | Yes | Get user by ID |
| POST | `/api/users` | Admin | Create a new user |
| PUT | `/api/users/:id` | Admin/self | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |

### Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts` | No | List published posts (`?page=`, `?limit=`, `?tag=`) |
| GET | `/api/posts/:id` | No | Get single post |
| POST | `/api/posts` | Yes | Create a post |
| PATCH | `/api/posts/:id` | Yes | Update own post |
| DELETE | `/api/posts/:id` | Yes | Delete own post |

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env - set JWT_SECRET

# Seed the database
npm run seed

# Start development server
npm run dev
```

Server runs on `http://localhost:3000`.

## Testing with Postman

1. **Register/Login** - Send `POST /api/auth/login` with `{"email": "admin@example.com", "password": "password123"}`
2. **Copy the accessToken** from the response
3. **Set Authorization header** - Add `Authorization: Bearer <token>` to subsequent requests
4. **Test CRUD** - Use the endpoints above with the admin token

### Example Requests

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","password":"secret123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Create user (admin)
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"new@example.com","password":"password123"}'

# List users with search
curl "http://localhost:3000/api/users?search=john&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```
