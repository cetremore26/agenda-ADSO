// Importamos useState para manejar estados locales del componente
import { useState } from "react";
// Importamos el hook personalizado que guarda el borrador en localStorage
// Esto permite que los datos del formulario sobrevivan si el usuario recarga la página
import { useLocalStorage } from "../hooks/useLocalStorage.js";

// Objeto que representa un formulario completamente vacío
// Lo usamos como valor inicial y también para limpiar el formulario después de guardar
const FORM_VACIO = { nombre: "", telefono: "", correo: "", etiqueta: "", empresa: "" };

// Componente FormularioContacto
// Recibe onAgregar para crear contactos nuevos, y contactoEditando/onActualizar/onCancelarEdicion
// para editar uno existente. El mismo formulario sirve para ambos casos.
export default function FormularioContacto({
  onAgregar,
  contactoEditando,
  onActualizar,
  onCancelarEdicion,
}) {
  // true cuando estamos editando un contacto existente en vez de crear uno nuevo
  const modoEdicion = Boolean(contactoEditando);

  // Borrador para contactos nuevos, persistido en localStorage para sobrevivir recargas
  const [formNuevo, setFormNuevo] = useLocalStorage("agenda-form-draft", FORM_VACIO);

  // Datos del contacto en edición. Se inicializan una sola vez a partir de contactoEditando
  // porque App.jsx remonta este componente (prop `key`) cada vez que cambia el contacto a editar
  const [formEdicion, setFormEdicion] = useState(() => ({
    nombre: contactoEditando?.nombre ?? "",
    telefono: contactoEditando?.telefono ?? "",
    correo: contactoEditando?.correo ?? "",
    etiqueta: contactoEditando?.etiqueta ?? "",
    empresa: contactoEditando?.empresa ?? "",
  }));

  // Según el modo, el formulario lee y escribe en uno u otro estado
  const form = modoEdicion ? formEdicion : formNuevo;
  const setForm = modoEdicion ? setFormEdicion : setFormNuevo;

  // Estado para almacenar los mensajes de error de validación por cada campo
  // Empieza vacío: sin errores hasta que el usuario intente enviar el formulario
  const [errores, setErrores] = useState({});

  // Estado que indica si el formulario está en proceso de envío
  // Sirve para desactivar el botón y mostrar un texto diferente mientras se guarda
  const [enviando, setEnviando] = useState(false);

  // Estado para mostrar un mensaje de éxito cuando el contacto se guarda correctamente
  // Se limpia automáticamente cuando el usuario empieza a escribir de nuevo
  const [exito, setExito] = useState("");

  // Función manejadora del cambio de los inputs
  // Se ejecuta cada vez que el usuario escribe en cualquier campo del formulario
  const onChange = (e) => {
    // Extraemos el nombre y el valor del input que disparó el evento
    const { name, value } = e.target;

    // Actualizamos el estado del formulario conservando los demás campos
    // y actualizando solo el que el usuario está editando
    setForm({ ...form, [name]: value });

    // Si ese campo ya tenía un error visible, lo limpiamos al instante
    // para dar retroalimentación positiva mientras el usuario corrige
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: "" }));

    // Si había un mensaje de éxito visible, lo borramos al detectar que el usuario
    // está escribiendo un nuevo contacto
    if (exito) setExito("");
  };

  // Función encargada de validar todos los campos del formulario
  // Devuelve true si el formulario es válido, y false en caso contrario
  function validarFormulario() {
    // Objeto temporal donde acumulamos los mensajes de error encontrados
    const nuevosErrores = {};

    // Validación del campo "nombre"
    // .trim() elimina espacios en blanco al inicio y al final del texto
    // Esto evita que el usuario envíe solo espacios como si fuera un dato válido
    if (!form.nombre.trim())   nuevosErrores.nombre   = "El nombre es obligatorio.";

    // Validación del campo "telefono"
    if (!form.telefono.trim()) {
      // Si el campo está vacío
      nuevosErrores.telefono = "El teléfono es obligatorio.";
    } else if (form.telefono.trim().length < 7) {
      // Validación extra: el teléfono debe tener al menos 7 caracteres
      nuevosErrores.telefono = "El teléfono debe tener al menos 7 caracteres.";
    }

    // Validación del campo "correo"
    if (!form.correo.trim()) {
      // Si el usuario no escribió nada
      nuevosErrores.correo = "El correo es obligatorio.";
    } else if (!form.correo.includes("@")) {
      // Si escribió texto pero no contiene el símbolo @
      nuevosErrores.correo = "El correo debe contener @.";
    }

    // Validación del campo "etiqueta" (obligatoria en esta agenda)
    if (!form.etiqueta.trim()) nuevosErrores.etiqueta = "La etiqueta es obligatoria.";

    // Validación del campo "empresa"
    if (!form.empresa.trim())  nuevosErrores.empresa  = "La empresa es obligatoria.";

    // Actualizamos el estado de errores para que React vuelva a renderizar
    // y se muestren los mensajes debajo de cada input
    setErrores(nuevosErrores);

    // Retornamos true SOLO si no quedó ningún error en el objeto
    return Object.keys(nuevosErrores).length === 0;
  }

  // Función manejadora del envío del formulario
  // Es async porque onAgregar puede comunicarse con la API de forma asíncrona
  const onSubmit = async (e) => {
    // Evitamos que el formulario recargue la página por defecto
    e.preventDefault();

    // Ejecutamos la validación. Si no es válida, salimos sin guardar
    if (!validarFormulario()) return;

    try {
      // Marcamos que el formulario está en proceso de envío
      setEnviando(true);

      if (modoEdicion) {
        // Modo edición: actualizamos el contacto existente (PUT).
        // Al salir, App.jsx vuelve a montar este formulario "en blanco" (ver prop `key`),
        // así que no hace falta limpiar el formulario ni los errores aquí.
        await onActualizar(contactoEditando.id, form);
        onCancelarEdicion();
      } else {
        // Pausa artificial de 3 segundos: simula una conexión lenta para
        // poder ver/probar el estado "Guardando..." del botón antes de
        // que termine la petición real. No es necesaria en producción.
        await new Promise((resolve) => setTimeout(resolve, 3000));
        // Modo creación: llamamos a la función que llega por props para guardar el contacto
        await onAgregar(form);

        // Si todo fue exitoso, limpiamos los campos del formulario y los errores
        setForm(FORM_VACIO);
        setErrores({});
        setExito("¡Contacto guardado correctamente!");
      }
    } finally {
      // Independientemente de si la operación salió bien o mal,
      // apagamos el estado "enviando" para reactivar el botón
      setEnviando(false);
    }
  };

  // JSX que pinta el formulario en pantalla
  return (
    <form onSubmit={onSubmit} className="space-y-6">

      {/* Título dinámico: cambia según si estamos creando o editando un contacto */}
      <h2 className="text-lg font-bold text-gray-800">
        {modoEdicion ? "✏️ Editar contacto" : "➕ Nuevo contacto"}
      </h2>

      {/* Mensaje de éxito: aparece en verde cuando el contacto se guardó correctamente */}
      {/* Desaparece automáticamente cuando el usuario empieza a escribir de nuevo */}
      {exito && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {exito}
        </div>
      )}

      {/* Alerta general: aparece en la parte superior cuando hay al menos un error */}
      {Object.keys(errores).length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Por favor completa todos los campos obligatorios antes de agregar el contacto.
        </div>
      )}

      {/* Grid: 1 columna en móvil, 2 columnas en pantallas medianas en adelante */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Campo: Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            // El borde cambia a rojo si existe un error en este campo
            className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${
              errores.nombre ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
            name="nombre"
            placeholder="Ej: Camila Pérez"
            value={form.nombre}   // El valor mostrado viene del estado form.nombre
            onChange={onChange}   // Al escribir, actualizamos el estado y limpiamos el error
          />
          {/* Si existe un mensaje en errores.nombre, lo mostramos debajo del input */}
          {errores.nombre && (
            <p className="mt-1 text-xs text-red-600">{errores.nombre}</p>
          )}
        </div>

        {/* Campo: Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <input
            className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${
              errores.telefono ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
            name="telefono"
            placeholder="Ej: 300 123 4567"
            value={form.telefono}  // Valor controlado desde form.telefono
            onChange={onChange}
          />
          {/* Mensaje de error específico para el campo teléfono */}
          {errores.telefono && (
            <p className="mt-1 text-xs text-red-600">{errores.telefono}</p>
          )}
        </div>
      </div>

      {/* Campo: Correo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correo *
        </label>
        <input
          className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${
            errores.correo ? "border-red-400 bg-red-50" : "border-gray-300"
          }`}
          name="correo"
          placeholder="Ej: camila@sena.edu.co"
          value={form.correo}    // Valor controlado desde form.correo
          onChange={onChange}
        />
        {/* Mensaje de error específico para el campo correo */}
        {errores.correo && (
          <p className="mt-1 text-xs text-red-600">{errores.correo}</p>
        )}
      </div>

      {/* Campo: Etiqueta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Etiqueta *
        </label>
        <select
          className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${
            errores.etiqueta ? "border-red-400 bg-red-50" : "border-gray-300"
          }`}
          name="etiqueta"
          value={form.etiqueta}
          onChange={onChange}
        >
          <option value="">Selecciona una etiqueta</option>
          <option value="Familia">Familia</option>
          <option value="Trabajo">Trabajo</option>
          <option value="Amigos">Amigos</option>
        </select>
        {/* Mensaje de error específico para el campo etiqueta */}
        {errores.etiqueta && (
          <p className="mt-1 text-xs text-red-600">{errores.etiqueta}</p>
        )}
      </div>

      {/* Campo: Empresa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Empresa *
        </label>
        <input
          className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${
            errores.empresa ? "border-red-400 bg-red-50" : "border-gray-300"
          }`}
          name="empresa"
          placeholder="Ej: Trabajo"
          value={form.empresa}
          onChange={onChange}
        />
        {/* Mensaje de error específico para el campo empresa */}
        {errores.empresa && (
          <p className="mt-1 text-xs text-red-600">{errores.empresa}</p>
        )}
      </div>

      {/* Botones de acción: enviar y, en modo edición, cancelar */}
      <div className="flex gap-3">
        <button
          type="submit"
          // El botón se desactiva mientras enviando sea true para evitar envíos duplicados
          disabled={enviando}
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold shadow-sm"
        >
          {/* Texto dinámico: cambia según el estado enviando y el modo (crear/editar) */}
          {modoEdicion
            ? enviando ? "Actualizando..." : "Guardar cambios"
            : enviando ? "Guardando..." : "Agregar contacto"}
        </button>

        {/* Botón de cancelar: solo visible mientras estamos editando un contacto */}
        {modoEdicion && (
          <button
            type="button"
            onClick={onCancelarEdicion}
            disabled={enviando}
            className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 disabled:cursor-not-allowed text-gray-700 px-6 py-3 rounded-xl font-semibold shadow-sm"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
