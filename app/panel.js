// Detail panel: one trophy's guide, its sources, and Previous / Next.
// A story trophy stays masked while spoilers are on and it is not earned.
import { roadmapOrder } from './filters.js';

export function isMasked(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.id);
}

export function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function sourceLinks(trophy, catalog) {
  return trophy.sources.map((key) => {
    const entry = catalog[key];
    if (!entry) return esc(key);
    if (entry.url) return `<a href="${esc(entry.url)}" target="_blank" rel="noopener">${esc(entry.name)}</a>`;
    return esc(entry.name);
  });
}

export function renderDetail(panel, trophy, ctx) {
  const { catalog, stages, earned, spoilerOn, retrieved } = ctx;
  const masked = isMasked(trophy, spoilerOn, earned);
  const stage = stages.find((s) => s.id === trophy.stage);
  const ordered = roadmapOrder(ctx.trophies);
  const pos = ordered.findIndex((t) => t.id === trophy.id);
  const prev = ordered[(pos - 1 + ordered.length) % ordered.length];
  const next = ordered[(pos + 1) % ordered.length];
  const gradeLabel = trophy.grade[0].toUpperCase() + trophy.grade.slice(1);

  let body = '';
  if (masked) {
    body = `
      <p class="ln-stage-line">Stage <b>${trophy.stage} · ${esc(stage ? stage.name : '')}</b> · #${pos + 1} of 55 in roadmap order</p>
      <h2>Hidden story trophy</h2>
      <blockquote>Earn this story trophy to reveal its name and description.</blockquote>
      <p>Turn off “Hide story spoilers” above, or tick the box once you have earned it in-game, to read its guide.</p>`;
  } else {
    const badges = [
      `<span class="ln-grade-badge ${esc(trophy.grade)}">${esc(gradeLabel)}</span>`,
      `<span class="ln-tag">${esc(trophy.kind)}</span>`,
      trophy.hidden ? '<span class="ln-tag hidden-tag">Hidden on PSN</span>' : '',
      trophy.missable === 'possible' ? '<span class="ln-tag missable">⚠ Possibly missable</span>' : '',
      trophy.unconfirmed ? '<span class="ln-tag unconfirmed">Unconfirmed</span>' : '',
    ].filter(Boolean).join('');
    const missableNote = trophy.missable === 'possible'
      ? `<p class="ln-missable-note"><strong>Possibly missable.</strong> The Chapter 1 meditation may be required for this trophy and disappears after Chapter 1 — that is still unconfirmed, so do it early and keep a manual save from the start of Chapter 1.</p>` : '';
    const unconfirmedNote = trophy.unconfirmed
      ? `<p class="ln-unconfirmed-note"><strong>Unconfirmed.</strong> No reliable unlock method has been published yet. This guide lists it honestly instead of guessing — check the linked sources for updates.</p>` : '';
    const countLine = trophy.countLabel ? `<dd>${esc(trophy.countLabel)}</dd>` : '<dd>—</dd>';
    body = `
      <p class="ln-stage-line">Stage <b>${trophy.stage} · ${esc(stage ? stage.name : '')}</b> · #${pos + 1} of 55 in roadmap order</p>
      <h2>${esc(trophy.name)}</h2>
      <div class="ln-detail-badges">${badges}</div>
      <blockquote>${esc(trophy.description)}</blockquote>
      ${missableNote}${unconfirmedNote}
      <div class="ln-meta-boxes">
        <dl class="ln-meta-box"><dt>Difficulty (1–5)</dt><dd>${trophy.difficulty} / 5</dd></dl>
        <dl class="ln-meta-box"><dt>Time (est.)</dt><dd>${esc(trophy.time)}</dd></dl>
        <dl class="ln-meta-box"><dt>Target</dt>${countLine}</dl>
        <dl class="ln-meta-box"><dt>Status</dt><dd>${earned.has(trophy.id) ? '✓ Earned' : 'Not earned yet'}</dd></dl>
      </div>
      <h3>How to earn it — in our own words</h3>
      <p>${esc(trophy.guide)}</p>
      <h3>Sources for this guide</h3>
      <div class="ln-source-block"><ul>${sourceLinks(trophy, catalog).map((l) => `<li>${l}</li>`).join('')}</ul>
      <p>Retrieved ${esc(retrieved)}.</p></div>`;
  }

  panel.innerHTML = body + `
    <div class="ln-detail-nav">
      <button type="button" class="primary" data-act="toggle">${earned.has(trophy.id) ? '✓ Earned — untick' : 'Mark earned'}</button>
      <button type="button" data-act="prev">← Previous</button>
      <button type="button" data-act="next">Next →</button>
      <button type="button" data-act="nextup">Make this my next stop</button>
    </div>`;
  panel.querySelector('[data-act="toggle"]').addEventListener('click', () => ctx.onToggle(trophy.id));
  panel.querySelector('[data-act="prev"]').addEventListener('click', () => ctx.onSelect(prev.id));
  panel.querySelector('[data-act="next"]').addEventListener('click', () => ctx.onSelect(next.id));
  panel.querySelector('[data-act="nextup"]').addEventListener('click', () => ctx.onSetNextUp(trophy.id));
}
