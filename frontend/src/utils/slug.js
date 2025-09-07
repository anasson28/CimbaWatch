export function slugifyTitle(title) {
  if (!title) return '';
  return String(title)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // remove non alnum
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildSlug(title, id) {
  const s = slugifyTitle(title);
  if (id != null && id !== '') return `${s}-${id}`;
  return s;
}

export function extractIdFromSlug(param) {
  if (!param) return null;
  const m = String(param).match(/-(\d+)$/);
  if (m) return Number(m[1]);
  // If the entire param is numeric, treat it as an ID
  if (/^\d+$/.test(String(param))) return Number(param);
  return null;
}

export function slugToQuery(param) {
  if (!param) return '';
  return String(param)
    .replace(/-(\d+)$/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}
