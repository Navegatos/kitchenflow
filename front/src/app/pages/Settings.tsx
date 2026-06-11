import React, { useEffect, useState } from 'react';
import {
  Building2, DollarSign, Zap, Bell, Shield,
  Save, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, configApi, settingsApi } from '../api';
import type { AppSettingsResponse } from '../api/services/settings';
import type { LookupOption } from '../api/services/config';

function Section({ title, description, icon: Icon, children }: {
  title: string; description: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function FormField({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 py-3.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
      <div className="sm:w-48 flex-shrink-0">
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettingsResponse | null>(null);
  const [businessCategories, setBusinessCategories] = useState<LookupOption[]>([]);
  const [currencies, setCurrencies] = useState<LookupOption[]>([]);
  const [syncOptions, setSyncOptions] = useState<LookupOption[]>([]);

  useEffect(() => {
    Promise.all([
      settingsApi.getSettings(),
      configApi.listLookupOptions('business_category') as Promise<LookupOption[]>,
      configApi.listLookupOptions('currency') as Promise<LookupOption[]>,
      configApi.listLookupOptions('toteat_sync') as Promise<LookupOption[]>,
    ])
      .then(([s, cats, currs, sync]) => {
        setSettings(s);
        setBusinessCategories(cats);
        setCurrencies(currs);
        setSyncOptions(sync);
      })
      .catch(error => {
        toast.error(error instanceof ApiError ? error.message : 'No se pudo cargar la configuración');
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSection = async (
    section: 'business' | 'financial' | 'integrations' | 'notifications',
    label: string,
  ) => {
    if (!settings) return;
    setSaving(section);
    try {
      const updated = await settingsApi.updateSettings({ [section]: settings[section] });
      setSettings(updated);
      toast.success(`${label} guardado correctamente`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Error al guardar');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando configuración…
      </div>
    );
  }

  if (!settings) {
    return <p className="p-6 text-sm text-slate-500">No hay configuración disponible.</p>;
  }

  const { business, financial, integrations, notifications } = settings;

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Configuración</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Parámetros del negocio e integraciones</p>
      </div>

      <Section title="Datos del Negocio" description="Información general de tu restaurante" icon={Building2}>
        <FormField label="Nombre del negocio">
          <input type="text" value={business.name} onChange={e => setSettings(p => p && ({ ...p, business: { ...p.business, name: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30" />
        </FormField>
        <FormField label="Dirección">
          <input type="text" value={business.address || ''} onChange={e => setSettings(p => p && ({ ...p, business: { ...p.business, address: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30" />
        </FormField>
        <FormField label="Teléfono">
          <input type="tel" value={business.phone || ''} onChange={e => setSettings(p => p && ({ ...p, business: { ...p.business, phone: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none" />
        </FormField>
        <FormField label="Correo de contacto">
          <input type="email" value={business.email || ''} onChange={e => setSettings(p => p && ({ ...p, business: { ...p.business, email: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none" />
        </FormField>
        <FormField label="RUT / ID Tributario">
          <input type="text" value={business.rut || ''} onChange={e => setSettings(p => p && ({ ...p, business: { ...p.business, rut: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none" />
        </FormField>
        <FormField label="Tipo de negocio">
          <select value={business.category || ''} onChange={e => setSettings(p => p && ({ ...p, business: { ...p.business, category: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
            {businessCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </FormField>
        <div className="mt-4">
          <button onClick={() => saveSection('business', 'Datos del negocio')} disabled={saving === 'business'} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors">
            {saving === 'business' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar cambios
          </button>
        </div>
      </Section>

      <Section title="Configuración Financiera" description="Moneda, impuestos y alertas de rentabilidad" icon={DollarSign}>
        <FormField label="Moneda" sub="Moneda principal del negocio">
          <select value={financial.currency} onChange={e => setSettings(p => p && ({ ...p, financial: { ...p.financial, currency: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
            {currencies.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </FormField>
        <FormField label="Nombre del impuesto" sub="Ej: IVA, IGV, ISR">
          <input type="text" value={financial.tax_name} onChange={e => setSettings(p => p && ({ ...p, financial: { ...p.financial, tax_name: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" />
        </FormField>
        <FormField label="Tasa de impuesto (%)" sub="Porcentaje aplicado a ventas">
          <input type="number" value={financial.tax_rate} onChange={e => setSettings(p => p && ({ ...p, financial: { ...p.financial, tax_rate: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" min="0" max="100" />
        </FormField>
        <FormField label="Precios incluyen IVA" sub="Los precios de venta incluyen impuestos">
          <Toggle checked={financial.include_vat} onChange={() => setSettings(p => p && ({ ...p, financial: { ...p.financial, include_vat: !p.financial.include_vat } }))} />
        </FormField>
        <FormField label="Margen objetivo (%)" sub="Alerta si el margen cae por debajo">
          <input type="number" value={financial.margin_target} onChange={e => setSettings(p => p && ({ ...p, financial: { ...p.financial, margin_target: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" min="0" max="100" />
        </FormField>
        <FormField label="Alerta de merma (%)" sub="Porcentaje de merma sobre ventas para alertar">
          <input type="number" value={financial.waste_alert} onChange={e => setSettings(p => p && ({ ...p, financial: { ...p.financial, waste_alert: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" min="0" max="100" />
        </FormField>
        <div className="mt-4">
          <button onClick={() => saveSection('financial', 'Configuración financiera')} disabled={saving === 'financial'} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors">
            {saving === 'financial' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar cambios
          </button>
        </div>
      </Section>

      <Section title="Integración Toteat" description="Configuración de sincronización de ventas" icon={Zap}>
        <FormField label="Estado de integración">
          <div className="flex items-center gap-3">
            <Toggle checked={integrations.toteat_enabled} onChange={() => setSettings(p => p && ({ ...p, integrations: { ...p.integrations, toteat_enabled: !p.integrations.toteat_enabled } }))} />
            <span className={`text-xs font-medium ${integrations.toteat_enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {integrations.toteat_enabled ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </FormField>
        <FormField label="API Key de Toteat" sub="Tu clave de acceso a la API">
          <input type="password" value={integrations.toteat_api_key || ''} onChange={e => setSettings(p => p && ({ ...p, integrations: { ...p.integrations, toteat_api_key: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none font-mono" />
        </FormField>
        <FormField label="Sincronización" sub="Frecuencia de actualización de datos">
          <select value={integrations.toteat_sync} onChange={e => setSettings(p => p && ({ ...p, integrations: { ...p.integrations, toteat_sync: e.target.value } }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
            {syncOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </FormField>
        <FormField label="Webhook URL" sub="Para recibir eventos en tiempo real">
          <input type="url" value={integrations.webhook_url || ''} readOnly className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-xs font-mono text-slate-500 outline-none" />
        </FormField>
        <div className="mt-4">
          <button onClick={() => saveSection('integrations', 'Integración Toteat')} disabled={saving === 'integrations'} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors">
            {saving === 'integrations' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar
          </button>
        </div>
      </Section>

      <Section title="Notificaciones" description="Configura cuándo y cómo recibir alertas" icon={Bell}>
        {([
          ['low_stock', 'Stock bajo', 'Alertar cuando un ingrediente llegue al mínimo'],
          ['high_waste', 'Merma alta', 'Alertar cuando la merma supere el umbral configurado'],
          ['daily_report', 'Reporte diario', 'Resumen automático al cierre del día'],
          ['weekly_report', 'Reporte semanal', 'Análisis comparativo semanal por correo'],
          ['profit_alert', 'Alerta de rentabilidad', 'Notificar si el margen cae bajo el objetivo'],
        ] as const).map(([key, label, sub]) => (
          <FormField key={key} label={label} sub={sub}>
            <Toggle
              checked={notifications[key]}
              onChange={() => setSettings(p => p && ({
                ...p,
                notifications: { ...p.notifications, [key]: !p.notifications[key] },
              }))}
            />
          </FormField>
        ))}
        <div className="mt-4">
          <button onClick={() => saveSection('notifications', 'Notificaciones')} disabled={saving === 'notifications'} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors">
            {saving === 'notifications' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Guardar cambios
          </button>
        </div>
      </Section>

      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-400">Zona de Peligro</h3>
        </div>
        <p className="text-xs text-red-600 dark:text-red-400 mb-4">Estas acciones son irreversibles y pueden afectar todos los datos del sistema.</p>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            Limpiar historial de movimientos
          </button>
          <button className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            Restablecer datos de prueba
          </button>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors">
            Eliminar cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
