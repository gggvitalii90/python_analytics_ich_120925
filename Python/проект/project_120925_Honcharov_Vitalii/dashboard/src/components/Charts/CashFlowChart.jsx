import { useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useFilteredData } from '../../hooks/useFilteredData';
import { useFilterStore } from '../../store/useFilterStore';
import { fmtMonth, fmt } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs space-y-1">
      <div className="font-semibold text-slate-200 mb-2">{fmtMonth(label)}</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-medium text-white">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function CashFlowChart() {
  const data = useFilteredData();
  const { activeChips, toggleChip } = useFilterStore();

  const monthly = useMemo(() => {
    const map = {};
    data.forEach(r => {
      const ym = r.date.slice(0, 7);
      if (!map[ym]) map[ym] = { month: ym, income: 0, expense: 0 };
      if (r.type === 'Приход') map[ym].income += r.totalAmount;
      if (r.type === 'Расход') map[ym].expense += r.totalAmount;
    });
    let running = 0;
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).map(m => {
      running += m.income - m.expense;
      return { ...m, balance: running };
    });
  }, [data]);

  const handleClick = (entry) => {
    if (entry?.activePayload?.[0]) {
      toggleChip('month', entry.activePayload[0].payload.month);
    }
  };

  const activeMonth = activeChips.month;

  return (
    <div className="glass-card p-4 chart-fade">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-200">📈 Денежный поток по месяцам</h2>
        {activeMonth && (
          <button onClick={() => useFilterStore.getState().removeChip('month')}
            className="text-xs text-blue-400 hover:text-blue-200">
            {fmtMonth(activeMonth)} ✕
          </button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={monthly} onClick={handleClick} style={{ cursor: 'pointer' }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickFormatter={fmtMonth} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => fmt(v)} width={75} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
          <ReferenceLine y={0} stroke="#475569" />
          <Bar dataKey="income" name="Приход" fill="#22c55e" opacity={0.85} radius={[2,2,0,0]} />
          <Bar dataKey="expense" name="Расход" fill="#ef4444" opacity={0.85} radius={[2,2,0,0]} />
          <Line dataKey="balance" name="Баланс накопл." stroke="#60a5fa" dot={false}
            strokeWidth={2} type="monotone" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
