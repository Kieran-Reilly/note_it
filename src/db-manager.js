/**
 * @class DbManager - Manages the interaction between the indexDB and the application
 */
export class DbManager {
    #messageHandler
    #dbName = 'Notes';
    #dbVersion = 1;
    #dbStore = 'notes';

    #dbActionHandler;

    constructor() {
        this.#messageHandler = this.#receiveMessage.bind(this)
        this.#dbActionHandler = this.#processDbAction.bind(this);
        window.addEventListener("dbAction", this.#dbActionHandler);
    }

    dispose() {
        this.#messageHandler = null;
        this.#dbName = null;
        this.#dbVersion = null;
        this.#dbName = null;
        window.removeEventListener("dbAction", this.#dbActionHandler);
        this.#dbActionHandler = null;
    }

    async #processDbAction(event) {
        await this.#sendMessage({action: event.detail.action, name: this.#dbName, version: this.#dbVersion, store: this.#dbStore, ...event.detail?.params})
    }

    async #sendMessage(params) {
        if (window.Worker) {
            const dbWorker = new Worker("./src/db-worker.js");
            dbWorker.onmessage = this.#messageHandler;
            dbWorker.postMessage(params);
        } else {
            console.error("Your browser doesn't support web workers");
        }
    }

    async #receiveMessage(event) {
        window.dispatchEvent(new CustomEvent('dbActionComplete', {detail: {action: event.data.operation, result: event.data.result, messageData: event.data.messageData}}));
    }
}