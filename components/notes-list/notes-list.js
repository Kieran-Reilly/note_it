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
    #data;

    #actions = Object.freeze({
        "edit": this.#edit.bind(this),
        "delete": this.#delete.bind(this)
    })

    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get data() {
        return this.#data;
    }

    set data(newValue) {
        this.#data = newValue;
        this.#render();
    }

    get ready() {
        return this.getAttribute("ready") === "true";
    }

    set ready(newValue) {
        this.setAttribute("ready", newValue);
        if (newValue) {
            this.dispatchEvent(new CustomEvent("ready"));
        }
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
        this.#data = null;
    }

    async #load() {
        return new Promise(resolve => {
            requestAnimationFrame( async () => {
                this.shadowRoot.addEventListener("click", this.#clickHandler);
                if (this.data != null) {
                    await this.#render();
                }
                this.ready = true;
                resolve();
            })
        })
    }

    async #click(event) {
        const action = event.target.dataset.action;
        this.#actions[action]?.(event);
    }

    /**
     * Edit handler. Will launch the note-editor component in edit mode in place of the selected note-list item
     * @param event
     * @returns {Promise<void>}
     */
    async #edit(event) {
        console.log("edit");
    }

    /**
     * Delete handler. Will remove the selected note-list item from the list and the db
     * @param event
     * @returns {Promise<void>}
     */
    async #delete(event) {
        console.log("delete");
    }

    async #render() {

    }
}

customElements.define('notes-list', NotesList);