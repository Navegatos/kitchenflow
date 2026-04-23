import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle,
  ShoppingBag, ArrowUpRight, ArrowDownRight, Zap, ChefHat
} from 'lucide-react';
import {
  dailyFinancials, ingredients, recipes, salesRecords, wasteRecords,
  formatCurrency, getRecipeCost, getRecipeMargin, isLowStock
} from '../data/mockData';

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  title, value, change, changeLabel, icon: Icon, color, prefix
}: {
  title: string; value: string; change: number; changeLabel: string;
  icon: React.ElementType; color: string; prefix?: string;
}) {
  const isPositive = change >= 0;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          isPositive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{changeLabel}</p>
    </div>
  );
}

// ─── Alert Badge ──────────────────────────────────────────────────────────────

function AlertItem({ type, message }: { type: 'warning' | 'danger' | 'info'; message: string }) {
  const styles = {
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300',
    danger:  'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-300',
    info:    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300',
  };
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs ${styles[type]}`}>
      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
      {message}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-medium text-slate-600 dark:text-slate-300 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const today = dailyFinancials[dailyFinancials.length - 1];
  const yesterday = dailyFinancials[dailyFinancials.length - 2];
  const last7 = dailyFinancials.slice(-7);
  const last30 = dailyFinancials;

  const todaySales = salesRecords.filter(s => s.date === today.date);
  const todayWaste = wasteRecords.filter(w => w.date === today.date);
  const totalWasteCost = todayWaste.reduce((s, w) => s + w.cost, 0);

  const revenueChange = Math.round(((today.revenue - yesterday.revenue) / yesterday.revenue) * 100);
  const costChange = Math.round(((today.costs - yesterday.costs) / yesterday.costs) * 100);
  const profitChange = Math.round(((today.profit - yesterday.profit) / yesterday.profit) * 100);
  const margin = Math.round((today.profit / today.revenue) * 100);

  const lowStockItems = ingredients.filter(isLowStock);

  // Top products by revenue today
  const topProducts = recipes
    .map(r => {
      const sale = todaySales.find(s => s.recipeId === r.id);
      const qty = sale?.quantity || 0;
      const rev = sale?.revenue || 0;
      const cost = getRecipeCost(r) * qty;
      const margin = rev > 0 ? ((rev - cost) / rev) * 100 : 0;
      return { ...r, qty, rev, cost, margin };
    })
    .sort((a, b) => b.rev - a.rev)
    .slice(0, 6);

  // Cost breakdown pie
  const totalRevMonth = last30.reduce((s, d) => s + d.revenue, 0);
  const totalCostMonth = last30.reduce((s, d) => s + d.costs, 0);
  const totalWasteMonth = last30.reduce((s, d) => s + d.waste, 0);
  const totalProfitMonth = last30.reduce((s, d) => s + d.profit, 0);

  const pieData = [
    { name: 'Ganancia', value: totalProfitMonth, color: '#10b981' },
    { name: 'Costos',   value: totalCostMonth,   color: '#3b82f6' },
    { name: 'Merma',    value: totalWasteMonth,  color: '#f59e0b' },
  ];

  // Chart data
  const chartData = last7.map(d => ({
    date: d.date.slice(5),
    Ingresos: d.revenue,
    Costos: d.costs,
    Ganancia: d.profit,
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Buen día, Carlos 👋</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Resumen del negocio · 23 de Abril, 2026</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium border border-emerald-200 dark:border-emerald-800/50">
          <Zap className="w-3.5 h-3.5" />
          Toteat sincronizado · hace 5 min
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Ventas del Día"
          value={formatCurrency(today.revenue)}
          change={revenueChange}
          changeLabel="vs. ayer"
          icon={DollarSign}
          color="bg-blue-500"
        />
        <KPICard
          title="Costos del Día"
          value={formatCurrency(today.costs)}
          change={costChange}
          changeLabel="vs. ayer"
          icon={ShoppingBag}
          color="bg-amber-500"
        />
        <KPICard
          title="Ganancia Neta"
          value={formatCurrency(today.profit)}
          change={profitChange}
          changeLabel="vs. ayer"
          icon={TrendingUp}
          color="bg-emerald-500"
        />
        <KPICard
          title="Margen del Día"
          value={`${margin}%`}
          change={2}
          changeLabel="vs. promedio semanal"
          icon={Package}
          color="bg-violet-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ingresos vs Costos</h3>
              <p className="text-xs text-slate-400 mt-0.5">Últimos 7 días</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Ingresos</span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Costos</span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Ganancia</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="ingresosGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gananciaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Ingresos" stroke="#3b82f6" strokeWidth={2} fill="url(#ingresosGrad)" />
              <Area type="monotone" dataKey="Costos"   stroke="#f87171" strokeWidth={2} fill="none" strokeDasharray="4 2" />
              <Area type="monotone" dataKey="Ganancia" stroke="#10b981" strokeWidth={2} fill="url(#gananciaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Distribución Mensual</h3>
            <p className="text-xs text-slate-400 mt-0.5">Últimos 30 días</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
                </div>
                <span className="font-medium text-slate-800 dark:text-white">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top products */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Top Productos — Hoy</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/50">
                  <th className="text-left px-5 py-3 text-slate-400 font-medium">Producto</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Uds.</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Ingresos</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Costo</th>
                  <th className="text-right px-5 py-3 text-slate-400 font-medium">Margen</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, idx) => (
                  <tr key={p.id} className="border-b border-slate-50 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-slate-400 w-4">#{idx + 1}</span>
                        <span className="font-medium text-slate-800 dark:text-white">{p.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">{p.category}</span>
                      </div>
                    </td>
                    <td className="text-right px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{p.qty}</td>
                    <td className="text-right px-4 py-3 text-blue-600 dark:text-blue-400 font-medium">{formatCurrency(p.rev)}</td>
                    <td className="text-right px-4 py-3 text-slate-500 dark:text-slate-400">{formatCurrency(p.cost)}</td>
                    <td className="text-right px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.margin >= 70 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        p.margin >= 50 ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                         'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {p.margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Alertas Activas</h3>
            <span className="ml-auto bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium px-2 py-0.5 rounded-full">
              {lowStockItems.length + 1}
            </span>
          </div>
          <div className="space-y-2">
            {lowStockItems.slice(0, 4).map(item => (
              <AlertItem
                key={item.id}
                type={item.stock === 0 ? 'danger' : 'warning'}
                message={`${item.name}: ${item.stock} ${item.unit} (mín. ${item.minStock})`}
              />
            ))}
            {totalWasteCost > 3000 && (
              <AlertItem type="danger" message={`Merma alta hoy: ${formatCurrency(totalWasteCost)}`} />
            )}
            {lowStockItems.length === 0 && totalWasteCost === 0 && (
              <div className="text-center py-6 text-sm text-slate-400">
                ✅ Sin alertas activas
              </div>
            )}
          </div>

          {/* Monthly summary */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 space-y-3">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Resumen del mes</p>
            {[
              { label: 'Ingresos totales', value: formatCurrency(totalRevMonth), color: 'text-blue-600' },
              { label: 'Costos totales',   value: formatCurrency(totalCostMonth), color: 'text-red-500' },
              { label: 'Merma total',      value: formatCurrency(totalWasteMonth), color: 'text-amber-500' },
              { label: 'Ganancia neta',    value: formatCurrency(totalProfitMonth), color: 'text-emerald-600' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                <span className={`font-semibold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
