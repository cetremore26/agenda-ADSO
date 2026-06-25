import { useState } from "react";

import { useLocalStorage } from "../hooks/useLocalStorage.js";

const FORM_VACIO = { nombre: "", telefono: "", correo: "", etiqueta: "", empresa: "" };

// Formulario único para crear (modoEdicion=false) o editar un contacto.
export default function FormularioContacto({
  onAgregar,
  contactoEditando,
  onActualizar,
  onCancelarEdicion,
}) {
  const modoEdicion = Boolean(contactoEditando);

  // Borrador de contacto nuevo, persistido en localStorage.
  const [formNuevo, setFormNuevo] = useLocalStorage("agenda-form-draft", FORM_VACIO);

  // Datos del contacto en edición (no se persiste, es puntual).
  const [formEdicion, setFormEdicion] = useState(() => ({
    nombre: contactoEditando?.nombre ?? "",
    telefono: contactoEditando?.telefono ?? "",
    correo: contactoEditando?.correo ?? "",
    etiqueta: contactoEditando?.etiqueta ?? "",
    empresa: contactoEditando?.empresa ?? "",
  }));

  // Apuntan al estado correcto según el modo actual.
  const form = modoEdicion ? formEdicion : formNuevo;
  const setForm = modoEdicion ? setFormEdicion : setFormNuevo;

  const [errores, setErrores] = useState({});

  const [enviando, setEnviando] = useState(false);

  const [exito, setExito] = useState("");

  // Manejador genérico para todos los inputs (usa el atributo "name").
  const onChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: "" }));

    if (exito) setExito("");
  };

  // Valida los campos obligatorios; llena "errores" y retorna si es válido.
  function validarFormulario() {
    const nuevosErrores = {};

    if (!form.nombre.trim())   nuevosErrores.nombre   = "El nombre es obligatorio.";

    if (!form.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio.";
    } else if (form.telefono.trim().length < 7) {
      nuevosErrores.telefono = "El teléfono debe tener al menos 7 caracteres.";
    }

    if (!form.correo.trim()) {
      nuevosErrores.correo = "El correo es obligatorio.";
    } else if (!form.correo.includes("@")) {
      nuevosErrores.correo = "El correo debe contener @.";
    }

    if (!form.etiqueta.trim()) nuevosErrores.etiqueta = "La etiqueta es obligatoria.";

    if (!form.empresa.trim())  nuevosErrores.empresa  = "La empresa es obligatoria.";

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  }

  // Envío del formulario: crea o actualiza según el modo.
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    try {
      setEnviando(true);

      if (modoEdicion) {
        await onActualizar(contactoEditando.id, form);

        onCancelarEdicion();
      } else {
        // Espera artificial solo para demostrar el estado "Guardando...".
        await new Promise((resolve) => setTimeout(resolve, 3000));

        await onAgregar(form);

        setForm(FORM_VACIO);
        setErrores({});
        setExito("¡Contacto guardado correctamente!");
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">

      <h2 className="text-lg font-bold text-gray-800">
        {modoEdicion ? "✏️ Editar contacto" : "➕ Nuevo contacto"}
      </h2>

      {exito && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {exito}
        </div>
      )}

      {Object.keys(errores).length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Por favor completa todos los campos obligatorios antes de agregar el contacto.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${
              errores.nombre ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
            name="nombre"
            placeholder="Ej: Camila Pérez"
            value={form.nombre}
            onChange={onChange}
          />
          {errores.nombre && (
            <p className="mt-1 text-xs text-red-600">{errores.nombre}</p>
          )}
        </div>

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
            value={form.telefono}
            onChange={onChange}
          />
          {errores.telefono && (
            <p className="mt-1 text-xs text-red-600">{errores.telefono}</p>
          )}
        </div>
      </div>

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
          value={form.correo}
          onChange={onChange}
        />
        {errores.correo && (
          <p className="mt-1 text-xs text-red-600">{errores.correo}</p>
        )}
      </div>

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
        {errores.etiqueta && (
          <p className="mt-1 text-xs text-red-600">{errores.etiqueta}</p>
        )}
      </div>

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
        {errores.empresa && (
          <p className="mt-1 text-xs text-red-600">{errores.empresa}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={enviando}
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold shadow-sm"
        >
          {modoEdicion
            ? enviando ? "Actualizando..." : "Guardar cambios"
            : enviando ? "Guardando..." : "Agregar contacto"}
        </button>

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
