const scriptData = {
    "Solaris Script": [
        { char: 'Q', img: 'https://placehold.co/100x100/transparent/FFF?text=Q' },
        { char: 'W', img: 'https://placehold.co/100x100/transparent/FFF?text=W' },
        { char: 'E', img: 'img/solaris/e.png' },
        { char: 'R', img: 'https://placehold.co/100x100/transparent/FFF?text=R' },
        { char: 'T', img: 'https://placehold.co/100x100/transparent/FFF?text=T' },
        { char: 'Y', img: 'https://placehold.co/100x100/transparent/FFF?text=Y' },
        { char: 'U', img: 'https://placehold.co/100x100/transparent/FFF?text=U' },
        { char: 'I', img: 'https://placehold.co/100x100/transparent/FFF?text=I' },
        { char: 'O', img: 'https://placehold.co/100x100/transparent/FFF?text=O' },
        { char: 'P', img: 'https://placehold.co/100x100/transparent/FFF?text=P' },
        { char: 'A', img: 'img/solaris/a.png' },
        { char: 'S', img: 'https://placehold.co/100x100/transparent/FFF?text=S' },
        { char: 'D', img: 'img/solaris/d.png' },
        { char: 'F', img: 'https://placehold.co/100x100/transparent/FFF?text=F' },
        { char: 'G', img: 'https://placehold.co/100x100/transparent/FFF?text=G' },
        { char: 'H', img: 'https://placehold.co/100x100/transparent/FFF?text=H' },
        { char: 'J', img: 'https://placehold.co/100x100/transparent/FFF?text=J' },
        { char: 'K', img: 'https://placehold.co/100x100/transparent/FFF?text=K' },
        { char: 'L', img: 'https://placehold.co/100x100/transparent/FFF?text=L' },
        { char: 'Z', img: 'https://placehold.co/100x100/transparent/FFF?text=Z' },
        { char: 'X', img: 'https://placehold.co/100x100/transparent/FFF?text=X' },
        { char: 'C', img: 'img/solaris/c.png' },
        { char: 'V', img: 'https://placehold.co/100x100/transparent/FFF?text=V' },
        { char: 'B', img: 'img/solaris/b.png' },
        { char: 'N', img: 'https://placehold.co/100x100/transparent/FFF?text=N' },
        { char: 'M', img: 'https://placehold.co/100x100/transparent/FFF?text=M' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const scriptSelect = document.getElementById('script-select');
    const imageGrid = document.getElementById('image-grid');
    const outputArea = document.getElementById('output-area');
    const visualOutput = document.getElementById('visual-output');

    function init() {
        scriptSelect.innerHTML = '';
        Object.keys(scriptData).forEach(scriptName => {
            const option = document.createElement('option');
            option.value = scriptName;
            option.textContent = scriptName;
            scriptSelect.appendChild(option);
        });
        renderGrid(Object.keys(scriptData)[0]);
    }

    // Function to rebuild the visual sequence based on what is in the textarea
    function updateVisualFromText() {
        visualOutput.innerHTML = '';
        const currentScript = scriptSelect.value;
        const alphabet = scriptData[currentScript];
        const text = outputArea.value;

        // Loop through each character typed
        for (let char of text) {
            // Find the corresponding image in our data (case-insensitive for Latin)
            const match = alphabet.find(item => item.char.toUpperCase() === char.toUpperCase());

            if (match) {
                const visualImg = document.createElement('img');
                visualImg.src = match.img;
                visualOutput.appendChild(visualImg);
            } else if (char === ' ') {
                // Add a spacer for spaces
                const spacer = document.createElement('div');
                spacer.style.width = '20px';
                visualOutput.appendChild(spacer);
            }
        }
    }

    function renderGrid(scriptName) {
        imageGrid.innerHTML = '';
        const items = scriptData[scriptName];

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
                updateVisualFromText(); // Trigger redraw
                outputArea.scrollTop = outputArea.scrollHeight;
            });

            imageGrid.appendChild(card);
        });

        // Refresh visuals if script changes while text is present
        updateVisualFromText();
    }

    // LISTENER 1: When user types or deletes in the text box
    outputArea.addEventListener('input', updateVisualFromText);

    // LISTENER 2: When user changes the language script
    scriptSelect.addEventListener('change', (e) => {
        renderGrid(e.target.value);
    });

    init();
});
