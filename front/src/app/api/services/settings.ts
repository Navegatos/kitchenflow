import { api } from '../client';

export interface AppSettingsResponse {
  id: string;
  business: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    rut?: string | null;
    category?: string | null;
  };
  financial: {
    currency: string;
    tax_rate: string;
    tax_name: string;
    include_vat: boolean;
    margin_target: string;
    waste_alert: string;
  };
  integrations: {
    toteat_enabled: boolean;
    toteat_api_key?: string | null;
    toteat_sync: string;
    webhook_url?: string | null;
  };
  notifications: {
    low_stock: boolean;
    high_waste: boolean;
    daily_report: boolean;
    weekly_report: boolean;
    profit_alert: boolean;
  };
  updated_at?: string | null;
}

export async function getSettings(): Promise<AppSettingsResponse> {
  return api.get<AppSettingsResponse>('/settings');
}

export async function updateSettings(body: Partial<{
  business: AppSettingsResponse['business'];
  financial: AppSettingsResponse['financial'];
  integrations: AppSettingsResponse['integrations'];
  notifications: AppSettingsResponse['notifications'];
}>): Promise<AppSettingsResponse> {
  return api.patch<AppSettingsResponse>('/settings', body);
}
