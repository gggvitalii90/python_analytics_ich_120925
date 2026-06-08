import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fmt } from '../../utils/formatters';
import { useFilterStore } from '../../store/useFilterStore';

const COLORS = ['#3b82f6','#22c55e','#f59e0b','#a855f7','#ec4899','#14b8a6','#f97316','#ef4444','#84cc16','#06b6d4','#6366f1'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="glass-card p-3 text-xs">
      <div className="font-semibold text-slate-200 mb-1">{p.name}</div>
      <div className="text-slate-400">Сумма: <span className="text-white">{fmt(p.value)}</span></div>
      <div className="text-slate-400">Доля: <span className="text-white">{p.payload.pct}%</span></div>
    </div>
  );
};

export default function DonutChart({ title, data, dimension }) {
  const { activeChips, toggleChip } = useFilterStore();
  const activeVal = activeChips[dimension];

  const total = data.reduce((s, d) => s + d.value, 0);
  const withPct = data.map(d => ({ ...d, pct: total ? ((d.value / total) * 100).toFixed(1) : '0' }));

  return (
    <div className="glass-card p-4 chart-fade">
      <h2 className="text-sm font-semibold text-slate-200 mb-2">{title}</h2>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={withPct}
            cx="50%"
            cy="48%"
            innerRadius="38%"
            outerRadius="62%"
            paddingAngle={2}
            dataKey="value"
            onClick={(entry) => toggleChip(dimension, entry.name)}
            style={{ cursor: 'pointer' }}
          >
            {withPct.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={COLORS[i % COLORS.length]}
                opacity={activeVal && activeVal !== entry.name ? 0.25 : 1}
                stroke="#0f172a"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 10, color: '#94a3b8' }}
            formatter={(v) => v.length > 20 ? v.slice(0, 19) + '…' : v}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
