import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useApp } from '../../context/AppContext';
import { Toaster } from 'sonner';

const pageTitles: Record<string, string> = {
  '/':              'Dashboard',
  '/inventario':    'Inventario',
  '/ingreso-inventario': 'Ingreso de Inventario',
  '/recetas':       'Recetas',
  '/menu':          'Menu / Platos',
  '/finanzas':      'Finanzas',
  '/ventas':        'Ventas — Toteat',
  '/reportes':      'Reportes',
  '/mermas':        'Gestión de Mermas',
  '/usuarios':      'Usuarios',
  '/configuracion': 'Configuración',
};

function RootInner() {
  const location = useLocation();
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const title = pageTitles[location.pathname] || 'KitchenFlow';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export function Root() {
  return <RootInner />;
}
