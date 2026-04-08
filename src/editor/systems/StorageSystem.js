import localforage from 'localforage';

/**
 * StorageSystem
 * Manages persistence for Notebooks and Pages.
 * Upgraded to IndexedDB via localforage to safely handle large PDF files without crashing.
 */
class StorageSystem {
  constructor(namespace = 'note_editor_') {
    this.ns = namespace;
    this.store = localforage.createInstance({
      name: 'LovesheetNotes',
      storeName: 'canvas_data'
    });
  }

  async savePage(notebookId, pageNumber, data) {
    const key = `${this.ns}${notebookId}_p${pageNumber}`;
    try {
      await this.store.setItem(key, data);
      return true;
    } catch (e) {
      console.error("Storage failed:", e);
      return false;
    }
  }

  async loadPage(notebookId, pageNumber) {
    const key = `${this.ns}${notebookId}_p${pageNumber}`;
    try {
      return await this.store.getItem(key);
    } catch (e) {
      console.error("Storage load failed:", e);
      return null;
    }
  }

  async deletePage(notebookId, pageNumber) {
    const key = `${this.ns}${notebookId}_p${pageNumber}`;
    await this.store.removeItem(key);
  }

  // Notebook metadata
  async saveNotebookInfo(notebookId, info) {
    await this.store.setItem(`${this.ns}meta_${notebookId}`, info);
  }

  async getNotebookInfo(notebookId) {
    return await this.store.getItem(`${this.ns}meta_${notebookId}`);
  }
}

export default StorageSystem;
