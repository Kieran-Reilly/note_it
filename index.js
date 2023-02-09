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
    #dbManager;

    #newNoteButton;
    #newNoteHandler = this.#newNote.bind(this);

    #notesList;
    #notesListReadyHandler = this.#notesListReady.bind(this);

    constructor() {
        this.#init();
    }

    dispose() {
        this.#dbManager = this.#dbManager.dispose();
        this.#newNoteButton.removeEventListener('click', this.#newNoteHandler);
        this.#newNoteHandler = null;
        this.#newNoteButton = null;
        this.#notesList.removeEventListener('ready', this.#notesListReadyHandler);
        this.#notesListReadyHandler = null;
        this.#notesList = null;
    }

    async #init() {
        await this.#initDbManager();
        await this.#initNewNote();
        await this.#initNotesList();
    }

    async #initDbManager() {
        this.#dbManager = new DbManager();
        window.dispatchEvent(new CustomEvent('dbAction', {detail: {action:  "initDb"}}));
    }

    async #initNewNote() {
        this.#newNoteButton = document.getElementById('new-note');
        this.#newNoteButton.addEventListener('click', this.#newNoteHandler);
    }

    async #initNotesList() {
        this.#notesList = document.getElementById('notes-list');
        this.#notesList.addEventListener('ready', this.#notesListReadyHandler);
        await import ("./components/notes-list/notes-list.js");
    }

    async #notesListReady() {
        console.log("notes list ready");
        //fetch the notes from indexDB and pass that to the notes-list component
        window.dispatchEvent(new CustomEvent('dbAction', {detail: {action:  "getAll"}}));
    }

    async #newNote(event) {
        //first check if the noteEditor is already there in create state
        const noteEditor = document.querySelector('note-editor[data-state="create"]');
        if (noteEditor) {
            return;
        }

        //launches the note-editor component in create state
        await import ("./components/note-editor/note-editor.js").then(() => {
            const noteEditor = document.createElement('note-editor');
            noteEditor.setAttribute('data-state', 'create');
            this.#newNoteButton.after(noteEditor);
        });
    }
}