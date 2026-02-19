# Floki's Hotel Backend

Node.js/Express backend for Floki's Hotel platform.

## Features
- REST API for menu, orders, users, payments
- MPESA till integration
- MongoDB database
- JWT authentication
- Admin endpoints for menu/prices/till/offers
- WebSocket/Socket.io for live delivery tracking
- Notification service integration

## Setup
1. `npm install`
2. Configure `.env` for MongoDB, MPESA, JWT, etc.
3. `npm start`

---

## Production Checklist
- Environment: set `NODE_ENV=production` and use a strong `JWT_SECRET`.
- Database: use MongoDB Atlas; set `MONGO_URI` in `.env` and whitelist the server IP in Atlas.
- MPESA: set `MPESA_ENV=production`, real `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORT_CODE`, `MPESA_PASSKEY`, and a public HTTPS `MPESA_CALLBACK_URL` (e.g. `https://api.yourdomain.com/api/mpesa/callback`).
- Security: enable CORS to only your frontends, use HTTPS, and consider adding Helmet + rate limiting.
- Logging: configure an app logger (e.g. Winston) and rotate logs.
- Health: expose a simple `/health` endpoint for uptime checks.
- Time sync: ensure server clock is accurate (Daraja signatures rely on timestamps).

## cPanel & Deployment Notes
- Frontends: deploy the React build folders under each subdomain; `.htaccess` is included for SPA routing.
- Backend on cPanel: requires Node.js support (Passenger/Application Manager). On shared plans without Node, deploy on a VPS or a Node-friendly host.
- MongoDB on cPanel: you cannot run MongoDB on shared cPanel. Use MongoDB Atlas and connect via `MONGO_URI` from the backend.
- Outbound firewall: if the host blocks outbound to Mongo ports, use Atlas Data API (HTTPS) or request firewall changes.
- WebSockets: some cPanel hosts limit WebSocket upgrades; Socket.IO will fall back to long‑polling automatically.

## Start
- Development: `npm run dev`
- Production: `npm start` (ensure `.env` is set and `NODE_ENV=production`)
