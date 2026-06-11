import type { BackendRole } from '../api/types';

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  costPerUnit: number;
  category: string;
  supplier: string;
  lastUpdated: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  salePrice: number;
  description: string;
  ingredients: RecipeIngredient[];
  active: boolean;
}

export interface StockMovement {
  id: string;
  ingredientId: string;
  type: 'purchase' | 'usage' | 'waste' | 'adjustment';
  quantity: number;
  unit: string;
  date: string;
  cost: number;
  notes: string;
  userId: string;
}

export interface WasteRecord {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  reason: string;
  date: string;
  cost: number;
  userId: string;
}

export interface DailyFinancial {
  date: string;
  revenue: number;
  costs: number;
  profit: number;
  waste: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: BackendRole;
  active: boolean;
  lastLogin: string;
  branch: string;
}

export function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString('es-CL')}`;
}

export function isLowStock(ingredient: Ingredient): boolean {
  return ingredient.stock <= ingredient.minStock;
}

export function getIngredientById(
  id: string,
  ingredients: Ingredient[],
): Ingredient | undefined {
  return ingredients.find(i => i.id === id);
}

export function getRecipeCost(
  recipe: Recipe,
  ingredientsById: Map<string, Ingredient>,
): number {
  return recipe.ingredients.reduce((total, ri) => {
    const ing = ingredientsById.get(ri.ingredientId);
    if (!ing) return total;
    return total + ing.costPerUnit * ri.quantity;
  }, 0);
}

export function getRecipeMargin(
  recipe: Recipe,
  ingredientsById: Map<string, Ingredient>,
): number {
  if (recipe.salePrice <= 0) return 0;
  const cost = getRecipeCost(recipe, ingredientsById);
  return ((recipe.salePrice - cost) / recipe.salePrice) * 100;
}

export function dateRangeDays(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days + 1);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

export function formatDisplayDate(date = new Date()): string {
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function parseDecimal(value: string | number | null | undefined, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const PRODUCT_UNITS = ['kg', 'gr', 'lt', 'ml', 'unidad', 'porción', 'taza'];

export function mapFinanceRows(
  rows: Array<{ date: string; revenue?: string | null; waste_cost?: string | null; estimated_profit?: string | null }>,
): DailyFinancial[] {
  return rows.map(row => {
    const revenue = parseDecimal(row.revenue);
    const waste = parseDecimal(row.waste_cost);
    const profit = parseDecimal(row.estimated_profit);
    return {
      date: row.date,
      revenue,
      costs: Math.max(0, revenue - profit),
      profit,
      waste,
    };
  });
}
