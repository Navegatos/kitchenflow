import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
  ShoppingCart, Calendar, TrendingUp, Package, DollarSign,
  ArrowUpRight, Filter, Loader2
} from 'lucide-react';
import { formatCurrency, dateRangeDays, parseDecimal } from '../data/mockData';
import { ordersApi, reportsApi } from '../api';
import type { SalesAggregateRow } from '../api/types';

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
  const range = dateRangeDays(7);
  const [dateFrom, setDateFrom] = useState(range.from);
  const [dateTo, setDateTo] = useState(range.to);
  const [salesAgg, setSalesAgg] = useState<SalesAggregateRow[]>([]);
  const [financeData, setFinanceData] = useState<Array<{ date: string; revenue: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      ordersApi.aggregateSales(),
      reportsApi.getFinanceDailyRange(dateFrom, dateTo),
    ])
      .then(([sales, finance]) => {
        if (cancelled) return;
        setSalesAgg(sales);
        setFinanceData(finance.map(row => ({
          date: row.date,
          revenue: parseDecimal(row.revenue),
        })));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [dateFrom, dateTo]);

  const productSummary = useMemo(() => {
    return salesAgg
      .map(row => {
        const revenue = parseDecimal(row.revenue);
        const qty = row.quantity_sold;
        return {
          id: row.recipe_id,
          name: row.recipe_name,
          category: 'Platos',
          qty,
          revenue,
          cost: 0,
          profit: revenue,
          margin: 100,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [salesAgg]);

  const dailyChart = useMemo(() => {
    return financeData.map(row => ({
      date: row.date.slice(5),
      Ingresos: row.revenue,
    }));
  }, [financeData]);

  const totalRevenue = productSummary.reduce((s, p) => s + p.revenue, 0);
  const totalQty = productSummary.reduce((s, p) => s + p.qty, 0);
  const totalProfit = totalRevenue;
  const avgTicket = totalQty > 0 ? totalRevenue / totalQty : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando ventas…
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Ventas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Datos agregados desde pedidos entregados</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-4 h-4" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="rounded border border-slate-200 dark:border-slate-700 px-2 py-1 bg-white dark:bg-slate-900" />
          <span>—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="rounded border border-slate-200 dark:border-slate-700 px-2 py-1 bg-white dark:bg-slate-900" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Ingresos Totales', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Unidades Vendidas', value: totalQty.toString(), icon: Package, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
          { label: 'Ticket Promedio', value: formatCurrency(avgTicket), icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Productos Activos', value: productSummary.length.toString(), icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Ingresos por día</h3>
          {dailyChart.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">Sin ventas en el período</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyChart}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Ingresos" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Top productos</h3>
          {productSummary.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={productSummary.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
              <th className="text-left px-5 py-3 text-slate-500">Producto</th>
              <th className="text-right px-4 py-3 text-slate-500">Unidades</th>
              <th className="text-right px-5 py-3 text-slate-500">Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {productSummary.map(p => (
              <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700/30">
                <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">{p.name}</td>
                <td className="text-right px-4 py-3">{p.qty}</td>
                <td className="text-right px-5 py-3 text-blue-600">{formatCurrency(p.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
