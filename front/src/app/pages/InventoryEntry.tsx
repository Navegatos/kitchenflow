import React, { useMemo, useState } from 'react';
import { ArrowRight, ClipboardPlus, Package } from 'lucide-react';
import { ingredients, formatCurrency } from '../data/mockData';

export default function InventoryEntry() {
  const [ingredientId, setIngredientId] = useState(ingredients[0]?.id || '');
  const [quantity, setQuantity] = useState('10');
  const [unitCost, setUnitCost] = useState('1000');
  const [entries, setEntries] = useState([
    { id: 'e1', ingredientId: 'i1', quantity: 12, unitCost: 8600, date: '2026-04-23', supplier: 'Carnes Premium SA' },
    { id: 'e2', ingredientId: 'i7', quantity: 80, unitCost: 360, date: '2026-04-23', supplier: 'Panaderia Central' },
  ]);

  const selected = ingredients.find(i => i.id === ingredientId);
  const total = (Number(quantity) || 0) * (Number(unitCost) || 0);
  const totalDay = entries.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const supplierHint = useMemo(() => selected?.supplier || 'Proveedor', [selected]);

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Ingreso de Inventario</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Registro de compras y actualizacion de stock con calculo automatico</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Nuevo ingreso</h2>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Producto</label>
            <select value={ingredientId} onChange={e => setIngredientId(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
              {ingredients.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Cantidad ({selected?.unit || '-'})</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Costo unitario</label>
              <input type="number" value={unitCost} onChange={e => setUnitCost(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 p-3 text-sm">
            <p className="text-slate-600 dark:text-slate-200">
              Costo total: <span className="font-semibold text-blue-700 dark:text-blue-300">{formatCurrency(total)}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">Proveedor sugerido: {supplierHint}</p>
          </div>

          <button
            onClick={() => {
              if (!selected) return;
              setEntries(prev => [
                {
                  id: `e${Date.now()}`,
                  ingredientId,
                  quantity: Number(quantity) || 0,
                  unitCost: Number(unitCost) || 0,
                  date: '2026-04-23',
                  supplier: selected.supplier,
                },
                ...prev,
              ]);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium"
          >
            <ClipboardPlus className="w-4 h-4" />
            Guardar ingreso
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Resumen del dia</h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between"><span>Ingresos registrados</span><span className="font-semibold">{entries.length}</span></div>
            <div className="flex justify-between"><span>Inversion acumulada</span><span className="font-semibold">{formatCurrency(totalDay)}</span></div>
            <div className="flex justify-between"><span>Ultimo producto</span><span className="font-semibold">{selected?.name || '-'}</span></div>
          </div>
          <div className="mt-4 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-3">
            Flujo recomendado: Dashboard <ArrowRight className="w-3 h-3 inline" /> Inventario <ArrowRight className="w-3 h-3 inline" /> Ingreso
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Historial de ingresos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-700/30">
              <tr>
                <th className="text-left px-5 py-3">Fecha</th>
                <th className="text-left px-4 py-3">Producto</th>
                <th className="text-right px-4 py-3">Cantidad</th>
                <th className="text-right px-4 py-3">Costo unit.</th>
                <th className="text-right px-5 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => {
                const ing = ingredients.find(i => i.id === entry.ingredientId);
                return (
                  <tr key={entry.id} className="border-t border-slate-100 dark:border-slate-700/40">
                    <td className="px-5 py-3">{entry.date}</td>
                    <td className="px-4 py-3">{ing?.name || entry.ingredientId}</td>
                    <td className="text-right px-4 py-3">{entry.quantity} {ing?.unit}</td>
                    <td className="text-right px-4 py-3">{formatCurrency(entry.unitCost)}</td>
                    <td className="text-right px-5 py-3 font-semibold">{formatCurrency(entry.quantity * entry.unitCost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
