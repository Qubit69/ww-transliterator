// On fonts page load fonts
async function loadFonts() {
    const container = document.getElementById('font-container');
    if (!container) return;
    try {
        const response = await fetch('../data/fonts.json');
        if (!response.ok) throw new Error(`fonts.json failed to load: ${response.status}`);
        const fonts = await response.json();
        container.replaceChildren();

        // Simple filter
        let searchInput = document.getElementById('font-search');
        if (!searchInput) {
            searchInput = document.createElement('input');
            searchInput.type = 'search';
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
            const preview = document.createElement('img');
            // using svg cuz why not
            preview.src = `../assets/images/fonts/${upperName}.svg`;
            preview.alt = '';
            preview.addEventListener('error', () => { preview.hidden = true; }, { once: true });

            const content = document.createElement('div');
            content.className = 'banner-image-box-content';
            const title = document.createElement('strong');
            title.className = 'banner-image-box-title';
            title.textContent = font.name;
            const description = document.createElement('p');
            description.className = 'banner-image-box-desc';
            appendDescription(description, font.description || '');
            const download = document.createElement('a');
            download.href = `../assets/fonts/${filename}`;
            download.download = filename;
            download.className = 'banner-image-box-link';
            download.textContent = 'Download';
            content.append(title, description, download);
            box.append(preview, content);
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
        container.textContent = 'fonts failed to load for some reason; Contact the developer';
    }
}

// Add description
function appendDescription(container, text) {
    let position = 0;
    for (const match of text.matchAll(/\*\*(.+?)\*\*|\n/g)) {
        container.appendChild(document.createTextNode(text.slice(position, match.index)));
        if (match[0] === '\n') {
            container.appendChild(document.createElement('br'));
        } else {
            const emphasis = document.createElement('span');
            emphasis.textContent = match[1];
            container.appendChild(emphasis);
        }
        position = match.index + match[0].length;
    }
    container.appendChild(document.createTextNode(text.slice(position)));
}

document.addEventListener('DOMContentLoaded', loadFonts);
