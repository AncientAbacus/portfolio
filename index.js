import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

async function loadLatestProjects() {
    const projects = await fetchJSON('./lib/projects.json');
    const latestProjects = projects.slice(0, 3); // Get first 3 projects

    const projectsContainer = document.querySelector('.projects');
    if (projectsContainer) {
        renderProjects(latestProjects, projectsContainer, 'h2');
    }
}

async function loadGitHubStats() {
    const username = 'AncientAbacus';
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();

    const profileStats = document.getElementById('profile-stats');
    profileStats.innerHTML = `
        <p><strong>Username:</strong> ${data.login}</p>
        <p><strong>Public Repos:</strong> ${data.public_repos}</p>
        <p><strong>Followers:</strong> ${data.followers}</p>
        <p><strong>Following:</strong> ${data.following}</p>
    `;
}

loadLatestProjects();
loadGitHubStats();