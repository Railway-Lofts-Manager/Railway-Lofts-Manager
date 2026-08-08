const DATABASE_NAME = "LoftCommanderDocuments";
const STORE_NAME = "documents";
const VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run(mode, action) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = action(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
  });
}

export function saveDocument(document) {
  return run("readwrite", (store) => store.put(document));
}

export function getDocument(documentId) {
  return run("readonly", (store) => store.get(documentId));
}

export function deleteDocument(documentId) {
  return run("readwrite", (store) => store.delete(documentId));
}

export function getAllDocuments() {
  return run("readonly", (store) => store.getAll());
}

export function clearDocuments() {
  return run("readwrite", (store) => store.clear());
}

export function restoreDocuments(documents = []) {
  return clearDocuments().then(async () => {
    for (const document of documents) await saveDocument(document);
  });
}
