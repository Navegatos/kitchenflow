/** Tipos y utilidades compartidas. Los datos de negocio provienen de la API. */
export type {
  Ingredient,
  RecipeIngredient,
  Recipe,
  StockMovement,
  WasteRecord,
  DailyFinancial,
  AppUser,
} from '../domain/types';

export {
  formatCurrency,
  isLowStock,
  getIngredientById,
  getRecipeCost,
  getRecipeMargin,
  dateRangeDays,
  formatDisplayDate,
  parseDecimal,
  PRODUCT_UNITS,
  mapFinanceRows,
} from '../domain/types';
