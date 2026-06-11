import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { type AppUser } from '../data/mockData';
import {
  authApi,
  ApiError,
  getStoredSession,
  loginResponseToAppUser,
} from '../api';

interface AppContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentUser: AppUser;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  branch: string;
  setBranch: (v: string) => void;
}

const GUEST_USER: AppUser = {
  id: '',
  name: 'Invitado',
  email: '',
  role: 'operator',
  active: false,
  lastLogin: '',
  branch: 'Sucursal Centro',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser>(GUEST_USER);
  const [branch, setBranch] = useState(GUEST_USER.branch);

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

  useEffect(() => {
    const session = getStoredSession();
    if (!session) return;
    setCurrentUser(loginResponseToAppUser(session));
    setIsAuthenticated(true);
  }, []);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const login = useCallback(async (email: string, password: string) => {
    if (!email || !password) {
      return { ok: false, message: 'Completa correo y contraseña' };
    }

    try {
      const session = await authApi.login(email, password);
      const user = loginResponseToAppUser(session);
      setCurrentUser(user);
      setIsAuthenticated(true);
      return { ok: true };
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'No se pudo conectar con el servidor. Verifica que el backend esté en marcha.';
      return { ok: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setIsAuthenticated(false);
    setCurrentUser(GUEST_USER);
  }, []);

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
