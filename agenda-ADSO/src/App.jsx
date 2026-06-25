// Componente raíz: maneja sesión, lista de contactos y CRUD vía API.
import { useEffect, useRef, useState } from "react";

import Login from "./components/login.jsx";

import {
  listarContactos,
  crearContacto,
  actualizarContacto,
  eliminarContactoPorId,
  SesionExpiradaError,
} from "./api.js";

import FormularioContacto from "./components/FormularioContacto";
import ContactoCard from "./components/ContactoCard";

import { useLocalStorage } from "./hooks/useLocalStorage.js";

// Hook local: muestra un mensaje que se borra solo tras "ms" milisegundos.
function useMensajeTemporal(ms = 3000) {
  const [mensaje, setMensaje] = useState("");

  const timer = useRef(null);

  const mostrar = (texto) => {
    clearTimeout(timer.current);

    setMensaje(texto);

    timer.current = setTimeout(() => setMensaje(""), ms);
  };

  return [mensaje, mostrar];
}

export default function App() {
  // Usuario con sesión iniciada (se recupera de localStorage al cargar).
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
  });

  // Lista de contactos, con respaldo en localStorage.
  const [contactos, setContactos] = useLocalStorage("agenda-contactos", []);

  const [cargando, setCargando] = useState(true);

  const [error, setError] = useState("");

  const [exito, mostrarExito] = useMensajeTemporal(3000);

  const [busqueda, setBusqueda] = useState("");

  const [filtro, setFiltro] = useState("todos");

  const [contactoEditando, setContactoEditando] = useState(null);

  // Lista filtrada según búsqueda y etiqueta seleccionada.
  const contactosFiltrados = contactos.filter((contacto) => {
    const texto = busqueda.toLowerCase();

    const coincideBusqueda =
      contacto.nombre.toLowerCase().includes(texto) ||
      contacto.telefono.includes(texto) ||
      contacto.correo.toLowerCase().includes(texto);

    const coincideFiltro = filtro === "todos" || contacto.etiqueta.toLowerCase() === filtro.toLowerCase();

    return coincideBusqueda && coincideFiltro;
  });

  // Borra la sesión y vuelve a mostrar el login.
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  // Carga la lista de contactos al iniciar sesión.
  useEffect(() => {
    if (!usuario) return;

    async function cargarContactos() {
      try {
        setCargando(true);
        setError("");

        const data = await listarContactos();

        setContactos(data);
      } catch (error) {
        if (error instanceof SesionExpiradaError) {
          cerrarSesion();
          return;
        }

        console.error(error);

        setError(
          "No se pudo cargar la lista de contactos. Verifica que el servidor esté encendido e intenta de nuevo.",
        );
      } finally {
        setCargando(false);
      }
    }

    cargarContactos();
  }, [usuario, setContactos]);

  // Sin sesión activa: solo se muestra el login.
  if (!usuario) {
    return (
      <Login
        onLoginExitoso={(u) => {
          localStorage.setItem("usuario", JSON.stringify(u));

          setUsuario(u);
        }}
      />
    );
  }

  // POST: crea un contacto nuevo.
  const agregarContacto = async (nuevo) => {
    try {
      setError("");

      const creado = await crearContacto(nuevo);

      setContactos((prev) => [...prev, creado]);
    } catch (error) {
      if (error instanceof SesionExpiradaError) {
        cerrarSesion();
        return;
      }

      console.error(error);

      setError(
        "No se pudo guardar el contacto. Verifica tu conexión o el estado del servidor e intenta nuevamente.",
      );

      throw error;
    }
  };

  // PUT: guarda cambios de un contacto existente.
  const guardarEdicion = async (id, datosActualizados) => {
    try {
      setError("");

      const actualizado = await actualizarContacto(id, datosActualizados);

      setContactos((prev) =>
        prev.map((c) => (c.id === id ? actualizado : c)),
      );

      setContactoEditando(null);

      mostrarExito("Contacto actualizado correctamente.");
    } catch (error) {
      if (error instanceof SesionExpiradaError) {
        cerrarSesion();
        return;
      }

      console.error(error);
      setError(
        "No se pudo actualizar el contacto. Verifica tu conexión o el estado del servidor e intenta nuevamente.",
      );

      throw error;
    }
  };

  // DELETE: elimina un contacto por id.
  const eliminarContacto = async (id) => {
    try {
      setError("");

      await eliminarContactoPorId(id);

      setContactos((prev) => prev.filter((c) => c.id !== id));

      mostrarExito("Contacto eliminado correctamente.");
    } catch (error) {
      if (error instanceof SesionExpiradaError) {
        cerrarSesion();
        return;
      }

      console.error(error);
      setError(
        "No se pudo eliminar el contacto. Vuelve a intentarlo o verifica el servidor.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">

      <header className="max-w-6xl mx-auto px-6 pt-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-400 tracking-[0.25em] uppercase">
            Desarrollo Web ReactJS Ficha 3314811
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 flex items-center gap-3">
            <span>📒</span> Agenda ADSO C3
          </h1>
          <p className="text-gray-500 mt-1">
            {contactos.length} {contactos.length === 1 ? "contacto guardado" : "contactos guardados"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Hola, {usuario.nombre}</p>
          <button
            onClick={cerrarSesion}
            className="text-sm text-purple-600 hover:underline"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {exito && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {exito}
          </div>
        )}

        {cargando && (
          <div className="rounded-xl bg-purple-50 border border-purple-200 px-4 py-3 text-sm text-purple-700">
            Cargando contactos desde la API...
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <FormularioContacto
            key={contactoEditando ? contactoEditando.id : "nuevo"}
            onAgregar={agregarContacto}
            contactoEditando={contactoEditando}
            onActualizar={guardarEdicion}
            onCancelarEdicion={() => setContactoEditando(null)}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center p-4 sm:p-6 border-b border-gray-100">

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="🔎 Buscar contactos..."
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            />

            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            >
              <option value="todos">Todos</option>
              <option value="familia">Familia</option>
              <option value="trabajo">Trabajo</option>
              <option value="amigos">Amigos</option>
            </select>
          </div>

          <div className="divide-y divide-gray-100">

            {contactos.length === 0 && !cargando && (
              <p className="text-gray-500 text-sm p-6 text-center">
                No hay contactos aún. Agrega el primero usando el formulario.
              </p>
            )}

            {contactosFiltrados.length === 0 && contactos.length > 0 && !cargando && (
              <p className="text-gray-500 text-sm p-6 text-center">
                Contacto no encontrado. Intenta con otro nombre, teléfono o filtro.
              </p>
            )}

            {contactosFiltrados.map((c) => (
              <ContactoCard
                key={c.id}
                {...c}
                onEditar={() => setContactoEditando(c)}
                onEliminar={() => eliminarContacto(c.id)}
              />
            ))}
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 pb-8 text-xs text-gray-400">
        <p>Desarrollo Web – ReactJS | Proyecto Agenda ADSO</p>
        <p>Instructor: Cristian Acevedo</p>
      </footer>
    </main>
  );
}
