import { useMemo } from 'react';
import { useFilteredData } from '../../hooks/useFilteredData';
import { fmtFull } from '../../utils/formatters';

function Card({ icon, label, value, sub, color }) {
  return (
    <div className={`glass-card p-4 flex flex-col gap-1 border-t-2 ${color} relative overflow-hidden`}>
      <div className="absolute right-3 top-3 text-2xl opacity-20">{icon}</div>
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</div>
      <div className="text-xl font-bold text-white leading-tight">{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export default function KPICards() {
  const data = useFilteredData();

  const stats = useMemo(() => {
    const income   = data.filter(r => r.type === 'Приход').reduce((s, r) => s + r.totalAmount, 0);
    const expense  = data.filter(r => r.type === 'Расход').reduce((s, r) => s + r.totalAmount, 0);
    const balance  = income - expense;
    const txCount  = data.length;
    const expenseOnly = data.filter(r => r.type === 'Расход');
    const avgTx    = expenseOnly.length ? expense / expenseOnly.length : 0;
    return { income, expense, balance, txCount, avgTx };
  }, [data]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <Card icon="💰" label="Приход" value={fmtFull(stats.income)} color="border-emerald-500"
        sub="За выбранный период" />
      <Card icon="📤" label="Расход" value={fmtFull(stats.expense)} color="border-red-500"
        sub="За выбранный период" />
      <Card icon="⚖️" label="Баланс" value={fmtFull(stats.balance)}
        color={stats.balance >= 0 ? 'border-blue-500' : 'border-orange-500'}
        sub={stats.balance >= 0 ? '✅ Профицит' : '⚠️ Дефицит'} />
      <Card icon="📋" label="Транзакций"
        value={stats.txCount.toLocaleString('ru-RU')}
        color="border-purple-500" sub="Операций в выборке" />
      <Card icon="📊" label="Средний чек"
        value={fmtFull(Math.round(stats.avgTx))}
        color="border-amber-500" sub="Средний расход" />
    </div>
  );
}
