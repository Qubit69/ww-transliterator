const scripts = {
    "Solaris": { folder: "solaris", chars: "QWERTYUIOPASDFGHJKLZXCVBNM[](),.:;/" }
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
    '#': 'hashtag'
};

const scriptData = {};

const createImg = (src, alt = "") => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    return img;
};

function getImagePath(char, folder) {
    const fileName = specialCharMap[char] || char.toLowerCase();
    return `img/${folder}/${fileName}.png`;
}

Object.entries(scripts).forEach(([name, { folder, chars }]) => {
    scriptData[name] = chars.split('').reduce((acc, char) => {
        acc[char.toUpperCase()] = { char, img: getImagePath(char, folder) };
        return acc;
    }, {});
});

document.addEventListener('DOMContentLoaded', () => {
    const scriptSelect = document.getElementById('script-select');
    const imageGrid = document.getElementById('image-grid');
    const outputArea = document.getElementById('output-area');
    const visualOutput = document.getElementById('visual-output');

    function init() {
        scriptSelect.innerHTML = Object.keys(scriptData)
        .map(name => `<option value="${name}">${name}</option>`).join('');
        renderGrid(scriptSelect.value);
    }

    function updateVisualFromText() {
        visualOutput.innerHTML = '';
        const alphabet = scriptData[scriptSelect.value];

        [...outputArea.value].forEach(char => {
            const upperChar = char.toUpperCase();

            if (alphabet[upperChar]) {
                visualOutput.appendChild(createImg(alphabet[upperChar].img));
            } else if (char === ' ') {
                const spacer = document.createElement('div');
                spacer.style.width = '20px';
                visualOutput.appendChild(spacer);
            } else {
                const charName = specialCharMap[char] || char;
                const img = createImg(`img/common/placeholders/${charName}.png`);
                img.onerror = function() {
                    this.src = 'img/common/placeholders/unknown.png';
                    this.onerror = null;
                };
                visualOutput.appendChild(img);
            }
        });
    }

    function renderGrid(scriptName) {
        imageGrid.innerHTML = '';
        Object.values(scriptData[scriptName]).forEach(item => {
            const card = document.createElement('div');
            card.className = 'letter-card';

            const label = document.createElement('span');
            label.className = 'letter-label';
            label.textContent = item.char;

            card.append(createImg(item.img, item.char), label);
            card.addEventListener('click', () => {
                outputArea.value += item.char;
                updateVisualFromText();
                outputArea.scrollTop = outputArea.scrollHeight;
            });

            imageGrid.appendChild(card);
        });
        updateVisualFromText();
    }

    outputArea.addEventListener('input', updateVisualFromText);
    scriptSelect.addEventListener('change', (e) => renderGrid(e.target.value));

    init();
});
