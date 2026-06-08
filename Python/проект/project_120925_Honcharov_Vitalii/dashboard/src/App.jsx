import { useState, Suspense } from 'react';
import Header from './components/Layout/Header';
import FilterPanel from './components/Filters/FilterPanel';
import KPICards from './components/KPI/KPICards';
import CashFlowChart from './components/Charts/CashFlowChart';
import OperationTypePie3D from './components/Charts/OperationTypePie3D';
import BankPie3D from './components/Charts/BankPie3D';
import ProjectsTab from './components/Charts/ProjectsTab';
import CostsTab from './components/Charts/CostsTab';
import TransactionTable from './components/Table/TransactionTable';
import { useFilterStore } from './store/useFilterStore';

const TABS = [
  { id: 'overview',  label: '📈 Обзор' },
  { id: 'projects',  label: '🏗️ Проекты' },
  { id: 'costs',     label: '💰 Затраты' },
  { id: 'details',   label: '🔍 Детали' },
];

function Spinner() {
  return (
    <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
      <div className="animate-spin mr-2 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
      Загрузка...
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('overview');
  const sidebarOpen = useFilterStore(s => s.sidebarOpen);

  return (
    <div className="min-h-screen bg-surface-900 font-sans">
      <Header />
      <FilterPanel />

      {/* Main content area — shifts right when sidebar open on desktop */}
      <main
        className={`pt-14 min-h-screen transition-all duration-250 ease-in-out
          ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}
      >
        <div className="p-3 sm:p-4 max-w-screen-2xl mx-auto space-y-4">

          {/* KPI Cards — always visible */}
          <Suspense fallback={<Spinner />}>
            <KPICards />
          </Suspense>

          {/* Tab bar */}
          <div className="flex gap-1 sm:gap-2 border-b border-slate-700 pb-0 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg whitespace-nowrap transition-all duration-200 border border-transparent
                  ${tab === t.id
                    ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white border-blue-500 border-b-transparent -mb-px'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <Suspense fallback={<Spinner />}>
            <div className="chart-fade">
              {tab === 'overview' && (
                <div className="space-y-4">
                  <CashFlowChart />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <OperationTypePie3D />
                    <BankPie3D />
                  </div>
                </div>
              )}
              {tab === 'projects' && <ProjectsTab />}
              {tab === 'costs'    && <CostsTab />}
              {tab === 'details'  && <TransactionTable />}
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
