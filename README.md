# CampusCare — Smart Campus Complaint Management

A full-stack complaint management app with separate student and administrator portals. The React interface talks to an Express API backed by MongoDB; complaint records are stored in MongoDB, and passwords are hashed before storage.

For an explanation of the technologies and frontend/backend/database connection flow, see the [Project Guide](./PROJECT_GUIDE.md).

## Features

- **Student portal:** register and sign in, submit complaints, receive a unique complaint ID, search and track complaint status, and view personal complaint history.
- **Admin portal:** sign in to a dashboard with total/pending/in-progress/resolved counts; search, filter by category and status, update status, and delete complaints.
- **Authentication and access control:** signed JWT sessions, role-checked API routes, and student-only registration.
- **Validation and error handling:** client-side required fields and API-side validation; clear error and success messages.
- **Responsive interface:** separate navigation and dashboard experiences for each role.
- **Demo data:** an idempotent seed script creates an admin, student, and sample complaints in an empty database.

## Requirements

- Node.js 20 or newer
- MongoDB Community Server running locally, or a MongoDB connection URI

## Run locally

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `server/.env.example` to `.env` in the project root and set `MONGODB_URI` and a long, random `JWT_SECRET`. The example values are for local development only.

3. Start MongoDB, then load the demo accounts and sample complaints:

   ```sh
   npm run seed
   ```

4. Start the API and React development server:

   ```sh
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173). The Vite development server proxies `/api` requests to the Express API on port 5000.

### Demo accounts

| Portal | Email | Password |
| --- | --- | --- |
| Student | `student@campus.edu` | `Student123!` |
| Admin | `admin@campus.edu` | `CampusAdmin123!` |

Change the demo admin password by setting `ADMIN_PASSWORD` before running the seed script. Students can also create their own account from the student portal.

## Production build

```sh
npm run build
```

Set `NODE_ENV=production` and the required MongoDB/JWT environment variables, then run `npm start`. Express serves the built React app and API from the same origin.

## Deploy the frontend to Vercel

Import this repository in Vercel. The included `vercel.json` sets the Vite build command and `dist` output directory. Set the `VITE_API_URL` environment variable to the public **origin** of the deployed Express API (for example, `https://campuscare-api.example.com`, without `/api`), then redeploy.

The frontend uses `/api` through the Vite proxy during local development. In production, it uses `${VITE_API_URL}/api`. A Vercel frontend cannot access an Express server or MongoDB running only on your computer; deploy the backend separately and use a publicly reachable MongoDB service such as MongoDB Atlas. Configure the backend's `CLIENT_ORIGIN` to allow the Vercel site URL.

## API overview

All complaint routes except sign-in/registration require a bearer token. Admin-only actions are role protected.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register a student |
| POST | `/api/auth/login` | Public | Sign in as student or admin |
| GET | `/api/auth/me` | Signed in | Restore the current session |
| GET | `/api/complaints` | Signed in | List own (student) or all (admin) complaints |
| POST | `/api/complaints` | Student | Create a complaint |
| GET | `/api/complaints/stats` | Admin | Read complaint counts by status |
| PATCH | `/api/complaints/:id/status` | Admin | Update complaint status |
| DELETE | `/api/complaints/:id` | Admin | Delete a complaint |

The complaint list supports `search` (complaint ID), `category`, and `status` query parameters. Student accounts only receive their own complaints.
