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

Server runs on `http://localhost:5000`.

## Testing with Postman

### Setup
1. Open Postman, create a new collection called "Users CRUD API"
2. **Seed users first:** `npm run seed` (creates admin + 3 users)

### Flow
1. Login as admin to get a token
2. Copy the `accessToken` from the response
3. For protected endpoints: go to **Authorization** tab, select **Bearer Token**, paste the token
4. For requests with a body: go to **Body** tab, select **raw** and **JSON**

### Postman Request Table

| Method | URL | Auth | Headers | Body (raw JSON) |
|--------|-----|------|---------|-----------------|
| `POST` | `http://localhost:5000/api/auth/register` | None | — | `{"name":"Jane","email":"jane@example.com","password":"secret123"}` |
| `POST` | `http://localhost:5000/api/auth/login` | None | — | `{"email":"admin@example.com","password":"password123"}` |
| `GET` | `http://localhost:5000/api/auth/me` | Bearer Token | — | — |
| `GET` | `http://localhost:5000/api/users` | Bearer Token | — | — |
| `GET` | `http://localhost:5000/api/users?search=john&role=user&page=1&limit=5` | Bearer Token | — | — |
| `GET` | `http://localhost:5000/api/users/1` | Bearer Token | — | — |
| `POST` | `http://localhost:5000/api/users` | Bearer Token | — | `{"name":"New User","email":"new@example.com","password":"password123","role":"user"}` |
| `PUT` | `http://localhost:5000/api/users/1` | Bearer Token | — | `{"name":"Updated Name","email":"updated@example.com"}` |
| `DELETE` | `http://localhost:5000/api/users/5` | Bearer Token | — | — |
| `GET` | `http://localhost:5000/api/posts` | None | — | — |
| `GET` | `http://localhost:5000/api/posts?tag=express&page=1&limit=10` | None | — | — |
| `GET` | `http://localhost:5000/api/posts/1` | None | — | — |
| `POST` | `http://localhost:5000/api/posts` | Bearer Token | — | `{"title":"My Post","content":"Hello world","tags":"express,nodejs","published":true}` |
| `PATCH` | `http://localhost:5000/api/posts/1` | Bearer Token | — | `{"title":"Updated Title","published":false}` |
| `DELETE` | `http://localhost:5000/api/posts/1` | Bearer Token | — | — |

> **Tip:** For `GET` and `DELETE` requests, leave the Body tab empty. For `POST`, `PUT`, `PATCH` select Body > raw > JSON and paste the JSON.
