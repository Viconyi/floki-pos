# Floki's Hotel Platform

This project is a full-stack solution for Floki's Hotel, enabling food ordering, menu management, MPESA till payments, live delivery tracking, notifications, and admin controls. It includes:

- Android app (React Native)
- Web app (React)
- Backend API (Node.js/Express)
- MongoDB database
- MPESA payment integration
- Google Maps API for live tracking
- Firebase/OneSignal for notifications

## Modules
- **Client**: Order food, view menu, track delivery, receive offers
- **Hotel**: Manage orders, update status, view delivery
- **Admin**: Update menu, prices, till, offers, send notifications

## Setup
Quick start on Windows:

1. Backend
	- Create backend/.env (already present) with `PORT=5000` and `MONGO_URI`.
	- Install deps: from project root run `npm install` in `backend`.
	- Start: use the VS Code task "backend:dev" or `npm run dev` in `backend`.

2. Web Client
	- Install deps: run `npm install` in `web-client`.
	- Start: use the VS Code task "frontend:web-client-3001" or `npm start` in `web-client`.

3. Web Hotel (staff)
	- Install deps: run `npm install` in `web-hotel`.
	- Start: use the VS Code task "frontend:web-hotel" or `npm start` in `web-hotel`.

4. Web Admin
	- Install deps: run `npm install` in `web-admin`.
	- Start: use the VS Code task "frontend:web-admin" or `npm start` in `web-admin`.

Seeding data:
- Run `npm run seed` in `backend` to populate sample menu items and orders.

Notes:
- Both frontends are configured with a proxy to `http://localhost:5000`.
- Enable `DEBUG_CONFIRMATION=true` in backend/.env to print verification codes to the console for testing.

## Portal Access
- Admin Portal: open [http://localhost:5004](http://localhost:5004) after starting "frontend:web-admin".
- Hotel Staff Portal: open [http://localhost:3002](http://localhost:3002) after starting "frontend:web-hotel".
- Client Portal: open [http://localhost:3001](http://localhost:3001) after starting "frontend:web-client-3001".

If a port is busy, the dev server will choose the next available port and print the actual "Local" URL in the terminal.

---

*Replace this with more details as the project evolves.*
