import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Trash2, AlertTriangle, Plus, X, TrendingDown, DollarSign, Package, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, type Ingredient, type WasteRecord } from '../data/mockData';
import {
  ApiError, backendProductToIngredient, backendWasteToWasteRecord,
  catalogApi, configApi, wasteApi,
} from '../api';
import { useApp } from '../context/AppContext';

function AddWasteModal({ ingredients, reasons, onClose, onSave }: {
  ingredients: Ingredient[];
  reasons: string[];
  onClose: () => void;
  onSave: (data: { productId: string; quantity: number; reason: string }) => void;
}) {
  const [form, setForm] = useState({
    ingredientId: ingredients[0]?.id || '',
    quantity: '',
    reason: reasons[0] || '',
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const selectedIng = ingredients.find(i => i.id === form.ingredientId);
  const cost = selectedIng && form.quantity ? selectedIng.costPerUnit * Number(form.quantity) : 0;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Registrar Merma</h3>
              <p className="text-xs text-slate-400">Impacto directo en costos</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Ingrediente</label>
            <select value={form.ingredientId} onChange={e => set('ingredientId', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
              {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} (Stock: {i.stock} {i.unit})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Cantidad ({selectedIng?.unit})</label>
              <input type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)} min="0" step="0.01" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Costo estimado</label>
              <div className="px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 text-sm font-semibold text-red-600">
                {formatCurrency(cost)}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Motivo</label>
            <select value={form.reason} onChange={e => set('reason', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm">
              {reasons.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border text-sm">Cancelar</button>
          <button
            onClick={() => {
              if (!form.quantity || Number(form.quantity) <= 0) { toast.error('Ingresa una cantidad válida'); return; }
              onSave({ productId: form.ingredientId, quantity: Number(form.quantity), reason: form.reason });
            }}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium"
          >
            Registrar Merma
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Waste() {
  const { currentUser } = useApp();
  const [records, setRecords] = useState<WasteRecord[]>([]);
  const [wasteReasons, setWasteReasons] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const products = await catalogApi.listProducts({ active_only: true });
      const mappedProducts = products.map(backendProductToIngredient);
      const wasteRows = await wasteApi.listWasteRecords();
      const productsById = new Map(mappedProducts.map(p => [p.id, p]));
      setIngredients(mappedProducts);
      setRecords(wasteRows.map(row => backendWasteToWasteRecord(row, productsById)));
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudieron cargar las mermas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    configApi.listWasteReasons()
      .then(rows => setWasteReasons(rows.map(r => r.name)))
      .catch(() => setWasteReasons([]));
  }, []);

  const totalCost = records.reduce((s, r) => s + r.cost, 0);
  const avgDaily = records.length > 0 ? totalCost / Math.max(1, new Set(records.map(r => r.date)).size) : 0;

  const byReason = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.reason] = (acc[r.reason] || 0) + r.cost;
    return acc;
  }, {});
  const reasonData = Object.entries(byReason).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const byIngredient = records.reduce<Record<string, { name: string; cost: number; qty: number; unit: string }>>((acc, r) => {
    const ing = ingredients.find(i => i.id === r.ingredientId);
    if (!ing) return acc;
    if (!acc[r.ingredientId]) acc[r.ingredientId] = { name: ing.name, cost: 0, qty: 0, unit: ing.unit };
    acc[r.ingredientId].cost += r.cost;
    acc[r.ingredientId].qty += r.quantity;
    return acc;
  }, {});
  const ingData = Object.values(byIngredient).sort((a, b) => b.cost - a.cost);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando mermas…
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Gestión de Mermas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{records.length} registros desde la API</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={ingredients.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Registrar Merma
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Merma Total', value: formatCurrency(totalCost), icon: DollarSign, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Promedio Diario', value: formatCurrency(avgDaily), icon: TrendingDown, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Total Registros', value: records.length.toString(), icon: Package, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Ingredientes Afectados', value: Object.keys(byIngredient).length.toString(), icon: AlertTriangle, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold mb-4">Merma por motivo</h3>
          {reasonData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin registros</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={reasonData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
            <h3 className="text-sm font-semibold">Historial de mermas</h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/30">
                <th className="text-left px-4 py-2 text-slate-500">Ingrediente</th>
                <th className="text-right px-4 py-2 text-slate-500">Cantidad</th>
                <th className="text-left px-4 py-2 text-slate-500">Motivo</th>
                <th className="text-right px-4 py-2 text-slate-500">Costo</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-slate-400">Sin mermas registradas</td></tr>
              ) : records.map(r => {
                const ing = ingredients.find(i => i.id === r.ingredientId);
                return (
                  <tr key={r.id} className="border-t border-slate-100 dark:border-slate-700/30">
                    <td className="px-4 py-2">{ing?.name || '—'}</td>
                    <td className="text-right px-4 py-2">{r.quantity} {r.unit}</td>
                    <td className="px-4 py-2 text-slate-500">{r.reason}</td>
                    <td className="text-right px-4 py-2 text-red-500">{formatCurrency(r.cost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <AddWasteModal
          ingredients={ingredients}
          reasons={wasteReasons}
          onClose={() => setShowModal(false)}
          onSave={async data => {
            try {
              await wasteApi.createWasteRecord({
                product_id: data.productId,
                quantity: data.quantity,
                reason: data.reason,
                registered_by: currentUser.id,
              });
              toast.success('Merma registrada');
              setShowModal(false);
              loadData();
            } catch (error) {
              toast.error(error instanceof ApiError ? error.message : 'Error al registrar merma');
            }
          }}
        />
      )}
    </div>
  );
}
