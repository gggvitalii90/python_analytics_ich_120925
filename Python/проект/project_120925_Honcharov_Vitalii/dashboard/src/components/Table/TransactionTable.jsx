import { useMemo, useState } from 'react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, getFilteredRowModel, flexRender
} from '@tanstack/react-table';
import { useFilteredData } from '../../hooks/useFilteredData';
import { fmtFull, fmtDate } from '../../utils/formatters';

function exportCSV(data) {
  const cols = ['Дата','Тип','Тип оплаты','Банк','Контрагент','Объект','Проект','Статья','Ответственный','Назначение','Сумма','Сумма итог'];
  const rows = data.map(r => [
    r.date, r.type, r.paymentType, r.bank, r.counterparty, r.object, r.project,
    r.budgetItem, r.responsible, r.purpose.replace(/;/g,''), r.amount, r.totalAmount
  ].join(';'));
  const csv = [cols.join(';'), ...rows].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'transactions.csv';
  a.click();
}

const TYPE_BADGE = {
  'Приход':      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Расход':      'bg-red-500/20 text-red-300 border-red-500/30',
  'Конвертация': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

export default function TransactionTable() {
  const data = useFilteredData();
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([{ id: 'date', desc: true }]);

  const columns = useMemo(() => [
    { accessorKey: 'date',         header: 'Дата',      cell: i => fmtDate(i.getValue()), size: 90 },
    { accessorKey: 'type',         header: 'Тип',       size: 100,
      cell: i => <span className={`text-xs px-1.5 py-0.5 rounded border ${TYPE_BADGE[i.getValue()] ?? 'text-slate-300'}`}>{i.getValue()}</span>
    },
    { accessorKey: 'object',       header: 'Объект',    size: 130 },
    { accessorKey: 'project',      header: 'Проект',    size: 130 },
    { accessorKey: 'counterparty', header: 'Контрагент',size: 160,
      cell: i => <span title={i.getValue()} className="block truncate max-w-xs">{i.getValue()}</span>
    },
    { accessorKey: 'budgetItem',   header: 'Статья',    size: 130 },
    { accessorKey: 'responsible',  header: 'Ответств.', size: 110 },
    { accessorKey: 'bank',         header: 'Банк',      size: 120 },
    { accessorKey: 'totalAmount',  header: 'Сумма итог',size: 120,
      cell: i => <span className={i.row.original.type === 'Приход' ? 'text-emerald-400' : i.row.original.type === 'Расход' ? 'text-red-400' : 'text-amber-400'}>{fmtFull(i.getValue())}</span>
    },
    { accessorKey: 'link',         header: '🔗',        size: 50,
      cell: i => i.getValue() ? <a href={i.getValue()} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-200" onClick={e => e.stopPropagation()}>📎</a> : ''
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  return (
    <div className="glass-card p-4 chart-fade">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="text-sm font-semibold text-slate-200">🔍 Детальные транзакции</h2>
        <input
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Поиск по контрагенту, назначению..."
          className="flex-1 min-w-48 bg-slate-700 text-slate-200 text-xs rounded px-3 py-1.5 border border-slate-600 focus:border-blue-500 outline-none"
        />
        <span className="text-xs text-slate-500">{table.getFilteredRowModel().rows.length.toLocaleString('ru-RU')} записей</span>
        <button onClick={() => exportCSV(data)}
          className="text-xs bg-blue-600/20 border border-blue-500/30 text-blue-300 px-3 py-1 rounded hover:bg-blue-600/40 transition-colors">
          📥 CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ minWidth: 900 }}>
          <thead>
            <tr className="border-b border-slate-700">
              {table.getHeaderGroups().map(hg => hg.headers.map(h => (
                <th key={h.id}
                  className={`px-2 py-2 text-left text-slate-400 font-semibold whitespace-nowrap ${h.column.getCanSort() ? 'cursor-pointer hover:text-slate-200 select-none' : ''}`}
                  style={{ width: h.column.columnDef.size }}
                  onClick={h.column.getToggleSortingHandler()}
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {h.column.getIsSorted() === 'asc' ? ' ↑' : h.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                </th>
              )))}
            </tr>
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, ri) => (
              <tr key={row.id}
                className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${ri % 2 === 0 ? '' : 'bg-slate-800/10'}`}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-2 py-1.5 text-slate-300">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Строк:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="bg-slate-700 text-slate-200 rounded px-1 py-0.5 border border-slate-600 outline-none"
          >
            {[25, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="px-2 py-0.5 rounded bg-slate-700 disabled:opacity-30 hover:bg-slate-600">«</button>
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-2 py-0.5 rounded bg-slate-700 disabled:opacity-30 hover:bg-slate-600">‹</button>
          <span>Стр. {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}</span>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-2 py-0.5 rounded bg-slate-700 disabled:opacity-30 hover:bg-slate-600">›</button>
          <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="px-2 py-0.5 rounded bg-slate-700 disabled:opacity-30 hover:bg-slate-600">»</button>
        </div>
      </div>
    </div>
  );
}
