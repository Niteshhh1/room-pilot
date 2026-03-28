# 🏠 RoomPilot

A full-stack PG (Paying Guest) management web application built with the **MERN stack**. Manage rooms, tenants, payments, expenses, and earnings — all in one place.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TailwindCSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT (JSON Web Tokens) |
| Deployment | Vercel (frontend) + Render (backend) |

## 📁 Project Structure

```
RoomPilot/
├── client/          # React frontend (Vite)
└── server/          # Express backend (Node.js)
```

## ⚙️ Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account

### 1. Clone the repo
```bash
git clone https://github.com/Niteshhh1/room-pilot.git
cd room-pilot
```

### 2. Setup Server
```bash
cd server
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

### 3. Setup Client
```bash
cd client
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

App runs at: `http://localhost:5173`

## 🌍 Environment Variables

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Port for the Express server (default: 5000) |
| `NODE_ENV` | Environment: `development` or `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `CLIENT_URL` | Deployed frontend URL (for CORS) |

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

## 🚢 Deployment

### Backend → Render
1. Connect your GitHub repo to [Render](https://render.com)
2. Root directory: `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables in Render dashboard:
   - `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL), `NODE_ENV=production`

### Frontend → Vercel
1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Root directory: `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable in Vercel dashboard:
   - `VITE_API_URL` = your Render backend URL (e.g. `https://roompilot-api.onrender.com/api`)

## 📝 License
MIT
