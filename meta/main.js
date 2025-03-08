// Global variables
let commits = []; // This should be populated with your actual commit data
let commitProgress = 100;
let selectedCommits = [];
let timeScale, xScale, yScale, rScale;

// Function to load commit data
async function loadCommitData() {
    try {
        const response = await fetch("https://api.github.com/repos/AncientAbacus/portfolio/commits"); // Replace with actual API endpoint
        const data = await response.json();

        // Transform data into expected format
        commits = data.map(commit => ({
            id: commit.sha,
            datetime: new Date(commit.commit.author.date),
            totalLines: Math.floor(Math.random() * 500), // Placeholder for total lines, adjust as needed
            hourFrac: (new Date(commit.commit.author.date).getHours() + new Date(commit.commit.author.date).getMinutes() / 60) / 24,
            lines: [{ file: commit.files?.[0]?.filename || "unknown", type: "code" }],
            url: commit.html_url
        }));

        // Initialize visualization
        setupScrollytelling();
        setupVisualization();
    } catch (error) {
        console.error("Error fetching commit data:", error);
    }
}

// D3 Setup
document.addEventListener("DOMContentLoaded", () => {
    loadCommitData();
});

// Step 1: Evolution visualization
function setupVisualization() {
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", 1000)
        .attr("height", 500)
        .append("g")
        .attr("transform", "translate(50, 20)"); // Adjust margins

    xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([0, 900]); // Adjust based on SVG width

    yScale = d3.scaleLinear()
        .domain([0, 1]) // Assuming hourFrac is between 0 and 1
        .range([450, 50]); // Adjust based on SVG height

    rScale = d3.scaleSqrt()
        .domain(d3.extent(commits, d => d.totalLines))
        .range([2, 10]);

    // Add X Axis
    svg.append("g")
        .attr("transform", "translate(0, 450)")
        .call(d3.axisBottom(xScale).ticks(5))
        .append("text")
        .attr("fill", "#000")
        .attr("x", 450)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .text("Commit Date");

    // Add Y Axis
    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(5))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -225)
        .attr("text-anchor", "middle")
        .text("Commit Time of Day");

    // Draw scatterplot
    updateScatterplot(commits);
}

function updateScatterplot(data) {
    const svg = d3.select("#chart svg g");

    // Bind data
    const circles = svg.selectAll("circle")
        .data(data, d => d.id);

    // Exit
    circles.exit().remove();

    // Update
    circles.transition()
        .duration(500)
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", d => rScale(d.totalLines));

    // Enter
    circles.enter().append("circle")
        .attr("cx", d => xScale(d.datetime))
        .attr("cy", d => yScale(d.hourFrac))
        .attr("r", 0)
        .transition()
        .duration(500)
        .attr("r", d => rScale(d.totalLines));
}

// Step 2: The race for the biggest file!
function displayCommitFiles(filteredCommits) {
    const lines = filteredCommits.flatMap(d => d.lines);
    const files = d3.groups(lines, d => d.file)
        .map(([name, lines]) => ({ name, lines }))
        .sort((a, b) => d3.descending(a.lines.length, b.lines.length));

    const fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);

    const filesContainer = d3.select(".files");
    filesContainer.selectAll("div").remove();

    const fileDivs = filesContainer.selectAll("div")
        .data(files)
        .enter().append("div");

    fileDivs.append("dt")
        .html(d => `<code>${d.name}</code><small>${d.lines.length} lines</small>`);

    fileDivs.append("dd")
        .selectAll("div")
        .data(d => d.lines)
        .enter().append("div")
        .attr("class", "line")
        .style("background", d => fileTypeColors(d.type));
}

// Step 3: Scrollytelling Part 1 (commits over time)
function setupScrollytelling() {
    const NUM_ITEMS = commits.length;
    const ITEM_HEIGHT = 100; // Adjust based on your design
    const VISIBLE_COUNT = 10;

    const scrollContainer = d3.select("#scroll-container");
    const spacer = d3.select("#spacer").style("height", `${(NUM_ITEMS - 1) * ITEM_HEIGHT}px`);
    const itemsContainer = d3.select("#items-container");

    scrollContainer.on("scroll", () => {
        const scrollTop = scrollContainer.property("scrollTop");
        let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
        startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
        renderItems(startIndex);
    });

    function renderItems(startIndex) {
        itemsContainer.selectAll("div").remove();
        const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
        const newCommitSlice = commits.slice(startIndex, endIndex);

        itemsContainer.selectAll("div")
            .data(newCommitSlice)
            .enter().append("div")
            .html(d => `
                <p>
                    On ${d.datetime.toLocaleString("en", { dateStyle: "full", timeStyle: "short" })}, I made
                    <a href="${d.url}" target="_blank">
                        ${startIndex > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'}
                    </a>.
                    I edited ${d.totalLines} lines across ${d3.rollups(d.lines, D => D.length, d => d.file).length} files.
                    Then I looked over all I had made, and I saw that it was very good.
                </p>
            `)
            .style("position", "absolute")
            .style("top", (_, idx) => `${idx * ITEM_HEIGHT}px`);

        updateScatterplot(newCommitSlice);
    }

    // Initial render
    renderItems(0);
}