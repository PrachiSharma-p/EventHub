# EventHub — Event Management & Ticket Booking System (MERN)

A full-stack platform where **organizers** create and manage events, and
**attendees** browse events, book tickets, and receive digital booking
confirmations.

## Stack
- **MongoDB** — stores Users, Events, Bookings (via Mongoose)
- **Express.js** — REST API (Node.js)
- **React.js** — single-page frontend
- **Node.js** — JavaScript runtime for the server

## Folder structure
```
backend/    Express + Mongoose API (server.js, models, routes, middleware)
frontend/   React app (src/pages, src/components, src/api)
```

## Running locally

### 1. Backend
```
cd backend
npm install
cp .env.example .env      # add your MongoDB URI + JWT secret
npm run dev                # starts on http://localhost:5000
```

### 2. Frontend
```
cd frontend
npm install
npm start                  # starts on http://localhost:3000
```

The React app calls the API at `http://localhost:5000/api` (see `src/api/api.js`).

### Password reset email
For local development without email credentials, the forgot-password form returns a reset link when the account exists. For email delivery, set `RESEND_API_KEY`, `EMAIL_FROM` to a verified sender, and `FRONTEND_URL` in `backend/.env`. Set `NODE_ENV=production` in production; password reset requests return a configuration error until email delivery is configured.

## Core features
- JWT auth with two roles: `organizer` and `attendee`
- User profiles with editable name, email, phone, optional profile-picture URL, and booking history
- Password reset links with expiring, single-use tokens
- Organizers: create/update/delete events, view seats booked
- Attendees: browse & search events, book seats, view/cancel bookings
- Every booking gets a unique digital `bookingCode` (the confirmation)
