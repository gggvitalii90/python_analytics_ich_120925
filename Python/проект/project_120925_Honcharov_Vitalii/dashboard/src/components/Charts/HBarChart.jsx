import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { fmt } from '../../utils/formatters';
import { useFilterStore } from '../../store/useFilterStore';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs">
      <div className="font-semibold text-slate-200 mb-1">{payload[0].payload.name}</div>
      <div className="text-slate-400">Сумма: <span className="text-white font-medium">{fmt(payload[0].value)}</span></div>
    </div>
  );
};

export default function HBarChart({ title, data, dimension, color = '#3b82f6', top = 15 }) {
  const { activeChips, toggleChip } = useFilterStore();
  const activeVal = activeChips[dimension];

  const sorted = useMemo(() =>
    [...data].sort((a, b) => b.value - a.value).slice(0, top),
    [data, top]
  );

  return (
    <div className="glass-card p-4 chart-fade h-full">
      <h2 className="text-sm font-semibold text-slate-200 mb-3">{title}</h2>
      <ResponsiveContainer width="100%" height={Math.max(220, sorted.length * 28)}>
        <BarChart data={sorted} layout="vertical" onClick={e => e?.activePayload && toggleChip(dimension, e.activePayload[0].payload.name)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={v => fmt(v)} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickFormatter={v => v.length > 18 ? v.slice(0, 17) + '…' : v} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} style={{ cursor: 'pointer' }}>
            {sorted.map((entry) => (
              <Cell
                key={entry.name}
                fill={color}
                opacity={activeVal && activeVal !== entry.name ? 0.2 : 0.9}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
