// GitHub Analytics Dashboard
const GITHUB_USERNAME = 'AncientAbacus';

// Language colors (GitHub's official colors)
const languageColors = {
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  TypeScript: '#2b7489',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  Swift: '#ffac45',
  Jupyter: '#DA5B0B',
  Shell: '#89e051',
  R: '#198CE7'
};

let repositories = [];
let userData = null;

// Animate number counting
function animateNumber(element, target, duration = 1000) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(start + (target - start) * eased);
    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Fetch user data
async function fetchUserData() {
  const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
  if (!response.ok) throw new Error('Failed to fetch user data');
  return response.json();
}

// Fetch repositories
async function fetchRepositories() {
  const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);
  if (!response.ok) throw new Error('Failed to fetch repositories');
  return response.json();
}

// Calculate language stats
function calculateLanguageStats() {
  const stats = {};
  repositories.forEach(repo => {
    if (repo.language) {
      stats[repo.language] = (stats[repo.language] || 0) + 1;
    }
  });
  return Object.entries(stats).sort((a, b) => b[1] - a[1]);
}

// Render stats with animation
function renderStats() {
  const totalRepos = repositories.length;
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
  const languages = new Set(repositories.map(r => r.language).filter(Boolean)).size;

  animateNumber(document.getElementById('stat-repos'), totalRepos);
  animateNumber(document.getElementById('stat-stars'), totalStars);
  animateNumber(document.getElementById('stat-forks'), totalForks);
  animateNumber(document.getElementById('stat-languages'), languages);
}

// Render donut chart
function renderLanguageDonut() {
  const langStats = calculateLanguageStats();
  const total = langStats.reduce((sum, [, count]) => sum + count, 0);

  if (langStats.length === 0) return;

  // Update center text
  const topLang = langStats[0];
  const topPct = Math.round((topLang[1] / total) * 100);
  document.getElementById('top-language-pct').textContent = `${topPct}%`;
  document.getElementById('top-language-name').textContent = topLang[0];

  // Create donut chart
  const svg = d3.select('#language-donut');
  const width = 300, height = 300;
  const radius = Math.min(width, height) / 2;
  const innerRadius = radius * 0.6;

  const g = svg.append('g')
    .attr('transform', `translate(${width/2}, ${height/2})`);

  const pie = d3.pie()
    .value(d => d[1])
    .sort(null);

  const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(radius);

  const hoverArc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(radius + 10);

  const arcs = g.selectAll('.arc')
    .data(pie(langStats.slice(0, 8)))
    .enter()
    .append('g')
    .attr('class', 'arc');

  arcs.append('path')
    .attr('d', arc)
    .attr('fill', d => languageColors[d.data[0]] || '#52B788')
    .attr('stroke', '#0D1F17')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .on('mouseover', function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', hoverArc);

      document.getElementById('top-language-pct').textContent = `${Math.round((d.data[1] / total) * 100)}%`;
      document.getElementById('top-language-name').textContent = d.data[0];
    })
    .on('mouseout', function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', arc);

      document.getElementById('top-language-pct').textContent = `${topPct}%`;
      document.getElementById('top-language-name').textContent = topLang[0];
    });

  // Render language bars
  const barsContainer = document.getElementById('language-bars');
  barsContainer.innerHTML = '';

  langStats.slice(0, 6).forEach(([lang, count], i) => {
    const pct = (count / total) * 100;
    const color = languageColors[lang] || '#52B788';

    const item = document.createElement('div');
    item.className = 'lang-bar-item';
    item.innerHTML = `
      <span class="lang-bar-name">${lang}</span>
      <div class="lang-bar-track">
        <div class="lang-bar-fill" style="width: 0%; background: ${color}; --bar-color: ${color}"></div>
      </div>
      <span class="lang-bar-count">${count}</span>
    `;
    barsContainer.appendChild(item);

    // Animate bar
    setTimeout(() => {
      item.querySelector('.lang-bar-fill').style.width = `${pct}%`;
    }, 100 + i * 100);
  });
}

// Render activity heatmap
function renderHeatmap() {
  const svg = d3.select('#activity-heatmap');
  const cellSize = 8;
  const cellGap = 2;

  // Group repos by month
  const monthlyActivity = {};
  repositories.forEach(repo => {
    const date = new Date(repo.pushed_at || repo.updated_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyActivity[monthKey] = (monthlyActivity[monthKey] || 0) + 1;
  });

  // Generate last 40 weeks of cells (fits better)
  const cells = [];
  const today = new Date();
  for (let week = 0; week < 40; week++) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - ((39 - week) * 7 + (6 - day)));
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const activity = monthlyActivity[monthKey] || 0;
      cells.push({ week, day, activity, date });
    }
  }

  const maxActivity = Math.max(...Object.values(monthlyActivity), 1);

  svg.selectAll('.heatmap-cell')
    .data(cells)
    .enter()
    .append('rect')
    .attr('class', 'heatmap-cell')
    .attr('x', d => d.week * (cellSize + cellGap) + 20)
    .attr('y', d => d.day * (cellSize + cellGap) + 15)
    .attr('width', cellSize)
    .attr('height', cellSize)
    .attr('rx', 2)
    .attr('fill', d => {
      const level = Math.ceil((d.activity / maxActivity) * 4);
      const lightness = 20 + level * 15;
      return `hsl(152, 50%, ${lightness}%)`;
    })
    .append('title')
    .text(d => `${d.date.toDateString()}: ${d.activity} updates`);
}

// Render timeline
function renderTimeline() {
  const joinDate = new Date(userData.created_at);
  const now = new Date();
  const years = Math.floor((now - joinDate) / (365.25 * 24 * 60 * 60 * 1000));
  const reposPerYear = (repositories.length / Math.max(years, 1)).toFixed(1);

  document.getElementById('years-coding').textContent = years;
  document.getElementById('repos-per-year').textContent = reposPerYear;
  document.getElementById('join-date').textContent = joinDate.getFullYear();

  // Sparkline
  const svg = d3.select('#timeline-spark');
  const width = 400, height = 80;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };

  // Group by year
  const yearCounts = {};
  repositories.forEach(repo => {
    const year = new Date(repo.created_at).getFullYear();
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  });

  const data = Object.entries(yearCounts).sort((a, b) => a[0] - b[0]);

  const x = d3.scaleLinear()
    .domain([0, data.length - 1])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[1])])
    .range([height - margin.bottom, margin.top]);

  const line = d3.line()
    .x((d, i) => x(i))
    .y(d => y(d[1]))
    .curve(d3.curveMonotoneX);

  const area = d3.area()
    .x((d, i) => x(i))
    .y0(height - margin.bottom)
    .y1(d => y(d[1]))
    .curve(d3.curveMonotoneX);

  // Gradient
  const gradient = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'area-gradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '0%').attr('y2', '100%');

  gradient.append('stop').attr('offset', '0%').attr('stop-color', '#52B788').attr('stop-opacity', 0.5);
  gradient.append('stop').attr('offset', '100%').attr('stop-color', '#52B788').attr('stop-opacity', 0);

  svg.append('path')
    .datum(data)
    .attr('fill', 'url(#area-gradient)')
    .attr('d', area);

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#52B788')
    .attr('stroke-width', 2)
    .attr('d', line);

  // Dots
  svg.selectAll('.spark-dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', (d, i) => x(i))
    .attr('cy', d => y(d[1]))
    .attr('r', 4)
    .attr('fill', '#D4AF37')
    .attr('stroke', '#0D1F17')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .append('title')
    .text(d => `${d[0]}: ${d[1]} repos`);
}

// Render top repo
function renderTopRepo() {
  const topRepo = [...repositories].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];

  if (topRepo) {
    document.getElementById('top-repo-name').textContent = topRepo.name;
    document.getElementById('top-repo-desc').textContent = topRepo.description || 'No description';
    document.getElementById('top-repo-stars').textContent = topRepo.stargazers_count;
    document.getElementById('top-repo-forks').textContent = topRepo.forks_count;
    document.getElementById('top-repo-lang').textContent = topRepo.language || '—';

    document.getElementById('top-repo-card').onclick = () => window.open(topRepo.html_url, '_blank');
  }
}

// Render size bubbles
function renderSizeBubbles() {
  const container = document.getElementById('size-bubbles');
  container.innerHTML = '';

  const topBySize = [...repositories]
    .filter(r => r.size > 0)
    .sort((a, b) => b.size - a.size)
    .slice(0, 8);

  const maxSize = Math.max(...topBySize.map(r => r.size));

  topBySize.forEach(repo => {
    const sizeRatio = repo.size / maxSize;
    const bubbleSize = Math.max(50, Math.min(90, sizeRatio * 90));
    const bubble = document.createElement('div');
    bubble.className = 'size-bubble';
    bubble.style.width = `${bubbleSize}px`;
    bubble.style.height = `${bubbleSize}px`;

    // Show abbreviated name or initials
    const name = repo.name.length > 6 ? repo.name.substring(0, 5) + '...' : repo.name;
    bubble.innerHTML = `<span class="bubble-name">${name}</span><span class="bubble-size">${(repo.size / 1024).toFixed(1)}MB</span>`;
    bubble.title = `${repo.name}: ${(repo.size / 1024).toFixed(1)} MB`;
    bubble.onclick = () => window.open(repo.html_url, '_blank');
    container.appendChild(bubble);
  });
}

// Render recent repos
function renderRecentRepos() {
  const container = document.getElementById('recent-repos');
  container.innerHTML = '';

  const recent = [...repositories]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 10);

  recent.forEach(repo => {
    const item = document.createElement('div');
    item.className = 'recent-repo-item';
    item.innerHTML = `
      <div class="recent-repo-icon">📁</div>
      <div class="recent-repo-info">
        <div class="recent-repo-name">${repo.name}</div>
        <div class="recent-repo-date">${new Date(repo.updated_at).toLocaleDateString()}</div>
      </div>
    `;
    item.onclick = () => window.open(repo.html_url, '_blank');
    container.appendChild(item);
  });
}

// Render tech radar
function renderTechRadar() {
  const langStats = calculateLanguageStats();
  const svg = d3.select('#tech-radar');
  const size = 300;
  const center = size / 2;
  const maxRadius = size / 2 - 30;

  // Draw rings with labels
  const rings = [
    { scale: 0.33, label: 'Learning' },
    { scale: 0.66, label: 'Using' },
    { scale: 1, label: 'Expert' }
  ];

  rings.forEach(({ scale, label }) => {
    svg.append('circle')
      .attr('class', 'radar-ring')
      .attr('cx', center)
      .attr('cy', center)
      .attr('r', maxRadius * scale);
  });

  // Draw cross lines
  svg.append('line').attr('x1', center).attr('y1', 30).attr('x2', center).attr('y2', size - 30).attr('stroke', '#52B788').attr('opacity', 0.2);
  svg.append('line').attr('x1', 30).attr('y1', center).attr('x2', size - 30).attr('y2', center).attr('stroke', '#52B788').attr('opacity', 0.2);

  // Plot languages - distance based on repo count
  const total = langStats.reduce((sum, [, c]) => sum + c, 0);
  const maxCount = langStats.length > 0 ? langStats[0][1] : 1;

  langStats.slice(0, 6).forEach(([lang, count], i) => {
    const angle = (i / 6) * 2 * Math.PI - Math.PI / 2;
    // More repos = closer to center (expert), fewer = outer ring
    const proficiency = count / maxCount;
    const distance = maxRadius * (1 - proficiency * 0.6) - 10;
    const x = center + Math.cos(angle) * distance;
    const y = center + Math.sin(angle) * distance;

    const dotSize = Math.max(6, Math.min(12, count * 2));

    svg.append('circle')
      .attr('class', 'radar-dot')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', dotSize)
      .attr('fill', languageColors[lang] || '#52B788')
      .append('title')
      .text(`${lang}: ${count} repos`);

    // Position labels at edge
    const labelDist = maxRadius + 15;
    const labelX = center + Math.cos(angle) * labelDist;
    const labelY = center + Math.sin(angle) * labelDist;

    svg.append('text')
      .attr('x', labelX)
      .attr('y', labelY)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', languageColors[lang] || '#E8E6E3')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .text(lang);
  });
}

// Render commit bars (simulated based on repo updates)
function renderCommitBars() {
  const container = document.getElementById('commit-bars');
  container.innerHTML = '';

  // Group by month (last 12 months)
  const monthlyUpdates = {};
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyUpdates[key] = 0;
  }

  repositories.forEach(repo => {
    const d = new Date(repo.updated_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyUpdates.hasOwnProperty(key)) {
      monthlyUpdates[key]++;
    }
  });

  const values = Object.values(monthlyUpdates).reverse();
  const max = Math.max(...values, 1);

  values.forEach(val => {
    const bar = document.createElement('div');
    bar.className = 'commit-bar';
    bar.style.height = `${(val / max) * 100}%`;
    bar.title = `${val} updates`;
    container.appendChild(bar);
  });
}

// Profile data
function renderProfile() {
  if (userData) {
    document.getElementById('followers-count').textContent = userData.followers;
    document.getElementById('following-count').textContent = userData.following;
  }
}

// Particle network animation
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#52B788';
      ctx.fill();
    }
  }

  // Create particles
  for (let i = 0; i < 30; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    particles.forEach((p1, i) => {
      particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 80) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(82, 183, 136, ${1 - dist / 80})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

// Mouse tracking for stat cards
function initMouseTracking() {
  document.querySelectorAll('.meta-stat').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}

// Initialize
async function init() {
  try {
    // Fetch data
    [userData, repositories] = await Promise.all([
      fetchUserData(),
      fetchRepositories()
    ]);

    // Hide loading
    document.getElementById('loading-overlay').classList.add('hidden');

    // Render all visualizations
    renderStats();
    renderLanguageDonut();
    renderHeatmap();
    renderTimeline();
    renderTopRepo();
    renderSizeBubbles();
    renderRecentRepos();
    renderTechRadar();
    renderCommitBars();
    renderProfile();
    initParticles();
    initMouseTracking();

  } catch (error) {
    console.error('Failed to initialize:', error);
    document.querySelector('.loader').innerHTML = `
      <p style="color: #FF6B6B;">Failed to load GitHub data</p>
      <p style="font-size: 0.9rem; opacity: 0.7;">Please try again later</p>
    `;
  }
}

document.addEventListener('DOMContentLoaded', init);
