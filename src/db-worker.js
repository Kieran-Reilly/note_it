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
    async #transact(params, callback) {
        const store = params.store;

        return new Promise(async (resolve, reject) => {
            const transaction = this.#db.transaction([store], "readwrite");
            const objectStore = transaction.objectStore(store);

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
        return await this.#transact(params, async (objectStore) => {
            return await objectStore.add({id: params.id, title: params.title, note: params.note});
        });
    }

    /**
     * Delete operation on the indexedDB
     * @param params
     * @returns {Promise<void>}
     */
    async delete(params) {
        return await this.#transact(params, async (objectStore) => {
            return await objectStore.delete(Number.isInteger(params.id) ? params.id : parseInt(params.id));
        });
    }

    /**
     * Fetch operation on the indexedDB
     * @param params
     * @returns {Promise<void>}
     */
    async get(params) {
        return await this.#transact(params, async (objectStore) => {
            return await objectStore.get(Number.isInteger(params.id) ? params.id : parseInt(params.id));
        });
    }

    /**
     * Fetch all operation on the indexedDB
     * @param params
     */
    async getAll(params) {
        const store = params.store;
        const notes = [];

        return new Promise(async (resolve, reject) => {
            const transaction = this.#db.transaction([store], "readwrite");
            const objectStore = transaction.objectStore(store);
            const request = objectStore.openCursor();

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    notes.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve({target: {result: notes}});
                }
            }
            request.onerror = (event) => {
                console.error("Error retrieving notes", event);
                reject(event);
            }
        })
    }

    /**
     * Update operation on the indexedDB
     * @param params
     * @returns {Promise<void>}
     */
    async put(params) {
        return await this.#transact(params, async (objectStore) => {
            return await objectStore.put({id: params.id, title: params.title, note: params.note});
        });
    }

    async onMessage(message) {
        await this.#openDB(message);

        if (message.data.action != null && this[message.data.action] != null) {
            const transactionResult = await this[message.data.action](message.data);
            this.#db = null;
            postMessage({operation: message.data.action, result: transactionResult.target.result, messageData: message.data});
        }
    }
}

const dbWorker = new DbWorker()

onmessage = async function (message) {
    await dbWorker.onMessage(message);
}