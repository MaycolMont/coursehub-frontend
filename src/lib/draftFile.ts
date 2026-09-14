// Persistencia del archivo del borrador de "Subir recurso" usando IndexedDB.
// A diferencia de sessionStorage (que solo guarda texto), aquí se puede guardar
// un objeto File completo para que el progreso no se pierda tras iniciar sesión,
// registrarse o refrescar la página.

const DB_NAME = 'coursehub'
const DB_VERSION = 1
const STORE = 'drafts'
const DRAFT_FILE_KEY = 'subir_recurso'

let dbPromise: Promise<IDBDatabase> | null = null

function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

export async function saveDraftFile(file: File): Promise<void> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(file, DRAFT_FILE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadDraftFile(): Promise<File | null> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(DRAFT_FILE_KEY)
    req.onsuccess = () => resolve((req.result as File | undefined) ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function removeDraftFile(): Promise<void> {
  const db = await getDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(DRAFT_FILE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}