const express = require("express");
const {
  getContactos,
  createContacto,
  updateContacto,
  deleteContacto,
} = require("../controllers/contactController");

const router = express.Router();

router.get("/", getContactos);
router.post("/", createContacto);
router.put("/:id", updateContacto);
router.delete("/:id", deleteContacto);

module.exports = router;
