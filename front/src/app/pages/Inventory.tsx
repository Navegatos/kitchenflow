import React, { useState } from 'react';
import {
  Plus, Search, Filter, Package, AlertTriangle, Edit2,
  Trash2, ArrowUpCircle, ArrowDownCircle, X, ChevronDown,
  TrendingUp, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ingredients as initialIngredients, stockMovements,
  formatCurrency, isLowStock, categories, units,
  type Ingredient, type StockMovement, getIngredientById
} from '../data/mockData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StockBadge({ item }: { item: Ingredient }) {
  const pct = (item.stock / (item.minStock * 3)) * 100;
  if (item.stock === 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Sin stock</span>;
  if (item.stock <= item.minStock) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Stock bajo</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Normal</span>;
}

function MovementBadge({ type }: { type: StockMovement['type'] }) {
  const map = {
    purchase:   { label: 'Compra',      cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    usage:      { label: 'Uso',         cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' },
    waste:      { label: 'Merma',       cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    adjustment: { label: 'Ajuste',      cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  };
  const { label, cls } = map[type];
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

// ─── Add Stock Modal ──────────────────────────────────────────────────────────

function AddStockModal({ item, onClose, onSave }: {
  item: Ingredient | null;
  onClose: () => void;
  onSave: (type: 'purchase' | 'usage' | 'waste', qty: number, notes: string) => void;
}) {
  const [type, setType] = useState<'purchase' | 'usage' | 'waste'>('purchase');
  const [qty, setQty] = useState('');
  const [notes, setNotes] = useState('');

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Registrar Movimiento</h3>
            <p className="text-xs text-slate-400 mt-0.5">{item.name} · Stock actual: {item.stock} {item.unit}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2 block">Tipo de movimiento</label>
            <div className="grid grid-cols-3 gap-2">
              {(['purchase', 'usage', 'waste'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    type === t
                      ? t === 'purchase' ? 'bg-blue-500 text-white border-blue-500' :
                        t === 'usage'    ? 'bg-slate-700 text-white border-slate-700' :
                                           'bg-red-500 text-white border-red-500'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-300'
                  }`}
                >
                  {t === 'purchase' ? 'Compra' : t === 'usage' ? 'Uso' : 'Merma'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Cantidad ({item.unit})</label>
            <input
              type="number"
              value={qty}
              onChange={e => setQty(e.target.value)}
              min="0"
              step="0.1"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Notas</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              placeholder="Ej: Compra semanal al proveedor..."
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => { if (!qty || Number(qty) <= 0) return; onSave(type, Number(qty), notes); }}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Ingredient Modal ─────────────────────────────────────────────────────

function AddIngredientModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (data: Partial<Ingredient>) => void;
}) {
  const [form, setForm] = useState({ name: '', unit: 'kg', category: 'Proteínas', stock: '', minStock: '', costPerUnit: '', supplier: '' });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Nuevo Ingrediente</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-4 grid grid-cols-2 gap-4">
          {[
            { label: 'Nombre', key: 'name', placeholder: 'Ej: Carne Molida', span: 2 },
            { label: 'Proveedor', key: 'supplier', placeholder: 'Ej: Carnes Premium SA', span: 2 },
            { label: 'Stock Inicial', key: 'stock', placeholder: '0', type: 'number' },
            { label: 'Stock Mínimo', key: 'minStock', placeholder: '0', type: 'number' },
            { label: 'Costo / Unidad ($)', key: 'costPerUnit', placeholder: '0', type: 'number' },
          ].map(({ label, key, placeholder, span, type }) => (
            <div key={key} className={span === 2 ? 'col-span-2' : ''}>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">{label}</label>
              <input
                type={type || 'text'}
                value={(form as any)[key]}
                onChange={e => set(key, e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                placeholder={placeholder}
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Unidad</label>
            <select value={form.unit} onChange={e => set('unit', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
              {units.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Categoría</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
          <button
            onClick={() => {
              if (!form.name) return;
              onSave({
                name: form.name, unit: form.unit, category: form.category,
                stock: Number(form.stock), minStock: Number(form.minStock),
                costPerUnit: Number(form.costPerUnit), supplier: form.supplier,
                lastUpdated: new Date().toISOString().split('T')[0],
              });
            }}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Inventory() {
  const [items, setItems] = useState<Ingredient[]>(initialIngredients);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');
  const [selectedItem, setSelectedItem] = useState<Ingredient | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>(stockMovements);

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.supplier.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'Todas' || item.category === filterCat;
    const matchStatus = filterStatus === 'Todos' ||
      (filterStatus === 'Crítico' && item.stock === 0) ||
      (filterStatus === 'Bajo' && item.stock > 0 && item.stock <= item.minStock) ||
      (filterStatus === 'Normal' && item.stock > item.minStock);
    return matchSearch && matchCat && matchStatus;
  });

  const lowCount = items.filter(isLowStock).length;
  const totalValue = items.reduce((s, i) => s + i.stock * i.costPerUnit, 0);

  const handleMovement = (type: 'purchase' | 'usage' | 'waste', qty: number, notes: string) => {
    if (!selectedItem) return;
    const newMovement: StockMovement = {
      id: `m${Date.now()}`, ingredientId: selectedItem.id, type, quantity: qty,
      unit: selectedItem.unit, date: new Date().toISOString().split('T')[0],
      cost: qty * selectedItem.costPerUnit, notes, userId: 'u1',
    };
    setMovements(prev => [newMovement, ...prev]);
    setItems(prev => prev.map(i => i.id === selectedItem.id
      ? { ...i, stock: type === 'purchase' ? i.stock + qty : Math.max(0, i.stock - qty), lastUpdated: new Date().toISOString().split('T')[0] }
      : i
    ));
    toast.success(`Movimiento registrado: ${type === 'purchase' ? '+' : '-'}${qty} ${selectedItem.unit} de ${selectedItem.name}`);
    setSelectedItem(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Inventario</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{items.length} ingredientes · Valor total: {formatCurrency(totalValue)}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Ingrediente
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Ingredientes', value: items.length.toString(), icon: Package, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Stock Bajo / Crítico', value: lowCount.toString(), icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Valor en Inventario', value: formatCurrency(totalValue), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Movimientos (hoy)', value: movements.filter(m => m.date === new Date().toISOString().split('T')[0]).length.toString(), icon: RefreshCw, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
        {(['inventory', 'movements'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab === 'inventory' ? 'Ingredientes' : 'Movimientos'}
          </button>
        ))}
      </div>

      {activeTab === 'inventory' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Buscar ingrediente o proveedor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
              />
            </div>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="Todas">Todas las categorías</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 outline-none"
            >
              {['Todos', 'Normal', 'Bajo', 'Crítico'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-700/30">
                    <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Ingrediente</th>
                    <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Categoría</th>
                    <th className="text-right px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Stock</th>
                    <th className="text-right px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Mínimo</th>
                    <th className="text-right px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Costo/Ud.</th>
                    <th className="text-right px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Valor Stock</th>
                    <th className="text-center px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Estado</th>
                    <th className="text-right px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">{item.name}</p>
                          <p className="text-slate-400 text-xs">{item.supplier}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs">{item.category}</span>
                      </td>
                      <td className="text-right px-4 py-3 font-medium text-slate-800 dark:text-white">
                        {item.stock} <span className="text-slate-400 font-normal">{item.unit}</span>
                      </td>
                      <td className="text-right px-4 py-3 text-slate-500 dark:text-slate-400">
                        {item.minStock} {item.unit}
                      </td>
                      <td className="text-right px-4 py-3 text-slate-700 dark:text-slate-300">{formatCurrency(item.costPerUnit)}</td>
                      <td className="text-right px-4 py-3 font-medium text-slate-800 dark:text-white">{formatCurrency(item.stock * item.costPerUnit)}</td>
                      <td className="text-center px-4 py-3"><StockBadge item={item} /></td>
                      <td className="text-right px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
                            title="Registrar movimiento"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors" title="Editar">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No se encontraron ingredientes</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'movements' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Historial de Movimientos</h3>
            <p className="text-xs text-slate-400 mt-0.5">{movements.length} movimientos registrados</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-700/30">
                  <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Fecha</th>
                  <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Ingrediente</th>
                  <th className="text-center px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Tipo</th>
                  <th className="text-right px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Cantidad</th>
                  <th className="text-right px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Costo</th>
                  <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Notas</th>
                </tr>
              </thead>
              <tbody>
                {movements.map(mov => {
                  const ing = getIngredientById(mov.ingredientId);
                  return (
                    <tr key={mov.id} className="border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{mov.date}</td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{ing?.name || mov.ingredientId}</td>
                      <td className="text-center px-4 py-3"><MovementBadge type={mov.type} /></td>
                      <td className="text-right px-4 py-3 font-medium text-slate-800 dark:text-white">
                        <span className={mov.type === 'purchase' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}>
                          {mov.type === 'purchase' ? '+' : '-'}{mov.quantity}
                        </span>
                        <span className="text-slate-400 ml-1">{mov.unit}</span>
                      </td>
                      <td className="text-right px-4 py-3 text-slate-700 dark:text-slate-300">{formatCurrency(mov.cost)}</td>
                      <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{mov.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedItem && (
        <AddStockModal item={selectedItem} onClose={() => setSelectedItem(null)} onSave={handleMovement} />
      )}
      {showAddModal && (
        <AddIngredientModal
          onClose={() => setShowAddModal(false)}
          onSave={(data) => {
            const newItem: Ingredient = {
              id: `i${Date.now()}`, ...data as Ingredient,
            };
            setItems(prev => [...prev, newItem]);
            toast.success(`Ingrediente "${data.name}" agregado al inventario`);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
