import { createBrowserRouter } from 'react-router';
import { Root } from './components/layout/Root';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import InventoryEntry from './pages/InventoryEntry';
import Recipes from './pages/Recipes';
import Menu from './pages/Menu';
import Finance from './pages/Finance';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import Waste from './pages/Waste';
import UsersPage from './pages/Users';
import SettingsPage from './pages/Settings';

export const router = createBrowserRouter([
  { path: '/login', Component: Login },
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: 'inventario', Component: Inventory },
      { path: 'ingreso-inventario', Component: InventoryEntry },
      { path: 'recetas', Component: Recipes },
      { path: 'menu', Component: Menu },
      { path: 'finanzas', Component: Finance },
      { path: 'ventas', Component: Sales },
      { path: 'reportes', Component: Reports },
      { path: 'mermas', Component: Waste },
      { path: 'usuarios', Component: UsersPage },
      { path: 'configuracion', Component: SettingsPage },
    ],
  },
]);
