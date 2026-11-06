const GRID_CHARS = "QWERTYUIOPASDFGHJKLZXCVBNM";
const scripts = {};
const fontLoads = new Map();
const unknownImg = 'assets/images/placeholders/unknown.png';
const isSubpage = /\/(?:fonts|references)(?:\/index\.html)?\/?$/.test(window.location.pathname);
const siteRoot = isSubpage
    ? window.location.pathname.replace(/(?:fonts|references)(?:\/index\.html)?\/?$/, '')
    : './';

function appendFormattedText(container, text) {
    let position = 0;
    for (const match of text.matchAll(/\*\*(.+?)\*\*|\n/g)) {
        container.appendChild(document.createTextNode(text.slice(position, match.index)));
        if (match[0] === '\n') {
            container.appendChild(document.createElement('br'));
        } else {
            const bold = document.createElement('strong');
            bold.textContent = match[1];
            container.appendChild(bold);
        }
        position = match.index + match[0].length;
    }
    container.appendChild(document.createTextNode(text.slice(position)));
}

// Make sure fonts are loaded before using them first because some browsers are silly
async function ensureScriptFont(name) {
    if (!scripts[name]) return null;
    if (!fontLoads.has(name)) {
        fontLoads.set(name, (async () => {
            try {
                const url = new URL(`assets/fonts/${name.toUpperCase()}.ttf`, new URL(siteRoot, location.href));
                const font = new FontFace(name, `url(${url})`);
                await font.load();
                document.fonts.add(font);
                return font;
            } catch (error) {
                console.warn(`Could not load assets/fonts/${name}.ttf`, error);
                return null;
            }
        })());
    }
    return fontLoads.get(name);
}
// Load fallback image
function createImg(src, alt = "") {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.onerror = () => img.src = unknownImg;
    return img;
}

//Load header/footer
async function loadComponent(id, file) {
    try {
        const response = await fetch(`${siteRoot}${file}`);
        if (!response.ok) throw new Error(`Could not load ${file}: ${response.status}`);
        const placeholder = document.getElementById(id);
        if (!placeholder) return;
        placeholder.outerHTML = await response.text();
        document.querySelectorAll('.site-header a[href], .site-footer a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !/^(?:[a-z]+:|\/|#)/i.test(href)) {
                link.href = new URL(href, new URL(siteRoot, location.href));
            }
        });
    } catch (error) {
        console.error(`Error loading ${file}:`, error);
    }
}

// Load the changelog
async function loadChangelog() {
    const container = document.getElementById('changelog');
    if (!container) return;
    try {
        const response = await fetch(`${siteRoot}data/changelog.json`);
        if (!response.ok) throw new Error(`Could not load changelog: ${response.status}`);
        const data = await response.json();
        const version = document.getElementById('version');
        if (version) version.textContent = `v${data[0].version}`;
        const lines = data.flatMap((entry, index) => {
            const version = entry.version ? ` - v${entry.version}` : '';
            return [...(index ? [''] : []), `${entry.date}${version}`, ...entry.changes.map(change => `- ${change}`)];
        });
        container.replaceChildren();
        const heading = document.createElement('strong');
        heading.textContent = 'Changelog';
        container.append(heading, document.createElement('br'), document.createElement('br'));
        lines.forEach((line, index) => {
            if (index) container.appendChild(document.createElement('br'));
            appendFormattedText(container, line);
        });
    } catch (error) {
        console.error('Error loading changelog:', error);
    }
}

// Load the header and footer
async function initSharedPage() {
    await Promise.all([
        loadComponent('header-placeholder', 'header.html'),
        loadComponent('footer-placeholder', 'footer.html')
    ]);
    loadChangelog();
}

// Init the tile grid
async function initTranslit() {
    const ui = {
        select: document.getElementById('script-select'),
        grid: document.getElementById('tile-grid'),
        input: document.getElementById('output-area'),
        visual: document.getElementById('output-grid'),
        bgButton: document.getElementById('toggle-bg-btn'),
        gridButton: document.getElementById('toggle-grid-btn'),
        backspaceButton: document.getElementById('backspace-btn')
    };
    if (!ui.select) return;

    try {
        const response = await fetch(`${siteRoot}data/fonts.json`);
        if (!response.ok) throw new Error(`Could not load fonts.json: ${response.status}`);
        (await response.json()).forEach(font => scripts[font.name] = font);
    } catch (error) {
        console.error('Fonts.json:', error);
    }

    function hasFontGlyph(name, char) {
        return !scripts[name].missingGlyphs?.includes(char);
    }

    async function updateVisual() {
        const name = ui.select.value;
        if (!scripts[name]) return;
        await ensureScriptFont(name);

        const fragment = document.createDocumentFragment();
        for (const char of ui.input.value.toUpperCase()) {
            if (char === ' ') {
                const spacer = document.createElement('div');
                spacer.style.cssText = 'display:inline-block;width:20px';
                fragment.appendChild(spacer);
            } else if (char === '\n') {
                const lineBreak = document.createElement('div');
                lineBreak.className = 'line-break';
                fragment.appendChild(lineBreak);
            } else if (/[A-Z0-9]/.test(char)) {
                const glyph = document.createElement('span');
                glyph.className = `glyph${hasFontGlyph(name, char) ? '' : ' default-font-char'}`;
                if (hasFontGlyph(name, char)) glyph.style.fontFamily = `"${name}", sans-serif`;
                glyph.textContent = char;
                fragment.appendChild(glyph);
            } else {
                fragment.appendChild(createImg(unknownImg, char));
            }
        }
        ui.visual.replaceChildren(fragment);
    }

    async function renderGrid() {
        const name = ui.select.value;
        if (!scripts[name]) return;
        await ensureScriptFont(name);
        const fragment = document.createDocumentFragment();
        for (const char of GRID_CHARS) {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'tile';
            const missing = !hasFontGlyph(name, char);
            card.setAttribute('aria-label', missing ? `${char}, missing from ${name}` : char);
            if (missing) {
                card.classList.add('tile-warn');
                card.title = `${char} is missing from ${name}`;
            }
            const glyph = document.createElement('span');
            glyph.className = 'glyph-tile';
            glyph.style.fontFamily = `"${name}", sans-serif`;
            glyph.textContent = char;
            const label = document.createElement('span');
            label.textContent = char;
            card.append(glyph, label);
            card.addEventListener('click', () => {
                ui.input.value += char;
                updateVisual();
            });
            fragment.appendChild(card);
        }
        ui.grid.replaceChildren(fragment);
        await updateVisual();
    }

    ui.select.replaceChildren(...Object.keys(scripts).map(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        return option;
    }));
    ui.select.onchange = renderGrid;
    ui.input.oninput = updateVisual;
    ui.backspaceButton.addEventListener('click', () => {
        ui.input.value = ui.input.value.slice(0, -1);
        updateVisual();
    });
    ui.gridButton.addEventListener('click', () => {
        ui.grid.classList.toggle('hidden');
        ui.gridButton.textContent = ui.grid.classList.contains('hidden') ? 'Show Tiles' : 'Hide Tiles';
    });

    const backgrounds = [
        ['Change BG', []],
        ['BG: Black', ['bg-black']],
        ['BG: White', ['bg-black', 'bg-invert']],
        ['BG: Green', ['bg-green', 'bg-invert']]
    ];
    let bgState = 0;
    ui.bgButton.addEventListener('click', () => {
        bgState = (bgState + 1) % backgrounds.length;
        const [label, classes] = backgrounds[bgState];
        ui.visual.classList.remove('bg-black', 'bg-invert', 'bg-green');
        ui.visual.classList.add(...classes);
        ui.bgButton.textContent = label;
    });

    if (Object.keys(scripts).length) await renderGrid();
}

document.addEventListener('DOMContentLoaded', () => {
    initSharedPage();
    if (document.getElementById('script-select')) initTranslit();
});
