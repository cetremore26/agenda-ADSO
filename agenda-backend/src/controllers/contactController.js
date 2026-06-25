// Lógica de negocio de cada endpoint de /contactos.
const prisma = require("../config/prisma");

// GET /contactos
const getContactos = async (req, res, next) => {
  try {
    const contactos = await prisma.contacto.findMany();
    res.json(contactos);
  } catch (error) {
    next(error);
  }
};

// POST /contactos
const createContacto = async (req, res, next) => {
  try {
    const nuevoContacto = await prisma.contacto.create({
      data: req.body,
    });
    res.status(201).json(nuevoContacto);
  } catch (error) {
    next(error);
  }
};

// PUT /contactos/:id
const updateContacto = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const contactoActualizado = await prisma.contacto.update({
      where: { id },
      data: req.body,
    });
    res.json(contactoActualizado);
  } catch (error) {
    next(error);
  }
};

// DELETE /contactos/:id
const deleteContacto = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const contactoEliminado = await prisma.contacto.delete({
      where: { id },
    });
    res.json(contactoEliminado);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContactos,
  createContacto,
  updateContacto,
  deleteContacto,
};
