import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useApp();
  const [email, setEmail] = useState('admin@kitchenflow.cl');
  const [password, setPassword] = useState('hashed_password_1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (!result.ok) {
        setError(result.message || 'No fue posible iniciar sesión');
        return;
      }
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-6 space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">KitchenFlow</h1>
          <p className="text-sm text-slate-500 mt-1">Inicia sesión contra la API del backend</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Email</label>
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Contraseña</label>
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Conectando…' : 'Ingresar al dashboard'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Usuarios de prueba del seed: admin@kitchenflow.cl, chef@kitchenflow.cl, etc.
        </p>

        <div className="text-center">
          <Link to="/login" className="text-xs text-blue-600 hover:underline">
            Recuperar contraseña (próximamente)
          </Link>
        </div>
      </div>
    </div>
  );
}
