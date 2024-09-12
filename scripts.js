import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';
import './bookPreviews.js'; // Import the custom element

let page = 1;
let matches = books;

/** Utility Functions **/

// Append a list of elements to a parent
function appendElements(parent, elements) {
    const fragment = document.createDocumentFragment();
    elements.forEach(element => fragment.appendChild(element));
    parent.appendChild(fragment);
}

/** Specific UI Generation Functions **/

// Generate options for a dropdown
function createOptions(data, defaultOptionText) {
    const options = [createElement('option', { value: 'any' }, defaultOptionText)];
    for (const [id, name] of Object.entries(data)) {
        options.push(createElement('option', { value: id }, name));
    }
    return options;
}

/** Theme Handling **/

// Set the theme based on user preference
function applyTheme() {
    const prefersDarkScheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDarkScheme ? 'night' : 'day';
    document.querySelector('[data-settings-theme]').value = theme;

    const colorDark = theme === 'night' ? '255, 255, 255' : '10, 10, 20';
    const colorLight = theme === 'night' ? '10, 10, 20' : '255, 255, 255';

    document.documentElement.style.setProperty('--color-dark', colorDark);
    document.documentElement.style.setProperty('--color-light', colorLight);
}

/** Event Listeners **/

// Setup all event listeners
function setupEventListeners() {
    document.querySelector('[data-search-cancel]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = false;
    });

    document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = false;
    });

    document.querySelector('[data-header-search]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = true;
        document.querySelector('[data-search-title]').focus();
    });

    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = true;
    });

    document.querySelector('[data-list-close]').addEventListener('click', () => {
        document.querySelector('[data-list-active]').open = false;
    });

    document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const { theme } = Object.fromEntries(formData);
        document.querySelector('[data-settings-theme]').value = theme;
        applyTheme();
        document.querySelector('[data-settings-overlay]').open = false;
    });

    document.querySelector('[data-search-form]').addEventListener('submit', handleSearch);

    document.querySelector('[data-list-button]').addEventListener('click', handleShowMore);

    document.querySelector('[data-list-items]').addEventListener('click', handleBookClick);
}

/** Handlers **/

// Handle search submissions
function handleSearch(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    matches = books.filter(book => {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;
        return genreMatch && titleMatch && authorMatch;
    });

    page = 1;
    const bookPreviewList = document.createElement('book-previews');
    bookPreviewList.data = { books: matches.slice(0, BOOKS_PER_PAGE), authors };
    document.querySelector('[data-list-items]').innerHTML = '';
    document.querySelector('[data-list-items]').appendChild(bookPreviewList);

    const listButton = document.querySelector('[data-list-button]');
    listButton.disabled = matches.length <= BOOKS_PER_PAGE;
    listButton.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${Math.max(matches.length - BOOKS_PER_PAGE, 0)})</span>
    `;

    if (matches.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show');
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]').open = false;
}

// Handle show more button click
function handleShowMore() {
    const start = page * BOOKS_PER_PAGE;
    const end = (page + 1) * BOOKS_PER_PAGE;
    const bookPreviewList = document.createElement('book-previews');
    bookPreviewList.data = { books: matches.slice(start, end), authors };
    document.querySelector('[data-list-items]').appendChild(bookPreviewList);
    page += 1;

    const listButton = document.querySelector('[data-list-button]');
    listButton.disabled = matches.length <= end;
    listButton.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${Math.max(matches.length - end, 0)})</span>
    `;
}

// Handle book click event
function handleBookClick(event) {
    const pathArray = Array.from(event.composedPath());
    const active = pathArray.find(node => node.dataset?.preview)?.dataset.preview;
    const book = books.find(book => book.id === active);

    if (book) {
        document.querySelector('[data-list-active]').open = true;
        document.querySelector('[data-list-blur]').src = book.image;
        document.querySelector('[data-list-image]').src = book.image;
        document.querySelector('[data-list-title]').innerText = book.title;
        document.querySelector('[data-list-subtitle]').innerText = `${authors[book.author]} (${new Date(book.published).getFullYear()})`;
        document.querySelector('[data-list-description]').innerText = book.description;
    }
}

/** Initialization **/

// Initialize the app by rendering initial UI and setting up event listeners
function initialize() {
    // Initial Book Previews
    const bookPreviewList = document.createElement('book-previews');
    bookPreviewList.data = { books: matches.slice(0, BOOKS_PER_PAGE), authors };
    document.querySelector('[data-list-items]').appendChild(bookPreviewList);

    // Genre Options
    const genreOptions = createOptions(genres, 'All Genres');
    appendElements(document.querySelector('[data-search-genres]'), genreOptions);

    // Author Options
    const authorOptions = createOptions(authors, 'All Authors');
    appendElements(document.querySelector('[data-search-authors]'), authorOptions);

    // Apply Theme
    applyTheme();

    // Setup Event Listeners
    setupEventListeners();
}

// Start the app
initialize();
