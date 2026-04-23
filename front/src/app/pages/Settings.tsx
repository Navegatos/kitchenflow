import React, { useState } from 'react';
import {
  Settings, Building2, DollarSign, Zap, Bell, Shield,
  Save, CheckCircle, Globe, Tag, Percent, Link
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [business, setBusiness] = useState({
    name: 'KitchenFlow Demo Restaurant',
    address: 'Av. Providencia 1234, Santiago',
    phone: '+56 9 8765 4321',
    email: 'contacto@mirestaurante.cl',
    rut: '76.543.210-K',
    category: 'Restaurante',
  });

  const [financial, setFinancial] = useState({
    currency: 'CLP',
    taxRate: '19',
    taxName: 'IVA',
    includeVat: true,
    margin_target: '65',
    waste_alert: '5',
  });

  const [integrations, setIntegrations] = useState({
    toteatEnabled: true,
    toteatApiKey: 'tk_live_••••••••••••••••',
    toteatSync: 'auto',
    webhookUrl: 'https://api.kitchenflow.app/webhook/toteat',
  });

  const [notifications, setNotifications] = useState({
    lowStock: true,
    highWaste: true,
    dailyReport: true,
    weeklyReport: false,
    profitAlert: true,
  });

  const handleSave = (section: string) => {
    toast.success(`${section} guardado correctamente`);
  };

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Configuración</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Parámetros del negocio e integraciones</p>
      </div>

      {/* Business info */}
      <Section title="Datos del Negocio" description="Información general de tu restaurante" icon={Building2}>
        <FormField label="Nombre del negocio">
          <input type="text" value={business.name} onChange={e => setBusiness(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30" />
        </FormField>
        <FormField label="Dirección">
          <input type="text" value={business.address} onChange={e => setBusiness(p => ({ ...p, address: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30" />
        </FormField>
        <FormField label="Teléfono">
          <input type="tel" value={business.phone} onChange={e => setBusiness(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none" />
        </FormField>
        <FormField label="Correo de contacto">
          <input type="email" value={business.email} onChange={e => setBusiness(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none" />
        </FormField>
        <FormField label="RUT / ID Tributario">
          <input type="text" value={business.rut} onChange={e => setBusiness(p => ({ ...p, rut: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none" />
        </FormField>
        <FormField label="Tipo de negocio">
          <select value={business.category} onChange={e => setBusiness(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
            {['Restaurante', 'Bar', 'Café', 'Panadería', 'Fast Food', 'Food Truck'].map(c => <option key={c}>{c}</option>)}
          </select>
        </FormField>
        <div className="mt-4">
          <button onClick={() => handleSave('Datos del negocio')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Save className="w-3.5 h-3.5" />
            Guardar cambios
          </button>
        </div>
      </Section>

      {/* Financial config */}
      <Section title="Configuración Financiera" description="Moneda, impuestos y alertas de rentabilidad" icon={DollarSign}>
        <FormField label="Moneda" sub="Moneda principal del negocio">
          <select value={financial.currency} onChange={e => setFinancial(p => ({ ...p, currency: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white outline-none">
            {['CLP', 'USD', 'EUR', 'MXN', 'ARS', 'COP'].map(c => <option key={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="Nombre del impuesto" sub="Ej: IVA, IGV, ISR">
          <input type="text" value={financial.taxName} onChange={e => setFinancial(p => ({ ...p, taxName: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" />
        </FormField>
        <FormField label="Tasa de impuesto (%)" sub="Porcentaje aplicado a ventas">
          <input type="number" value={financial.taxRate} onChange={e => setFinancial(p => ({ ...p, taxRate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" min="0" max="100" />
        </FormField>
        <FormField label="Precios incluyen IVA" sub="Los precios de venta incluyen impuestos">
          <Toggle checked={financial.includeVat} onChange={() => setFinancial(p => ({ ...p, includeVat: !p.includeVat }))} />
        </FormField>
        <FormField label="Margen objetivo (%)" sub="Alerta si el margen cae por debajo">
          <input type="number" value={financial.margin_target} onChange={e => setFinancial(p => ({ ...p, margin_target: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" min="0" max="100" />
        </FormField>
        <FormField label="Alerta de merma (%)" sub="Porcentaje de merma sobre ventas para alertar">
          <input type="number" value={financial.waste_alert} onChange={e => setFinancial(p => ({ ...p, waste_alert: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none" min="0" max="100" />
        </FormField>
        <div className="mt-4">
          <button onClick={() => handleSave('Configuración financiera')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Save className="w-3.5 h-3.5" />
            Guardar cambios
          </button>
        </div>
      </Section>

      {/* Toteat integration */}
      <Section title="Integración Toteat" description="Configuración de sincronización de ventas" icon={Zap}>
        <FormField label="Estado de integración">
          <div className="flex items-center gap-3">
            <Toggle checked={integrations.toteatEnabled} onChange={() => setIntegrations(p => ({ ...p, toteatEnabled: !p.toteatEnabled }))} />
            <span className={`text-xs font-medium ${integrations.toteatEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {integrations.toteatEnabled ? '✅ Conectado' : 'Desconectado'}
            </span>
          </div>
        </FormField>
        <FormField label="API Key de Toteat" sub="Tu clave de acceso a la API">
          <div className="flex gap-2">
            <input type="password" value={integrations.toteatApiKey} onChange={e => setIntegrations(p => ({ ...p, toteatApiKey: e.target.value }))} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none font-mono" />
            <button className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Validar</button>
          </div>
        </FormField>
        <FormField label="Sincronización" sub="Frecuencia de actualización de datos">
          <select value={integrations.toteatSync} onChange={e => setIntegrations(p => ({ ...p, toteatSync: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none">
            <option value="auto">Automática (cada 5 min)</option>
            <option value="15min">Cada 15 minutos</option>
            <option value="hourly">Cada hora</option>
            <option value="manual">Manual</option>
          </select>
        </FormField>
        <FormField label="Webhook URL" sub="Para recibir eventos en tiempo real">
          <input type="url" value={integrations.webhookUrl} readOnly className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-xs font-mono text-slate-500 outline-none" />
        </FormField>
        <div className="mt-4 flex gap-2">
          <button onClick={() => handleSave('Integración Toteat')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Save className="w-3.5 h-3.5" />
            Guardar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Zap className="w-3.5 h-3.5" />
            Sincronizar ahora
          </button>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notificaciones" description="Configura cuándo y cómo recibir alertas" icon={Bell}>
        {Object.entries({
          lowStock:     { label: 'Stock bajo',            sub: 'Alertar cuando un ingrediente llegue al mínimo' },
          highWaste:    { label: 'Merma alta',            sub: 'Alertar cuando la merma supere el umbral configurado' },
          dailyReport:  { label: 'Reporte diario',        sub: 'Resumen automático al cierre del día' },
          weeklyReport: { label: 'Reporte semanal',       sub: 'Análisis comparativo semanal por correo' },
          profitAlert:  { label: 'Alerta de rentabilidad',sub: 'Notificar si el margen cae bajo el objetivo' },
        }).map(([key, { label, sub }]) => (
          <FormField key={key} label={label} sub={sub}>
            <Toggle
              checked={(notifications as any)[key]}
              onChange={() => setNotifications(p => ({ ...p, [key]: !(p as any)[key] }))}
            />
          </FormField>
        ))}
        <div className="mt-4">
          <button onClick={() => handleSave('Notificaciones')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Save className="w-3.5 h-3.5" />
            Guardar cambios
          </button>
        </div>
      </Section>

      {/* Danger zone */}
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
