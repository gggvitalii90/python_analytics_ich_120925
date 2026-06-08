import { useMemo } from 'react';
import rawData from '../data/transactions.json';
import { useFilterStore } from '../store/useFilterStore';

// Pre-parse dates once
const DATA = rawData.map(r => ({ ...r, _d: r.date }));

export function useFilteredData() {
  const { dateFrom, dateTo, types, paymentTypes, banks, objects, projects,
          budgetItems, responsible, activeChips } = useFilterStore();

  return useMemo(() => {
    return DATA.filter(r => {
      if (r._d < dateFrom || r._d > dateTo) return false;
      if (types.length && !types.includes(r.type)) return false;
      if (paymentTypes.length && !paymentTypes.includes(r.paymentType)) return false;
      if (banks.length && !banks.includes(r.bank)) return false;
      if (objects.length && !objects.includes(r.object)) return false;
      if (projects.length && !projects.includes(r.project)) return false;
      if (budgetItems.length && !budgetItems.includes(r.budgetItem)) return false;
      if (responsible.length && !responsible.includes(r.responsible)) return false;

      // Chart click chips
      for (const [dim, val] of Object.entries(activeChips)) {
        if (dim === 'type'       && r.type       !== val) return false;
        if (dim === 'bank'       && r.bank        !== val) return false;
        if (dim === 'object'     && r.object      !== val) return false;
        if (dim === 'project'    && r.project     !== val) return false;
        if (dim === 'budgetItem' && r.budgetItem  !== val) return false;
        if (dim === 'responsible'&& r.responsible !== val) return false;
        if (dim === 'paymentType'&& r.paymentType !== val) return false;
        if (dim === 'month') {
          const ym = r._d.slice(0, 7);
          if (ym !== val) return false;
        }
      }
      return true;
    });
  }, [dateFrom, dateTo, types, paymentTypes, banks, objects, projects,
      budgetItems, responsible, activeChips]);
}

export function useAllOptions() {
  return useMemo(() => ({
    types:        [...new Set(DATA.map(r => r.type).filter(Boolean))].sort(),
    paymentTypes: [...new Set(DATA.map(r => r.paymentType).filter(Boolean))].sort(),
    banks:        [...new Set(DATA.map(r => r.bank).filter(Boolean))].sort(),
    objects:      [...new Set(DATA.map(r => r.object).filter(Boolean))].sort(),
    projects:     [...new Set(DATA.map(r => r.project).filter(Boolean))].sort(),
    budgetItems:  [...new Set(DATA.map(r => r.budgetItem).filter(Boolean))].sort(),
    responsible:  [...new Set(DATA.map(r => r.responsible).filter(Boolean))].sort(),
  }), []);
}
