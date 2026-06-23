// Middleware centralizado de manejo de errores.
// Express lo identifica como manejador de errores porque recibe 4
// parámetros (err, req, res, next). Se ejecuta cuando cualquier
// controlador llama a next(error) en vez de manejarlo localmente.
// Así evitamos repetir try/catch con res.status(...).json(...) en cada ruta.
const errorHandler = (err, req, res, next) => {
  // Registramos el error en la consola del servidor para poder depurarlo
  console.error("Error:", err.message);

  // Si el error no define un código HTTP propio, asumimos 500
  // (error interno del servidor) como valor por defecto
  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";

  // Respondemos siempre con el mismo formato JSON, para que el
  // frontend pueda manejar los errores de forma consistente
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
    },
  });
};

module.exports = errorHandler;
