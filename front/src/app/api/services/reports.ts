import { api } from '../client';
import type { DailyFinanceRow, DashboardSummary } from '../types';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return api.get<DashboardSummary>('/reports/dashboard/summary');
}

export async function getFinanceDailyRange(from_date: string, to_date: string): Promise<DailyFinanceRow[]> {
  return api.get<DailyFinanceRow[]>('/reports/finance/daily-range', { from_date, to_date });
}

export async function getRecipeMargins(limit = 20) {
  return api.get('/reports/margins/recipes', { limit });
}

export async function getSupplierSpend(supplier_id?: string) {
  return api.get('/reports/suppliers/spend', supplier_id ? { supplier_id } : undefined);
}

export async function exportReportCsv(kind: string, from_date: string, to_date: string): Promise<string> {
  return api.get<string>(`/reports/export/${kind}`, { from_date, to_date });
}
