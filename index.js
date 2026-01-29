import { fetchJSON, fetchGitHubData } from './global.js';

async function loadFeaturedProjects() {
    const placeholderPath = 'images/place_holder.jpeg';

    try {
        const projects = await fetchJSON('./lib/projects.json');
        const featured = projects.slice(0, 3);

        featured.forEach((project, index) => {
            const box = document.getElementById(`featured-project-${index + 1}`);
            if (!box) return;

            // Set background image with fallback to placeholder
            if (project.image) {
                const img = new Image();
                img.onload = () => {
                    box.style.backgroundImage = `url('${project.image}')`;
                };
                img.onerror = () => {
                    box.style.backgroundImage = `url('${placeholderPath}')`;
                };
                img.src = project.image;
            } else {
                box.style.backgroundImage = `url('${placeholderPath}')`;
            }

            // Update title
            const titleEl = box.querySelector('.project-title');
            if (titleEl) {
                titleEl.textContent = project.title;
            }

            // Make clickable
            box.addEventListener('click', () => {
                window.location.href = 'projects/';
            });
        });
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

async function loadGitHubStats() {
    const profileStats = document.querySelector('#profile-stats');
    if (!profileStats) return;

    try {
        const githubData = await fetchGitHubData('AncientAbacus');
        profileStats.innerHTML = `
            <dl class="github-stats">
                <div><dt>Repos</dt><dd>${githubData.public_repos}</dd></div>
                <div><dt>Gists</dt><dd>${githubData.public_gists}</dd></div>
                <div><dt>Followers</dt><dd>${githubData.followers}</dd></div>
                <div><dt>Following</dt><dd>${githubData.following}</dd></div>
            </dl>
        `;
    } catch (error) {
        profileStats.innerHTML = '<p style="opacity: 0.5; font-size: 0.9rem;">GitHub stats unavailable</p>';
    }
}

loadFeaturedProjects();
loadGitHubStats();
