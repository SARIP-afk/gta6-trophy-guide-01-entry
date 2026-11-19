// Roadmap strip, stage cards and the Next Up box. All three read the same
// earned set, so their progress bars can never disagree with the list.
import { esc, isMasked } from './panel.js';

export function renderPhaseStrip(listEl, stages, trophies, earned) {
  listEl.innerHTML = stages.map((stage) => {
    const inStage = trophies.filter((t) => t.stage === stage.id);
    const done = inStage.filter((t) => earned.has(t.id)).length;
    const pct = inStage.length ? Math.round((done / inStage.length) * 100) : 0;
    return `<li><div class="ln-phase-top"><span>Stage ${stage.id} · ${esc(stage.name)}</span><b>${done}/${inStage.length}</b></div>
      <p>${esc(stage.time)} · ${esc(stage.blurb.split('.')[0])}.</p>
      <div class="ln-phase-bar"><i style="width:${pct}%"></i></div></li>`;
  }).join('');
}

export function renderStageGrid(gridEl, stages, trophies, earned, spoilerOn) {
  gridEl.innerHTML = stages.map((stage) => {
    const inStage = trophies.filter((t) => t.stage === stage.id);
    const done = inStage.filter((t) => earned.has(t.id)).length;
    const names = inStage.map((t) => {
      const label = isMasked(t, spoilerOn, earned) ? 'Hidden story trophy' : t.name;
      const cls = earned.has(t.id) ? ' class="is-earned"' : '';
      return `<li${cls}>${esc(label)}</li>`;
    }).join('');
    return `<article class="ln-stage-card"><h3>Stage ${stage.id} — ${esc(stage.name)}</h3>
      <p class="ln-stage-meta">${done}/${inStage.length} earned · ${esc(stage.time)}</p>
      <p>${esc(stage.blurb)}</p><ul>${names}</ul></article>`;
  }).join('');
}

export function renderNextUp(boxEl, trophy, onOpen) {
  if (!trophy) {
    boxEl.innerHTML = `<p class="ln-nextup-label">Next up</p><h3>Platinum earned — Leonida Legend!</h3><p>Every trophy is ticked. Export your progress as a keepsake.</p>`;
    return;
  }
  const stageWord = trophy.stage === 1 ? 'Story first' : trophy.stage === 2 ? 'The 100% checklist' : trophy.stage === 3 ? 'Strangers & side quests' : 'Crime & cleanup';
  boxEl.innerHTML = `<p class="ln-nextup-label">Next up</p><h3>${esc(trophy.name)}</h3>
    <p>Stage ${trophy.stage} · ${esc(stageWord)} · ${esc(trophy.grade)}${trophy.countLabel ? ` · ${esc(trophy.countLabel)}` : ''} — ${esc(trophy.description)}</p>`;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Open its guide';
  btn.addEventListener('click', () => onOpen(trophy.id));
  boxEl.appendChild(btn);
}
