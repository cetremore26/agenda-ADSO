const jwt = require("jsonwebtoken");

// Protege rutas: solo deja pasar si el header Authorization trae un JWT válido.
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: { message: "Token no proporcionado" } });
  }

  const token = header.split(" ")[1];

  try {
    // Lanza error si el token fue alterado, expiró o no es de este JWT_SECRET.
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: { message: "Token inválido o expirado" } });
  }
};

module.exports = authMiddleware;
