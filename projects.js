import { fetchJSON, renderProjects } from './global.js';

async function loadProjects() {
    const projects = await fetchJSON('../lib/projects.json');
    const projectsContainer = document.querySelector('.projects');
    
    if (projectsContainer) {
        renderProjects(projects, projectsContainer, 'h2');
    }

    // Update project count
    const projectTitle = document.querySelector('.projects-title');
    if (projectTitle) {
        projectTitle.textContent = `Projects (${projects.length})`;
    }
}

loadProjects();