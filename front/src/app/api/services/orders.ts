import { api } from '../client';
import type { BackendOrder, BackendOrderStatus } from '../types';

export async function listOrders(status?: BackendOrderStatus): Promise<BackendOrder[]> {
  return api.get<BackendOrder[]>('/orders', status ? { status } : undefined);
}

export async function getOrder(orderId: string): Promise<BackendOrder> {
  return api.get<BackendOrder>(`/orders/${orderId}`);
}

export async function createOrder(data: {
  created_by?: string;
  notes?: string;
  items: Array<{ recipe_id: string; quantity: number }>;
}): Promise<BackendOrder> {
  return api.post<BackendOrder>('/orders', data);
}

export async function updateOrderStatus(
  orderId: string,
  status: BackendOrderStatus,
  actor_user_id?: string,
): Promise<BackendOrder> {
  return api.patch<BackendOrder>(`/orders/${orderId}/status`, {
    status,
    ...(actor_user_id ? { actor_user_id } : {}),
  });
}

export async function aggregateSales(): Promise<Array<{
  recipe_id: string;
  recipe_name: string;
  quantity_sold: number;
  revenue?: string | null;
}>> {
  return api.get('/reports/sales-aggregate');
}
