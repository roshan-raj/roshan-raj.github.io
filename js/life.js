/* "Off the clock": a travel map with postcards, and a garden log.
   Content lives in data/life.js. Empty fields render as dashed placeholders. */
(() => {
    'use strict';

    const data = window.LIFE;
    const mapHost = document.getElementById('travel-map');
    const tabs = document.getElementById('travel-tabs');
    const card = document.getElementById('postcard');
    const gardenHost = document.getElementById('garden');
    if (!data || !mapHost || !card) return;

    const esc = (str) => String(str ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);

    const missing = (label) => `<span class="todo">${esc(label)}</span>`;
    const text = (value, label) => (value ? esc(value) : missing(label));

    const photo = (p, label) => p && p.src
        ? `<img src="${esc(p.src)}" alt="${esc(p.alt || '')}" loading="lazy"${p.focus ? ` style="object-position: ${esc(p.focus)}"` : ''}>`
        : `<span class="photo-empty" role="img" aria-label="Photo to come">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                   <rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/>
                   <path d="M21 16l-5-5-8 8"/></svg>
               ${esc(label)}
           </span>`;

    /* ---------- Map ---------- */

    // Plain equirectangular projection over India's latitude and longitude range.
    // Only a grid is drawn, no outline, so the pins carry the geography.
    const LON = [68, 98];
    const LAT = [6, 37];
    const W = 300;
    const H = 330;
    const PAD = 28;
    const x = (lon) => PAD + ((lon - LON[0]) / (LON[1] - LON[0])) * (W - PAD * 2);
    const y = (lat) => PAD + ((LAT[1] - lat) / (LAT[1] - LAT[0])) * (H - PAD * 2);

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const el = (name, attrs = {}, content) => {
        const node = document.createElementNS(SVG_NS, name);
        Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
        if (content != null) node.textContent = content;
        return node;
    };

    const svg = el('svg', {
        viewBox: `0 0 ${W} ${H}`,
        class: 'map-svg',
        role: 'group',
        'aria-label': 'Map of places I have travelled to in India'
    });

    const grid = el('g', { class: 'map-grid', 'aria-hidden': 'true' });
    for (let lon = 70; lon <= 95; lon += 5) {
        grid.appendChild(el('line', { x1: x(lon), y1: y(LAT[1]), x2: x(lon), y2: y(LAT[0]) }));
        grid.appendChild(el('text', { x: x(lon), y: H - 8, class: 'map-tick' }, `${lon}°E`));
    }
    for (let lat = 10; lat <= 35; lat += 5) {
        grid.appendChild(el('line', { x1: x(LON[0]), y1: y(lat), x2: x(LON[1]), y2: y(lat) }));
        grid.appendChild(el('text', { x: 4, y: y(lat) + 3, class: 'map-tick map-tick-lat' }, `${lat}°N`));
    }
    svg.appendChild(grid);

    // Home, as a reference point
    if (data.home) {
        const hx = x(data.home.lon);
        const hy = y(data.home.lat);
        const home = el('g', { class: 'map-home', 'aria-hidden': 'true' });
        home.appendChild(el('rect', { x: hx - 4, y: hy - 4, width: 8, height: 8, rx: 1.5 }));
        home.appendChild(el('text', { x: hx, y: hy + 17, 'text-anchor': 'middle' }, `Home · ${data.home.name}`));
        svg.appendChild(home);
    }

    // A label sits right of its pin, or left near the east edge. A place can set
    // label: 'above' | 'below' | 'left' | 'right' when it would collide with another.
    const LABEL = {
        right: (px, py) => ({ x: px + 16, y: py + 4, anchor: 'start' }),
        left: (px, py) => ({ x: px - 16, y: py + 4, anchor: 'end' }),
        above: (px, py) => ({ x: px, y: py - 17, anchor: 'middle' }),
        below: (px, py) => ({ x: px, y: py + 26, anchor: 'middle' })
    };

    const pins = new Map();
    data.places.forEach((p) => {
        const px = x(p.lon);
        const py = y(p.lat);
        const side = LABEL[p.label] ? p.label : (px > W * 0.62 ? 'left' : 'right');
        const pos = LABEL[side](px, py);
        const g = el('g', {
            class: 'map-pin',
            role: 'button',
            tabindex: 0,
            'aria-label': `${p.name}, ${p.region}`,
            'data-id': p.id
        });
        g.appendChild(el('circle', { cx: px, cy: py, r: 16, class: 'map-pin-hit' }));
        g.appendChild(el('circle', { cx: px, cy: py, r: 11, class: 'map-pin-ring' }));
        g.appendChild(el('circle', { cx: px, cy: py, r: 5.5, class: 'map-pin-dot' }));
        g.appendChild(el('text', {
            x: pos.x,
            y: pos.y,
            class: 'map-pin-label',
            'text-anchor': pos.anchor
        }, p.name));
        g.addEventListener('click', () => select(p.id));
        g.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(p.id); }
        });
        pins.set(p.id, g);
        svg.appendChild(g);
    });

    mapHost.replaceChildren(svg);

    /* ---------- Tabs and postcard ---------- */

    tabs.innerHTML = data.places.map((p) =>
        `<li><button type="button" data-id="${esc(p.id)}" aria-pressed="false">${esc(p.name)}</button></li>`
    ).join('');
    tabs.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => select(b.dataset.id)));

    const renderCard = (p) => {
        const photos = (p.photos || []).slice(0, 3);
        while (photos.length < 2) photos.push(null);
        card.innerHTML = `
            <div class="postcard-photos postcard-photos-${photos.length}">
                ${photos.map((ph, i) => `<figure>${photo(ph, i === 0 ? 'Photo' : 'Another photo')}</figure>`).join('')}
            </div>
            <div class="postcard-body">
                <p class="postcard-meta">
                    <span>${esc(p.region)}</span>
                    <span>${text(p.month, 'Add month')}</span>
                </p>
                <h3 class="postcard-title">${esc(p.name)}</h3>
                <p class="postcard-line">${text(p.postcard, 'Add a postcard line')}</p>
                <p class="postcard-memory">${text(p.memory, 'Add one line on what stood out')}</p>
                ${(p.tags || []).length ? `<ul class="chips">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
            </div>`;
    };

    let current = null;
    const select = (id) => {
        const p = data.places.find((place) => place.id === id);
        if (!p || id === current) return;
        current = id;
        pins.forEach((g, key) => g.classList.toggle('is-selected', key === id));
        tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
        renderCard(p);
    };

    select(data.places[0] && data.places[0].id);

    /* ---------- Garden ---------- */

    const g = data.garden;
    if (gardenHost && g) {
        const pair = (side, label) => `
            <figure class="garden-photo">
                ${photo(g[side], label)}
                <figcaption><span class="garden-photo-tag">${label}</span>${text(g[side] && g[side].caption, 'Add a caption')}</figcaption>
            </figure>`;

        gardenHost.innerHTML = `
            <p class="garden-intro">${text(g.intro, 'Add a line on what you grow and where')}</p>
            <div class="garden-grid">
                <div class="garden-pair">
                    ${pair('before', 'Before')}
                    ${pair('after', 'After')}
                </div>
                <ol class="garden-log">
                    ${(g.entries || []).map((e) => `
                    <li>
                        <p class="garden-date">${text(e.date, 'Date')}</p>
                        <div>
                            <h4>${text(e.plant, 'Plant')}</h4>
                            <p>${text(e.note, 'What you planted and how it went')}</p>
                            ${e.outcome ? `<span class="garden-outcome">${esc(e.outcome)}</span>` : ''}
                        </div>
                    </li>`).join('')}
                </ol>
            </div>`;
    }
})();
