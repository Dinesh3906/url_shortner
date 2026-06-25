# ShortLink - Scalable URL Shortener System

ShortLink is a production-ready, full-stack URL shortening platform built with a high-performance, cache-aside architecture using Node.js, Express, MongoDB, and Redis.

## Features
* **URL Shortening**: Base62 conversion of sequential integers ensuring 0% collision rates.
* **Low-Latency Redirection**: Cached via Redis, dropping redirection lookups to sub-5ms.
* **Non-Blocking Analytics**: Click counters and visitor telemetry logged asynchronously.
* **Interactive Dashboard**: Modern glassmorphism UI built with React + Vite + Tailwind CSS v4 and Recharts.
* **Security Controls**: JWT security, rate-limiting, bcrypt hashing, and URL validation.

---

## 🚀 Running via Docker Compose (Recommended)
You can launch the entire stack (React Frontend, Express Backend, MongoDB, and Redis) with a single command. Docker Compose will automatically configure the services and networking.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Startup Commands
1. Clone or open the project folder in your terminal.
2. Run the following command in the root folder:
   ```bash
   docker compose up --build
   ```
3. Once the build completes:
   * **Frontend Dashboard**: Open [http://localhost:3000](http://localhost:3000)
   * **Backend REST API**: Open [http://localhost:5000](http://localhost:5000)
   * **API Health Check**: Check [http://localhost:5000/health](http://localhost:5000/health)

---

## 🛠 Running Locally (Manual Development Mode)
If you prefer to run services manually without Docker, follow these steps:

### Prerequisites
* Node.js (v18+) and npm installed.
* Local **MongoDB** running on `mongodb://localhost:27017`
* Local **Redis** running on `redis://localhost:6379` *(Note: If Redis is offline, the backend will automatically fall back to database-only mode without crashing).*

### Setup and Launch

#### 1. Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the backend server in development mode:
   ```bash
   npm run dev
   ```
   The backend will start on [http://localhost:5000](http://localhost:5000).

#### 2. Setup Frontend
1. In a new terminal window, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The frontend will start on [http://localhost:5173](http://localhost:5173).

---

## 📁 Repository Structure
```
shortlink/
├── backend/                  # Node.js + Express API
│   ├── config/               # DB & Redis connection setups
│   ├── controllers/          # API endpoint logic handlers
│   ├── middleware/           # Auth, rate-limiter, error handling
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # Express routing tables
│   ├── utils/                # Base62 encoding utility
│   ├── Dockerfile
│   └── server.js             # Main server entrypoint
│
├── frontend/                 # React SPA (Vite)
│   ├── src/
│   │   ├── components/       # UI Components (Navbar)
│   │   ├── context/          # Auth context tracking session JWTs
│   │   ├── pages/            # View Pages (Landing, Login, Dashboard, Analytics)
│   │   ├── App.jsx           # Routing paths config
│   │   ├── index.css         # Styling system & Tailwind V4 import
│   │   └── main.jsx
│   ├── Dockerfile
│   └── nginx.conf            # Nginx config for static assets & proxies
│
├── docker-compose.yml        # Orchestration configuration
├── URL_SHORTENER_REPORT.md   # System Design & CS Project Report
└── README.md                 # Project README
```

---

## 📋 Comprehensive Technical Report
A detailed system architecture, database design schema, REST API documentation, scalability designs, and security audits can be found in [URL_SHORTENER_REPORT.md](URL_SHORTENER_REPORT.md).
