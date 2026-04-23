import React, { useMemo, useState } from 'react';
import { Edit2, ImageIcon, Plus, UtensilsCrossed } from 'lucide-react';
import { formatCurrency, getRecipeCost, recipes } from '../data/mockData';

export default function Menu() {
  const [priceAdjust, setPriceAdjust] = useState<Record<string, number>>({});

  const items = useMemo(() => {
    return recipes.map(recipe => {
      const cost = getRecipeCost(recipe);
      const price = priceAdjust[recipe.id] ?? recipe.salePrice;
      const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
      return { ...recipe, cost, price, margin };
    });
  }, [priceAdjust]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Menu / Platos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Relacion de platos con recetas y definicion de precio final</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium">
          <Plus className="w-4 h-4" />
          Nuevo plato
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map(item => (
          <article key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
            <div className="w-full h-32 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</h3>
              <p className="text-xs text-slate-500">{item.category}</p>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span>Costo receta</span><span>{formatCurrency(item.cost)}</span></div>
              <div className="flex justify-between"><span>Precio actual</span><span className="font-semibold">{formatCurrency(item.price)}</span></div>
              <div className="flex justify-between"><span>Margen</span><span className={`font-semibold ${item.margin >= 60 ? 'text-emerald-600' : 'text-amber-600'}`}>{item.margin.toFixed(1)}%</span></div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Editar precio</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={priceAdjust[item.id] ?? item.salePrice}
                  onChange={e => setPriceAdjust(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                />
                <button className="rounded-lg border border-slate-200 dark:border-slate-700 px-3">
                  <Edit2 className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-xs text-slate-500">
        <UtensilsCrossed className="w-4 h-4 inline mr-1" />
        Flujo cubierto: Inventario <b>→</b> Recetas <b>→</b> Menu / Platos.
      </div>
    </div>
  );
}
