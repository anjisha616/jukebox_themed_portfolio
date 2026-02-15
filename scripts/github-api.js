/* ============================================================
   GITHUB-API.JS — GitHub Integration & Data Fetching
   Fetches repos, events, and builds contribution heatmap
   ============================================================ */

'use strict';

const GitHubAPI = (() => {
  const USERNAME = 'anjisha616';
  const BASE_URL = 'https://api.github.com';
  const EXCLUDED_REPOS = ['cafe-clone', 'netflix-clone', 'starbucks-clone'];

  // Cache to prevent redundant API calls
  const cache = {
    repos: null,
    events: null,
    lastFetch: 0
  };

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /* ===========================================================
     FETCH REPOSITORIES
     =========================================================== */
  async function fetchRepos() {
    // Return cached data if fresh
    if (cache.repos && Date.now() - cache.lastFetch < CACHE_DURATION) {
      return cache.repos;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/users/${USERNAME}/repos?sort=updated&per_page=30&type=owner`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const repos = await response.json();

      // Filter out excluded repos and forks
      const filtered = repos.filter(repo => 
        !EXCLUDED_REPOS.includes(repo.name.toLowerCase()) && !repo.fork
      );

      // Sort by stars then updated date
      filtered.sort((a, b) => {
        if (b.stargazers_count !== a.stargazers_count) {
          return b.stargazers_count - a.stargazers_count;
        }
        return new Date(b.updated_at) - new Date(a.updated_at);
      });

      cache.repos = filtered;
      cache.lastFetch = Date.now();
      return filtered;
    } catch (error) {
      console.error('[GitHub] Failed to fetch repos:', error);
      return getPlaceholderRepos();
    }
  }

  /* ===========================================================
     FETCH USER EVENTS (for contribution data)
     =========================================================== */
  async function fetchEvents() {
    if (cache.events && Date.now() - cache.lastFetch < CACHE_DURATION) {
      return cache.events;
    }

    try {
      // Fetch multiple pages for more data
      const pages = await Promise.all([
        fetch(`${BASE_URL}/users/${USERNAME}/events?per_page=100&page=1`, {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        }),
        fetch(`${BASE_URL}/users/${USERNAME}/events?per_page=100&page=2`, {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        })
      ]);

      let allEvents = [];
      for (const response of pages) {
        if (response.ok) {
          const data = await response.json();
          allEvents = allEvents.concat(data);
        }
      }

      cache.events = allEvents;
      return allEvents;
    } catch (error) {
      console.error('[GitHub] Failed to fetch events:', error);
      return [];
    }
  }

  /* ===========================================================
     COMPUTE STATS from fetched data
     =========================================================== */
  async function getStats() {
    const [repos, events] = await Promise.all([fetchRepos(), fetchEvents()]);

    // Count push events (commits proxy)
    const pushEvents = events.filter(e => e.type === 'PushEvent');
    const totalCommits = pushEvents.reduce((sum, e) => sum + (e.payload?.commits?.length || 0), 0);

    // Unique languages
    const languages = new Set();
    repos.forEach(repo => {
      if (repo.language) languages.add(repo.language);
    });

    // Most active repo
    const repoActivity = {};
    pushEvents.forEach(e => {
      const name = e.repo?.name?.split('/')[1] || 'unknown';
      repoActivity[name] = (repoActivity[name] || 0) + 1;
    });
    const mostActiveRepo = Object.entries(repoActivity)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalRepos: repos.length,
      totalCommits,
      languages: Array.from(languages),
      languageCount: languages.size,
      mostActiveRepo,
      recentEvents: events.length
    };
  }

  /* ===========================================================
     BUILD CONTRIBUTION HEATMAP DATA
     Groups events by date, assigns intensity levels
     =========================================================== */
  async function getHeatmapData() {
    const events = await fetchEvents();

    // Create a map of dates -> event count (last 90 days)
    const now = new Date();
    const dateMap = {};

    // Initialize last 90 days
    for (let i = 89; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dateMap[key] = 0;
    }

    // Count events per day
    events.forEach(event => {
      const date = event.created_at?.split('T')[0];
      if (date && dateMap.hasOwnProperty(date)) {
        dateMap[date]++;
      }
    });

    // Convert to array with intensity levels (0-4)
    const maxCount = Math.max(...Object.values(dateMap), 1);
    return Object.entries(dateMap).map(([date, count]) => {
      let level = 0;
      if (count > 0) level = 1;
      if (count > maxCount * 0.25) level = 2;
      if (count > maxCount * 0.5) level = 3;
      if (count > maxCount * 0.75) level = 4;
      return { date, count, level };
    });
  }

  /* ===========================================================
     RENDER FUNCTIONS — Build DOM elements from data
     =========================================================== */

  // Render project cards into the projects grid
  function renderProjectCards(repos, container) {
    if (!container) return;
    container.innerHTML = '';

    if (!repos || repos.length === 0) {
      container.innerHTML = '<p class="heatmap-loading">No projects found.</p>';
      return;
    }

    repos.forEach((repo, index) => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.setAttribute('data-type', 'github');
      card.setAttribute('data-repo', repo.name);
      card.innerHTML = `
        <div class="project-card__vinyl">
          <div class="project-card__vinyl-label" style="background: ${getLanguageColor(repo.language)}">${(repo.language || 'MD').substring(0, 2)}</div>
        </div>
        <div class="project-card__info">
          <h3>${escapeHtml(repo.name)}</h3>
          <p>${escapeHtml(repo.description || 'No description provided.')}</p>
          <div class="project-card__meta">
            ${repo.language ? `<span>🔵 ${escapeHtml(repo.language)}</span>` : ''}
            <span>⭐ ${repo.stargazers_count}</span>
            <span>🍴 ${repo.forks_count}</span>
          </div>
          <a href="${repo.html_url}" class="project-card__link" target="_blank" rel="noopener">View on GitHub →</a>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Render heatmap cells
  function renderHeatmap(data, container) {
    if (!container) return;
    container.innerHTML = '';

    if (!data || data.length === 0) {
      container.innerHTML = '<p class="heatmap-loading">No contribution data available.</p>';
      return;
    }

    // Create week columns (7 rows per column)
    const weeks = [];
    let currentWeek = [];
    data.forEach((day, i) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || i === data.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    weeks.forEach(week => {
      const weekCol = document.createElement('div');
      weekCol.style.display = 'flex';
      weekCol.style.flexDirection = 'column';
      weekCol.style.gap = '3px';

      week.forEach(day => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        cell.setAttribute('data-level', day.level);
        cell.setAttribute('title', `${day.date}: ${day.count} events`);
        weekCol.appendChild(cell);
      });

      container.appendChild(weekCol);
    });
  }

  // Update stats display
  function renderStats(stats) {
    const reposEl = document.getElementById('stat-repos');
    const commitsEl = document.getElementById('stat-commits');
    const langsEl = document.getElementById('stat-languages');

    if (reposEl) reposEl.textContent = stats.totalRepos;
    if (commitsEl) commitsEl.textContent = stats.totalCommits;
    if (langsEl) langsEl.textContent = stats.languageCount;
  }

  /* ===========================================================
     BUILD PROJECT BUTTONS for the button grid
     Returns array of { code, name, repo } for app.js to use
     =========================================================== */
  function buildProjectEntries(repos) {
    const entries = [];
    const rows = ['C', 'D', 'E', 'F', 'G', 'H'];
    let rowIdx = 0;
    let colIdx = 1;

    repos.forEach(repo => {
      if (colIdx > 3) {
        colIdx = 1;
        rowIdx++;
      }
      if (rowIdx >= rows.length) return;

      const code = `${rows[rowIdx]}${colIdx}`;
      entries.push({
        code,
        name: repo.name,
        description: repo.description || '',
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count
      });
      colIdx++;
    });

    return entries;
  }

  /* ===========================================================
     INIT — Main entry point, fetches everything and renders
     =========================================================== */
  async function init() {
    console.log('[GitHub] Initializing...');

    try {
      const [repos, stats, heatmapData] = await Promise.all([
        fetchRepos(),
        getStats(),
        getHeatmapData()
      ]);

      // Render project cards
      const projectsGrid = document.getElementById('projects-grid');
      renderProjectCards(repos, projectsGrid);

      // Render stats
      renderStats(stats);

      // Render heatmap
      const heatmapContainer = document.getElementById('heatmap-container');
      renderHeatmap(heatmapData, heatmapContainer);

      // Build and return project button entries
      const projectEntries = buildProjectEntries(repos);

      console.log('[GitHub] Loaded', repos.length, 'repos');
      return { repos, stats, projectEntries };
    } catch (error) {
      console.error('[GitHub] Initialization failed:', error);
      return { repos: [], stats: {}, projectEntries: [] };
    }
  }

  /* ===========================================================
     HELPERS
     =========================================================== */

  function getLanguageColor(language) {
    const colors = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#3178c6',
      'Python': '#3572A5',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'Ruby': '#701516',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'PHP': '#4F5D95',
      'Swift': '#ffac45',
      'Kotlin': '#A97BFF',
      'Dart': '#00B4AB',
      'Vue': '#41b883',
      'SCSS': '#c6538c'
    };
    return colors[language] || '#8B0000';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getPlaceholderRepos() {
    return [
      {
        name: 'portfolio-jukebox',
        description: 'A 1950s jukebox-themed portfolio website',
        language: 'JavaScript',
        stargazers_count: 0,
        forks_count: 0,
        html_url: 'https://github.com/anjisha616',
        updated_at: new Date().toISOString()
      },
      {
        name: 'ui-design-system',
        description: 'Custom UI design system and component library',
        language: 'CSS',
        stargazers_count: 0,
        forks_count: 0,
        html_url: 'https://github.com/anjisha616',
        updated_at: new Date().toISOString()
      },
      {
        name: 'web-projects',
        description: 'Collection of web development practice projects',
        language: 'HTML',
        stargazers_count: 0,
        forks_count: 0,
        html_url: 'https://github.com/anjisha616',
        updated_at: new Date().toISOString()
      }
    ];
  }

  // ─── Public API ───
  return {
    init,
    fetchRepos,
    fetchEvents,
    getStats,
    getHeatmapData,
    renderProjectCards,
    renderHeatmap,
    renderStats,
    buildProjectEntries
  };
})();
