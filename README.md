# Hairbnb

Comprehensive management platform for barbershops. Connects owners, barbers, and customers in a single ecosystem: online reservations, schedule management, real-time chat, AI-powered look editing, and subscription payments.

---
## Demo

Deployed on [Render](https://hairbnb-bw01.onrender.com/)

---

## Application Tech Stack

### Frontend

- React + Vite
- React Router DOM
- Socket.io Client
- Google Maps Extended Component Library (`@googlemaps/extended-component-library`)
- Cloudinary (image uploading)

### Backend

- Python + Flask
- Flask-JWT-Extended (role-based authentication)
- Flask-SocketIO (real-time messaging)
- SQLAlchemy + PostgreSQL
- Stripe (payments and subscriptions)
- Stability AI (AI image editing)
- DeepL (automatic prompt translation)

---

## User roles

| Role | Description |
|---|---|
| `admin` | Full access to all data and models |
| `owner` | Manages their barbershops, barbers, and subscription |
| `barber` | Manages their profile, schedules, and services |
| `client` | Books appointments and chats with barbershops |

---

## Main features

### Authentication

- Separate login for each role: `/login/admin`, `/login/owner`, `/login/barber`, `/login/client`
- JWT with role claims included in each token
- Private routes protected by role

### Barbershops

- Full CRUD for barbershops (owners and admin)
- Weekly schedule configuration with morning and afternoon shifts per day
- Schedule consistency validation (opening < closing, afternoon does not overlap morning)
- Geolocation with Google Maps (latitude, longitude, address)
- Image upload to Cloudinary
- Only barbershops with an active subscription are publicly visible

### Barbers

- Registration and profile management
- Invitation system: the owner invites a barber to their barbershop by email or phone
- The barber accepts or declines the invitation
- A barber can work in several barbershops

### Barber schedules

- The barber sets their schedule per barbershop (with one or more shifts per barbershop per day)
- Validation: the barber's schedule must be within the barbershop's hours
- Validation: no overlap with shifts at other barbershops where they work is allowed.

### Services

- Each barber manages their service catalog (name, price, duration, image, description)
- Services are the basis of the reservation system

### Appointments

- Book an appointment by selecting a barber, service, date, and time
- Real-time availability validation (`/barber_availability`)
- Collision control: overlapping appointments are not allowed
- Validation of barber's working hours
- Appointment statuses: `pending`, `confirmed`, `completed`, `no_show`
- Appointment status management by barber, owner, or admin

### Real-time chat

- Conversations between customers and barbershop owners
- Real-time messaging via Socket.io
- Admin can delete messages and conversations

### AI - Look editing

- Customer uploads a photo and describes the cut they want
- Prompt is automatically translated into English with DeepL
- Stability AI edits the image using “search and replace”
- Edited image is returned

### Subscriptions (Stripe)

- Available plans: monthly, quarterly, and annual
- Checkout with Stripe, redirection to success/cancellation URL
- Subscription activation after confirmed payment
- Verification of status and next payment date
- Only barbershops with active subscriptions appear in the public listing

---

## Data models

| Model | Description |
|---|---|
| `User` | Customers |
| `Owner` | Barber shop owners |
| `Barber` | Barbers |
| `AdminUser` | Administrators |
| `Barbershop` | Barber shops |
| `BarberBarbershop` | Barber ↔ barber shop relationship (invitation) |
| `Schedule` | Barber schedules per barber shop |
| `BarberService` | Services offered by each barber |
| `Appointment` | Booked appointments |
| `Conversation` | Customer ↔ owner conversations |
| `ChatMessage` | Individual messages from each conversation |

---

## Environment variables

### Backend

```
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=...
STRIPE_SECRET_KEY=...
PRICE_ONE_MONTH=price_...
PRICE_THREE_MONTHS=price_...
PRICE_TWELVE_MONTHS=price_...
STABILITY_API_KEY=...
DEEPL_API_KEY=...
GOOGLE_GENAI_API_KEY=...
VITE_FRONTEND_URL=https://tu-frontend.onrender.com
```

### Frontend

```
VITE_BACKEND_URL=...
VITE_GOOGLE_MAPS_API_KEY=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
VITE_CLOUDINARY_CLOUD_NAME=...
```

---

## Local installation

### Backend

```bash
# Clone the repository
# Create and activate the virtual environment
# Install dependencies
# Configure environment variables
# Edit .env with your credentials
# Create the database and apply migrations
# Launch the port
```

### Frontend

```bash
# Install npm
# Launch the port
```

---

## Deploy on Render

The project is deployed on Render with two separate services:
- **Web Service** for the Flask backend (with gunicorn + eventlet for Socket.io)
- **Static Site** for the Vite frontend

---

## API — Main Endpoints

### Auth

| Method | Route | Description |
|---|---|---|
| POST | `/api/login/client` | Client login |
| POST | `/api/login/barber` | Barber login |
| POST | `/api/login/owner` | Owner login |
| POST | `/api/login/admin` | Admin login |

### Users

| Method | Route | Description |
|---|---|---|
| GET | `/api/users` | List users (admin) |
| POST | `/api/users` | Client registration |
| GET | `/api/users/:id` | View profile |
| PUT | `/api/users/:id` | Edit profile |
| DELETE | `/api/users/:id` | Delete account |

### Barbershops

| Method | Path | Description |
|---|---|---|
| GET | `/api/barbershops` | List active barbershops |
| POST | `/api/barbershops` | Create barbershop |
| GET | `/api/barbershops/:id` | View barbershop |
| PUT | `/api/barbershops/:id` | Edit barbershop |
| DELETE | `/api/barbershops/:id` | Delete barbershop |
| GET | `/api/owners/barbershops` | My barbershops (owner) |

### Invitations

| Method | Path | Description |
|---|---|---|
| GET | `/api/invitations` | View my invitations (barber) |
| POST | `/api/invitations` | Invite barber (owner) |
| PUT | `/api/invitations/:id` | Accept invitation |
| DELETE | `/api/invitations/:id` | Delete invitation |

### Schedules

| Method | Path | Description |
|---|---|---|
| GET | `/api/schedules` | My schedules (barber) |
| POST | `/api/schedules` | Create shift |
| PUT | `/api/schedules/:id` | Edit appointment |
| DELETE | `/api/schedules/:id` | Delete appointment |
| GET | `/api/schedules/by_invitation/:id` | Schedules by invitation |
| DELETE | `/api/schedules/by_invitation/:id` | Delete invitation schedules |

### Appointments

| Method | Path | Description |
|---|---|---|
| GET | `/api/appointments` | List appointments |
| POST | `/api/appointments` | Create reservation |
| PUT | `/api/appointments/:id` | Edit reservation |
| DELETE | `/api/appointments/:id` | Cancel reservation |
| PUT | `/api/appointments/:id/status` | Change status |
| GET | `/api/barber_availability` | Available slots |

### Chat

| Method | Path | Description |
|---|---|---|
| GET | `/api/conversations` | My conversations |
| POST | `/api/conversations` | Start conversation |
| GET | `/api/conversations/:id/messages` | View messages |
| POST | `/api/messages` | Send message |
| DELETE | `/api/messages/:id` | Delete message (admin) |

### AI & Stripe

| Method | Path | Description |
|---|---|---|
| POST | `/api/edit-hair` | Edit look with AI |
| POST | `/api/create-checkout-session` | Create payment session |
| POST | `/api/activate-subscription` | Activate subscription |
| GET | `/api/verify-subscription` | Verify status |

---

## Authors

Developed independently by Sandra Santos. This site is the final project for the Full-Stack Software Developer Bootcamp at 4Geeks Academy. March 2026.