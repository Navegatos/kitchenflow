import React, { useEffect, useMemo, useState } from 'react';
import { Download, FileText, Filter, Sheet, Loader2 } from 'lucide-react';
import { formatCurrency, dateRangeDays, mapFinanceRows, type DailyFinancial } from '../data/mockData';
import { reportsApi } from '../api';

export default function Reports() {
  const [period, setPeriod] = useState<'7' | '30'>('30');
  const [compare, setCompare] = useState<'none' | 'prev'>('prev');
  const [data, setData] = useState<DailyFinancial[]>([]);
  const [previousData, setPreviousData] = useState<DailyFinancial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const days = period === '7' ? 7 : 30;
    const current = dateRangeDays(days);
    const prevEnd = new Date(current.from);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - days + 1);

    Promise.all([
      reportsApi.getFinanceDailyRange(current.from, current.to),
      compare === 'prev'
        ? reportsApi.getFinanceDailyRange(
            prevStart.toISOString().split('T')[0],
            prevEnd.toISOString().split('T')[0],
          )
        : Promise.resolve([]),
    ])
      .then(([currentRows, prevRows]) => {
        if (cancelled) return;
        setData(mapFinanceRows(currentRows));
        setPreviousData(mapFinanceRows(prevRows));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [period, compare]);

  const totals = useMemo(() => data.reduce(
    (acc, item) => {
      acc.revenue += item.revenue;
      acc.costs += item.costs;
      acc.profit += item.profit;
      return acc;
    },
    { revenue: 0, costs: 0, profit: 0 },
  ), [data]);

  const previousTotals = useMemo(() => previousData.reduce(
    (acc, item) => {
      acc.revenue += item.revenue;
      acc.costs += item.costs;
      acc.profit += item.profit;
      return acc;
    },
    { revenue: 0, costs: 0, profit: 0 },
  ), [previousData]);

  const deltaProfit = previousTotals.profit
    ? ((totals.profit - previousTotals.profit) / previousTotals.profit) * 100
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando reportes…
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Reportes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Datos financieros desde la API</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const { from, to } = dateRangeDays(period === '7' ? 7 : 30);
              const csv = await reportsApi.exportReportCsv('sales', from, to);
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `ventas-${from}-${to}.csv`;
              a.click();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs"
          >
            <Sheet className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs">
          <Filter className="w-4 h-4" />
          <select value={period} onChange={e => setPeriod(e.target.value as '7' | '30')} className="bg-transparent outline-none">
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
          </select>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs">
          <select value={compare} onChange={e => setCompare(e.target.value as 'none' | 'prev')} className="bg-transparent outline-none">
            <option value="prev">Comparar con período anterior</option>
            <option value="none">Sin comparación</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Ingresos', value: formatCurrency(totals.revenue), color: 'text-blue-600' },
          { label: 'Costos', value: formatCurrency(totals.costs), color: 'text-red-500' },
          { label: 'Ganancia', value: formatCurrency(totals.profit), color: 'text-emerald-600' },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {compare === 'prev' && (
        <p className="text-sm text-slate-500">
          Variación de ganancia vs período anterior:{' '}
          <span className={deltaProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}>
            {deltaProfit >= 0 ? '+' : ''}{deltaProfit.toFixed(1)}%
          </span>
        </p>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
              <th className="text-left px-4 py-3 text-slate-500">Fecha</th>
              <th className="text-right px-4 py-3 text-slate-500">Ingresos</th>
              <th className="text-right px-4 py-3 text-slate-500">Costos</th>
              <th className="text-right px-4 py-3 text-slate-500">Ganancia</th>
              <th className="text-right px-4 py-3 text-slate-500">Merma</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">Sin registros en el período</td></tr>
            ) : data.map(row => (
              <tr key={row.date} className="border-b border-slate-100 dark:border-slate-700/30">
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.date}</td>
                <td className="text-right px-4 py-3 text-blue-600">{formatCurrency(row.revenue)}</td>
                <td className="text-right px-4 py-3 text-red-500">{formatCurrency(row.costs)}</td>
                <td className="text-right px-4 py-3 text-emerald-600">{formatCurrency(row.profit)}</td>
                <td className="text-right px-4 py-3 text-amber-500">{formatCurrency(row.waste)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
