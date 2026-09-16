import React, { useState } from 'react';

export default function Register({ switchToLogin }) {
  const [form, setForm] = useState({ name: '', username: '', correo: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://panoptic-server-production.up.railway.app/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('¡Registro exitoso! Ya puedes iniciar sesión.');
        setTimeout(switchToLogin, 2000);
      } else {
        setError(data.error || 'Error al registrarse');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor');
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-[#c0d0e0] flex items-center justify-center font-mono p-4">
      <div className="w-full max-w-md bg-[#0A0F1D] border border-[#00e5ff]/40 p-8 rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.05)]">
        <h2 className="text-xl font-bold text-[#00E5FF] mb-2 tracking-widest text-center">NUEVO OPERADOR</h2>
        <p className="text-xs text-gray-500 text-center mb-6">Crea tu cuenta en Panoptic</p>

        {error && <div className="mb-4 p-2 bg-red-950/50 border border-red-500/40 text-red-400 text-xs rounded">{error}</div>}
        {success && <div className="mb-4 p-2 bg-green-950/50 border border-green-500/40 text-green-400 text-xs rounded">{success}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs text-cyan-400 block mb-1">NOMBRE COMPLETO</label>
            <input type="text" onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-black border border-cyan-500/30 rounded p-2 text-xs text-white outline-none" required />
          </div>
          <div>
            <label className="text-xs text-cyan-400 block mb-1">NOMBRE DE USUARIO</label>
            <input type="text" onChange={e => setForm({...form, username: e.target.value})} className="w-full bg-black border border-cyan-500/30 rounded p-2 text-xs text-white outline-none" required />
          </div>
          <div>
            <label className="text-xs text-cyan-400 block mb-1">CORREO ELECTRÓNICO</label>
            <input type="email" onChange={e => setForm({...form, correo: e.target.value})} className="w-full bg-black border border-cyan-500/30 rounded p-2 text-xs text-white outline-none" required />
          </div>
          <div>
            <label className="text-xs text-cyan-400 block mb-1">CONTRASEÑA</label>
            <input type="password" onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-black border border-cyan-500/30 rounded p-2 text-xs text-white outline-none" required />
          </div>
          <button type="submit" className="w-full bg-[#00E5FF] text-black font-bold py-2 rounded text-xs hover:bg-cyan-400 transition shadow-[0_0_10px_#00e5ff]">
            REGISTRARSE
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <button onClick={switchToLogin} className="text-[#00E5FF] underline hover:text-cyan-300">
            Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
}