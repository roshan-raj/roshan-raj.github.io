/* Command palette: Ctrl/Cmd+K opens a search box for jumping to a section,
   running an action or opening a link. Built on the native <dialog>. */
(() => {
    'use strict';

    const dialog = document.getElementById('palette');
    const input = document.getElementById('palette-input');
    const list = document.getElementById('palette-list');
    const empty = document.getElementById('palette-empty');
    const opener = document.getElementById('palette-open');
    const toast = document.getElementById('toast');

    // No <dialog> support: leave the site as it is, without the palette
    if (!dialog || typeof dialog.showModal !== 'function') {
        if (opener) opener.hidden = true;
        return;
    }

    const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    const hint = document.getElementById('palette-hint');
    if (hint) hint.textContent = isMac ? '⌘K' : 'Ctrl K';

    /* ---------- Toast ---------- */

    let toastTimer;
    const say = (message) => {
        clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    };

    /* ---------- Commands ---------- */

    const root = document.documentElement;
    const isDark = () => {
        const set = root.getAttribute('data-theme');
        return set ? set === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    const goTo = (selector) => () => {
        const target = document.querySelector(selector);
        if (!target) return;
        target.scrollIntoView();
        history.replaceState(null, '', selector);
    };

    const openLink = (url) => () => window.open(url, '_blank', 'noopener');

    const copyEmail = () => {
        const button = document.getElementById('copy-email');
        if (!button) return;
        button.click(); // reuses the copy logic and fallbacks in index.js
        setTimeout(() => {
            say(button.classList.contains('copied') ? `Copied ${button.dataset.email}` : 'Couldn’t copy the email');
        }, 150);
    };

    // Built each time the palette opens, so labels reflect the current state
    const buildCommands = () => {
        const commands = [];
        const add = (group, label, run, keywords = '') => commands.push({ group, label, run, keywords });

        // Sections come from the nav, so a new section shows up here by itself
        add('Go to', 'Home', goTo('#home'), 'top start hero');
        document.querySelectorAll('#nav a[href^="#"]').forEach((a) => {
            add('Go to', a.textContent.trim(), goTo(a.getAttribute('href')));
        });

        add('Actions', 'Copy email address', copyEmail, 'contact mail reach');
        add('Actions', isDark() ? 'Switch to light theme' : 'Switch to dark theme',
            () => document.getElementById('theme-toggle').click(), 'dark light mode appearance');

        const play = document.querySelector('[data-arch-run="success"]');
        if (play) {
            add('Actions', 'Send an event through the diagram', () => {
                document.querySelector('.arch').scrollIntoView({ block: 'center' });
                setTimeout(() => play.click(), 700);
            }, 'architecture play run demo');
        }

        (Array.isArray(window.PROJECTS) ? window.PROJECTS : []).forEach((p) => {
            if (p.liveUrl) add('Projects', `${p.title}: open live site`, openLink(p.liveUrl), 'demo app live');
            add('Projects', `${p.title}: view code`, openLink(p.githubUrl), (p.technologies || []).join(' '));
        });

        document.querySelectorAll('.socials a').forEach((a) => {
            add('Links', `Open ${a.textContent.trim()}`, openLink(a.href), 'social profile');
        });

        return commands;
    };

    /* ---------- Search and render ---------- */

    let commands = [];
    let shown = [];
    let active = 0;

    const matches = (query) => {
        const words = query.toLowerCase().split(/\s+/).filter(Boolean);
        if (!words.length) return commands;
        return commands
            .map((c) => {
                const label = c.label.toLowerCase();
                const hay = `${label} ${c.group.toLowerCase()} ${c.keywords.toLowerCase()}`;
                if (!words.every((w) => hay.includes(w))) return null;
                // Matches in the label, and at its start, come first
                const score = (label.startsWith(words[0]) ? 0 : label.includes(words[0]) ? 1 : 2);
                return { c, score };
            })
            .filter(Boolean)
            .sort((a, b) => a.score - b.score)
            .map((m) => m.c);
    };

    const setActive = (i, scroll = true) => {
        if (!shown.length) {
            input.removeAttribute('aria-activedescendant');
            return;
        }
        active = (i + shown.length) % shown.length;
        list.querySelectorAll('[role="option"]').forEach((el, j) => {
            el.setAttribute('aria-selected', String(j === active));
            if (j === active) {
                input.setAttribute('aria-activedescendant', el.id);
                if (scroll) el.scrollIntoView({ block: 'nearest' });
            }
        });
    };

    const render = () => {
        const query = input.value.trim();
        shown = matches(query);
        list.replaceChildren();

        let lastGroup = null;
        shown.forEach((c, i) => {
            // Group headings only make sense while the list is in its natural order
            if (!query && c.group !== lastGroup) {
                const heading = document.createElement('li');
                heading.className = 'palette-group';
                heading.setAttribute('role', 'presentation');
                heading.textContent = c.group;
                list.appendChild(heading);
                lastGroup = c.group;
            }
            const item = document.createElement('li');
            item.id = `palette-option-${i}`;
            item.className = 'palette-item';
            item.setAttribute('role', 'option');
            const label = document.createElement('span');
            label.textContent = c.label;
            item.appendChild(label);
            if (query) {
                const group = document.createElement('span');
                group.className = 'palette-item-group';
                group.textContent = c.group;
                item.appendChild(group);
            }
            item.addEventListener('pointermove', () => { if (active !== i) setActive(i, false); });
            item.addEventListener('click', () => run(i));
            list.appendChild(item);
        });

        empty.hidden = shown.length > 0;
        list.hidden = shown.length === 0;
        setActive(0);
        list.scrollTop = 0;
    };

    const run = (i) => {
        const command = shown[i];
        if (!command) return;
        dialog.close();
        command.run();
    };

    /* ---------- Open and close ---------- */

    const open = () => {
        if (dialog.open) return;
        commands = buildCommands();
        input.value = '';
        dialog.showModal();
        render();
        input.focus();
    };

    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (dialog.open) dialog.close();
            else open();
        }
    });

    if (opener) opener.addEventListener('click', open);

    input.addEventListener('input', render);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(active + 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(active - 1);
        } else if (e.key === 'Home') {
            e.preventDefault();
            setActive(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            setActive(shown.length - 1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            run(active);
        }
    });

    // A click on the backdrop (the dialog element itself) closes the palette
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
})();
