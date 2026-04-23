import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { Lock, Mail, UserCog } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useApp();
  const [email, setEmail] = useState('carlos@kitchenflow.app');
  const [password, setPassword] = useState('1234');
  const [role, setRole] = useState<'admin' | 'operator'>('admin');
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email, password, role);
    if (!result.ok) {
      setError(result.message || 'No fue posible iniciar sesion');
      return;
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg p-6 space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">KitchenFlow</h1>
          <p className="text-sm text-slate-500 mt-1">MVP Demo - inicia sesion para continuar</p>
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
                className="w-full bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Contrasena</label>
            <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Perfil</label>
            <div className="grid grid-cols-2 gap-2">
              {(['admin', 'operator'] as const).map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRole(item)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                    role === item
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <UserCog className="w-3.5 h-3.5" />
                    {item === 'admin' ? 'Administrador' : 'Operador'}
                  </span>
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm font-medium">
            Ingresar al dashboard
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-xs text-blue-600 hover:underline">
            Recuperar contrasena (mock)
          </Link>
        </div>
      </div>
    </div>
  );
}
