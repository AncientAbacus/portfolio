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
  { url: 'experience/', title: 'Experience' },
  { url: 'contact/', title: 'Contact' },
  { url: 'https://github.com/AncientAbacus', title: 'GitHub ↗' },
  { url: 'https://linkedin.com/in/gino-angelici', title: 'LinkedIn ↗' },
  { url: 'mailto:gino.angelici@gmail.com', title: 'Email ↗' },
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
  if (p.url.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
  if (a.pathname === location.pathname) a.classList.add('current');
  li.append(a);
  mastList.append(li);
}

/* ===== Footer — Ft1 Mast-headed ===== */
const footer = document.createElement('footer');
footer.className = 'foot-mast';
footer.innerHTML = `
  <p class="wordmark">Gino Angelici</p>
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
