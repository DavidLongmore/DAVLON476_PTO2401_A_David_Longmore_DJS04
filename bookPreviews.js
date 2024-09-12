// bookpreviews.js

export class BookPreviews extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    set data({ books, authors }) {
        this.books = books;
        this.authors = authors;
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = '';
        this.books.forEach(({ author, id, image, title }) => {
            const button = document.createElement('button');
            button.setAttribute('class', 'preview');
            button.setAttribute('data-preview', id);
            button.innerHTML = `
                <img class="preview__image" src="${image}" />
                <div class="preview__info">
                    <h3 class="preview__title">${title}</h3>
                    <div class="preview__author">${this.authors[author]}</div>
                </div>
            `;
            this.shadowRoot.appendChild(button);
        });
    }
}

customElements.define('book-previews', BookPreviews);
