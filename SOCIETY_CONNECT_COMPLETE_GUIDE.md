# Society Connect Complete Guide

This guide explains how to build and run the `Society Connect` app from scratch in a way that a beginner can follow.

It is written for someone who:

- is new to React Native
- is new to Expo
- is new to Node.js and Express
- is new to MongoDB
- wants to understand both setup and code structure

The project is a full-stack mobile app for complaint management in a residential society.

## 1. What This App Does

`Society Connect` is a complaint management system for a housing society.

There are 3 roles:

- `Resident/User`
- `Admin`
- `Worker`

### Resident can:

- register and log in
- submit a complaint
- view complaint history
- track complaint status

### Admin can:

- view all complaints
- see dashboard stats
- assign complaints to workers
- update status
- add remarks

### Worker can:

- view assigned complaints
- update complaint status
- upload proof image after resolving

## 2. Technologies Used

### Frontend

- `React Native`
- `Expo`
- `React Navigation`

### Backend

- `Node.js`
- `Express.js`

### Database

- `MongoDB Atlas`
- `Mongoose`

### Authentication

- `JWT`

## 3. Final Project Structure

```text
YtReactNative/
├── frontend/
│   ├── App.js
│   ├── app.json
│   ├── babel.config.js
│   ├── metro.config.js
│   ├── package.json
│   └── src/
│       ├── components/
│       ├── context/
│       ├── navigation/
│       ├── screens/
│       ├── services/
│       ├── theme/
│       └── utils/
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── uploads/
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── utils/
├── App.jsx
├── README.md
└── SOCIETY_CONNECT_COMPLETE_GUIDE.md
```

## 4. Before Starting

You need these tools installed on your computer:

- `Node.js`
- `npm`
- `Android Studio`
- `Android Emulator`
- `Expo Go` on the emulator
- a code editor like `VS Code`

### Recommended versions

- Node.js `20+`
- npm `10+`

## 5. Initial Setup

### Step 1: Create the React Native project

Originally, this workspace started from a normal React Native scaffold.

Later, we reorganized it so the actual mobile app lives in the `frontend` folder and the API lives in the `backend` folder.

### Step 2: Create separate folders

We separated the project into:

- `frontend` for the Expo app
- `backend` for the Express server

This separation is important because:

- mobile code stays clean
- backend code stays independent
- the project is easier to understand and scale

## 6. Frontend Setup

The frontend is inside:

[frontend](C:/Users/User/Desktop/reactnative/YtReactNative/frontend)

### Frontend package file

The main frontend dependencies are in:

[frontend/package.json](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/package.json)

These include:

- `expo`
- `react-native`
- `@react-navigation/native`
- `@react-navigation/native-stack`
- `@react-navigation/bottom-tabs`
- `expo-image-picker`
- `@react-native-async-storage/async-storage`

### Install frontend dependencies

From the project root:

```powershell
npm --prefix frontend install
```

### Start the frontend

From the project root:

```powershell
npm run frontend
```

This command points to:

[package.json](C:/Users/User/Desktop/reactnative/YtReactNative/package.json)

and runs:

```powershell
npm --prefix frontend run start
```

### Open in Android emulator

After Expo starts:

- press `a`

This opens the app in the Android emulator.

## 7. Backend Setup

The backend is inside:

[backend](C:/Users/User/Desktop/reactnative/YtReactNative/backend)

### Backend package file

Main backend dependencies are in:

[backend/package.json](C:/Users/User/Desktop/reactnative/YtReactNative/backend/package.json)

These include:

- `express`
- `mongoose`
- `jsonwebtoken`
- `bcryptjs`
- `cors`
- `dotenv`
- `multer`
- `nodemon`

### Install backend dependencies

From the project root:

```powershell
npm --prefix backend install
```

### Start the backend

From the project root:

```powershell
npm run backend
```

This runs:

```powershell
npm --prefix backend run dev
```

If everything is correct, the terminal should show:

```text
MongoDB connected successfully.
Society Connect API is running on port 5000
```

## 8. MongoDB Atlas Setup

We used MongoDB Atlas instead of local MongoDB because Atlas is faster and easier for beginners.

### Step 1: Create Atlas account

- Go to MongoDB Atlas
- create an account
- sign in

### Step 2: Create a cluster

- choose the free plan `M0`
- choose a nearby region
- create the cluster

### Step 3: Create a database user

- open `Database Access`
- click `Add New Database User`
- choose username/password
- create user
- give `Read and write to any database`

### Step 4: Add network access

- open `Network Access`
- click `Add IP Address`
- choose `Allow Access from Anywhere`
- this adds `0.0.0.0/0`

This is okay for development. Later, it should be restricted.

### Step 5: Get connection string

Use:

- `Connect`
- `Drivers`
- `Node.js`

If `mongodb+srv://` gives DNS issues, use the standard `mongodb://` connection string.

### Step 6: Put connection string in backend env

The backend environment file is:

[backend/.env](C:/Users/User/Desktop/reactnative/YtReactNative/backend/.env)

It contains:

```env
PORT=5000
MONGODB_URI=your_connection_string_here
JWT_SECRET=your_secret_here
CLIENT_URL=*
```

## 9. Important Environment Configuration

### Backend env file

File:

[backend/.env](C:/Users/User/Desktop/reactnative/YtReactNative/backend/.env)

What it means:

- `PORT`: backend server port
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: secret used to sign tokens
- `CLIENT_URL`: allowed frontend origin

### Frontend API URL

File:

[frontend/src/utils/config.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/utils/config.js)

Because Android emulator cannot use your computer's localhost directly, we use:

```js
export const API_BASE_URL = 'http://10.0.2.2:5000/api';
```

`10.0.2.2` is the Android emulator alias for your computer's `localhost`.

## 10. Frontend Code Explanation

### Entry file

Main frontend app entry:

[frontend/App.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/App.js)

This file:

- wraps the app in `SafeAreaProvider`
- wraps the app in `AuthProvider`
- sets up `NavigationContainer`
- loads `AppNavigator`

### Auth Context

File:

[frontend/src/context/AuthContext.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/context/AuthContext.js)

This handles:

- saving user session
- restoring session from storage
- login
- register
- logout
- loading current profile

This is called `global state`.

Instead of passing user data through many screens manually, `AuthContext` shares it across the app.

### Navigation

File:

[frontend/src/navigation/AppNavigator.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/navigation/AppNavigator.js)

This decides:

- if user is not logged in: show login/register
- if user is logged in: show dashboard tabs
- which tabs appear for each role

Example:

- `user` sees `Dashboard`, `Submit`, `Complaints`, `Profile`
- `worker` sees `Dashboard`, `Assigned`, `Profile`
- `admin` sees `Dashboard`, `Complaints`, `Profile`

### API Service

File:

[frontend/src/services/api.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/services/api.js)

This file contains functions that call backend endpoints:

- register
- login
- get profile
- get dashboard
- get complaints
- create complaint
- assign complaint
- update complaint status
- get workers

This keeps API code separate from screen code.

## 11. Frontend Screens Explanation

### Login screen

File:

[frontend/src/screens/LoginScreen.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/screens/LoginScreen.js)

Purpose:

- user enters email and password
- app sends login request to backend

### Register screen

File:

[frontend/src/screens/RegisterScreen.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/screens/RegisterScreen.js)

Purpose:

- create resident accounts
- store name, email, password, house number, block

Right now registration creates normal users by default.

### Dashboard screen

File:

[frontend/src/screens/DashboardScreen.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/screens/DashboardScreen.js)

Purpose:

- show analytics summary
- show counts:
  - total
  - pending
  - in progress
  - resolved

### Submit Complaint screen

File:

[frontend/src/screens/SubmitComplaintScreen.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/screens/SubmitComplaintScreen.js)

Purpose:

- resident creates a complaint
- fields:
  - house number
  - block
  - category
  - description
  - image

### Complaint List screen

File:

[frontend/src/screens/ComplaintListScreen.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/screens/ComplaintListScreen.js)

Purpose:

- resident sees own complaints
- admin sees all complaints
- worker sees assigned complaints

### Complaint Details screen

File:

[frontend/src/screens/ComplaintDetailsScreen.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/screens/ComplaintDetailsScreen.js)

Purpose:

- show single complaint details
- admin can assign complaint to worker
- admin and worker can update status
- worker can attach proof image
- all remarks are shown in a timeline

### Profile screen

File:

[frontend/src/screens/ProfileScreen.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/screens/ProfileScreen.js)

Purpose:

- show logged-in user info
- logout

## 12. Reusable Components

These are shared UI building blocks.

### Files

- [frontend/src/components/FormInput.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/components/FormInput.js)
- [frontend/src/components/PrimaryButton.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/components/PrimaryButton.js)
- [frontend/src/components/ComplaintCard.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/components/ComplaintCard.js)
- [frontend/src/components/ScreenContainer.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/components/ScreenContainer.js)
- [frontend/src/components/StatCard.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/components/StatCard.js)
- [frontend/src/components/StatusBadge.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/components/StatusBadge.js)

Why reusable components matter:

- less repeated code
- cleaner screens
- easier design changes

## 13. Backend Code Explanation

### Backend entry

Main server entry:

[backend/src/server.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/server.js)

This file:

- connects to MongoDB
- starts Express server

### Express app setup

File:

[backend/src/app.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/app.js)

This file:

- loads middleware
- loads routes
- enables JSON parsing
- enables CORS
- serves uploaded images
- handles errors

### Database connection

File:

[backend/src/config/db.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/config/db.js)

This connects Mongoose to MongoDB.

## 14. MVC Architecture Explained

The backend uses MVC.

MVC means:

- `Model`
- `View`
- `Controller`

In an API project like this:

- `Model` = database schema
- `Controller` = logic
- `Routes` = URL mappings

### Models

Files:

- [backend/src/models/User.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/models/User.js)
- [backend/src/models/Complaint.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/models/Complaint.js)

What models do:

- define what fields exist
- define what values are allowed
- define relationships between data

### Controllers

Files:

- [backend/src/controllers/authController.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/controllers/authController.js)
- [backend/src/controllers/complaintController.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/controllers/complaintController.js)
- [backend/src/controllers/dashboardController.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/controllers/dashboardController.js)
- [backend/src/controllers/userController.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/controllers/userController.js)

What controllers do:

- receive request data
- validate data
- query database
- return response

### Routes

Files:

- [backend/src/routes/authRoutes.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/routes/authRoutes.js)
- [backend/src/routes/complaintRoutes.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/routes/complaintRoutes.js)
- [backend/src/routes/dashboardRoutes.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/routes/dashboardRoutes.js)
- [backend/src/routes/userRoutes.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/routes/userRoutes.js)

What routes do:

- connect URLs to controller functions

Example:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/complaints`
- `PATCH /api/complaints/:id/assign`

## 15. Authentication Flow

Authentication is handled with JWT.

### How it works

1. user logs in or registers
2. backend validates user
3. backend creates token
4. frontend stores token
5. frontend sends token in future requests

### Token generator

File:

[backend/src/utils/generateToken.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/utils/generateToken.js)

### Auth middleware

File:

[backend/src/middleware/authMiddleware.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/middleware/authMiddleware.js)

This middleware:

- reads JWT token from request header
- verifies token
- loads current user
- blocks unauthorized users

## 16. Complaint Flow

### Step 1: User submits complaint

The complaint is created in MongoDB with:

- category
- description
- block
- image
- status = `Pending`
- priority

### Step 2: Admin sees all complaints

Admin can open complaint details.

### Step 3: Admin assigns complaint to worker

The complaint gets:

- `assignedTo = worker id`
- `status = In Progress`

### Step 4: Worker sees assigned complaint

Worker can:

- open complaint
- add remark
- update status
- upload proof image

### Step 5: Complaint resolved

Status becomes:

- `Resolved`

### Step 6: User sees updated result

Resident can view the new status in the complaint list and detail page.

## 17. Image Uploads

Image uploads are handled with:

- frontend image picker
- backend multer middleware

Frontend file:

[frontend/src/screens/SubmitComplaintScreen.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/screens/SubmitComplaintScreen.js)

Backend file:

[backend/src/middleware/uploadMiddleware.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/middleware/uploadMiddleware.js)

Uploaded files are stored in:

[backend/uploads](C:/Users/User/Desktop/reactnative/YtReactNative/backend/uploads)

## 18. Priority and Duplicate Detection

Priority is automatically calculated.

File:

[backend/src/utils/calculatePriority.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/utils/calculatePriority.js)

How it works:

- serious categories like electricity/security get higher weight
- duplicate complaints in same block increase urgency
- final priority becomes `Low`, `Medium`, or `High`

Duplicate detection logic is handled during complaint creation in:

[backend/src/controllers/complaintController.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/controllers/complaintController.js)

## 19. Error Handling

Backend error middleware file:

[backend/src/middleware/errorMiddleware.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/middleware/errorMiddleware.js)

Why this matters:

- errors are returned in a consistent format
- app crashes are easier to debug

Async wrapper file:

[backend/src/utils/asyncHandler.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/utils/asyncHandler.js)

This prevents repetitive `try/catch` route boilerplate.

## 20. Step-by-Step Testing Flow

Once frontend and backend are both running:

### Terminal 1

Run backend:

```powershell
npm run backend
```

### Terminal 2

Run frontend:

```powershell
npm run frontend
```

### Test flow

1. Register a resident account
2. Login as resident
3. Submit complaint
4. Open complaint list
5. Confirm complaint appears

### To test admin and worker

Public registration currently creates normal residents only.

So to test admin/worker:

1. create users normally
2. go to MongoDB Atlas
3. open `society-connect` database
4. open `users` collection
5. change one user's role to `admin`
6. change another user's role to `worker`

Then:

1. login as admin
2. open complaint details
3. assign complaint to worker
4. login as worker
5. view assigned complaint
6. update status to resolved

## 21. Why Roles Are Not Publicly Selectable

This is intentional.

If a normal user could register as `admin` from the frontend, that would be a major security issue.

Correct design is:

- public registration for residents only
- admin created manually at first
- admin later creates worker accounts

## 22. Common Problems and Fixes

### Problem: frontend cannot reach backend

Fix:

- make sure backend is running
- make sure frontend config uses:

```js
http://10.0.2.2:5000/api
```

for Android emulator

### Problem: Expo app opens but crashes

Fix:

- restart Expo
- reload app
- check frontend dependencies are installed

### Problem: Atlas connection fails

Fix:

- verify `Network Access`
- verify database user/password
- if SRV DNS fails, use standard `mongodb://` string instead of `mongodb+srv://`

### Problem: admin cannot assign worker

Fix:

- ensure worker user exists
- ensure role is exactly `worker`
- ensure backend is restarted after code changes

### Problem: complaint submission says fields are required even when filled

Fix:

- send complaint payload as `FormData`
- this was already corrected in the frontend service

## 23. Important Files You Should Read First

If you are a beginner, read these files in this order:

1. [frontend/App.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/App.js)
2. [frontend/src/navigation/AppNavigator.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/navigation/AppNavigator.js)
3. [frontend/src/context/AuthContext.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/context/AuthContext.js)
4. [frontend/src/screens/LoginScreen.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/screens/LoginScreen.js)
5. [frontend/src/screens/SubmitComplaintScreen.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/screens/SubmitComplaintScreen.js)
6. [frontend/src/services/api.js](C:/Users/User/Desktop/reactnative/YtReactNative/frontend/src/services/api.js)
7. [backend/src/app.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/app.js)
8. [backend/src/routes/authRoutes.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/routes/authRoutes.js)
9. [backend/src/controllers/authController.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/controllers/authController.js)
10. [backend/src/controllers/complaintController.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/controllers/complaintController.js)
11. [backend/src/models/User.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/models/User.js)
12. [backend/src/models/Complaint.js](C:/Users/User/Desktop/reactnative/YtReactNative/backend/src/models/Complaint.js)

## 24. What You Learned From This Project

By building this project, you learn:

- how React Native screens work
- how Expo runs mobile apps
- how navigation works
- how authentication works
- how context works
- how backend APIs are built
- how MongoDB stores data
- how role-based access works
- how frontend and backend communicate
- how to debug real project issues

## 25. Next Improvements You Can Build

This project is already a strong final year project base, but you can improve it further.

### Good next improvements

- add dropdown for complaint category
- add proper worker selection cards
- add resident notification system
- add push notifications using Firebase
- add cloud image storage like Cloudinary
- add admin ability to create worker accounts
- add complaint filtering
- add search by block/category
- add feedback form after complaint resolution
- add charts in admin dashboard
- add validation with better error messages
- add seed script for demo users

## 26. Final Summary

This app is a full-stack mobile project with:

- Expo frontend
- Express backend
- MongoDB Atlas database
- JWT authentication
- role-based access
- complaint workflow for residents, admins, and workers

If you understand the files and flow in this guide, you will understand the full project much better than just copying code.

The most important idea is this:

- frontend shows UI
- backend handles logic
- database stores data
- auth decides who can do what

That is the foundation of many real-world apps.
