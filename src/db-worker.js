class DbWorker {
    async #openDB(message) {
        const name = message.data.name;
        const version = message.data.version;
        const action = message.data.action;

        const request = indexedDB.open(name, version);
        request.onerror = (event) => {
            const error = `Error opening the database: '${name}'`
            console.error(error);
            this[action] != null && this[action]({isValid: false, error: error, data: message.data});
        }
        request.onsuccess = (event) => {
            this[action] != null && this[action]({isValid: true, event: event, data: message.data});
        }
        request.onupgradeneeded = (event) => {
            let db = event.target.result;
            db.createObjectStore("notes", {keyPath: "id", autoIncrement: true});
            db = null;
        }
    }

    async initDb(params) {
        postMessage({isValid: params.isValid});
    }

    async deleteNote(params) {

    }

    async fetchNotes(params) {

    }

    async fetchNote(params) {

    }

    async saveNote(params) {
        console.log("attempting to save note to db", params);
        if (params.isValid) {
            const db = params.event.target.result;
            const transaction = db.transaction(["notes"], "readwrite");
            const objectStore = transaction.objectStore("notes");
            const request = objectStore.add({id: params.data.id, title: params.data.title, note: params.data.note});

            request.onsuccess = function(event) {
                console.log("Data added successfully");
                //TODO KR: post message to main thread to update UI
            };

            request.onerror = function(event) {
                console.error("Error adding data", event);
            };
        }
    }

    async default(params) {
        this.initDb(params);
    }

    async onMessage(message) {
        if (message.data.action != null && this[message.data.action] !== null) {
            await this.#openDB(message);
        } else {
            await this.default(message.data);
        }
    }
}

const dbWorker = new DbWorker()

onmessage = async function (message) {
    await dbWorker.onMessage(message);
}