import React, { useMemo, useState } from 'react';
import { Download, FileText, Filter, Sheet } from 'lucide-react';
import { dailyFinancials, formatCurrency } from '../data/mockData';

export default function Reports() {
  const [period, setPeriod] = useState<'7' | '30'>('30');
  const [compare, setCompare] = useState<'none' | 'prev'>('prev');
  const data = useMemo(() => (period === '7' ? dailyFinancials.slice(-7) : dailyFinancials), [period]);

  const totals = data.reduce(
    (acc, item) => {
      acc.revenue += item.revenue;
      acc.costs += item.costs;
      acc.profit += item.profit;
      return acc;
    },
    { revenue: 0, costs: 0, profit: 0 },
  );

  const previousData = dailyFinancials.slice(-(period === '7' ? 14 : 60), -(period === '7' ? 7 : 30));
  const previousTotals = previousData.reduce(
    (acc, item) => {
      acc.revenue += item.revenue;
      acc.costs += item.costs;
      acc.profit += item.profit;
      return acc;
    },
    { revenue: 0, costs: 0, profit: 0 },
  );

  const deltaProfit = previousTotals.profit
    ? ((totals.profit - previousTotals.profit) / previousTotals.profit) * 100
    : 0;

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Reportes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Generacion dinamica de reportes con comparacion de periodos</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs">
            <FileText className="w-4 h-4" />
            Exportar PDF
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs">
            <Sheet className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <button onClick={() => setPeriod('7')} className={`rounded-lg px-3 py-1.5 text-xs ${period === '7' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>7 dias</button>
        <button onClick={() => setPeriod('30')} className={`rounded-lg px-3 py-1.5 text-xs ${period === '30' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>30 dias</button>
        <select value={compare} onChange={e => setCompare(e.target.value as 'none' | 'prev')} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs ml-auto">
          <option value="prev">Comparar con periodo anterior</option>
          <option value="none">Sin comparacion</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat title="Ingresos" value={formatCurrency(totals.revenue)} />
        <Stat title="Costos" value={formatCurrency(totals.costs)} />
        <Stat title="Ganancia" value={formatCurrency(totals.profit)} />
      </div>

      {compare === 'prev' && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-sm">
          Variacion de ganancia vs periodo anterior: <span className={`font-semibold ${deltaProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{deltaProfit.toFixed(1)}%</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Detalle diario</h2>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50 dark:bg-slate-700/30">
            <tr>
              <th className="text-left px-5 py-3">Fecha</th>
              <th className="text-right px-4 py-3">Ingresos</th>
              <th className="text-right px-4 py-3">Costos</th>
              <th className="text-right px-5 py-3">Ganancia</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.date} className="border-t border-slate-100 dark:border-slate-700/30">
                <td className="px-5 py-3">{item.date}</td>
                <td className="text-right px-4 py-3">{formatCurrency(item.revenue)}</td>
                <td className="text-right px-4 py-3">{formatCurrency(item.costs)}</td>
                <td className="text-right px-5 py-3 font-semibold">{formatCurrency(item.profit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}
