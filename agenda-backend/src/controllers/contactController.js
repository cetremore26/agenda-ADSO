// Controladores: contienen la lógica de negocio de cada endpoint de
// "/contactos". Las rutas (contactRoutes.js) solo deciden qué función
// se ejecuta según el método HTTP y la URL; aquí es donde realmente
// se habla con la base de datos a través de Prisma.
const prisma = require("../config/prisma");

// GET /contactos: obtener todos los contactos guardados en la base de datos
const getContactos = async (req, res, next) => {
  try {
    // findMany() sin filtros devuelve todas las filas de la tabla Contacto
    const contactos = await prisma.contacto.findMany();
    res.json(contactos); // Respondemos con el array de contactos en JSON
  } catch (error) {
    // Si algo falla (ej: la BD no responde), delegamos el error al
    // middleware de manejo de errores en vez de manejarlo aquí
    next(error);
  }
};

// POST /contactos: crear un contacto nuevo a partir del body de la petición
const createContacto = async (req, res, next) => {
  try {
    // req.body llega parseado gracias al middleware express.json() en app.js
    // y debe traer { nombre, telefono, correo, etiqueta, empresa }
    const nuevoContacto = await prisma.contacto.create({
      data: req.body,
    });
    // 201 Created: código de éxito estándar para indicar que se creó un recurso
    res.status(201).json(nuevoContacto);
  } catch (error) {
    next(error);
  }
};

// PUT /contactos/:id: actualizar los datos de un contacto existente
const updateContacto = async (req, res, next) => {
  try {
    // El id llega como string en la URL; lo convertimos a número porque
    // en la base de datos la columna id es de tipo Int
    const id = parseInt(req.params.id);
    const contactoActualizado = await prisma.contacto.update({
      where: { id },
      data: req.body, // Campos a sobrescribir (vienen del formulario)
    });
    res.json(contactoActualizado);
  } catch (error) {
    // Si el id no existe, Prisma lanza un error que termina respondiéndose
    // como error genérico a través del errorHandler
    next(error);
  }
};

// DELETE /contactos/:id: eliminar un contacto por su id
const deleteContacto = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const contactoEliminado = await prisma.contacto.delete({
      where: { id },
    });
    // Se responde con el contacto que quedó eliminado, por si el
    // frontend necesita confirmar qué se borró
    res.json(contactoEliminado);
  } catch (error) {
    next(error);
  }
};

// Exportamos las 4 funciones para que contactRoutes.js las asocie
// a sus respectivos verbos HTTP (GET, POST, PUT, DELETE)
module.exports = {
  getContactos,
  createContacto,
  updateContacto,
  deleteContacto,
};
