const scriptData = {
    "Solaris Script": [
        { char: 'A', img: 'img/solaris/a.png' },
        { char: 'B', img: 'img/solaris/b.png' },
        { char: 'C', img: 'img/solaris/c.png' },
        { char: 'D', img: 'img/solaris/d.png' },
        { char: 'E', img: 'img/solaris/e.png' },
        { char: 'F', img: 'https://placehold.co/100x100?text=E' },
        { char: 'G', img: 'https://placehold.co/100x100?text=E' },
        { char: 'H', img: 'https://placehold.co/100x100?text=E' },
        { char: 'I', img: 'https://placehold.co/100x100?text=E' },
        { char: 'J', img: 'https://placehold.co/100x100?text=E' },
        { char: 'K', img: 'https://placehold.co/100x100?text=E' },
        { char: 'L', img: 'https://placehold.co/100x100?text=E' },
        { char: 'M', img: 'https://placehold.co/100x100?text=E' },
        { char: 'N', img: 'https://placehold.co/100x100?text=E' },
        { char: 'O', img: 'https://placehold.co/100x100?text=E' },
        { char: 'P', img: 'https://placehold.co/100x100?text=E' },
        { char: 'Q', img: 'https://placehold.co/100x100?text=E' },
        { char: 'R', img: 'https://placehold.co/100x100?text=E' },
        { char: 'S', img: 'https://placehold.co/100x100?text=E' },
        { char: 'T', img: 'https://placehold.co/100x100?text=E' },
        { char: 'U', img: 'https://placehold.co/100x100?text=E' },
        { char: 'V', img: 'https://placehold.co/100x100?text=E' },
        { char: 'W', img: 'https://placehold.co/100x100?text=E' },
        { char: 'X', img: 'https://placehold.co/100x100?text=E' },
        { char: 'Y', img: 'https://placehold.co/100x100?text=E' },
        { char: 'Z', img: 'https://placehold.co/100x100?text=E' },

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

document.addEventListener('DOMContentLoaded', () => {
    const scriptSelect = document.getElementById('script-select');
    const imageGrid = document.getElementById('image-grid');
    const outputArea = document.getElementById('output-area');

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

    scriptSelect.addEventListener('change', (e) => {
        renderGrid(e.target.value);
    });


    init();
});
