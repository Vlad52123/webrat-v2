const DB_NAME = "webrat_ui";
const STORE = "prefs";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

export function makeBgVideoDb(key: string) {
  const KEY = String(key || "bgVideo");

  const get = async (): Promise<Blob | null> => {
    try {
      const db = await openDb();
      return await new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE, "readonly");
          const st = tx.objectStore(STORE);
          const req = st.get(KEY);
          req.onsuccess = () => resolve((req.result as Blob | undefined) || null);
          req.onerror = () => resolve(null);
          tx.oncomplete = () => {
            try {
              db.close();
            } catch {
              return;
            }
          };
        } catch {
          try {
            db.close();
          } catch {
            return;
          }
          resolve(null);
        }
      });
    } catch {
      return null;
    }
  };

  const set = async (blob: Blob): Promise<boolean> => {
    try {
      const db = await openDb();
      return await new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE, "readwrite");
          const st = tx.objectStore(STORE);
          st.put(blob, KEY);
          tx.oncomplete = () => {
            try {
              db.close();
            } catch {
              return;
            }
            resolve(true);
          };
          tx.onerror = () => {
            try {
              db.close();
            } catch {
              return;
            }
            resolve(false);
          };
        } catch {
          try {
            db.close();
          } catch {
            return;
          }
          resolve(false);
        }
      });
    } catch {
      return false;
    }
  };

  const del = async (): Promise<boolean> => {
    try {
      const db = await openDb();
      return await new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE, "readwrite");
          const st = tx.objectStore(STORE);
          st.delete(KEY);
          tx.oncomplete = () => {
            try {
              db.close();
            } catch {
              return;
            }
            resolve(true);
          };
          tx.onerror = () => {
            try {
              db.close();
            } catch {
              return;
            }
            resolve(false);
          };
        } catch {
          try {
            db.close();
          } catch {
            return;
          }
          resolve(false);
        }
      });
    } catch {
      return false;
    }
  };

  return { get, set, del };
}