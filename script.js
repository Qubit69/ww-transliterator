const scriptData = {
    "Latin Alphabet": [
        { char: 'A', img: 'https://placehold.co/100x100?text=A' },
        { char: 'B', img: 'https://placehold.co/100x100?text=B' },
        { char: 'C', img: 'https://placehold.co/100x100?text=C' },
        { char: 'D', img: 'https://placehold.co/100x100?text=D' },
        { char: 'E', img: 'https://placehold.co/100x100?text=E' }
    ],
    "Greek Alphabet": [
        { char: 'α', img: 'https://placehold.co/100x100?text=Alpha' },
        { char: 'β', img: 'https://placehold.co/100x100?text=Beta' },
        { char: 'γ', img: 'https://placehold.co/100x100?text=Gamma' },
        { char: 'δ', img: 'https://placehold.co/100x100?text=Delta' }
    ],
    "Runes": [
        { char: 'ᚠ', img: 'https://placehold.co/100x100?text=Fehu' },
        { char: 'ᚢ', img: 'https://placehold.co/100x100?text=Uruz' },
        { char: 'ᚦ', img: 'https://placehold.co/100x100?text=Thurs' }
    ]
};

const scriptSelect = document.getElementById('script-select');
const imageGrid = document.getElementById('image-grid');
const outputArea = document.getElementById('output-area');

function init() {
    Object.keys(scriptData).forEach(scriptName => {
        const option = document.createElement('option');
        option.value = scriptName;
        option.textContent = scriptName;
        scriptSelect.appendChild(option);
    });
    renderGrid(Object.keys(scriptData)[0]);
}

function renderGrid(scriptName) {
    imageGrid.innerHTML = '';
    const items = scriptData[scriptName];

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'letter-card';
        card.dataset.char = item.char;

        const img = document.createElement('img');
        img.src = item.img;
        img.alt = item.char;

        const label = document.createElement('span');
        label.className = 'letter-label';
        label.textContent = item.char;

        card.appendChild(img);
        card.appendChild(label);

        card.addEventListener('click', () => {
            appendToText(item.char);
        });

        imageGrid.appendChild(card);
    });
}

function appendToText(char) {
    outputArea.value += char;
    outputArea.scrollTop = outputArea.scrollHeight;
}

function clearText() {
    outputArea.value = '';
}

scriptSelect.addEventListener('change', (e) => {
    renderGrid(e.target.value);
});

init();
