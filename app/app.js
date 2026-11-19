// Vice City Trophy Atlas — tracker + guide logic.
// State lives in localStorage; the only file loaded at run time is data/trophies.json
// from this same app folder, so the Atlas works fully offline.
const STORAGE_KEY = 'vice-trophy-atlas-progress-v1';
const SPOILER_KEY = 'vice-trophy-atlas-spoilers-v1';

const STAGES = {
  1: { title: 'Stage 1 — Chapter 1: a clean start', when: 'Story · Chapters 1 (about 10–15 h in)', note: 'Play Gone Fishing and finish Chapter 1. Two things start here that matter all run: Kenton\'s diving line, and the game\'s ONLY missable step — Lucia\'s balcony meditation at Jason\'s house after Down to Earth. Do the meditation before Chapter 1 ends and park a manual save at the chapter\'s start.' },
  2: { title: 'Stage 2 — Chapters 2–3: the duo and the tools', when: 'Story · Chapters 2–3', note: 'Coffee Break unlocks duo free-roam, which half the list quietly needs. This stretch hands you the toolkit: Scooter Bros app and garages (Ch. 2), then the Key Cloner, Snap Gun and Yasmani the fence (Ch. 3). Start the Billy, Randy, Tyrone and Bret questlines as they mark themselves.' },
  3: { title: 'Stage 3 — Chapters 4–5: finish the story', when: 'Story · Chapters 4–5 + finale', note: 'Push the campaign to the credits: chapters 4 and 5, the named mission trophies, and the character finales for Andy plus the 8 Strangers & Freaks strands. Free-roam continues afterwards, so nothing here can lock — but the 100% checklist only appears once the story is done.' },
  4: { title: 'Stage 4 — The 100% checklist grind', when: 'Post-story · Progress > Stats > 100% Completion (~100 h)', note: 'The long middle: 250 stunts, 42 shooting-range golds, 14 drone-race locations, 20 race wins, card sets, WAiNK scans, 50→70 challenges, all 8 bank vaults and one illegal operation per gang. Progress made during the story already counts, and the checklist is lenient — most collectible types are only partially required.' },
  5: { title: 'Stage 5 — Cleanup: money, misc and the platinum', when: 'Post-story cleanup (~10–20 h)', note: 'Sweep what is left: the partner trophies, the VCIA jet and the Rhino tank, the UFO night run, $250,000 laundered and $100,000 spent, full map unfog. When A Long Road pops at 100%, Vice Got a Price! follows immediately — platinum earned.' },
};

const params = new URLSearchParams(location.search);
const listEl = document.getElementById('trophy-list');
const detailEl = document.getElementById('detail');
const resultLine = document.getElementById('result-line');
const spoilerNote = document.getElementById('spoiler-note');
const onlineNote = document.getElementById('online-note');
const listPane = document.getElementById('list-pane');
const detailPane = document.getElementById('detail-pane');
const roadmapPane = document.getElementById('roadmap-pane');
const roadmapStages = document.getElementById('roadmap-stages');
const spoilerToggle = document.getElementById('spoiler-toggle');
const searchInput = document.getElementById('search');
const gradeFilter = document.getElementById('grade-filter');

let trophies = [];
let earned = loadEarned();
let spoilersOn = localStorage.getItem(SPOILER_KEY) === 'on';
let view = params.get('view') === 'roadmap' ? 'roadmap' : 'guide';
let kindFilter = params.get('kind') || 'all';
let statusFilter = params.get('status') || 'all';
let selectedId = Number(params.get('sel')) || 28;

function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

// A ?mark=Name1,Name2 link seeds progress through the same storage the
// checkboxes use (handy for sharing a checklist state with a friend).
if (params.get('mark')) {
  for (const name of params.get('mark').split(',')) earned.add(name.trim());
  saveEarned();
}
if (params.get('spoilers') === 'on') spoilersOn = true;
if (params.get('q')) searchInput.value = params.get('q');
if (params.get('grade')) gradeFilter.value = params.get('grade');

function isMasked(t) {
  return spoilersOn && t.kind === 'story' && !earned.has(t.name);
}

function displayName(t) {
  return isMasked(t) ? '🔒 Hidden story trophy' : t.name;
}

function displayDesc(t) {
  return isMasked(t) ? 'Name and description hidden by the Spoiler Shield until you earn it.' : t.description;
}

function gradeCounts() {
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    counts[t.grade][1] += 1;
    if (earned.has(t.name)) counts[t.grade][0] += 1;
  }
  return counts;
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('progress-line').textContent = `${done} of ${total} earned`;
  document.getElementById('bar-fill').style.width = `${pct}%`;
  document.getElementById('ring-num').textContent = `${pct}%`;
  document.getElementById('ring').style.background =
    `conic-gradient(#ff9a3d ${pct * 3.6}deg, rgba(255,255,255,.18) 0deg)`;
  const ul = document.getElementById('grade-counts');
  ul.replaceChildren();
  for (const [grade, [got, of]] of Object.entries(gradeCounts())) {
    const li = document.createElement('li');
    li.textContent = `${grade}: ${got}/${of}`;
    ul.append(li);
  }
}

function matchesFilters(t) {
  if (kindFilter === 'online') return false; // the launch list has zero online trophies
  if (kindFilter !== 'all' && t.kind !== kindFilter) return false;
  if (statusFilter === 'earned' && !earned.has(t.name)) return false;
  if (statusFilter === 'unearned' && earned.has(t.name)) return false;
  if (gradeFilter.value !== 'all' && t.grade !== gradeFilter.value) return false;
  const q = searchInput.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.mission ?? ''} ${t.chapter ?? ''}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function tag(text, cls) {
  const s = document.createElement('span');
  s.className = `tag ${cls ?? ''}`;
  s.textContent = text;
  return s;
}

function renderList() {
  const shown = trophies.filter(matchesFilters);
  listEl.replaceChildren();
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = `trophy-card grade-${t.grade}${earned.has(t.name) ? ' is-earned' : ''}${t.id === selectedId ? ' is-selected' : ''}`;
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      saveEarned();
      renderAll();
    });
    box.addEventListener('click', (e) => e.stopPropagation());
    const main = document.createElement('div');
    main.className = 'card-main';
    const name = document.createElement('p');
    name.className = `card-name${isMasked(t) ? ' masked' : ''}`;
    name.textContent = displayName(t);
    const desc = document.createElement('p');
    desc.className = `card-desc${isMasked(t) ? ' masked' : ''}`;
    desc.textContent = displayDesc(t);
    const tags = document.createElement('div');
    tags.className = 'card-tags';
    tags.append(tag(t.grade.toUpperCase(), `grade-${t.grade}`));
    tags.append(tag(t.kind));
    if (t.count) tags.append(tag(t.countLabel ?? `${t.count}`));
    if (t.hidden) tags.append(tag('HIDDEN on PSN', 'hidden-tag'));
    if (t.missable) tags.append(tag('⚠ MISSABLE', 'missable'));
    if (earned.has(t.name)) tags.append(tag('✓ EARNED'));
    main.append(name, desc, tags);
    li.append(box, main);
    li.addEventListener('click', () => {
      selectedId = t.id;
      renderAll();
    });
    listEl.append(li);
  }
  const maskedCount = trophies.filter(isMasked).length;
  resultLine.textContent = kindFilter === 'online'
    ? 'Showing 0 of 55 trophies — no online trophies exist in this list.'
    : `Showing ${shown.length} of ${trophies.length} trophies · ${earned.size} earned overall`;
  spoilerNote.hidden = !(spoilersOn && maskedCount > 0);
  if (spoilersOn && maskedCount > 0) {
    spoilerNote.textContent = `🛡 Spoiler Shield is ON: ${maskedCount} unearned story trophies are masked wherever they appear (names and descriptions hidden until earned). Earn one — or switch the shield off — to reveal it.`;
  }
  onlineNote.hidden = kindFilter !== 'online';
}

function sourceLink(s) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = s.url;
  a.textContent = s.name;
  a.target = '_blank';
  a.rel = 'noreferrer';
  li.append(a);
  return li;
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId) ?? trophies[0];
  if (!t) {
    detailEl.innerHTML = '<p class="detail-empty">Select a trophy to read its guide.</p>';
    return;
  }
  detailEl.replaceChildren();
  const meta = document.createElement('p');
  meta.className = 'meta-line';
  meta.textContent = `Trophy ${t.id} of 55 · ${t.grade} · ${t.kind} · Roadmap stage ${t.roadmapStage}${t.hidden ? ' · Hidden on PSN' : ''}`;
  const h = document.createElement('h2');
  h.textContent = displayName(t);
  const desc = document.createElement('p');
  desc.className = 'official-desc';
  desc.textContent = `“${displayDesc(t)}” — official description`;
  detailEl.append(meta, h, desc);

  if (t.chapter || t.mission) {
    const where = document.createElement('p');
    where.className = 'meta-line';
    where.textContent = [t.chapter, t.mission].filter(Boolean).join(' · ');
    detailEl.append(where);
  }
  if (t.count) {
    const c = document.createElement('p');
    c.className = 'meta-line';
    c.textContent = `Target: ${t.countLabel ?? t.count}`;
    detailEl.append(c);
  }

  if (t.missable) {
    const box = document.createElement('div');
    box.className = 'missable-box';
    box.innerHTML = `<strong>⚠ MISSABLE — when it is gone:</strong> ${t.missableWhen ?? 'This trophy can be permanently missed.'}`;
    detailEl.append(box);
  } else {
    const box = document.createElement('div');
    box.className = 'safe-box';
    box.textContent = '✓ Not missable: this can still be earned in free-roam after the story.';
    detailEl.append(box);
  }

  const gh = document.createElement('h3');
  gh.textContent = 'Guide — in our own words';
  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = t.guide;
  detailEl.append(gh, guide);

  const sh = document.createElement('h3');
  sh.textContent = 'Sources for this guide';
  const ul = document.createElement('ul');
  ul.className = 'sources';
  for (const s of t.sources ?? []) ul.append(sourceLink(s));
  detailEl.append(sh, ul);

  const row = document.createElement('div');
  row.className = 'earn-row';
  const label = document.createElement('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    saveEarned();
    renderAll();
  });
  label.append(box, document.createTextNode(' I earned this trophy'));
  row.append(label);
  detailEl.append(row);
}

function renderRoadmap() {
  roadmapStages.replaceChildren();
  for (const [num, stage] of Object.entries(STAGES)) {
    const inStage = trophies.filter((t) => t.roadmapStage === Number(num));
    const doneCount = inStage.filter((t) => earned.has(t.name)).length;
    const sec = document.createElement('article');
    sec.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = `${stage.title} — ${doneCount}/${inStage.length} earned`;
    const when = document.createElement('p');
    when.className = 'stage-when';
    when.textContent = stage.when;
    const note = document.createElement('p');
    note.className = 'stage-note';
    note.textContent = stage.note;
    const ul = document.createElement('ul');
    for (const t of inStage) {
      const li = document.createElement('li');
      if (earned.has(t.name)) li.className = 'done';
      li.textContent = `${earned.has(t.name) ? '✓' : '•'} ${t.name} (${t.grade})${t.missable ? ' — ⚠ MISSABLE: Chapter 1 meditation, gone after Chapter 1' : ''}${t.count ? ` — ${t.countLabel}` : ''}`;
      ul.append(li);
    }
    sec.append(h, when, note, ul);
    roadmapStages.append(sec);
  }
}

function renderView() {
  const isRoad = view === 'roadmap';
  listPane.hidden = isRoad;
  detailPane.hidden = isRoad;
  roadmapPane.hidden = !isRoad;
  for (const b of document.querySelectorAll('.view-chip')) {
    b.classList.toggle('is-on', b.dataset.view === view);
  }
  if (isRoad) renderRoadmap();
}

function renderSpoilerToggle() {
  spoilerToggle.setAttribute('aria-pressed', String(spoilersOn));
  spoilerToggle.textContent = spoilersOn ? 'ON — story trophies masked' : 'OFF — story trophies visible';
}

function renderChips() {
  for (const b of document.querySelectorAll('.kind-chip')) b.classList.toggle('is-on', b.dataset.kind === kindFilter);
  for (const b of document.querySelectorAll('.status-chip')) b.classList.toggle('is-on', b.dataset.status === statusFilter);
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderView();
  renderSpoilerToggle();
  renderChips();
}

for (const b of document.querySelectorAll('.view-chip')) {
  b.addEventListener('click', () => { view = b.dataset.view; renderAll(); });
}
for (const b of document.querySelectorAll('.kind-chip')) {
  b.addEventListener('click', () => { kindFilter = b.dataset.kind; renderAll(); });
}
for (const b of document.querySelectorAll('.status-chip')) {
  b.addEventListener('click', () => { statusFilter = b.dataset.status; renderAll(); });
}
gradeFilter.addEventListener('change', renderAll);
searchInput.addEventListener('input', renderAll);
spoilerToggle.addEventListener('click', () => {
  spoilersOn = !spoilersOn;
  localStorage.setItem(SPOILER_KEY, spoilersOn ? 'on' : 'off');
  renderAll();
});

document.getElementById('export-btn').addEventListener('click', () => {
  const payload = JSON.stringify({ app: 'vice-trophy-atlas', earned: [...earned] }, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  a.download = 'vice-trophy-atlas-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.name));
    earned = new Set((names ?? []).filter((n) => valid.has(n)));
    saveEarned();
    renderAll();
  } catch {
    resultLine.textContent = 'Import failed: that file is not Atlas progress JSON.';
  }
  e.target.value = '';
});
document.getElementById('reset-btn').addEventListener('click', () => {
  earned = new Set();
  saveEarned();
  renderAll();
});

const data = await (await fetch('data/trophies.json')).json();
trophies = data.trophies;
if (!trophies.some((t) => t.id === selectedId)) selectedId = trophies[0].id;
renderAll();
