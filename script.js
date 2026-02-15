// ============================================
// AUDIO MANAGEMENT
// ============================================

// Audio elements (using Web Audio API for better control)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let backgroundMusic = null;
let isMuted = false;
let currentVolume = 0.5;

// Sound effect buffers
const soundBuffers = {};

// ============================================
// SYNTHESIZED SOUND EFFECTS
// ============================================

// Since we can't load actual audio files, we'll synthesize sounds using Web Audio API

function playSound(soundType) {
    if (isMuted) return;
    
    const now = audioContext.currentTime;
    
    switch(soundType) {
        case 'coinDrop':
            playCoinDrop(now);
            break;
        case 'buttonClick':
            playButtonClick(now);
            break;
        case 'recordScratch':
            playRecordScratch(now);
            break;
        case 'motor':
            playMotor(now);
            break;
        case 'confirmation':
            playConfirmation(now);
            break;
    }
}

// Coin Drop Sound
function playCoinDrop(startTime) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, startTime + 0.3);
    
    gainNode.gain.setValueAtTime(currentVolume * 0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.3);
}

// Button Click Sound
function playButtonClick(startTime) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, startTime);
    
    gainNode.gain.setValueAtTime(currentVolume * 0.2, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.05);
}

// Record Scratch Sound (white noise burst)
function playRecordScratch(startTime) {
    const bufferSize = audioContext.sampleRate * 0.2; // 0.2 seconds
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(currentVolume * 0.15, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
    
    source.start(startTime);
}

// Motor Sound
function playMotor(startTime) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(60, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, startTime + 1.5);
    
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(currentVolume * 0.2, startTime + 0.3);
    gainNode.gain.setValueAtTime(currentVolume * 0.2, startTime + 1.2);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.5);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 1.5);
}

// Confirmation Beep
function playConfirmation(startTime) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, startTime);
    
    gainNode.gain.setValueAtTime(currentVolume * 0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.15);
    
    // Second beep
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    
    oscillator2.frequency.setValueAtTime(1000, startTime + 0.15);
    
    gainNode2.gain.setValueAtTime(currentVolume * 0.3, startTime + 0.15);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
    
    oscillator2.start(startTime + 0.15);
    oscillator2.stop(startTime + 0.3);
}

// ============================================
// BACKGROUND MUSIC
// ============================================

function startBackgroundMusic() {
    // Create a simple retro-style background music loop
    playBackgroundLoop();
}

function playBackgroundLoop() {
    if (isMuted) return;
    
    const now = audioContext.currentTime;
    
    // Simple chord progression melody
    const notes = [
        { freq: 261.63, start: 0, duration: 0.5 },    // C
        { freq: 329.63, start: 0.5, duration: 0.5 },  // E
        { freq: 392.00, start: 1.0, duration: 0.5 },  // G
        { freq: 329.63, start: 1.5, duration: 0.5 },  // E
        { freq: 293.66, start: 2.0, duration: 0.5 },  // D
        { freq: 349.23, start: 2.5, duration: 0.5 },  // F
        { freq: 392.00, start: 3.0, duration: 0.5 },  // G
        { freq: 349.23, start: 3.5, duration: 0.5 },  // F
    ];
    
    notes.forEach(note => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = note.freq;
        
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const startTime = now + note.start;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(currentVolume * 0.1, startTime + 0.05);
        gainNode.gain.setValueAtTime(currentVolume * 0.1, startTime + note.duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + note.duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + note.duration);
    });
    
    // Loop the music
    setTimeout(() => playBackgroundLoop(), 4000);
}

// ============================================
// VOLUME CONTROL
// ============================================

function setVolume(volume) {
    currentVolume = Math.max(0, Math.min(1, volume));
}

function toggleMute() {
    isMuted = !isMuted;
    return isMuted;
}

// ============================================
// NOTES FOR ACTUAL IMPLEMENTATION
// ============================================

/*
For a production version, you would:

1. Add actual audio files to /assets/sounds/:
   - coin-drop.mp3
   - button-click.mp3
   - record-scratch.mp3
   - motor.mp3
   - confirmation.mp3

2. Add background music to /assets/music/:
   - background-music.mp3 (royalty-free 1950s style music)

3. Load them like this:

async function loadSound(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    soundBuffers[name] = await audioContext.decodeAudioData(arrayBuffer);
}

function playLoadedSound(name) {
    if (!soundBuffers[name]) return;
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    
    source.buffer = soundBuffers[name];
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = currentVolume;
    source.start(0);
}

// Load all sounds on init
Promise.all([
    loadSound('coinDrop', 'assets/sounds/coin-drop.mp3'),
    loadSound('buttonClick', 'assets/sounds/button-click.mp3'),
    loadSound('recordScratch', 'assets/sounds/record-scratch.mp3'),
    loadSound('motor', 'assets/sounds/motor.mp3'),
    loadSound('confirmation', 'assets/sounds/confirmation.mp3')
]);

4. For background music, use HTML5 Audio:

const bgMusic = new Audio('assets/music/background-music.mp3');
bgMusic.loop = true;
bgMusic.volume = currentVolume;

function startBackgroundMusic() {
    bgMusic.play();
}

Recommended free music sources:
- YouTube Audio Library: https://studio.youtube.com/channel/UC.../music
- Incompetech: https://incompetech.com/music/royalty-free/
- Free Music Archive: https://freemusicarchive.org/
- Bensound: https://www.bensound.com/

Search for "1950s", "rockabilly", "doo-wop", or "retro" styles.
*/
// ============================================
// GITHUB API INTEGRATION
// ============================================

const GITHUB_USERNAME = 'anjisha616';
const EXCLUDED_REPOS = ['cafe-clone', 'netflix-clone', 'starbucks-clone'];

// ============================================
// FETCH GITHUB PROJECTS
// ============================================

async function fetchGitHubProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch repos');
        }
        
        const repos = await response.json();
        
        // Filter out excluded repos and get pinned/featured ones
        const filteredRepos = repos.filter(repo => 
            !EXCLUDED_REPOS.includes(repo.name.toLowerCase()) && 
            !repo.fork
        );
        
        // Sort by stars and get top repos
        const featuredRepos = filteredRepos
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 6);
        
        // Clear loading spinner
        projectsGrid.innerHTML = '';
        
        // Display GitHub projects
        featuredRepos.forEach((repo, index) => {
            const card = createProjectCard(repo, 'github', index);
            projectsGrid.appendChild(card);
        });
        
        // Add Figma projects (manual data since Figma API requires authentication)
        addFigmaProjects(projectsGrid, featuredRepos.length);
        
        // Initialize filter buttons
        initProjectFilters();
        
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        projectsGrid.innerHTML = `
            <div class="error-message" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <h3>Unable to load GitHub projects</h3>
                <p>Please check your internet connection or try again later.</p>
            </div>
        `;
    }
}

// ============================================
// CREATE PROJECT CARD
// ============================================

function createProjectCard(repo, source, index) {
    const card = document.createElement('div');
    card.className = `project-card fade-in-up ${source}`;
    card.style.animationDelay = `${index * 0.1}s`;
    card.dataset.source = source;
    
    if (source === 'github') {
        card.innerHTML = `
            <h3>${repo.name.replace(/-/g, ' ')}</h3>
            <p>${repo.description || 'No description available'}</p>
            <div class="project-meta">
                <span>⭐ ${repo.stargazers_count}</span>
                <span>🔄 ${repo.forks_count}</span>
                <span>${repo.language || 'Code'}</span>
            </div>
            <a href="${repo.html_url}" target="_blank" class="project-link">View on GitHub →</a>
        `;
    } else if (source === 'figma') {
        card.innerHTML = `
            <h3>${repo.name}</h3>
            <p>${repo.description}</p>
            <div class="project-meta">
                <span>🎨 Figma</span>
                <span>${repo.category || 'Design'}</span>
            </div>
            <a href="${repo.url}" target="_blank" class="project-link">View in Figma →</a>
        `;
    }
    
    return card;
}

// ============================================
// ADD FIGMA PROJECTS (MANUAL DATA)
// ============================================

function addFigmaProjects(container, startIndex) {
    // Manual Figma project data
    // Replace these with actual project details from the Figma link
    const figmaProjects = [
        {
            name: 'UI Component Library',
            description: 'Comprehensive design system with reusable UI components',
            category: 'Design System',
            url: 'https://www.figma.com/files/team/1375711861175707486/project/237173255'
        },
        {
            name: 'Mobile App Designs',
            description: 'Collection of mobile application interface designs',
            category: 'Mobile UI',
            url: 'https://www.figma.com/files/team/1375711861175707486/project/237173255'
        },
        {
            name: 'Landing Page Concepts',
            description: 'Modern landing page designs for various industries',
            category: 'Web Design',
            url: 'https://www.figma.com/files/team/1375711861175707486/project/237173255'
        }
    ];
    
    figmaProjects.forEach((project, index) => {
        const card = createProjectCard(project, 'figma', startIndex + index);
        container.appendChild(card);
    });
}

// ============================================
// PROJECT FILTERS
// ============================================

function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter cards
            projectCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else if (card.dataset.source === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Play sound
            playSound('buttonClick');
        });
    });
}

// ============================================
// FETCH GITHUB STATS (PROOF OF WORK)
// ============================================

async function fetchGitHubStats() {
    const statsContainer = document.getElementById('githubStats');
    
    try {
        // Fetch user data
        const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        const userData = await userResponse.json();
        
        // Fetch events for commit activity
        const eventsResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`);
        const events = await eventsResponse.json();
        
        // Count commits
        const pushEvents = events.filter(e => e.type === 'PushEvent');
        const totalCommits = pushEvents.reduce((sum, event) => sum + (event.payload.commits?.length || 0), 0);
        
        // Get repos for language stats
        const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`);
        const repos = await reposResponse.json();
        
        // Count languages
        const languages = {};
        repos.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });
        
        const topLanguages = Object.entries(languages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        // Calculate streak (simplified)
        const recentDays = new Set();
        pushEvents.forEach(event => {
            const date = new Date(event.created_at).toDateString();
            recentDays.add(date);
        });
        const currentStreak = recentDays.size;
        
        // Display stats
        statsContainer.innerHTML = `
            <div class="github-stats-grid fade-in-up">
                <div class="stat-card">
                    <h3>📊 Total Repositories</h3>
                    <p class="stat-number">${userData.public_repos}</p>
                </div>
                <div class="stat-card">
                    <h3>✨ Recent Commits</h3>
                    <p class="stat-number">${totalCommits}</p>
                    <p class="stat-label">Last 100 events</p>
                </div>
                <div class="stat-card">
                    <h3>🔥 Activity Streak</h3>
                    <p class="stat-number">${currentStreak}</p>
                    <p class="stat-label">days active</p>
                </div>
                <div class="stat-card">
                    <h3>💻 Top Languages</h3>
                    <div class="language-list">
                        ${topLanguages.map(([lang, count]) => `
                            <div class="language-item">
                                <span class="language-dot" style="background: ${getLanguageColor(lang)}"></span>
                                <span>${lang}</span>
                                <span class="language-count">(${count})</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="github-link-container fade-in-up" style="animation-delay: 0.3s;">
                <a href="https://github.com/${GITHUB_USERNAME}" target="_blank" class="github-profile-btn">
                    View Full GitHub Profile →
                </a>
            </div>
            <div class="contribution-graph fade-in-up" style="animation-delay: 0.5s;">
                <h3>Contribution Activity</h3>
                <img src="https://ghchart.rshah.org/${GITHUB_USERNAME}" alt="GitHub Contribution Chart" style="width: 100%; border-radius: 10px; margin-top: 20px;">
            </div>
        `;
        
        // Add styles for stats
        addStatsStyles();
        
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        statsContainer.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 40px;">
                <h3>Unable to load GitHub statistics</h3>
                <p>Please check your internet connection or try again later.</p>
            </div>
        `;
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'Python': '#3572A5',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'TypeScript': '#2b7489',
        'Java': '#b07219',
        'C++': '#f34b7d',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Go': '#00ADD8'
    };
    return colors[language] || '#888';
}

function addStatsStyles() {
    if (document.getElementById('github-stats-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'github-stats-styles';
    style.textContent = `
        .github-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: rgba(0, 0, 0, 0.4);
            padding: 25px;
            border-radius: 15px;
            border: 2px solid rgba(255, 215, 0, 0.3);
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            border-color: var(--gold-chrome);
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
        }
        
        .stat-card h3 {
            color: var(--turquoise);
            font-size: 1.1rem;
            margin-bottom: 15px;
        }
        
        .stat-number {
            font-size: 3rem;
            font-family: var(--font-display);
            color: var(--gold-chrome);
            text-shadow: 0 0 10px var(--gold-chrome);
            margin: 10px 0;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: #999;
        }
        
        .language-list {
            text-align: left;
            margin-top: 15px;
        }
        
        .language-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 5px 0;
        }
        
        .language-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        
        .language-count {
            margin-left: auto;
            color: #888;
        }
        
        .github-link-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .github-profile-btn {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, var(--deep-red), #A00000);
            color: #fff;
            text-decoration: none;
            border-radius: 25px;
            font-family: var(--font-button);
            font-size: 1.1rem;
            border: 2px solid var(--gold-chrome);
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
            transition: all 0.3s ease;
        }
        
        .github-profile-btn:hover {
            background: linear-gradient(135deg, #A00000, var(--deep-red));
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5);
        }
        
        .contribution-graph {
            background: rgba(0, 0, 0, 0.3);
            padding: 25px;
            border-radius: 15px;
            border: 2px solid rgba(255, 215, 0, 0.2);
        }
        
        .contribution-graph h3 {
            color: var(--hot-pink);
            margin-bottom: 15px;
        }
        
        .contribution-graph img {
            filter: hue-rotate(45deg) brightness(1.2);
        }
    `;
    
    document.head.appendChild(style);
}
// ============================================
// ANIMATION UTILITIES
// ============================================

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe all project cards and stats
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for content to load
    setTimeout(() => {
        const animatedElements = document.querySelectorAll('.project-card, .stat-card, .skill-category');
        animatedElements.forEach(el => observer.observe(el));
    }, 1000);
});

// ============================================
// PARTICLE EFFECTS
// ============================================

function createParticle(x, y, color = '#FFD700') {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 8px;
        height: 8px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 0 10px ${color};
    `;
    
    document.body.appendChild(particle);
    
    // Animate particle
    const angle = Math.random() * Math.PI * 2;
    const velocity = 2 + Math.random() * 3;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 5; // Upward bias
    
    let posX = x;
    let posY = y;
    let opacity = 1;
    let gravity = 0.2;
    let velocityY = vy;
    
    const animate = () => {
        posX += vx;
        posY += velocityY;
        velocityY += gravity;
        opacity -= 0.02;
        
        particle.style.left = posX + 'px';
        particle.style.top = posY + 'px';
        particle.style.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            particle.remove();
        }
    };
    
    animate();
}

// Add particle effect on button clicks
document.addEventListener('click', (e) => {
    if (e.target.closest('.jukebox-button')) {
        const rect = e.target.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        // Create multiple particles
        for (let i = 0; i < 8; i++) {
            createParticle(x, y, '#FFD700');
        }
    }
});

// ============================================
// SMOOTH SCROLL
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// CURSOR GLOW EFFECT (DESKTOP ONLY)
// ============================================

if (window.innerWidth > 768) {
    const cursorGlow = document.createElement('div');
    cursorGlow.style.cssText = `
        position: fixed;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
        pointer-events: none;
        z-index: 9998;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        opacity: 0;
    `;
    document.body.appendChild(cursorGlow);
    
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
        cursorGlow.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });
}

// ============================================
// TYPEWRITER EFFECT
// ============================================

function typewriterEffect(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    const type = () => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    };
    
    type();
}

// Apply typewriter to bio when About section is shown
const bioElement = document.querySelector('.bio.typewriter');
if (bioElement) {
    const originalText = bioElement.textContent;
    
    // Observer for when bio comes into view
    const bioObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.textContent === originalText) {
                typewriterEffect(entry.target, originalText, 30);
                bioObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    bioObserver.observe(bioElement);
}

// ============================================
// LOADING ANIMATION
// ============================================

window.addEventListener('load', () => {
    // Add loaded class to body for any load-dependent animations
    document.body.classList.add('loaded');
});

// ============================================
// RANDOM NEON FLICKER
// ============================================

function addRandomFlicker() {
    const neonElements = document.querySelectorAll('.neon-sign, .indicator-light.active');
    
    setInterval(() => {
        const randomElement = neonElements[Math.floor(Math.random() * neonElements.length)];
        if (randomElement && Math.random() > 0.7) {
            randomElement.classList.add('neon-flicker');
            setTimeout(() => {
                randomElement.classList.remove('neon-flicker');
            }, 200);
        }
    }, 3000);
}

// Start flicker after load
setTimeout(addRandomFlicker, 5000);

// ============================================
// PARALLAX EFFECT ON SCROLL
// ============================================

let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            
            // Parallax effect on jukebox
            const jukebox = document.querySelector('.jukebox-body');
            if (jukebox) {
                jukebox.style.transform = `translateY(${scrolled * 0.05}px)`;
            }
            
            // Parallax on neon sign
            const neonSign = document.querySelector('.neon-sign');
            if (neonSign) {
                neonSign.style.transform = `translateY(${scrolled * 0.1}px)`;
            }
            
            ticking = false;
        });
        
        ticking = true;
    }
});

// ============================================
// EASTER EGG: SECRET MUSIC VISUALIZER
// ============================================

function createMusicVisualizer() {
    const visualizer = document.createElement('div');
    visualizer.id = 'music-visualizer';
    visualizer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 4px;
        z-index: 9999;
        opacity: 0.6;
    `;
    
    // Create bars
    for (let i = 0; i < 20; i++) {
        const bar = document.createElement('div');
        bar.style.cssText = `
            width: 4px;
            height: 20px;
            background: linear-gradient(to top, var(--turquoise), var(--hot-pink));
            border-radius: 2px;
            animation: visualizerBounce ${0.5 + Math.random()}s ease-in-out infinite;
            animation-delay: ${i * 0.05}s;
        `;
        visualizer.appendChild(bar);
    }
    
    document.body.appendChild(visualizer);
    
    // Add animation
    if (!document.getElementById('visualizer-animation')) {
        const style = document.createElement('style');
        style.id = 'visualizer-animation';
        style.textContent = `
            @keyframes visualizerBounce {
                0%, 100% { transform: scaleY(0.3); }
                50% { transform: scaleY(1); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Activate visualizer when music plays
setTimeout(() => {
    if (state && state.isPlaying) {
        createMusicVisualizer();
    }
}, 4000);

// ============================================
// DEBUG CONSOLE EASTER EGG
// ============================================

console.log('%c🎵 JUKEBOX PORTFOLIO 🎵', 'font-size: 30px; color: #FFD700; font-family: "Bebas Neue", sans-serif; text-shadow: 0 0 10px #FFD700');
console.log('%cDesigned by Anjisha Pun', 'font-size: 16px; color: #00FFFF');
console.log('%c\nEaster Eggs:', 'font-size: 14px; color: #FF1493; font-weight: bold');
console.log('%c1. Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A', 'color: #fff');
console.log('%c2. Hold coin slot for 5 seconds', 'color: #fff');
console.log('%c3. Triple-click volume dial', 'color: #fff');
console.log('%c4. Press B4 button for secret section', 'color: #fff');
console.log('%c\nCredits:', 'font-size: 14px; color: #FFFF00; font-weight: bold');
console.log('%c- 1950s Wurlitzer Jukebox inspiration', 'color: #888');
console.log('%c- Built with vanilla JavaScript', 'color: #888');
console.log('%c- Sound effects synthesized with Web Audio API', 'color: #888');
// ============================================
// MAIN APP LOGIC
// ============================================

// State management
const state = {
    currentSection: 'about',
    isPlaying: false,
    konamiProgress: 0
};

// Konami Code sequence
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

// Initialize app on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initCoinSequence();
    initButtons();
    initKeyboardControls();
    initVolumeControl();
    initContactForm();
    initKonamiCode();
    loadGitHubData();
});

// ============================================
// COIN INSERT SEQUENCE
// ============================================

function initCoinSequence() {
    const overlay = document.getElementById('coinOverlay');
    const coinSlotButton = document.querySelector('.coin-slot-control .slot');
    let hasStarted = false;

    if (!overlay) return;

    const startSequence = () => {
        if (hasStarted) return;
        hasStarted = true;

        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().catch(() => {});
        }

        // Play coin drop sound
        playSound('coinDrop');

        // Play motor sound
        setTimeout(() => {
            playSound('motor');
        }, 1200);

        // Remove overlay and start music
        setTimeout(() => {
            overlay.classList.remove('active');
            startBackgroundMusic();
            state.isPlaying = true;

            // Activate vinyl spinning
            const vinyl = document.getElementById('vinylRecord');
            if (vinyl) {
                vinyl.classList.add('spinning');
            }

            // Move tonearm
            const tonearm = document.getElementById('tonearm');
            if (tonearm) {
                tonearm.classList.add('playing');
            }
        }, 1500);
    };

    const triggerFromUser = (event) => {
        if (event) {
            event.preventDefault();
        }
        startSequence();
    };

    overlay.addEventListener('click', triggerFromUser);
    overlay.addEventListener('touchstart', triggerFromUser, { passive: false });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            triggerFromUser(event);
        }
    });

    if (coinSlotButton) {
        coinSlotButton.addEventListener('click', triggerFromUser);
    }
}

// ============================================
// BUTTON CONTROLS
// ============================================

function initButtons() {
    const buttons = document.querySelectorAll('.jukebox-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            changeSection(section, button.dataset.code);
            
            // Visual feedback
            button.classList.add('button-press');
            setTimeout(() => button.classList.remove('button-press'), 200);
            
            // Sound effect
            playSound('buttonClick');
        });
    });
}

// ============================================
// SECTION SWITCHING
// ============================================

function changeSection(sectionId, code) {
    // Update state
    state.currentSection = sectionId;
    
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => s.classList.remove('active'));
    
    // Show selected section
    const newSection = document.getElementById(sectionId);
    if (newSection) {
        newSection.classList.add('active');
    }
    
    // Update active button
    const buttons = document.querySelectorAll('.jukebox-button');
    buttons.forEach(b => b.classList.remove('active'));
    const activeButton = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Update vinyl label
    const vinylLabel = document.getElementById('vinylLabel');
    const sectionNames = {
        about: 'ABOUT ME',
        skills: 'SKILLS',
        experience: 'EXPERIENCE',
        certifications: 'CERTS',
        projects: 'PROJECTS',
        proof: 'PROOF',
        contact: 'CONTACT',
        secret: 'SECRET!'
    };
    vinylLabel.textContent = sectionNames[sectionId] || sectionId.toUpperCase();
    
    // Update now playing
    const nowPlaying = document.getElementById('nowPlayingText');
    nowPlaying.textContent = `♪ NOW PLAYING: ${sectionNames[sectionId]} ♪`;
    
    // Play transition sound
    playSound('recordScratch');
    
    // Brief static effect (visual only)
    showStaticEffect();
}

function showStaticEffect() {
    const contentDisplay = document.getElementById('contentDisplay');
    const static_effect = document.createElement('div');
    static_effect.className = 'static-overlay';
    static_effect.style.cssText = `
        position: absolute;
        inset: 0;
        background: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.6'/%3E%3C/svg%3E");
        opacity: 1;
        z-index: 100;
        pointer-events: none;
        transition: opacity 0.3s ease;
    `;
    
    contentDisplay.style.position = 'relative';
    contentDisplay.appendChild(static_effect);
    
    setTimeout(() => {
        static_effect.style.opacity = '0';
        setTimeout(() => static_effect.remove(), 300);
    }, 200);
}

// ============================================
// KEYBOARD CONTROLS
// ============================================

function initKeyboardControls() {
    let keyBuffer = '';
    let lastKeyTime = 0;
    
    document.addEventListener('keydown', (e) => {
        const currentTime = Date.now();
        
        // Reset buffer if too much time passed
        if (currentTime - lastKeyTime > 2000) {
            keyBuffer = '';
        }
        
        lastKeyTime = currentTime;
        
        // Add key to buffer
        keyBuffer += e.key.toUpperCase();
        
        // Keep only last 2 characters
        if (keyBuffer.length > 2) {
            keyBuffer = keyBuffer.slice(-2);
        }
        
        // Check for valid codes (A1-A4, B1-B4)
        const codeMap = {
            'A1': 'about',
            'A2': 'skills',
            'A3': 'experience',
            'A4': 'certifications',
            'B1': 'projects',
            'B2': 'proof',
            'B3': 'contact',
            'B4': 'secret'
        };
        
        if (codeMap[keyBuffer]) {
            changeSection(codeMap[keyBuffer], keyBuffer);
            keyBuffer = '';
        }
        
        // Arrow key navigation
        const currentButtons = Array.from(document.querySelectorAll('.jukebox-button'));
        const activeButton = document.querySelector('.jukebox-button.active');
        const currentIndex = currentButtons.indexOf(activeButton);
        
        let newIndex = currentIndex;
        
        switch(e.key) {
            case 'ArrowLeft':
                newIndex = Math.max(0, currentIndex - 1);
                break;
            case 'ArrowRight':
                newIndex = Math.min(currentButtons.length - 1, currentIndex + 1);
                break;
            case 'ArrowUp':
                newIndex = Math.max(0, currentIndex - 4);
                break;
            case 'ArrowDown':
                newIndex = Math.min(currentButtons.length - 1, currentIndex + 4);
                break;
            case 'Enter':
                if (activeButton) {
                    activeButton.click();
                }
                return;
        }
        
        if (newIndex !== currentIndex && currentButtons[newIndex]) {
            const newButton = currentButtons[newIndex];
            changeSection(newButton.dataset.section, newButton.dataset.code);
        }
    });
}

// ============================================
// VOLUME CONTROL
// ============================================

function initVolumeControl() {
    const slider = document.getElementById('volumeSlider');
    const dial = document.getElementById('volumeDial');
    
    slider.addEventListener('input', (e) => {
        const value = e.target.value;
        setVolume(value / 100);
        
        // Rotate dial
        const rotation = (value / 100) * 270 - 135; // -135° to 135°
        dial.style.transform = `rotate(${rotation}deg)`;
    });
    
    // Triple-click easter egg
    let clickCount = 0;
    let clickTimer;
    
    dial.addEventListener('click', () => {
        clickCount++;
        
        clearTimeout(clickTimer);
        
        if (clickCount === 3) {
            // Easter egg: Rickroll or fun animation
            alert('🎵 Never gonna give you up! 🎵');
            clickCount = 0;
        }
        
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 500);
    });
}

// ============================================
// CONTACT FORM
// ============================================

function initContactForm() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Play confirmation sound
        playSound('confirmation');
        
        // Show success message
        alert('🪙 Message sent! Thank you for dropping a coin!');
        
        // Reset form
        form.reset();
    });
}

// ============================================
// KONAMI CODE EASTER EGG
// ============================================

function initKonamiCode() {
    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[state.konamiProgress]) {
            state.konamiProgress++;
            
            if (state.konamiProgress === konamiCode.length) {
                // Konami code complete!
                activateKonamiEasterEgg();
                state.konamiProgress = 0;
            }
        } else {
            state.konamiProgress = 0;
        }
    });
}

function activateKonamiEasterEgg() {
    // Change jukebox color theme
    const jukeboxBody = document.querySelector('.jukebox-body');
    jukeboxBody.style.background = 'linear-gradient(135deg, #00CED1, #1E90FF)';
    
    alert('🎮 KONAMI CODE ACTIVATED! Color theme changed!');
    
    playSound('confirmation');
    
    // Revert after 10 seconds
    setTimeout(() => {
        jukeboxBody.style.background = '';
    }, 10000);
}

// ============================================
// LOAD GITHUB DATA
// ============================================

function loadGitHubData() {
    // Fetch projects
    fetchGitHubProjects();
    
    // Fetch proof of work
    fetchGitHubStats();
}

// Coin slot hold easter egg
let holdTimer;
const coinSlot = document.querySelector('.coin-slot-control .slot');

if (coinSlot) {
    coinSlot.addEventListener('mousedown', () => {
        holdTimer = setTimeout(() => {
            // Change theme after 5 seconds
            document.body.style.filter = 'hue-rotate(180deg)';
            playSound('confirmation');
            
            setTimeout(() => {
                document.body.style.filter = '';
            }, 5000);
        }, 5000);
    });
    
    coinSlot.addEventListener('mouseup', () => {
        clearTimeout(holdTimer);
    });
    
    coinSlot.addEventListener('mouseleave', () => {
        clearTimeout(holdTimer);
    });
}

console.log('%c🎵 Jukebox Portfolio loaded! 🎵', 'font-size: 20px; color: #FFD700; text-shadow: 0 0 10px #FFD700');
console.log('%cTry the Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A', 'color: #00FFFF');