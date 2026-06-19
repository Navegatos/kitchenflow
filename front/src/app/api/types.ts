/** Tipos alineados con las respuestas JSON del backend FastAPI. */

export type BackendRole = 'ADMIN' | 'MANAGER' | 'CHEF' | 'WAITER';
export type BackendMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'WASTE';
export type BackendOrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
export type BackendRecipeStatus = 'ACTIVE' | 'INACTIVE';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  sub: string;
  email: string;
  first_name: string;
  last_name: string;
  role: BackendRole;
  branch_id?: string | null;
  branch_name?: string | null;
  exp?: string;
}

export interface BackendUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: BackendRole;
  branch_id?: string | null;
  branch_name?: string | null;
  active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BackendCategory {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string | null;
}

export interface BackendSupplier {
  id: string;
  name: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status?: string;
  created_at?: string | null;
}

export interface BackendProduct {
  id: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  unit: string;
  stock?: string | null;
  minimum_stock?: string | null;
  cost_price?: string | null;
  sale_price?: string | null;
  active?: boolean;
  category_id?: string | null;
  supplier_id?: string | null;
  category_name?: string | null;
  supplier_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BackendInventoryMovement {
  id: string;
  product_id: string;
  product_name?: string | null;
  user_id?: string | null;
  user_email?: string | null;
  movement_type: BackendMovementType;
  quantity?: string | null;
  previous_stock?: string | null;
  new_stock?: string | null;
  notes?: string | null;
  created_at?: string | null;
}

export interface BackendRecipeIngredient {
  id?: string;
  product_id: string;
  product_name?: string | null;
  quantity?: string | null;
  unit?: string | null;
}

export interface BackendRecipe {
  id: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  preparation_time_minutes?: number | null;
  sale_price?: string | null;
  status?: BackendRecipeStatus;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  ingredients?: BackendRecipeIngredient[];
}

export interface BackendOrderItem {
  id: string;
  recipe_id: string;
  recipe_name?: string | null;
  quantity: number;
  unit_price?: string | null;
  subtotal?: string | null;
}

export interface BackendOrder {
  id: string;
  order_number?: number | null;
  status?: BackendOrderStatus;
  total_amount?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  items?: BackendOrderItem[];
}

export interface BackendWasteRecord {
  id: string;
  product_id: string;
  product_name?: string | null;
  quantity?: string | null;
  reason?: string | null;
  registered_by?: string | null;
  registered_by_email?: string | null;
  created_at?: string | null;
}

export interface DashboardSummary {
  pending_orders: number;
  products_low_stock: number;
  waste_records_total: number;
  delivered_revenue_total?: string | null;
}

export interface DailyFinanceRow {
  date: string;
  revenue?: string | null;
  waste_cost?: string | null;
  estimated_profit?: string | null;
}

export interface SalesAggregateRow {
  recipe_id: string;
  recipe_name: string;
  category_id?: string | null;
  category_name?: string | null;
  quantity_sold: number;
  revenue?: string | null;
  unit_cost?: string | null;
  total_cost?: string | null;
  profit?: string | null;
  margin_percent?: string | null;
}
