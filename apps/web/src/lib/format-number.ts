const MILLION = 1_000_000;
const THOUSAND = 1000;

export function formatNumber(num: number | null): string {
  if (!num) {
    return "0";
  }
  if (num >= MILLION) {
    return `${(num / MILLION).toFixed(1)}M`;
  }
  if (num >= THOUSAND) {
    return `${(num / THOUSAND).toFixed(1)}K`;
  }
  return num.toString();
}
