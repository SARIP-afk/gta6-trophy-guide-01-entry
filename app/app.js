// Leonida 55 boot: load the trophy data, wire the toolbar, render the list,
// the guide panel, the roadmap and the sources — then keep them in sync.
import { loadEarned, saveEarned, loadSettings, saveSettings, clearAllStored, nextUpId, countByGrade } from './state.js';
import { KIND_LABELS, kindCount, visibleTrophies } from './filters.js';
import { renderDetail as paintDetail, isMasked, esc } from './panel.js';
import { renderPhaseStrip, renderStageGrid, renderNextUp } from './roadmap.js';

const $ = (id) => document.getElementById(id);

let data = null;
let earned = loadEarned();
let settings = loadSettings();
let query = '';
let selectedId = 'positive-mental-attitude';
let pinnedNextUp = null;

function persistSettings() {
  saveSettings({ spoiler: settings.spoiler, hideEarned: settings.hideEarned, sort: settings.sort, status: settings.status, grade: settings.grade, kind: settings.kind });
}

function currentUi() {
  return { query, kind: settings.kind, grade: settings.grade, sort: settings.sort, status: settings.status, hideEarned: settings.hideEarned };
}

function renderProgress() {
  const total = data.trophies.length;
  const done = earned.size;
  $('ln-earned-count').textContent = `${done}/${total}`;
  $('ln-earned-pct').textContent = `${Math.round((done / total) * 100)}% to the platinum`;
  $('ln-meter-fill').style.width = `${(done / total) * 100}%`;
  const byGrade = countByGrade(data.trophies, earned);
  $('ln-grade-counts').textContent =
    `${byGrade.platinum[0]}/${byGrade.platinum[1]} platinum · ${byGrade.gold[0]}/${byGrade.gold[1]} gold · ${byGrade.silver[0]}/${byGrade.silver[1]} silver · ${byGrade.bronze[0]}/${byGrade.bronze[1]} bronze · 28 hidden`;
}

function renderChips() {
  const box = $('ln-chips');
  box.innerHTML = '';
  for (const [kind, label] of Object.entries(KIND_LABELS)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ln-chip';
    btn.setAttribute('aria-pressed', String(settings.kind === kind));
    btn.innerHTML = `${esc(label)} <small>${kindCount(data.trophies, kind)}</small>`;
    btn.addEventListener('click', () => {
      settings.kind = kind;
      persistSettings();
      renderAll();
    });
    box.appendChild(btn);
  }
}

function rowFor(trophy) {
  const li = document.createElement('li');
  li.className = 'ln-row' + (earned.has(trophy.id) ? ' is-earned' : '');
  if (trophy.id === selectedId) li.setAttribute('aria-current', 'true');
  const masked = isMasked(trophy, settings.spoiler, earned);
  const name = masked ? 'Hidden story trophy' : trophy.name;
  const desc = masked ? 'Earn this story trophy to reveal its name and description.' : trophy.description;
  const tags = [
    `<span class="ln-tag">${esc(KIND_LABELS[trophy.kind] || trophy.kind)}</span>`,
    `<span class="ln-tag">Stage ${trophy.stage}</span>`,
    trophy.hidden ? '<span class="ln-tag hidden-tag">Hidden on PSN</span>' : '',
    trophy.missable === 'possible' ? '<span class="ln-tag missable">⚠ Possibly missable</span>' : '',
    trophy.unconfirmed ? '<span class="ln-tag unconfirmed">Unconfirmed</span>' : '',
  ].filter(Boolean).join('');
  const sourceNames = trophy.sources.map((key) => esc(data.sources[key] ? data.sources[key].name : key)).join(' · ');
  li.innerHTML = `
    <input type="checkbox" ${earned.has(trophy.id) ? 'checked' : ''} aria-label="Mark ${esc(name)} earned">
    <span class="ln-pip ${esc(trophy.grade)}" title="${esc(trophy.grade)}"></span>
    <span class="ln-row-name">${esc(name)}${earned.has(trophy.id) ? ' <span class="ln-earned-tag">✓ Earned</span>' : ''}</span>
    <span class="ln-row-count">${trophy.countLabel ? esc(trophy.countLabel) : ''}</span>
    <span class="ln-row-desc">${esc(desc)}</span>
    <span class="ln-row-tags">${tags}</span>
    <span class="ln-row-sources">Sources: ${sourceNames}</span>`;
  li.querySelector('input').addEventListener('click', (event) => {
    event.stopPropagation();
    toggleEarned(trophy.id);
  });
  li.addEventListener('click', () => selectTrophy(trophy.id));
  return li;
}

function renderList() {
  const rows = visibleTrophies(data.trophies, currentUi(), earned);
  const list = $('ln-list');
  list.innerHTML = '';
  for (const t of rows) list.appendChild(rowFor(t));
  $('ln-empty').hidden = rows.length > 0;
  $('ln-showing').textContent = `Showing ${rows.length} of ${data.trophies.length} · ${earned.size} earned`;
}

function renderDetail() {
  const trophy = data.trophies.find((t) => t.id === selectedId) || data.trophies[0];
  selectedId = trophy.id;
  renderDetailPanel(trophy);
}

function renderDetailPanel(trophy) {
  paintDetail($('ln-detail'), trophy, {
    catalog: data.sources,
    stages: data.stages,
    trophies: data.trophies,
    earned,
    spoilerOn: settings.spoiler,
    retrieved: data.retrieved,
    onToggle: toggleEarned,
    onSelect: selectTrophy,
    onSetNextUp: (id) => { pinnedNextUp = id; renderNextUpBox(); },
  });
}

function renderNextUpBox() {
  const id = pinnedNextUp && !earned.has(pinnedNextUp) ? pinnedNextUp : nextUpId(data.trophies, earned);
  const trophy = data.trophies.find((t) => t.id === id) || null;
  renderNextUp($('ln-nextup'), trophy, selectTrophy);
}

function renderRoadmap() {
  renderPhaseStrip($('ln-phases'), data.stages, data.trophies, earned);
  renderStageGrid($('ln-stage-grid'), data.stages, data.trophies, earned, settings.spoiler);
}

function renderSourceList() {
  const ul = $('ln-source-list');
  ul.innerHTML = '';
  for (const entry of Object.values(data.sources)) {
    const li = document.createElement('li');
    if (entry.url) {
      const a = document.createElement('a');
      a.href = entry.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = entry.name;
      li.append(a, document.createTextNode(` — ${entry.note}. Retrieved ${entry.retrieved}.`));
    } else {
      li.textContent = `${entry.name} — ${entry.note}. Retrieved ${entry.retrieved}.`;
    }
    ul.appendChild(li);
  }
}

function renderAll() {
  renderProgress();
  renderChips();
  renderList();
  renderDetail();
  renderNextUpBox();
  renderRoadmap();
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id);
  else earned.add(id);
  saveEarned(earned);
  if (pinnedNextUp === id && earned.has(id)) pinnedNextUp = null;
  renderAll();
}

function selectTrophy(id) {
  selectedId = id;
  renderList();
  renderDetail();
  document.querySelector('.ln-detail-col').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function exportProgress() {
  const payload = { app: 'leonida55', version: 1, exportedAt: new Date().toISOString(), earned: [...earned].sort(), settings };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida55-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!Array.isArray(parsed.earned)) throw new Error('no earned list');
      const valid = new Set(data.trophies.map((t) => t.id));
      earned = new Set(parsed.earned.filter((id) => valid.has(id)));
      saveEarned(earned);
      pinnedNextUp = null;
      renderAll();
    } catch {
      alert('That file is not a Leonida 55 progress export.');
    }
  };
  reader.readAsText(file);
}

function wireToolbar() {
  $('ln-query').addEventListener('input', (event) => { query = event.target.value; renderList(); });
  $('ln-grade').value = settings.grade;
  $('ln-grade').addEventListener('change', (event) => { settings.grade = event.target.value; persistSettings(); renderList(); });
  $('ln-sort').value = settings.sort;
  $('ln-sort').addEventListener('change', (event) => { settings.sort = event.target.value; persistSettings(); renderList(); });
  $('ln-status').value = settings.status;
  $('ln-status').addEventListener('change', (event) => { settings.status = event.target.value; persistSettings(); renderList(); });
  $('ln-hide-earned').checked = settings.hideEarned;
  $('ln-hide-earned').addEventListener('change', (event) => { settings.hideEarned = event.target.checked; persistSettings(); renderAll(); });
  $('ln-spoilers').checked = settings.spoiler;
  $('ln-spoilers').addEventListener('change', (event) => { settings.spoiler = event.target.checked; persistSettings(); renderAll(); });
  $('ln-export').addEventListener('click', exportProgress);
  $('ln-import-btn').addEventListener('click', () => $('ln-import').click());
  $('ln-import').addEventListener('change', (event) => { if (event.target.files[0]) importProgress(event.target.files[0]); event.target.value = ''; });
  $('ln-reset').addEventListener('click', () => {
    if (confirm('Reset all earned trophies? This clears your saved progress.')) {
      earned = new Set();
      saveEarned(earned);
      pinnedNextUp = null;
      renderAll();
    }
  });
  $('ln-banner-open').addEventListener('click', () => selectTrophy('positive-mental-attitude'));
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement !== $('ln-query')) {
      event.preventDefault();
      $('ln-query').focus();
    }
  });
}

async function boot() {
  const response = await fetch('data/trophies.json');
  data = await response.json();
  const params = new URLSearchParams(location.search);
  const wanted = params.get('trophy');
  if (wanted && data.trophies.some((t) => t.id === wanted)) selectedId = wanted;
  if (params.get('kind') && KIND_LABELS[params.get('kind')]) settings.kind = params.get('kind');
  if (params.get('spoilers') === 'off') settings.spoiler = false;
  wireToolbar();
  renderAll();
  renderSourceList();
}

boot();
