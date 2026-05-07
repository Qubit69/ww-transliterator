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

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const scriptSelect = document.getElementById('script-select');
    const imageGrid = document.getElementById('image-grid');
    const outputArea = document.getElementById('output-area');
    const clearBtn = document.getElementById('clear-btn');

    if (!scriptSelect || !imageGrid || !outputArea) {
        console.error("Could not find one or more required HTML elements.");
        return;
    }

    function init() {
        // Clear and populate dropdown
        scriptSelect.innerHTML = '';
        Object.keys(scriptData).forEach(scriptName => {
            const option = document.createElement('option');
            option.value = scriptName;
            option.textContent = scriptName;
            scriptSelect.appendChild(option);
        });

        // Load the first script by default
        renderGrid(Object.keys(scriptData)[0]);
    }

    function renderGrid(scriptName) {
        imageGrid.innerHTML = '';
        const items = scriptData[scriptName];

        if (!items) return;

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'letter-card';

            const img = document.createElement('img');
            img.src = item.img;
            img.alt = item.char;

            const label = document.createElement('span');
            label.className = 'letter-label';
            label.textContent = item.char;

            card.appendChild(img);
            card.appendChild(label);

            card.addEventListener('click', () => {
                outputArea.value += item.char;
                outputArea.scrollTop = outputArea.scrollHeight;
            });

            imageGrid.appendChild(card);
        });
    }

    // Listen for dropdown changes
    scriptSelect.addEventListener('change', (e) => {
        renderGrid(e.target.value);
    });

    // Clear button logic
    clearBtn.addEventListener('click', () => {
        outputArea.value = '';
    });

    init();
});
