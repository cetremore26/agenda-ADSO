const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

// POST /auth/register: crea un usuario nuevo.
const register = async (req, res, next) => {
  try {
    const { email, password, nombre } = req.body;

    // 10 rounds de salting: balance estándar entre seguridad y velocidad.
    const hash = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: { email, password: hash, nombre },
    });

    res.status(201).json({ id: usuario.id, email: usuario.email, nombre: usuario.nombre });
  } catch (error) {
    next(error);
  }
};

// POST /auth/login: valida credenciales y devuelve un JWT.
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("DEBUG login recibido ->", JSON.stringify({ email, password }));

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    console.log("DEBUG usuario encontrado ->", usuario ? usuario.email : "NINGUNO");

    // Mensaje genérico a propósito: no revela si el email existe o no.
    if (!usuario) {
      return res.status(401).json({ error: { message: "Credenciales inválidas" } });
    }

    const coincide = await bcrypt.compare(password, usuario.password);

    if (!coincide) {
      return res.status(401).json({ error: { message: "Credenciales inválidas" } });
    }

    // El token expira en 8 horas.
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre } });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
