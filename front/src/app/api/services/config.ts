import { api } from '../client';

export interface BackendBranch {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  active: boolean;
}

export interface BackendRecipeCategory {
  id: string;
  name: string;
  sort_order: number;
  active: boolean;
}

export interface BackendProductUnit {
  id: string;
  code: string;
  label: string;
  sort_order: number;
  active: boolean;
}

export interface BackendWasteReason {
  id: string;
  name: string;
  sort_order: number;
  active: boolean;
}

export interface LookupOption {
  value: string;
  label: string;
  sort_order: number;
}

export async function listBranches(): Promise<BackendBranch[]> {
  return api.get<BackendBranch[]>('/branches');
}

export async function listRecipeCategories(): Promise<BackendRecipeCategory[]> {
  return api.get<BackendRecipeCategory[]>('/recipe-categories');
}

export async function listProductUnits(): Promise<BackendProductUnit[]> {
  return api.get<BackendProductUnit[]>('/product-units');
}

export async function listWasteReasons(): Promise<BackendWasteReason[]> {
  return api.get<BackendWasteReason[]>('/waste/reasons');
}

export async function listLookupOptions(group?: string): Promise<LookupOption[] | Record<string, LookupOption[]>> {
  return api.get('/lookup-options', group ? { group } : undefined);
}
