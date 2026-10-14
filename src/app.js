import { STORAGE_KEY, programs, makeTrack, progress, updateTask, addTask, removeTask, validTrack } from './core.js';

const main = document.querySelector('#main');
const list = document.querySelector('#path-list');
const dialog = document.querySelector('#new-dialog');
const toast = document.querySelector('#toast');
let tracks = readTracks();
let selectedId = tracks[0]?.id || null;
let toastTimer;

function readTracks() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value.filter(validTrack).slice(0, 100) : [];
  } catch { return []; }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks)); }
  catch { showToast('Storage is unavailable. Export your progress before leaving.'); }
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4200);
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function current() { return tracks.find(track => track.id === selectedId); }

function renderSidebar() {
  document.querySelector('#path-count').textContent = tracks.length;
  list.innerHTML = tracks.length ? tracks.map(track => {
    const p = progress(track);
    return `<button type="button" class="path-nav ${track.id === selectedId ? 'active' : ''}" data-select="${esc(track.id)}" aria-current="${track.id === selectedId ? 'page' : 'false'}"><span class="path-nav-icon">↗</span><span class="path-nav-body"><strong>${esc(track.title)}</strong><small>${p.percent}% complete</small></span><span class="path-nav-arrow" aria-hidden="true">→</span></button>`;
  }).join('') : '<p class="empty-sidebar">Your next chapter starts here.</p>';
}

function renderWelcome() {
  main.innerHTML = `<section class="welcome-hero"><div class="hero-copy"><span class="eyebrow light">YOUR LEARNING, YOUR PACE</span><h1>Big goals start<br>with <em>small steps.</em></h1><p>Turn the thing you want to learn into a clear path. Follow the next step, see your progress, and make room to grow.</p><button class="hero-button" type="button" data-open-new>Make your own path <span aria-hidden="true">↗</span></button></div><div class="hero-art" aria-hidden="true"><div class="art-orbit orbit-outer"></div><div class="art-orbit orbit-inner"></div><div class="art-center">✳</div><div class="art-tag tag-one">start here <span>↗</span></div><div class="art-tag tag-two">keep going ✦</div><div class="art-star star-one">✦</div><div class="art-star star-two">✳</div></div></section>
    <section class="program-section"><div class="section-heading"><div><span class="eyebrow">A LITTLE HELP TO BEGIN</span><h2>Pick a starting point.</h2></div><p>Thoughtful six-week paths you can make your own.</p></div><div class="program-grid">${programs.map(program => `<article class="program-card ${program.tone}"><div class="program-top"><span class="program-icon" aria-hidden="true">${program.icon}</span><span class="program-tag">${program.tag}</span></div><div><span class="program-duration">${program.duration} · 18 steps</span><h3>${esc(program.title)}</h3><p>${esc(program.description)}</p></div><button type="button" data-program="${program.id}" class="program-link" aria-label="Start ${esc(program.title)}">Start this path <span aria-hidden="true">↗</span></button></article>`).join('')}</div></section>
    <section class="bottom-banner"><span class="banner-icon" aria-hidden="true">◎</span><div><strong>Made for the messy middle.</strong><p>Add your own tasks, check things off, and move at your own pace.</p></div></section>`;
}

function renderTrack(track) {
  const p = progress(track);
  const next = track.weeks.flatMap(week => week.tasks.map(task => ({ ...task, week: week.title }))).find(task => !task.done);
  const doneWeeks = track.weeks.filter(week => week.tasks.length && week.tasks.every(task => task.done)).length;
  main.innerHTML = `<div class="track-main"><div class="track-topline"><span class="eyebrow">YOUR LEARNING PATH</span><button type="button" class="delete-path" data-delete-path>Delete path <span aria-hidden="true">×</span></button></div><div class="track-heading"><div><h1>${esc(track.title)}<span class="heading-star" aria-hidden="true">✳</span></h1><p>${esc(track.outcome || 'A little progress, every week.')}</p></div><div class="progress-ring" style="--progress:${p.percent}%" role="img" aria-label="${p.percent}% complete"><div><strong>${p.percent}%</strong><small>COMPLETE</small></div></div></div>
    <div class="insight-grid"><div class="insight"><span class="insight-icon lavender-icon">✦</span><div><strong>${p.done}<span class="muted"> / ${p.total}</span></strong><small>STEPS DONE</small></div></div><div class="insight"><span class="insight-icon coral-icon">↗</span><div><strong>${doneWeeks}<span class="muted"> / ${track.weeks.length}</span></strong><small>WEEKS COMPLETE</small></div></div><div class="insight next-insight"><span class="insight-icon mint-icon">◎</span><div><strong>${next ? esc(next.text) : 'You made it!'}</strong><small>${next ? `UP NEXT · ${esc(next.week)}` : 'ALL STEPS COMPLETE'}</small></div></div></div>
    <section class="journey"><div class="section-heading"><div><span class="eyebrow">THE JOURNEY</span><h2>One week at a time.</h2></div><p>Check off what you finish. Add what you need.</p></div><div class="week-list">${track.weeks.map((week, index) => renderWeek(week, index)).join('')}</div></section></div>`;
}

function renderWeek(week, index) {
  const done = week.tasks.filter(task => task.done).length;
  const complete = week.tasks.length > 0 && done === week.tasks.length;
  return `<article class="week-card ${complete ? 'week-complete' : ''}"><div class="week-marker"><span>${String(index + 1).padStart(2, '0')}</span></div><div class="week-content"><div class="week-heading"><div><span class="week-label">WEEK ${String(index + 1).padStart(2, '0')}</span><h3>${esc(week.title)}</h3></div><span class="week-count">${done}/${week.tasks.length} done</span></div><div class="task-list">${week.tasks.map(task => `<div class="task-row"><label><input type="checkbox" data-week="${esc(week.id)}" data-task="${esc(task.id)}" ${task.done ? 'checked' : ''}><span class="custom-check" aria-hidden="true">✓</span><span class="task-text ${task.done ? 'done' : ''}">${esc(task.text)}</span></label><button type="button" class="task-remove" data-remove-task="${esc(task.id)}" data-week="${esc(week.id)}" aria-label="Remove ${esc(task.text)}">×</button></div>`).join('')}</div><form class="add-task-form" data-add-week="${esc(week.id)}"><label class="sr-only" for="add-${esc(week.id)}">Add a step to ${esc(week.title)}</label><input id="add-${esc(week.id)}" name="task" type="text" maxlength="160" placeholder="Add a step to this week…" required><button type="submit" aria-label="Add step">＋</button></form></div></article>`;
}

function render() {
  if (selectedId && !current()) selectedId = tracks[0]?.id || null;
  renderSidebar();
  current() ? renderTrack(current()) : renderWelcome();
}

function createTrack(options) {
  const track = makeTrack(options);
  tracks.unshift(track);
  selectedId = track.id;
  save(); render();
  main.focus();
  showToast('Your path is ready. Start with one small step.');
}

function replaceCurrent(next) {
  tracks = tracks.map(track => track.id === selectedId ? next : track);
  save(); render();
}

function download(filename, contents) {
  const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.matches('#new-path-side, #new-path-top, [data-open-new]')) { dialog.showModal(); return; }
  if (button.hasAttribute('data-close')) { dialog.close(); return; }
  if (button.dataset.select) { selectedId = button.dataset.select; render(); main.focus(); return; }
  if (button.dataset.program) { createTrack({ programId: button.dataset.program }); return; }
  if (button.dataset.removeTask) {
    replaceCurrent(removeTask(current(), button.dataset.week, button.dataset.removeTask)); return;
  }
  if (button.hasAttribute('data-delete-path')) {
    if (confirm(`Delete “${current().title}”? Export first if you want a backup.`)) {
      tracks = tracks.filter(track => track.id !== selectedId); selectedId = tracks[0]?.id || null; save(); render(); showToast('Path deleted.');
    }
    return;
  }
  if (button.id === 'export-button') {
    download('skilltrail-backup.json', JSON.stringify({ app: 'SkillTrail', version: 1, tracks }, null, 2));
    showToast('Backup downloaded.'); return;
  }
  if (button.id === 'import-button') document.querySelector('#import-file').click();
});

document.addEventListener('change', event => {
  if (event.target.matches('input[type="checkbox"][data-task]')) {
    replaceCurrent(updateTask(current(), event.target.dataset.week, event.target.dataset.task, event.target.checked));
  }
});

document.addEventListener('submit', event => {
  if (event.target.id === 'new-form') {
    event.preventDefault();
    const data = new FormData(event.target);
    createTrack({ title: data.get('title'), outcome: data.get('outcome'), weeks: data.get('weeks') });
    event.target.reset(); dialog.close(); return;
  }
  if (event.target.matches('[data-add-week]')) {
    event.preventDefault();
    const input = event.target.elements.task;
    replaceCurrent(addTask(current(), event.target.dataset.addWeek, input.value));
    const target = document.getElementById(input.id);
    if (target) target.focus();
  }
});

document.querySelector('#import-file').addEventListener('change', async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 2_000_000) throw new Error('File is too large.');
    const data = JSON.parse(await file.text());
    if (data?.app !== 'SkillTrail' || !Array.isArray(data.tracks) || data.tracks.length > 100 || !data.tracks.every(validTrack)) throw new Error('This is not a valid SkillTrail backup.');
    const ids = new Set(tracks.map(track => track.id));
    let added = 0;
    for (const track of data.tracks) if (!ids.has(track.id)) { tracks.push(track); ids.add(track.id); added++; }
    save(); render(); showToast(added ? `Imported ${added} path${added === 1 ? '' : 's'}.` : 'These paths are already here.');
  } catch (error) { showToast(error.message || 'Could not read this file.'); }
  event.target.value = '';
});

render();
