const scriptData = {
    "Solaris Script": [
        { char: 'Q', img: 'img/solaris/q.png' },
        { char: 'W', img: 'img/solaris/w.png' },
        { char: 'E', img: 'img/solaris/e.png' },
        { char: 'R', img: 'img/solaris/r.png' },
        { char: 'T', img: 'img/solaris/t.png' },
        { char: 'Y', img: 'img/solaris/y.png' },
        { char: 'U', img: 'img/solaris/u.png' },
        { char: 'I', img: 'img/solaris/i.png' },
        { char: 'O', img: 'img/solaris/o.png' },
        { char: 'P', img: 'img/solaris/p.png' },
        { char: 'A', img: 'img/solaris/a.png' },
        { char: 'S', img: 'img/solaris/s.png' },
        { char: 'D', img: 'img/solaris/d.png' },
        { char: 'F', img: 'img/solaris/f.png' },
        { char: 'G', img: 'img/solaris/g.png' },
        { char: 'H', img: 'img/solaris/h.png' },
        { char: 'J', img: 'img/solaris/j.png' },
        { char: 'K', img: 'img/solaris/k.png' },
        { char: 'L', img: 'img/solaris/l.png' },
        { char: 'Z', img: 'img/solaris/z.png' },
        { char: 'X', img: 'img/solaris/x.png' },
        { char: 'C', img: 'img/solaris/c.png' },
        { char: 'V', img: 'img/solaris/v.png' },
        { char: 'B', img: 'img/solaris/b.png' },
        { char: 'N', img: 'img/solaris/n.png' },
        { char: 'M', img: 'img/solaris/m.png' },
        { char: '[', img: 'img/solaris/[.png' },
        { char: ']', img: 'img/solaris/].png' },
        { char: '(', img: 'img/solaris/(.png' },
        { char: ')', img: 'img/solaris/).png' },
        { char: ',', img: 'img/solaris/,.png' },
        { char: '.', img: 'img/solaris/dot.png' },
        { char: ':', img: 'img/solaris/double-dot.png' },
        { char: ';', img: 'img/solaris/semicolon.png' },
        { char: '/', img: 'img/solaris/slash.png' },
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
            else
            {
                const visualImg = document.createElement('img');
                visualImg.src = 'img/unknown.png'
                visualOutput.appendChild(visualImg);
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
