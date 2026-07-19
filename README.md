<div align="center">

<img src="./assets/logo-lockup.svg" alt="Meridian logo" width="280" />

**One post. Every direction.**

Compose once. Publish everywhere.

<img src="./assets/tech-stack.svg" alt="Tech Stack" width="600" style="margin: 1.5rem 0;" />

[Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [Project Structure](#project-structure) · [API Reference](#api-reference) · [Roadmap](#roadmap)

</div>

---

## What is Meridian?

Meridian is a multi-platform post composer. Write a post once, choose which platforms it
should go to — **X, Reddit, LinkedIn, Facebook, Instagram, Threads** — and Meridian validates
your content against each platform's rules (character limits, required fields, media limits)
before you ever hit submit. Publish immediately or schedule for later; Meridian's background
scheduler takes care of the rest.

Built with role-based access: **customers** manage their own posts, **admins** get full
visibility and control across every user's content.

> **Note:** Publishing to real platforms is currently **mocked** (simulated success/failure)
> for demonstration purposes. Real OAuth integration per platform is a planned future addition
> — see [Roadmap](#roadmap).

---

## Features

-  **Unified composer** — one text box, multi-platform targeting
-  **Live per-platform validation** — character counters, required fields (e.g. Reddit
  subreddit + title), media limits, checked as you type and re-verified server-side
-  **Scheduling** — set a time, Meridian publishes automatically when it's due, with
  automatic retry on failure
-  **Feed dashboard** — every post you've created, filterable by status and platform, with
  inline edit/delete/publish-now actions
-  **Secure auth** — email + password with OTP email verification on signup, and a
  token-based forgot/reset password flow
-  **Role-based access** — customer vs admin, admins can view and manage all users' posts
  and promote/demote roles
-  **Polished UI** — calm, editorial design system with considered motion throughout
  (see `MERIDIAN_UX_DESIGN.md`)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios, Framer Motion |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcryptjs, Nodemailer (OTP + password reset emails) |
| Scheduling | node-cron |
| Security | express-rate-limit, helmet, cors |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a connection string (e.g. MongoDB Atlas)
- A Gmail account with an **App Password** generated (Google Account → Security → App
  Passwords) for sending OTP/reset emails

### 1. Clone and install

```bash
git clone <your-repo-url> meridian
cd meridian

# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/meridian
JWT_SECRET=<long random string>
JWT_EXPIRES_IN=7d
GMAIL_USER=<your gmail address>
GMAIL_APP_PASSWORD=<generated app password>
FRONTEND_URL=http://localhost:5173
SCHEDULER_INTERVAL_CRON=*/1 * * * *
```

### 3. Run it

```bash
# terminal 1 — backend
cd backend
npm run dev

# terminal 2 — frontend
cd frontend
npm run dev
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:5173`. The **first
account you register automatically becomes admin**; every account after that is a customer.

---

## Project Structure

```
meridian/
  backend/
    server.js
    config/db.js
    models/            User.js, Post.js
    utils/             otp.js, sendEmail.js, platformValidators.js
    middleware/         auth.js, roleCheck.js, rateLimiter.js
    controllers/        authController.js, postController.js, adminController.js
    routes/              authRoutes.js, postRoutes.js, adminRoutes.js, platformRoutes.js
    services/
      scheduler.js
      publishers/        index.js, x.js, reddit.js, linkedin.js, facebook.js, instagram.js
  frontend/
    src/
      api/axios.js
      context/AuthContext.jsx
      components/         ProtectedRoute, PlatformSelector, CharCounter, PostCard, Toast, Spinner
      pages/
        auth/              Signup, VerifyOtp, Login, ForgotPassword, ResetPassword
        posts/              Composer, Feed, Admin
      utils/platformLimits.js
  assets/
    logo-mark.svg
    logo-lockup.svg
  MASTER_BUILD_PROMPT.md    full technical build spec
  MERIDIAN_UX_DESIGN.md     full UI/UX design spec
```

---

## API Reference

**Auth**
```
POST   /api/auth/signup
POST   /api/auth/verify-otp
POST   /api/auth/resend-otp
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

**Posts**
```
POST    /api/posts                 create
GET     /api/posts                 list (own posts, or all for admin) — ?status=&platform=
GET     /api/posts/:id             get one
PUT     /api/posts/:id             edit (blocked once published)
DELETE  /api/posts/:id             soft delete
POST    /api/posts/:id/publish     publish immediately
GET     /api/platforms             platform rules (drives UI)
```

**Admin**
```
GET     /api/admin/users
PATCH   /api/admin/users/:id/role
```

All `/api/posts/*` and `/api/admin/*` routes require `Authorization: Bearer <token>`.

---

## Platform Validation Rules

| Platform | Text limit | Requirements |
|---|---|---|
| X (Twitter) | 280 chars | max 4 media |
| Reddit | 40,000 chars (300 title) | title + subreddit required |
| LinkedIn | 3,000 chars | max 9 media |
| Facebook | 63,206 chars | max 10 media |
| Instagram | 2,200 chars | at least 1 media required |
| Threads | 500 chars | max 10 media |

---

## Design System

Meridian's visual language is warm, editorial, and calm — italic serif headings, humanist sans
body text, a clay-terracotta accent on a cream background. Full color tokens, typography scale,
component states, and page-by-page interaction specs live in
[`MERIDIAN_UX_DESIGN.md`](./MERIDIAN_UX_DESIGN.md).

---

## Roadmap

- [ ] Real OAuth integration per platform (replace mocked publishers)
- [ ] Media file upload (Cloudinary/S3) instead of URL-only attachments
- [ ] Post approval workflow option for admin-managed teams
- [ ] Analytics on published posts (engagement pulled back from platform APIs)
- [ ] Calendar view for scheduled posts
- [ ] Google/GitHub OAuth login

---

## License

MIT — free to use, modify, and build on.

<div align="center">
<sub>Built with Meridian's own design system. See <code>MASTER_BUILD_PROMPT.md</code> for the full technical build order.</sub>
</div>
