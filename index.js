import {DbManager} from "./src/db-manager.js";

/**
 * @class ApplicationRunner - Responsible for application init & running
 *
 * Responsibilities:
 * - Fetch the initial data from indexDB on start and load it into the notes-list component
 * - Listen for the clicked event on the new note button & handle the event by launching the note-editor component in create state
 *
 * @property {Function} #newNoteHandler - Handler for the new note button click event
 * @property {HTMLElement} #newNoteButton - The new note button
 *
 */
export default class ApplicationRunner {
    #newNoteHandler;
    #newNoteButton;
    #dbManager;

    constructor() {
        this.#init();
    }

    dispose() {
        this.#dbManager = this.#dbManager.dispose();
        this.#newNoteButton.removeEventListener('click', this.#newNoteHandler);
        this.#newNoteHandler = null;
        this.#newNoteButton = null;
    }

    async #init() {
        await this.#initDbManager();
        this.#newNoteHandler = this.#newNote.bind(this);
        this.#newNoteButton = document.getElementById('new-note');
        this.#newNoteButton.addEventListener('click', this.#newNoteHandler);
    }

    async #initDbManager() {
        this.#dbManager = new DbManager();
    }

    async #newNote(event) {
        //first check if the noteEditor is already there in create state
        const noteEditor = document.querySelector('note-editor[state="create"]');
        if (noteEditor) {
            return;
        }

        //launches the note-editor component in create state
        await import ("./components/note-editor/note-editor.js").then(() => {
            const noteEditor = document.createElement('note-editor');
            noteEditor.setAttribute('state', 'create');
            this.#newNoteButton.after(noteEditor);
        });
    }
}