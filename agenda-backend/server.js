// Punto de entrada del backend.
// Aquí no se define lógica de la aplicación (rutas, middlewares, etc.):
// eso vive en src/app.js. Este archivo solo arranca el servidor HTTP.
const app = require("./src/app");

// Puerto donde escuchará la API. Si existe la variable de entorno PORT
// (por ejemplo, en un hosting que la asigna dinámicamente) se usa esa;
// si no, se usa 3001 como valor por defecto para desarrollo local.
const PORT = process.env.PORT || 3001;

// Inicia el servidor y queda escuchando peticiones HTTP en el puerto indicado
app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});