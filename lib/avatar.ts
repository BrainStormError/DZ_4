export function initialsOf(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return initials || '?';
}

const PALETTE: Array<[string, string]> = [
  ['#3b82f6', '#1d4ed8'],
  ['#f97316', '#ea580c'],
  ['#10b981', '#047857'],
  ['#8b5cf6', '#6d28d9'],
  ['#ec4899', '#be185d'],
];

export function defaultAvatarUrl(fullName: string): string {
  const initials = initialsOf(fullName);
  const index = initials.charCodeAt(0) % PALETTE.length;
  const [from, to] = PALETTE[index];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/></linearGradient></defs><rect width="150" height="150" rx="75" fill="url(#g)"/><text x="75" y="78" text-anchor="middle" dominant-baseline="central" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700" fill="#ffffff">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
