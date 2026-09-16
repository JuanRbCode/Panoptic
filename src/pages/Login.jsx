import React, { useState } from "react";

export default function Login({ onLoginSuccess, switchToRegister }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://panoptic-server-production.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        setError(data.message || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-[#c0d0e0] flex items-center justify-center font-mono p-4">
      <div className="w-full max-w-md bg-[#0A0F1D] border border-[#00e5ff]/40 p-8 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.05)]">
        <h2 className="text-xl font-bold text-[#00E5FF] mb-2 tracking-widest text-center">
          ACCESO PANOPTIC
        </h2>
        <p className="text-xs text-gray-500 text-center mb-6">
          Ingresa tus credenciales de operador
        </p>

        {error && (
          <div className="mb-4 p-2 bg-red-950/50 border border-red-500/40 text-red-400 text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-cyan-400 block mb-1">
              CORREO ELECTRÓNICO
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full bg-black border border-cyan-500/30 rounded p-2 text-xs text-white focus:border-[#00E5FF] outline-none"
              required
            />
          </div>
          <div>
            <label className="text-xs text-cyan-400 block mb-1">
              CONTRASEÑA
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-cyan-500/30 rounded p-2 text-xs text-white focus:border-[#00E5FF] outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#00E5FF] text-black font-bold py-2 rounded text-xs hover:bg-cyan-400 transition shadow-[0_0_10px_#00e5ff]"
          >
            INICIAR SESIÓN
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          ¿No tienes cuenta?{" "}
          <button
            onClick={switchToRegister}
            className="text-[#00E5FF] underline hover:text-cyan-300"
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}
