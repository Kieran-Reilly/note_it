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

    async initDb(params) {
        postMessage({isValid: params.isValid});
    }

    /**
     * Add operation on the indexedDb
     * @param params
     * @returns {Promise<void>}
     */
    async add(params) {
        await this.#transact(async (objectStore) => {
            return await objectStore.add({id: params.id, title: params.title, note: params.note});
        }).then((event) => {
            postMessage({operation: 'save', id: params.id});
        }).catch((event) => {
            console.error("Error executing add operation", event);
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

    }

    /**
     * Update operation on the indexedDB
     * @param params
     * @returns {Promise<void>}
     */
    async put(params) {

    }

    /**
     * Default work operation, simply initializes the db
     * @param params
     * @returns {Promise<void>}
     */
    async default(params) {
        // await this.#openDB({data: params});
    }

    async onMessage(message) {
        if (message.data.action != null && this[message.data.action] !== null) {
            await this.#openDB(message);
            await this[message.data.action](message.data);
        } else {
            await this.default(message.data);
        }
    }
}

const dbWorker = new DbWorker()

onmessage = async function (message) {
    await dbWorker.onMessage(message);
}