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
    this.syncingDocs = new Map(); // id -> Promise (resolves when sync finished)

    // Native Bridge state
    this.isNativeHost = typeof window !== 'undefined' && !!window.ReactNativeWebView;
    this.isNativeRendererReady = false; // Will be confirmed by the host
    this.nativePendingRequests = new Map(); // requestId -> { resolve, reject }

    if (this.isNativeHost) {
      this.setupNativeBridge();
    }
  }

  setupNativeBridge() {
    window.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'NATIVE_HEALTH_CHECK') {
          this.isNativeRendererReady = data.payload.hasRenderer;
          console.log(`[PdfEngine] Native Renderer Ready: ${this.isNativeRendererReady}`);
        }

        if (data.type === 'PDF_DATA_SYNC') {
          const { id, base64 } = data.payload;
          console.log(`[PdfEngine] Received PDF Data Sync for ${id}`);
          
          let resolveSync;
          const syncPromise = new Promise(res => { resolveSync = res; });
          this.syncingDocs.set(id, syncPromise);

          // Convert Base64 to Uint8Array (Standard for pdf.js)
          try {
            const binaryString = window.atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            this.pdfStore.setItem(id, bytes).then(() => {
              console.log(`[PdfEngine] PDF "${id}" successfully stored in local DB (${bytes.length} bytes)`);
              this.syncingDocs.delete(id);
              resolveSync();
            });
          } catch (err) {
            console.error('[PdfEngine] Base64 conversion failed:', err.message || err);
          }
        }

        if (data.type === 'PAGE_RESPONSE') {
          const { requestId, base64, width, height } = data.payload;
          const handler = this.nativePendingRequests.get(requestId);
          if (handler) {
            // Convert base64 to blob for compatibility with existing CanvasEngine
            fetch(`data:image/jpeg;base64,${base64}`)
              .then(res => res.blob())
              .then(blob => {
                handler.resolve({ blob, pageWidth: width, pageHeight: height });
                this.nativePendingRequests.delete(requestId);
              });
          }
        }
      } catch (err) {
        // Not for us or malformed
      }
    });
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
      // Wait for sync if it's in progress
      if (this.syncingDocs.has(id)) {
        console.log(`[PdfEngine] Waiting for sync to finish for "${id}"...`);
        await this.syncingDocs.get(id);
      }

      let uint8 = await this.pdfStore.getItem(id);
      
      // Retry a few times if not found (brief delay)
      if (!uint8) {
        for (let i = 0; i < 10; i++) {
          console.log(`[PdfEngine] PDF "${id}" not in DB, retrying... (${i+1}/10)`);
          await new Promise(r => setTimeout(r, 800));
          uint8 = await this.pdfStore.getItem(id);
          if (uint8) break;
        }
      }

      if (!uint8) throw new Error(`PDF data for "${id}" not found in DB after 10 retries. Sync might have failed.`);

      console.log(`[PdfEngine] Opening document "${id}" (Size: ${uint8.length} bytes)...`);
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
   * Warm-up all pages in the background (Aggressive Caching)
   */
  async warmUp(id, pageCount) {
    console.log(`[PdfEngine] Aggressive Warm-up started for ${id} (${pageCount} pages)`);
    
    // We only warm up at 1.0x - this provides the instant "Ghost" image
    const WARMUP_SCALE = 1.0; 

    // Don't wait for completion - just fire and forget the requests
    // The internal queue will manage the serialization and prioritization
    for (let i = 1; i <= pageCount; i++) {
      const key = `${id}_p${i}_s${WARMUP_SCALE}`;
      
      // Check cache first to avoid redundant bridge calls
      const cached = await this.cacheStore.getItem(key);
      if (!cached) {
        // Enqueue as low priority - this lets user-visible requests jump in front
        this.requestPageImage(id, i, WARMUP_SCALE, 'low').catch(() => {});
      }
    }
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
        let result;
        // Use native only if it's a native host AND the renderer is confirmed ready
        if (this.isNativeHost && this.isNativeRendererReady) {
          try {
            result = await this.getPageImageNative(task.id, task.pageNumber, task.scale);
          } catch (err) {
            console.warn('[PdfEngine] Native render failed, falling back to internal:', err);
            result = await this.getPageImageInternal(task.id, task.pageNumber, task.scale);
          }
        } else {
          result = await this.getPageImageInternal(task.id, task.pageNumber, task.scale);
        }
        handlers.forEach(h => h.resolve(result));
      } catch (err) {
        console.error(`[PdfEngine] Failed to process Page ${task.pageNumber}:`, err.message || err);
        handlers.forEach(h => h.reject(err));
      } finally {
        this.requestHandlers.delete(task.key);
      }
      
      // Delay slightly to keep UI thread alive
      await new Promise(r => setTimeout(r, 0));
    }

    this.processing = false;
  }

  async getPageImageNative(id, pageIndex, scale) {
    const requestId = `${id}_p${pageIndex}_s${scale}_${Date.now()}`;
    
    return new Promise((resolve, reject) => {
      this.nativePendingRequests.set(requestId, { resolve, reject });
      
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'REQUEST_PAGE',
        payload: {
          requestId,
          id,
          pageIndex,
          scale
        }
      }));

      // Timeout safety
      setTimeout(() => {
        if (this.nativePendingRequests.has(requestId)) {
          this.nativePendingRequests.delete(requestId);
          reject(new Error('Native rendering timeout'));
        }
      }, 10000);
    });
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
