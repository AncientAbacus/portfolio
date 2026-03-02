let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'https://github.com/AncientAbacus', title: 'GitHub' },
    { url: 'https://linkedin.com/in/gino-angelici', title: 'LinkedIn' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);

const ARE_WE_HOME = document.documentElement.classList.contains('home');

for (let p of pages) {
    let url = p.url;
    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
      }
    let title = p.title;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
      }
    if (a.host !== location.host) {
        a.target = "_blank";
        a.classList.add('external');
        a.innerHTML = `${title}<svg class="ext-arrow" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8L8 2"/><path d="M4 2h4v4"/></svg>`;
      }
    nav.append(a);
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
        Theme:
        <select>
            <option value="auto">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
      </label>`
);

const select = document.querySelector('.color-scheme select');

if ("colorScheme" in localStorage) {
    const savedScheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', savedScheme);
    select.value = savedScheme;
  } else {
    document.documentElement.style.setProperty('color-scheme', 'auto');
    select.value = 'auto';
  }

select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = event.target.value;
  });

// Fetch JSON function
export async function fetchJSON(url) {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      return await response.json();
  } catch (error) {
      console.error('Error fetching or parsing JSON:', error);
      throw error; // Re-throw to allow caller to handle
  }
}

// Render Projects Function
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!containerElement) return;

  containerElement.innerHTML = ''; // Clear existing content

  projects.forEach(project => {
      const article = document.createElement('article');

      article.innerHTML = `
          <${headingLevel}>${project.title}</${headingLevel}>
          <p>${project.description}</p>
      `;
      containerElement.appendChild(article);
  });
}

// Fetch GitHub Data
export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}





