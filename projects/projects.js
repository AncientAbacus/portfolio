import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const searchInput = document.querySelector('.searchBar');

const projectTitle = document.querySelector('.projects-title');
if (projectTitle) {
    projectTitle.textContent = `Projects (${projects.length})`;
}

let query = '';

function update() {
    const q = query.toLowerCase();
    const filtered = projects.filter((project) => {
        // search only visible text; JSON titles are HTML-escaped
        const text = [project.title, project.year, project.description, ...(project.tags || [])].join('\n');
        return text.replace(/&amp;/g, '&').toLowerCase().includes(q);
    });
    renderProjects(filtered, projectsContainer, 'h2');
}

searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    update();
});

update();
