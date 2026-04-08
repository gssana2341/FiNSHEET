import * as pdfjsLib from 'pdfjs-dist';
import localforage from 'localforage';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Use local worker and ensure we have CMaps/Fonts available if possible
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

class PdfEngine {
  constructor() {
    this.pdfStore = localforage.createInstance({
      name: 'LovesheetPDFStore',
      storeName: 'pdfs'
    });
    this.cacheStore = localforage.createInstance({
      name: 'LovesheetPDFStore',
      storeName: 'page_cache'
    });
    
    // Memory Cache for the actively opened PDF (GoodNotes style)
    this.activeId = null;
    this.activePdf = null;
    this.loadingPromise = null;

    // Rendering Queue (GoodNotes-grade Smoothness)
    this.queue = [];
    this.processing = false;
    this.requestHandlers = new Map(); // key -> { resolve, reject }[]
  }

  /**
   * Close the active document and free memory
   */
  async closeDocument() {
    if (this.activePdf) {
      console.log(`[PdfEngine] Closing document "${this.activeId}" and freeing memory...`);
      await this.activePdf.destroy();
      this.activePdf = null;
      this.activeId = null;
      this.loadingPromise = null;
    }
    this.queue = []; // Clear pending tasks
    this.requestHandlers.clear();
  }

  /**
   * Ensures the PDF document is loaded and cached in memory for fast access
   */
  async ensureDocument(id) {
    if (this.activeId === id && this.activePdf) {
      return this.activePdf;
    }
    if (this.activeId === id && this.loadingPromise) {
      return this.loadingPromise;
    }

    if (this.activePdf) await this.closeDocument();

    this.activeId = id;
    this.loadingPromise = (async () => {
      const uint8 = await this.pdfStore.getItem(id);
      if (!uint8) throw new Error(`PDF data for "${id}" not found in DB`);

      console.log(`[PdfEngine] Opening document "${id}" (First-time parse)...`);
      const loadingTask = pdfjsLib.getDocument({ 
        data: uint8.slice(0),
        useWorkerFetch: false,
        isEvalSupported: false
      });
      
      const pdf = await loadingTask.promise;
      this.activePdf = pdf;
      return pdf;
    })();

    return this.loadingPromise;
  }

  /**
   * Save PDF to IndexedDB and extract page count
   */
  async importPdf(id, file) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer.slice(0));
    await this.pdfStore.setItem(id, uint8.slice(0));
    const pdf = await this.ensureDocument(id);
    return { numPages: pdf.numPages };
  }

  /**
   * Request a page image with priority. The main entry point for components.
   */
  async requestPageImage(id, pageNumber, scale = 2.5, priority = 'low') {
    const key = `${id}_p${pageNumber}_s${scale}`;
    
    // 1. Check Cache first (Instant)
    const cached = await this.cacheStore.getItem(key);
    if (cached && typeof cached === 'object' && (cached.blob || cached.dataUrl)) {
      return cached;
    }

    // 2. Already in queue? Just join the waitlist.
    if (this.requestHandlers.has(key)) {
      return new Promise((resolve, reject) => {
        this.requestHandlers.get(key).push({ resolve, reject });
        if (priority === 'high') {
          const idx = this.queue.findIndex(t => t.key === key);
          if (idx > -1) {
            const task = this.queue.splice(idx, 1)[0];
            this.queue.unshift(task);
          }
        }
      });
    }

    // 3. Add to Queue
    const task = { key, id, pageNumber, scale, priority };
    if (priority === 'high') {
      this.queue.unshift(task); 
    } else {
      this.queue.push(task);
    }

    const promise = new Promise((resolve, reject) => {
      this.requestHandlers.set(key, [{ resolve, reject }]);
    });

    this.processQueue();
    return promise;
  }

  /**
   * Serialized Queue Processor
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      const handlers = this.requestHandlers.get(task.key);
      if (!handlers) continue;
      
      try {
        const result = await this.getPageImageInternal(task.id, task.pageNumber, task.scale);
        handlers.forEach(h => h.resolve(result));
      } catch (err) {
        handlers.forEach(h => h.reject(err));
      } finally {
        this.requestHandlers.delete(task.key);
      }
      
      // Delay slightly to keep UI thread alive
      await new Promise(r => setTimeout(r, 0));
    }

    this.processing = false;
  }

  async getPageImageInternal(id, pageNumber, scale = 2.5) {
    const pdfDocument = await this.ensureDocument(id);
    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;
    
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    const origViewport = page.getViewport({ scale: 1 });
    const result = { blob, pageWidth: origViewport.width, pageHeight: origViewport.height };

    const cacheKey = `${id}_p${pageNumber}_s${scale}`;
    await this.cacheStore.setItem(cacheKey, result);
    return result;
  }

  async getPageDataUrl(id, pageNumber, scale = 2.5) {
    return this.requestPageImage(id, pageNumber, scale, 'low');
  }
}

export const pdfEngine = new PdfEngine();
