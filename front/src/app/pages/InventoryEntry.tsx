import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, ClipboardPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, type Ingredient } from '../data/mockData';
import { ApiError, backendProductToIngredient, catalogApi, inventoryApi } from '../api';
import { useApp } from '../context/AppContext';

interface EntryRow {
  id: string;
  ingredientId: string;
  quantity: number;
  unitCost: number;
  date: string;
  supplier: string;
}

export default function InventoryEntry() {
  const { currentUser } = useApp();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingredientId, setIngredientId] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [unitCost, setUnitCost] = useState('1000');
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [products, movements] = await Promise.all([
        catalogApi.listProducts({ active_only: true }),
        inventoryApi.listMovements({ limit: 50 }),
      ]);
      const mapped = products.map(backendProductToIngredient);
      setIngredients(mapped);
      if (mapped.length > 0 && !ingredientId) setIngredientId(mapped[0].id);

      const purchaseEntries = movements
        .filter(m => m.movement_type === 'IN')
        .map(m => {
          const product = mapped.find(p => p.id === m.product_id);
          return {
            id: m.id,
            ingredientId: m.product_id,
            quantity: Number(m.quantity) || 0,
            unitCost: product?.costPerUnit ?? 0,
            date: (m.created_at || '').split('T')[0],
            supplier: product?.supplier || '—',
          };
        });
      setEntries(purchaseEntries);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  }, [ingredientId]);

  useEffect(() => { loadData(); }, [loadData]);

  const selected = ingredients.find(i => i.id === ingredientId);
  const total = (Number(quantity) || 0) * (Number(unitCost) || 0);
  const totalDay = entries.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const supplierHint = useMemo(() => selected?.supplier || 'Proveedor', [selected]);

  const handleSubmit = async () => {
    if (!ingredientId || !quantity || Number(quantity) <= 0) {
      toast.error('Completa los datos del ingreso');
      return;
    }
    setSaving(true);
    try {
      await inventoryApi.createMovement({
        product_id: ingredientId,
        actor_user_id: currentUser.id,
        movement_type: 'IN',
        quantity: Number(quantity),
        notes: `Ingreso manual · ${supplierHint}`,
      });
      toast.success('Ingreso registrado');
      setQuantity('10');
      loadData();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Error al registrar ingreso');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando ingresos…
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Ingreso de Inventario</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Registro de compras contra la API de inventario</p>
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
              Total estimado: <strong>{formatCurrency(total)}</strong> · Proveedor: {supplierHint}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving || ingredients.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardPlus className="w-4 h-4" />}
            Registrar ingreso
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h2 className="text-sm font-semibold mb-3">Resumen del día</h2>
          <p className="text-2xl font-semibold text-blue-600">{formatCurrency(totalDay)}</p>
          <p className="text-xs text-slate-400 mt-1">{entries.length} ingresos registrados</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/30">
              <th className="text-left px-4 py-3 text-slate-500">Producto</th>
              <th className="text-right px-4 py-3 text-slate-500">Cantidad</th>
              <th className="text-right px-4 py-3 text-slate-500">Costo unit.</th>
              <th className="text-left px-4 py-3 text-slate-500">Proveedor</th>
              <th className="text-left px-4 py-3 text-slate-500">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-400">Sin ingresos registrados</td></tr>
            ) : entries.map(entry => {
              const ing = ingredients.find(i => i.id === entry.ingredientId);
              return (
                <tr key={entry.id} className="border-t border-slate-100 dark:border-slate-700/30">
                  <td className="px-4 py-3">{ing?.name || '—'}</td>
                  <td className="text-right px-4 py-3">{entry.quantity} {ing?.unit}</td>
                  <td className="text-right px-4 py-3">{formatCurrency(entry.unitCost)}</td>
                  <td className="px-4 py-3 text-slate-500">{entry.supplier}</td>
                  <td className="px-4 py-3 text-slate-400">{entry.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
