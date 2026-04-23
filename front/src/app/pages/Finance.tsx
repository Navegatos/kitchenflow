import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Download, Calendar
} from 'lucide-react';
import {
  dailyFinancials, recipes, salesRecords, wasteRecords,
  formatCurrency, getRecipeCost, getRecipeMargin
} from '../data/mockData';

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

function StatCard({ title, value, sub, trend, trendLabel, color }: {
  title: string; value: string; sub?: string; trend?: number; trendLabel?: string; color: 'blue' | 'red' | 'emerald' | 'amber';
}) {
  const colorMap = {
    blue:    { bg: 'bg-blue-50 dark:bg-blue-900/20',    text: 'text-blue-700 dark:text-blue-400',    border: 'border-blue-100 dark:border-blue-800/30' },
    red:     { bg: 'bg-red-50 dark:bg-red-900/20',      text: 'text-red-700 dark:text-red-400',      border: 'border-red-100 dark:border-red-800/30' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800/30' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-700 dark:text-amber-400',  border: 'border-amber-100 dark:border-amber-800/30' },
  };
  const c = colorMap[color];
  return (
    <div className={`rounded-xl p-4 border ${c.bg} ${c.border}`}>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <p className={`text-xl font-semibold ${c.text}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      {trend !== undefined && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}% {trendLabel}
        </div>
      )}
    </div>
  );
}

export default function Finance() {
  const [period, setPeriod] = useState<'7d' | '30d'>('30d');

  const data = period === '7d' ? dailyFinancials.slice(-7) : dailyFinancials;

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalCosts = data.reduce((s, d) => s + d.costs, 0);
  const totalWaste = data.reduce((s, d) => s + d.waste, 0);
  const totalProfit = data.reduce((s, d) => s + d.profit, 0);
  const avgMargin = Math.round((totalProfit / totalRevenue) * 100);

  const chartData = data.map(d => ({
    date: d.date.slice(5),
    Ingresos: d.revenue,
    Costos: d.costs,
    Ganancia: d.profit,
    Merma: d.waste,
  }));

  // Product profitability
  const productProfitability = recipes.map(r => {
    const daySales = salesRecords.filter(s => {
      const inPeriod = period === '7d'
        ? data.some(d => d.date === s.date)
        : true;
      return s.recipeId === r.id && inPeriod;
    });
    const qty = daySales.reduce((s, sale) => s + sale.quantity, 0);
    const revenue = daySales.reduce((s, sale) => s + sale.revenue, 0);
    const cost = getRecipeCost(r) * qty;
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { id: r.id, name: r.name, category: r.category, qty, revenue, cost, profit, margin };
  }).sort((a, b) => b.profit - a.profit);

  // Cost breakdown
  const ingredientCosts = totalCosts * 0.78;
  const wasteShare = totalWaste;
  const otherCosts = totalCosts * 0.22;

  const pieData = [
    { name: 'Ingredientes', value: Math.round(ingredientCosts), color: '#3b82f6' },
    { name: 'Merma',        value: Math.round(wasteShare),      color: '#f59e0b' },
    { name: 'Otros',        value: Math.round(otherCosts),      color: '#8b5cf6' },
  ];

  // P&L table data
  const plItems = [
    { label: 'Ventas Totales', value: totalRevenue, type: 'income', bold: true },
    { label: '  Hamburguesa Clásica', value: productProfitability.find(p => p.id === 'r1')?.revenue || 0, type: 'income' },
    { label: '  Pizza Margherita',   value: productProfitability.find(p => p.id === 'r3')?.revenue || 0, type: 'income' },
    { label: '  Otros productos',    value: productProfitability.filter(p => !['r1','r3'].includes(p.id)).reduce((s,p) => s+p.revenue,0), type: 'income' },
    { label: 'Costos de Producción', value: -totalCosts, type: 'expense', bold: true },
    { label: '  Ingredientes',       value: -Math.round(ingredientCosts), type: 'expense' },
    { label: '  Merma',             value: -Math.round(wasteShare), type: 'expense' },
    { label: '  Otros costos',      value: -Math.round(otherCosts), type: 'expense' },
    { label: 'GANANCIA NETA', value: totalProfit, type: totalProfit >= 0 ? 'profit' : 'loss', bold: true },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Finanzas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Estado de resultados y flujo financiero</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(['7d', '30d'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === p
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {p === '7d' ? 'Últimos 7 días' : 'Último mes'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium hover:border-slate-300 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ingresos Totales" value={formatCurrency(totalRevenue)} color="blue" trend={8} trendLabel="vs período anterior" />
        <StatCard title="Costos Totales" value={formatCurrency(totalCosts)} color="red" trend={3} trendLabel="vs período anterior" />
        <StatCard title="Ganancia Neta" value={formatCurrency(totalProfit)} color="emerald" trend={12} trendLabel="vs período anterior" />
        <StatCard title="Merma Total" value={formatCurrency(totalWaste)} sub={`${((totalWaste/totalRevenue)*100).toFixed(1)}% de ventas`} color="amber" trend={-5} trendLabel="vs período anterior" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Flujo Financiero</h3>
              <p className="text-xs text-slate-400 mt-0.5">{period === '7d' ? 'Últimos 7 días' : 'Últimos 30 días'}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={period === '30d' ? 4 : 0} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Ingresos"  stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="Costos"    stroke="#f87171" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
              <Area type="monotone" dataKey="Ganancia"  stroke="#10b981" strokeWidth={2} fill="url(#profGrad)" />
              <Area type="monotone" dataKey="Merma"     stroke="#f59e0b" strokeWidth={1.5} fill="none" strokeDasharray="2 2" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-2 justify-center text-xs">
            {[
              { color: '#3b82f6', label: 'Ingresos' },
              { color: '#f87171', label: 'Costos' },
              { color: '#10b981', label: 'Ganancia' },
              { color: '#f59e0b', label: 'Merma' },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Pie breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Desglose de Costos</h3>
          <p className="text-xs text-slate-400 mb-4">Composición del gasto</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2.5 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{((d.value / totalCosts) * 100).toFixed(0)}%</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(d.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* P&L Statement */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Estado de Resultados</h3>
            <p className="text-xs text-slate-400 mt-0.5">{period === '7d' ? 'Últimos 7 días' : 'Últimos 30 días'}</p>
          </div>
          <div className="p-5">
            <table className="w-full text-xs">
              <tbody>
                {plItems.map((item, idx) => (
                  <tr key={idx} className={`${idx > 0 && item.bold ? 'border-t-2 border-slate-200 dark:border-slate-600 mt-2' : ''}`}>
                    <td className={`py-2 ${item.bold ? 'font-semibold' : 'pl-4'} ${
                      item.type === 'profit' ? 'text-emerald-700 dark:text-emerald-400' :
                      item.type === 'loss' ? 'text-red-700 dark:text-red-400' :
                      item.bold ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {item.label}
                    </td>
                    <td className={`py-2 text-right font-${item.bold ? 'semibold' : 'normal'} ${
                      item.type === 'income'  ? 'text-blue-600 dark:text-blue-400' :
                      item.type === 'expense' ? 'text-red-500 dark:text-red-400' :
                      item.type === 'profit'  ? 'text-emerald-600 dark:text-emerald-400' :
                      item.type === 'loss'    ? 'text-red-600 dark:text-red-400' : ''
                    }`}>
                      {item.value >= 0 ? formatCurrency(item.value) : `(${formatCurrency(Math.abs(item.value))})`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product profitability */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Rentabilidad por Producto</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ordenado por ganancia total</p>
          </div>
          <div className="p-4 space-y-3">
            {productProfitability.slice(0, 6).map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-4">#{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-800 dark:text-white truncate">{p.name}</span>
                    <span className={`text-xs font-semibold ${p.margin >= 70 ? 'text-emerald-600 dark:text-emerald-400' : p.margin >= 50 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {p.margin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.margin >= 70 ? 'bg-emerald-500' : p.margin >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, p.margin)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-slate-400">
                    <span>{p.qty} uds · {formatCurrency(p.revenue)}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(p.profit)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
