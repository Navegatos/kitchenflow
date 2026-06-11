import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Plus, Search, ChefHat, X, Trash2, Edit2,
  TrendingUp, DollarSign, BarChart2, Star, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  formatCurrency, getRecipeCost, getRecipeMargin,
  type Recipe, type RecipeIngredient, type Ingredient,
} from '../data/mockData';
import { ApiError, backendProductToIngredient, backendRecipeToRecipe, catalogApi, recipesApi } from '../api';

// ─── Profit Indicator ─────────────────────────────────────────────────────────

function ProfitIndicator({ margin }: { margin: number }) {
  const level = margin >= 70 ? 'high' : margin >= 50 ? 'mid' : 'low';
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
      level === 'high' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
      level === 'mid'  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                         'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full ${level === 'high' ? 'bg-emerald-500' : level === 'mid' ? 'bg-blue-500' : 'bg-red-500'}`} />
      {margin.toFixed(1)}% margen
    </div>
  );
}

// ─── Recipe Detail Modal ──────────────────────────────────────────────────────

function RecipeDetailModal({ recipe, ingredientsById, onClose }: { recipe: Recipe; ingredientsById: Map<string, Ingredient>; onClose: () => void }) {
  const cost = getRecipeCost(recipe, ingredientsById);
  const margin = getRecipeMargin(recipe, ingredientsById);
  const profit = recipe.salePrice - cost;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{recipe.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{recipe.category} · {recipe.description}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cost breakdown */}
        <div className="px-6 py-5">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Precio Venta</p>
              <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">{formatCurrency(recipe.salePrice)}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/30">
              <p className="text-xs text-red-600 dark:text-red-400 mb-1">Costo Receta</p>
              <p className="text-lg font-semibold text-red-700 dark:text-red-300">{formatCurrency(cost)}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Ganancia</p>
              <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">{formatCurrency(profit)}</p>
            </div>
          </div>

          {/* Margin bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Margen de rentabilidad</span>
              <ProfitIndicator margin={margin} />
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  margin >= 70 ? 'bg-emerald-500' : margin >= 50 ? 'bg-blue-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, margin)}%` }}
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Desglose de Ingredientes</h4>
            <div className="space-y-2">
              {recipe.ingredients.map((ri, idx) => {
                const ing = ingredientsById.get(ri.ingredientId);
                if (!ing) return null;
                const ingCost = ing.costPerUnit * ri.quantity;
                const pct = (ingCost / cost) * 100;
                return (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/40">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-800 dark:text-white">{ing.name}</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(ingCost)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 w-24 text-right">{ri.quantity} {ri.unit} × {formatCurrency(ing.costPerUnit)}</span>
                        <span className="text-xs text-slate-400 w-10 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Recipe Builder Modal ─────────────────────────────────────────────────────

function RecipeBuilderModal({ ingredients, onClose, onSave }: {
  ingredients: Ingredient[];
  onClose: () => void;
  onSave: (recipe: Partial<Recipe>) => void;
}) {
  const [form, setForm] = useState({ name: '', category: 'Principales', salePrice: '', description: '' });
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [searchIng, setSearchIng] = useState('');

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const addIngredient = (ingId: string) => {
    if (recipeIngredients.find(ri => ri.ingredientId === ingId)) return;
    const ing = ingredients.find(i => i.id === ingId);
    if (!ing) return;
    setRecipeIngredients(prev => [...prev, { ingredientId: ingId, quantity: 0.1, unit: ing.unit }]);
    setSearchIng('');
  };

  const updateQty = (ingId: string, qty: number) => {
    setRecipeIngredients(prev => prev.map(ri => ri.ingredientId === ingId ? { ...ri, quantity: qty } : ri));
  };

  const removeIng = (ingId: string) => {
    setRecipeIngredients(prev => prev.filter(ri => ri.ingredientId !== ingId));
  };

  const totalCost = recipeIngredients.reduce((sum, ri) => {
    const ing = ingredients.find(i => i.id === ri.ingredientId);
    return sum + (ing ? ing.costPerUnit * ri.quantity : 0);
  }, 0);

  const salePrice = Number(form.salePrice) || 0;
  const margin = salePrice > 0 ? ((salePrice - totalCost) / salePrice) * 100 : 0;

  const filteredIngs = ingredients.filter(i =>
    i.name.toLowerCase().includes(searchIng.toLowerCase()) &&
    !recipeIngredients.find(ri => ri.ingredientId === i.id)
  );

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Constructor de Receta</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left - basic info + ingredients */}
          <div className="lg:col-span-3 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Nombre del Plato</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" placeholder="Ej: Hamburguesa Especial" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Categoría</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
                  {['Principales', 'Pizzas', 'Ensaladas', 'Acompañamientos', 'Bebidas'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Precio de Venta ($)</label>
                <input type="number" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" placeholder="0" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Descripción</label>
                <input type="text" value={form.description} onChange={e => set('description', e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none" placeholder="Descripción breve del plato..." />
              </div>
            </div>

            {/* Ingredient selector */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">Agregar Ingredientes</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchIng}
                  onChange={e => setSearchIng(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none"
                  placeholder="Buscar ingrediente..."
                />
                {searchIng && filteredIngs.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 shadow-lg z-20 max-h-40 overflow-y-auto">
                    {filteredIngs.slice(0, 8).map(ing => (
                      <button key={ing.id} onClick={() => addIngredient(ing.id)} className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-600 text-xs transition-colors">
                        <span className="text-slate-800 dark:text-white font-medium">{ing.name}</span>
                        <span className="text-slate-400">{formatCurrency(ing.costPerUnit)}/{ing.unit}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recipe ingredients */}
            {recipeIngredients.length > 0 && (
              <div className="space-y-2">
                {recipeIngredients.map(ri => {
                  const ing = ingredientsById.get(ri.ingredientId);
                  if (!ing) return null;
                  const ingCost = ing.costPerUnit * ri.quantity;
                  return (
                    <div key={ri.ingredientId} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600/50">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-800 dark:text-white">{ing.name}</p>
                        <p className="text-xs text-slate-400">{formatCurrency(ing.costPerUnit)}/{ing.unit}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={ri.quantity}
                          onChange={e => updateQty(ri.ingredientId, Number(e.target.value))}
                          min="0" step="0.01"
                          className="w-20 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-900 dark:text-white outline-none text-right"
                        />
                        <span className="text-xs text-slate-400 w-12">{ing.unit}</span>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-20 text-right">{formatCurrency(ingCost)}</span>
                        <button onClick={() => removeIng(ri.ingredientId)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right - cost summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 space-y-3">
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Análisis en Tiempo Real</h4>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3 border border-slate-200 dark:border-slate-600/50">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Costo total receta</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Precio de venta</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(salePrice)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-600 pt-3 flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Ganancia neta</span>
                  <span className={`font-semibold ${salePrice - totalCost >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{formatCurrency(salePrice - totalCost)}</span>
                </div>

                {/* Margin indicator */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Margen</span>
                    <span className={`text-xs font-bold ${margin >= 60 ? 'text-emerald-600' : margin >= 40 ? 'text-blue-600' : 'text-red-600'}`}>
                      {margin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${margin >= 60 ? 'bg-emerald-500' : margin >= 40 ? 'bg-blue-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, Math.max(0, margin))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>0%</span><span>50%</span><span>100%</span>
                  </div>
                </div>
              </div>

              <div className={`p-3 rounded-lg border text-xs ${
                margin >= 60 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400' :
                margin >= 40 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30 text-blue-700 dark:text-blue-400' :
                               'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400'
              }`}>
                {margin >= 60 ? '✅ Excelente rentabilidad. Este plato tiene un margen saludable.' :
                 margin >= 40 ? '⚠️ Margen aceptable. Considera optimizar los ingredientes más costosos.' :
                               '❌ Margen bajo. Revisa el precio de venta o los ingredientes.'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancelar</button>
          <button
            onClick={() => {
              if (!form.name || !form.salePrice) { toast.error('Completa los campos requeridos'); return; }
              onSave({ name: form.name, category: form.category, salePrice: Number(form.salePrice), description: form.description, ingredients: recipeIngredients, active: true });
            }}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Guardar Receta
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Recipe Card ──────────────────────────────────────────────────────────────

function RecipeCard({ recipe, ingredientsById, onClick }: { recipe: Recipe; ingredientsById: Map<string, Ingredient>; onClick: () => void }) {
  const cost = getRecipeCost(recipe, ingredientsById);
  const margin = getRecipeMargin(recipe, ingredientsById);
  const profit = recipe.salePrice - cost;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700/50 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{recipe.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{recipe.category}</p>
        </div>
        <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${recipe.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{recipe.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Precio venta</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(recipe.salePrice)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Costo receta</span>
          <span className="font-medium text-red-500 dark:text-red-400">{formatCurrency(cost)}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">Ganancia</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(profit)}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${margin >= 70 ? 'bg-emerald-500' : margin >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(100, margin)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <ProfitIndicator margin={margin} />
        <span className="text-xs text-slate-400">{recipe.ingredients.length} ingredientes</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Recipes() {
  const [recipeList, setRecipeList] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Todas');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const ingredientsById = useMemo(
    () => new Map(ingredients.map(i => [i.id, i])),
    [ingredients],
  );

  const recipeCategories = useMemo(
    () => [...new Set(recipeList.map(r => r.category).filter(Boolean))],
    [recipeList],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [recipeRows, products] = await Promise.all([
        recipesApi.listRecipes({ status: 'ACTIVE' }),
        catalogApi.listProducts({ active_only: true }),
      ]);
      setIngredients(products.map(backendProductToIngredient));
      setRecipeList(recipeRows.map(backendRecipeToRecipe));
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudieron cargar las recetas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = recipeList.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterCat === 'Todas' || r.category === filterCat)
  );

  const avgMargin = recipeList.length
    ? recipeList.reduce((s, r) => s + getRecipeMargin(r, ingredientsById), 0) / recipeList.length
    : 0;
  const bestRecipe = [...recipeList].sort((a, b) => getRecipeMargin(b, ingredientsById) - getRecipeMargin(a, ingredientsById))[0];
  const worstRecipe = [...recipeList].sort((a, b) => getRecipeMargin(a, ingredientsById) - getRecipeMargin(b, ingredientsById))[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando recetas…
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Recetas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{recipeList.length} recetas · Margen promedio: {avgMargin.toFixed(1)}%</p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nueva Receta
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Recetas', value: recipeList.length.toString(), icon: ChefHat, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Margen Promedio', value: `${avgMargin.toFixed(1)}%`, icon: BarChart2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Mejor Margen', value: bestRecipe ? `${getRecipeMargin(bestRecipe, ingredientsById).toFixed(1)}%` : '-', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', sub: bestRecipe?.name },
          { label: 'Menor Margen', value: worstRecipe ? `${getRecipeMargin(worstRecipe, ingredientsById).toFixed(1)}%` : '-', icon: TrendingUp, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', sub: worstRecipe?.name },
        ].map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
              {sub && <p className="text-xs text-slate-400 truncate">{sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input type="text" placeholder="Buscar receta..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['Todas', ...recipeCategories].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterCat === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} ingredientsById={ingredientsById} onClick={() => setSelectedRecipe(recipe)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <ChefHat className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No se encontraron recetas</p>
        </div>
      )}

      {selectedRecipe && <RecipeDetailModal recipe={selectedRecipe} ingredientsById={ingredientsById} onClose={() => setSelectedRecipe(null)} />}
      {showBuilder && (
        <RecipeBuilderModal
          ingredients={ingredients}
          onClose={() => setShowBuilder(false)}
          onSave={async data => {
            try {
              const created = await recipesApi.createRecipe({
                name: data.name!,
                description: data.description,
                sale_price: data.salePrice!,
                status: 'ACTIVE',
              });
              if (data.ingredients?.length) {
                await recipesApi.replaceRecipeIngredients(
                  created.id,
                  data.ingredients.map(ri => ({ product_id: ri.ingredientId, quantity: ri.quantity })),
                );
              }
              toast.success(`Receta "${data.name}" creada exitosamente`);
              setShowBuilder(false);
              loadData();
            } catch (error) {
              toast.error(error instanceof ApiError ? error.message : 'Error al crear receta');
            }
          }}
        />
      )}
    </div>
  );
}
