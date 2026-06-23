// Este componente muestra un contacto individual como un renglón de la agenda.
// Incluye un avatar con la inicial del nombre, sus datos, la etiqueta y los botones de acción.

// Colores por etiqueta: así cada categoría se reconoce de un vistazo, como en una agenda real
const COLORES_ETIQUETA = {
  familia: { avatar: "bg-purple-500", chip: "bg-purple-100 text-purple-700" },
  trabajo: { avatar: "bg-blue-500", chip: "bg-blue-100 text-blue-700" },
  amigos: { avatar: "bg-green-500", chip: "bg-green-100 text-green-700" },
};
const COLOR_POR_DEFECTO = { avatar: "bg-gray-400", chip: "bg-gray-100 text-gray-700" };

export default function ContactoCard({ nombre, telefono, correo, etiqueta, empresa, onEditar, onEliminar }) {
  const colores = COLORES_ETIQUETA[etiqueta?.toLowerCase()] ?? COLOR_POR_DEFECTO;
  const inicial = nombre?.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 px-4 sm:px-6 hover:bg-purple-50/40 transition-colors">
      {/* Avatar circular con la inicial del nombre, coloreado según la etiqueta */}
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-full ${colores.avatar} text-white flex items-center justify-center text-lg font-bold`}
      >
        {inicial}
      </div>

      {/* Datos del contacto */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-semibold text-gray-900 truncate">{nombre}</h3>
          {etiqueta && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colores.chip}`}>
              {etiqueta}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">
          <span className="mr-1">📞</span>
          {telefono}
          {empresa && (
            <>
              <span className="mx-2 text-gray-300">•</span>
              <span className="mr-1">🏢</span>
              {empresa}
            </>
          )}
        </p>
        <p className="text-sm text-gray-500 truncate">
          <span className="mr-1">✉️</span>
          {correo}
        </p>
      </div>

      {/* Botones de editar y eliminar */}
      <div className="flex flex-shrink-0 gap-2 self-start sm:self-center">
        <button
          onClick={onEditar}
          className="text-sm font-medium px-3 py-1.5 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-100 transition"
        >
          Editar
        </button>
        <button
          onClick={onEliminar}
          className="text-sm font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-100 transition"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
