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
        return Object.values(project).join('\n').toLowerCase().includes(q);
    });
    renderProjects(filtered, projectsContainer, 'h2');
}

searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    update();
});

update();
