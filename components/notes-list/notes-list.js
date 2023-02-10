import "../note-editor/note-editor.js";

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
    #list;
    #listItemTemplate;
    #notesEditorTemplate;

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
        this.#list = null;
        this.#listItemTemplate = null;
        this.#notesEditorTemplate = null;
    }

    async #load() {
        return new Promise(resolve => {
            requestAnimationFrame( async () => {
                this.shadowRoot.addEventListener("click", this.#clickHandler);
                this.#list = this.shadowRoot.querySelector("ul");
                this.#listItemTemplate = this.shadowRoot.getElementById("list-item-template");
                this.#notesEditorTemplate = this.shadowRoot.getElementById("notes-editor-template");

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
        const id = event.target.id;
        window.dispatchEvent(new CustomEvent("dbAction", {detail: {action: "get", params: {id: id}}}));
    }

    /**
     * Delete handler. Will remove the selected note-list item from the list and the db
     * @param event
     * @returns {Promise<void>}
     */
    async #delete(event) {
        const id = event.target.parentElement.id;
        window.dispatchEvent(new CustomEvent("dbAction", {detail: {action: "delete", params: {id: id}}}));
    }

    async #render() {
        this.#list.innerHTML = "";

        for (const item of this.data) {
            await this.addItem(item.id, item.title);
        }
    }

    async addItem(id, title) {
        const listItem = this.#listItemTemplate.content.cloneNode(true);
        const li = listItem.querySelector("li");
        li.setAttribute('id', id);
        li.firstElementChild.innerText = title;
        this.#list.appendChild(listItem);
    }

    async removeItem(id) {
        const itemToRemove = this.#list.querySelector(`[id='${id}']`);
        if (itemToRemove) {
            this.#list.removeChild(itemToRemove);
        }
    }

    async editItem(id, title, note) {
        //clone the note-editor template
        //set the id, title, and note properties
        //replace the note-list item with the note-editor
        const noteEditorFrag = this.#notesEditorTemplate.content.cloneNode(true);
        const noteEditor = noteEditorFrag.firstElementChild

        const itemToReplace = this.#list.querySelector(`[id='${id}']`);
        if (itemToReplace) {
            this.#list.replaceChild(noteEditorFrag, itemToReplace);
            noteEditor.title = title;
            noteEditor.note = note;
            noteEditor.id = id;
        }
    }
}

customElements.define('notes-list', NotesList);