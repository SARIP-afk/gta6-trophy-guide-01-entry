// Leonida 55: offline guide + tracker for GTA VI's 55 PS5 trophies.
// Loads data/trophies.json from this app only, keeps earned ticks and the spoiler
// setting in localStorage, and exports/imports progress as a JSON file.
// New in this revision: per-card stage labels and source lines, difficulty (1-5)
// and time estimates per trophy (our own estimates, labelled est.), a Next up
// box, Previous/Next navigation in roadmap order, and Sort / Status / Hide
// earned controls. Trophy order is the roadmap order: stage first, then id.
const EARNED_KEY = 'leonida-trophy-earned-v1';
const SPOILER_KEY = 'leonida-trophy-spoilers-v1';
const KINDS = [
  ['all', 'All'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['collectibles', 'Collectibles'],
  ['activities', 'Activities'],
  ['online', 'Online'],
  ['platinum', 'Platinum'],
];
const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
const SORTS = ['roadmap', 'name', 'grade'];

const params = new URLSearchParams(location.search);
const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const guideTitleEl = $('guideTitle');
const guideBodyEl = $('guideBody');

let data = null;
let earned = new Set(readJson(EARNED_KEY, []));
let spoilersOn = readJson(SPOILER_KEY, false) || params.get('spoilers') === 'on';
let kindFilter = KINDS.some(([k]) => k === params.get('kind')) ? params.get('kind') : 'all';
let gradeFilter = GRADE_ORDER.includes(params.get('grade')) ? params.get('grade') : 'all';
let sortMode = SORTS.includes(params.get('sort')) ? params.get('sort') : 'roadmap';
let statusFilter = ['all', 'earned', 'not-earned'].includes(params.get('status')) ? params.get('status') : 'all';
let hideEarned = params.get('hideEarned') === '1';
let query = '';
let selectedId = null;

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}
function saveSpoilers() {
  localStorage.setItem(SPOILER_KEY, JSON.stringify(spoilersOn));
}
function isEarned(t) {
  return earned.has(t.id);
}
function isMasked(t) {
  return spoilersOn && t.kind === 'story' && !isEarned(t);
}
function gradeLabel(g) {
  return g.charAt(0).toUpperCase() + g.slice(1);
}
function kindLabel(k) {
  return k === 'online' ? 'Online' : k.charAt(0).toUpperCase() + k.slice(1);
}
// Roadmap order: stage first, then trophy id. Every other order derives from it.
function roadmapOrder(a, b) {
  return (a.stage - b.stage) || (a.id - b.id);
}
function roadmapList() {
  return [...data.trophies].sort(roadmapOrder);
}
function stageOf(t) {
  return data.roadmap.find((s) => s.stage === t.stage) || null;
}
function stageLine(t) {
  const s = stageOf(t);
  return s ? 'Stage ' + s.stage + ' — ' + s.title + ' · ' + s.time : 'Stage ' + t.stage;
}
function nextUp() {
  return roadmapList().find((t) => !isEarned(t)) || null;
}
function difficultyStars(n) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function renderProgress() {
  const total = data.trophies.length;
  const pct = Math.round((earned.size / total) * 100);
  $('progressCount').textContent = earned.size + ' / ' + total + ' earned';
  $('progressPct').textContent = pct + '%';
  $('progressFill').style.width = pct + '%';
  $('gradeBreakdown').innerHTML = GRADE_ORDER.map((g) => {
    const inGrade = data.trophies.filter((t) => t.grade === g);
    const got = inGrade.filter((t) => isEarned(t)).length;
    return '<span><b>' + got + '/' + inGrade.length + '</b> ' + gradeLabel(g) + '</span>';
  }).join('');
  $('platinumLine').textContent = earned.size === total
    ? 'Platinum earned: Vice Got a Price! — you are a Leonida Legend.'
    : 'Platinum: Vice Got a Price! — unlocks with the other 54.';
}

function renderChips() {
  const wrap = $('kindChips');
  wrap.replaceChildren();
  for (const [kind, label] of KINDS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.textContent = label;
    btn.setAttribute('aria-pressed', String(kindFilter === kind));
    btn.addEventListener('click', () => {
      kindFilter = kind;
      renderChips();
      renderList();
    });
    wrap.append(btn);
  }
}

function trophyMatches(t) {
  if (kindFilter === 'online') return false;
  if (kindFilter !== 'all' && t.kind !== kindFilter) return false;
  if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
  if (statusFilter === 'earned' && !isEarned(t)) return false;
  if (statusFilter === 'not-earned' && isEarned(t)) return false;
  if (hideEarned && isEarned(t)) return false;
  if (query) {
    const hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + (t.count || '')).toLowerCase();
    if (!hay.includes(query)) return false;
  }
  return true;
}

function sortedShown() {
  const shown = data.trophies.filter(trophyMatches);
  if (sortMode === 'name') shown.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortMode === 'grade') {
    shown.sort((a, b) => (GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade)) || roadmapOrder(a, b));
  } else shown.sort(roadmapOrder);
  return shown;
}

function sourceLine(parent, t, className) {
  if (!t.sources || !t.sources.length) return;
  const p = document.createElement('p');
  p.className = className;
  p.append(document.createTextNode('Sources: '));
  t.sources.forEach((s, i) => {
    if (i > 0) p.append(document.createTextNode(' · '));
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    p.append(a);
  });
  parent.append(p);
}

function renderList() {
  const shown = sortedShown();
  $('listCount').textContent = shown.length + ' of 55 trophies shown';
  $('emptyState').hidden = kindFilter !== 'online';
  listEl.replaceChildren();
  for (const t of shown) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'trophy-card' + (isEarned(t) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
    const masked = isMasked(t);
    const top = document.createElement('div');
    top.className = 'trophy-top';
    const check = document.createElement('label');
    check.className = 'trophy-check';
    check.addEventListener('click', (ev) => ev.stopPropagation());
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned(t);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      saveEarned();
      renderProgress();
      renderList();
      renderGuide();
      renderNextUp();
    });
    check.append(box, document.createTextNode(isEarned(t) ? 'Earned' : 'Earn'));
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = masked ? 'Hidden story trophy' : t.name;
    const grade = document.createElement('span');
    grade.className = 'trophy-grade grade-' + t.grade;
    grade.textContent = t.grade;
    top.append(check, name, grade);
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = masked ? 'Complete the story to reveal this trophy.' : t.description;
    const stage = document.createElement('p');
    stage.className = 'trophy-stage';
    stage.textContent = stageLine(t);
    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = kindLabel(t.kind);
    meta.append(kindTag);
    if (t.hidden) {
      const h = document.createElement('span');
      h.className = 'tag hidden';
      h.textContent = 'Hidden on PS5';
      meta.append(h);
    }
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'tag missable';
      m.textContent = 'POSSIBLY MISSABLE';
      meta.append(m);
    }
    if (t.timeSensitive) {
      const s = document.createElement('span');
      s.className = 'tag timesensitive';
      s.textContent = 'Time-sensitive';
      meta.append(s);
    }
    if (t.count) {
      const c = document.createElement('span');
      c.className = 'tag';
      c.textContent = t.count;
      meta.append(c);
    }
    if (t.unconfirmed) {
      const u = document.createElement('span');
      u.className = 'tag unconfirmed';
      u.textContent = 'Unconfirmed';
      meta.append(u);
    }
    card.append(top, desc, stage, meta);
    sourceLine(card, t, 'trophy-sources');
    card.addEventListener('click', () => {
      selectedId = t.id;
      renderList();
      renderGuide();
    });
    listEl.append(card);
  }
}

function renderRoadmap() {
  const list = $('roadmapList');
  list.replaceChildren();
  for (const step of data.roadmap) {
    const li = document.createElement('li');
    const title = document.createElement('b');
    title.textContent = 'Stage ' + step.stage + ' — ' + step.title + ' (' + step.time + ')';
    const detail = document.createElement('span');
    detail.textContent = step.detail;
    li.append(title, detail);
    list.append(li);
  }
}

function renderNextUp() {
  const body = $('nextUpBody');
  body.replaceChildren();
  const t = nextUp();
  if (!t) {
    const p = document.createElement('p');
    p.className = 'guide-empty';
    p.textContent = 'All 55 earned — platinum time! Vice Got a Price! is yours.';
    body.append(p);
    return;
  }
  const name = document.createElement('b');
  name.className = 'nextup-name';
  name.textContent = t.name;
  const stage = document.createElement('p');
  stage.className = 'trophy-stage';
  stage.textContent = stageLine(t) + ' · ' + t.grade;
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = t.description;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Open guide →';
  btn.addEventListener('click', () => {
    selectedId = t.id;
    renderList();
    renderGuide();
  });
  body.append(name, stage, desc, btn);
}

function stepSelected(delta) {
  const order = roadmapList();
  const idx = order.findIndex((t) => t.id === selectedId);
  const at = idx < 0 ? 0 : (idx + delta + order.length) % order.length;
  selectedId = order[at].id;
  renderList();
  renderGuide();
}

function renderGuide() {
  const t = data.trophies.find((x) => x.id === selectedId);
  if (!t) {
    guideTitleEl.textContent = 'Trophy guide';
    guideBodyEl.replaceChildren();
    const p = document.createElement('p');
    p.className = 'guide-empty';
    p.textContent = 'Select a trophy on the left to read its guide, with sources.';
    guideBodyEl.append(p);
    return;
  }
  const masked = isMasked(t);
  guideTitleEl.textContent = masked ? 'Hidden story trophy' : t.name;
  guideBodyEl.replaceChildren();
  const flags = document.createElement('div');
  flags.className = 'guide-flags';
  const grade = document.createElement('span');
  grade.className = 'trophy-grade grade-' + t.grade;
  grade.textContent = t.grade;
  flags.append(grade);
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = kindLabel(t.kind);
  flags.append(kindTag);
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'tag missable';
    m.textContent = 'POSSIBLY MISSABLE — see the warning above';
    flags.append(m);
  }
  if (t.timeSensitive) {
    const s = document.createElement('span');
    s.className = 'tag timesensitive';
    s.textContent = 'Time-sensitive';
    flags.append(s);
  }
  if (t.count) {
    const c = document.createElement('span');
    c.className = 'tag';
    c.textContent = t.count;
    flags.append(c);
  }
  if (t.unconfirmed) {
    const u = document.createElement('span');
    u.className = 'tag unconfirmed';
    u.textContent = 'Unconfirmed — listed honestly';
    flags.append(u);
  }
  guideBodyEl.append(flags);
  const stage = document.createElement('p');
  stage.className = 'guide-stage';
  stage.textContent = stageLine(t);
  guideBodyEl.append(stage);
  const diff = document.createElement('p');
  diff.className = 'guide-difficulty';
  diff.textContent = 'Difficulty (est.): ' + difficultyStars(t.difficulty) + ' ' + t.difficulty + '/5 · Time (est.): ' + t.time + ' — our own estimate, not a sourced fact.';
  guideBodyEl.append(diff);
  const official = document.createElement('p');
  official.className = 'guide-official';
  official.textContent = masked
    ? 'Official description hidden until earned (spoiler setting is on).'
    : 'Official: “' + t.description + '”';
  guideBodyEl.append(official);
  const text = document.createElement('p');
  text.className = 'guide-text';
  text.textContent = masked
    ? 'Earn this story trophy to reveal its guide, or switch the spoiler setting off.'
    : t.guide;
  guideBodyEl.append(text);
  if (!masked && t.sources && t.sources.length) {
    sourceLine(guideBodyEl, t, 'guide-sources');
    const ret = document.createElement('p');
    ret.className = 'guide-retrieved';
    ret.textContent = 'Sources retrieved 19 November 2026.';
    guideBodyEl.append(ret);
  }
}

function renderAll() {
  renderProgress();
  renderChips();
  renderList();
  renderRoadmap();
  renderGuide();
  renderNextUp();
}

async function boot() {
  const response = await fetch('data/trophies.json');
  data = await response.json();
  // Deep-link a trophy: ?trophy=<id> or ?trophy=<name>
  const wanted = params.get('trophy');
  if (wanted) {
    const byId = data.trophies.find((t) => String(t.id) === wanted);
    const byName = data.trophies.find((t) => t.name.toLowerCase() === wanted.toLowerCase());
    if (byId) selectedId = byId.id;
    else if (byName) selectedId = byName.id;
  }
  if (!selectedId) {
    const missable = data.trophies.find((t) => t.missable);
    selectedId = missable ? missable.id : data.trophies[0].id;
  }
  $('spoilers').checked = spoilersOn;
  $('grade').value = gradeFilter;
  $('sort').value = sortMode;
  $('status').value = statusFilter;
  $('hideEarned').checked = hideEarned;
  $('search').value = params.get('search') || '';
  query = $('search').value.trim().toLowerCase();

  $('search').addEventListener('input', () => {
    query = $('search').value.trim().toLowerCase();
    renderList();
  });
  $('grade').addEventListener('change', () => {
    gradeFilter = $('grade').value;
    renderList();
  });
  $('sort').addEventListener('change', () => {
    sortMode = $('sort').value;
    renderList();
  });
  $('status').addEventListener('change', () => {
    statusFilter = $('status').value;
    renderList();
  });
  $('hideEarned').addEventListener('change', () => {
    hideEarned = $('hideEarned').checked;
    renderList();
  });
  $('spoilers').addEventListener('change', () => {
    spoilersOn = $('spoilers').checked;
    saveSpoilers();
    renderList();
    renderGuide();
  });
  $('prevBtn').addEventListener('click', () => stepSelected(-1));
  $('nextBtn').addEventListener('click', () => stepSelected(1));
  $('missableGo').addEventListener('click', () => {
    kindFilter = 'missable';
    gradeFilter = 'all';
    $('grade').value = 'all';
    renderChips();
    renderList();
    const missable = data.trophies.find((t) => t.missable);
    if (missable) {
      selectedId = missable.id;
      renderList();
      renderGuide();
    }
  });
  $('exportBtn').addEventListener('click', () => {
    const payload = { game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b), spoilers: spoilersOn, exported: new Date().toISOString() };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    a.download = 'gta6-trophy-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      const valid = new Set(data.trophies.map((t) => t.id));
      earned = new Set((ids || []).filter((id) => valid.has(id)));
      if (typeof parsed.spoilers === 'boolean') {
        spoilersOn = parsed.spoilers;
        $('spoilers').checked = spoilersOn;
        saveSpoilers();
      }
      saveEarned();
      renderAll();
    } catch {
      alert('That file is not a valid progress export.');
    }
    ev.target.value = '';
  });
  $('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies?')) {
      earned = new Set();
      saveEarned();
      renderAll();
    }
  });

  renderAll();
  if (params.get('view') === 'roadmap') {
    $('roadmapPanel').scrollIntoView();
  }
  window.__trophyReady = true;
}

boot();
