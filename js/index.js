(() => {
    'use strict';

    const root = document.documentElement;
    root.classList.add('js');

    /* ---------- Theme ---------- */

    const themeToggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    const currentTheme = () =>
        root.getAttribute('data-theme') || (prefersDark.matches ? 'dark' : 'light');

    const syncThemeColor = () => {
        const bg = getComputedStyle(document.body).backgroundColor;
        document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', bg));
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const applyTheme = (next) => {
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
        syncThemeColor();
    };

    // Ease the light <-> dark change with a cross-fade instead of an abrupt brightness jump
    themeToggle.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        if (document.startViewTransition && !reducedMotion.matches) {
            document.startViewTransition(() => applyTheme(next));
        } else {
            applyTheme(next);
        }
    });

    /* ---------- Header + mobile menu ---------- */

    const header = document.getElementById('header');
    const nav = document.getElementById('nav');
    const menuToggle = document.getElementById('menu-toggle');

    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const setMenu = (open) => {
        nav.classList.toggle('open', open);
        menuToggle.classList.toggle('menu-open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    // Never trap the user: a tap anywhere outside the open menu dismisses it
    document.addEventListener('pointerdown', (e) => {
        if (nav.classList.contains('open') && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
            setMenu(false);
        }
    });

    /* ---------- Reveal on scroll ---------- */

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    const observeReveals = (scope = document) => {
        scope.querySelectorAll('.reveal:not(.visible)').forEach((el) => revealObserver.observe(el));
    };

    // Stagger the hero entrance
    document.querySelectorAll('.hero .reveal').forEach((el, i) => el.style.setProperty('--delay', `${i * 90}ms`));
    observeReveals();

    /* ---------- Active nav link ---------- */

    const navLinks = [...nav.querySelectorAll('a')];
    const sections = navLinks
        .map((a) => document.querySelector(a.getAttribute('href')))
        .filter(Boolean);

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((a) => {
                const isCurrent = a.getAttribute('href') === `#${entry.target.id}`;
                a.classList.toggle('active', isCurrent);
                if (isCurrent) a.setAttribute('aria-current', 'location');
                else a.removeAttribute('aria-current');
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((s) => sectionObserver.observe(s));

    /* ---------- Projects (from data/projects.js) ---------- */

    const grid = document.getElementById('projects-grid');
    const moreWrap = document.getElementById('projects-more');
    const moreList = document.getElementById('projects-more-list');

    const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);

    const ARROW = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>`;

    const chips = (list) => `<ul class="chips">${(list || []).map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`;

    // A screenshot if the project has one, otherwise its steps drawn as a small flow
    const projectVisual = (p) => {
        if (p.image) {
            return `<div class="project-visual"><img src="${escapeHtml(p.image)}" alt="Screenshot of ${escapeHtml(p.title)}" loading="lazy"></div>`;
        }
        if (Array.isArray(p.diagram) && p.diagram.length) {
            return `
            <div class="project-visual">
                <ol class="flow" aria-label="How ${escapeHtml(p.title)} works">
                    ${p.diagram.map((step) => `<li><span class="flow-step">${escapeHtml(step)}</span></li>`).join('')}
                </ol>
            </div>`;
        }
        return '';
    };

    const projectLinks = (p) => `
        <p class="project-links">
            <a class="text-link" href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener"
                aria-label="Code for ${escapeHtml(p.title)}">Code ${ARROW}</a>
            ${p.writeupUrl ? `<a class="text-link" href="${escapeHtml(p.writeupUrl)}" target="_blank" rel="noopener"
                aria-label="Write-up for ${escapeHtml(p.title)}">Write-up ${ARROW}</a>` : ''}
        </p>`;

    const projectCard = (p, i) => `
        <article class="project reveal" style="--delay:${(i % 3) * 80}ms">
            ${projectVisual(p)}
            <div class="project-body">
                <span class="project-index">${String(i + 1).padStart(2, '0')}</span>
                <h3 class="project-title">${escapeHtml(p.title)}</h3>
                <p class="project-desc">${escapeHtml(p.problem || p.description || '')}</p>
                ${p.learned ? `
                <div class="project-learned">
                    <h4>What I learned</h4>
                    <p>${escapeHtml(p.learned)}</p>
                </div>` : ''}
                ${chips(p.technologies)}
                ${projectLinks(p)}
            </div>
        </article>`;

    const projectRow = (p) => `
        <li class="project-row">
            <a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener">
                <span class="project-row-title">${escapeHtml(p.title)}</span>
                <span class="project-row-desc">${escapeHtml(p.problem || p.description || '')}</span>
                <span class="project-row-tech">${escapeHtml((p.technologies || []).join(' · '))}</span>
                ${ARROW}
            </a>
        </li>`;

    const projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
    // With nothing marked as featured, every project gets a full card
    const featured = projects.some((p) => p.featured) ? projects.filter((p) => p.featured) : projects;
    const others = projects.filter((p) => !featured.includes(p));

    if (featured.length) {
        grid.innerHTML = featured.map(projectCard).join('');
        observeReveals(grid);
    } else {
        grid.innerHTML = `
            <p class="projects-fallback">
                Browse my projects on
                <a class="text-link" href="https://github.com/roshan-raj" target="_blank" rel="noopener">GitHub</a>.
            </p>`;
    }

    if (others.length && moreWrap) {
        moreList.innerHTML = others.map(projectRow).join('');
        moreWrap.hidden = false;
    }

    /* ---------- Latest articles (live from the DEV API) ---------- */

    const articlesWrap = document.getElementById('articles');
    const articlesList = document.getElementById('articles-list');

    const articleRow = (a) => {
        const date = new Date(a.published_at);
        const shown = isNaN(date) ? '' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const minutes = Number(a.reading_time_minutes) || 1;
        return `
        <li>
            <a class="article" href="${escapeHtml(a.url)}" target="_blank" rel="noopener">
                <span class="article-title">${escapeHtml(a.title)}</span>
                <span class="article-meta">
                    ${shown ? `<time datetime="${escapeHtml(a.published_at)}">${shown}</time>` : ''}
                    <span>${minutes} min read</span>
                </span>
                ${ARROW}
            </a>
        </li>`;
    };

    // If the request fails or there is nothing to show, the section simply keeps
    // its static content: the block below stays hidden.
    const loadArticles = async () => {
        if (!articlesWrap || !window.fetch) return;
        const username = articlesWrap.dataset.devUsername;
        const limit = Number(articlesWrap.dataset.limit) || 4;
        const abort = new AbortController();
        const timer = setTimeout(() => abort.abort(), 8000);
        try {
            const res = await fetch(
                `https://dev.to/api/articles?username=${encodeURIComponent(username)}&per_page=${limit}`,
                { signal: abort.signal }
            );
            if (!res.ok) return;
            const articles = await res.json();
            if (!Array.isArray(articles) || !articles.length) return;
            articlesList.innerHTML = articles.slice(0, limit).map(articleRow).join('');
            articlesWrap.hidden = false;
        } catch (e) {
            /* offline, blocked or timed out */
        } finally {
            clearTimeout(timer);
        }
    };

    loadArticles();

    /* ---------- Copy email ---------- */

    const copyBtn = document.getElementById('copy-email');
    const copyStatus = document.getElementById('copy-status');
    let copyTimer;

    const copyText = async (text) => {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }
        // Fallback for file:// and older browsers
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        if (!ok) throw new Error('copy failed');
    };

    if (copyBtn) {
        const label = copyBtn.querySelector('.copy-label');
        copyBtn.addEventListener('click', async () => {
            clearTimeout(copyTimer);
            try {
                await copyText(copyBtn.dataset.email);
                copyBtn.classList.add('copied');
                label.textContent = 'Copied';
                copyStatus.textContent = 'Email address copied to clipboard';
            } catch (e) {
                label.textContent = 'Couldn’t copy';
                copyStatus.textContent = 'Could not copy automatically';
            }
            copyTimer = setTimeout(() => {
                copyBtn.classList.remove('copied');
                label.textContent = 'Copy';
                copyStatus.textContent = '';
            }, 2000);
        });
    }

    /* ---------- Footer year ---------- */

    document.getElementById('year').textContent = new Date().getFullYear();
})();
