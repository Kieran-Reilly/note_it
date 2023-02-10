/**
 * @class NoteEditor - a custom element for capturing and editing notes
 *
 */
class NoteEditor extends HTMLElement {
    #id;
    #titleInput;
    #noteInput;
    #clickHandler = this.#click.bind(this);
    #actions = Object.freeze({
        "save": this.#save.bind(this),
        "close": this.#close.bind(this),
        "delete": this.#delete.bind(this)
    });

    #title;
    #note;

    get id() {
        return this.#id;
    }

    set id(newValue) {
        this.#id = newValue;
    }

    get title() {
        return this.#title;
    }

    set title(newValue) {
        this.#title = newValue;
        if (this.#titleInput) this.#titleInput.value = newValue;
    }

    get note() {
        return this.#note;
    }

    set note(newValue) {
        this.#note = newValue;
        if (this.#noteInput) this.#noteInput.value = newValue;
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
        this.#title = null;
        this.#note = null;
    }

    async #load() {
        return new Promise(resolve => {
            requestAnimationFrame( async () => {
                this.#titleInput = this.shadowRoot.getElementById("title");
                this.#noteInput = this.shadowRoot.getElementById("note");
                if (this.#title) this.#titleInput.value = this.#title;
                if (this.#note) this.#noteInput.value = this.#note;
                this.shadowRoot.addEventListener("click", this.#clickHandler);
                resolve();
            })
        })
    }

    async #click(event) {
        const action = event.target.dataset.action;
        this.#actions[action]?.(event);
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

        if (this.#id != null) {
            window.dispatchEvent(new CustomEvent("dbAction", {detail: {action: "put", params: {id: this.#id, title, note}}}));
        } else {
            window.dispatchEvent(new CustomEvent("dbAction", {detail: {action: "add", params: {id: Date.now(), title, note}}}));
            this.remove();
        }
    }

    async #close(event) {
        this.remove();
    }

    async #delete(event) {
        window.dispatchEvent(new CustomEvent("dbAction", {detail: {action: "delete", params: {id: this.#id}}}));
        this.remove();
    }
}

customElements.define('note-editor', NoteEditor);