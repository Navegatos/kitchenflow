import { api } from '../client';
import type { BackendCategory, BackendProduct, BackendSupplier } from '../types';

export async function listCategories(): Promise<BackendCategory[]> {
  return api.get<BackendCategory[]>('/categories');
}

export async function createCategory(data: { name: string; description?: string }): Promise<BackendCategory> {
  return api.post<BackendCategory>('/categories', data);
}

export async function listSuppliers(status?: string): Promise<BackendSupplier[]> {
  return api.get<BackendSupplier[]>('/suppliers', status ? { status } : undefined);
}

export async function listProducts(params?: {
  category_id?: string;
  supplier_id?: string;
  active_only?: boolean;
  low_stock?: boolean;
}): Promise<BackendProduct[]> {
  return api.get<BackendProduct[]>('/products', params);
}

export async function getProduct(productId: string): Promise<BackendProduct> {
  return api.get<BackendProduct>(`/products/${productId}`);
}

export async function createProduct(data: {
  name: string;
  unit: string;
  cost_price: number;
  sale_price?: number;
  sku?: string;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  minimum_stock?: number;
  initial_stock?: number;
}): Promise<BackendProduct> {
  return api.post<BackendProduct>('/products', data);
}

export async function updateProduct(
  productId: string,
  data: Partial<{
    name: string;
    unit: string;
    cost_price: number;
    sale_price: number;
    sku: string;
    description: string;
    category_id: string;
    supplier_id: string;
    minimum_stock: number;
    active: boolean;
  }>,
): Promise<BackendProduct> {
  return api.patch<BackendProduct>(`/products/${productId}`, data);
}
