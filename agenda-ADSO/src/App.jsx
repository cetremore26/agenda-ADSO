// Importamos useEffect, useRef y useState para manejar estados y efectos en el componente principal
import { useEffect, useRef, useState } from "react";

// Importamos los servicios que se comunican con JSON Server
import {
  listarContactos,
  crearContacto,
  actualizarContacto,
  eliminarContactoPorId,
} from "./api.js";

// Importamos los componentes hijos
import FormularioContacto from "./components/FormularioContacto";
import ContactoCard from "./components/ContactoCard";

// Importamos el hook personalizado que permite guardar datos en localStorage
import { useLocalStorage } from "./hooks/useLocalStorage.js";

// Hook personalizado que muestra un mensaje temporal y lo borra después de `ms` milisegundos
// Útil para notificaciones de éxito que desaparecen solas sin que el usuario tenga que cerrarlas
function useMensajeTemporal(ms = 3000) {
  const [mensaje, setMensaje] = useState("");

  // useRef guarda el id del temporizador entre renders sin provocar un nuevo render
  const timer = useRef(null);

  const mostrar = (texto) => {
    // Cancelamos el temporizador anterior si el usuario actúa de nuevo antes de que expire
    clearTimeout(timer.current);
    setMensaje(texto);
    // Después de `ms` milisegundos, borramos el mensaje automáticamente
    timer.current = setTimeout(() => setMensaje(""), ms);
  };

  return [mensaje, mostrar];
}

// Componente principal de la aplicación
export default function App() {
  // Lista de contactos persistida en localStorage como caché offline
  // Si el servidor está caído, el usuario sigue viendo los datos del último fetch exitoso
  const [contactos, setContactos] = useLocalStorage("agenda-contactos", []);

  // Estado que indica si estamos cargando información desde la API
  const [cargando, setCargando] = useState(true);

  // Estado para guardar mensajes de error generales de la aplicación
  const [error, setError] = useState("");

  // Estado para mensajes de éxito que desaparecen solos después de 3 segundos
  const [exito, mostrarExito] = useMensajeTemporal(3000);

  const [busqueda, setBusqueda] = useState("");

  const [filtro, setFiltro] = useState("todos");

  // Contacto que se está editando actualmente (null = no hay edición en curso)
  const [contactoEditando, setContactoEditando] = useState(null);

  const contactosFiltrados = contactos.filter((contacto) => {
    const texto = busqueda.toLowerCase();
    const coincideBusqueda =
      contacto.nombre.toLowerCase().includes(texto) ||
      contacto.telefono.includes(texto) ||
      contacto.correo.toLowerCase().includes(texto);

    const coincideFiltro = filtro === "todos" || contacto.etiqueta.toLowerCase() === filtro.toLowerCase();

    return coincideBusqueda && coincideFiltro;
  });

  // useEffect que se ejecuta una sola vez al montar el componente
  // Aquí cargamos los contactos iniciales desde JSON Server (GET)
  useEffect(() => {
    async function cargarContactos() {
      try {
        setCargando(true); // Indicamos que estamos cargando
        setError(""); // Limpiamos posibles errores anteriores

        const data = await listarContactos(); // Llamamos a la API
        setContactos(data); // Guardamos la lista de contactos en el estado
      } catch (error) {
        // En caso de error, lo registramos en consola para depuración
        console.error(error);

        // Y mostramos un mensaje amigable al usuario
        setError(
          "No se pudo cargar la lista de contactos. Verifica que el servidor esté encendido e intenta de nuevo.",
        );
      } finally {
        setCargando(false); // Finalizamos el estado de carga, haya salido bien o mal
      }
    }

    cargarContactos();
  }, [setContactos]);

  // Función que se encarga de agregar un nuevo contacto usando la API (POST)
  // Es async porque espera la respuesta del servidor antes de actualizar la lista
  const agregarContacto = async (nuevo) => {
    try {
      setError(""); // Limpiamos cualquier error viejo antes de intentar guardar

      // Llamamos al servicio que crea el contacto en JSON Server
      const creado = await crearContacto(nuevo);

      // Actualizamos el estado agregando el contacto recién creado al final de la lista
      setContactos((prev) => [...prev, creado]);
    } catch (error) {
      // Mostramos el error en consola para facilitar la depuración
      console.error(error);

      // Informamos al usuario con un mensaje claro
      setError(
        "No se pudo guardar el contacto. Verifica tu conexión o el estado del servidor e intenta nuevamente.",
      );

      // Relanzamos el error para que el formulario sepa que falló y NO limpie sus campos
      // Si no relanzamos, el formulario borrará los datos aunque el contacto no se haya guardado
      throw error;
    }
  };

  // Función para guardar los cambios de un contacto existente (PUT)
  const guardarEdicion = async (id, datosActualizados) => {
    try {
      setError("");

      const actualizado = await actualizarContacto(id, datosActualizados);

      // Reemplazamos en la lista local el contacto editado por la versión actualizada
      setContactos((prev) =>
        prev.map((c) => (c.id === id ? actualizado : c)),
      );

      setContactoEditando(null); // Salimos del modo edición
      mostrarExito("Contacto actualizado correctamente.");
    } catch (error) {
      console.error(error);
      setError(
        "No se pudo actualizar el contacto. Verifica tu conexión o el estado del servidor e intenta nuevamente.",
      );
      throw error; // Para que el formulario no salga del modo edición si falló
    }
  };

  // Función para eliminar un contacto por su id (DELETE)
  const eliminarContacto = async (id) => {
    try {
      setError(""); // Limpiamos errores previos
      await eliminarContactoPorId(id); // Llamamos al servicio de eliminación en la API

      // Filtramos el contacto eliminado de la lista local para actualizar la UI al instante
      setContactos((prev) => prev.filter((c) => c.id !== id));

      // Notificamos al usuario que la operación fue exitosa
      mostrarExito("Contacto eliminado correctamente.");
    } catch (error) {
      // Mostramos el error en consola para depurar
      console.error(error);

      // Si algo falla al eliminar, informamos al usuario
      setError(
        "No se pudo eliminar el contacto. Vuelve a intentarlo o verifica el servidor.",
      );
    }
  };

  // JSX que renderiza la aplicación
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Encabezado principal de la Agenda */}
      <header className="max-w-6xl mx-auto px-6 pt-8">
        <p className="text-sm font-semibold text-gray-400 tracking-[0.25em] uppercase">
          Desarrollo Web ReactJS Ficha 3314811
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 flex items-center gap-3">
          <span>📒</span> Agenda ADSO C3
        </h1>
        <p className="text-gray-500 mt-1">
          {contactos.length} {contactos.length === 1 ? "contacto guardado" : "contactos guardados"}
        </p>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Si hay un error global, lo mostramos en un recuadro rojo */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Mensaje de éxito: aparece en verde y desaparece solo después de 3 segundos */}
        {exito && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {exito}
          </div>
        )}

        {/* Si estamos cargando, mostramos un aviso en morado */}
        {cargando && (
          <div className="rounded-xl bg-purple-50 border border-purple-200 px-4 py-3 text-sm text-purple-700">
            Cargando contactos desde la API...
          </div>
        )}

        {/* Formulario para agregar contactos: siempre visible, incluso mientras carga */}
        {/* Cuando hay un contacto en edición, este mismo formulario cambia a modo edición */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <FormularioContacto
            key={contactoEditando ? contactoEditando.id : "nuevo"}
            onAgregar={agregarContacto}
            contactoEditando={contactoEditando}
            onActualizar={guardarEdicion}
            onCancelarEdicion={() => setContactoEditando(null)}
          />
        </div>

        {/* "Página" de la agenda: barra de búsqueda/filtro + listado de contactos */}
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

          {/* Listado de contactos, separados por líneas como en una agenda real */}
          <div className="divide-y divide-gray-100">
            {/* Mensaje cuando no existen contactos y ya terminó de cargar */}
            {contactos.length === 0 && !cargando && (
              <p className="text-gray-500 text-sm p-6 text-center">
                No hay contactos aún. Agrega el primero usando el formulario.
              </p>
            )}

            {/* Mensaje cuando hay contactos pero el filtro/búsqueda no encuentra nada */}
            {contactosFiltrados.length === 0 && contactos.length > 0 && !cargando && (
              <p className="text-gray-500 text-sm p-6 text-center">
                Contacto no encontrado. Intenta con otro nombre, teléfono o filtro.
              </p>
            )}

            {/* Recorremos la lista de contactos y mostramos un renglón por cada uno */}
            {contactosFiltrados.map((c) => (
              <ContactoCard
                key={c.id} // Key única: React la usa para identificar cada elemento
                {...c} // Pasamos todas las propiedades del contacto de una vez
                onEditar={() => setContactoEditando(c)}
                onEliminar={() => eliminarContacto(c.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pie de página con los datos del instructor */}
      <footer className="max-w-6xl mx-auto px-6 pb-8 text-xs text-gray-400">
        <p>Desarrollo Web – ReactJS | Proyecto Agenda ADSO</p>
        <p>Instructor: Cristian Acevedo</p>
      </footer>
    </main>
  );
}
