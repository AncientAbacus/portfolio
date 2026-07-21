const ARE_WE_HOME = document.documentElement.classList.contains('home');
const base = ARE_WE_HOME ? '' : '../';

function resolve(url) {
  if (url.startsWith('http') || url.startsWith('mailto:')) return url;
  return base + url;
}

/* ===== Nav — N6 Newspaper masthead ===== */
const navPages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'resume/', title: 'Résumé' },
  { url: 'contact/', title: 'Contact' },
];

const header = document.createElement('header');
header.className = 'nav-mast';
header.innerHTML = `
  <p class="mast-line">Data Science · Machine Learning</p>
  <a class="mast-name" href="${resolve('')}">Gino Angelici</a>
  <nav class="mast-nav" aria-label="Primary"><ul></ul></nav>
  <hr class="mast-rule" aria-hidden="true">
`;
document.body.prepend(header);

const mastList = header.querySelector('.mast-nav ul');
for (const p of navPages) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = resolve(p.url);
  a.textContent = p.title;
  if (a.pathname === location.pathname) a.classList.add('current');
  li.append(a);
  mastList.append(li);
}
const cmdkLi = document.createElement('li');
cmdkLi.innerHTML = `<button type="button" class="cmdk-trigger" aria-haspopup="dialog" aria-controls="cmdk-overlay">Jump to <kbd>⌘K</kbd></button>`;
mastList.append(cmdkLi);

/* ===== Command palette ===== */
const cmdkItems = [
  { group: 'Pages', title: 'Home', url: resolve('') },
  { group: 'Pages', title: 'Projects', url: resolve('projects/') },
  { group: 'Pages', title: 'Résumé', url: resolve('resume/') },
  { group: 'Pages', title: 'Contact', url: resolve('contact/') },
  { group: 'Elsewhere', title: 'GitHub ↗', url: 'https://github.com/AncientAbacus' },
  { group: 'Elsewhere', title: 'LinkedIn ↗', url: 'https://linkedin.com/in/gino-angelici' },
  { group: 'Elsewhere', title: 'Email ↗', url: 'mailto:gino.angelici@gmail.com' },
];

const overlay = document.createElement('div');
overlay.className = 'cmdk-overlay';
overlay.id = 'cmdk-overlay';
overlay.hidden = true;
overlay.innerHTML = `
  <div class="cmdk-palette" role="dialog" aria-modal="true" aria-label="Jump to">
    <div class="cmdk-palette__search">
      <span class="cmdk-palette__icon" aria-hidden="true">/</span>
      <input type="text" class="cmdk-palette__input" placeholder="Jump to a page or link…" aria-label="Jump to a page or link">
    </div>
    <ul class="cmdk-palette__list"></ul>
    <p class="cmdk-palette__empty" hidden>No matches.</p>
  </div>
`;
document.body.append(overlay);

const list = overlay.querySelector('.cmdk-palette__list');
const input = overlay.querySelector('.cmdk-palette__input');
const empty = overlay.querySelector('.cmdk-palette__empty');
let activeIndex = -1;
let lastFocused = null;

function buildList(filter = '') {
  list.innerHTML = '';
  const q = filter.trim().toLowerCase();
  const groups = new Map();
  cmdkItems
    .filter((item) => item.title.toLowerCase().includes(q))
    .forEach((item) => {
      if (!groups.has(item.group)) groups.set(item.group, []);
      groups.get(item.group).push(item);
    });

  let flatIndex = 0;
  for (const [group, items] of groups) {
    const groupEl = document.createElement('li');
    groupEl.className = 'cmdk-palette__group';
    groupEl.textContent = group;
    list.append(groupEl);
    for (const item of items) {
      const li = document.createElement('li');
      li.className = 'cmdk-palette__item';
      li.dataset.url = item.url;
      li.dataset.index = flatIndex++;
      li.innerHTML = `<span>${item.title}</span><kbd>↵</kbd>`;
      li.addEventListener('mouseenter', () => setActive(Number(li.dataset.index)));
      li.addEventListener('click', () => go(item.url));
      list.append(li);
    }
  }
  empty.hidden = groups.size > 0;
  activeIndex = groups.size > 0 ? 0 : -1;
  paintActive();
}

function items() { return [...list.querySelectorAll('.cmdk-palette__item')]; }
function paintActive() { items().forEach((el) => el.classList.toggle('active', Number(el.dataset.index) === activeIndex)); }
function setActive(i) { activeIndex = i; paintActive(); }
function go(url) { closeCmdk(); window.location.href = url; }

function openCmdk() {
  lastFocused = document.activeElement;
  overlay.hidden = false;
  input.value = '';
  buildList();
  input.focus();
}
function closeCmdk() {
  overlay.hidden = true;
  if (lastFocused) lastFocused.focus();
}

header.querySelector('.cmdk-trigger').addEventListener('click', openCmdk);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeCmdk(); });
input.addEventListener('input', (e) => buildList(e.target.value));

document.addEventListener('keydown', (e) => {
  const isMod = e.metaKey || e.ctrlKey;
  if (isMod && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    overlay.hidden ? openCmdk() : closeCmdk();
    return;
  }
  if (overlay.hidden) return;
  const rows = items();
  if (e.key === 'Escape') { closeCmdk(); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(Math.min(activeIndex + 1, rows.length - 1)); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(Math.max(activeIndex - 1, 0)); }
  else if (e.key === 'Enter') {
    e.preventDefault();
    const el = rows.find((r) => Number(r.dataset.index) === activeIndex);
    if (el) go(el.dataset.url);
  }
});

/* ===== Footer — Ft1 Mast-headed ===== */
const footer = document.createElement('footer');
footer.className = 'foot-mast';
footer.innerHTML = `
  <p class="wordmark">Gino Angelici</p>
  <p class="links">
    <a href="https://github.com/AncientAbacus" target="_blank">GitHub</a> ·
    <a href="https://linkedin.com/in/gino-angelici" target="_blank">LinkedIn</a> ·
    <a href="mailto:gino.angelici@gmail.com">Email</a>
  </p>
`;
document.body.append(footer);

/* ===== Data helpers (shared) ===== */
export async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching or parsing JSON:', error);
    throw error;
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!containerElement) return;

  containerElement.innerHTML = '';

  projects.forEach((project) => {
    const url = project.link || project.repo;
    const titleHTML = url
      ? `<a href="${url}" target="_blank" rel="noopener">${project.title}<span class="link-mark" aria-hidden="true" title="Has a live link">↗</span></a>`
      : project.title;
    const tagsHTML = project.tags?.length
      ? `<p class="tags">${project.tags.join(' · ')}</p>`
      : '';

    const article = document.createElement('article');
    article.innerHTML = `
      <span class="eyebrow">${project.year}</span>
      <${headingLevel}>${titleHTML}</${headingLevel}>
      <p>${project.description}</p>
      ${tagsHTML}
    `;
    containerElement.appendChild(article);
  });
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}
