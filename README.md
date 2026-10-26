# BorrowBack

**Community Resource Sharing & Temporary Borrowing Platform**  
*Production-Quality Community Resource Sharing Platform — Full-Stack TypeScript Specification*

---

## 1. Overview & Charter

BorrowBack is a community-based platform designed to make item borrowing structured, reliable, and transparent. Instead of informal, untracked lending, BorrowBack provides:
- **Date Range Requests:** Users specify pickup and return dates with automatic date conflict prevention.
- **Mutual Confirmations:** Both the owner and borrower physically confirm pickup and return with condition notes.
- **Accountability & Reviews:** Completed borrowings enable mutual 1-to-5 star ratings and reviews.
- **Security & Authorization:** Server-enforced ownership, HttpOnly JWT cookies, soft-archiving, and input validation.

---

## 2. Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express.js, TypeScript, Mongoose
- **Database:** MongoDB (Local or MongoDB Atlas)
- **Security & Auth:** bcryptjs, jsonwebtoken (HttpOnly cookies, SameSite=Lax), Helmet, CORS

---

## 3. Repository Structure

```text
BorrowBack/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Button, Input, Select, Badge, Modal, Toast, EmptyState, Skeleton
│   │   │   ├── layout/        # Navbar, Footer, AppShell, ProtectedRoute
│   │   │   ├── items/         # ItemCard, ItemGrid, ItemFilters, ItemForm
│   │   │   └── requests/      # RequestCard, RequestStatus, DateRangeForm, ConfirmationPanel
│   │   ├── pages/             # 13 dedicated pages matching the specification
│   │   ├── context/           # AuthContext (loads /api/auth/me, manages auth state)
│   │   ├── services/          # Typed API fetchers (api, auth, item, request, review)
│   │   ├── types/             # TypeScript interfaces for API & Domain models
│   │   ├── utils/             # Date formatting & validation helpers
│   │   ├── App.tsx            # Main router and route definitions
│   │   ├── main.tsx           # React entry point
│   │   └── index.css          # Tailwind CSS directives & color tokens
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
├── server/
│   ├── src/
│   │   ├── config/            # db.ts (Mongoose connection)
│   │   ├── controllers/       # auth, item, request, review, dashboard
│   │   ├── middleware/        # auth.middleware.ts, error.middleware.ts
│   │   ├── models/            # User.ts, Item.ts, BorrowRequest.ts, Review.ts
│   │   ├── routes/            # auth, item, request, review, dashboard
│   │   ├── services/          # availability.service.ts, requestLifecycle.service.ts
│   │   ├── scripts/           # seed.ts (idempotent demo seed script)
│   │   ├── tests/             # acceptance.test.ts (A1 - A15 automated suite)
│   │   ├── app.ts             # Express application and middleware setup
│   │   └── server.ts          # Server listener and graceful shutdown
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── .gitignore
└── README.md
```

---

## 4. Prerequisites

- **Node.js:** v20.19+ or v22.12+ (tested on Node v24.16.0)
- **npm:** v10+ (tested on npm 11.13.0)
- **MongoDB:** A running local instance (`mongodb://localhost:27017/borrowback`) or a free MongoDB Atlas connection string.

---

## 5. Configuration & Environment Variables

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/borrowback
JWT_SECRET=your_long_random_jwt_secret_key_at_least_32_characters
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

> **Note for MongoDB Atlas:** Replace `MONGODB_URI` with your connection string:  
> `mongodb+srv://<username>:<password>@cluster0.mongodb.net/borrowback?retryWrites=true&w=majority`

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 6. Installation & Running Locally

### Step 1: Install Dependencies
Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd server
npm install
```

**Terminal 2 (Frontend):**
```bash
cd client
npm install
```

---

### Step 2: Seed Demo Data (Optional, Development Only)
To populate 2 demo accounts and 7 realistic sample listings across multiple categories:
```bash
cd server
npm run seed:demo
```

#### Demo Credentials:
| Role | Email | Password |
|---|---|---|
| Member 1 (Alice Miller) | `alice@example.com` | `BorrowPass123!` |
| Member 2 (Bob Chen) | `bob@example.com` | `BorrowPass123!` |

*(Normal user registration and login work out-of-the-box without running the seed script).*

---

### Step 3: Run the Application

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```
*API runs at `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 7. Production Builds

Both frontend and backend compile strictly with zero TypeScript errors:

```bash
# Build backend TypeScript into server/dist
cd server
npm run build

# Build frontend into client/dist
cd client
npm run build
```

---

## 8. Verification & Acceptance Tests

The test suite validates all 15 scenarios from Section 19 of the specification (`A1` through `A15`):

```bash
cd server
npm run test:acceptance
```

### Verified Test Matrix:
- **A1:** Register with valid details; cookie session persists; `/api/auth/me` returns safe user.
- **A2:** Register with same email again; rejected with 409 duplicate error.
- **A3:** Login with invalid password; returns 401 and creates no cookie session.
- **A4:** Create valid listing; persists and appears in My Items and public Browse.
- **A5:** Unauthorized attempt to edit another member's listing; rejected with 403.
- **A6:** Owner attempts to borrow own item; rejected with 400.
- **A7:** Request with invalid date range (past dates or end date before start date); rejected with 400.
- **A8:** Owner approves non-conflicting pending request; status becomes `approved`.
- **A9:** Attempt to approve second overlapping request for same item; returns 409 conflict and second request remains `pending`.
- **A10:** Both owner and borrower confirm pickup; status transitions to `borrowed` and `borrowedAt` timestamp is recorded.
- **A11:** One participant confirms return; status transitions to `return_pending`.
- **A12:** Second participant confirms return; status transitions to `completed` and `completedAt` timestamp is recorded.
- **A13:** Reviews blocked before completion or duplicate reviews from same reviewer; rejected with 400/409.
- **A14:** Attempt to archive item with active or pending borrowing requests; rejected with 409 conflict.
- **A15:** Logout clears session cookie; protected routes return 401.

---

## 9. Implemented Pages & Routes

| Path | Page Component | Access | Purpose |
|---|---|---|---|
| `/` | `HomePage` | Public | Hero, 3 sample item cards, trust strip, how it works, categories, recent listings, closing CTA. |
| `/browse` | `BrowseItemsPage` | Public | Search (title/description), category, condition, sort filters, pagination. |
| `/items/:id` | `ItemDetailsPage` | Public | Category illustration tile, details, safe owner summary, date request panel. |
| `/login` | `LoginPage` | Public | Sign in form, show/hide password, redirect to intended destination. |
| `/register` | `RegisterPage` | Public | Sign up form with inline validation. |
| `/items/new` | `CreateItemPage` | Signed in | Create listing form with required markers and helper text. |
| `/items/:id/edit` | `EditItemPage` | Owner only | Server-checked owner listing modification and status management. |
| `/dashboard` | `DashboardPage` | Signed in | 4 API-driven summary cards, quick actions, recent activity timeline. |
| `/my-items` | `MyItemsPage` | Signed in | Manage inventory, status filters, archive with conflict check. |
| `/my-requests` | `MyRequestsPage` | Signed in | Manage outgoing borrow requests, pickup/return confirmations, cancellation. |
| `/incoming-requests`| `IncomingRequestsPage` | Signed in | Owner request decisions (Approve/Reject with 409 overlap handling), pickup/return confirmations. |
| `/history` | `BorrowingHistoryPage` | Signed in | Completed and historical borrowing records with 1-5 star review submission. |
| `*` | `NotFoundPage` | Public | 404 error page with navigation back to Browse. |

---

## 10. Known Limitations & Explicit MVP Boundary

As defined in the specification's explicit non-goals:
- Payments and financial transactions are excluded (BorrowBack is a community resource sharing platform).
- Direct in-app instant chat is excluded (contact is handled via pickup meeting notes).
- Third-party image hosting is excluded (items use SVG-based category illustration tiles).
- Microservices, geolocation maps, and external AI APIs are not included in this MVP.
