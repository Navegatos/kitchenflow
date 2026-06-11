import React, { useEffect, useMemo, useState } from 'react';
import { Edit2, ImageIcon, Plus, UtensilsCrossed, Loader2 } from 'lucide-react';
import { formatCurrency, parseDecimal } from '../data/mockData';
import { recipesApi } from '../api';
import type { BackendRecipe } from '../api/types';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  cost: number;
  price: number;
  margin: number;
}

export default function Menu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [priceAdjust, setPriceAdjust] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    recipesApi.listMenuRecipes()
      .then(async (recipes: BackendRecipe[]) => {
        if (cancelled) return;
        const withCosts = await Promise.all(
          recipes.map(async recipe => {
            const costData = await recipesApi.getRecipeCost(recipe.id);
            const cost = parseDecimal(costData.estimated_cost);
            const price = parseDecimal(recipe.sale_price);
            const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
            return {
              id: recipe.id,
              name: recipe.name,
              category: 'Platos',
              cost,
              price,
              margin,
            };
          }),
        );
        if (!cancelled) setItems(withCosts);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const displayItems = useMemo(() => {
    return items.map(item => {
      const price = priceAdjust[item.id] ?? item.price;
      const margin = price > 0 ? ((price - item.cost) / price) * 100 : 0;
      return { ...item, price, margin };
    });
  }, [items, priceAdjust]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando menú…
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Menu / Platos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{displayItems.length} platos activos en el menú</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium">
          <Plus className="w-4 h-4" />
          Nuevo plato
        </button>
      </div>

      {displayItems.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-16">No hay recetas activas en el menú</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayItems.map(item => (
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
                    value={priceAdjust[item.id] ?? item.price}
                    onChange={e => setPriceAdjust(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                    className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-900"
                  />
                  <button className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs inline-flex items-center gap-1">
                    <Edit2 className="w-3.5 h-3.5" />
                    Guardar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
