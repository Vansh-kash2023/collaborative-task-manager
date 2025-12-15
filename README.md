# Collaborative Task Manager

A production-ready full-stack task management application with real-time collaboration features.

## Live Deployment

- **Frontend:** https://collaborative-task-manager-hezz4gpxg-vansh-kashyaps-projects.vercel.app/
- **Backend:** https://collaborative-task-manager-t4qz.onrender.com/health

## Tech Stack

**Backend:** Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, Socket.io, JWT, Bcrypt, Zod

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, SWR, Socket.io Client, Axios, React Hook Form, date-fns

## Features

- User authentication with JWT (HttpOnly cookies)
- Task CRUD operations with validation
- Real-time task updates via Socket.io
- Task assignment to team members
- Task filtering and sorting
- Dashboard with task analytics
- Responsive UI design

## Project Structure

```
collaborative-task-manager/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and Socket.io configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── dtos/            # Data Transfer Objects with validation
│   │   ├── middleware/      # Authentication middleware
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions (JWT, errors)
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── Dockerfile           # Docker configuration for backend
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React context (Auth)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API clients and utilities
│   │   ├── pages/           # Next.js pages
│   │   ├── styles/          # Global styles
│   │   └── types/           # TypeScript types
│   └── package.json
└── docker-compose.yml       # Docker setup for PostgreSQL and Backend
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (Docker recommended)
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Vansh-kash2023/collaborative-task-manager.git
cd collaborative-task-manager
```

### 2. Database Setup

Start PostgreSQL using Docker:

```bash
docker-compose up -d postgres
```

The docker-compose.yml configures PostgreSQL on port 5433 to avoid conflicts with local installations.

**Alternative: Run entire backend with Docker:**
```bash
# This will start both PostgreSQL and backend
docker-compose up -d
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://postgres:password_postgres@127.0.0.1:5433/taskmanager?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

Run database migrations:

```bash
npx prisma generate
npx prisma db push
```

Start backend server:

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start frontend server:

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Usage

### Register and Login
1. Navigate to http://localhost:3000
2. Click "Register" or "Sign Up" to create a new account
3. Fill in your name, email, and password
4. Login with your credentials

### Managing Tasks
1. Go to the Dashboard or Tasks page
2. Click "Create New Task" button
3. Fill in task details (title, description, due date, priority, status)
4. Optionally assign the task to another user
5. Click "Update" or "Edit" to modify existing tasks
6. Click "Delete" to remove tasks you created

### Real-Time Collaboration
1. Open the app in multiple browser windows or tabs
2. Register different users in each window
3. Create or update a task in one window
4. See instant updates appear in all other windows
5. When you assign a task to someone, they receive a real-time notification

## API Contract Documentation

Base URL: `http://localhost:5000/api/v1`

### Authentication Endpoints

**Register User**
```
POST /api/v1/auth/register
Content-Type: application/json

Body: { "email", "password", "name" }
Response: { "success": true, "data": { "user": {...} } }
```

**Login**
```
POST /api/v1/auth/login
Content-Type: application/json

Body: { "email", "password" }
Response: { "success": true, "data": { "user": {...} } }
Note: JWT token set in HttpOnly cookie
```

**Get Profile**
```
GET /api/v1/auth/profile
Cookie: token=<jwt>

Response: { "success": true, "data": { "id", "email", "name" } }
```

**Logout**
```
POST /api/v1/auth/logout
Cookie: token=<jwt>

Response: { "success": true, "message": "Logged out successfully" }
```

**Update Profile**
```
PUT /api/v1/auth/profile
Cookie: token=<jwt>
Content-Type: application/json

Body: { "name": "New Name" }
Response: { "success": true, "data": { "user": {...} } }
```

### Task Endpoints

**Get All Tasks**
```
GET /api/v1/tasks?status=ToDo&priority=High&sortBy=dueDate&sortOrder=asc
Cookie: token=<jwt>

Query params: status, priority, sortBy, sortOrder
Response: { "success": true, "data": [tasks with creator/assignee details] }
```

**Create Task**
```
POST /api/v1/tasks
Cookie: token=<jwt>
Content-Type: application/json

Body: {
  "title": "string",
  "description": "string",
  "dueDate": "ISO date",
  "priority": "Low|Medium|High|Urgent",
  "status": "ToDo|InProgress|Review|Completed",
  "assignedToId": "uuid (optional)"
}
Response: { "success": true, "data": { task } }
```

**Get Task by ID**
```
GET /api/v1/tasks/:id
Cookie: token=<jwt>

Response: { "success": true, "data": { task with relations } }
```

**Update Task**
```
PUT /api/v1/tasks/:id
Cookie: token=<jwt>
Content-Type: application/json

Body: { any task fields to update }
Response: { "success": true, "data": { updated task } }
```

**Delete Task**
```
DELETE /api/v1/tasks/:id
Cookie: token=<jwt>

Response: { "success": true, "message": "Task deleted successfully" }
```

**Dashboard Endpoints**
```
GET /api/v1/tasks/my-created     # Tasks created by user
GET /api/v1/tasks/my-assigned    # Tasks assigned to user
GET /api/v1/tasks/my-overdue     # Overdue tasks
Cookie: token=<jwt>
```

### User Endpoints

**Get All Users**
```
GET /api/v1/users
Cookie: token=<jwt>

Response: { "success": true, "data": [users without passwords] }
```

### WebSocket Events (Socket.io)

Connect to: `http://localhost:5000` with JWT token in auth header

**Server Events:**
- `task:created` - Broadcast when new task is created
- `task:updated` - Broadcast when task is updated
- `task:deleted` - Broadcast when task is deleted
- `task:assigned` - Sent to assigned user when task is assigned to them

## Architecture Overview & Design Decisions

### Backend Architecture

The backend follows a **layered architecture pattern** with clear separation of concerns:

1. **Controller Layer** - Handles HTTP requests/responses
2. **Service Layer** - Contains business logic
3. **Repository Layer** - Manages database operations
4. **DTO Layer** - Validates data using Zod schemas

```
Request → Controller → Service → Repository → Database
                ↓
            Validation (Zod)
```

### Technology Choices & Rationale

**PostgreSQL Database**
- ACID compliance ensures data integrity for task management
- Strong relational model for user-task relationships
- Excellent performance with proper indexing
- Reliable for production workloads

**Prisma ORM**
- Type-safe database queries with auto-generated TypeScript types
- Schema-first approach with migrations
- Prevents SQL injection via parameterized queries
- Built-in connection pooling

**JWT with HttpOnly Cookies**
- Tokens stored in HttpOnly cookies prevent XSS attacks
- More secure than localStorage/sessionStorage
- Automatic inclusion in requests
- 7-day expiration for security

**Zod Validation**
- Runtime type validation for all incoming data
- Type inference for TypeScript
- Comprehensive error messages
- Prevents invalid data from reaching the database

**Express.js**
- Lightweight and flexible
- Large middleware ecosystem
- Simple routing and error handling
- Industry standard for Node.js APIs

**Service/Repository Pattern**
- Separates business logic from data access
- Improves testability (can mock repositories)
- Makes code more maintainable
- Allows for easy switching of data sources

### Frontend Architecture

**Next.js Framework**
- Server-side rendering for better performance
- File-based routing
- Built-in optimizations
- API routes capability

**State Management**
- SWR for server state (automatic caching, revalidation)
- React Context for authentication state
- Local state for UI components

**API Client Design**
- Centralized Axios instance with interceptors
- Automatic JWT token attachment
- Global error handling with 401 redirects

### Real-Time Implementation with Socket.io

#### Why Socket.io?
- Automatic reconnection on network issues
- Fallback to polling if WebSocket unavailable
- Built-in authentication support
- Easy event-based communication
- Better browser compatibility than raw WebSockets

#### Implementation Details

**Server Side (`backend/src/config/socket.ts`)**

1. Socket.io server integrated with Express HTTP server
2. JWT authentication middleware for socket connections
3. User ID attached to each socket connection
4. Event broadcasting for task operations:
   - New task → broadcast to all users
   - Task update → broadcast to all users
   - Task assignment → targeted event to assigned user

**Client Side (`frontend/src/lib/socket.ts`)**

1. Singleton socket service manages connection
2. Automatic reconnection enabled
3. JWT token sent during connection handshake
4. Event listeners integrated with SWR for auto-refresh

### Security Measures

1. **Authentication**
   - Bcrypt password hashing (salt rounds: 10)
   - JWT tokens in HttpOnly cookies (prevents XSS)
   - Token expiration (7 days)
   - Middleware validates token on every request

2. **Authorization**
   - Middleware checks for valid JWT
   - User-specific data filtering
   - Only task creator can delete tasks

3. **Input Validation**
   - Zod schemas on all endpoints
   - Prisma prevents SQL injection
   - React escapes output (prevents XSS)

4. **CORS**
   - Whitelist specific frontend origin
   - Credentials enabled for cookies

### Database Schema

**User Table**
- id (UUID, primary key)
- email (unique, indexed)
- password (hashed)
- name
- createdAt, updatedAt

**Task Table**
- id (UUID, primary key)
- title, description
- dueDate (indexed for queries)
- priority (enum: Low, Medium, High, Urgent)
- status (enum: ToDo, InProgress, Review, Completed)
- creatorId (foreign key → User, indexed)
- assignedToId (nullable foreign key → User, indexed)
- createdAt, updatedAt

**Relationships**
- User has many Tasks (as creator)
- User has many Tasks (as assignee)
- Task belongs to User (creator)
- Task optionally belongs to User (assignee)

## Trade-offs & Assumptions

### Trade-offs

1. **JWT in Cookies vs Session Store**
   - Chose JWT for stateless authentication
   - Trade-off: Slightly larger request size, cannot revoke before expiration
   - Benefit: Better scalability, no session database needed

2. **SWR vs React Query**
   - Chose SWR for simplicity
   - Trade-off: Fewer features
   - Benefit: Smaller bundle, easier to learn

3. **Socket.io vs Raw WebSockets**
   - Chose Socket.io
   - Trade-off: Slightly more overhead
   - Benefit: Automatic reconnection, fallback mechanisms, easier authentication

4. **Monorepo Structure**
   - Kept frontend and backend in same repo
   - Trade-off: Larger repository
   - Benefit: Easier development, shared type definitions

5. **No Pagination**
   - Tasks load all at once
   - Trade-off: May slow down with 1000+ tasks
   - Benefit: Simpler implementation, SWR handles caching

### Assumptions

1. **User Management**
   - Basic user profile (name, email only)
   - No role-based permissions
   - All authenticated users have equal access

2. **Task Assignment**
   - Tasks can only be assigned to one user
   - No team or group assignments
   - Anyone can assign to anyone

3. **Real-Time Scale**
   - Designed for moderate usage (<1000 concurrent users)
   - Single server instance
   - No Redis adapter for horizontal scaling

4. **File Uploads**
   - No file attachments on tasks
   - Text-only descriptions

5. **Notifications**
   - Real-time notifications only when user is online
   - No persistent notification history
   - No email notifications

6. **Data Retention**
   - Hard delete (no soft delete)
   - No audit trail or version history
   - Tasks are permanently deleted

7. **Performance**
   - No pagination (suitable for <1000 tasks per user)
   - Client-side filtering and sorting
   - SWR handles caching

## Testing

Run backend tests:
```bash
cd backend
npm test
```

## Deployment Guide

### Quick Start with Docker (Alternative)

You can run the entire stack using Docker:

```bash
# Start PostgreSQL and Backend
docker-compose up -d

# Then run frontend separately
cd frontend
npm install
npm run dev
```

**Note:** The docker-compose includes both PostgreSQL and backend services. Frontend still needs to run separately.

### Prerequisites for Deployment
- Node.js hosting platform (Heroku, Railway, Render, DigitalOcean)
- PostgreSQL database (managed service recommended)
- Frontend hosting (Vercel, Netlify, or same platform as backend)

### Deployment Steps

#### 1. Database Setup
- Create a managed PostgreSQL database (AWS RDS, Heroku Postgres, etc.)
- Note the connection string in format: `postgresql://user:password@host:port/database`

#### 2. Backend Deployment

**Environment Variables to Set:**
```env
DATABASE_URL=<your-production-database-url>
JWT_SECRET=<strong-random-secret-minimum-32-characters>
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=<your-frontend-url>
```

**Deployment Commands:**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run build
npm start
```

#### 3. Frontend Deployment

**Environment Variables to Set:**
```env
NEXT_PUBLIC_API_URL=<your-backend-url>
```

**Vercel Deployment:**
```bash
cd frontend
vercel --prod
```

Or connect GitHub repository to Vercel:
- Set root directory to `frontend`
- Framework preset: Next.js
- Add environment variable: `NEXT_PUBLIC_API_URL`

## Screenshots

![Dashboard Screenshot](<Screenshot 2025-12-15 210902.png>)

![Tasks Screenshot](<Screenshot 2025-12-15 210920.png>)

![Task Details](<Screenshot 2025-12-15 210935.png>)

![Task Creation](<Screenshot 2025-12-15 210958.png>)

![Real-time Updates](<Screenshot 2025-12-15 211022.png>)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Repository:** https://github.com/Vansh-kash2023/collaborative-task-manager
