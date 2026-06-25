import { useState } from "react";

import { login } from "../api.js";

// Pantalla de login: pide email/contraseña y avisa a App.jsx si fue exitoso.
export default function Login({ onLoginExitoso }) {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const manejarSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const { token, usuario } = await login(email, password);

      // Se guarda para que api.js lo use en las siguientes peticiones.
      localStorage.setItem("token", token);

      onLoginExitoso(usuario);
    } catch (err) {
      console.error("Error de login:", err);
      setError(`Error real: ${err.message}`);
    }
  };

  return (
    <form onSubmit={manejarSubmit} className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full border rounded px-3 py-2"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
        className="w-full border rounded px-3 py-2"
      />

      <button type="submit" className="w-full bg-purple-600 text-white rounded py-2">
        Entrar
      </button>
    </form>
  );
}
