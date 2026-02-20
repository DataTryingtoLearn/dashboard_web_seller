# Mía Dashboard - Sistema CRM Inteligente 

Mía Dashboard es una plataforma de gestión de clientes (CRM) y analítica avanzada potenciada por Inteligencia Artificial. Diseñada para escalar las ventas mediante la automatización real, permite gestionar miles de conversaciones, calificar leads y visualizar métricas críticas en tiempo real.

##  Características Principales

###  Landing Page Premium
- Diseño moderno inspirado en grandes SaaS
- Secciones de hero animadas, funcionalidades, prueba social y métricas de impacto.
- Totalmente responsiva y optimizada para conversiones.

###  Dashboard Dinámico
- **Métricas en Tiempo Real**: Visualización de Leads, Contactados, Ventas y Gasto de Meta.
- **Calendario Inteligente**: Filtrado dinámico que actualiza todas las gráficas y tablas simultáneamente.
- **Gráficas Avanzadas**: Distribución semanal y horaria de la eficiencia operativa.
- **Estatus 360**: Tabla de evolución histórica de estatus por periodos.

### Asistente de IA (Gemini)
- **Consultas en Lenguaje Natural**: Mía puede generar y ejecutar consultas SQL complejas simplemente pidiéndolo en texto.
- **Explicaciones Amigables**: Los resultados de los datos son explicados de forma humana y profesional por la IA.
- **Panel Lateral de IA**: Acceso rápido a análisis predictivos y descriptivos.

### Gestión de Chats
- **Modo Bot/Manual**: Capacidad para alternar el control de las conversaciones entre la IA y agentes humanos.
- **Historial Completo**: Visualización de conversaciones entrantes y salientes.
- **Proxy Integrado**: Conexión fluida con bots externos (Python) vía ngrok.

### Personalización y UX
- **Modo Oscuro/Claro**: Adaptación visual según la preferencia del usuario.
- **Temas Dinámicos**: Cambia el color primario de toda la interfaz en un clic.
- **Notificaciones Premium**: Sistema de alertas elegante para eventos críticos.

---

##  Stack Tecnológico

**Frontend:**
- **React + Vite**: Para una experiencia de desarrollo y ejecución ultrarrápida.
- **Framer Motion**: Animaciones fluidas y micro-interacciones.
- **Mantine UI + Tailwind CSS**: Sistema de diseño robusto y flexible.
- **Lucide React**: Iconografía moderna y consistente.

**Backend:**
- **Node.js + Express**: Servidor escalable para la lógica de negocio y APIs.
- **MSSQL (SQL Server)**: Base de datos robusta para el manejo de grandes volúmenes de datos.
- **Google Generative AI (Gemini 1.5 Flash)**: Motor de inteligencia artificial para SQL y procesamiento de lenguaje.

---

##  Instalación y Ejecución

1. **Clonar el repositorio e instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz con las credenciales de base de datos, API de Gemini y puertos.

3. **Ejecutar el Proyecto (Frontend y Backend):**
   ```bash
   npm run dev
   ```
   *Nota: Este comando utiliza `concurrently` para lanzar el servidor de Node.js y el entorno de desarrollo de Vite al mismo tiempo.*

---

##  Estructura del Proyecto

- `/src`: Código fuente de la aplicación React (páginas, componentes, contextos).
- `/server`: Lógica del servidor Express, configuración de base de datos y prompts de IA.
- `/public`: Activos estáticos públicos.
- `/dist`: Build de producción generado por Vite.

---

**Mía Dashboard** - Transformando datos en decisiones inteligentes.
