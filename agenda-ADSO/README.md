# Agenda ADSO C3

Aplicación web de agenda de contactos, desarrollada como proyecto final del programa **ADSO** (Análisis y Desarrollo de Software) — Ficha 3314811, Desarrollo Web con ReactJS. Instructor: Cristian Acevedo.

Permite **listar, crear, editar y eliminar contactos** (nombre, teléfono, correo, etiqueta y empresa), con búsqueda, filtro por etiqueta y persistencia en una base de datos MySQL a través de un backend propio.

## Arquitectura del proyecto

El proyecto está dividido en dos carpetas independientes dentro del repositorio:

- **`agenda-ADSO/`** (esta carpeta): frontend hecho en **React + Vite + Tailwind CSS**. Consume la API REST del backend mediante `fetch` (ver `src/api.js`).
- **`agenda-backend/`**: backend hecho en **Node.js + Express**, con **Prisma** como ORM contra una base de datos **MySQL/MariaDB**. Expone los endpoints CRUD de `/contactos`.

```
Proyecto_final/
├── agenda-ADSO/      → Frontend (React)
└── agenda-backend/   → Backend (Express + Prisma + MySQL)
```

## Estructura del frontend

```
src/
├── api.js                      # Funciones que llaman a la API del backend (GET/POST/PUT/DELETE)
├── App.jsx                     # Componente principal: estado global, búsqueda/filtro y orquestación de la UI
├── components/
│   ├── FormularioContacto.jsx  # Formulario para crear/editar un contacto, con validaciones
│   └── ContactoCard.jsx        # Tarjeta que muestra un contacto en el listado
├── hooks/
│   └── useLocalStorage.js      # Hook que persiste estado en localStorage (caché offline / borrador)
└── main.jsx                    # Punto de entrada: monta <App /> en el DOM
```

## Cómo ejecutar el proyecto

### 1. Backend (API)

```bash
cd agenda-backend
npm install
# Copia .env.example a .env y configura tu cadena de conexión MySQL en DATABASE_URL
npx prisma migrate dev
npm run dev
```

El backend queda escuchando en `http://localhost:3001`.

### 2. Frontend (esta carpeta)

```bash
cd agenda-ADSO
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5173` (puerto por defecto de Vite) y se conecta a la API definida en `src/api.js`.

## Scripts disponibles (frontend)

- `npm run dev` — levanta el servidor de desarrollo de Vite con recarga en caliente (HMR).
- `npm run build` — genera la versión de producción en `dist/`.
- `npm run preview` — sirve localmente el build de producción para probarlo.
- `npm run lint` — ejecuta ESLint sobre el código del proyecto.

## Tecnologías usadas

- **Frontend:** React 19, Vite, Tailwind CSS, ESLint.
- **Backend:** Node.js, Express, Prisma ORM, MySQL/MariaDB, CORS.
