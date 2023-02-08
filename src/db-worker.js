class DbWorker {
    #db;

    /**
     * Opens the connection to the indexedDB
     * @param message
     * @returns {Promise<void>}
     */
    async #openDB(message) {
        const name = message.data.name;
        const version = message.data.version;
        const store = message.data.store;

        this.#db = await new Promise((resolve, reject) => {
            const request = indexedDB.open(name, version);
            request.onsuccess = (event) => {
                resolve(event.target.result);
            }
            request.onerror = (event) => {
                console.error(`Error opening connection to database: '${name}'`, event);
                reject(event);
            }
            request.onupgradeneeded = (event) => {
                let db = event.target.result;
                db.createObjectStore(store, {keyPath: "id", autoIncrement: true});
                db = null;
            }
        });
    }

    /**
     * Executes a transaction on the indexedDB
     * @param callback
     * @returns {Promise<unknown>}
     */
    async #transact(callback) {
        return new Promise(async (resolve, reject) => {
            const transaction = this.#db.transaction(["notes"], "readwrite");
            const objectStore = transaction.objectStore("notes");

            const request = await callback(objectStore);

            request.onsuccess = (event) => {
                resolve(event);
            }
            request.onerror = (event) => {
                reject(event);
            }
        });
    }

    /**
     * Add operation on the indexedDb
     * @param params
     * @returns {Promise<void>}
     */
    async add(params) {
        return await this.#transact(async (objectStore) => {
            return await objectStore.add({id: params.id, title: params.title, note: params.note});
        });
    }

    /**
     * Delete operation on the indexedDB
     * @param params
     * @returns {Promise<void>}
     */
    async delete(params) {

    }

    /**
     * Fetch operation on the indexedDB
     * @param params
     * @returns {Promise<void>}
     */
    async get(params) {
        return await this.#transact(async (objectStore) => {
            return await objectStore.get(params.id);
        });
    }

    /**
     * Fetch all operation on the indexedDB
     * @param params
     * @returns {Promise<void>}
     */
    async getAll(params) {
        if (params.ids != null) {
            const notes = [];
            const transactionResult = await this.#transact(async (objectStore) => {
                return await objectStore.openCursor();
            });
            console.log("transactionResult", transactionResult);

            const cursor = transactionResult.target.result;
            if (cursor) {
                notes.push(cursor.value);
                cursor.continue();
            }
        }
    }

    /**
     * Update operation on the indexedDB
     * @param params
     * @returns {Promise<void>}
     */
    async put(params) {

    }

    async onMessage(message) {
        await this.#openDB(message);

        if (message.data.action != null && this[message.data.action] != null) {
            const transactionResult = await this[message.data.action](message.data);
            this.#db = null;
            postMessage({operation: message.data.action, result: transactionResult.target.result});
        }
    }
}

const dbWorker = new DbWorker()

onmessage = async function (message) {
    await dbWorker.onMessage(message);
}