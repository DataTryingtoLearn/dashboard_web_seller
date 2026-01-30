# Database Schema Documentation

## Overview
This document describes the database schema for the Sophia Dashboard application, which spans multiple databases for different functional areas.

## Database Structure

### 🗄️ **web_react_dashboard** - User Management & Authentication
Main database for user accounts, permissions, and audit logs.

#### Tables:

**1. users_main**
- **Purpose**: User authentication and authorization
- **Columns**:
  - `id` (VARCHAR(50), PK): Employee ID
  - `name` (VARCHAR(255)): Full name
  - `password` (VARCHAR(255)): Bcrypt hashed password
  - `role` (VARCHAR(50)): User role (admin, user, analyst)
  - `permission_level` (INT): Permission tier (1, 3, 6, 8)
  - `client_id` (INT, FK): Associated client for multitenancy
  - `fecha_registro` (DATETIME): Registration date

**2. Clients**
- **Purpose**: Multitenancy support
- **Columns**:
  - `id` (INT, PK, IDENTITY): Auto-increment ID
  - `name` (VARCHAR(255)): Client name
  - `fecha_registro` (DATETIME): Registration date

**3. UserLogs**
- **Purpose**: Audit trail for user actions
- **Columns**:
  - `id` (INT, PK, IDENTITY): Auto-increment ID
  - `user_id` (VARCHAR(50)): User who performed action
  - `action` (VARCHAR(50)): Action type (LOGIN, LOGOUT, CREATE_USER, etc.)
  - `details` (VARCHAR(255)): Additional details
  - `ip_address` (VARCHAR(50)): IP address
  - `id_cliente` (INT): Client ID for tracking
  - `timestamp` (DATETIME): When action occurred

---

### 🗄️ **bbdd_sophia** - Vacancy & Messaging Module
Database for job vacancy management and WhatsApp messaging.

#### Tables:

**1. Vacantes**
- **Purpose**: Job vacancy listings
- **Columns**:
  - `id` (INT, PK, IDENTITY): Auto-increment ID
  - `client_id` (INT, FK): Owner client
  - `nombre` (VARCHAR(255)): Vacancy name/title
  - `fecha_creacion` (DATETIME): Creation date
  - `estado` (VARCHAR(50)): Status (Abierta, Cerrada, Pausada)

**2. CondicionesGenerales**
- **Purpose**: Detailed conditions for each vacancy
- **Columns**:
  - `id` (INT, PK, IDENTITY): Auto-increment ID
  - `vacante_id` (INT, FK): Associated vacancy
  - `sueldo` (DECIMAL(18,2)): Salary
  - `bono` (DECIMAL(18,2)): Bonus
  - `horarios` (VARCHAR(MAX)): Work schedule
  - `beneficios` (VARCHAR(MAX)): Benefits
  - `requisitos` (VARCHAR(MAX)): Requirements
  - `documentacion` (VARCHAR(MAX)): Required documents

**3. FAQ_Dinamico**
- **Purpose**: Dynamic FAQ for each vacancy
- **Columns**:
  - `id` (INT, PK, IDENTITY): Auto-increment ID
  - `vacante_id` (INT, FK): Associated vacancy
  - `pregunta` (VARCHAR(MAX)): Question
  - `respuesta` (VARCHAR(MAX)): Answer
  - `palabras_clave` (VARCHAR(MAX)): Keywords for matching

**4. mensajes_out**
- **Purpose**: Outbound WhatsApp messages queue
- **Columns**:
  - `id` (INT, PK, IDENTITY): Auto-increment ID
  - `remitente_wa_id` (VARCHAR(50)): WhatsApp recipient ID
  - `mensaje_texto` (VARCHAR(MAX)): Message content
  - `fecha_mensaje` (DATETIME): Message creation date
  - `estado` (VARCHAR(50)): Status (PENDIENTE, ENVIADO, FALLIDO)
  - `Manual` (BIT): 0 = Automatic, 1 = Manual
  - `fecha_envio` (DATETIME): When message was sent
  - `error_mensaje` (VARCHAR(MAX)): Error details if failed
- **Indexes**:
  - `IX_mensajes_out_wa_id`: Fast lookups by WhatsApp ID
  - `IX_mensajes_out_fecha`: Fast date sorting

**5. conversaciones** *(Reference only - managed externally)*
- **Purpose**: Message history (inbound and outbound)
- **Key Columns**: `remitente_wa_id`, `mensaje_texto`, `fecha_mensaje`, `sentido`

**6. tb_citas** *(Reference only - managed externally)*
- **Purpose**: Appointment/conversion tracking
- **Key Columns**: `id`, `remitente_wa_id`, `fecha_mensaje`

---

## Permission Levels

| Level | Role | Access |
|-------|------|--------|
| 1 | User | Basic read access |
| 3 | Analyst | Read + limited write |
| 6 | Admin | Full access to assigned client |
| 8 | Super Admin | Full system access, can create clients |

---

## Relationships

```
Clients (1) ──< (N) users_main
Clients (1) ──< (N) Vacantes
Vacantes (1) ──< (N) CondicionesGenerales
Vacantes (1) ──< (N) FAQ_Dinamico
```

---

## Setup Instructions

### Initial Setup
1. Run `schema.sql` to create all tables
2. Create initial Super Admin user manually
3. Use the dashboard to create additional users

### Migration (Existing Database)
1. Run `migration_scripts.sql` to add missing columns
2. Verify table structures using verification queries
3. Create indexes for performance

### Quick Start SQL
```sql
-- Create first Super Admin user
INSERT INTO web_react_dashboard..users_main (id, name, password, role, permission_level, client_id)
VALUES ('E029863', 'Admin Principal', '$2b$10$...', 'admin', 8, NULL);

-- Create first client
INSERT INTO Clients (name) VALUES ('Cliente Principal');
```

---

## Maintenance

### Recommended Indexes
All critical indexes are included in `schema.sql` and `migration_scripts.sql`.

### Data Retention
- **UserLogs**: Consider archiving logs older than 180 days
- **mensajes_out**: Consider archiving messages older than 90 days
- See `migration_scripts.sql` for cleanup queries

---

## API Endpoints Reference

### User Management
- `GET /api/users` - List users (filtered by client_id for non-super-admins)
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/password` - Update password

### Messaging
- `GET /api/leads/chats` - Get chat list
- `GET /api/leads/:wa_id/conversation` - Get conversation history
- `POST /api/messages/outbound` - Send outbound message
- `PATCH /api/messages/manual/:id` - Toggle manual status

### Authentication
- `POST /api/login` - User login

### Clients (Super Admin only)
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client

---

## Notes

- All passwords are hashed using bcrypt (10 rounds)
- The `Manual` column in `mensajes_out` tracks whether a message was sent manually or automatically
- Multitenancy is enforced at the application level using `client_id`
- Trial users (E029863, E015379) are hardcoded in the backend for testing
