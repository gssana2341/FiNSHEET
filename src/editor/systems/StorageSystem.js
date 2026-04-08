/**
 * StorageSystem
 * Manages persistence for Notebooks and Pages.
 * Initial implementation uses LocalStorage, designed to be swapped for IndexedDB.
 */
class StorageSystem {
  constructor(namespace = 'note_editor_') {
    this.ns = namespace;
  }

  savePage(notebookId, pageNumber, data) {
    const key = `${this.ns}${notebookId}_p${pageNumber}`;
    try {
      localStorage.setItem(key, data);
      return true;
    } catch (e) {
      console.error("Storage failed:", e);
      return false;
    }
  }

  loadPage(notebookId, pageNumber) {
    const key = `${this.ns}${notebookId}_p${pageNumber}`;
    return localStorage.getItem(key);
  }

  deletePage(notebookId, pageNumber) {
    const key = `${this.ns}${notebookId}_p${pageNumber}`;
    localStorage.removeItem(key);
  }

  // Notebook metadata
  saveNotebookInfo(notebookId, info) {
    localStorage.setItem(`${this.ns}meta_${notebookId}`, JSON.stringify(info));
  }

  getNotebookInfo(notebookId) {
    const data = localStorage.getItem(`${this.ns}meta_${notebookId}`);
    return data ? JSON.parse(data) : null;
  }
}

export default StorageSystem;
