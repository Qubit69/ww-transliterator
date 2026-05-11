const scripts = {
    "Solaris": { folder: "solaris", chars: "QWERTYUIOPASDFGHJKLZXCVBNM[](),.:;/" },
    "Ragunna": { folder: "ragunna", chars: "QWERTYUIOPASDFGHJKLZXCVBNM" }
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
    '%': 'percent'
};

const unknownImg = 'img/common/placeholders/unknown.png';
const imgCache = new Map();

function getPath(char, folder = 'common/placeholders') {
    const name = specialCharMap[char] || char.toLowerCase();
    return `img/${folder}/${name}.png`;
}

// Preload
function initAssets() {
    [unknownImg, ...Object.values(specialCharMap).map(n => `img/common/placeholders/${n}.png`)].forEach(preload);
    Object.entries(scripts).forEach(([_, { folder, chars }]) => {
        chars.split('').forEach(c => preload(getPath(c, folder)));
    });
}

function preload(src) {
    const img = new Image();
    img.src = src;
    img.onerror = () => imgCache.set(src, unknownImg);
}

// Load img
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
        visual: document.getElementById('visual-output')
    };
    initAssets();

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
                // Probably unnecessary but without this linebreaks dont work
                br.style.flexBasis = '100%';
                return frag.appendChild(br);
            }

            const isScriptChar = script.chars.includes(char.toUpperCase());
            const src = isScriptChar ? getPath(char, script.folder) : getPath(char);
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
