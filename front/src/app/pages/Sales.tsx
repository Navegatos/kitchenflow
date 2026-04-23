import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
  ShoppingCart, Zap, Calendar, TrendingUp, Package, DollarSign,
  ArrowUpRight, Filter
} from 'lucide-react';
import {
  salesRecords, recipes, dailyFinancials, formatCurrency,
  getRecipeCost, type SaleRecord
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
          <span className="font-semibold text-slate-800 dark:text-white">
            {typeof p.value === 'number' && p.value > 1000 ? formatCurrency(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Sales() {
  const [dateFrom, setDateFrom] = useState('2026-04-17');
  const [dateTo, setDateTo] = useState('2026-04-23');
  const [filterCategory, setFilterCategory] = useState('Todas');

  const filteredSales = useMemo(() => {
    return salesRecords.filter(s => s.date >= dateFrom && s.date <= dateTo);
  }, [dateFrom, dateTo]);

  // Product summary
  const productSummary = useMemo(() => {
    return recipes
      .map(r => {
        const sales = filteredSales.filter(s => s.recipeId === r.id);
        const qty = sales.reduce((s, sale) => s + sale.quantity, 0);
        const revenue = sales.reduce((s, sale) => s + sale.revenue, 0);
        const cost = getRecipeCost(r) * qty;
        const profit = revenue - cost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        return { ...r, qty, revenue, cost, profit, margin };
      })
      .filter(r => filterCategory === 'Todas' || r.category === filterCategory)
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales, filterCategory]);

  // Daily revenue chart
  const dailyChart = useMemo(() => {
    const dates = Array.from(new Set(filteredSales.map(s => s.date))).sort();
    return dates.map(date => {
      const daySales = filteredSales.filter(s => s.date === date);
      return {
        date: date.slice(5),
        Ingresos: daySales.reduce((s, sale) => s + sale.revenue, 0),
        Unidades: daySales.reduce((s, sale) => s + sale.quantity, 0),
      };
    });
  }, [filteredSales]);

  // Totals
  const totalRevenue = productSummary.reduce((s, p) => s + p.revenue, 0);
  const totalQty = productSummary.reduce((s, p) => s + p.qty, 0);
  const totalProfit = productSummary.reduce((s, p) => s + p.profit, 0);
  const avgTicket = totalQty > 0 ? totalRevenue / totalQty : 0;

  // Category breakdown for bar chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    productSummary.forEach(p => {
      map[p.category] = (map[p.category] || 0) + p.revenue;
    });
    return Object.entries(map).map(([cat, rev]) => ({ cat, rev })).sort((a, b) => b.rev - a.rev);
  }, [productSummary]);

  const categories = ['Todas', ...Array.from(new Set(recipes.map(r => r.category)))];

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Ventas</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium border border-emerald-200 dark:border-emerald-800/30">
              <Zap className="w-3 h-3" />
              Powered by Toteat
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Integración con datos de ventas de Toteat</p>
        </div>
      </div>

      {/* Date filter */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <Calendar className="w-4 h-4 text-slate-400" />
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Desde</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Hasta</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex gap-1.5 ml-auto">
          {[
            { label: 'Hoy', from: '2026-04-23', to: '2026-04-23' },
            { label: '7 días', from: '2026-04-17', to: '2026-04-23' },
            { label: '30 días', from: '2026-03-25', to: '2026-04-23' },
          ].map(({ label, from, to }) => (
            <button
              key={label}
              onClick={() => { setDateFrom(from); setDateTo(to); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                dateFrom === from && dateTo === to
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ingresos Totales', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'bg-blue-500', trend: '+12%' },
          { label: 'Unidades Vendidas', value: totalQty.toLocaleString(), icon: ShoppingCart, color: 'bg-violet-500', trend: '+8%' },
          { label: 'Ticket Promedio', value: formatCurrency(avgTicket), icon: TrendingUp, color: 'bg-amber-500', trend: '+4%' },
          { label: 'Ganancia Generada', value: formatCurrency(totalProfit), icon: Package, color: 'bg-emerald-500', trend: '+15%' },
        ].map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                {trend}
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-xl font-semibold text-slate-900 dark:text-white mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily revenue */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Ingresos Diarios</h3>
          <p className="text-xs text-slate-400 mb-4">Ventas desde Toteat</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyChart} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Por Categoría</h3>
          <p className="text-xs text-slate-400 mb-4">Ingresos por tipo de plato</p>
          <div className="space-y-3">
            {categoryData.map(({ cat, rev }) => {
              const pct = totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{cat}</span>
                    <span className="text-slate-500 dark:text-slate-400">{formatCurrency(rev)} · {pct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sales table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Detalle por Producto</h3>
            <p className="text-xs text-slate-400 mt-0.5">Datos integrados desde Toteat</p>
          </div>
          <div className="flex gap-1.5">
            {['Todas', 'Principales', 'Pizzas', 'Ensaladas', 'Acompañamientos', 'Bebidas'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  filterCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700/50">
                <th className="text-left px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Producto</th>
                <th className="text-left px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Categoría</th>
                <th className="text-right px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Uds. Vendidas</th>
                <th className="text-right px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Precio Unit.</th>
                <th className="text-right px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Ingresos</th>
                <th className="text-right px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Costo Total</th>
                <th className="text-right px-5 py-3 text-slate-500 dark:text-slate-400 font-medium">Ganancia</th>
              </tr>
            </thead>
            <tbody>
              {productSummary.map((p, idx) => (
                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 w-4 text-xs">#{idx + 1}</span>
                      <span className="font-medium text-slate-800 dark:text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">{p.category}</span>
                  </td>
                  <td className="text-right px-4 py-3 font-semibold text-slate-800 dark:text-white">{p.qty.toLocaleString()}</td>
                  <td className="text-right px-4 py-3 text-slate-600 dark:text-slate-300">{formatCurrency(p.salePrice)}</td>
                  <td className="text-right px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(p.revenue)}</td>
                  <td className="text-right px-4 py-3 text-red-500 dark:text-red-400">{formatCurrency(p.cost)}</td>
                  <td className="text-right px-5 py-3">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(p.profit)}</span>
                      <span className={`text-xs ${p.margin >= 60 ? 'text-emerald-500' : p.margin >= 40 ? 'text-blue-500' : 'text-amber-500'}`}>{p.margin.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-slate-50 dark:bg-slate-700/30 border-t-2 border-slate-200 dark:border-slate-600 font-semibold">
                <td className="px-5 py-3 text-slate-800 dark:text-white">TOTAL</td>
                <td className="px-4 py-3" />
                <td className="text-right px-4 py-3 text-slate-800 dark:text-white">{totalQty.toLocaleString()}</td>
                <td className="px-4 py-3" />
                <td className="text-right px-4 py-3 text-blue-600 dark:text-blue-400">{formatCurrency(totalRevenue)}</td>
                <td className="text-right px-4 py-3 text-red-500 dark:text-red-400">{formatCurrency(productSummary.reduce((s,p) => s+p.cost, 0))}</td>
                <td className="text-right px-5 py-3 text-emerald-600 dark:text-emerald-400">{formatCurrency(totalProfit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
