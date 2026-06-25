import { useState, useEffect } from "react";

// Igual que useState, pero persiste el valor en localStorage.
export function useLocalStorage(key, initialValue) {
  // Lee el valor guardado solo en el primer render.
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);

      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Guarda en localStorage cada vez que cambia el valor.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage lleno o bloqueado: se ignora, la app sigue en memoria.
    }
  }, [key, value]);

  return [value, setValue];
}
