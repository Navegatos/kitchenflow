import type {
  AppUser,
  Ingredient,
  Recipe,
  RecipeIngredient,
  StockMovement,
  WasteRecord,
} from '../data/mockData';
import type {
  BackendInventoryMovement,
  BackendMovementType,
  BackendProduct,
  BackendRecipe,
  BackendRole,
  BackendUser,
  BackendWasteRecord,
  LoginResponse,
} from './types';

export function parseDecimal(value: string | number | null | undefined, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toIsoDate(value: string | null | undefined): string {
  if (!value) return new Date().toISOString().split('T')[0];
  return value.split('T')[0];
}

export function mapBackendRole(role: BackendRole | string): AppUser['role'] {
  const upper = role.toUpperCase();
  if (upper === 'ADMIN' || upper === 'MANAGER' || upper === 'CHEF' || upper === 'WAITER') {
    return upper as AppUser['role'];
  }
  return 'WAITER';
}

export function splitFullName(name: string): { first_name: string; last_name: string } {
  const trimmed = name.trim();
  const space = trimmed.indexOf(' ');
  if (space === -1) return { first_name: trimmed, last_name: '-' };
  return {
    first_name: trimmed.slice(0, space),
    last_name: trimmed.slice(space + 1),
  };
}

export function joinFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function loginResponseToAppUser(data: LoginResponse): AppUser {
  return {
    id: String(data.sub),
    name: joinFullName(data.first_name, data.last_name),
    email: data.email,
    role: mapBackendRole(data.role),
    active: true,
    lastLogin: new Date().toLocaleString('es-CL'),
    branch: data.branch_name || '',
  };
}

export function backendUserToAppUser(user: BackendUser): AppUser {
  return {
    id: user.id,
    name: joinFullName(user.first_name, user.last_name),
    email: user.email,
    role: mapBackendRole(user.role),
    active: user.active,
    lastLogin: user.updated_at ? new Date(user.updated_at).toLocaleString('es-CL') : '—',
    branch: user.branch_name || '',
  };
}

export function backendProductToIngredient(product: BackendProduct): Ingredient {
  return {
    id: product.id,
    name: product.name,
    unit: product.unit,
    stock: parseDecimal(product.stock),
    minStock: parseDecimal(product.minimum_stock),
    costPerUnit: parseDecimal(product.cost_price),
    category: product.category_name || 'Sin categoría',
    supplier: product.supplier_name || '—',
    lastUpdated: toIsoDate(product.updated_at || product.created_at),
  };
}

const MOVEMENT_TO_FRONT: Record<BackendMovementType, StockMovement['type']> = {
  IN: 'purchase',
  OUT: 'usage',
  ADJUSTMENT: 'adjustment',
  WASTE: 'waste',
};

const MOVEMENT_TO_BACK: Record<StockMovement['type'], BackendMovementType> = {
  purchase: 'IN',
  usage: 'OUT',
  adjustment: 'ADJUSTMENT',
  waste: 'WASTE',
};

export function mapMovementTypeToFront(type: BackendMovementType): StockMovement['type'] {
  return MOVEMENT_TO_FRONT[type] ?? 'adjustment';
}

export function mapMovementTypeToBack(type: StockMovement['type']): BackendMovementType {
  return MOVEMENT_TO_BACK[type];
}

export function backendMovementToStockMovement(
  movement: BackendInventoryMovement,
  productsById: Map<string, Ingredient>,
): StockMovement {
  const product = productsById.get(movement.product_id);
  const qty = parseDecimal(movement.quantity);
  const costPerUnit = product?.costPerUnit ?? 0;
  return {
    id: movement.id,
    ingredientId: movement.product_id,
    type: mapMovementTypeToFront(movement.movement_type),
    quantity: qty,
    unit: product?.unit || 'ud',
    date: toIsoDate(movement.created_at),
    cost: qty * costPerUnit,
    notes: movement.notes || '',
    userId: movement.user_id || '',
  };
}

export function backendRecipeToRecipe(recipe: BackendRecipe): Recipe {
  const ingredients: RecipeIngredient[] = (recipe.ingredients || []).map(line => ({
    ingredientId: line.product_id,
    quantity: parseDecimal(line.quantity),
    unit: line.unit || 'ud',
  }));

  return {
    id: recipe.id,
    name: recipe.name,
    category: recipe.category_name || 'Sin categoría',
    salePrice: parseDecimal(recipe.sale_price),
    description: recipe.description || '',
    ingredients,
    active: (recipe.status || 'ACTIVE') === 'ACTIVE',
  };
}

export function backendWasteToWasteRecord(
  record: BackendWasteRecord,
  productsById: Map<string, Ingredient>,
): WasteRecord {
  const product = productsById.get(record.product_id);
  const qty = parseDecimal(record.quantity);
  return {
    id: record.id,
    ingredientId: record.product_id,
    quantity: qty,
    unit: product?.unit || 'ud',
    reason: record.reason || '',
    date: toIsoDate(record.created_at),
    cost: qty * (product?.costPerUnit ?? 0),
    userId: record.registered_by || '',
  };
}
