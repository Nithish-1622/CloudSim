# CloudSim Local Setup Guide

## Prerequisites
- Node.js >= 22.x
- Docker & Docker Compose
- npm >= 10.x

## Step-by-Step Instructions

1. **Clone Repository & Environment Setup:**
   ```bash
   cp .env.example .env
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start Infrastructure with Docker Compose:**
   ```bash
   docker compose up --build
   ```

4. **Initialize Database & Seed Data:**
   ```bash
   npm run seed
   ```

5. **Access Endpoints:**
   - **Dashboard UI:** http://localhost:3000
   - **Control Plane API:** http://localhost:4000
   - **Healthcheck:** http://localhost:4000/health
   - **PostgreSQL:** localhost:5432 (user: `cloudsim`, db: `cloudsim_db`)
   - **Redis:** localhost:6379
