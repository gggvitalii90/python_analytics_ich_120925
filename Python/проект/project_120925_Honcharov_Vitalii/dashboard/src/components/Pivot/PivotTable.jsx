import { useMemo, useState } from 'react';
import { useFilteredData } from '../../hooks/useFilteredData';
import { useFilterStore } from '../../store/useFilterStore';
import { fmtFull, fmtQuarter, fmtMonth } from '../../utils/formatters';

function exportCSV(rows, cols, map, rowKey, grand) {
  const header = [rowKey, ...cols, 'ИТОГО'].join(';');
  const lines = rows.map(r => {
    const vals = cols.map(c => (map[r]?.[c] ?? 0).toFixed(0));
    const rowTotal = cols.reduce((s, c) => s + (map[r]?.[c] ?? 0), 0);
    return [r, ...vals, rowTotal.toFixed(0)].join(';');
  });
  const footer = ['ИТОГО', ...cols.map(c => grand[c]?.toFixed(0) ?? '0'), Object.values(grand).reduce((a, b) => a + b, 0).toFixed(0)].join(';');
  const csv = [header, ...lines, footer].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'pivot.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function PivotTable() {
  const data = useFilteredData();
  const { toggleChip } = useFilterStore();
  const [rowDim, setRowDim] = useState('object');
  const [colGranularity, setColGranularity] = useState('quarter');

  const rowKey = { object: 'Объект', project: 'Проект', budgetItem: 'Статья бюджета' }[rowDim];

  const { rows, cols, map, grand } = useMemo(() => {
    const getCol = (date) => colGranularity === 'quarter' ? fmtQuarter(date.slice(0, 7)) : fmtMonth(date.slice(0, 7));
    const expenses = data.filter(r => r.type === 'Расход');
    const rowMap = {};
    expenses.forEach(r => {
      const rv = r[rowDim] || '—';
      const cv = getCol(r.date);
      if (!rowMap[rv]) rowMap[rv] = {};
      rowMap[rv][cv] = (rowMap[rv][cv] || 0) + r.totalAmount;
    });
    const allCols = [...new Set(expenses.map(r => getCol(r.date)))].sort((a, b) => {
      // Sort by actual period
      return a < b ? -1 : 1;
    });
    const allRows = Object.keys(rowMap)
      .sort((a, b) => {
        const sumA = Object.values(rowMap[a]).reduce((s, v) => s + v, 0);
        const sumB = Object.values(rowMap[b]).reduce((s, v) => s + v, 0);
        return sumB - sumA;
      })
      .slice(0, 25);

    const grand = {};
    allCols.forEach(c => {
      grand[c] = allRows.reduce((s, r) => s + (rowMap[r]?.[c] ?? 0), 0);
    });

    return { rows: allRows, cols: allCols, map: rowMap, grand };
  }, [data, rowDim, colGranularity]);

  const chipDim = rowDim === 'object' ? 'object' : rowDim === 'project' ? 'project' : 'budgetItem';

  const getColor = (val, col) => {
    if (!val) return '';
    const max = Math.max(...rows.map(r => map[r]?.[col] ?? 0));
    const pct = max ? val / max : 0;
    if (pct > 0.8) return 'bg-red-500/20 text-red-200';
    if (pct > 0.5) return 'bg-amber-500/15 text-amber-200';
    if (pct > 0.2) return 'bg-blue-500/10 text-blue-200';
    return 'text-slate-300';
  };

  return (
    <div className="glass-card p-4 chart-fade">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-sm font-semibold text-slate-200">📋 Сводная таблица</h2>
        <select value={rowDim} onChange={e => setRowDim(e.target.value)}
          className="bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded border border-slate-600 outline-none">
          <option value="object">По объектам</option>
          <option value="project">По проектам</option>
          <option value="budgetItem">По статьям</option>
        </select>
        <select value={colGranularity} onChange={e => setColGranularity(e.target.value)}
          className="bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded border border-slate-600 outline-none">
          <option value="quarter">По кварталам</option>
          <option value="month">По месяцам</option>
        </select>
        <button onClick={() => exportCSV(rows, cols, map, rowKey, grand)}
          className="ml-auto text-xs bg-blue-600/20 border border-blue-500/30 text-blue-300 px-3 py-1 rounded hover:bg-blue-600/40 transition-colors">
          📥 Экспорт CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse" style={{ minWidth: `${200 + cols.length * 100}px` }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-surface-800 text-left px-3 py-2 text-slate-400 font-semibold border-b border-r border-slate-700 min-w-40">
                {rowKey}
              </th>
              {cols.map(c => (
                <th key={c} className="px-2 py-2 text-center text-slate-400 font-semibold border-b border-slate-700 whitespace-nowrap min-w-24">
                  {c}
                </th>
              ))}
              <th className="px-2 py-2 text-center text-slate-300 font-bold border-b border-l border-slate-700 min-w-28">
                ИТОГО
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const rowTotal = cols.reduce((s, c) => s + (map[row]?.[c] ?? 0), 0);
              return (
                <tr key={row} className={`hover:bg-slate-700/30 cursor-pointer border-b border-slate-700/40 ${ri % 2 === 0 ? '' : 'bg-slate-800/20'}`}
                  onClick={() => toggleChip(chipDim, row)}>
                  <td className="sticky left-0 z-10 bg-surface-800 px-3 py-1.5 text-slate-300 border-r border-slate-700 max-w-48 truncate" title={row}>
                    {row}
                  </td>
                  {cols.map(c => {
                    const val = map[row]?.[c] ?? 0;
                    return (
                      <td key={c} className={`px-2 py-1.5 text-right rounded-sm ${getColor(val, c)}`}>
                        {val > 0 ? fmtFull(val) : ''}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5 text-right font-bold text-slate-200 border-l border-slate-700">
                    {fmtFull(rowTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-700/30">
              <td className="sticky left-0 z-10 bg-slate-700 px-3 py-2 font-bold text-slate-200 border-t border-r border-slate-600">
                ИТОГО
              </td>
              {cols.map(c => (
                <td key={c} className="px-2 py-2 text-right font-bold text-slate-200 border-t border-slate-600">
                  {fmtFull(grand[c] ?? 0)}
                </td>
              ))}
              <td className="px-2 py-2 text-right font-bold text-white border-t border-l border-slate-600">
                {fmtFull(Object.values(grand).reduce((a, b) => a + b, 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
