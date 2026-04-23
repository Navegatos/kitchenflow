import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Trash2, AlertTriangle, Plus, X, TrendingDown, DollarSign, Package
} from 'lucide-react';
import { toast } from 'sonner';
import {
  wasteRecords as initialWaste, ingredients, formatCurrency,
  type WasteRecord
} from '../data/mockData';

const REASONS = [
  'Vencimiento', 'Deterioro por calor', 'Cadena de frío rota',
  'Deterioro por humedad', 'Carne no vendida', 'Deterioro', 'Error de cocción',
  'Sobreproducción', 'Accidente', 'Otro'
];

function AddWasteModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (data: Partial<WasteRecord>) => void;
}) {
  const [form, setForm] = useState({
    ingredientId: ingredients[0].id,
    quantity: '',
    reason: REASONS[0],
    notes: '',
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
            <select value={form.ingredientId} onChange={e => set('ingredientId', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30">
              {ingredients.map(i => <option key={i.id} value={i.id}>{i.name} (Stock: {i.stock} {i.unit})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Cantidad ({selectedIng?.unit})</label>
              <input
                type="number" value={form.quantity} onChange={e => set('quantity', e.target.value)}
                min="0" step="0.01" placeholder="0.00"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Costo estimado</label>
              <div className="px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-sm font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(cost)}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Motivo</label>
            <select value={form.reason} onChange={e => set('reason', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
              {REASONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {cost > 5000 && (
          <div className="mx-6 mb-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Esta merma tiene un impacto significativo en los costos del día ({formatCurrency(cost)}).
              Considera revisar los procesos de almacenamiento.
            </p>
          </div>
        )}

        <div className="flex gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
          <button
            onClick={() => {
              if (!form.quantity || Number(form.quantity) <= 0) { toast.error('Ingresa una cantidad válida'); return; }
              const ing = ingredients.find(i => i.id === form.ingredientId);
              onSave({
                ingredientId: form.ingredientId,
                quantity: Number(form.quantity),
                unit: ing?.unit || 'kg',
                reason: form.reason,
                date: new Date().toISOString().split('T')[0],
                cost,
                userId: 'u2',
              });
            }}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Registrar Merma
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Waste() {
  const [records, setRecords] = useState<WasteRecord[]>(initialWaste);
  const [showModal, setShowModal] = useState(false);

  const totalCost = records.reduce((s, r) => s + r.cost, 0);
  const avgDaily = totalCost / 7;

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

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Gestión de Mermas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Control y trazabilidad de pérdidas de inventario</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Registrar Merma
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Merma Total (período)', value: formatCurrency(totalCost), icon: DollarSign, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Promedio Diario', value: formatCurrency(avgDaily), icon: TrendingDown, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Total Registros', value: records.length.toString(), icon: Package, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Ingredientes Afectados', value: Object.keys(byIngredient).length.toString(), icon: AlertTriangle, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By reason */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Merma por Motivo</h3>
          <p className="text-xs text-slate-400 mb-4">Costo total acumulado</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={reasonData} layout="vertical" margin={{ left: 100, right: 10, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={95} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} name="Costo" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By ingredient */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Ingredientes más Afectados</h3>
          <p className="text-xs text-slate-400 mb-4">Por costo de pérdida</p>
          <div className="space-y-3">
            {ingData.slice(0, 5).map((item, idx) => {
              const pct = (item.cost / totalCost) * 100;
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-4">#{idx + 1}</span>
                      <span className="text-xs font-medium text-slate-800 dark:text-white">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">{item.qty.toFixed(2)} {item.unit}</span>
                      <span className="font-semibold text-red-500 dark:text-red-400">{formatCurrency(item.cost)}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Records table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Historial de Mermas</h3>
          <p className="text-xs text-slate-400 mt-0.5">{records.length} registros · ordenados por fecha</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700/50">
                <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Ingrediente</th>
                <th className="text-right px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Cantidad</th>
                <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Motivo</th>
                <th className="text-right px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Costo Pérdida</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => {
                const ing = ingredients.find(i => i.id === r.ingredientId);
                return (
                  <tr key={r.id} className="border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{r.date}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{ing?.name || r.ingredientId}</td>
                    <td className="text-right px-4 py-3 text-red-500 dark:text-red-400 font-medium">
                      -{r.quantity} <span className="text-slate-400 font-normal">{r.unit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/30">{r.reason}</span>
                    </td>
                    <td className="text-right px-5 py-3 font-semibold text-red-600 dark:text-red-400">{formatCurrency(r.cost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <AddWasteModal
          onClose={() => setShowModal(false)}
          onSave={data => {
            const newRecord: WasteRecord = { id: `w${Date.now()}`, ...data as WasteRecord };
            setRecords(prev => [newRecord, ...prev]);
            toast.error(`Merma registrada: ${formatCurrency(data.cost || 0)} de pérdida`);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
