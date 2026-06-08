export const fmt = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '—';
  if (Math.abs(n) >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace('.', ',') + ' M ₽';
  if (Math.abs(n) >= 1_000)
    return (n / 1_000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' K ₽';
  return n.toFixed(0) + ' ₽';
};

export const fmtFull = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' ₽';
};

export const fmtDate = (d) => {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
};

export const fmtMonth = (ym) => {
  const months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  const [y, m] = ym.split('-');
  return `${months[parseInt(m, 10) - 1]} ${y.slice(2)}`;
};

export const fmtQuarter = (ym) => {
  const [y, m] = ym.split('-');
  const q = Math.ceil(parseInt(m, 10) / 3);
  return `Q${q} ${y}`;
};
