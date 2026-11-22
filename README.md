# 🎓 Campus Pulse

A role-based campus social platform for JKLU university students — built as a V1 academic project.

Students follow clubs, vote on polls, RSVP to events, like and bookmark posts, and browse a live feed. Organisations publish announcements, polls, and events. Admins manage the platform.

---

## 🧱 Tech Stack

| Layer      | Technology                                        |
|------------|---------------------------------------------------|
| Frontend   | React 19, Vite 8, React Router 7                  |
| Backend    | Node.js v24, Express 5                            |
| Database   | MongoDB Atlas, Mongoose 9                         |
| Auth       | JWT httpOnly cookies, bcryptjs                    |
| Security   | Helmet, CORS (allowlist), env-based secrets       |
| Deployment | Vercel (frontend) + Render (backend)              |

---

## 🗂️ Project Structure

```
CampusPulse/
├── client/               # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx           # All page components & routing
│   │   ├── config/api.js     # Centralised API base URL
│   │   └── context/AuthContext.jsx  # Global auth state
│   ├── .env.example
│   └── vercel.json           # SPA rewrite rule for Vercel
│
└── server/               # Express backend
    ├── src/
    │   ├── config/
    │   │   ├── db.js         # MongoDB Atlas connection
    │   │   └── seed.js       # Admin + org seeder
    │   ├── controllers/      # Route logic
    │   ├── middleware/        # protect, authorize (JWT)
    │   ├── models/           # Mongoose schemas
    │   ├── routes/           # Express routers
    │   └── app.js            # Express app setup (Helmet, CORS)
    └── .env.example
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/diksha-shekhawat/CampusPulse.git
cd CampusPulse

npm install --prefix server
npm install --prefix client
```

### 2. Configure environment variables

**Backend** — copy and fill in `server/.env`:

```bash
cp server/.env.example server/.env
```

```env
PORT=5050
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/campuspulse?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
```

**Frontend** — copy `client/.env.example` (optional for local dev, defaults to `http://localhost:5050`):

```bash
cp client/.env.example client/.env
```

### 3. Seed the database

Run once to create the Admin account and a sample Organisation:

```bash
node server/src/config/seed.js
```

This prints the generated credentials to the console — save them.

### 4. Start development servers

```bash
# Terminal 1 — backend (nodemon, port 5050)
npm run dev --prefix server

# Terminal 2 — frontend (Vite, port 5173)
npm run dev --prefix client
```

Open **http://localhost:5173**

---

## 👤 Roles & Demo Credentials

| Role         | How to get credentials                        |
|--------------|-----------------------------------------------|
| **Admin**    | Printed by `seed.js` on first run             |
| **Organisation** | Admin creates org accounts from the Admin dashboard; temp password is printed |
| **Student**  | Self-register at `/register` with a `@jklu.edu.in` email |

---

## 🗺️ API Routes Summary

### Auth
| Method | Endpoint                        | Access    |
|--------|---------------------------------|-----------|
| POST   | `/api/auth/student/register`    | Public    |
| POST   | `/api/auth/student/login`       | Public    |
| POST   | `/api/auth/organisation/login`  | Public    |
| POST   | `/api/auth/admin/login`         | Public    |
| GET    | `/api/auth/me`                  | Protected |
| POST   | `/api/auth/logout`              | Protected |

### Posts
| Method | Endpoint                       | Access        |
|--------|--------------------------------|---------------|
| POST   | `/api/posts`                   | Organisation  |
| GET    | `/api/posts/feed`              | Public/Auth   |
| GET    | `/api/posts/my-posts`          | Organisation  |
| GET    | `/api/posts/saved`             | Student       |
| GET    | `/api/posts/upcoming-events`   | Public        |
| DELETE | `/api/posts/:id`               | Organisation  |
| POST   | `/api/posts/:id/vote`          | Student       |
| POST   | `/api/posts/:id/register`      | Student       |
| POST   | `/api/posts/:id/like`          | Student       |
| DELETE | `/api/posts/:id/like`          | Student       |
| POST   | `/api/posts/:id/save`          | Student       |
| DELETE | `/api/posts/:id/save`          | Student       |

### Organisations
| Method | Endpoint                          | Access    |
|--------|-----------------------------------|-----------|
| GET    | `/api/organisations`              | Public    |
| POST   | `/api/organisations/:id/follow`   | Student   |
| DELETE | `/api/organisations/:id/follow`   | Student   |

### Admin
| Method | Endpoint                         | Access |
|--------|----------------------------------|--------|
| POST   | `/api/admin/organisations`       | Admin  |

---

## 🚀 Deployment

### Backend → Render
1. Create a new **Web Service** pointing to the repo root, build command `npm install --prefix server`, start command `node server/src/server.js`
2. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL=<your-vercel-url>`

### Frontend → Vercel
1. Set **Root Directory** to `client`
2. Add environment variable: `VITE_API_URL=<your-render-url>`
3. `vercel.json` SPA rewrite is already included

---

## 📋 V1 Feature Checklist

- [x] Student registration (JKLU email domain check)
- [x] JWT httpOnly cookie auth (student, org, admin)
- [x] Session restore on page reload
- [x] Organisation account creation by Admin
- [x] Org mandatory first-login password change
- [x] Post types: Normal (photo+caption), Poll, Event
- [x] Student dual feed — Discover & Following tabs
- [x] Club directory with follow/unfollow
- [x] Poll voting (1 vote per student, enforced server-side)
- [x] Event RSVP with toggle cancel + past-event guard
- [x] Like & Save (bookmark) with idempotent toggle
- [x] Saved bookmarks tab
- [x] Upcoming events spotlight (Today / Tomorrow / Upcoming)
- [x] Card-level inline alerts (no global banners)
- [x] Helmet security headers
- [x] Centralised API config (env-driven base URL)
- [x] Vercel SPA rewrite + `.env.example` files
