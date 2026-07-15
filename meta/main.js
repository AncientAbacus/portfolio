// GitHub activity summary
const GITHUB_USERNAME = 'AncientAbacus';

let repositories = [];
let userData = null;

function animateNumber(element, target, duration = 800) {
  const startTime = performance.now();
  function update(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.floor(target * eased);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

async function fetchUserData() {
  const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
  if (!response.ok) throw new Error('Failed to fetch user data');
  return response.json();
}

async function fetchRepositories() {
  const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);
  if (!response.ok) throw new Error('Failed to fetch repositories');
  return response.json();
}

function calculateLanguageStats() {
  const stats = {};
  repositories.forEach((repo) => {
    if (repo.language) stats[repo.language] = (stats[repo.language] || 0) + 1;
  });
  return Object.entries(stats).sort((a, b) => b[1] - a[1]);
}

function renderStats() {
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
  const languages = new Set(repositories.map((r) => r.language).filter(Boolean)).size;

  animateNumber(document.getElementById('stat-repos'), repositories.length);
  animateNumber(document.getElementById('stat-stars'), totalStars);
  animateNumber(document.getElementById('stat-forks'), totalForks);
  animateNumber(document.getElementById('stat-languages'), languages);
  document.getElementById('followers-count').textContent = userData.followers;
  document.getElementById('join-date').textContent = new Date(userData.created_at).getFullYear();
}

function renderLanguageBars() {
  const langStats = calculateLanguageStats();
  const total = langStats.reduce((sum, [, count]) => sum + count, 0);
  const container = document.getElementById('language-bars');
  container.innerHTML = '';

  langStats.slice(0, 6).forEach(([lang, count]) => {
    const pct = (count / total) * 100;
    const item = document.createElement('div');
    item.className = 'lang-bar-item';
    item.innerHTML = `
      <span class="lang-bar-name">${lang}</span>
      <div class="lang-bar-track"><div class="lang-bar-fill" style="width: ${pct}%"></div></div>
      <span class="lang-bar-count">${count}</span>
    `;
    container.appendChild(item);
  });
}

function renderTopRepo() {
  const topRepo = [...repositories].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
  const line = document.getElementById('top-repo-line');
  if (!topRepo) { line.textContent = 'No repositories yet.'; return; }
  line.innerHTML = `<a href="${topRepo.html_url}" target="_blank">${topRepo.name}</a> — ${topRepo.description || 'no description'} (${topRepo.language || 'unspecified'}, ${topRepo.stargazers_count} ${topRepo.stargazers_count === 1 ? 'star' : 'stars'})`;
}

function renderRecentRepos() {
  const container = document.getElementById('recent-repos');
  container.innerHTML = '';
  const recent = [...repositories].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 5);
  recent.forEach((repo) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a><time>${new Date(repo.updated_at).toLocaleDateString()}</time>`;
    container.appendChild(li);
  });
}

async function init() {
  try {
    [userData, repositories] = await Promise.all([fetchUserData(), fetchRepositories()]);
    document.getElementById('loading-overlay').classList.add('hidden');
    renderStats();
    renderLanguageBars();
    renderTopRepo();
    renderRecentRepos();
  } catch (error) {
    console.error('Failed to initialize:', error);
    document.getElementById('loading-overlay').textContent = 'Failed to load GitHub data.';
  }
}

document.addEventListener('DOMContentLoaded', init);
