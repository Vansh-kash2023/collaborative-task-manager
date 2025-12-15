# Collaborative Task Manager

A production-ready full-stack task management application with real-time collaboration features.

## Tech Stack

**Backend:** Node.js, Express, TypeScript, PostgreSQL, Prisma ORM, Socket.io, JWT, Bcrypt, Zod

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, SWR, Socket.io Client, Axios

## Features

- User authentication with JWT (HttpOnly cookies)
- Task CRUD operations with validation
- Real-time task updates via Socket.io
- Task assignment to team members
- Task filtering and sorting
- Dashboard with task analytics
- Responsive UI design

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

### Task Endpoints

**Get All Tasks**
```
GET /api/v1/tasks?status=TODO&priority=HIGH&sortBy=dueDate&sortOrder=asc
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
  "priority": "LOW|MEDIUM|HIGH|URGENT",
  "status": "TODO|IN_PROGRESS|REVIEW|COMPLETED",
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
GET /api/v1/tasks/dashboard/my-created     # Tasks created by user
GET /api/v1/tasks/dashboard/my-assigned    # Tasks assigned to user
GET /api/v1/tasks/dashboard/my-overdue     # Overdue tasks
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
2. JWT authentication middleware for socket connections:
   ```typescript
   io.use((socket, next) => {
     const token = socket.handshake.auth.token;
     // Verify JWT and attach user to socket
   });
   ```
3. User ID attached to each socket connection
4. Event broadcasting for task operations:
   - New task → broadcast to all users
   - Task update → broadcast to all users
   - Task assignment → targeted event to assigned user

**Client Side (`frontend/src/lib/socket.ts`)**

1. Singleton socket service manages connection
2. Automatic reconnection enabled
3. JWT token sent during connection handshake
4. Event listeners integrated with SWR for auto-refresh:
   ```typescript
   socket.on('task:created', () => {
     mutate(); // Refresh task list
   });
   ```

**Real-Time Flow**
```
User A creates task → Backend validates → Save to DB
                                          ↓
                            Socket.io broadcasts 'task:created'
                                          ↓
                        All connected users receive event
                                          ↓
                            SWR refreshes task lists automatically
```

**Assignment Notification**
```
Task assigned to User B → Socket.io emits 'task:assigned' to User B's socket
                                          ↓
                            User B receives notification
                                          ↓
                            Toast appears + task list updates
```

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
- priority (enum: LOW, MEDIUM, HIGH, URGENT)
- status (enum: TODO, IN_PROGRESS, REVIEW, COMPLETED)
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

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)
*User dashboard showing task overview and statistics*

### Task Management
![Tasks Page](screenshots/tasks.png)
*All tasks view with filtering and sorting*

### Task Creation
![Create Task](screenshots/create-task.png)
*Create new task with assignment dropdown*

### Real-Time Updates
![Real-Time](screenshots/realtime.png)
*Task assignment notification appearing in real-time*

---

**Repository:** https://github.com/Vansh-kash2023/collaborative-task-manager

### Backend
- Node.js with Express and TypeScript
- PostgreSQL with Prisma ORM
- Socket.io for real-time features
- JWT for authentication (HttpOnly cookies)
- Bcrypt for password hashing
- Zod for DTO validation
- Jest for unit testing

### Frontend
- Next.js 14 with TypeScript
- Tailwind CSS for responsive UI
- SWR for data fetching and caching
- React Hook Form with Zod validation
- Socket.io client for real-time updates
- Axios for API requests

## Features

### Core Features
- User authentication (register, login, logout) with JWT
- Secure password hashing with bcrypt
- Task CRUD operations (Create, Read, Update, Delete)
- Task assignment to team members
- Real-time task updates via Socket.io
- Real-time notifications when tasks are assigned
- Task filtering by status, priority, assignee
- Task sorting by due date, priority, creation date
- Dashboard with task overview (created, assigned, overdue)
- Responsive UI with Tailwind CSS
- Toast notifications for user feedback

### Architecture Highlights
- Clean architecture with service/repository pattern
- Type-safe APIs with TypeScript
- DTO validation with Zod
- Real-time collaboration with Socket.io
- Secure authentication with JWT in HttpOnly cookies
- CORS configured for cross-origin requests
- Comprehensive error handling

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
└── docker-compose.yml       # Docker setup for PostgreSQL
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (via Docker or local installation)
- Docker Desktop (recommended for database)
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Vansh-kash2023/collaborative-task-manager.git
cd collaborative-task-manager
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://postgres:password_postgres@127.0.0.1:5433/taskmanager?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

Note: Port 5433 is used to avoid conflicts with local PostgreSQL installations. Adjust if needed.

### 3. Database Setup

Start PostgreSQL using Docker:

```bash
# From the root directory
docker-compose up -d postgres
```

Wait a few seconds for PostgreSQL to initialize, then run migrations:

```bash
cd backend
npx prisma db push
npx prisma generate
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

### Register and Login
1. Navigate to http://localhost:3000
2. Click "Register" to create a new account
3. Login with your credentials

### Create and Manage Tasks
1. Go to the Dashboard or Tasks page
2. Click "Create New Task"
3. Fill in task details (title, description, due date, priority, status)
4. Assign tasks to other users via the dropdown
5. Edit or delete tasks as needed

### Real-Time Collaboration
1. Open the app in two different browsers or incognito windows
2. Register two different users
3. Create a task and assign it to the other user
4. The assigned user will see a real-time notification
5. Task lists update automatically when changes occur

## API Contract Documentation

Base URL: `http://localhost:5000/api/v1`

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
Note: JWT token set in HttpOnly cookie
```

#### Get Current User Profile
```http
GET /auth/profile
Cookie: token=<jwt_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### Logout User
```http
POST /auth/logout
Cookie: token=<jwt_token>

Response (200 OK):
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Task Endpoints

#### Get All Tasks
```http
GET /tasks?status=TODO&priority=HIGH&sortBy=dueDate&sortOrder=asc
Cookie: token=<jwt_token>

Query Parameters:
- status (optional): TODO, IN_PROGRESS, REVIEW, COMPLETED
- priority (optional): LOW, MEDIUM, HIGH, URGENT
- sortBy (optional): dueDate, createdAt, priority
- sortOrder (optional): asc, desc

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Task Title",
      "description": "Task description",
      "dueDate": "2025-12-31T00:00:00.000Z",
      "priority": "HIGH",
      "status": "TODO",
      "creatorId": "uuid",
      "assignedToId": "uuid",
      "creator": {
        "id": "uuid",
        "name": "Creator Name",
        "email": "creator@example.com"
      },
      "assignedTo": {
        "id": "uuid",
        "name": "Assignee Name",
        "email": "assignee@example.com"
      },
      "createdAt": "2025-12-15T00:00:00.000Z",
      "updatedAt": "2025-12-15T00:00:00.000Z"
    }
  ]
}
```

#### Create Task
```http
POST /tasks
Cookie: token=<jwt_token>
Content-Type: application/json

Request Body:
{
  "title": "New Task",
  "description": "Task description",
  "dueDate": "2025-12-31T00:00:00.000Z",
  "priority": "HIGH",
  "status": "TODO",
  "assignedToId": "uuid" // optional
}

Response (201 Created):
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "New Task",
    "description": "Task description",
    "dueDate": "2025-12-31T00:00:00.000Z",
    "priority": "HIGH",
    "status": "TODO",
    "creatorId": "uuid",
    "assignedToId": "uuid",
    "createdAt": "2025-12-15T00:00:00.000Z",
    "updatedAt": "2025-12-15T00:00:00.000Z"
  }
}
```

#### Get Task by ID
```http
GET /tasks/:id
Cookie: token=<jwt_token>

Response (200 OK):
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Task Title",
    // ... full task object with creator and assignedTo
  }
}
```

#### Update Task
```http
PUT /tasks/:id
Cookie: token=<jwt_token>
Content-Type: application/json

Request Body (all fields optional):
{
  "title": "Updated Title",
  "description": "Updated description",
  "dueDate": "2025-12-31T00:00:00.000Z",
  "priority": "URGENT",
  "status": "IN_PROGRESS",
  "assignedToId": "uuid"
}

Response (200 OK):
{
  "success": true,
  "data": {
    // updated task object
  }
}
```

#### Delete Task
```http
DELETE /tasks/:id
Cookie: token=<jwt_token>

Response (200 OK):
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### Get My Created Tasks
```http
GET /tasks/dashboard/my-created
Cookie: token=<jwt_token>

Response (200 OK):
{
  "success": true,
  "data": [
    // array of tasks created by current user
  ]
}
```

#### Get My Assigned Tasks
```http
GET /tasks/dashboard/my-assigned
Cookie: token=<jwt_token>

Response (200 OK):
{
  "success": true,
  "data": [
    // array of tasks assigned to current user
  ]
}
```

#### Get My Overdue Tasks
```http
GET /tasks/dashboard/my-overdue
Cookie: token=<jwt_token>

Response (200 OK):
{
  "success": true,
  "data": [
    // array of overdue tasks (created or assigned to user)
  ]
}
```

### User Endpoints

#### Get All Users
```http
GET /users
Cookie: token=<jwt_token>

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "createdAt": "2025-12-15T00:00:00.000Z"
    }
  ]
}
```

### WebSocket Events

Connect to Socket.io server at: `http://localhost:5000`

#### Client Events
- None (server broadcasts to clients only)

#### Server Events
```javascript
// Task created - broadcast to all connected users
socket.on('task:created', (task) => {
  // task object with full details
});

// Task updated - broadcast to all connected users
socket.on('task:updated', (task) => {
  // updated task object
});

// Task deleted - broadcast to all connected users
socket.on('task:deleted', ({ taskId }) => {
  // taskId of deleted task
});

// Task assigned - sent to specific assigned user
socket.on('task:assigned', (task) => {
  // task object for newly assigned task
});
```

## API Endpoints

### Authentication
- POST `/api/v1/auth/register` - Register new user
- POST `/api/v1/auth/login` - Login user
- GET `/api/v1/auth/profile` - Get current user profile
- POST `/api/v1/auth/logout` - Logout user

### Tasks
- GET `/api/v1/tasks` - Get all tasks (with filters)
- POST `/api/v1/tasks` - Create new task
- GET `/api/v1/tasks/:id` - Get task by ID
- PUT `/api/v1/tasks/:id` - Update task
- DELETE `/api/v1/tasks/:id` - Delete task
- GET `/api/v1/tasks/dashboard/my-created` - Get tasks created by user
- GET `/api/v1/tasks/dashboard/my-assigned` - Get tasks assigned to user
- GET `/api/v1/tasks/dashboard/my-overdue` - Get overdue tasks

### Users
- GET `/api/v1/users` - Get all users (for task assignment)

## Architecture Overview & Design Decisions

### Backend Architecture

#### Layered Architecture Pattern
The backend follows a clean, layered architecture with clear separation of concerns:

1. **Controller Layer**: Handles HTTP requests/responses and delegates to services
2. **Service Layer**: Contains business logic and orchestrates data operations
3. **Repository Layer**: Manages data access and database operations
4. **DTO Layer**: Validates and transforms data using Zod schemas

This separation ensures maintainability, testability, and scalability.

#### Technology Choices

**PostgreSQL Database**
- Chosen for ACID compliance and relational data integrity
- Strong support for complex queries and joins
- Excellent TypeScript integration via Prisma ORM
- Reliable for production workloads

**Prisma ORM**
- Type-safe database queries with auto-generated TypeScript types
- Schema migrations with version control
- Intuitive query API reducing SQL complexity
- Built-in connection pooling

**JWT Authentication with HttpOnly Cookies**
- Tokens stored in HttpOnly cookies prevent XSS attacks
- Secure alternative to localStorage/sessionStorage
- Automatic token inclusion in requests
- 7-day expiration with refresh capability

**Zod Validation**
- Runtime type validation for DTOs
- Type inference for TypeScript
- Comprehensive error messages
- Schema composition and reusability

**Express.js Framework**
- Lightweight and flexible
- Large ecosystem of middleware
- Simple routing and error handling
- Industry standard for Node.js APIs

### Frontend Architecture

#### Next.js Framework
- Server-side rendering for better SEO and initial load
- File-based routing system
- API routes capability
- Built-in optimization (image, font, code splitting)

#### State Management Strategy
- **SWR for Server State**: Automatic caching, revalidation, and real-time updates
- **React Context for Auth**: Global authentication state management
- **Local State for UI**: Component-level state with useState/useReducer

#### API Client Design
- Centralized Axios instance with interceptors
- Automatic token attachment
- Global error handling and 401 redirect
- Consistent error message formatting

### Real-Time Implementation with Socket.io

#### Connection Architecture
```
Client                     Server
  |                          |
  |-- Connect (with JWT) --->|
  |<-- Authenticate ---------|
  |                          |
  |-- Task Created --------->|
  |<-- Broadcast to all -----|
  |                          |
  |<-- Task Assigned --------|
  |-- Update UI -------------|
```

#### Implementation Details

**Server Side (backend/src/config/socket.ts)**
- Socket.io server integrated with Express HTTP server
- JWT authentication middleware for socket connections
- User ID attached to socket for targeted events
- Event handlers for task operations:
  - `task:created` - Broadcast new tasks to all users
  - `task:updated` - Notify relevant users of changes
  - `task:deleted` - Remove tasks from all clients
  - `task:assigned` - Notify assigned user immediately

**Client Side (frontend/src/lib/socket.ts)**
- Singleton socket service for connection management
- Automatic reconnection on disconnect
- Token-based authentication
- Event listeners for real-time updates
- Integration with SWR for automatic data revalidation

**Real-Time Features**
1. **Task Assignment Notifications**: When a task is assigned, the assigned user receives an instant notification
2. **Live Task Updates**: Changes to tasks appear immediately for all users viewing the task list
3. **Collaborative Editing**: Multiple users can work on tasks simultaneously without conflicts
4. **Connection Status**: Users see real-time connection status

### Security Measures

1. **Authentication**
   - Bcrypt password hashing with salt rounds
   - JWT tokens with expiration
   - HttpOnly cookies prevent XSS
   - Secure token validation on every request

2. **Authorization**
   - Middleware checks for valid JWT tokens
   - User-specific data filtering
   - Permission checks for task modifications

3. **Input Validation**
   - Zod schemas validate all incoming data
   - SQL injection prevention via Prisma parameterized queries
   - XSS protection with React's automatic escaping

4. **CORS Configuration**
   - Whitelist specific frontend origin
   - Credentials enabled for cookie transmission
   - Preflight request handling

### Database Schema Design

**Relationships**
- User has many Tasks (as creator)
- User has many Tasks (as assignee)
- Task belongs to User (creator)
- Task optionally belongs to User (assignee)

**Indexes**
- Unique index on User.email for fast lookups
- Index on Task.creatorId for creator queries
- Index on Task.assignedToId for assignee queries
- Index on Task.dueDate for sorting and filtering

### Trade-offs & Assumptions

#### Trade-offs

1. **JWT in Cookies vs Sessions**
   - Chose JWT for stateless authentication
   - Trade-off: Slightly larger request size
   - Benefit: Better scalability, no session store needed

2. **SWR vs React Query**
   - Chose SWR for simplicity and smaller bundle
   - Trade-off: Fewer features than React Query
   - Benefit: Lighter weight, easier to learn

3. **Socket.io vs WebSockets**
   - Chose Socket.io for reliability
   - Trade-off: Slightly more overhead
   - Benefit: Automatic reconnection, fallback to polling

4. **Monorepo vs Separate Repos**
   - Chose monorepo structure
   - Trade-off: Larger repository size
   - Benefit: Easier development, shared types

5. **Docker for Database Only**
   - Only PostgreSQL runs in Docker
   - Trade-off: Manual Node.js setup required
   - Benefit: Simpler development workflow

#### Assumptions

1. **User Management**
   - Assumed basic user profile (name, email)
   - No role-based permissions implemented
   - All authenticated users have equal privileges

2. **Task Assignment**
   - Tasks can only be assigned to one user
   - No team or group assignments
   - Creator can assign to any user

3. **Real-Time Scale**
   - Assumed moderate user base (< 1000 concurrent)
   - Single Socket.io server instance
   - No Redis adapter for horizontal scaling

4. **File Uploads**
   - No file attachment support for tasks
   - Descriptions are text-only
   - No image or document storage

5. **Notification System**
   - Real-time notifications only when user is online
   - No persistent notification history
   - No email notifications

6. **Data Retention**
   - No soft delete implementation
   - Tasks are permanently deleted
   - No audit trail or history tracking

7. **Performance**
   - No pagination on task lists (suitable for < 1000 tasks)
   - Full dataset loaded client-side
   - SWR handles caching and updates

## Database Schema

### User Model
- id (UUID)
- email (unique)
- password (hashed)
- name
- createdAt
- updatedAt

### Task Model
- id (UUID)
- title
- description
- dueDate
- priority (LOW, MEDIUM, HIGH, URGENT)
- status (TODO, IN_PROGRESS, REVIEW, COMPLETED)
- creatorId (foreign key to User)
- assignedToId (optional foreign key to User)
- createdAt
- updatedAt

## Testing

Run backend tests:
```bash
cd backend
npm test
```

## Deployment Guide

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
npx prisma db push  # or prisma migrate deploy
npm run build
npm start
```

**Platform-Specific Examples:**

*Render/Railway:*
- Build Command: `cd backend && npm install && npx prisma generate && npm run build`
- Start Command: `cd backend && npm start`
- Add environment variables in dashboard

*Heroku:*
```bash
heroku create your-app-backend
heroku addons:create heroku-postgresql:mini
heroku config:set JWT_SECRET=your-secret
heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
git subtree push --prefix backend heroku main
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

**Netlify Deployment:**
- Build command: `cd frontend && npm run build`
- Publish directory: `frontend/.next`
- Add environment variable: `NEXT_PUBLIC_API_URL`

#### 4. Post-Deployment Verification
1. Check backend health: `https://your-backend-url/health`
2. Test authentication endpoints
3. Verify database connection
4. Test Socket.io connection from frontend
5. Create test user and task

### Deployment Checklist
- [ ] PostgreSQL database created and accessible
- [ ] Backend deployed with correct environment variables
- [ ] Database migrations applied
- [ ] Frontend deployed with backend URL configured
- [ ] CORS configured with frontend URL
- [ ] SSL/HTTPS enabled on both frontend and backend
- [ ] JWT secret is strong and random
- [ ] Database credentials are secure
- [ ] Socket.io connection working
- [ ] Test registration and login flow
- [ ] Test task creation and real-time updates

### Production Considerations
- Use managed PostgreSQL with automatic backups
- Implement rate limiting for API endpoints
- Add monitoring and logging (e.g., Sentry, LogRocket)
- Set up CI/CD pipeline for automated deployments
- Configure custom domain names
- Enable HTTPS/SSL certificates
- Implement database connection pooling
- Add Redis for Socket.io scaling (if needed)
- Set up health check endpoints
- Configure proper error logging

## Build for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm start
```

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration time
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Troubleshooting

### Port Conflicts
If you have PostgreSQL installed locally on port 5432, the Docker container uses port 5433 by default. Update `docker-compose.yml` and `DATABASE_URL` if needed.

### Database Connection Issues
1. Ensure Docker container is running: `docker ps`
2. Check PostgreSQL logs: `docker logs taskmanager-db`
3. Verify credentials match between `docker-compose.yml` and `.env`

### Backend Not Starting
1. Ensure all dependencies are installed: `npm install`
2. Run `npx prisma generate` to generate Prisma client
3. Check for TypeScript errors: `npm run build`

### Frontend Build Errors
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check for TypeScript errors


## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
- Task CRUD operations with validation
- Task assignment to users
- Real-time task updates via Socket.io
- Task filtering by status and priority
- Task sorting by due date, created date, and priority
- User dashboard with:
  - Tasks created by user
  - Tasks assigned to user  
  - Overdue tasks
- Permission-based access control
- Responsive mobile-first design
- Loading states with skeleton loaders
- Comprehensive error handling

### Real-Time Features
- Live task updates broadcast to all connected users
- Instant notifications when tasks are assigned
- Automatic UI updates without page refresh
- Authenticated WebSocket connections

### Data Validation
- Frontend: React Hook Form with Zod schemas
- Backend: DTO validation with Zod
- Type-safe validation throughout the stack

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- npm or yarn

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd collaborative-task-manager
```

2. Start PostgreSQL:
```bash
docker-compose up -d postgres
```

3. Setup and run backend:
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Backend will run on `http://localhost:5000`

4. Setup and run frontend:
```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

### Running Tests

```bash
npm test
```

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}
```

#### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### Get Profile
```
GET /api/v1/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```
PUT /api/v1/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe"
}
```

### Task Endpoints

#### Create Task
```
POST /api/v1/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the task manager project",
  "dueDate": "2024-12-31T23:59:59Z",
  "priority": "High",
  "status": "ToDo",
  "assignedToId": "user-id" // optional
}
```

#### Get All Tasks
```
GET /api/v1/tasks?status=ToDo&priority=High&sortBy=dueDate&sortOrder=asc
Authorization: Bearer <token>
```

#### Get Task by ID
```
GET /api/v1/tasks/:id
Authorization: Bearer <token>
```

#### Update Task
```
PUT /api/v1/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "InProgress",
  "priority": "Urgent"
}
```

#### Delete Task
```
DELETE /api/v1/tasks/:id
Authorization: Bearer <token>
```

#### Dashboard Endpoints

```
GET /api/v1/tasks/my-created    # Tasks created by user
GET /api/v1/tasks/my-assigned   # Tasks assigned to user
GET /api/v1/tasks/my-overdue    # Overdue tasks
Authorization: Bearer <token>
```

## Architecture Overview

### Service/Repository Pattern

The backend follows a clear separation of concerns:

1. **Controllers**: Handle HTTP requests/responses
2. **Services**: Contain business logic
3. **Repositories**: Handle database operations
4. **DTOs**: Validate and type incoming data

### Real-Time Communication

Socket.io is used for real-time features:
- Task updates are broadcast to all connected clients
- Task assignments trigger notifications to the assigned user
- Authentication is required for socket connections

### Database Schema

**User Model**:
- id, email, password, name, timestamps
- Relations: createdTasks, assignedTasks

**Task Model**:
- id, title, description, dueDate, priority, status, timestamps
- Relations: creator, assignedTo
- Enums: Priority (Low, Medium, High, Urgent), Status (ToDo, InProgress, Review, Completed)

### Why PostgreSQL?

PostgreSQL was chosen for:
- Strong ACID compliance
- Complex query support
- Excellent indexing capabilities
- Prisma ORM integration
- Data integrity with foreign keys

## Design Decisions

1. **JWT in HttpOnly Cookies**: Secure token storage preventing XSS attacks
2. **Zod for Validation**: Type-safe validation with TypeScript integration
3. **Service Layer Pattern**: Separates business logic from data access
4. **Socket.io Authentication**: Ensures only authenticated users receive real-time updates
5. **Prisma ORM**: Type-safe database access with migrations

## Testing

Unit tests cover critical business logic:
- Task creation validation
- User not found scenarios
- Permission checks for task deletion

Run tests with:
```bash
npm test
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskmanager?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Frontend Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.tsx       # Navigation bar
│   │   ├── TaskCard.tsx     # Task display card
│   │   ├── TaskForm.tsx     # Task create/edit form
│   │   └── LoadingSkeleton.tsx
│   ├── context/
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── hooks/
│   │   └── useTasks.ts      # SWR hooks for task data
│   ├── lib/
│   │   ├── api-client.ts    # Axios configuration
│   │   ├── auth-api.ts      # Auth API calls
│   │   ├── task-api.ts      # Task API calls
│   │   └── socket.ts        # Socket.io client setup
│   ├── pages/
│   │   ├── _app.tsx         # App wrapper with providers
│   │   ├── index.tsx        # Landing page
│   │   ├── login.tsx        # Login page
│   │   ├── register.tsx     # Registration page
│   │   ├── dashboard.tsx    # User dashboard
│   │   └── tasks.tsx        # All tasks page
│   ├── styles/
│   │   └── globals.css      # Global styles with Tailwind
│   └── types/
│       └── index.ts         # TypeScript type definitions
```

## Usage Guide

### Creating an Account
1. Navigate to `http://localhost:3000`
2. Click "Create account"
3. Fill in name, email, and password (min 8 chars, must include uppercase, lowercase, and number)
4. Submit to create account and auto-login

### Managing Tasks
1. Go to "Tasks" page
2. Click "Create New Task"
3. Fill in:
   - Title (max 100 characters)
   - Description
   - Due date
   - Priority (Low, Medium, High, Urgent)
   - Status (To Do, In Progress, Review, Completed)
4. Optionally assign to a user
5. Submit to create

### Real-Time Collaboration
- Open the app in multiple browser windows/tabs
- Create or update a task in one window
- See instant updates in all other windows
- Receive notifications when tasks are assigned to you

## Deployment

### Backend Deployment (Render/Railway)

1. Create a PostgreSQL database
2. Set environment variables
3. Run migrations:
```bash
npx prisma migrate deploy
```
4. Build and start:
```bash
npm run build
npm start
```

### Frontend Deployment (Vercel)

1. Connect your repository to Vercel
2. Set environment variable:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
3. Deploy

Vercel will automatically build and deploy your Next.js app.

## Testing

Run backend tests:
```bash
cd backend
npm test
```

Tests cover:
- Task creation with validation
- User assignment verification
- Permission checks
- Error handling

## Project Highlights

### Architecture Strengths
- Clean separation of concerns (Controllers, Services, Repositories)
- Type-safe throughout with TypeScript
- Comprehensive DTO validation
- Secure authentication with HttpOnly cookies
- Real-time updates with minimal latency

### Security Features
- Password hashing with bcrypt (12 rounds)
- JWT tokens in HttpOnly cookies
- CORS configuration
- Input validation on both frontend and backend
- SQL injection prevention via Prisma

### Performance Optimizations
- Database indexing on frequently queried fields
- SWR caching to minimize API calls
- Optimistic UI updates
- Efficient WebSocket connections
- Connection pooling with Prisma

## Screenshots
![alt text](<Screenshot 2025-12-15 210902.png>)

![alt text](<Screenshot 2025-12-15 210920.png>)

![alt text](<Screenshot 2025-12-15 210935.png>)

![alt text](<Screenshot 2025-12-15 210958.png>)

![alt text](<Screenshot 2025-12-15 211022.png>)
