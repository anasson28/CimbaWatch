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

// Build SEO-friendly slug: title-year (if year available)
export function buildSlug(title, year) {
  const s = slugifyTitle(title);
  const y = year && String(year).match(/^\d{4}$/) ? String(year) : '';
  return y ? `${s}-${y}` : s;
}

// Back-compat: extract trailing numeric ID if present (legacy URLs)
export function extractIdFromSlug(param) {
  if (!param) return null;
  const m = String(param).match(/-(\d{5,})$/); // assume IDs are >=5 digits typically
  if (m) return Number(m[1]);
  if (/^\d+$/.test(String(param))) return Number(param);
  return null;
}

export function slugToQuery(param) {
  if (!param) return '';
  return String(param)
    // strip trailing -YYYY or -<legacy-id>
    .replace(/-(\d{4}|\d{5,})$/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

// Parse slug into { titleQuery, year }
export function parseSlug(param) {
  const raw = String(param || '').trim();
  let year = null;
  let base = raw;
  const ym = raw.match(/-(\d{4})$/);
  if (ym) {
    year = Number(ym[1]);
    base = raw.slice(0, -ym[0].length);
  }
  const titleQuery = base.replace(/[-_]+/g, ' ').trim();
  return { titleQuery, year };
}
