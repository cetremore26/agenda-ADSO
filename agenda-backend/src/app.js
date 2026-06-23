const express = require("express");
const cors = require("cors");
const contactRoutes = require("./routes/contactRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// MIDDLEWARE: permite que React se comunique
app.use(cors());
app.use(express.json());

// RUTAS
app.use("/contactos", contactRoutes);

// MANEJO DE ERRORES
app.use(errorHandler);

module.exports = app;
