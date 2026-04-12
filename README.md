# Legal Case Management System

A full-stack MERN application built for law firms to manage clients, legal cases, documents, hearings, and case timelines — with JWT authentication, role-based access control, email reminders, and an admin promotion workflow.

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Security:** bcrypt
- **File Uploads:** Multer
- **Email Notifications:** Nodemailer (Gmail SMTP)
- **Scheduled Jobs:** node-cron
- **Rate Limiting:** express-rate-limit
- **Logging:** Morgan
- **Dev Server:** Nodemon

### Frontend
- **Framework:** React 18 + Vite
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Styling:** Plain CSS (global.css)

---

## Folder Structure

```text
fullstack project/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminRequestController.js
│   │   ├── authController.js
│   │   ├── caseController.js
│   │   ├── clientController.js
│   │   ├── dashboardController.js
│   │   ├── documentController.js
│   │   ├── hearingController.js
│   │   ├── timelineController.js
│   │   └── timelineHelpers.js
│   ├── cron/
│   │   └── reminders.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── AdminRequest.js
│   │   ├── Case.js
│   │   ├── Client.js
│   │   ├── Document.js
│   │   ├── Hearing.js
│   │   ├── Timeline.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRequestRoutes.js
│   │   ├── authRoutes.js
│   │   ├── caseRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── hearingRoutes.js
│   │   └── timelineRoutes.js
│   ├── scripts/
│   │   ├── seed.js
│   │   └── clear.js
│   ├── utils/
│   │   └── emailService.js
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── TimelineList.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminRequestsPage.jsx
│   │   │   ├── CasesPage.jsx
│   │   │   ├── ClientsPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── DocumentsPage.jsx
│   │   │   ├── HearingsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── TimelinePage.jsx
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── sample-test-data.json
└── README.md
```

---

## Core Features

- **Authentication** — Secure JWT-based login and registration with bcrypt password hashing
- **Role-Based Access Control (RBAC)** — Admin and Lawyer roles with protected routes
- **Admin Promotion Workflow** — Lawyers can request admin access; Admins can approve or reject requests
- **Client Management** — Full CRUD for client records with keyword search
- **Case Management** — Full CRUD with status filters, keyword search, and client linking
- **Document Uploads** — Multer-based file upload with type and size restrictions
- **Hearing Scheduler** — Schedule, update, and delete court hearings per case
- **Timeline Tracking** — Automatic and manual activity timeline per case
- **Dashboard** — Summary stats, upcoming hearings, and recent case activity
- **Email Reminders** — Nodemailer sends automated hearing reminder emails 48 hours before a hearing (via Gmail SMTP)
- **Cron Job Scheduler** — node-cron runs the reminder job daily at 8:00 AM
- **Rate Limiting** — express-rate-limit protects API endpoints from abuse

---

## Authentication & Roles

| Role | Access |
|------|--------|
| **Admin** | Full access — manage users, approve/reject admin requests, all CRUD |
| **Lawyer** | Standard access — manage clients, cases, documents, hearings |

- The **first registered user** automatically becomes `Admin`
- All subsequent registrations default to `Lawyer`
- A `Lawyer` can submit an admin access request via the app
- Protected API routes require: `Authorization: Bearer <token>`

---

## API Routes

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/profile` | Get current user profile |

### Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dashboard/summary` | Stats, upcoming hearings, recent cases |

### Clients
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/clients` | List all clients (optional: `?keyword=`) |
| POST | `/api/clients` | Create a client |
| GET | `/api/clients/:id` | Get a single client |
| PUT | `/api/clients/:id` | Update a client |
| DELETE | `/api/clients/:id` | Delete a client |

### Cases
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/cases` | List cases (optional: `?keyword=`, `?status=`, `?clientId=`) |
| GET | `/api/cases/stats` | Case status counters |
| POST | `/api/cases` | Create a case |
| GET | `/api/cases/:id` | Case details with documents, hearings, timeline |
| PUT | `/api/cases/:id` | Update a case |
| DELETE | `/api/cases/:id` | Delete case and all related records |

### Documents
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/documents` | List documents (optional: `?caseId=`) |
| POST | `/api/documents` | Upload document (`form-data` field: `file`) |
| DELETE | `/api/documents/:id` | Delete a document |

### Hearings
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/hearings` | List hearings (optional: `?caseId=`) |
| POST | `/api/hearings` | Create a hearing |
| PUT | `/api/hearings/:id` | Update a hearing |
| DELETE | `/api/hearings/:id` | Delete a hearing |

### Timeline
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/timelines/:caseId` | Get timeline entries for a case |
| POST | `/api/timelines` | Add a manual timeline note |

### Admin Requests
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin-requests` | Get all pending requests (Admin only) |
| POST | `/api/admin-requests` | Submit an admin access request (Lawyer only) |
| PUT | `/api/admin-requests/:id/approve` | Approve a request (Admin only) |
| PUT | `/api/admin-requests/:id/reject` | Reject a request (Admin only) |

---

## Frontend Pages

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login Page | Public |
| `/register` | Register Page | Public |
| `/dashboard` | Dashboard | All logged-in users |
| `/clients` | Clients Management | All logged-in users |
| `/cases` | Cases Management | All logged-in users |
| `/documents` | Document Uploads | All logged-in users |
| `/hearings` | Hearings Scheduler | All logged-in users |
| `/timeline` | Case Timeline | All logged-in users |
| `/admin-requests` | Admin Request Management | Admin only |

---

## How To Run Locally

### Prerequisites
- Node.js >= 18
- MongoDB running locally or a MongoDB Atlas URI

### 1. Backend

```bash
cd backend
copy .env.example .env   # Windows
# cp .env.example .env   # Mac/Linux
npm install
npm run dev
```

Backend runs at: `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
copy .env.example .env   # Windows
# cp .env.example .env   # Mac/Linux
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 3. Environment Variables

**backend/.env.example**
```env
MONGO_URI=mongodb://127.0.0.1:27017/legal_case_management
JWT_SECRET=your_jwt_secret
PORT=5000
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**frontend/.env.example**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
```

> **Gmail Setup:** For email reminders, use a Gmail account with a [Google App Password](https://myaccount.google.com/apppasswords) (not your regular password).

### 4. Optional Seed Data

```bash
cd backend
npm run seed
```

Seed credentials:
- **Admin:** `admin@legalcms.com` / `Password@123`
- **Lawyer:** `lawyer@legalcms.com` / `Password@123`

To clear seeded data:
```bash
node scripts/clear.js
```

---

## Security Measures

- JWT-based stateless authentication
- bcrypt password hashing (salt rounds: 10)
- Role-Based Access Control (Admin / Lawyer)
- Admin promotion request workflow — no direct role escalation
- express-rate-limit on API routes to prevent brute force
- Multer file type and size restrictions for uploads
- `.env` excluded from version control via `.gitignore`
- `uploads/` directory excluded from version control

---

## Sample Manual Test Flow

1. Register the first user — they become **Admin** automatically
2. Login and explore the **Dashboard**
3. Create a **Client** record
4. Create a **Case** linked to that client
5. Upload a **Document** from the Documents page
6. Schedule a **Hearing** for the case
7. Add a manual note in the **Timeline**
8. Register a second user (becomes **Lawyer**) and submit an **Admin Request**
9. Login as Admin and approve the request from the **Admin Requests** page
10. Confirm email reminder is triggered 48 hours before a hearing (requires Gmail config)
