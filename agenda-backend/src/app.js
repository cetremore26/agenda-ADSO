// Configuración central de Express: middlewares, rutas y manejo de errores.
const express = require("express");
const cors = require("cors");
const contactRoutes = require("./routes/contactRoutes");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middlewares/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

// Rutas de contactos protegidas: requieren token válido.
app.use("/contactos", authMiddleware, contactRoutes);

app.use("/contactos", contactRoutes);

// Middleware de errores: debe registrarse al final.
app.use(errorHandler);

module.exports = app;
