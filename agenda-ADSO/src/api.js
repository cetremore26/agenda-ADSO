// Capa de servicios: aquí viven todas las llamadas fetch al backend.
const API = "http://localhost:3001/contactos";

const AUTH_API = "http://localhost:3001/auth";

// Error personalizado para distinguir "token expirado" de otros fallos.
export class SesionExpiradaError extends Error {}

// Construye el header Authorization con el token guardado en localStorage.
function authHeaders() {
  const token = localStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Revisa la respuesta: 401 = sesión expirada, !ok = error genérico.
function manejarRespuesta(res, mensajeError) {
  if (res.status === 401) throw new SesionExpiradaError("Sesión expirada");

  if (!res.ok) throw new Error(mensajeError);
}

// GET /contactos
export async function listarContactos() {
  const res = await fetch(API, { headers: authHeaders() });

  manejarRespuesta(res, "Error al listar contactos");

  return res.json();
}

// POST /contactos
export async function crearContacto(data) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });

  manejarRespuesta(res, "Error al crear el contacto");

  return res.json();
}

// PUT /contactos/:id
export async function actualizarContacto(id, data) {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });

  manejarRespuesta(res, "Error al actualizar el contacto");

  return res.json();
}

// DELETE /contactos/:id
export async function eliminarContactoPorId(id) {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  manejarRespuesta(res, "Error al eliminar el contacto");

  return true;
}

// POST /auth/login
export async function login(email, password) {
  const res = await fetch(`${AUTH_API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Credenciales inválidas");

  return res.json();
}
