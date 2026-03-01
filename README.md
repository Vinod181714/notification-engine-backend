# Notification Prioritization Engine Backend

This repository contains a Node.js/Express backend for a notification prioritization engine. It includes real-time updates via Socket.io, MongoDB storage with Mongoose, and additional services like AI classification and rule evaluation.

## Features

- Event ingestion with deduplication, rule evaluation, alert fatigue checks, and AI enrichment
- JWT authentication with admin and operator roles
- CRUD APIs for rules, events, audit logs, metrics, health, and later queue
- Background scheduler for processing "later" notifications
- Circuit breaker for AI service calls
- Soft deletes and audit logging
- Security middleware (Helmet, CORS, rate limiting)

## Setup

1. Copy `.env.example` to `.env` and fill in values:
   - `PORT` - port to run server
   - `NODE_ENV` - development or production
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_SECRET` - secret for JWT
   - `JWT_EXPIRES_IN` - token expiry (e.g. `7d`)
   - `OPENAI_API_KEY` - OpenAI API key
   - `OPENAI_MODEL` - model name (default `gpt-4o-mini`)
   - `AI_FAILURE_THRESHOLD` - failures before circuit opens
   - `AI_RESET_TIMEOUT_MS` - circuit reset timeout in ms
   - `FRONTEND_URL` - allowed origin for CORS

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. The server will seed two users (`admin@cyepro.com` / `admin123` and `operator@cyepro.com` / `operator123`) and four sample rules.

## API Endpoints

See code for details; includes: `/api/auth`, `/api/events`, `/api/audit-logs`, `/api/rules`, `/api/metrics`, `/api/health`, `/api/later-queue`.

## Notes

- All deletes are soft (using `deletedAt` field).
- Audit logs are immutable.
- Real-time events emitted over Socket.io channels `notification:processed` and `notification:ai_complete`.
- Later queue cron job runs every 5 minutes.
