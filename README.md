# MediTrack

MediTrack — a simple MVP demonstration of hospital staff & shift management built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Authentication System**: Role-based login for Admin, Doctors, and Nurses
- **Role-Based Dashboards**: 
  - **Doctors/Nurses**: View shifts, request shift changes, swap shifts
  - **Admins**: Approve/reject shift requests, view all shifts
- **Shift Management**: Request changes, view assigned shifts, manage schedules
- **Clean, minimal UI** designed for hospital staff
- Dummy data for demonstration purposes

## Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/meditrack
```

### 2. Seed the Database

```bash
cd backend
npm run seed
```

This will populate the database with dummy data including:
- Doctors and nurses
- Patients (some requiring constant care)
- Sample shifts

### 3. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5001`

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
smartcare/
├── backend/
│   ├── models/
│   │   ├── User.js          # Doctor/Nurse/Admin model
│   │   ├── Patient.js       # Patient model
│   │   └── Shift.js         # Shift model
│   ├── routes/
│   │   ├── patients.js      # Patient API routes
│   │   └── staff.js         # Staff API routes
│   ├── seeds/
│   │   └── seedData.js      # Database seed script
│   └── server.js            # Express server
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx                # Main dashboard
    │   │   ├── ConstantCarePatients.jsx     # Patient list component
    │   │   └── AvailableStaff.jsx           # Available staff component
    │   ├── App.jsx
    │   └── main.jsx
    └── vite.config.js
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password

### Patients
- `GET /api/patients/constant-care` - Get all patients requiring constant care
- `GET /api/patients` - Get all patients

### Staff
- `GET /api/staff/available` - Get all available doctors and nurses
- `GET /api/staff` - Get all staff members

### Shifts
- `GET /api/shifts` - Get all shifts
- `GET /api/shifts/user/:userId` - Get shifts for a specific user
- `POST /api/shifts` - Create a new shift
- `POST /api/shifts/request` - Create a shift request
- `GET /api/shifts/requests` - Get all shift requests (admin)
- `GET /api/shifts/requests/user/:userId` - Get requests for a user
- `PATCH /api/shifts/requests/:requestId` - Approve/reject request (admin)

## Login Credentials

### Admin
- Email: `admin@meditrack.com`
- Password: `admin123`

### Doctor
- Email: `sarah.johnson@meditrack.com`
- Password: `doctor123`

### Nurse
- Email: `patricia.brown@meditrack.com`
- Password: `nurse123`

*Note: All users follow the pattern: `[name]@meditrack.com` / `[role]123`*

## Notes

- This is an MVP/demo project using dummy data
- Simple password authentication (no encryption) - for demo only
- Frontend currently uses mock data (backend API routes are ready)
- Designed for educational/demonstration purposes

