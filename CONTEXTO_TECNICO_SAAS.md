# Blueprint Técnico: Mía Dashboard SaaS 🚀

Este documento proporciona el contexto completo del proyecto **Mía Dashboard** para que una IA (Gemini/ChatGPT) pueda asistir en la escalabilidad hacia un modelo SaaS (Software as a Service).

---

## 1. Identidad y Propósito
**Mía Dashboard** es un CRM inteligente diseñado para la gestión masiva de leads vía WhatsApp, utilizando IA para analítica descriptiva y predictiva. Permite automatizar conversaciones y visualizar el funnel de ventas en tiempo real.

---

## 2. Arquitectura de Software

### Core Stack:
- **Frontend**: React 18 + Vite (Ultrarrápido).
- **Estilos**: Tailwind CSS + Mantine UI (Componentes Premium).
- **Backend**: Node.js + Express.
- **Base de Datos**: Microsoft SQL Server (Transaccional complejo).
- **IA**: Google Gemini 1.5 Flash (NL2SQL y explicaciones).

### Estructura Multitenant (SaaS):
El sistema ya soporta multitenencia básica mediante la columna `client_id` en las tablas principales.
- **Niveles de Permiso**:
    - `1`: Usuario básico.
    - `3`: Analista.
    - `6`: Admin de Cliente (ve solo sus datos).
    - `8`: Super Admin (gestiona clientes y sistema).

---

## 3. Modelo de Datos (Esquema Crítico)

El sistema opera sobre tres bases de datos principales (específicamente en SQL Server):

1.  **`web_react_dashboard`**: Gestión de usuarios, sesiones y multitenancia (`users_main`, `Clients`, `UserLogs`).
2.  **`bbdd_sophia`**: Módulo de vacantes, condiciones laborales y FAQs dinámicos para el bot.
3.  **`bbdd_ect_pue_Mia_prepago_R7`**: El "Data Warehouse" donde viven los leads (`tb_mia_flujo_ventas`), logs de mensajes y métricas de marketing (`tb_MetaCampanias`).

---

## 4. Flujos de Lógica Clave

### A. Mía IA (Natural Language to SQL)
El backend recibe una pregunta en texto (ej: "¿Cuántas ventas hubo en Puebla ayer?"). 
1. Envía el esquema de tablas al modelo Gemini.
2. Gemini genera una consulta SQL plana.
3. El servidor ejecuta el SQL en SQL Server.
4. Gemini explica los resultados JSON en lenguaje natural.

### B. Proxy de Mensajería (Hybrid Bot)
El sistema utiliza un bot externo en Python (MIA Bot) vía **ngrok**. El Dashboard actúa como centro de mando:
- Permite ver el historial cargando datos de SQL.
- Permite tomar el control manual (`modo_manual = 1`).
- Envía mensajes mediante un proxy POST hacia el bot de Python.

---

## 5. Objetivos de Escalabilidad SaaS

Para llevar este proyecto al siguiente nivel, Gemini debe ayudar con:

1.  **Onboarding Automatizado**: Cómo crear un flujo donde un nuevo cliente se registre y se aprovisionen sus tablas/configuraciones automáticamente.
2.  **Aislamiento de Datos**: Estrategia de "Shared Database vs Database per Tenant" para manejar clientes de alta carga.
3.  **Escalabilidad de Webhooks**: Cómo manejar 10k+ mensajes por segundo sin saturar el servidor de Express (colas con Redis/BullMQ).
4.  **Seguridad & Privacidad**: Asegurar que las consultas de IA (NL2SQL) nunca filtren datos entre distintos `client_id`.
5.  **Infraestructura Cloud**: Migración de servidores locales/ngrok a AWS/Azure/Vercel con contenedores (Docker).
6.  **Facturación (Subscription Management)**: Integración de Stripe para cobros recurrentes basados en el volumen de leads.

---

## 6. Archivos Clave para Referencia
- `server/index.js`: Lógica de API y configuración de Gemini.
- `server/sql_queries.js`: Consultas base del sistema.
- `src/layouts/DashboardLayout.jsx`: Arquitectura de la interfaz.
- `DATABASE_SCHEMA.md`: Documentación técnica de las tablas.

---
*Este documento fue generado para servir como "Memoria Técnica" para arquitectos de IA.*
