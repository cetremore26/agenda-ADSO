// Configuración central de la aplicación Express: middlewares, rutas y
// manejo de errores. server.js solo importa esto y lo pone a escuchar.
const express = require("express");
const cors = require("cors");
const contactRoutes = require("./routes/contactRoutes");
const errorHandler = require("./middlewares/errorHandler");

// Instancia principal de la aplicación Express
const app = express();

// MIDDLEWARE
// cors(): habilita CORS para que el frontend (React, en otro puerto/origen)
// pueda hacer peticiones a esta API sin que el navegador las bloquee.
app.use(cors());
// express.json(): parsea el body de las peticiones entrantes que vengan
// en formato JSON y lo deja disponible en req.body (usado por POST/PUT).
app.use(express.json());

// RUTAS
// Todas las rutas relacionadas con contactos quedan bajo el prefijo
// "/contactos" (ej: GET /contactos, POST /contactos, PUT /contactos/:id...)
app.use("/contactos", contactRoutes);

// MANEJO DE ERRORES
// Middleware de 4 parámetros (err, req, res, next): Express lo reconoce
// como manejador de errores y lo ejecuta cuando algún controlador llama
// a next(error). Debe registrarse al final, después de las rutas.
app.use(errorHandler);

// Se exporta la app configurada (sin iniciar el servidor) para que
// server.js la importe y la ponga a escuchar en un puerto.
module.exports = app;
