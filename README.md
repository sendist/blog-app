# Blog CMS – Full-Stack Mini Application

A full-stack Blog / Content Management System built to demonstrate authentication, CRUD operations, role-based access control (RBAC), REST API integration, and clean frontend & backend architecture.

**Context:** This project was developed as part of a Full-Stack Developer technical assessment.

## Features

### Authentication
* User registration  
* User login & logout  
* JWT-based authentication using httpOnly cookies  
* Secure password hashing using bcrypt

### User Features
* View profile  
* Update profile information  
* Create, edit, and delete own blog posts  
* Manage post status (Draft / Published / Archived)

### Blog / Post Management
* Public blog listing (published posts only)  
* Public blog detail view  
* Private dashboard for managing personal posts  

### Admin Features
* View all users  
* Delete users  
* View all posts across users  
* Moderate post status (publish / archive)  
* Manage user roles  

---

## Tech Stack

### Frontend
* **Framework:** Next.js
* **Styling:** Tailwind CSS
* **UI Components:** shadcn
* **State Handling:** React hooks
* **API:** tanstack, axios, and cookie-based JWT
* **Validation:** zod

### Backend
* **Framework:** NestJS
* **Authentication:** JWT (httpOnly cookies)
* **Authorization:** Role-based guards (USER / ADMIN)
* **ORM:** Prisma
* **Validation:** class-validator

### Database
* **Database:** PostgreSQL
* **Provider:** Supabase
* **Relations:** One-to-many (User → Posts)

---

## Project Structure

### Backend
```bash
src/
├─ common/
│ ├─ decorators/
│ ├─ guard/
│ ├─ supabase/
│ └─ utils/
│
├─ modules/
│ ├─ admin/
│ ├─ auth/
│ ├─ posts/
│ └─ users/
```
### Frontend
```bash
app/
├─ (admin)/
├─ (auth)/
├─ (dashboard)/
├─ (feed)/
├─ posts/
│
components/
├─ layout/
├─ providers/
├─ ui/
│
hooks/
lib/
public/
```

---

## API Overview

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### User
- `GET /api/me`
- `PATCH /api/me`
- `POST /api/avatar`

### Posts (User)
- `POST /api/posts`
- `GET /api/posts`
- `GET /api/posts/:idOrSlug`
- `PATCH /api/posts/:idOrSlug`
- `DELETE /api/posts/:idOrSlug`

### Public Blog
- `GET /api/public/posts`
- `GET /api/public/posts/:slug`

### Admin
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/role`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/posts`
- `PATCH /api/admin/posts/:id/status`

---


## Setup & Running the Project

### Prerequisites
- Node.js ≥ 20.17.0
- PostgreSQL database (Supabase)
---

### Backend Setup
```bash
cd apps/backend
npm install
npx prisma migrate
npx prisma generate
npm run start
```

### Frontend Setup
```bash
cd apps/frontend
npm install
npm run dev
```

### Environment Variable:
#### Backend
```bash
DATABASE_URL
DIRECT_URL
JWT_SECRET
JWT_EXPIRES_IN
FRONTEND_URL
SUPABASE_URL
SUPABASE_KEY
```
#### Frontend
```bash
NEXT_PUBLIC_API_URL
```
---
## Deployment Links
- **Frontend (Vercel):**  
  https://blog-app-frontend-drab-tau.vercel.app/

  note: There may be a short delay when accessing the application for the first time due to the use of Render’s free deployment tier.

- **Backend (Render):**  
  https://blog-app-backend-0ioc.onrender.com

---

##  Demo
- **Demo Video (YouTube):**  
  https://youtu.be/DFNWTDeK_GE

---