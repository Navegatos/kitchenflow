// ─── Types ──────────────────────────────────────────────────────────────────

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

export interface SaleRecord {
  id: string;
  recipeId: string;
  quantity: number;
  revenue: number;
  date: string;
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
  role: 'admin' | 'operator';
  active: boolean;
  lastLogin: string;
  branch: string;
}

// ─── Ingredients ──────────────────────────────────────────────────────────────

export const ingredients: Ingredient[] = [
  { id: 'i1',  name: 'Carne Molida',       unit: 'kg',      stock: 15.5, minStock: 5,  costPerUnit: 8500,  category: 'Proteínas',   supplier: 'Carnes Premium SA',   lastUpdated: '2026-04-22' },
  { id: 'i2',  name: 'Pechuga de Pollo',   unit: 'kg',      stock: 8.2,  minStock: 3,  costPerUnit: 5200,  category: 'Proteínas',   supplier: 'Avícola Del Campo',   lastUpdated: '2026-04-22' },
  { id: 'i3',  name: 'Papa',               unit: 'kg',      stock: 25,   minStock: 10, costPerUnit: 800,   category: 'Vegetales',   supplier: 'Agrofresco Ltda.',    lastUpdated: '2026-04-21' },
  { id: 'i4',  name: 'Tomate',             unit: 'kg',      stock: 3.8,  minStock: 5,  costPerUnit: 1200,  category: 'Vegetales',   supplier: 'Agrofresco Ltda.',    lastUpdated: '2026-04-21' },
  { id: 'i5',  name: 'Lechuga Costina',    unit: 'unidad',  stock: 12,   minStock: 8,  costPerUnit: 700,   category: 'Vegetales',   supplier: 'Agrofresco Ltda.',    lastUpdated: '2026-04-21' },
  { id: 'i6',  name: 'Queso Cheddar',      unit: 'kg',      stock: 3.8,  minStock: 2,  costPerUnit: 12000, category: 'Lácteos',     supplier: 'Lácteos del Norte',   lastUpdated: '2026-04-20' },
  { id: 'i7',  name: 'Pan de Hamburguesa', unit: 'unidad',  stock: 48,   minStock: 20, costPerUnit: 350,   category: 'Panadería',   supplier: 'Panadería Central',   lastUpdated: '2026-04-22' },
  { id: 'i8',  name: 'Aceite Vegetal',     unit: 'lt',      stock: 8.5,  minStock: 4,  costPerUnit: 1800,  category: 'Condimentos', supplier: 'Distribuidora Sur',   lastUpdated: '2026-04-19' },
  { id: 'i9',  name: 'Sal',               unit: 'kg',      stock: 5,    minStock: 2,  costPerUnit: 400,   category: 'Condimentos', supplier: 'Distribuidora Sur',   lastUpdated: '2026-04-18' },
  { id: 'i10', name: 'Harina',             unit: 'kg',      stock: 12,   minStock: 5,  costPerUnit: 900,   category: 'Almacén',     supplier: 'Molino Central',      lastUpdated: '2026-04-17' },
  { id: 'i11', name: 'Mozzarella',         unit: 'kg',      stock: 1.8,  minStock: 3,  costPerUnit: 14000, category: 'Lácteos',     supplier: 'Lácteos del Norte',   lastUpdated: '2026-04-22' },
  { id: 'i12', name: 'Salsa de Tomate',    unit: 'lt',      stock: 6,    minStock: 2,  costPerUnit: 2200,  category: 'Condimentos', supplier: 'Distribuidora Sur',   lastUpdated: '2026-04-20' },
  { id: 'i13', name: 'Limón',              unit: 'kg',      stock: 3.2,  minStock: 2,  costPerUnit: 1500,  category: 'Frutas',      supplier: 'Agrofresco Ltda.',    lastUpdated: '2026-04-21' },
  { id: 'i14', name: 'Azúcar',             unit: 'kg',      stock: 8,    minStock: 3,  costPerUnit: 700,   category: 'Almacén',     supplier: 'Distribuidora Sur',   lastUpdated: '2026-04-18' },
  { id: 'i15', name: 'Tocino Ahumado',     unit: 'kg',      stock: 1.9,  minStock: 2,  costPerUnit: 9500,  category: 'Proteínas',   supplier: 'Carnes Premium SA',   lastUpdated: '2026-04-22' },
  { id: 'i16', name: 'Crema de Leche',     unit: 'lt',      stock: 4.5,  minStock: 2,  costPerUnit: 3200,  category: 'Lácteos',     supplier: 'Lácteos del Norte',   lastUpdated: '2026-04-20' },
  { id: 'i17', name: 'Ajo',               unit: 'kg',      stock: 1.5,  minStock: 0.5,costPerUnit: 3500,  category: 'Condimentos', supplier: 'Agrofresco Ltda.',    lastUpdated: '2026-04-19' },
  { id: 'i18', name: 'Cebolla',            unit: 'kg',      stock: 7.2,  minStock: 3,  costPerUnit: 600,   category: 'Vegetales',   supplier: 'Agrofresco Ltda.',    lastUpdated: '2026-04-21' },
];

// ─── Recipes ──────────────────────────────────────────────────────────────────

export const recipes: Recipe[] = [
  {
    id: 'r1',
    name: 'Hamburguesa Clásica',
    category: 'Principales',
    salePrice: 9990,
    description: 'Hamburguesa con queso cheddar, lechuga, tomate y pan brioche',
    ingredients: [
      { ingredientId: 'i1',  quantity: 0.15, unit: 'kg' },
      { ingredientId: 'i7',  quantity: 1,    unit: 'unidad' },
      { ingredientId: 'i6',  quantity: 0.04, unit: 'kg' },
      { ingredientId: 'i4',  quantity: 0.06, unit: 'kg' },
      { ingredientId: 'i5',  quantity: 0.15, unit: 'unidad' },
      { ingredientId: 'i9',  quantity: 0.005,unit: 'kg' },
    ],
    active: true,
  },
  {
    id: 'r2',
    name: 'Hamburguesa BBQ Bacon',
    category: 'Principales',
    salePrice: 12990,
    description: 'Hamburguesa doble con tocino, queso cheddar y salsa BBQ',
    ingredients: [
      { ingredientId: 'i1',  quantity: 0.20, unit: 'kg' },
      { ingredientId: 'i7',  quantity: 1,    unit: 'unidad' },
      { ingredientId: 'i6',  quantity: 0.06, unit: 'kg' },
      { ingredientId: 'i15', quantity: 0.05, unit: 'kg' },
      { ingredientId: 'i5',  quantity: 0.1,  unit: 'unidad' },
      { ingredientId: 'i9',  quantity: 0.005,unit: 'kg' },
    ],
    active: true,
  },
  {
    id: 'r3',
    name: 'Pizza Margherita',
    category: 'Pizzas',
    salePrice: 11990,
    description: 'Pizza artesanal con salsa de tomate, mozzarella y albahaca',
    ingredients: [
      { ingredientId: 'i10', quantity: 0.2,  unit: 'kg' },
      { ingredientId: 'i11', quantity: 0.18, unit: 'kg' },
      { ingredientId: 'i12', quantity: 0.1,  unit: 'lt' },
      { ingredientId: 'i8',  quantity: 0.02, unit: 'lt' },
      { ingredientId: 'i9',  quantity: 0.005,unit: 'kg' },
    ],
    active: true,
  },
  {
    id: 'r4',
    name: 'Pizza Pollo y Champiñones',
    category: 'Pizzas',
    salePrice: 13990,
    description: 'Pizza con pollo grillado, champiñones y mozzarella',
    ingredients: [
      { ingredientId: 'i10', quantity: 0.2,  unit: 'kg' },
      { ingredientId: 'i11', quantity: 0.18, unit: 'kg' },
      { ingredientId: 'i2',  quantity: 0.12, unit: 'kg' },
      { ingredientId: 'i12', quantity: 0.08, unit: 'lt' },
      { ingredientId: 'i9',  quantity: 0.005,unit: 'kg' },
    ],
    active: true,
  },
  {
    id: 'r5',
    name: 'Ensalada César',
    category: 'Ensaladas',
    salePrice: 7990,
    description: 'Lechuga romana, pollo grillado, aderezo césar y crutones',
    ingredients: [
      { ingredientId: 'i5',  quantity: 0.4,  unit: 'unidad' },
      { ingredientId: 'i2',  quantity: 0.1,  unit: 'kg' },
      { ingredientId: 'i6',  quantity: 0.03, unit: 'kg' },
      { ingredientId: 'i17', quantity: 0.01, unit: 'kg' },
    ],
    active: true,
  },
  {
    id: 'r6',
    name: 'Papas Fritas Especiales',
    category: 'Acompañamientos',
    salePrice: 3990,
    description: 'Papas fritas crujientes con sal y especias',
    ingredients: [
      { ingredientId: 'i3',  quantity: 0.25, unit: 'kg' },
      { ingredientId: 'i8',  quantity: 0.05, unit: 'lt' },
      { ingredientId: 'i9',  quantity: 0.005,unit: 'kg' },
    ],
    active: true,
  },
  {
    id: 'r7',
    name: 'Limonada Natural',
    category: 'Bebidas',
    salePrice: 2990,
    description: 'Limonada fresca con menta y azúcar morena',
    ingredients: [
      { ingredientId: 'i13', quantity: 0.08, unit: 'kg' },
      { ingredientId: 'i14', quantity: 0.04, unit: 'kg' },
    ],
    active: true,
  },
  {
    id: 'r8',
    name: 'Pollo a la Plancha',
    category: 'Principales',
    salePrice: 8990,
    description: 'Pechuga a la plancha con papas y ensalada',
    ingredients: [
      { ingredientId: 'i2',  quantity: 0.2,  unit: 'kg' },
      { ingredientId: 'i3',  quantity: 0.2,  unit: 'kg' },
      { ingredientId: 'i8',  quantity: 0.03, unit: 'lt' },
      { ingredientId: 'i17', quantity: 0.01, unit: 'kg' },
      { ingredientId: 'i9',  quantity: 0.005,unit: 'kg' },
    ],
    active: true,
  },
];

// ─── Helper: Calculate Recipe Cost ───────────────────────────────────────────

export function getRecipeCost(recipe: Recipe): number {
  return recipe.ingredients.reduce((total, ri) => {
    const ing = ingredients.find(i => i.id === ri.ingredientId);
    if (!ing) return total;
    return total + ing.costPerUnit * ri.quantity;
  }, 0);
}

export function getRecipeMargin(recipe: Recipe): number {
  const cost = getRecipeCost(recipe);
  return ((recipe.salePrice - cost) / recipe.salePrice) * 100;
}

// ─── Stock Movements ──────────────────────────────────────────────────────────

export const stockMovements: StockMovement[] = [
  { id: 'm1',  ingredientId: 'i1',  type: 'purchase',   quantity: 10,   unit: 'kg',     date: '2026-04-22', cost: 85000,  notes: 'Compra mensual',        userId: 'u1' },
  { id: 'm2',  ingredientId: 'i7',  type: 'purchase',   quantity: 100,  unit: 'unidad', date: '2026-04-22', cost: 35000,  notes: 'Proveedor panadería',    userId: 'u1' },
  { id: 'm3',  ingredientId: 'i1',  type: 'usage',      quantity: 2.25, unit: 'kg',     date: '2026-04-22', cost: 19125,  notes: '15 hamburguesas',        userId: 'u2' },
  { id: 'm4',  ingredientId: 'i3',  type: 'usage',      quantity: 5,    unit: 'kg',     date: '2026-04-22', cost: 4000,   notes: '20 porciones papas',     userId: 'u2' },
  { id: 'm5',  ingredientId: 'i11', type: 'waste',      quantity: 0.3,  unit: 'kg',     date: '2026-04-22', cost: 4200,   notes: 'Vencimiento',            userId: 'u2' },
  { id: 'm6',  ingredientId: 'i4',  type: 'waste',      quantity: 0.8,  unit: 'kg',     date: '2026-04-21', cost: 960,    notes: 'Deterioro',              userId: 'u2' },
  { id: 'm7',  ingredientId: 'i2',  type: 'purchase',   quantity: 5,    unit: 'kg',     date: '2026-04-21', cost: 26000,  notes: 'Reposición stock',       userId: 'u1' },
  { id: 'm8',  ingredientId: 'i10', type: 'purchase',   quantity: 10,   unit: 'kg',     date: '2026-04-20', cost: 9000,   notes: 'Pedido quincenal',       userId: 'u1' },
  { id: 'm9',  ingredientId: 'i6',  type: 'usage',      quantity: 0.6,  unit: 'kg',     date: '2026-04-22', cost: 7200,   notes: '15 hamburguesas queso',  userId: 'u2' },
  { id: 'm10', ingredientId: 'i15', type: 'waste',      quantity: 0.2,  unit: 'kg',     date: '2026-04-20', cost: 1900,   notes: 'Temperatura inadecuada', userId: 'u2' },
  { id: 'm11', ingredientId: 'i11', type: 'purchase',   quantity: 3,    unit: 'kg',     date: '2026-04-19', cost: 42000,  notes: 'Compra urgente',         userId: 'u1' },
  { id: 'm12', ingredientId: 'i13', type: 'usage',      quantity: 0.5,  unit: 'kg',     date: '2026-04-22', cost: 750,    notes: '6 limonadas',            userId: 'u2' },
];

// ─── Waste Records ────────────────────────────────────────────────────────────

export const wasteRecords: WasteRecord[] = [
  { id: 'w1', ingredientId: 'i11', quantity: 0.3,  unit: 'kg',     reason: 'Vencimiento',            date: '2026-04-22', cost: 4200,  userId: 'u2' },
  { id: 'w2', ingredientId: 'i4',  quantity: 0.8,  unit: 'kg',     reason: 'Deterioro por calor',    date: '2026-04-21', cost: 960,   userId: 'u2' },
  { id: 'w3', ingredientId: 'i15', quantity: 0.2,  unit: 'kg',     reason: 'Cadena de frío rota',    date: '2026-04-20', cost: 1900,  userId: 'u2' },
  { id: 'w4', ingredientId: 'i5',  quantity: 2,    unit: 'unidad', reason: 'Deterioro por humedad',  date: '2026-04-20', cost: 1400,  userId: 'u2' },
  { id: 'w5', ingredientId: 'i1',  quantity: 0.5,  unit: 'kg',     reason: 'Carne no vendida',       date: '2026-04-19', cost: 4250,  userId: 'u2' },
  { id: 'w6', ingredientId: 'i3',  quantity: 1.5,  unit: 'kg',     reason: 'Deterioro',              date: '2026-04-18', cost: 1200,  userId: 'u2' },
  { id: 'w7', ingredientId: 'i13', quantity: 0.4,  unit: 'kg',     reason: 'Limones pasados',        date: '2026-04-17', cost: 600,   userId: 'u2' },
  { id: 'w8', ingredientId: 'i6',  quantity: 0.15, unit: 'kg',     reason: 'Queso vencido',          date: '2026-04-16', cost: 1800,  userId: 'u2' },
];

// ─── Sales (Toteat) ───────────────────────────────────────────────────────────

const generateSales = (): SaleRecord[] => {
  const sales: SaleRecord[] = [];
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date('2026-04-23');
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const recipeQtys: Record<string, number[]> = {
    r1: [12,15,18,10,20,25,22,14,16,18,19,23,21,17,15,20,24,22,18,16,14,19,21,23,20,18,22,25,28,30],
    r2: [6, 8, 7, 5, 9,12,10, 7, 8, 9, 8,11,10, 8, 7, 9,11,10, 9, 8, 7, 9,10,12,11, 9,10,13,15,18],
    r3: [8, 9,10, 7,11,14,12, 9,10,11,10,13,12,10, 9,11,13,12,11,10, 9,11,12,14,12,11,12,15,17,20],
    r4: [4, 5, 6, 4, 7, 8, 7, 5, 6, 7, 6, 8, 7, 6, 5, 7, 8, 7, 6, 5, 5, 6, 7, 8, 7, 6, 7, 9,10,12],
    r5: [5, 6, 7, 4, 8, 9, 8, 6, 7, 8, 7, 9, 8, 7, 6, 8, 9, 8, 7, 6, 6, 7, 8, 9, 8, 7, 8,10,11,13],
    r6: [20,22,25,18,28,35,30,22,24,26,25,30,28,24,22,26,30,28,24,22,20,24,27,30,27,24,28,33,38,42],
    r7: [15,18,20,14,22,28,24,17,20,22,21,25,23,20,18,22,26,24,20,18,17,21,23,26,23,21,24,28,32,36],
    r8: [7, 8, 9, 6,10,12,11, 8, 9,10, 9,11,10, 9, 8,10,12,11,10, 9, 8,10,11,12,11,10,11,13,15,17],
  };

  let id = 1;
  dates.forEach((date, idx) => {
    recipes.forEach(recipe => {
      const qty = recipeQtys[recipe.id][idx];
      sales.push({
        id: `s${id++}`,
        recipeId: recipe.id,
        quantity: qty,
        revenue: qty * recipe.salePrice,
        date,
      });
    });
  });
  return sales;
};

export const salesRecords = generateSales();

// ─── Daily Financial Summary ──────────────────────────────────────────────────

export const dailyFinancials: DailyFinancial[] = (() => {
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date('2026-04-23');
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  return dates.map((date, idx) => {
    const daySales = salesRecords.filter(s => s.date === date);
    const revenue = daySales.reduce((sum, s) => sum + s.revenue, 0);
    const costs = daySales.reduce((sum, s) => {
      const recipe = recipes.find(r => r.id === s.recipeId);
      if (!recipe) return sum;
      return sum + getRecipeCost(recipe) * s.quantity;
    }, 0);
    const wasteBase = [4200, 960, 1900, 1400, 4250, 1200, 600, 1800, 3000, 2100, 1500, 900, 2400, 1800, 3200, 1100, 2800, 1600, 900, 2100, 1300, 1700, 2000, 1400, 900, 2200, 1500, 3100, 1800, 2400];
    const waste = wasteBase[idx] || 1500;
    return { date, revenue: Math.round(revenue), costs: Math.round(costs + waste * 0.5), profit: Math.round(revenue - costs - waste * 0.5), waste };
  });
})();

// ─── Users ────────────────────────────────────────────────────────────────────

export const appUsers: AppUser[] = [
  { id: 'u1', name: 'Carlos Mendoza',    email: 'carlos@kitchenflow.app', role: 'admin',    active: true,  lastLogin: '2026-04-23 09:15', branch: 'Sucursal Centro' },
  { id: 'u2', name: 'María Rodríguez',   email: 'maria@kitchenflow.app',  role: 'operator', active: true,  lastLogin: '2026-04-23 08:30', branch: 'Sucursal Centro' },
  { id: 'u3', name: 'Jorge Soto',        email: 'jorge@kitchenflow.app',  role: 'operator', active: true,  lastLogin: '2026-04-22 22:10', branch: 'Sucursal Norte' },
  { id: 'u4', name: 'Ana García',        email: 'ana@kitchenflow.app',    role: 'operator', active: false, lastLogin: '2026-04-18 14:20', branch: 'Sucursal Centro' },
  { id: 'u5', name: 'Luis Vargas',       email: 'luis@kitchenflow.app',   role: 'admin',    active: true,  lastLogin: '2026-04-23 07:45', branch: 'Sucursal Norte' },
];

// ─── Utility ──────────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString('es-CL')}`;
}

export function getIngredientById(id: string): Ingredient | undefined {
  return ingredients.find(i => i.id === id);
}

export function isLowStock(ingredient: Ingredient): boolean {
  return ingredient.stock <= ingredient.minStock;
}

export const categories = ['Proteínas', 'Vegetales', 'Lácteos', 'Panadería', 'Condimentos', 'Almacén', 'Frutas'];
export const recipeCategories = ['Principales', 'Pizzas', 'Ensaladas', 'Acompañamientos', 'Bebidas'];
export const units = ['kg', 'gr', 'lt', 'ml', 'unidad', 'porción', 'taza'];
