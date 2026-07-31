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

// Load tiles
const createImg = (src, alt = "") => {
    const img = document.createElement('img');
    img.src = imgCache.get(src) || src;
    img.alt = alt;
    img.onerror = () => { img.src = unknownImg; imgCache.set(src, unknownImg); };
    return img;
};

document.addEventListener('DOMContentLoaded', () => {
    const ui = {
        select: document.getElementById('script-select'),
                          grid: document.getElementById('image-grid'),
                          input: document.getElementById('output-area'),
                          visual: document.getElementById('visual-output'),
                          tileBGbutton: document.getElementById('bg-cycle-btn'),
                          backspaceBtn: document.getElementById('backspace-btn')
    };
    initAssets();

// Backspace button
    ui.backspaceBtn.addEventListener('click', () => {
        ui.input.value = ui.input.value.slice(0, -1);
        updateVisual();
    });

// Tile background button
    let bgState = 0;
    const states = [
        { label: "Toggle BG Color", classes: [] },
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
            card.className = 'letter-card';
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

// Load the changelog
async function loadChangelog() {
    const container = document.getElementById('changelog');
    if (!container) return;

    try {
        const response = await fetch('./changelog.json');
        const data = await response.json();
        let textOutput = "Short Changelog:\n";

        data.forEach(entry => {
            textOutput += `\n${entry.date}\n`;
            entry.changes.forEach(change => {
                textOutput += `- ${change}\n`;
            });
        });

        container.textContent = textOutput.trim();
    } catch (error) {
        console.error('Error loading changelog:', error);
    }
}
document.addEventListener('DOMContentLoaded', loadChangelog);
