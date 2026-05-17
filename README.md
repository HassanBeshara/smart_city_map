# Smart City Map

A full-stack interactive map platform for exploring and managing city locations — restaurants, hospitals, parking, events, and reported issues — with real-time updates, heatmaps, routing, and authentication.

## Features

- **Interactive map** — Leaflet.js with marker clustering, custom category icons, dark/light map tiles
- **Markers** — Add places with title, description, category, region (NYC / Lebanon), images, and coordinates
- **Search & filter** — Text search and category filters
- **Real-time** — Socket.io for live marker updates and location sharing
- **Live location** — GPS tracking with nearest-place suggestions
- **Heatmap** — Visualize crowded or frequently reported areas
- **Routing** — Plan routes between two points (OSRM)
- **Authentication** — JWT login/register, favorites, manage own markers
- **Dashboard** — User stats, my markers, favorites
- **Admin panel** — Manage users, approve/reject reports, view statistics

## Tech Stack

| Layer    | Technologies                          |
|----------|---------------------------------------|
| Frontend | React, Vite, Tailwind CSS, Leaflet    |
| Backend  | Node.js, Express, MongoDB, Mongoose   |
| Real-time| Socket.io                             |
| Auth     | JWT, bcrypt                           |

## Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

## Quick Start

```bash
# Install dependencies
npm run install:all

# Seed sample data (optional)
cd server && node src/seed.js

# Run both server and client
cd .. && npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

### Demo Accounts (after seeding)

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Admin | admin@smartcity.com   | admin123  |
| User  | demo@smartcity.com    | demo123   |

## Project Structure

```
Smart_city_map/
├── client/          # React frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── utils/
├── server/          # Express API
│   └── src/
│       ├── models/
│       ├── routes/
│       └── middleware/
└── package.json     # Root scripts
```

## Environment Variables

**Server** (`server/.env`):

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-city-map
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):

```
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
```

## API Endpoints

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| POST   | /api/auth/register          | Register user            |
| POST   | /api/auth/login             | Login                    |
| GET    | /api/markers                | List markers (filter)    |
| POST   | /api/markers                | Create marker (auth)     |
| GET    | /api/markers/nearest        | Nearest places           |
| GET    | /api/markers/heatmap        | Heatmap data             |
| GET    | /api/admin/stats            | Dashboard stats (admin)  |

## License

MIT
