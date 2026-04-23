import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { appUsers, type AppUser } from '../data/mockData';

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentUser: AppUser;
  isAuthenticated: boolean;
  login: (email: string, password: string, roleHint?: AppUser['role']) => { ok: boolean; message?: string };
  logout: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  branch: string;
  setBranch: (v: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser>(appUsers[0]);
  const [branch, setBranch] = useState(currentUser.branch);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    setBranch(currentUser.branch);
  }, [currentUser]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const login = (email: string, password: string, roleHint?: AppUser['role']) => {
    if (!email || !password) return { ok: false, message: 'Completa correo y contraseña' };
    if (password.length < 4) return { ok: false, message: 'La contraseña debe tener al menos 4 caracteres' };

    const byEmail = appUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    const byRole = roleHint ? appUsers.find(u => u.role === roleHint && u.active) : undefined;
    const selected = byEmail || byRole || appUsers[0];

    if (!selected.active) return { ok: false, message: 'El usuario está deshabilitado' };

    setCurrentUser(selected);
    setIsAuthenticated(true);
    return { ok: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(appUsers[0]);
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        currentUser,
        isAuthenticated,
        login,
        logout,
        sidebarCollapsed,
        setSidebarCollapsed,
        branch,
        setBranch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
