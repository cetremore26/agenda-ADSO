// Define las rutas del recurso "contactos" y las conecta con su
// controlador correspondiente. No contiene lógica de negocio: solo
// mapea verbo HTTP + URL -> función del controlador.
const express = require("express");
const {
  getContactos,
  createContacto,
  updateContacto,
  deleteContacto,
} = require("../controllers/contactController");

// Router de Express: se monta en app.js bajo el prefijo "/contactos"
const router = express.Router();

// GET    /contactos      -> lista todos los contactos
router.get("/", getContactos);
// POST   /contactos      -> crea un contacto nuevo con el body recibido
router.post("/", createContacto);
// PUT    /contactos/:id  -> actualiza el contacto con ese id
router.put("/:id", updateContacto);
// DELETE /contactos/:id  -> elimina el contacto con ese id
router.delete("/:id", deleteContacto);

module.exports = router;
