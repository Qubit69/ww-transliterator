const statuses = [
    'Unknown',
    'Undeciphered',
    'Filler text',
    'Partially deciphered',
    'Fully deciphered'
];

function escapeHtml(value) {
    return String(value).replace(/[&<>]/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    })[char]);
}

function setupImageViewer(container) {
    const dialog = document.createElement('dialog');
    dialog.className = 'ref-image-viewer';
    dialog.setAttribute('aria-label', 'Image preview');

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'ref-image-viewer-close btn btn-danger';
    closeButton.title = 'Close image';
    closeButton.setAttribute('aria-label', 'Close image');
    const closeIcon = document.createElement('img');
    closeIcon.src = new URL('../assets/images/del.svg', document.baseURI).href;
    closeIcon.className = 'btn-icon';
    closeIcon.alt = '';
    closeButton.appendChild(closeIcon);

    const image = document.createElement('img');
    image.alt = '';
    dialog.append(closeButton, image);
    document.body.appendChild(dialog);

    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
        image.removeAttribute('src');
    });
    container.addEventListener('click', event => {
        const button = event.target.closest('.ref-image-open');
        if (!button) return;
        const source = button.querySelector('img');
        image.src = source.src;
        image.alt = source.alt;
        dialog.showModal();
        closeButton.focus();
    });
}

function renderBody(entry) {
    if (!window.marked) throw new Error('The Markdown renderer failed to load.');
    const bodyBase = new URL('entries/', document.baseURI);
    const renderer = new window.marked.Renderer();
    renderer.html = ({ text }) => escapeHtml(text);
    const parsed = new DOMParser().parseFromString(
        window.marked.parse(entry.body, { renderer }),
        'text/html'
    );
    const allowedTags = new Set([
        'A', 'BLOCKQUOTE', 'BR', 'CODE', 'DEL', 'EM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
        'HR', 'IMG', 'LI', 'OL', 'P', 'PRE', 'STRONG', 'TABLE', 'TBODY', 'TD', 'TH',
        'THEAD', 'TR', 'UL'
    ]);

    function safeUrl(value, isImage) {
        try {
            const url = new URL(value, bodyBase);
            const protocols = isImage ? ['http:', 'https:'] : ['http:', 'https:', 'mailto:'];
            return protocols.includes(url.protocol) ? url.href : null;
        } catch {
            return null;
        }
    }

    function copySafeNodes(source, target) {
        source.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                target.appendChild(document.createTextNode(node.textContent));
                return;
            }
            if (node.nodeType !== Node.ELEMENT_NODE) return;

            if (node.tagName === 'IMG') {
                const src = safeUrl(node.getAttribute('src') || '', true);
                if (!src) return;
                const alt = node.getAttribute('alt') || '';
                const inTable = node.parentElement.closest('td, th');
                const titleParts = (node.getAttribute('title') || '').split(';').map(part => part.trim());
                const alignPart = titleParts.find(part => /^align=(left|center|right)$/i.test(part));
                const widthPart = titleParts.find(part => /^max-width=\d+(?:\.\d+)?(?:px|%)$/i.test(part));
                const align = alignPart ? alignPart.slice(6).toLowerCase() : 'center';
                const title = titleParts
                    .filter(part => part !== alignPart && part !== widthPart)
                    .join('; ')
                    .trim();
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'ref-image-open';
                if (inTable) {
                    if (align !== 'center') button.classList.add(`ref-image-${align}`);
                } else {
                    const figure = document.createElement('figure');
                    figure.className = `ref-image ref-image-${align}`;
                    figure.appendChild(button);
                    target.appendChild(figure);
                }
                button.setAttribute('aria-label', `View ${alt || entry.title} fullscreen`);
                const image = document.createElement('img');
                image.src = src;
                image.alt = alt;
                image.loading = 'lazy';
                if (title) image.title = title;
                if (widthPart) image.style.maxWidth = `min(100%, ${widthPart.slice(10)})`;
                image.addEventListener('error', () => {
                    button.closest('.ref-image')?.remove();
                    button.remove();
                }, { once: true });
                button.appendChild(image);
                if (inTable) target.appendChild(button);
                return;
            }

            if (!allowedTags.has(node.tagName)) {
                copySafeNodes(node, target);
                return;
            }

            const element = document.createElement(node.tagName.toLowerCase());
            if (node.tagName === 'CODE' && node.parentElement.tagName !== 'PRE') {
                element.className = 'ref-quote';
            }
            if (node.tagName === 'A') {
                const href = safeUrl(node.getAttribute('href') || '', false);
                if (href) element.href = href;
                const title = node.getAttribute('title');
                if (title) element.title = title;
            }
            copySafeNodes(node, element);
            if (node.tagName === 'P' && !element.hasChildNodes()) return;
            target.appendChild(element);
        });
    }

    const safeBody = document.createElement('div');
    copySafeNodes(parsed.body, safeBody);
    return safeBody.innerHTML;
}

function createReference(entry) {
    const statusIndex = entry.status;
    const status = statuses[statusIndex];
    const tagsList = entry.tags;
    const card = document.createElement('article');
    card.className = 'ref-card';
    card.dataset.search = `${entry.title} ${entry.desc || ''} ${status} ${tagsList.join(' ')}`.toLowerCase();

    const title = document.createElement('h2');
    title.textContent = entry.title;
    card.appendChild(title);

    if (entry.desc) {
        const description = document.createElement('p');
        description.className = 'ref-desc';
        description.textContent = entry.desc;
        card.appendChild(description);
    }

    const metadata = document.createElement('div');
    metadata.className = 'ref-meta';
    const statusLabel = document.createElement('span');
    statusLabel.className = `ref-status status-${statusIndex}`;
    statusLabel.textContent = status;
    metadata.appendChild(statusLabel);
    card.appendChild(metadata);

    if (tagsList.length) {
        const tags = document.createElement('div');
        tags.className = 'ref-tags';
        tagsList.forEach(tag => {
            const label = document.createElement('span');
            label.className = tag === 'WIP' ? 'ref-tag ref-tag-wip' : 'ref-tag';
            label.textContent = tag;
            tags.appendChild(label);
        });
        card.appendChild(tags);
    }

    const body = document.createElement('div');
    body.className = 'ref-body';
    body.innerHTML = renderBody(entry);
    body.querySelectorAll('p').forEach(paragraph => {
        if (!paragraph.textContent.trim() && !paragraph.children.length) paragraph.remove();
    });
    card.appendChild(body);
    return card;
}

// Load references
async function loadReferences() {
    const container = document.getElementById('ref-container');
    const searchInput = document.getElementById('ref-search');
    if (!container || !searchInput) return;
    try {
        const response = await fetch('../data/references.json');
        if (!response.ok) throw new Error(`ref json invalid ${response.status}`);
        const references = await response.json();
        if (!Array.isArray(references) || references.some(entry =>
            !entry || typeof entry.title !== 'string' || typeof entry.body !== 'string' ||
            !/^[\w.-]+\.md$/.test(entry.body) || typeof entry.desc !== 'string' ||
            ![0, 1].includes(entry.show) ||
            !Number.isInteger(entry.status) || entry.status < 0 || entry.status >= statuses.length ||
            !Array.isArray(entry.tags) ||
            entry.tags.some(tag => typeof tag !== 'string')
        )) {
            throw new Error('ref json invalid');
        }

        const entries = await Promise.all(references.filter(entry => entry.show === 1).map(async entry => {
            const bodyResponse = await fetch(`./entries/${encodeURIComponent(entry.body)}`);
            if (!bodyResponse.ok) throw new Error(`Could not load ${entry.body}: ${bodyResponse.status}`);
            return { ...entry, body: await bodyResponse.text() };
        }));

        const cards = entries.map(createReference);
        container.replaceChildren(...cards);
        setupImageViewer(container);
        searchInput.oninput = () => {
            const query = searchInput.value.toLowerCase().trim();
            cards.forEach(card => {
                card.hidden = !card.dataset.search.includes(query);
            });
        };
    } catch (error) {
        console.error('This should not happen unless i made a typo in references.json which can happen sorry', error);
        container.textContent = 'Woops, something went wrong while loading the references. Please make a issue on Github.';
    }
}

document.addEventListener('DOMContentLoaded', loadReferences);
