import { useFilterStore } from '../../store/useFilterStore';

export default function Header() {
  const { activeChips, removeChip, resetAll, toggleSidebar, sidebarOpen } = useFilterStore();
  const chips = Object.entries(activeChips);

  const labels = {
    type: 'Тип', bank: 'Банк', object: 'Объект', project: 'Проект',
    budgetItem: 'Статья', responsible: 'Ответств.', paymentType: 'Оплата', month: 'Период'
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-surface-900 border-b border-slate-700/50 flex items-center px-4 gap-3">
      <button
        onClick={toggleSidebar}
        className="flex flex-col gap-1 p-2 rounded-lg hover:bg-slate-700 transition-colors"
        title={sidebarOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
      >
        <span className={`block w-5 h-0.5 bg-slate-300 transition-transform duration-250 ${sidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`}/>
        <span className={`block w-5 h-0.5 bg-slate-300 transition-opacity duration-250 ${sidebarOpen ? 'opacity-0' : ''}`}/>
        <span className={`block w-5 h-0.5 bg-slate-300 transition-transform duration-250 ${sidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`}/>
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white shrink-0">П</div>
        <span className="font-bold text-white text-sm hidden sm:block">ПСК Ньютек</span>
        <span className="text-slate-500 hidden sm:block">·</span>
        <span className="text-slate-300 text-sm hidden sm:block">Финансовый дашборд</span>
      </div>

      {chips.length > 0 && (
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto ml-2">
          {chips.map(([dim, val]) => (
            <span key={dim} className="flex items-center gap-1 bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
              <span className="text-blue-400">{labels[dim]}:</span>
              <span className="max-w-24 truncate">{val}</span>
              <button onClick={() => removeChip(dim)} className="ml-1 hover:text-white">✕</button>
            </span>
          ))}
          <button onClick={resetAll} className="text-xs text-slate-400 hover:text-red-400 whitespace-nowrap shrink-0 transition-colors">
            Сбросить всё
          </button>
        </div>
      )}

      <div className="ml-auto text-xs text-slate-500 hidden lg:block">
        01.2024 – 05.2026
      </div>
    </header>
  );
}
