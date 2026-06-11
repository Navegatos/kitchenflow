import React, { useCallback, useEffect, useState } from 'react';
import {
  Users, Plus, Edit2, Shield, User, X, Search,
  CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { type AppUser } from '../data/mockData';
import { ApiError, backendUserToAppUser, usersApi } from '../api';

function RoleBadge({ role }: { role: AppUser['role'] }) {
  return role === 'admin'
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"><Shield className="w-2.5 h-2.5" />Administrador</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"><User className="w-2.5 h-2.5" />Operador</span>;
}

function StatusBadge({ active }: { active: boolean }) {
  return active
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle className="w-2.5 h-2.5" />Activo</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"><XCircle className="w-2.5 h-2.5" />Inactivo</span>;
}

function UserModal({ user, onClose, onSave, saving }: {
  user?: AppUser;
  onClose: () => void;
  onSave: (data: Partial<AppUser> & { password?: string }) => void;
  saving?: boolean;
}) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'operator' as AppUser['role'],
    active: user?.active ?? true,
    branch: user?.branch || 'Sucursal Centro',
  });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{user ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          {[
            { label: 'Nombre completo', key: 'name', placeholder: 'Ej: Juan Pérez' },
            { label: 'Correo electrónico', key: 'email', placeholder: 'correo@restaurante.com', type: 'email' },
            ...(!user ? [{ label: 'Contraseña', key: 'password', placeholder: 'Mínimo 4 caracteres', type: 'password' }] : []),
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">{label}</label>
              <input type={type || 'text'} value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Rol</label>
            <div className="grid grid-cols-2 gap-2">
              {(['admin', 'operator'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => set('role', role)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-medium transition-colors ${
                    form.role === role
                      ? role === 'admin'
                        ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-400'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {role === 'admin' ? 'Administrador' : 'Operador'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Sucursal</label>
            <select value={form.branch} onChange={e => set('branch', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
              {['Sucursal Centro', 'Sucursal Norte', 'Sucursal Sur'].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/40 rounded-lg">
            <div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Estado del usuario</p>
              <p className="text-xs text-slate-400">{form.active ? 'El usuario puede acceder al sistema' : 'Acceso bloqueado'}</p>
            </div>
            <button
              onClick={() => set('active', !form.active)}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
          <button
            disabled={saving}
            onClick={() => {
              if (!form.name || !form.email) return;
              if (!user && !form.password) return;
              onSave(form);
            }}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<AppUser | undefined>();
  const [showModal, setShowModal] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await usersApi.listUsers();
      setUsers(rows.map(backendUserToAppUser));
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const admins = users.filter(u => u.role === 'admin').length;
  const operators = users.filter(u => u.role === 'operator').length;
  const activeCount = users.filter(u => u.active).length;

  const permissionRows: Record<string, { admin: boolean; operator: boolean }> = {
    'Ver Dashboard':           { admin: true, operator: true },
    'Gestionar Inventario':    { admin: true, operator: true },
    'Registrar Movimientos':   { admin: true, operator: true },
    'Gestionar Recetas':       { admin: true, operator: false },
    'Ver Finanzas':            { admin: true, operator: false },
    'Ver Ventas (Toteat)':     { admin: true, operator: false },
    'Registrar Mermas':        { admin: true, operator: true },
    'Gestionar Usuarios':      { admin: true, operator: false },
    'Configuración':           { admin: true, operator: false },
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Usuarios</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{users.length} usuarios · {activeCount} activos</p>
        </div>
        <button
          onClick={() => { setEditingUser(undefined); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Usuarios', value: users.length.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Administradores', value: admins.toString(), icon: Shield, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
          { label: 'Operadores', value: operators.toString(), icon: User, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Activos', value: activeCount.toString(), icon: CheckCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Users table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text" placeholder="Buscar usuario..." value={search} onChange={e => setSearch(e.target.value)}
                  className="flex-1 text-xs bg-transparent outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando usuarios…
              </div>
            ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700/50">
                  <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Usuario</th>
                  <th className="text-center px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Rol</th>
                  <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Sucursal</th>
                  <th className="text-center px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Último acceso</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">{user.name}</p>
                          <p className="text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-4 py-3"><RoleBadge role={user.role} /></td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.branch}</td>
                    <td className="text-center px-4 py-3"><StatusBadge active={user.active} /></td>
                    <td className="px-4 py-3 text-slate-400">{user.lastLogin}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => { setEditingUser(user); setShowModal(true); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>

        {/* Permissions matrix */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Permisos por Rol</h3>
            <p className="text-xs text-slate-400 mt-0.5">Matriz de acceso al sistema</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700/50">
                  <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Función</th>
                  <th className="text-center px-3 py-2.5 text-violet-600 dark:text-violet-400 font-medium">Admin</th>
                  <th className="text-center px-3 py-2.5 text-blue-600 dark:text-blue-400 font-medium">Oper.</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissionRows).map(([func, perms]) => (
                  <tr key={func} className="border-b border-slate-100 dark:border-slate-700/30">
                    <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{func}</td>
                    <td className="text-center px-3 py-2.5">
                      {perms.admin ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="text-center px-3 py-2.5">
                      {perms.operator ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <UserModal
          user={editingUser}
          saving={saving}
          onClose={() => setShowModal(false)}
          onSave={async data => {
            setSaving(true);
            try {
              if (editingUser) {
                const updated = await usersApi.updateUser(editingUser.id, data);
                setUsers(prev => prev.map(u => (u.id === editingUser.id ? backendUserToAppUser(updated) : u)));
                toast.success('Usuario actualizado correctamente');
              } else {
                const created = await usersApi.createUser({
                  name: data.name!,
                  email: data.email!,
                  password: data.password || 'changeme',
                  role: data.role || 'operator',
                });
                setUsers(prev => [...prev, backendUserToAppUser(created)]);
                toast.success(`Usuario "${data.name}" creado correctamente`);
              }
              setShowModal(false);
            } catch (error) {
              toast.error(error instanceof ApiError ? error.message : 'Error al guardar el usuario');
            } finally {
              setSaving(false);
            }
          }}
        />
      )}
    </div>
  );
}
