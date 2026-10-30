export const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
export const todayStr = () => {
  const t = new Date();
  return ymd(t.getFullYear(), t.getMonth(), t.getDate());
};
