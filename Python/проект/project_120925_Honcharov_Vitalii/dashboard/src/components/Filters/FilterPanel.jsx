import { useState } from 'react';
import { useFilterStore } from '../../store/useFilterStore';
import { useAllOptions } from '../../hooks/useFilteredData';

function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-slate-700/50">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors"
      >
        {title}
        <span className={`transition-transform duration-200 ${open ? '' : '-rotate-90'}`}>▾</span>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function MultiSelect({ options, value, onChange }) {
  const [search, setSearch] = useState('');
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter(v => v !== opt));
    else onChange([...value, opt]);
  };
  return (
    <div>
      {options.length > 6 && (
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск..."
          className="w-full bg-slate-700 text-slate-200 text-xs rounded px-2 py-1 mb-2 outline-none border border-slate-600 focus:border-blue-500"
        />
      )}
      <div className="max-h-36 overflow-y-auto space-y-0.5">
        {filtered.map(opt => (
          <label key={opt} className="flex items-center gap-2 px-1 py-0.5 rounded hover:bg-slate-700 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={value.includes(opt)}
              onChange={() => toggle(opt)}
              className="accent-blue-500"
            />
            <span className="truncate" title={opt}>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function FilterPanel() {
  const {
    sidebarOpen, dateFrom, dateTo, types, paymentTypes, banks, objects,
    projects, budgetItems, responsible, setFilter, resetAll
  } = useFilterStore();
  const opts = useAllOptions();

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => useFilterStore.getState().toggleSidebar()}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-14 left-0 bottom-0 z-30 w-72
        bg-surface-800 border-r border-slate-700/50
        overflow-y-auto overflow-x-hidden
        transition-transform duration-250 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <span className="text-sm font-semibold text-slate-200">🔧 Фильтры</span>
          <button
            onClick={resetAll}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            Сбросить
          </button>
        </div>

        <Section title="📅 Период">
          <div className="space-y-2">
            <div>
              <label className="text-xs text-slate-500 block mb-1">С</label>
              <input type="date" value={dateFrom} min="2024-01-01" max={dateTo}
                onChange={e => setFilter('dateFrom', e.target.value)}
                className="w-full bg-slate-700 text-slate-200 text-xs rounded px-2 py-1.5 border border-slate-600 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">По</label>
              <input type="date" value={dateTo} min={dateFrom} max="2026-05-31"
                onChange={e => setFilter('dateTo', e.target.value)}
                className="w-full bg-slate-700 text-slate-200 text-xs rounded px-2 py-1.5 border border-slate-600 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </Section>

        <Section title="💼 Тип операции">
          <MultiSelect options={opts.types} value={types} onChange={v => setFilter('types', v)} />
        </Section>

        <Section title="💳 Тип оплаты">
          <MultiSelect options={opts.paymentTypes} value={paymentTypes} onChange={v => setFilter('paymentTypes', v)} />
        </Section>

        <Section title="🏦 Банк">
          <MultiSelect options={opts.banks} value={banks} onChange={v => setFilter('banks', v)} />
        </Section>

        <Section title="🏗️ Объект">
          <MultiSelect options={opts.objects} value={objects} onChange={v => setFilter('objects', v)} />
        </Section>

        <Section title="📊 Проект">
          <MultiSelect options={opts.projects} value={projects} onChange={v => setFilter('projects', v)} />
        </Section>

        <Section title="📋 Статья бюджета">
          <MultiSelect options={opts.budgetItems} value={budgetItems} onChange={v => setFilter('budgetItems', v)} />
        </Section>

        <Section title="👤 Ответственный">
          <MultiSelect options={opts.responsible} value={responsible} onChange={v => setFilter('responsible', v)} />
        </Section>

        <div className="p-4">
          <button onClick={resetAll}
            className="w-full py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs hover:bg-red-500/20 transition-colors">
            🗑️ Сбросить все фильтры
          </button>
        </div>
      </aside>
    </>
  );
}
