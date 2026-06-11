import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Download, Loader2
} from 'lucide-react';
import { formatCurrency, dateRangeDays, mapFinanceRows, parseDecimal, type DailyFinancial } from '../data/mockData';
import { ordersApi, reportsApi } from '../api';

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

function StatCard({ title, value, sub, color }: {
  title: string; value: string; sub?: string; color: 'blue' | 'red' | 'emerald' | 'amber';
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
    </div>
  );
}

export default function Finance() {
  const [period, setPeriod] = useState<'7d' | '30d'>('30d');
  const [data, setData] = useState<DailyFinancial[]>([]);
  const [productProfitability, setProductProfitability] = useState<Array<{
    id: string; name: string; qty: number; revenue: number; margin: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const days = period === '7d' ? 7 : 30;
    const { from, to } = dateRangeDays(days);

    Promise.all([
      reportsApi.getFinanceDailyRange(from, to),
      ordersApi.aggregateSales(),
      reportsApi.getRecipeMargins(20),
    ])
      .then(([financeRows, sales, margins]) => {
        if (cancelled) return;
        setData(mapFinanceRows(financeRows));
        const marginById = new Map(margins.map((m: { recipe_id: string; margin_percent: string }) => [m.recipe_id, parseDecimal(m.margin_percent)]));
        setProductProfitability(
          sales.map(row => ({
            id: row.recipe_id,
            name: row.recipe_name,
            qty: row.quantity_sold,
            revenue: parseDecimal(row.revenue),
            margin: marginById.get(row.recipe_id) ?? 0,
          })).sort((a, b) => b.revenue - a.revenue),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [period]);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalCosts = data.reduce((s, d) => s + d.costs, 0);
  const totalWaste = data.reduce((s, d) => s + d.waste, 0);
  const totalProfit = data.reduce((s, d) => s + d.profit, 0);

  const chartData = data.map(d => ({
    date: d.date.slice(5),
    Ingresos: d.revenue,
    Costos: d.costs,
    Ganancia: d.profit,
    Merma: d.waste,
  }));

  const pieData = useMemo(() => [
    { name: 'Costos operativos', value: Math.max(0, totalCosts - totalWaste), color: '#3b82f6' },
    { name: 'Merma', value: totalWaste, color: '#f59e0b' },
    { name: 'Ganancia', value: Math.max(0, totalProfit), color: '#10b981' },
  ], [totalCosts, totalWaste, totalProfit]);

  const plItems = useMemo(() => {
    const items = [
      { label: 'Ventas Totales', value: totalRevenue, type: 'income' as const, bold: true },
      ...productProfitability.slice(0, 5).map(p => ({
        label: `  ${p.name}`,
        value: p.revenue,
        type: 'income' as const,
        bold: false,
      })),
      { label: 'Costos de Producción', value: -totalCosts, type: 'expense' as const, bold: true },
      { label: '  Merma', value: -totalWaste, type: 'expense' as const, bold: false },
      { label: 'GANANCIA NETA', value: totalProfit, type: (totalProfit >= 0 ? 'profit' : 'loss') as const, bold: true },
    ];
    return items;
  }, [totalRevenue, totalCosts, totalWaste, totalProfit, productProfitability]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando finanzas…
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Finanzas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Estado de resultados desde la API</p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(['7d', '30d'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                period === p ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              {p === '7d' ? 'Últimos 7 días' : 'Último mes'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ingresos Totales" value={formatCurrency(totalRevenue)} color="blue" />
        <StatCard title="Costos Totales" value={formatCurrency(totalCosts)} color="red" />
        <StatCard title="Ganancia Neta" value={formatCurrency(totalProfit)} color="emerald" />
        <StatCard title="Merma Total" value={formatCurrency(totalWaste)} sub={totalRevenue > 0 ? `${((totalWaste/totalRevenue)*100).toFixed(1)}% de ventas` : undefined} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Flujo Financiero</h3>
          {chartData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-16">Sin datos en el período</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Ingresos" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" />
                <Area type="monotone" dataKey="Costos" stroke="#f87171" strokeWidth={1.5} fill="none" />
                <Area type="monotone" dataKey="Ganancia" stroke="#10b981" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Desglose</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Estado de Resultados</h3>
          </div>
          <div className="p-5">
            <table className="w-full text-xs">
              <tbody>
                {plItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className={`py-2 ${item.bold ? 'font-semibold' : 'pl-4'} text-slate-700 dark:text-slate-300`}>{item.label}</td>
                    <td className={`py-2 text-right ${item.bold ? 'font-semibold' : ''} ${
                      item.type === 'income' ? 'text-blue-600' : item.type === 'expense' ? 'text-red-500' : 'text-emerald-600'
                    }`}>
                      {formatCurrency(Math.abs(item.value))}
                      {item.type === 'expense' ? '' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Rentabilidad por Producto</h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/30">
                <th className="text-left px-4 py-2 text-slate-500">Producto</th>
                <th className="text-right px-4 py-2 text-slate-500">Ingresos</th>
                <th className="text-right px-4 py-2 text-slate-500">Margen</th>
              </tr>
            </thead>
            <tbody>
              {productProfitability.map(p => (
                <tr key={p.id} className="border-t border-slate-100 dark:border-slate-700/30">
                  <td className="px-4 py-2 text-slate-800 dark:text-white">{p.name}</td>
                  <td className="text-right px-4 py-2 text-blue-600">{formatCurrency(p.revenue)}</td>
                  <td className="text-right px-4 py-2">{p.margin.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
