import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useFilteredData } from '../../hooks/useFilteredData';
import { useFilterStore } from '../../store/useFilterStore';
import { fmt } from '../../utils/formatters';

const PALETTE = [
  ['#3b82f6', '#1d4ed8'],   // Альфа - синий
  ['#a855f7', '#7c3aed'],   // Сбербанк - фиолетовый
  ['#22d3ee', '#0e7490'],   // Наличный - голубой
  ['#f97316', '#c2410c'],   // ИП Мочалов - оранж
  ['#84cc16', '#4d7c0f'],   // Точка - лайм
  ['#ec4899', '#9d174d'],   // ИП Мочалов Сбер - розовый
  ['#f59e0b', '#b45309'],   // ИП Родин - янтарный
];

export default function BankPie3D() {
  const data = useFilteredData();
  const { activeChips, toggleChip } = useFilterStore();

  const pieData = useMemo(() => {
    const map = {};
    data.forEach(r => {
      const bank = r.bank || '💵 Наличный расчёт';
      if (!map[bank]) map[bank] = 0;
      map[bank] += r.totalAmount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
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
        return `<b>${p.name}</b><br/>${fmt(p.value)}<br/>${pct}% оборота`;
      }
    },
    legend: {
      bottom: '0%',
      textStyle: { color: '#94a3b8', fontSize: 10 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      // Shadow layer
      {
        type: 'pie',
        radius: ['20%', '58%'],
        center: ['50%', '45%'],
        silent: true,
        label: { show: false },
        data: pieData.map((d, i) => ({
          value: d.value,
          name: d.name,
          itemStyle: { color: PALETTE[i % PALETTE.length]?.[1], opacity: 0.3 }
        })),
        top: '10px', left: '3px',
      },
      // Main
      {
        type: 'pie',
        radius: ['20%', '58%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        emphasis: {
          scaleSize: 8,
          itemStyle: { shadowBlur: 25, shadowColor: 'rgba(0,0,0,0.4)' }
        },
        label: {
          show: true,
          color: '#cbd5e1',
          fontSize: 10,
          formatter: (p) => p.percent > 4 ? `${p.percent.toFixed(0)}%` : '',
        },
        itemStyle: {
          borderRadius: 5,
          borderWidth: 2,
          borderColor: '#0f172a',
        },
        data: pieData.map((d, i) => ({
          value: d.value,
          name: d.name,
          selected: activeChips.bank === d.name,
          itemStyle: {
            color: {
              type: 'radial', x: 0.5, y: 0.3, r: 0.7,
              colorStops: [
                { offset: 0, color: PALETTE[i % PALETTE.length]?.[0] },
                { offset: 1, color: PALETTE[i % PALETTE.length]?.[1] },
              ]
            },
            shadowBlur: 12,
            shadowColor: (PALETTE[i % PALETTE.length]?.[0]) + '55',
            opacity: activeChips.bank && activeChips.bank !== d.name ? 0.3 : 1,
          }
        }))
      }
    ]
  }), [pieData, activeChips.bank, total]);

  return (
    <div className="glass-card p-4 chart-fade">
      <h2 className="text-sm font-semibold text-slate-200 mb-2">🏦 Распределение по банкам</h2>
      <ReactECharts
        option={option}
        style={{ height: 260 }}
        onEvents={{
          click: (p) => {
            if (p.componentSubType === 'pie' && p.seriesIndex === 1)
              toggleChip('bank', p.name);
          }
        }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
