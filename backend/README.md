# Backend - MediTrack

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/meditrack
```

3. Make sure MongoDB is running

4. Seed the database:
```bash
npm run seed
```

5. Start the server:
```bash
npm run dev
```

Server runs on http://localhost:5001

## API Routes

- `GET /api/patients/constant-care` - Get patients needing constant care
- `GET /api/staff/available` - Get available doctors and nurses
- `GET /api/health` - Health check


