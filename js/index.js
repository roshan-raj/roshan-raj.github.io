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

    themeToggle.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
        syncThemeColor();
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
            navLinks.forEach((a) =>
                a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((s) => sectionObserver.observe(s));

    /* ---------- Projects (from data/projects.json) ---------- */

    const grid = document.getElementById('projects-grid');

    const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);

    const projectCard = (p, i) => `
        <article class="project reveal" style="--delay:${(i % 3) * 80}ms">
            <span class="project-index">${String(i + 1).padStart(2, '0')}</span>
            <span class="project-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9"/></svg>
            </span>
            <h3 class="project-title">
                <a href="${escapeHtml(p.githubUrl)}" target="_blank" rel="noopener">${escapeHtml(p.title)}</a>
            </h3>
            <p class="project-desc">${escapeHtml(p.description)}</p>
            <ul class="chips">${p.technologies.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
        </article>`;

    // Data comes from data/projects.js (a plain script, so it works from file:// too)
    const projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];

    if (projects.length) {
        grid.innerHTML = projects.map(projectCard).join('');
        observeReveals(grid);
    } else {
        grid.innerHTML = `
            <p class="projects-fallback">
                Browse my projects on
                <a class="text-link" href="https://github.com/roshan-raj" target="_blank" rel="noopener">GitHub</a>.
            </p>`;
    }

    /* ---------- Footer year ---------- */

    document.getElementById('year').textContent = new Date().getFullYear();
})();
