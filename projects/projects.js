import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";


// let rolledData = d3.rollups(
//   projects,
//   (v) => v.length,
//   (d) => d.year,
// );
// let data = rolledData.map(([year, count]) => {
//     return { value: count, label: year };
// });

// let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let sliceGenerator = d3.pie().value((d) => d.value);
// let arcData = sliceGenerator(data);
// let arcs = arcData.map((d) => arcGenerator(d));
// let colors = d3.scaleOrdinal(d3.schemeTableau10);

// arcs.forEach((arc, idx) => {
//     d3.select('svg')
//       .append('path')
//       .attr('d', arc)
//       .attr('fill', colors(idx)) // Fill in the attribute for fill color via indexing the colors variable
// })

// let legend = d3.select('.legend');
// data.forEach((d, idx) => {
//     legend.append('li')
//           .attr('style', `--color:${colors(idx)}`)
//           .attr('class', 'legend-item') // Assign class for styling
//           .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
// });

// let query = '';
// let searchInput = document.querySelector('.searchBar');

// searchInput.addEventListener('input', (event) => {
//     // update query value
//     query = event.target.value;
//     // filter projects
//     let filteredProjects = projects.filter((project) => {
//         let values = Object.values(project).join('\n').toLowerCase();
//         return values.includes(query.toLowerCase());
//     });
//     // render filtered projects
//     renderProjects(filteredProjects, projectsContainer, 'h2');
// });

// Fetch projects once and initialize page
let projects = await fetchJSON("../lib/projects.json");
let projectsContainer = document.querySelector('.projects');

// Initial render of all projects
if (projectsContainer) {
    renderProjects(projects, projectsContainer, 'h2');
}

// Update project count
const projectTitle = document.querySelector('.projects-title');
if (projectTitle) {
    projectTitle.textContent = `Projects (${projects.length})`;
}

function renderPieChart(projectsGiven) {
    // re-calculate rolled data
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year,
    );
    // re-calculate data
    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    // re-calculate slice generator, arc data, arc, etc.
    let newArcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => newArcGenerator(d));
    let newColors = d3.scaleOrdinal(d3.schemeTableau10);
    // TODO: clear up paths and legends
    let newSVG = d3.select('#projects-pie-chart');
    newSVG.selectAll('path').remove();

    let newLegend = d3.select('.legend'); 
    newLegend.selectAll('li').remove();
    // update paths and legends, refer to steps 1.4 and 2.2
    let selectedIndex = -1;

    newArcs.forEach((newArc, idx) => {
        newSVG
            .append('path')
            .attr('d', newArc)
            .attr('fill', newColors(idx)) // Fill in the attribute for fill color via indexing the colors variable
            .on('click', () => {
                selectedIndex = selectedIndex === idx ? -1 : idx; // Toggle selection

                // Update pie slices based on selection
                newSVG.selectAll('path')
                    .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

                // Update legend highlighting
                newLegend.selectAll('li')
                    .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : 'legend-item'))

                // Filter projects based on selected year
                let selectedYear = newData[selectedIndex]?.label;
                let filteredProjects = selectedIndex === -1 
                    ? projectsGiven 
                    : projectsGiven.filter(p => p.year === selectedYear);

                renderProjects(filteredProjects, projectsContainer, 'h2');
            });
    })
    newData.forEach((d, idx) => {
        newLegend
            .append('li')
            .attr('style', `--color:${newColors(idx)}`)
            .attr('class', 'legend-item') // Assign class for styling
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
            
    });
  }
  
// Call this function on page load
renderPieChart(projects);

  
let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
    // update query value
    query = event.target.value;
    // filter projects
    let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
    });
    // re-render legends and pie chart when event triggers
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);

    
});