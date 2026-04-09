# Legal Case Management System

A complete MERN stack application for law firms to manage clients, legal cases, documents, hearings, and case timelines with JWT authentication and role-based access.

## Tech Stack

- Frontend: React + Vite + Axios + React Router + plain CSS
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT
- Password Security: bcrypt
- File Uploads: Multer

## Folder Structure

```text
fullstack project/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- scripts/
|   |-- uploads/
|   |-- .env.example
|   |-- package.json
|   `-- server.js
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   `-- styles/
|   |-- .env.example
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|-- sample-test-data.json
`-- README.md
```

## Core Features

- Secure registration and login with JWT and bcrypt
- Role-aware accounts for `Admin` and `Lawyer`
- CRUD management for clients, cases, documents, and hearings
- Multer-based secure document uploads with file type and size checks
- Timeline tracking for case events and manual case notes
- Dashboard summary cards with upcoming hearings and recent case activity
- Search and status filters for case and client records
- Hearing reminder alerts in the browser for near-term hearings

## Authentication Notes

- The first registered user becomes `Admin`.
- Later self-registrations default to `Lawyer`.
- Protected API routes require `Authorization: Bearer <token>`.

## API Route List

### Auth

- `POST /api/auth/register` - register a user
- `POST /api/auth/login` - login and receive JWT
- `GET /api/auth/profile` - fetch current authenticated user

### Dashboard

- `GET /api/dashboard/summary` - summary stats, upcoming hearings, recent cases

### Clients

- `GET /api/clients` - list clients, optional `keyword`
- `POST /api/clients` - create client
- `GET /api/clients/:id` - get single client
- `PUT /api/clients/:id` - update client
- `DELETE /api/clients/:id` - delete client

### Cases

- `GET /api/cases` - list cases, optional `keyword`, `status`, `clientId`
- `GET /api/cases/stats` - case counters
- `POST /api/cases` - create case
- `GET /api/cases/:id` - case details with documents, hearings, timeline
- `PUT /api/cases/:id` - update case
- `DELETE /api/cases/:id` - delete case and related records

### Documents

- `GET /api/documents` - list documents, optional `caseId`
- `POST /api/documents` - upload document using form-data field `file`
- `DELETE /api/documents/:id` - delete document

### Hearings

- `GET /api/hearings` - list hearings, optional `caseId`
- `POST /api/hearings` - create hearing
- `PUT /api/hearings/:id` - update hearing
- `DELETE /api/hearings/:id` - delete hearing

### Timeline

- `GET /api/timelines/:caseId` - fetch timeline entries for a case
- `POST /api/timelines` - add timeline activity manually

## How To Run

### 1. Backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

### 3. Database

- Start MongoDB locally.
- Default connection string in the example env file: `mongodb://127.0.0.1:27017/legal_case_management`

### 4. Optional Seed Data

```bash
cd backend
npm run seed
```

Seed credentials:

- Admin: `admin@legalcms.com` / `Password@123`
- Lawyer: `lawyer@legalcms.com` / `Password@123`

## Frontend Pages

- `/login`
- `/register`
- `/dashboard`
- `/clients`
- `/cases`
- `/documents`
- `/hearings`
- `/timeline`

## Security Measures

- JWT middleware for protected routes
- Password hashing with bcrypt
- Role-aware registration behavior
- Server-side validation for required fields
- Multer file type and size restrictions
- Backend-managed upload storage under a dedicated `uploads` directory

## Sample Manual Test Flow

1. Register the first user as admin.
2. Create a client record.
3. Create a case linked to that client.
4. Upload a case document from the Documents page.
5. Schedule a hearing from the Hearings page.
6. Add a custom activity note in Timeline.
7. Confirm the Dashboard updates the summary cards and recent activity.
