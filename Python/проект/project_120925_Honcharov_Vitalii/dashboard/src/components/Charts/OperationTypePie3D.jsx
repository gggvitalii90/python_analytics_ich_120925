import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useFilteredData } from '../../hooks/useFilteredData';
import { useFilterStore } from '../../store/useFilterStore';
import { fmt } from '../../utils/formatters';

const COLORS = [
  ['#ef4444', '#991b1b'],   // expense
  ['#22c55e', '#15803d'],   // income
  ['#f59e0b', '#b45309'],   // conversion
];

const LABELS = { 'Расход': 0, 'Приход': 1, 'Конвертация': 2 };

export default function OperationTypePie3D() {
  const data = useFilteredData();
  const { activeChips, toggleChip } = useFilterStore();

  const pieData = useMemo(() => {
    const map = {};
    data.forEach(r => {
      if (!map[r.type]) map[r.type] = 0;
      map[r.type] += r.totalAmount;
    });
    return Object.entries(map).map(([name, value]) => ({
      name, value: Math.round(value),
      idx: LABELS[name] ?? 0
    }));
  }, [data]);

  const total = pieData.reduce((s, d) => s + d.value, 0);

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (p) => {
        const pct = total ? ((p.value / total) * 100).toFixed(1) : 0;
        return `<b>${p.name}</b><br/>${fmt(p.value)}<br/>${pct}% от оборота`;
      }
    },
    legend: {
      bottom: '2%',
      textStyle: { color: '#94a3b8', fontSize: 11 },
    },
    series: [
      // Shadow/depth layer (pseudo-3D bottom)
      {
        type: 'pie',
        radius: ['30%', '62%'],
        center: ['50%', '47%'],
        silent: true,
        label: { show: false },
        itemStyle: { opacity: 0.35, borderWidth: 0 },
        data: pieData.map((d) => ({
          value: d.value,
          name: d.name,
          itemStyle: {
            color: COLORS[d.idx]?.[1] ?? '#1e293b',
            shadowBlur: 0,
          }
        })),
        top: '12px',
        left: '4px',
      },
      // Main pie
      {
        type: 'pie',
        radius: ['30%', '62%'],
        center: ['50%', '47%'],
        avoidLabelOverlap: true,
        emphasis: {
          scaleSize: 10,
          itemStyle: { shadowBlur: 30, shadowColor: 'rgba(0,0,0,0.5)' }
        },
        label: {
          show: true,
          color: '#cbd5e1',
          fontSize: 11,
          formatter: '{b}\n{d}%',
        },
        itemStyle: {
          borderRadius: 6,
          borderWidth: 2,
          borderColor: '#0f172a',
        },
        data: pieData.map((d) => ({
          value: d.value,
          name: d.name,
          selected: activeChips.type === d.name,
          itemStyle: {
            color: {
              type: 'radial',
              x: 0.5, y: 0.3, r: 0.7,
              colorStops: [
                { offset: 0, color: COLORS[d.idx]?.[0] ?? '#3b82f6' },
                { offset: 1, color: COLORS[d.idx]?.[1] ?? '#1d4ed8' },
              ]
            },
            shadowBlur: 15,
            shadowColor: (COLORS[d.idx]?.[0] ?? '#3b82f6') + '66',
            opacity: activeChips.type && activeChips.type !== d.name ? 0.35 : 1,
          }
        }))
      }
    ]
  }), [pieData, activeChips.type, total]);

  return (
    <div className="glass-card p-4 chart-fade">
      <h2 className="text-sm font-semibold text-slate-200 mb-2">🎯 Тип операции</h2>
      <ReactECharts
        option={option}
        style={{ height: 260 }}
        onEvents={{
          click: (p) => {
            if (p.componentSubType === 'pie' && p.seriesIndex === 1)
              toggleChip('type', p.name);
          }
        }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
