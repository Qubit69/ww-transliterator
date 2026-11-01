const VERSION = "0.2"
const GRID_CHARS = "QWERTYUIOPASDFGHJKLZXCVBNM";
let scripts = {};
const fontFaces = new Map();
const fontLoading = new Map();
const unknownImg = 'img/common/placeholders/unknown.png';

function cssFontFamily(name) {
    return `"${String(name)}"`;
}
async function ensureScriptFont(name) {
    const key = String(name || '');
    if (!key || !scripts[key]) return null;
    if (fontFaces.has(key)) return fontFaces.get(key);
    if (fontLoading.has(key)) return await fontLoading.get(key);
    const FontFaceCtor = window.FontFace;
    if (!FontFaceCtor || !document.fonts) return null;
    const job = async () => {
        try {
            const upperName = key.toUpperCase();
            const url = new URL(`fonts/${upperName}.ttf`, document.baseURI || location.href);
            const font = new FontFaceCtor(key, `url(${url.toString()})`);
            await font.load();
            document.fonts.add(font);
            fontFaces.set(key, font);
            return font;
        } catch (error) {
            console.warn(`Could not load fonts/${key}.ttf`, error);
            fontFaces.set(key, null);
            return null;
        }
    };
    const promise = job();
    fontLoading.set(key, promise);
    try {
        return await promise;
    } finally {
        fontLoading.delete(key);
    }
}
// Load unknownImg
const createImg = (src, alt = "") => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.onerror = () => {
        img.src = unknownImg;
    };
    return img;
};
//Load header/footer
async function loadComponent(id, file) {
    try {
        const response = await fetch(file);
        if (response.ok) {
            document.getElementById(id).outerHTML = await response.text();
        }
    } catch (error) {}
}
// Load the changelog
async function loadChangelog() {
    const path = window.location.pathname;
    const isIndex = path.endsWith('index.html') || path.endsWith('/');
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
        let htmlOutput = textOutput.trim().replace(/\*\*(.*?)\*\*/g, '<span>$1</span>').replace(/\n/g, '<br>');
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
            const formattedDesc = (font.description || '').replace(/\*\*(.*?)\*\*/g, '<span>$1</span>').replace(/\n/g, '<br>');
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
    try {
        const response = await fetch('./fonts/fonts.json');
        const fontList = await response.json();
        fontList.forEach(font => {
            scripts[font.name] = {
                name: font.name,
                description: font.description
            };
        });
    } catch (error) {
        console.error('Fonts.json:', error);
    }
    const ui = {
        select: document.getElementById('script-select'),
                          grid: document.getElementById('tile-grid'),
                          input: document.getElementById('output-area'),
                          visual: document.getElementById('output-grid'),
                          tileBGbutton: document.getElementById('toggle-bg-btn'),
                          toggleGridBtn: document.getElementById('toggle-grid-btn'),
                          backspaceBtn: document.getElementById('backspace-btn')
    };
    const applyScriptFont = (scriptKey) => {
        const family = cssFontFamily(scriptKey);
        ui.grid.style.setProperty('--script-font', family);
        ui.visual.style.setProperty('--script-font', family);
    };
    const hasFontGlyph = (scriptKey, char) => {
        try {
            return document.fonts.check(`32px "${scriptKey}"`, char);
        } catch (e) {
            return false;
        }
    };
    async function updateVisual() {
        const scriptKey = ui.select.value;
        if (!scripts[scriptKey]) return;
        await ensureScriptFont(scriptKey);
        applyScriptFont(scriptKey);
        const frag = document.createDocumentFragment();
        for (const char of ui.input.value.toUpperCase()) {
            if (char === ' ') {
                const spacer = document.createElement('div');
                spacer.style.display = 'inline-block';
                spacer.style.width = '20px';
                frag.appendChild(spacer);
                continue;
            }
            if (char === '\n') {
                const lineBreak = document.createElement('div');
                lineBreak.className = 'line-break';
                frag.appendChild(lineBreak);
                continue;
            }
            const isNumber = /[0-9]/.test(char);
            const isLetter = /[a-zA-Z]/.test(char);
            if (isLetter) {
                const glyph = document.createElement('span');
                glyph.className = 'glyph';
                glyph.style.fontFamily = `"${scriptKey}", sans-serif`;
                glyph.textContent = char;
                frag.appendChild(glyph);
            } else if (isNumber && hasFontGlyph(scriptKey, char)) {
                const glyph = document.createElement('span');
                glyph.className = 'glyph';
                glyph.style.fontFamily = `"${scriptKey}", sans-serif`;
                glyph.textContent = char;
                frag.appendChild(glyph);
            } else if (isNumber) {
                const defaultChar = document.createElement('span');
                defaultChar.className = 'glyph default-font-char';
                defaultChar.textContent = char;
                frag.appendChild(defaultChar);
            } else {
                frag.appendChild(createImg(unknownImg, char));
            }
        }
        ui.visual.innerHTML = '';
        ui.visual.appendChild(frag);
    }
    async function renderGrid() {
        const scriptKey = ui.select.value;
        if (!scripts[scriptKey]) return;
        await ensureScriptFont(scriptKey);
        applyScriptFont(scriptKey);
        ui.grid.innerHTML = '';
        [...GRID_CHARS].forEach(char => {
            const card = document.createElement('div');
            card.className = 'tile';
            const glyph = document.createElement('span');
            glyph.className = 'glyph-tile';
            glyph.style.fontFamily = `"${scriptKey}", sans-serif`;
            glyph.textContent = char;
            card.appendChild(glyph);
            const label = document.createElement('span');
            label.textContent = char;
            card.append(label);
            card.onclick = () => {
                ui.input.value += char;
                updateVisual();
            };
            ui.grid.appendChild(card);
        });
        await updateVisual();
    }
    ui.select.innerHTML = Object.keys(scripts).map(n => `<option value="${n}">${n}</option>`).join('');
    ui.select.onchange = () => renderGrid();
    ui.input.oninput = () => updateVisual();
    ui.backspaceBtn.addEventListener('click', () => {
        ui.input.value = ui.input.value.slice(0, -1);
        updateVisual();
    });
    ui.toggleGridBtn.addEventListener('click', () => {
        ui.grid.classList.toggle('hidden');
        ui.toggleGridBtn.textContent = ui.grid.classList.contains('hidden') ? 'Show Tiles' : 'Hide Tiles';
    });
    let bgState = 0;
    const states = [{
        label: "Change BG",
        classes: []
    }, {
        label: "BG: Black",
        classes: ["bg-black"]
    }, {
        label: "BG: White",
        classes: ["bg-black", "bg-invert"]
    }, {
        label: "BG: Green",
        classes: ["bg-green", "bg-invert"]
    }];
    ui.tileBGbutton.addEventListener('click', () => {
        bgState = (bgState + 1) % states.length;
        ui.visual.classList.remove('bg-black', 'bg-invert', 'bg-green');
        states[bgState].classes.forEach(cls => ui.visual.classList.add(cls));
        ui.tileBGbutton.textContent = states[bgState].label;
    });
    if (Object.keys(scripts).length > 0) {
        await renderGrid();
    }
});
