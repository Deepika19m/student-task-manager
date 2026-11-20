# CampusCare Project Guide

This guide explains the technologies used by CampusCare and how its frontend, backend, and MongoDB database work together. For installation steps and API endpoints, see the [README](./README.md).

## Technologies

| Area | Technology | Purpose |
| --- | --- | --- |
| Frontend | JavaScript, React, JSX | Renders the student and admin portals and handles user interactions |
| Styling | CSS | Defines the responsive visual design |
| Page entry | HTML | Provides the document and React mount element |
| Development server/build | Vite | Serves the frontend locally and creates the production build |
| Backend | JavaScript, Node.js, Express | Implements the HTTP API, validation, authentication, and access control |
| Database access | Mongoose | Connects the Node.js backend to MongoDB and maps models to collections |
| Database | MongoDB | Stores student/admin accounts and complaints |
| Authentication | bcryptjs and JSON Web Tokens | Hashes passwords and signs authenticated sessions |

## Project layout

```text
client/
  src/
    App.jsx       React screens, forms, navigation, and API calls
    main.jsx      React application entry point
    styles.css    Responsive styling
server/
  src/
    app.js        Express app, API routes, and production static files
    server.js     Loads environment configuration, connects to MongoDB, and starts Express
    middleware/   Authentication and role checks
    models/       Mongoose User and Complaint schemas
    routes/       Authentication and complaint API endpoints
    seed.js       Creates demo accounts and sample complaints
index.html        Browser document loaded by Vite
vite.config.js    Vite configuration and development API proxy
```

## MongoDB connection

The backend uses **Mongoose** to connect to the MongoDB server. Connection settings are read from a root `.env` file:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/smart-campus
JWT_SECRET=your-long-random-secret
```

`server/src/server.js` calls `mongoose.connect(process.env.MONGODB_URI)` before starting the API. Mongoose stores accounts in the `users` collection and complaints in the `complaints` collection inside the `smart-campus` database.

To inspect this same database with MongoDB Compass, connect to:

```text
mongodb://127.0.0.1:27017
```

Then open the `smart-campus` database. Compass is a database client; the app connects to the MongoDB server, not to the Compass application.

## Frontend-to-backend request flow

```text
React in the browser
        │  fetch("/api/...")
        ▼
Vite development proxy
        │  http://localhost:5000
        ▼
Express API routes
        │  Mongoose queries
        ▼
MongoDB: smart-campus
```

During development, `vite.config.js` proxies requests beginning with `/api` to the Express API on port `5000`. The frontend sends and receives JSON for sign-in, complaint submission, search, status updates, and deletion. Authenticated requests include the signed JWT as a bearer token. Express middleware verifies the token and checks the user's role before allowing protected actions.

For production, `npm run build` places the compiled frontend in `dist/`. With `NODE_ENV=production`, Express serves those files alongside the API.

## Local development commands

Run both frontend and backend from the project root:

```sh
npm run dev
```

Or run them in separate terminals:

```sh
npm run dev:client
npm run dev:server
```

The frontend is normally available at `http://localhost:5173`, and the API at `http://localhost:5000`. If port `5173` is already occupied, Vite may choose another available port.

Never commit the root `.env` file. It contains local configuration and a JWT secret; `.gitignore` excludes it. Use `server/.env.example` as the template.
