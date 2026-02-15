/* ============================================= */
/* GITHUB API — Fetch repos, events, and stats   */
/* ============================================= */

const GitHubAPI = (() => {
  const USERNAME = 'anjisha616';
  const API_BASE = 'https://api.github.com';

  // Repos to exclude from display
  const EXCLUDED_REPOS = ['cafe-clone', 'netflix-clone', 'starbucks-clone'];

  // Language color map
  const LANG_COLORS = {
    JavaScript: '#f1e05a',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Python: '#3572A5',
    TypeScript: '#2b7489',
    Jupyter: '#DA5B0B',
    Shell: '#89e051',
    Vue: '#41b883',
  };

  // Figma projects (manual, since Figma API requires auth)
  const FIGMA_PROJECTS = [
    {
      title: 'UI/UX Design Portfolio',
      description: 'Collection of user interface designs and prototypes for web and mobile applications.',
      thumbnail: null,
      tags: ['Figma', 'UI/UX', 'Prototype'],
      link: 'https://www.figma.com/files/team/1375711861175707486/project/237173255?fuid=1375711858638729691',
    },
    {
      title: 'Mobile App Designs',
      description: 'Responsive mobile-first application designs with modern interaction patterns.',
      thumbnail: null,
      tags: ['Figma', 'Mobile', 'UI Design'],
      link: 'https://www.figma.com/files/team/1375711861175707486/project/237173255?fuid=1375711858638729691',
    },
    {
      title: 'Web Interface Mockups',
      description: 'Clean, modern website mockups focusing on user experience and visual hierarchy.',
      thumbnail: null,
      tags: ['Figma', 'Web Design', 'Mockup'],
      link: 'https://www.figma.com/files/team/1375711861175707486/project/237173255?fuid=1375711858638729691',
    },
  ];

  /**
   * Fetch with error handling and caching
   */
  async function fetchJSON(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`GitHub API error (${url}):`, err.message);
      return null;
    }
  }

  /**
   * Get user repos, filtered and sorted
   */
  async function getRepos() {
    const data = await fetchJSON(
      `${API_BASE}/users/${USERNAME}/repos?per_page=100&sort=updated`
    );
    if (!data) return [];

    return data
      .filter(repo => !repo.fork && !EXCLUDED_REPOS.includes(repo.name))
      .sort((a, b) => (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count));
  }

  /**
   * Get user profile info
   */
  async function getUser() {
    return await fetchJSON(`${API_BASE}/users/${USERNAME}`);
  }

  /**
   * Get recent events for contribution simulation
   */
  async function getEvents() {
    const data = await fetchJSON(
      `${API_BASE}/users/${USERNAME}/events?per_page=100`
    );
    return data || [];
  }

  /**
   * Render project cards into the grid
   */
  function renderProjectCards(repos, container) {
    container.innerHTML = '';

    if (!repos || repos.length === 0) {
      container.innerHTML = `
        <div class="projects__empty">
          <p>Loading projects from GitHub...</p>
        </div>`;
      return;
    }

    // Take top repos (max 6)
    const topRepos = repos.slice(0, 6);

    topRepos.forEach((repo, i) => {
      const card = document.createElement('div');
      card.className = 'project-card animate-on-scroll visible';
      card.setAttribute('data-type', 'github');
      card.style.transitionDelay = `${i * 80}ms`;

      // Generate a gradient background color based on language
      const lang = repo.language || 'default';
      const color = LANG_COLORS[lang] || '#6b7280';

      card.innerHTML = `
        <div class="project-card__thumb" style="background: linear-gradient(135deg, ${color}30, ${color}60)">
          <div class="project-card__thumb-pattern">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
          </div>
        </div>
        <div class="project-card__body">
          <h3 class="project-card__title">${formatRepoName(repo.name)}</h3>
          <p class="project-card__desc">${repo.description || 'A project built with ' + (repo.language || 'various technologies') + '.'}</p>
          <div class="project-card__tech">
            ${repo.language ? `<span class="project-card__tech-tag">${repo.language}</span>` : ''}
            ${repo.topics ? repo.topics.slice(0, 3).map(t => `<span class="project-card__tech-tag">${t}</span>`).join('') : ''}
          </div>
          <div class="project-card__links">
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-card__link">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              Source Code
            </a>
            ${repo.homepage ? `
            <a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" class="project-card__link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Live Demo
            </a>` : ''}
          </div>
        </div>`;

      container.appendChild(card);
    });
  }

  /**
   * Render Figma project cards
   */
  function renderFigmaCards(container) {
    container.innerHTML = '';

    FIGMA_PROJECTS.forEach((project, i) => {
      const card = document.createElement('div');
      card.className = 'project-card project-card--figma animate-on-scroll visible';
      card.setAttribute('data-type', 'figma');
      card.style.transitionDelay = `${i * 80}ms`;

      card.innerHTML = `
        <div class="project-card__thumb" style="background: linear-gradient(135deg, #a259ff, #1abcfe)">
          <div class="project-card__thumb-pattern">
            <svg width="48" height="48" viewBox="0 0 38 57" fill="none">
              <path fill="rgba(255,255,255,0.6)" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/>
              <path fill="rgba(255,255,255,0.4)" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/>
              <path fill="rgba(255,255,255,0.5)" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/>
              <path fill="rgba(255,255,255,0.3)" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/>
              <path fill="rgba(255,255,255,0.45)" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/>
            </svg>
          </div>
        </div>
        <div class="project-card__body">
          <h3 class="project-card__title">${project.title}</h3>
          <p class="project-card__desc">${project.description}</p>
          <div class="project-card__tech">
            ${project.tags.map(t => `<span class="project-card__tech-tag">${t}</span>`).join('')}
          </div>
          <div class="project-card__links">
            <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-card__link">
              <svg viewBox="0 0 38 57" fill="currentColor" width="14" height="14"><path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/><path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/><path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/><path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/><path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/></svg>
              View in Figma
            </a>
          </div>
        </div>`;

      container.appendChild(card);
    });
  }

  /**
   * Render GitHub stats
   */
  async function renderStats(repos, events) {
    const totalReposEl = document.getElementById('totalRepos');
    const totalCommitsEl = document.getElementById('totalCommits');
    const topLanguageEl = document.getElementById('topLanguage');
    const totalStarsEl = document.getElementById('totalStars');

    if (totalReposEl && repos) {
      totalReposEl.textContent = repos.length;
    }

    if (totalCommitsEl && events) {
      const pushEvents = events.filter(e => e.type === 'PushEvent');
      const totalCommits = pushEvents.reduce((sum, e) => sum + (e.payload.commits ? e.payload.commits.length : 0), 0);
      totalCommitsEl.textContent = totalCommits;
    }

    if (topLanguageEl && repos) {
      // Count languages
      const langCount = {};
      repos.forEach(r => {
        if (r.language) {
          langCount[r.language] = (langCount[r.language] || 0) + 1;
        }
      });
      const topLang = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0];
      topLanguageEl.textContent = topLang ? topLang[0] : 'N/A';
    }

    if (totalStarsEl && repos) {
      const stars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
      totalStarsEl.textContent = stars;
    }
  }

  /**
   * Render contribution graph (simulated from events)
   */
  function renderContributionGraph(events) {
    const graphEl = document.getElementById('contributionGraph');
    if (!graphEl) return;

    graphEl.innerHTML = '';

    // Build a date -> count map from events
    const dateMap = {};
    if (events && events.length) {
      events.forEach(e => {
        const date = e.created_at.split('T')[0];
        if (e.type === 'PushEvent' && e.payload.commits) {
          dateMap[date] = (dateMap[date] || 0) + e.payload.commits.length;
        } else {
          dateMap[date] = (dateMap[date] || 0) + 1;
        }
      });
    }

    // Generate last 52 weeks × 7 days
    const today = new Date();
    const totalDays = 52 * 7;
    const fragment = document.createDocumentFragment();

    for (let col = 0; col < 52; col++) {
      const weekEl = document.createElement('div');
      weekEl.style.cssText = 'display:flex;flex-direction:column;gap:3px;';

      for (let row = 0; row < 7; row++) {
        const dayIndex = col * 7 + row;
        const date = new Date(today);
        date.setDate(date.getDate() - (totalDays - dayIndex));
        const dateStr = date.toISOString().split('T')[0];

        const count = dateMap[dateStr] || 0;
        let level = 0;
        if (count >= 8) level = 4;
        else if (count >= 5) level = 3;
        else if (count >= 3) level = 2;
        else if (count >= 1) level = 1;

        const dayEl = document.createElement('div');
        dayEl.className = 'github__graph-day';
        dayEl.setAttribute('data-level', level);
        dayEl.setAttribute('title', `${dateStr}: ${count} contributions`);
        weekEl.appendChild(dayEl);
      }

      fragment.appendChild(weekEl);
    }

    graphEl.appendChild(fragment);
  }

  /**
   * Render pinned repos
   */
  function renderPinnedRepos(repos) {
    const container = document.getElementById('pinnedRepos');
    if (!container || !repos) return;

    container.innerHTML = '';

    // Take top 4 repos by stars
    const pinned = repos.slice(0, 4);

    pinned.forEach(repo => {
      const lang = repo.language || 'default';
      const color = LANG_COLORS[lang] || '#6b7280';

      const card = document.createElement('div');
      card.className = 'github__repo-card';
      card.innerHTML = `
        <div class="github__repo-name">
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
            📁 ${repo.name}
          </a>
        </div>
        <p class="github__repo-desc">${repo.description || 'No description provided.'}</p>
        <div class="github__repo-meta">
          <span class="github__repo-lang">
            <span class="github__repo-lang-dot" style="background: ${color}"></span>
            ${repo.language || 'Unknown'}
          </span>
          <span class="github__repo-stat">⭐ ${repo.stargazers_count}</span>
          <span class="github__repo-stat">🍴 ${repo.forks_count}</span>
        </div>`;

      container.appendChild(card);
    });
  }

  /**
   * Format repo name: kebab-case → Title Case
   */
  function formatRepoName(name) {
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  /**
   * Handle project filter clicks
   */
  function setupFilters() {
    const filterBtns = document.querySelectorAll('.projects__filter');
    const githubGrid = document.getElementById('projectsGrid');
    const figmaSection = document.getElementById('figmaSection');
    const figmaGrid = document.getElementById('figmaGrid');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.dataset.filter;

        // Show/hide grids
        if (filter === 'all') {
          githubGrid.style.display = '';
          figmaSection.style.display = '';
          figmaGrid.style.display = '';
        } else if (filter === 'github') {
          githubGrid.style.display = '';
          figmaSection.style.display = 'none';
          figmaGrid.style.display = 'none';
        } else if (filter === 'figma') {
          githubGrid.style.display = 'none';
          figmaSection.style.display = '';
          figmaGrid.style.display = '';
        }
      });
    });
  }

  /**
   * Initialize: fetch all data and render
   */
  async function init() {
    const projectsGrid = document.getElementById('projectsGrid');
    const figmaGrid = document.getElementById('figmaGrid');

    // Fetch repos and events in parallel
    const [repos, events] = await Promise.all([
      getRepos(),
      getEvents()
    ]);

    // Render everything
    if (projectsGrid) renderProjectCards(repos, projectsGrid);
    if (figmaGrid) renderFigmaCards(figmaGrid);
    renderStats(repos, events);
    renderContributionGraph(events);
    renderPinnedRepos(repos);
    setupFilters();
  }

  // Public API
  return { init };
})();
