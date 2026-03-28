# Society Connect

Society Connect is a full-stack complaint management system for residential societies. This repository now contains a clean separation between the mobile app and the API so you can build the project in stages and understand each layer.

## Project Structure

```text
YtReactNative/
├── frontend/                Expo React Native app
│   ├── App.js
│   ├── app.json
│   └── src/
│       ├── components/      Reusable UI blocks
│       ├── context/         Global auth state
│       ├── navigation/      Auth and role-based navigation
│       ├── screens/         App screens
│       ├── services/        API helper functions
│       ├── theme/           Colors and navigation theme
│       └── utils/           Config values
├── backend/                 Express + MongoDB API
│   ├── .env.example
│   ├── uploads/
│   └── src/
│       ├── config/          Database connection
│       ├── controllers/     Business logic
│       ├── middleware/      Auth, errors, file upload
│       ├── models/          Mongoose schemas
│       ├── routes/          API route definitions
│       └── utils/           Token, async handler, priority helper
└── App.jsx                  Small note for the original native scaffold
```

## Tech Stack

- Frontend: Expo + React Native + React Navigation
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Auth: JWT
- Uploads: Multer with local storage

## Implemented Baseline

### Frontend

- Authentication flow with login and register screens
- Role-aware navigation for resident, admin, and worker
- Dashboard screen with analytics summary
- Complaint submission screen
- Complaint list and complaint details screens
- Profile screen with logout
- Shared components for forms, buttons, badges, cards, and screen layout

### Backend

- MVC folder structure
- JWT authentication and role-based authorization
- User and complaint models
- Complaint creation, listing, details, assignment, and status updates
- Dashboard analytics endpoint
- Worker list endpoint for admin assignment
- Duplicate complaint hinting and priority calculation
- Local image upload support using `uploads/`

## Important Learning Notes

- `frontend/src/context/AuthContext.js` shows how app-wide authentication state is shared across screens.
- `frontend/src/navigation/AppNavigator.js` shows conditional navigation based on the logged-in user role.
- `backend/src/routes/` maps URLs to controllers.
- `backend/src/controllers/` contains the main backend logic.
- `backend/src/models/` defines MongoDB collections using Mongoose schemas.

## Setup Instructions

### 1. Install dependencies

Run these commands from the project root:

```bash
npm install
npm install --workspace frontend
npm install --workspace backend
```

If your npm version supports workspaces properly, a single `npm install` at the root may be enough.

### 2. Configure backend environment

Copy the backend example environment file and update the values:

```bash
cp backend/.env.example backend/.env
```

Required values:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`

### 3. Start MongoDB

Make sure MongoDB is running locally, or use MongoDB Atlas and put the connection string in `backend/.env`.

### 4. Start the backend

```bash
npm run backend
```

The API will run on `http://localhost:5000`.

### 5. Configure the frontend API URL

Open `frontend/src/utils/config.js` and set `API_BASE_URL` correctly:

- Android emulator: `http://10.0.2.2:5000/api`
- iOS simulator: `http://localhost:5000/api`
- Physical phone: `http://YOUR_COMPUTER_IP:5000/api`

### 6. Start the Expo frontend

```bash
npm run frontend
```

Then scan the QR code in Expo Go or run it in an emulator.

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Complaints

- `POST /api/complaints`
- `GET /api/complaints`
- `GET /api/complaints/:id`
- `PATCH /api/complaints/:id/assign`
- `PATCH /api/complaints/:id/status`

### Dashboard

- `GET /api/dashboard/summary`

### Users

- `GET /api/users/workers`

## Current Limitations

- Push notifications are not connected yet.
- Real-time updates are not connected yet.
- Image uploads are stored locally for now rather than on a cloud service.
- Admin assignment UI is functional but still simple and can be refined later.
- Category selection is currently text-based and should be upgraded to dropdown chips later.

## Suggested Next Steps

1. Install dependencies and run both apps.
2. Create one admin account and one worker account in MongoDB for testing.
3. Refine the frontend forms with dropdowns, validation, and better assignment UI.
4. Add notifications, feedback flow, and seeded demo data.
5. Replace local image storage with Cloudinary or Firebase Storage if your project requires cloud hosting.
