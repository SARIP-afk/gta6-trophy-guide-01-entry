// Progress + settings store for Leonida 55. Everything lives in localStorage
// under one key, so the tracker survives reloads and works fully offline.
export const PROGRESS_KEY = 'leonida55-progress-v1';
export const SETTINGS_KEY = 'leonida55-settings-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.earned)) return new Set();
    return new Set(parsed.earned.filter((id) => typeof id === 'string'));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ app: 'leonida55', earned: [...earned].sort() }));
  } catch {
    // Storage full or blocked: progress just won't persist this session.
  }
}

export function loadSettings() {
  const defaults = { spoiler: true, hideEarned: false, sort: 'roadmap', status: 'all', grade: 'all', kind: 'all' };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore: settings just won't persist.
  }
}

export function clearAllStored() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch {
    // Ignore.
  }
}

// First not-earned trophy in roadmap order (stage, then list order).
export function nextUpId(trophies, earned) {
  const ordered = [...trophies].sort((a, b) => a.stage - b.stage || trophies.indexOf(a) - trophies.indexOf(b));
  const next = ordered.find((t) => !earned.has(t.id));
  return next ? next.id : null;
}

export function countByGrade(trophies, earned) {
  const out = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    out[t.grade][1] += 1;
    if (earned.has(t.id)) out[t.grade][0] += 1;
  }
  return out;
}
