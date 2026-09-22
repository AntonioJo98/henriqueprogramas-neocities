export function filterCafes(cafes, { query = '', minWifi = 0, needsPower = false } = {}) {
  const needle = query.trim().toLowerCase();
  return cafes.filter((cafe) => {
    const matchesQuery = !needle || `${cafe.name} ${cafe.area}`.toLowerCase().includes(needle);
    const matchesWifi = Number(cafe.wifi) >= Number(minWifi || 0);
    const matchesPower = !needsPower || Number(cafe.power) >= 3;
    return matchesQuery && matchesWifi && matchesPower;
  });
}

export function addCafeSuggestion(existing, values) {
  const errors = validate(values);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  const baseId = slugify(values.name);
  const ids = new Set(existing.map((cafe) => cafe.id));
  let id = baseId;
  let suffix = 2;
  while (ids.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }
  return {
    ok: true,
    cafe: {
      id,
      name: values.name.trim(),
      area: values.area.trim(),
      open: values.open,
      close: values.close,
      coffee: Number(values.coffee),
      wifi: Number(values.wifi),
      power: Number(values.power),
      custom: true,
    },
  };
}

export function normaliseStoredSuggestions(cafes) {
  if (!Array.isArray(cafes)) return [];
  return cafes.flatMap((cafe) => {
    const result = addCafeSuggestion([], cafe ?? {});
    return result.ok ? [{ ...result.cafe, id: String(cafe.id || result.cafe.id) }] : [];
  });
}

function validate(values) {
  const errors = {};
  for (const field of ['name', 'area', 'open', 'close']) {
    if (!String(values[field] ?? '').trim()) errors[field] = `${field} is required.`;
  }
  for (const field of ['coffee', 'wifi', 'power']) {
    const rating = Number(values[field]);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      errors[field] = `${field} must be between 1 and 5.`;
    }
  }
  return errors;
}

function slugify(value) {
  return String(value).trim().toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'custom-cafe';
}
