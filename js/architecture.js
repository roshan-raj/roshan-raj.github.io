/* Interactive architecture diagram: plain SVG, no library.
   Content lives in data/architecture.js. */
(() => {
    'use strict';

    const host = document.getElementById('arch-diagram');
    const data = window.ARCHITECTURE;
    if (!host || !data) return;

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const el = (name, attrs = {}, text) => {
        const node = document.createElementNS(SVG_NS, name);
        Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
        if (text != null) node.textContent = text;
        return node;
    };

    const caption = document.getElementById('arch-caption');
    const card = {
        title: document.getElementById('arch-card-title'),
        sub: document.getElementById('arch-card-sub'),
        what: document.getElementById('arch-card-what'),
        why: document.getElementById('arch-card-why')
    };
    const buttons = [...document.querySelectorAll('[data-arch-run]')];

    const narrow = window.matchMedia('(max-width: 700px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const byId = new Map(data.nodes.map((n) => [n.id, n]));

    let boxes = new Map();   // id -> { x, y, w, h, cx, cy }
    let nodeEls = new Map(); // id -> <g>
    let edgeEls = new Map(); // "from>to" -> <path>
    let dot = null;
    let selectedId = data.nodes[0].id;
    let runToken = 0;

    /* ---------- Layout ---------- */

    // Wide: flow runs left to right, branches hang below.
    // Narrow: flow runs top to bottom, branches sit to the right.
    const layout = () => {
        const vertical = narrow.matches;
        const cols = Math.max(...data.nodes.map((n) => n.col)) + 1;
        const m = vertical
            ? { w: 150, h: 58, gap: 26, branchW: 150, branchGap: 22, pad: 10 }
            : { w: 136, h: 64, gap: 28, branchGap: 56, pad: 10 };

        const next = new Map();
        data.nodes.forEach((n) => {
            let x, y, w = m.w;
            if (vertical) {
                w = n.row === 0 ? m.w : m.branchW;
                x = m.pad + (n.row === 0 ? 0 : m.w + m.branchGap);
                y = m.pad + n.col * (m.h + m.gap);
            } else {
                x = m.pad + n.col * (m.w + m.gap);
                y = m.pad + n.row * (m.h + m.branchGap);
            }
            next.set(n.id, { x, y, w, h: m.h, cx: x + w / 2, cy: y + m.h / 2 });
        });

        const width = vertical
            ? m.pad * 2 + m.w + m.branchGap + m.branchW
            : m.pad * 2 + cols * m.w + (cols - 1) * m.gap;
        const height = vertical
            ? m.pad * 2 + cols * m.h + (cols - 1) * m.gap
            : m.pad * 2 + m.h * 2 + m.branchGap;

        return { boxes: next, width, height };
    };

    // Straight connector between two boxes that share a row or a column
    const connector = (a, b) => {
        if (Math.abs(a.cy - b.cy) < 1) {
            const dir = b.cx > a.cx ? 1 : -1;
            return [a.cx + dir * a.w / 2, a.cy, b.cx - dir * b.w / 2, b.cy];
        }
        const dir = b.cy > a.cy ? 1 : -1;
        return [a.cx, a.cy + dir * a.h / 2, b.cx, b.cy - dir * b.h / 2];
    };

    /* ---------- Render ---------- */

    const render = () => {
        const { boxes: next, width, height } = layout();
        boxes = next;
        nodeEls = new Map();
        edgeEls = new Map();

        const svg = el('svg', {
            viewBox: `0 0 ${width} ${height}`,
            class: 'arch-svg',
            role: 'group',
            'aria-label': 'Event flow: producer, event bus, rule, queue, Lambda consumer and graph store, with a dead-letter queue and an idempotency table as side branches'
        });
        svg.style.maxWidth = `${Math.round(width * 1.2)}px`;

        const defs = el('defs');
        const marker = el('marker', {
            id: 'arch-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5,
            markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse'
        });
        marker.appendChild(el('path', { d: 'M0 0L10 5L0 10z', class: 'arch-arrowhead' }));
        defs.appendChild(marker);
        svg.appendChild(defs);

        data.edges.forEach((e) => {
            const [x1, y1, x2, y2] = connector(boxes.get(e.from), boxes.get(e.to));
            const path = el('path', {
                d: `M${x1} ${y1}L${x2} ${y2}`,
                class: `arch-edge${e.branch ? ' arch-edge-branch' : ''}`,
                'marker-end': 'url(#arch-arrow)'
            });
            edgeEls.set(`${e.from}>${e.to}`, path);
            svg.appendChild(path);
        });

        data.nodes.forEach((n) => {
            const b = boxes.get(n.id);
            const g = el('g', {
                class: 'arch-node',
                tabindex: 0,
                role: 'button',
                'aria-label': `${n.label}, ${n.sub}`,
                'data-id': n.id
            });
            g.appendChild(el('rect', { x: b.x, y: b.y, width: b.w, height: b.h, rx: 12 }));
            g.appendChild(el('text', { x: b.cx, y: b.cy - 3, class: 'arch-label' }, n.label));
            g.appendChild(el('text', { x: b.cx, y: b.cy + 15, class: 'arch-sub' }, n.sub));

            const pick = () => select(n.id);
            g.addEventListener('pointerenter', (ev) => { if (ev.pointerType === 'mouse') pick(); });
            g.addEventListener('click', pick);
            g.addEventListener('focus', pick);
            g.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); }
            });

            nodeEls.set(n.id, g);
            svg.appendChild(g);
        });

        dot = el('g', { class: 'arch-dot', 'aria-hidden': 'true' });
        dot.appendChild(el('circle', { r: 13, class: 'arch-dot-halo' }));
        dot.appendChild(el('circle', { r: 5.5, class: 'arch-dot-core' }));
        svg.appendChild(dot);

        host.replaceChildren(svg);
        select(selectedId);
    };

    const select = (id) => {
        const n = byId.get(id);
        if (!n) return;
        selectedId = id;
        nodeEls.forEach((g, key) => g.classList.toggle('is-selected', key === id));
        card.title.textContent = n.label;
        card.sub.textContent = n.sub;
        card.what.textContent = n.what;
        card.why.textContent = n.why;
    };

    /* ---------- Play ---------- */

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const clearRunState = () => {
        nodeEls.forEach((g) => g.classList.remove('is-live', 'is-failed'));
        edgeEls.forEach((p) => p.classList.remove('is-live'));
        if (dot) dot.classList.remove('is-on', 'is-failed');
    };

    const placeDot = (x, y) => dot.setAttribute('transform', `translate(${x} ${y})`);

    // Glide the dot through a list of [x, y] points at a steady speed
    const moveDot = (points, token) => new Promise((resolve) => {
        const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
        const total = lengths.reduce((a, b) => a + b, 0);
        if (!total) return resolve();
        const ms = Math.min(900, 380 + total * 2.2);
        const start = performance.now();
        const frame = (now) => {
            if (token !== runToken) return resolve();
            const t = Math.min(1, (now - start) / ms);
            const k = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // ease in-out
            let left = total * k;
            let i = 0;
            while (i < lengths.length - 1 && left > lengths[i]) left -= lengths[i++];
            const f = lengths[i] ? left / lengths[i] : 1;
            placeDot(
                points[i][0] + (points[i + 1][0] - points[i][0]) * f,
                points[i][1] + (points[i + 1][1] - points[i][1]) * f
            );
            if (t < 1) requestAnimationFrame(frame);
            else resolve();
        };
        requestAnimationFrame(frame);
    });

    const setBusy = (name) => {
        buttons.forEach((b) => b.classList.toggle('is-running', b.dataset.archRun === name));
    };

    const play = async (name) => {
        const steps = data.runs[name];
        if (!steps) return;
        const token = ++runToken;
        const still = reducedMotion.matches;
        clearRunState();
        setBusy(name);

        // The dot rests on a box's border, where the arrow meets it, so it never
        // sits on top of the label.
        let prev = null;
        let at = null;
        for (const step of steps) {
            if (token !== runToken) return;
            const box = boxes.get(step.to);

            if (!prev) {
                at = narrow.matches ? [box.cx, box.y] : [box.x, box.cy];
                if (!still) {
                    placeDot(at[0], at[1]);
                    dot.classList.add('is-on');
                }
            } else {
                const forward = edgeEls.has(`${prev}>${step.to}`);
                const edge = edgeEls.get(forward ? `${prev}>${step.to}` : `${step.to}>${prev}`);
                const [x1, y1, x2, y2] = forward
                    ? connector(boxes.get(prev), box)
                    : connector(box, boxes.get(prev)).slice(2).concat(connector(box, boxes.get(prev)).slice(0, 2));
                if (!still) {
                    if (edge) edge.classList.add('is-live');
                    await moveDot([at, [x1, y1], [x2, y2]], token);
                    if (edge) edge.classList.remove('is-live');
                    if (token !== runToken) return;
                }
                at = [x2, y2];
            }

            nodeEls.forEach((g) => g.classList.remove('is-live'));
            const g = nodeEls.get(step.to);
            g.classList.add('is-live');
            g.classList.toggle('is-failed', Boolean(step.fail));
            dot.classList.toggle('is-failed', Boolean(step.fail));
            caption.textContent = step.say;
            select(step.to);

            prev = step.to;
            await wait(still ? 1400 : 900);
        }

        if (token !== runToken) return;
        await wait(1200);
        if (token !== runToken) return;
        clearRunState();
        setBusy(null);
    };

    buttons.forEach((b) => b.addEventListener('click', () => play(b.dataset.archRun)));

    // Switching between the wide and narrow layouts cancels any run in progress
    narrow.addEventListener('change', () => {
        runToken++;
        setBusy(null);
        caption.textContent = '';
        render();
    });

    render();
})();
