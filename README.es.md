# Hairbnb

Plataforma de gestión integral para barberías. Conecta dueños, barberos y clientes en un mismo ecosistema: reservas online, gestión de horarios, chat en tiempo real, edición de look con IA y pagos por suscripción.

---

## Demo

Deployed en [Render](https://hairbnb-bw01.onrender.com/)

---

## Tech Stack de la aplicación

### Frontend
- React + Vite
- React Router DOM
- Socket.io Client
- Google Maps Extended Component Library (`@googlemaps/extended-component-library`)
- Cloudinary (subida de imágenes)

### Backend
- Python + Flask
- Flask-JWT-Extended (autenticación por roles)
- Flask-SocketIO (mensajería en tiempo real)
- SQLAlchemy + PostgreSQL
- Stripe (pagos y suscripciones)
- Stability AI (edición de imagen con IA)
- DeepL (traducción automática de prompts)

---

## Roles de usuario

| Rol | Descripción |
|---|---|
| `admin` | Acceso total a todos los datos y modelos |
| `owner` | Gestiona sus barberías, barberos y suscripción |
| `barber` | Gestiona su perfil, horarios y servicios |
| `client` | Reserva citas y chatea con barberías |

---

## Funcionalidades principales

### Autenticación
- Login independiente por rol: `/login/admin`, `/login/owner`, `/login/barber`, `/login/client`
- JWT con claims de rol incluido en cada token
- Rutas privadas protegidas por rol

### Barberías
- CRUD completo de barberías (dueños y admin)
- Configuración de horario semanal con turnos de mañana y tarde por día
- Validación de coherencia de horarios (apertura < cierre, tarde no solapa mañana)
- Geolocalización con Google Maps (latitud, longitud, dirección)
- Subida de imagen a Cloudinary
- Solo las barberías con suscripción activa son visibles públicamente

### Barberos
- Registro y gestión de perfil
- Sistema de invitaciones: el dueño invita a un barbero a su barbería por email o teléfono
- El barbero acepta o rechaza la invitación
- Un barbero puede trabajar en varias barberías

### Horarios de barberos
- El barbero configura su horario por barbería (con uno o varios turnos por barbería por día)
- Validación: el horario del barbero debe estar contenido dentro del horario del local
- Validación: no se permiten solapamientos con turnos en las otras barberías en las que trabaja.

### Servicios
- Cada barbero gestiona su catálogo de servicios (nombre, precio, duración, imagen, descripción)
- Los servicios son la base del sistema de reservas

### Citas
- Reserva de cita seleccionando barbero, servicio, fecha y hora
- Validación de disponibilidad en tiempo real (`/barber_availability`)
- Control de colisiones: no se permiten citas solapadas
- Validación de horario laboral del barbero
- Estados de cita: `pending`, `confirmed`, `completed`, `no_show`
- Gestión de estado de las citas por barbero, dueño o admin

### Chat en tiempo real
- Conversaciones entre clientes y dueños de barbería
- Mensajería en tiempo real via Socket.io
- El admin puede eliminar mensajes y conversaciones

### IA - Edición de look
- El cliente sube una foto y describe el corte que quiere
- El prompt se traduce automáticamente al inglés con DeepL
- Stability AI edita la imagen mediante "search and replace"
- Se devuelve la imagen editada

### Suscripciones (Stripe)
- Planes disponibles: mensual, trimestral y anual
- Checkout con Stripe, redirección a URL de éxito/cancelación
- Activación de suscripción tras pago confirmado
- Verificación del estado y fecha de próximo pago
- Solo barberías con suscripción activa aparecen en el listado público

---

## Modelos de datos

| Modelo | Descripción |
|---|---|
| `User` | Clientes |
| `Owner` | Dueños de barbería |
| `Barber` | Barberos |
| `AdminUser` | Administradores |
| `Barbershop` | Barberías |
| `BarberBarbershop` | Relación barbero ↔ barbería (invitación) |
| `Schedule` | Horarios de barberos por barbería |
| `BarberService` | Servicios ofrecidos por cada barbero |
| `Appointment` | Citas reservadas |
| `Conversation` | Conversaciones cliente ↔ dueño |
| `ChatMessage` | Mensajes individuales de cada conversación |

---

## Variables de entorno

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

## Instalación local

### Backend

```bash
# Clona el repositorio

# Crea y activa el entorno virtual

# Instala dependencias

# Configura las variables de entorno

# Edita .env con tus credenciales

# Crea la base de datos y aplica migraciones

# Levantar el puerto

```

### Frontend

```bash
# Instalación de npm

# Levantar el puerto

```

---

## Deploy en Render

El proyecto está desplegado en Render con dos servicios separados:

- **Web Service** para el backend Flask (con gunicorn + eventlet para Socket.io)
- **Static Site** para el frontend Vite

---

## API — Endpoints principales

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/login/client` | Login cliente |
| POST | `/api/login/barber` | Login barbero |
| POST | `/api/login/owner` | Login dueño |
| POST | `/api/login/admin` | Login admin |

### Usuarios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users` | Listar usuarios (admin) |
| POST | `/api/users` | Registro de cliente |
| GET | `/api/users/:id` | Ver perfil |
| PUT | `/api/users/:id` | Editar perfil |
| DELETE | `/api/users/:id` | Eliminar cuenta |

### Barberías
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/barbershops` | Listar barberías activas |
| POST | `/api/barbershops` | Crear barbería |
| GET | `/api/barbershops/:id` | Ver barbería |
| PUT | `/api/barbershops/:id` | Editar barbería |
| DELETE | `/api/barbershops/:id` | Eliminar barbería |
| GET | `/api/owners/barbershops` | Mis barberías (owner) |

### Invitaciones
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/invitations` | Ver mis invitaciones (barbero) |
| POST | `/api/invitations` | Invitar barbero (owner) |
| PUT | `/api/invitations/:id` | Aceptar invitación |
| DELETE | `/api/invitations/:id` | Eliminar invitación |

### Horarios
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/schedules` | Mis horarios (barbero) |
| POST | `/api/schedules` | Crear turno |
| PUT | `/api/schedules/:id` | Editar turno |
| DELETE | `/api/schedules/:id` | Eliminar turno |
| GET | `/api/schedules/by_invitation/:id` | Horarios por invitación |
| DELETE | `/api/schedules/by_invitation/:id` | Borrar horarios de invitación |

### Citas
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/appointments` | Listar citas |
| POST | `/api/appointments` | Crear reserva |
| PUT | `/api/appointments/:id` | Editar reserva |
| DELETE | `/api/appointments/:id` | Cancelar reserva |
| PUT | `/api/appointments/:id/status` | Cambiar estado |
| GET | `/api/barber_availability` | Slots disponibles |

### Chat
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/conversations` | Mis conversaciones |
| POST | `/api/conversations` | Iniciar conversación |
| GET | `/api/conversations/:id/messages` | Ver mensajes |
| POST | `/api/messages` | Enviar mensaje |
| DELETE | `/api/messages/:id` | Eliminar mensaje (admin) |

### IA & Stripe
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/edit-hair` | Editar look con IA |
| POST | `/api/create-checkout-session` | Crear sesión de pago |
| POST | `/api/activate-subscription` | Activar suscripción |
| GET | `/api/verify-subscription` | Verificar estado |

---

## Autores

Desarrollado en solitario por Sandra Santos. Este sitio es el proyecto final realizado para el Bootcamp Full-Stack Software Developer de 4Geeks Academy. Marzo de 2026.