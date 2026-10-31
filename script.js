const VERSION = "0.1"
const scripts = {
    "Solaris": { folder: "solaris", chars: "QWERTYUIOPASDFGHJKLZXCVBNM[](),.:;/" },
    "Ragunna": { folder: "ragunna", chars: "QWERTYUIOPASDFGHJKLZXCVBNM" },
    "Lahai-Roi": { folder: "lahairoi", chars: "QWERTYUIOPASDFGHJKLZXCVBNM.?" },
    "PGR": { folder: "pgr", chars: "QWERTYUIOPASDFGHJKLZXCVBNM!?@$[]().:;/+=-_" },
};

const specialCharMap = {
    '?': 'question',
    '!': 'exclamation',
    '*': 'asterisk',
    '\'': 'quote',
    '"': 'double-quote',
    '<': 'less-than',
    '>': 'greater-than',
    '~': 'tilde',
    ':': 'double-dot',
    ';': 'semicolon',
    '.': 'dot',
    '\\': 'backslash',
    '/': 'slash',
    '#': 'hashtag',
    '%': 'percent',
    '@': 'at',
    '$': 'dollar',
    '=': 'equals',
    '_': 'underscore',
    '-': 'dash',
    '+': 'plus'
};

const unknownImg = 'img/common/placeholders/unknown.png';
const imgCache = new Map();

function getPath(char, folder = 'common/placeholders') {
    const name = specialCharMap[char] || char.toLowerCase();
    return `img/${folder}/${name}.png`;
}

// Preload all assets
function initAssets() {
    [unknownImg, ...Object.values(specialCharMap).map(n => `img/common/placeholders/${n}.png`)].forEach(preload);
    Object.entries(scripts).forEach(([_, { folder, chars }]) => {
        chars.split('').forEach(c => preload(getPath(c, folder)));
    });
    Object.keys(specialCharMap).forEach(char => {
        Object.values(scripts).forEach(({ folder }) => preload(getPath(char, folder)));
        preload(getPath(char));
    });
}

function preload(src) {
    const img = new Image();
    img.src = src;
    img.onerror = () => imgCache.set(src, unknownImg);
}
//Load header/footer
async function loadComponent(id, file) {
    try {
        const response = await fetch(file);
        if (response.ok) {
            document.getElementById(id).outerHTML = await response.text();
        }
    } catch (error) {}
}
// Load tiles
const createImg = (src, alt = "") => {
    const img = document.createElement('img');
    img.src = imgCache.get(src) || src;
    img.alt = alt;
    img.onerror = () => { img.src = unknownImg; imgCache.set(src, unknownImg); };
    return img;
};

// Load the changelog
async function loadChangelog() {

    const path = window.location.pathname;
    const isIndex = path.endsWith('index.html') || path.endsWith('/') || path.endsWith('/ww-transliterator/');
    if (!isIndex) return;

    const container = document.getElementById('changelog');
    if (!container) return;

    try {
        const response = await fetch('./changelog.json');
        const data = await response.json();
        let textOutput = "**Changelog**\n";

        data.forEach(entry => {
            const versionTag = entry.version ? ` - v${entry.version}` : '';
            textOutput += `\n${entry.date}${versionTag}\n`;
            entry.changes.forEach(change => {
                textOutput += `- ${change}\n`;
            });
        });

        let htmlOutput = textOutput
        .trim()
        .replace(/\*\*(.*?)\*\*/g, '<span>$1</span>')
        .replace(/\n/g, '<br>');

        container.innerHTML = htmlOutput;
    } catch (error) {
        console.error('Error loading changelog:', error);
    }
}

// On fonts page load fonts
async function loadFonts() {
    const path = window.location.pathname;
    const isFonts = path.endsWith('fonts.html');
    if (!isFonts) return;

    const container = document.getElementById('font-container');
    if (!container) return;

    try {
        const response = await fetch('./fonts/fonts.json');
        const fonts = await response.json();

        container.innerHTML = ''; // Clear placeholder text

        let searchInput = document.getElementById('font-search');
        if (!searchInput) {
            searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.id = 'font-search';
            searchInput.className = 'font-search';
            searchInput.placeholder = 'Filter...';
            container.parentNode.insertBefore(searchInput, container);
        }

        const cards = [];

        fonts.forEach(font => {
            const box = document.createElement('div');
            box.className = 'banner-box banner-image-box';
            box.dataset.search = `${font.name} ${font.description || ''}`.toLowerCase();

            const upperName = font.name.toUpperCase();
            const filename = `${upperName}.ttf`;
            const imgSrc = `img/common/fonts/${upperName}.svg`;

            const formattedDesc = (font.description || '')
            .replace(/\*\*(.*?)\*\*/g, '<span>$1</span>')
            .replace(/\n/g, '<br>');

            box.innerHTML = `
            <img src="${imgSrc}" alt="" onerror="this.style.display='none'">
            <div class="banner-image-box-content">
            <strong class="banner-image-box-title">${font.name}</strong>
            <p class="banner-image-box-desc">${formattedDesc}</p>
            <a href="fonts/${filename}" download class="banner-image-box-link">Download</a>
            </div>
            `;
            container.appendChild(box);
            cards.push(box);
        });
        // Filter
        searchInput.oninput = (e) => {
            const query = e.target.value.toLowerCase().trim();
            cards.forEach(card => {
                const matches = card.dataset.search.includes(query);
                card.style.display = matches ? 'flex' : 'none';
            });
        };

    } catch (error) {
        console.error('Error loading fonts:', error);
        container.innerHTML = 'Failed to load fonts.';
    }
}
// Init
document.addEventListener('DOMContentLoaded', async () => {
    await loadComponent('header-placeholder', 'header.html');
    await loadComponent('footer-placeholder', 'footer.html');

    const versionEl = document.getElementById('version');
    if (versionEl) {
        versionEl.textContent = `v${VERSION}`;
    }

    loadChangelog();
    loadFonts();

    const ui = {
        select: document.getElementById('script-select'),
                          grid: document.getElementById('tile-grid'),
                          input: document.getElementById('output-area'),
                          visual: document.getElementById('output-grid'),
                          tileBGbutton: document.getElementById('toggle-bg-btn'),
                          toggleGridBtn: document.getElementById('toggle-grid-btn'),
                          backspaceBtn: document.getElementById('backspace-btn')
    };

    initAssets();

// Delete tile btn
    ui.backspaceBtn.addEventListener('click', () => {
        ui.input.value = ui.input.value.slice(0, -1);
        updateVisual();
    });

// Toggle grid btn
    ui.toggleGridBtn.addEventListener('click', () => {
        ui.grid.classList.toggle('hidden');
        ui.toggleGridBtn.textContent = ui.grid.classList.contains('hidden') ? 'Show Tiles' : 'Hide Tiles';
    });
// Toggle background btn
    let bgState = 0;
    const states = [
        { label: "Change BG", classes: [] },
        { label: "BG: Black", classes: ["bg-black"] },
        { label: "BG: White", classes: ["bg-black", "bg-invert"] },
        { label: "BG: Green", classes: ["bg-green", "bg-invert"] }
    ];

    ui.tileBGbutton.addEventListener('click', () => {
        bgState = (bgState + 1) % states.length;
        ui.visual.classList.remove('bg-black', 'bg-invert', 'bg-green');
        states[bgState].classes.forEach(cls => ui.visual.classList.add(cls));
        ui.tileBGbutton.textContent = states[bgState].label;
    });

// Tile logic
    const updateVisual = () => {
        const frag = document.createDocumentFragment();
        const script = scripts[ui.select.value];

        [...ui.input.value].forEach(char => {
            if (char === ' ') {
                const spacer = document.createElement('div');
                spacer.style.display = 'inline-block';
                spacer.style.width = '20px';
                return frag.appendChild(spacer);
            }

            if (char === '\n') {
                const br = document.createElement('div');
                br.style.flexBasis = '100%';
                return frag.appendChild(br);
            }

            const folderSrc = getPath(char, script.folder);
            const commonSrc = getPath(char);
            let src = folderSrc;

            // Final fallback
            const isScriptChar = script.chars.includes(char.toUpperCase()) || script.chars.includes(char.toLowerCase());
            if (!isScriptChar && imgCache.get(folderSrc) === unknownImg) {
                src = commonSrc;
            }

            frag.appendChild(createImg(src));
        });

        ui.visual.innerHTML = '';
        ui.visual.appendChild(frag);
    };

    const renderGrid = () => {
        ui.grid.innerHTML = '';
        const script = scripts[ui.select.value];
        script.chars.split('').forEach(char => {
            const card = document.createElement('div');
            card.className = 'tile';
            card.append(createImg(getPath(char, script.folder), char), Object.assign(document.createElement('span'), {textContent: char}));
            card.onclick = () => { ui.input.value += char; updateVisual(); };
            ui.grid.appendChild(card);
        });
        updateVisual();
    };

    ui.select.innerHTML = Object.keys(scripts).map(n => `<option value="${n}">${n}</option>`).join('');
    ui.select.onchange = renderGrid;
    ui.input.oninput = updateVisual;
    renderGrid();
});
