# Multi-Platform Post Composer

A full-stack web application for composing a single post and publishing or scheduling it across multiple social platforms (X, Reddit, LinkedIn, Facebook, Instagram, Threads) from one screen.

## Features

- **Multi-platform composer** with per-platform validation (character limits, media counts, Reddit title/subreddit)
- **JWT authentication** with email OTP verification and password reset
- **Post scheduling** via node-cron (runs every minute)
- **Role-based access**: customers manage their own posts; admins see and manage all posts and users
- **Mock publishing** — platform APIs are simulated (see Future Integration below)

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React (Vite), React Router, Axios, Framer Motion, plain CSS |
| Backend | Node.js, Express, MongoDB (Mongoose) |
| Auth | JWT, bcryptjs, Nodemailer (Gmail SMTP) |
| Security | helmet, cors, express-rate-limit |

## Prerequisites

- **Node.js** 18+
- **MongoDB** running locally or a MongoDB Atlas connection string
- **Gmail account** with an [App Password](https://support.google.com/accounts/answer/185833) for SMTP

## Project Structure

```
post-composer/
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── models/User.js, Post.js
│   ├── utils/otp.js, sendEmail.js, platformValidators.js
│   ├── middleware/auth.js, roleCheck.js, rateLimiter.js
│   ├── controllers/authController.js, postController.js, adminController.js
│   ├── routes/authRoutes.js, postRoutes.js, adminRoutes.js, platformRoutes.js
│   ├── services/scheduler.js, publishers/ (x, reddit, linkedin, facebook, instagram, threads)
│   └── .env.example
├── frontend/
│   └── src/ (pages, components, context, api, utils)
├── README.md
└── .gitignore
```

## Setup

### 1. MongoDB

**Local:**
```bash
# Start MongoDB (varies by OS)
mongod
```

**Atlas:** Create a free cluster and copy your connection string.

### 2. Backend

```bash
cd post-composer/backend
cp .env.example .env
# Edit .env with your values
npm install
npm start
```

Backend runs at `http://localhost:5000`.

### 3. Frontend

```bash
cd post-composer/frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` to the backend.

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

| Variable | Description |
|----------|-------------|
| `PORT` | Backend port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `GMAIL_USER` | Gmail address for sending OTP/reset emails |
| `GMAIL_APP_PASSWORD` | Gmail App Password (not your login password) |
| `FRONTEND_URL` | Frontend origin for CORS and reset links |
| `SCHEDULER_INTERVAL_CRON` | Cron expression (default: every minute) |

## API Overview

### Auth
- `POST /api/auth/signup` — Register (first user becomes admin)
- `POST /api/auth/verify-otp` — Verify email OTP
- `POST /api/auth/resend-otp` — Resend OTP (rate limited: 1/30s)
- `POST /api/auth/login` — Login (requires verified email)
- `POST /api/auth/forgot-password` — Request reset link
- `POST /api/auth/reset-password` — Reset password with token
- `GET /api/auth/me` — Current user (JWT required)

### Posts
- `POST /api/posts` — Create post
- `GET /api/posts` — List posts (own posts for customers, all for admins via feed)
- `GET /api/posts/:id` — Get single post
- `PUT /api/posts/:id` — Update post (not if published)
- `DELETE /api/posts/:id` — Soft delete
- `POST /api/posts/:id/publish` — Publish immediately (mocked)
- `GET /api/platforms` — Platform limits metadata

### Admin (admin role required)
- `GET /api/admin/users` — List all users
- `PATCH /api/admin/users/:id/role` — Toggle customer/admin role
- `GET /api/admin/posts` — List all posts

## Platform Validation Rules

| Platform | Text Limit | Media |
|----------|-----------|-------|
| X | 280 | max 4 |
| Reddit | 40,000 body, 300 title | title + subreddit required |
| LinkedIn | 3,000 | max 9 |
| Facebook | 63,206 | max 10 |
| Instagram | 2,200 | min 1 required |
| Threads | 500 | max 10 |

## Future Integration

> **Publishing to real platforms is currently MOCKED.**

The `services/publishers/` modules simulate API calls with a 100–300ms delay and return success/failure responses. Reddit fails without a subreddit; Instagram fails without media. To integrate real APIs, replace the mock logic in each publisher file with actual OAuth flows and platform SDK/API calls.

## First User = Admin

The very first account registered automatically receives the `admin` role. Subsequent signups are `customer` by default. Admins can promote/demote users from the Admin dashboard.

## License

MIT
