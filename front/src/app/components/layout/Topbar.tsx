import React, { useEffect, useState } from 'react';
import { Bell, Sun, Moon, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRoleLabels } from '../../auth/permissions';
import { backendProductToIngredient, inventoryApi, parseDecimal } from '../../api';
import type { BackendProduct } from '../../api/types';

interface NotificationItem {
  id: string;
  type: 'warning' | 'danger' | 'info';
  text: string;
  time: string;
}

export function Topbar({ title }: { title?: string }) {
  const { darkMode, toggleDarkMode, currentUser, logout } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    inventoryApi.listLowStockProducts()
      .then((products: BackendProduct[]) => {
        if (cancelled) return;
        const items: NotificationItem[] = products.slice(0, 5).map(p => {
          const ing = backendProductToIngredient(p);
          return {
            id: p.id,
            type: ing.stock === 0 ? 'danger' as const : 'warning' as const,
            text: `${p.name}: ${parseDecimal(p.stock)} ${p.unit} (mín. ${parseDecimal(p.minimum_stock)})`,
            time: 'ahora',
          };
        });
        setNotifications(items);
      })
      .catch(() => {
        if (!cancelled) setNotifications([]);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/50 flex items-center px-6 gap-4 flex-shrink-0 z-10">
      <div className="flex-1">
        {title && (
          <h1 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h1>
        )}
      </div>

      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 w-56">
        <Search className="w-3.5 h-3.5 flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar..."
          className="bg-transparent text-xs outline-none w-full placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-300"
        />
        <kbd className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded">⌘K</kbd>
      </div>

      <button
        onClick={toggleDarkMode}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
      >
        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="relative">
        <button
          onClick={() => { setShowNotifs(!showNotifs); setShowUser(false); }}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
        {showNotifs && (
          <div className="absolute right-0 top-10 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Notificaciones</span>
              <span className="text-xs text-slate-400">{notifications.length} alertas</span>
            </div>
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-xs text-slate-400 text-center">Sin alertas de stock</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                      n.type === 'warning' ? 'bg-amber-500' :
                      n.type === 'danger'  ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-xs text-slate-700 dark:text-slate-300">{n.text}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => { setShowUser(!showUser); setShowNotifs(false); }}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
            {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-medium text-slate-900 dark:text-white leading-tight">{currentUser.name.split(' ')[0]}</p>
            <p className="text-xs text-slate-400 leading-tight">{getRoleLabels()[currentUser.role]}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
        {showUser && (
          <div className="absolute right-0 top-10 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{currentUser.name}</p>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
            </div>
            {[
              { icon: User, label: 'Mi Perfil' },
              { icon: Settings, label: 'Configuración' },
            ].map(({ icon: Icon, label }) => (
              <button key={label} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <Icon className="w-4 h-4 text-slate-400" />
                {label}
              </button>
            ))}
            <div className="border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
