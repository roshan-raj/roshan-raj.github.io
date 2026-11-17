/* Skills graph: skills, projects, roles and concepts as a force layout.
   Data comes from data/graph.js and data/projects.js; layout from d3-force. */
(() => {
    'use strict';

    const host = document.getElementById('skills-graph');
    const block = host && host.closest('.skills-graph');
    const cfg = window.SKILL_GRAPH;
    const d3 = window.d3;

    // Without the data or the layout library, the toolkit lists above stand in
    if (!host || !cfg || !d3 || !d3.forceSimulation) {
        if (block) block.hidden = true;
        return;
    }

    const caption = document.getElementById('skills-graph-caption');
    const HINT = caption.textContent;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const el = (name, attrs = {}, text) => {
        const node = document.createElementNS(SVG_NS, name);
        Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
        if (text != null) node.textContent = text;
        return node;
    };

    /* ---------- Build nodes and links ---------- */

    const nodes = [];
    const links = [];
    const index = new Map();

    const addNode = (type, label, extra = {}) => {
        const id = `${type}:${label}`;
        if (!index.has(id)) {
            const node = { id, type, label, neighbours: new Set(), ...extra };
            index.set(id, node);
            nodes.push(node);
        }
        return index.get(id);
    };

    const addLink = (a, b) => {
        if (!a || !b || a.neighbours.has(b.id)) return;
        a.neighbours.add(b.id);
        b.neighbours.add(a.id);
        links.push({ source: a.id, target: b.id });
    };

    const skill = (name) => index.get(`skill:${name}`);

    // Order matters: it is also the keyboard order
    Object.entries(cfg.roles).forEach(([name, role]) => addNode('role', name, { period: role.period }));
    Object.keys(cfg.concepts).forEach((name) => addNode('concept', name));

    const excluded = new Set(cfg.projects.exclude || []);
    const extra = cfg.projects.extraSkills || {};
    const projects = (Array.isArray(window.PROJECTS) ? window.PROJECTS : [])
        .filter((p) => !excluded.has(p.title))
        .map((p) => ({
            title: p.title,
            skills: [...(p.technologies || []), ...(extra[p.title] || [])].filter((t) => cfg.skills.includes(t))
        }))
        .filter((p) => p.skills.length);

    projects.forEach((p) => addNode('project', p.title));
    cfg.skills.forEach((name) => addNode('skill', name));

    Object.entries(cfg.roles).forEach(([name, role]) =>
        role.skills.forEach((s) => addLink(index.get(`role:${name}`), skill(s))));
    Object.entries(cfg.concepts).forEach(([name, list]) =>
        list.forEach((s) => addLink(index.get(`concept:${name}`), skill(s))));
    projects.forEach((p) =>
        p.skills.forEach((s) => addLink(index.get(`project:${p.title}`), skill(s))));

    // Skills nothing points at would float alone, so leave them out
    const live = nodes.filter((n) => n.neighbours.size);

    const radius = (n) => {
        if (n.type === 'role') return 12;
        if (n.type === 'concept') return 10;
        if (n.type === 'project') return 8;
        return 4.5 + Math.min(n.neighbours.size, 6) * 0.9;
    };
    live.forEach((n) => { n.r = radius(n); });

    /* ---------- Caption ---------- */

    const listFormat = typeof Intl !== 'undefined' && Intl.ListFormat
        ? new Intl.ListFormat('en', { style: 'long', type: 'conjunction' })
        : { format: (items) => items.join(', ') };

    const describe = (n) => {
        const group = (type) => [...n.neighbours]
            .map((id) => index.get(id))
            .filter((m) => m.type === type)
            .map((m) => m.label);
        const say = (lead, items) => (items.length ? `${lead} ${listFormat.format(items)}` : '');

        let parts;
        if (n.type === 'skill') {
            parts = [
                say('used in', group('project')),
                say('at work as', group('role')),
                say('part of', group('concept'))
            ];
        } else if (n.type === 'project') {
            parts = [say('built with', group('skill'))];
        } else if (n.type === 'role') {
            parts = [n.period, say('worked with', group('skill'))];
        } else {
            parts = [say('covers', group('skill'))];
        }
        return parts.filter(Boolean).join('; ') + '.';
    };

    /* ---------- Render ---------- */

    let width = 0;
    let height = 0;
    let svg, linkEls, nodeEls, sim;
    let selectedId = null;
    let hoverId = null;
    let cursor = 0; // roving tabindex position

    const measure = () => {
        width = Math.max(280, host.clientWidth);
        height = width < 600 ? 720 : 540;
    };

    const paintFocus = () => {
        const focus = index.get(hoverId || selectedId);
        svg.classList.toggle('has-focus', Boolean(focus));
        nodeEls.forEach((g, i) => {
            const n = live[i];
            g.classList.toggle('is-on', Boolean(focus) && (n === focus || focus.neighbours.has(n.id)));
            g.classList.toggle('is-selected', n.id === selectedId);
            g.setAttribute('aria-pressed', String(n.id === selectedId));
        });
        linkEls.forEach((line, i) => {
            const l = links[i];
            line.classList.toggle('is-on', Boolean(focus) && (l.source === focus || l.target === focus));
        });
    };

    const select = (id) => {
        selectedId = id === selectedId ? null : id;
        const n = index.get(selectedId);
        caption.replaceChildren();
        if (n) {
            const strong = document.createElement('strong');
            strong.textContent = n.label;
            caption.append(strong, ` — ${describe(n)}`);
        } else {
            caption.textContent = HINT;
        }
        paintFocus();
    };

    const draw = () => {
        const padX = width < 600 ? 44 : 60;
        live.forEach((n) => {
            n.x = Math.max(padX, Math.min(width - padX, n.x));
            n.y = Math.max(n.r + 6, Math.min(height - n.r - 22, n.y));
        });
        linkEls.forEach((line, i) => {
            const l = links[i];
            line.setAttribute('x1', l.source.x);
            line.setAttribute('y1', l.source.y);
            line.setAttribute('x2', l.target.x);
            line.setAttribute('y2', l.target.y);
        });
        nodeEls.forEach((g, i) => g.setAttribute('transform', `translate(${live[i].x} ${live[i].y})`));
    };

    const applyForces = () => {
        const small = width < 600;
        sim.force('link').distance(small ? 46 : 64);
        sim.force('charge').strength(small ? -150 : -300);
        sim.force('x', d3.forceX(width / 2).strength(small ? 0.12 : 0.035));
        sim.force('y', d3.forceY(height / 2).strength(small ? 0.05 : 0.11));
        // Labels sit under the dots; the longer project, role and concept names need more room
        sim.force('collide').radius((n) => n.r + (small ? 20 : 26) + (n.type === 'skill' ? 0 : 10));
    };

    const focusNode = (i) => {
        cursor = (i + live.length) % live.length;
        nodeEls.forEach((g, j) => g.setAttribute('tabindex', j === cursor ? 0 : -1));
        nodeEls[cursor].focus();
    };

    const attachDrag = (g, n) => {
        let start = null;
        let dragging = false;

        const point = (ev) => {
            const rect = svg.getBoundingClientRect();
            return [ev.clientX - rect.left, ev.clientY - rect.top];
        };

        g.addEventListener('pointerdown', (ev) => {
            if (ev.button) return;
            start = point(ev);
            dragging = false;
            try { g.setPointerCapture(ev.pointerId); } catch (e) { /* pointer already gone */ }
        });

        g.addEventListener('pointermove', (ev) => {
            if (!start) return;
            const [x, y] = point(ev);
            if (!dragging && Math.hypot(x - start[0], y - start[1]) < 5) return;
            if (!dragging) {
                dragging = true;
                g.classList.add('is-dragging');
                if (!reducedMotion.matches) sim.alphaTarget(0.25).restart();
            }
            if (reducedMotion.matches) {
                n.x = x;
                n.y = y;
                draw();
            } else {
                n.fx = x;
                n.fy = y;
            }
        });

        const end = (ev) => {
            if (!start) return;
            if (!dragging && ev.type === 'pointerup') select(n.id);
            start = null;
            dragging = false;
            g.classList.remove('is-dragging');
            n.fx = null;
            n.fy = null;
            sim.alphaTarget(0);
        };
        g.addEventListener('pointerup', end);
        g.addEventListener('pointercancel', end);
    };

    const init = () => {
        measure();

        svg = el('svg', {
            class: 'graph-svg',
            viewBox: `0 0 ${width} ${height}`,
            height,
            role: 'group',
            'aria-label': 'Graph of skills, projects, roles and concepts. Use the arrow keys to move between dots and Enter to select one.'
        });

        const linkLayer = el('g', { 'aria-hidden': 'true' });
        linkEls = links.map(() => linkLayer.appendChild(el('line', { class: 'graph-link' })));
        svg.appendChild(linkLayer);

        nodeEls = live.map((n, i) => {
            const g = el('g', {
                class: `graph-node graph-${n.type}`,
                role: 'button',
                tabindex: i === 0 ? 0 : -1,
                'aria-pressed': 'false',
                'aria-label': `${n.label}, ${n.type}`
            });
            g.appendChild(el('circle', { r: n.r + 9, class: 'graph-hit' }));
            g.appendChild(el('circle', { r: n.r, class: 'graph-dot' }));
            g.appendChild(el('text', { y: n.r + 13, class: 'graph-label' }, n.label));

            g.addEventListener('pointerenter', (ev) => {
                if (ev.pointerType !== 'mouse') return;
                hoverId = n.id;
                paintFocus();
            });
            g.addEventListener('pointerleave', () => {
                if (hoverId !== n.id) return;
                hoverId = null;
                paintFocus();
            });
            g.addEventListener('focus', () => { cursor = i; });
            g.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    select(n.id);
                } else if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') {
                    ev.preventDefault();
                    focusNode(cursor + 1);
                } else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') {
                    ev.preventDefault();
                    focusNode(cursor - 1);
                } else if (ev.key === 'Escape' && selectedId) {
                    select(selectedId);
                }
            });
            attachDrag(g, n);
            svg.appendChild(g);
            return g;
        });

        // A click on empty space clears the selection
        svg.addEventListener('click', (ev) => {
            if (ev.target === svg && selectedId) select(selectedId);
        });

        host.replaceChildren(svg);

        sim = d3.forceSimulation(live)
            .force('link', d3.forceLink(links).id((n) => n.id))
            .force('charge', d3.forceManyBody())
            .force('collide', d3.forceCollide())
            .on('tick', draw);
        applyForces();

        // Start from a spiral around the middle and settle most of the way before
        // the first paint, so the graph eases into place instead of flying in.
        live.forEach((n, i) => {
            const angle = i * 2.4;
            const dist = 16 * Math.sqrt(i + 0.5);
            n.x = width / 2 + dist * Math.cos(angle);
            n.y = height / 2 + dist * Math.sin(angle);
        });
        sim.stop();
        sim.tick(reducedMotion.matches ? 300 : 160);
        draw();
        if (!reducedMotion.matches) sim.alpha(0.25).restart();

        new ResizeObserver(() => {
            const before = width;
            measure();
            if (width === before) return;
            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
            svg.setAttribute('height', height);
            applyForces();
            if (reducedMotion.matches) {
                sim.alpha(1);
                sim.tick(200);
                draw();
            } else {
                sim.alpha(0.5).restart();
            }
        }).observe(host);
    };

    // Start only when the graph is about to scroll into view
    const starter = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        starter.disconnect();
        init();
    }, { rootMargin: '300px 0px' });
    starter.observe(host);
})();
