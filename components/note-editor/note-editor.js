/**
 * @class NoteEditor - a custom element for capturing and editing notes
 *
 */
class NoteEditor extends HTMLElement {
    #id;
    #titleInput;
    #noteInput;
    #clickHandler = this.#click.bind(this);
    #actions = {
        "save": this.#save.bind(this),
        "close": this.#close.bind(this),
        "delete": this.#delete.bind(this)
    }

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
        const id = event.target.id;
        this.#actions[id]?.(event);
    }

    async #save() {
        let title = this.#titleInput.value;
        const note = this.#noteInput.value;

        if (title.trim() === "" && note.trim() === "") {
            window.alert("Please enter a title or note");
            return;
        }

        if (title.trim() === "") {
            title = "Untitled Note";
        }

        const id = this.#id || Date.now();
        window.dispatchEvent(new CustomEvent("dbAction", {detail: {action: "saveNote", params: {id: id, title, note}}}));
    }

    async #close(event) {
        console.log("NoteEditor close");
        this.remove();
    }

    async #delete(event) {
        console.log("NoteEditor delete");
        window.dispatchEvent(new CustomEvent("dbAction", {detail: {action: "deleteName", params: {id: this.#id}}}));
        this.remove();
    }
}

customElements.define('note-editor', NoteEditor);