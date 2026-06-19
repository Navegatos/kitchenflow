import React from 'react';
import { NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard, Package, ChefHat, TrendingUp, ShoppingCart,
  Trash2, Users, Settings, ChevronLeft, ChevronRight, Waves,
  ClipboardPlus, UtensilsCrossed, FileBarChart2,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { canAccessPath } from '../../auth/permissions';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/inventario', label: 'Inventario', icon: Package },
  { path: '/ingreso-inventario', label: 'Ingreso', icon: ClipboardPlus },
  { path: '/recetas', label: 'Recetas', icon: ChefHat },
  { path: '/menu', label: 'Menu / Platos', icon: UtensilsCrossed },
  { path: '/finanzas', label: 'Finanzas', icon: TrendingUp },
  { path: '/ventas', label: 'Ventas', icon: ShoppingCart },
  { path: '/reportes', label: 'Reportes', icon: FileBarChart2 },
  { path: '/mermas', label: 'Mermas', icon: Trash2 },
  { path: '/usuarios', label: 'Usuarios', icon: Users },
  { path: '/configuracion', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, branch, currentUser } = useApp();
  const location = useLocation();

  const visibleNavItems = navItems.filter(item => canAccessPath(currentUser.role, item.path));

  return (
    <aside
      className={`
        flex flex-col h-screen bg-slate-900 dark:bg-slate-950 text-white
        transition-all duration-300 ease-in-out flex-shrink-0
        ${sidebarCollapsed ? 'w-16' : 'w-60'}
      `}
    >
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-700/50 ${sidebarCollapsed ? 'justify-center' : ''}`}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 flex-shrink-0">
          <Waves className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <span className="text-sm font-semibold text-white tracking-tight">KitchenFlow</span>
            <span className="block text-xs text-slate-400">by Toteat</span>
          </div>
        )}
      </div>

      {!sidebarCollapsed && branch && (
        <div className="px-3 py-2 border-b border-slate-700/50">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{branch}</span>
          </button>
        </div>
      )}

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {visibleNavItems.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);

          return (
            <NavLink
              key={path}
              to={path}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                transition-all duration-150 group
                ${sidebarCollapsed ? 'justify-center' : ''}
                ${isActive
                  ? 'bg-blue-500/20 text-white font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white text-white'
                }
              `}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-white group-hover:text-white'}`} />
              {!sidebarCollapsed && <span>{label}</span>}
              {isActive && !sidebarCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2 border-t border-slate-700/50">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-4 h-4" />
            : <><ChevronLeft className="w-4 h-4" /><span>Colapsar</span></>
          }
        </button>
      </div>
    </aside>
  );
}
