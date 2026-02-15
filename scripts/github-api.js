/* ===================================================
   JUKEBOX PORTFOLIO — GitHub API Integration
   Fetches repos, stats, contribution data for anjisha616
   =================================================== */

const GitHubAPI = (function () {
  'use strict';

  const USERNAME = 'anjisha616';
  const API_BASE = 'https://api.github.com';
  const EXCLUDE_REPOS = ['cafe-clone', 'netflix-clone', 'starbucks-clone'];

  // Figma projects (manual data)
  const FIGMA_PROJECTS = [
    {
      name: 'Portfolio Design',
      description: 'Personal portfolio UI/UX design with modern layout and responsive components.',
      url: '#',
      tags: ['UI/UX', 'Figma', 'Web Design']
    },
    {
      name: 'Mobile App Concept',
      description: 'Mobile-first app design concept with intuitive navigation and clean interface.',
      url: '#',
      tags: ['Mobile', 'UI Design', 'Prototype']
    }
  ];

  // Language color map
  const LANG_COLORS = {
    'JavaScript': '#f1e05a',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Python': '#3572A5',
    'TypeScript': '#3178c6',
    'Vue': '#41b883',
    'SCSS': '#c6538c',
    'Shell': '#89e051',
    'Jupyter Notebook': '#DA5B0B',
    'null': '#8a8070'
  };

  let dataLoaded = { projects: false, stats: false };
  let cachedRepos = null;

  // ---- Public API ----
  function loadAll() {
    loadProjects();
    loadStats();
  }

  async function loadProjects() {
    if (dataLoaded.projects) return;
    dataLoaded.projects = true;

    try {
      const repos = await fetchRepos();
      renderProjects(repos);
    } catch (err) {
      console.error('Failed to load GitHub projects:', err);
      renderProjectsError();
    }
  }

  async function loadStats() {
    if (dataLoaded.stats) return;
    dataLoaded.stats = true;

    try {
      const repos = await fetchRepos();
      renderStats(repos);
      renderContributionGraph();
      renderPinnedRepos(repos);
    } catch (err) {
      console.error('Failed to load GitHub stats:', err);
    }
  }

  // ---- Fetch Repos ----
  async function fetchRepos() {
    if (cachedRepos) return cachedRepos;

    const response = await fetch(`${API_BASE}/users/${USERNAME}/repos?per_page=100&sort=updated`);
    if (!response.ok) throw new Error(`GitHub API: ${response.status}`);
    const repos = await response.json();

    // Filter out excluded repos
    cachedRepos = repos.filter(repo =>
      !EXCLUDE_REPOS.includes(repo.name.toLowerCase()) && !repo.fork
    );
    return cachedRepos;
  }

  // ---- Render Projects (B1) ----
  function renderProjects(repos) {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    let html = '';

    // GitHub repos
    repos.forEach(repo => {
      const lang = repo.language || 'Unknown';
      const langColor = LANG_COLORS[lang] || LANG_COLORS['null'];
      const desc = repo.description || 'No description available';
      const homepage = repo.homepage;

      html += `
        <div class="project-card" data-source="github">
          <div class="project-card__title">
            <span class="project-card__title-icon">📁</span>
            ${escapeHtml(repo.name)}
          </div>
          <div class="project-card__desc">${escapeHtml(desc)}</div>
          <div class="project-card__meta">
            <span class="project-card__lang">
              <span class="lang-dot" style="background:${langColor}"></span>
              ${escapeHtml(lang)}
            </span>
            ${repo.stargazers_count > 0 ? `<span>⭐ ${repo.stargazers_count}</span>` : ''}
            ${repo.forks_count > 0 ? `<span>🔀 ${repo.forks_count}</span>` : ''}
            <span class="project-card__source project-card__source--github">GitHub</span>
          </div>
          <div class="project-card__links">
            <a href="${repo.html_url}" target="_blank" rel="noopener" class="project-card__link">⌨ Code</a>
            ${homepage ? `<a href="${homepage}" target="_blank" rel="noopener" class="project-card__link">🌐 Live</a>` : ''}
          </div>
        </div>
      `;
    });

    // Figma projects
    FIGMA_PROJECTS.forEach(project => {
      html += `
        <div class="project-card" data-source="figma">
          <div class="project-card__title">
            <span class="project-card__title-icon">🎨</span>
            ${escapeHtml(project.name)}
          </div>
          <div class="project-card__desc">${escapeHtml(project.description)}</div>
          <div class="project-card__meta">
            <span class="project-card__lang">
              <span class="lang-dot" style="background:#ff6b35"></span>
              Figma
            </span>
            <span class="project-card__source project-card__source--figma">Figma</span>
          </div>
          <div class="project-card__links">
            ${project.url !== '#' ? `<a href="${project.url}" target="_blank" rel="noopener" class="project-card__link">🔗 View Design</a>` : '<span class="project-card__link" style="opacity:0.4">Coming Soon</span>'}
          </div>
        </div>
      `;
    });

    grid.innerHTML = html || '<p style="color:var(--screen-muted)">No projects found.</p>';
  }

  function renderProjectsError() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    grid.innerHTML = `
      <div class="project-loading">
        <p style="color: var(--neon-pink);">⚠ Could not load projects from GitHub.</p>
        <p>Visit <a href="https://github.com/${USERNAME}" target="_blank" rel="noopener">github.com/${USERNAME}</a> directly.</p>
      </div>
    `;
  }

  // ---- Render Stats (B2) ----
  function renderStats(repos) {
    // Total repos
    const totalReposEl = document.getElementById('totalRepos');
    if (totalReposEl) totalReposEl.textContent = repos.length;

    // Stars
    const totalStarsEl = document.getElementById('totalStars');
    if (totalStarsEl) {
      const stars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
      totalStarsEl.textContent = stars;
    }

    // Top language
    const topLangEl = document.getElementById('topLanguage');
    if (topLangEl) {
      const langCount = {};
      repos.forEach(r => {
        if (r.language) {
          langCount[r.language] = (langCount[r.language] || 0) + 1;
        }
      });
      const topLang = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0];
      topLangEl.textContent = topLang ? topLang[0] : 'N/A';
    }

    // Commits (estimate from events API)
    loadCommitCount();
  }

  async function loadCommitCount() {
    try {
      const response = await fetch(`${API_BASE}/users/${USERNAME}/events/public?per_page=100`);
      if (!response.ok) throw new Error('Events API failed');
      const events = await response.json();

      const pushEvents = events.filter(e => e.type === 'PushEvent');
      const totalCommits = pushEvents.reduce((sum, e) => sum + (e.payload.commits ? e.payload.commits.length : 0), 0);

      const commitsEl = document.getElementById('totalCommits');
      if (commitsEl) commitsEl.textContent = totalCommits > 0 ? `${totalCommits}+` : '--';
    } catch (err) {
      console.warn('Could not load commit count:', err);
    }
  }

  // ---- Contribution Graph (B2) ----
  function renderContributionGraph() {
    const graphEl = document.getElementById('contributionGraph');
    if (!graphEl) return;

    // Generate a mock contribution graph (GitHub API doesn't provide this directly)
    // We'll generate 52 weeks × 7 days = 364 cells
    const levels = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
    let html = '';

    for (let week = 0; week < 52; week++) {
      for (let day = 0; day < 7; day++) {
        // Random level, weighted toward lower activity
        const rand = Math.random();
        let level;
        if (rand < 0.55) level = 0;
        else if (rand < 0.75) level = 1;
        else if (rand < 0.88) level = 2;
        else if (rand < 0.96) level = 3;
        else level = 4;

        html += `<span class="gbox" style="background:${levels[level]}"></span>`;
      }
    }

    graphEl.innerHTML = html;
  }

  // ---- Pinned/Featured Repos (B2) ----
  function renderPinnedRepos(repos) {
    const container = document.getElementById('pinnedRepos');
    if (!container) return;

    // Take top 4 most recently updated repos
    const featured = repos.slice(0, 4);
    let html = '';

    featured.forEach(repo => {
      const lang = repo.language || 'Unknown';
      const langColor = LANG_COLORS[lang] || LANG_COLORS['null'];

      html += `
        <div class="project-card" data-source="github">
          <div class="project-card__title">
            <span class="project-card__title-icon">📌</span>
            ${escapeHtml(repo.name)}
          </div>
          <div class="project-card__desc">${escapeHtml(repo.description || 'No description')}</div>
          <div class="project-card__meta">
            <span class="project-card__lang">
              <span class="lang-dot" style="background:${langColor}"></span>
              ${escapeHtml(lang)}
            </span>
            ${repo.stargazers_count > 0 ? `<span>⭐ ${repo.stargazers_count}</span>` : ''}
          </div>
          <div class="project-card__links">
            <a href="${repo.html_url}" target="_blank" rel="noopener" class="project-card__link">⌨ View</a>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // ---- Utility ----
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Public Interface ----
  return {
    loadAll,
    loadProjects,
    loadStats
  };
})();
