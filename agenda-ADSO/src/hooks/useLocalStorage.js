import { useState, useEffect } from "react";

// Hook personalizado que se comporta como useState, pero además persiste
// el valor en localStorage bajo la clave `key`. Así, al recargar la página
// (o si el backend está caído), la app puede seguir mostrando el último
// valor conocido en lugar de empezar vacía.
export function useLocalStorage(key, initialValue) {
  // Estado en memoria. El valor inicial se calcula UNA sola vez (función
  // pasada a useState) leyendo lo que haya guardado en localStorage;
  // si no hay nada o el JSON está corrupto, se usa `initialValue`.
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      // JSON inválido u localStorage no disponible: usamos el valor por defecto
      return initialValue;
    }
  });

  // Cada vez que cambia `value` (o la `key`), sincronizamos el nuevo
  // valor hacia localStorage para que quede guardado entre sesiones.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // No se pudo guardar: cuota excedida o navegador en modo privado.
      // Se ignora silenciosamente porque no es un error crítico para la app.
    }
  }, [key, value]);

  // Se retorna con la misma forma que useState: [valorActual, funcionParaActualizarlo]
  return [value, setValue];
}
