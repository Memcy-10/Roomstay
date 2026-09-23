# RoomStay

Aplicación web para la gestión de habitaciones, reservas, ventas, facturación, usuarios, PQR y asistencia mediante chatbot de inteligencia artificial. El proyecto está dividido en un frontend React/Vite y un backend FastAPI conectado a MySQL mediante SQLAlchemy.

## Evidencias desplegadas

- **Frontend:** [https://roomstay-frontend-production.up.railway.app](https://roomstay-frontend-production.up.railway.app)
- **Backend API:** [https://roomstay-backend-production.up.railway.app](https://roomstay-backend-production.up.railway.app)
- **Documentación Swagger:** [https://roomstay-backend-production.up.railway.app/docs](https://roomstay-backend-production.up.railway.app/docs)
- **Documentación ReDoc:** [https://roomstay-backend-production.up.railway.app/redoc](https://roomstay-backend-production.up.railway.app/redoc)
- **Health check:** [https://roomstay-backend-production.up.railway.app/api/health](https://roomstay-backend-production.up.railway.app/api/health)
- **Repositorio:** [Memcy-10/Roomstay](https://github.com/Memcy-10/Roomstay)

El health check responde con el estado del servicio y permite comprobar que el backend está activo en Railway.

## Arquitectura

```text
React + Vite + Tailwind + Recharts
                |
                | Axios / JSON / JWT Bearer
                v
FastAPI + Uvicorn
                |
                | SQLAlchemy + PyMySQL
                v
MySQL
```

### Frontend

El frontend se encuentra en [`frontend/`](./frontend) y contiene:

- React con Vite.
- React Router para los paneles y rutas protegidas.
- Axios para consumir la API.
- Context API para mantener la sesión.
- Recharts para indicadores y gráficos.
- Nginx para servir la aplicación compilada en producción.

Existen tres experiencias principales:

- **Cliente:** búsqueda de habitaciones, reservas, favoritos, facturas, PQR y chatbot.
- **Hospedador:** administración de habitaciones, reservas, ventas y facturas propias.
- **Administrador:** usuarios, habitaciones, ventas, facturación, PQR, reportes y dashboard general.

### Backend

El backend se encuentra en [`backend/`](./backend) y contiene:

- FastAPI para las rutas HTTP.
- SQLAlchemy para los modelos ORM.
- Pydantic para validar peticiones y respuestas.
- MySQL como base de datos.
- JWT para autenticación y autorización.
- Bcrypt para almacenar contraseñas como hashes.
- ReportLab para PDF.
- OpenPyXL para Excel.
- Integración del chatbot con el proveedor de IA configurado.

### Base de datos

El esquema y los datos iniciales están en [`database/init.sql`](./database/init.sql). Las entidades principales son:

- Usuarios, roles y recuperación de contraseña.
- Habitaciones y favoritos.
- Reservaciones.
- Ventas y detalles de venta.
- Facturas y detalles de factura.
- PQR y contactos.
- Conversaciones y mensajes del chatbot.

## Flujo de autenticación

1. El usuario inicia sesión en `POST /api/auth/login`.
2. FastAPI verifica la contraseña con Bcrypt.
3. El backend genera un JWT firmado con `JWT_SECRET`.
4. React guarda el token en `sessionStorage` o `localStorage`.
5. Axios envía el token en cada petición:

```http
Authorization: Bearer <token>
```

6. FastAPI valida el token y comprueba que el usuario esté activo.
7. Las dependencias `require_admin` y `require_host_or_admin` controlan los permisos.

Las funciones de seguridad están en [`backend/app/core/security.py`](./backend/app/core/security.py), la configuración en [`backend/app/core/config.py`](./backend/app/core/config.py) y las dependencias de autenticación en [`backend/app/dependencies/auth.py`](./backend/app/dependencies/auth.py).

## Funcionalidades principales

### Habitaciones y reservas

- Listado público de habitaciones.
- Consulta por ubicación, tipo y disponibilidad.
- Creación, edición y eliminación para usuarios autorizados.
- Reservas de clientes.
- Consulta de reservas del cliente y del hospedador.
- Verificación de disponibilidad por fecha.

### Ventas y facturación

- Creación de ventas con detalles.
- Consulta de ventas por rol.
- Generación de facturas desde una venta.
- Prevención de facturas duplicadas para la misma venta.
- Actualización del estado de una factura.
- Consulta de detalles de venta y factura.

### Dashboard administrativo

El dashboard consume información real de MySQL mediante:

- `GET /api/stats/kpi-cards`
- `GET /api/stats/overview`

Genera dinámicamente:

- Usuarios.
- Habitaciones.
- Reservaciones.
- Ventas.
- Facturación.
- PQR pendientes.
- Ventas diarias y mensuales.
- Reservas por estado.
- PQR por tipo.

Admite filtros de:

- Fecha inicial.
- Fecha final.
- Servicio.
- Estado.
- Cliente.

No se utilizan datos manuales quemados para los indicadores o gráficos.

### Chatbot IA

Rutas principales:

- `POST /api/chatbot/send`
- `GET /api/chatbot/conversations`
- `GET /api/chatbot/conversations/{session_id}`

Las conversaciones y mensajes se almacenan en las tablas `conversaciones` y `mensajes`.

### PQR y contactos

- Creación de PQR por parte del cliente.
- Consulta de PQR propias.
- Gestión administrativa de PQR.
- Cambio de estados y respuestas.
- Registro y consulta de mensajes de contacto.

### Reportes

- Reporte diario de ventas en JSON.
- Descarga del reporte diario en PDF.
- Descarga del reporte diario en Excel.
- Descarga de factura en PDF.

## Rutas principales de la API

| Área | Rutas |
|---|---|
| Salud | `GET /api/health` |
| Autenticación | `/api/auth/*` |
| Usuarios | `/api/user/*` |
| Administración | `/api/admin/*` |
| Habitaciones | `/api/rooms/*` |
| Reservas | `/api/reservations/*` |
| Ventas | `/api/sales/*` |
| Facturas | `/api/invoices/*` |
| PQR | `/api/pqr/*` |
| Estadísticas | `/api/stats/*` |
| Reportes | `/api/reports/*` |
| Chatbot | `/api/chatbot/*` |
| Contacto | `/api/contact/*` |
| Archivos | `/api/upload/*` |

La lista completa y los esquemas se pueden consultar en [Swagger](https://roomstay-backend-production.up.railway.app/docs).

## Variables de entorno

### Backend

En Railway, el backend necesita las variables de conexión de MySQL y seguridad:

```env
DB_HOST=<host-de-mysql>
DB_PORT=3306
DB_USER=<usuario>
DB_PASSWORD=<contraseña>
DB_NAME=<base-de-datos>

JWT_SECRET=<clave-larga-aleatoria>
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=24

CORS_ORIGINS=https://roomstay-frontend-production.up.railway.app
FRONTEND_URL=https://roomstay-frontend-production.up.railway.app

OPENAI_API_KEY=<clave-del-proveedor-de-IA>
OPENAI_MODEL=gpt-4o-mini
ENV=production
```

Railway proporciona automáticamente `PORT`; no se debe fijar manualmente a `3001`, `5173` u otro valor en producción.

### Frontend

Durante el build del frontend:

```env
VITE_API_URL=https://roomstay-backend-production.up.railway.app/api
```

La URL debe terminar en `/api` y no debe tener una barra adicional al final.

## Ejecución local

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API local:

```text
http://localhost:8000/api
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend local:

```text
http://localhost:5173
```

## Pruebas de Postman

La colección de pruebas se encuentra en:

[`postman/RoomStay - Seguridad JWT.postman_collection.json`](./postman/RoomStay%20-%20Seguridad%20JWT.postman_collection.json)

Incluye pruebas de:

- Health y endpoints públicos.
- Login de administrador, hospedador y cliente.
- Generación y validación de JWT.
- Rechazo de contraseña incorrecta.
- Rutas sin autenticación.
- Restricciones por rol.
- Habitaciones y reservas.
- Ventas y facturas.
- Chatbot y conversaciones.
- Estadísticas y KPIs.
- Reportes JSON, PDF y Excel.
- PQR, contactos y disponibilidad.

La última ejecución contra Railway validó:

```text
Solicitudes: 49
Solicitudes fallidas: 0
Scripts fallidos: 0
Aserciones fallidas: 0
```

Para ejecutarla con Newman:

```powershell
npx newman run "postman\RoomStay - Seguridad JWT.postman_collection.json" `
  --env-var "baseUrl=https://roomstay-backend-production.up.railway.app/api"
```

Se deben ejecutar primero los tres login para que la colección guarde los tokens de administrador, hospedador y cliente.

## Seguridad y buenas prácticas

- No se guardan contraseñas en texto plano.
- Las contraseñas se procesan con Bcrypt.
- Las rutas protegidas exigen JWT.
- Los permisos se validan en el backend, no solo en React.
- Las claves secretas no deben subirse al repositorio.
- Los archivos `.env` están excluidos por `.gitignore`.
- `JWT_SECRET` debe ser una clave larga y aleatoria en producción.
- Los archivos subidos localmente pueden requerir almacenamiento persistente o externo en Railway.

## Estructura resumida

```text
Roomstay/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── dependencies/
│   │   ├── models/
│   │   ├── routers/
│   │   └── schemas/
│   ├── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── database/
│   └── init.sql
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── postman/
│   └── RoomStay - Seguridad JWT.postman_collection.json
└── README.md
```
