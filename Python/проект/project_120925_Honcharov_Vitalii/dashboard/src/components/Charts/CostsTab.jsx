import { useMemo } from 'react';
import { useFilteredData } from '../../hooks/useFilteredData';
import DonutChart from './DonutChart';
import HBarChart from './HBarChart';

export default function CostsTab() {
  const data = useFilteredData();
  const expenses = data.filter(r => r.type === 'Расход');

  const budgetData = useMemo(() => {
    const m = {};
    expenses.forEach(r => { if (r.budgetItem) m[r.budgetItem] = (m[r.budgetItem] || 0) + r.totalAmount; });
    const sorted = Object.entries(m).sort((a, b) => b[1] - a[1]);
    const top10 = sorted.slice(0, 10);
    const otherSum = sorted.slice(10).reduce((s, [, v]) => s + v, 0);
    const result = top10.map(([name, value]) => ({ name, value }));
    if (otherSum > 0) result.push({ name: 'Прочее', value: otherSum });
    return result;
  }, [expenses]);

  const paymentData = useMemo(() => {
    const m = {};
    data.forEach(r => {
      const pt = r.paymentType || 'Не указан';
      m[pt] = (m[pt] || 0) + r.totalAmount;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [data]);

  const responsibleData = useMemo(() => {
    const m = {};
    expenses.forEach(r => { if (r.responsible) m[r.responsible] = (m[r.responsible] || 0) + r.totalAmount; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DonutChart title="🍩 Статья бюджета (top-10)" data={budgetData} dimension="budgetItem" />
        <DonutChart title="💳 Тип оплаты" data={paymentData} dimension="paymentType" />
      </div>
      <HBarChart title="👤 Расходы по ответственным" data={responsibleData} dimension="responsible" color="#22c55e" top={13} />
    </div>
  );
}
