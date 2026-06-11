import { api } from '../client';
import type { BackendInventoryMovement, BackendMovementType } from '../types';

export async function listMovements(params?: {
  product_id?: string;
  limit?: number;
  offset?: number;
}): Promise<BackendInventoryMovement[]> {
  return api.get<BackendInventoryMovement[]>('/inventory/movements', params);
}

export async function createMovement(data: {
  product_id: string;
  actor_user_id: string;
  movement_type: BackendMovementType;
  quantity: number;
  notes?: string;
}): Promise<BackendInventoryMovement> {
  return api.post<BackendInventoryMovement>('/inventory/movements', data);
}

export async function listLowStockProducts() {
  return api.get('/inventory/alerts/low-stock');
}
