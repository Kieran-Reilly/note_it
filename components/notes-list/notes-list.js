/**
 * @class NotesList - Maintains a list of notes taken within an unordered list
 *
 * Features:
 *  - Accepts a list of notes to be displayed
 *  - Allows the user to click on a note to launch the note-editor component in edit state
 *  - Allows the user to delete a note
 *  - Allows for notes to be added to the list
 *  - When a note is being edited, will hide the note list item and display the note-editor component in its place
 */
class NotesList extends HTMLElement {
    #clickHandler = this.#click.bind(this);

    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    async connectedCallback() {
        this.shadowRoot.innerHTML = await fetch(this.html).then(result => result.text());
        await this.#load();
    }

    async disconnectedCallback() {
        this.shadowRoot.removeEventListener("click", this.#clickHandler);
        this.#clickHandler = null
        this.#actions = null;
        this.#id = null;
        this.#titleInput = null;
        this.#noteInput = null;
    }

    async #load() {
        return new Promise(resolve => {
            requestAnimationFrame( async () => {
                this.#titleInput = this.shadowRoot.getElementById("title");
                this.#noteInput = this.shadowRoot.getElementById("note");
                this.shadowRoot.addEventListener("click", this.#clickHandler);
                resolve();
            })
        })
    }

    async #click(event) {

    }
}

customElements.define('notes-list', NotesList);