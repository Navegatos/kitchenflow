import { api } from '../client';
import type { BackendWasteRecord } from '../types';

export async function listWasteRecords(product_id?: string): Promise<BackendWasteRecord[]> {
  return api.get<BackendWasteRecord[]>('/waste/records', product_id ? { product_id } : undefined);
}

export async function createWasteRecord(data: {
  product_id: string;
  quantity: number;
  reason?: string;
  registered_by?: string;
}): Promise<BackendWasteRecord> {
  return api.post<BackendWasteRecord>('/waste/records', data);
}

export async function estimateWasteCost(product_id: string, quantity: number): Promise<{ estimated_cost: string }> {
  return api.get('/waste/estimate-cost', { product_id, quantity: String(quantity) });
}
