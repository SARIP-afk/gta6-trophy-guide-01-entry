// Filtering + sorting for the trophy list. One pure function in, one
// ordered array out, so the list, the counts and the screenshots all agree.
export const KIND_LABELS = {
  all: 'All',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  robbery: 'Robbery',
  money: 'Money',
  exploration: 'Exploration',
  strangers: 'Strangers',
  combat: 'Combat',
  platinum: 'Platinum path',
  online: 'Online',
};

const GRADE_RANK = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

export function kindCount(trophies, kind) {
  if (kind === 'all') return trophies.length;
  if (kind === 'missable') return trophies.filter((t) => t.missable === 'possible').length;
  if (kind === 'online') return 0;
  return trophies.filter((t) => t.kind === kind).length;
}

export function visibleTrophies(trophies, ui, earned) {
  const query = (ui.query || '').trim().toLowerCase();
  let rows = trophies.filter((t) => {
    if (ui.kind === 'missable' && t.missable !== 'possible') return false;
    if (ui.kind === 'online') return false;
    if (ui.kind !== 'all' && ui.kind !== 'missable' && t.kind !== ui.kind) return false;
    if (ui.grade !== 'all' && t.grade !== ui.grade) return false;
    if (ui.status === 'earned' && !earned.has(t.id)) return false;
    if (ui.status === 'not-earned' && earned.has(t.id)) return false;
    if (ui.hideEarned && earned.has(t.id)) return false;
    if (query && !(t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query))) return false;
    return true;
  });
  const indexOf = new Map(trophies.map((t, i) => [t.id, i]));
  if (ui.sort === 'name') rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
  else if (ui.sort === 'grade') rows = [...rows].sort((a, b) => GRADE_RANK[a.grade] - GRADE_RANK[b.grade] || indexOf.get(a.id) - indexOf.get(b.id));
  else if (ui.sort === 'difficulty') rows = [...rows].sort((a, b) => a.difficulty - b.difficulty || a.stage - b.stage || indexOf.get(a.id) - indexOf.get(b.id));
  else rows = [...rows].sort((a, b) => a.stage - b.stage || indexOf.get(a.id) - indexOf.get(b.id));
  return rows;
}

// Roadmap order of the whole list (stage, then list order).
export function roadmapOrder(trophies) {
  const indexOf = new Map(trophies.map((t, i) => [t.id, i]));
  return [...trophies].sort((a, b) => a.stage - b.stage || indexOf.get(a.id) - indexOf.get(b.id));
}
