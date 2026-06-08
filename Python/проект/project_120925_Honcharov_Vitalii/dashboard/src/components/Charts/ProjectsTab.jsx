import { useMemo } from 'react';
import { useFilteredData } from '../../hooks/useFilteredData';
import HBarChart from './HBarChart';
import PivotTable from '../Pivot/PivotTable';

export default function ProjectsTab() {
  const data = useFilteredData();
  const expenses = data.filter(r => r.type === 'Расход');

  const projectData = useMemo(() => {
    const m = {};
    expenses.forEach(r => { if (r.project) m[r.project] = (m[r.project] || 0) + r.totalAmount; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const objectData = useMemo(() => {
    const m = {};
    expenses.forEach(r => { if (r.object) m[r.object] = (m[r.object] || 0) + r.totalAmount; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HBarChart title="📊 Расходы по проектам" data={projectData} dimension="project" color="#3b82f6" top={15} />
        <HBarChart title="🏗️ Расходы по объектам" data={objectData} dimension="object" color="#a855f7" top={15} />
      </div>
      <PivotTable />
    </div>
  );
}
