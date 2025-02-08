import { fetchJSON, renderProjects } from '../global.js';

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

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let projects = await fetchJSON("../lib/projects.json"); // fetch your project data
let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year,
);
let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
});

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);

arcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx)) // Fill in the attribute for fill color via indexing the colors variable
})

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`)
          .attr('class', 'legend-item') // Assign class for styling
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
});
