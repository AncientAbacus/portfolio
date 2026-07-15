import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const yearFilter = document.querySelector('.year-filter');
const searchInput = document.querySelector('.searchBar');

const projectTitle = document.querySelector('.projects-title');
if (projectTitle) {
    projectTitle.textContent = `Projects (${projects.length})`;
}

const years = [...new Set(projects.map((p) => p.year))].sort((a, b) => b - a);

let selectedYear = null;
let query = '';

function renderYearFilter() {
    yearFilter.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.textContent = `All (${projects.length})`;
    allBtn.className = selectedYear === null ? 'active' : '';
    allBtn.addEventListener('click', () => { selectedYear = null; update(); });
    yearFilter.append(allBtn);

    years.forEach((year) => {
        const count = projects.filter((p) => p.year === year).length;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = `${year} (${count})`;
        btn.className = selectedYear === year ? 'active' : '';
        btn.addEventListener('click', () => { selectedYear = selectedYear === year ? null : year; update(); });
        yearFilter.append(btn);
    });
}

function update() {
    const q = query.toLowerCase();
    const filtered = projects.filter((project) => {
        const matchesYear = selectedYear === null || project.year === selectedYear;
        const matchesQuery = Object.values(project).join('\n').toLowerCase().includes(q);
        return matchesYear && matchesQuery;
    });
    renderProjects(filtered, projectsContainer, 'h2');
    renderYearFilter();
}

searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    update();
});

update();
