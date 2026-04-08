import * as DocumentPicker from 'expo-document-picker';
import { Paths, File, Directory } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { NativeModules } from 'react-native';

// Custom interface for our native bridge
const { PdfToImage } = NativeModules;

export interface PdfMetadata {
  id: string;
  name: string;
  uri: string;
  numPages?: number;
}

class PdfService {
  private readonly STORAGE_DIR = new Directory(Paths.document, 'pdfs');
  private readonly CACHE_DIR = new Directory(Paths.cache, 'pdf_pages');

  constructor() {
    this.ensureDirectory();
  }

  private async ensureDirectory() {
    try {
      if (!this.STORAGE_DIR.exists) {
        await this.STORAGE_DIR.create();
      }
      if (!this.CACHE_DIR.exists) {
        await this.CACHE_DIR.create();
      }
    } catch (err) {
      console.warn('[PdfService] Directory check failed:', err);
    }
  }

  /**
   * Let user pick a PDF and copy it to local storage for persistence
   */
  async pickAndStorePdf(): Promise<PdfMetadata | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return null;

      const pickedFile = result.assets[0];
      const fileName = pickedFile.name;
      const fileId = `pdf_${Date.now()}`;
      
      const destFile = new File(this.STORAGE_DIR, `${fileId}.pdf`);
      
      // Ensure storage is ready
      await this.ensureDirectory();

      // Copy the file from the picker's temporary location to our persistent storage
      await FileSystemLegacy.copyAsync({
        from: pickedFile.uri,
        to: destFile.uri
      });
      
      return {
        id: fileId,
        name: fileName,
        uri: destFile.uri,
        numPages: 0 // Will be updated by metadata extraction
      };
    } catch (error) {
      console.error('[PdfService] Error picking file:', error);
      return null;
    }
  }

  async getPdfUri(id: string): Promise<string | null> {
    const file = new File(this.STORAGE_DIR, `${id}.pdf`);
    return file.exists ? file.uri : null;
  }

  /**
   * Get an image of a specific page. 
   * Integrating with react-native-pdf-to-image or similar.
   */
  async getPageImage(id: string, pageIndex: number, scale: number = 2.5): Promise<string | null> {
    const cacheKey = `${id}_p${pageIndex}_s${scale}.jpg`;
    const cacheFile = new File(this.CACHE_DIR, cacheKey);

    // 1. Check Cache
    if (cacheFile.exists) {
      // return await cacheFile.readAsString({ encoding: 'base64' });
    }

    // 2. Render from Native
    const pdfUri = await this.getPdfUri(id);
    if (!pdfUri) return null;

    console.log(`[PdfService] Requesting native render for ${id} p${pageIndex}`);
    
    try {
      // This is the bridge to the native renderer
      // Example: PdfToImage.convertPage(pdfUri, pageIndex, scale)
      if (PdfToImage) {
        const response = await PdfToImage.convert(pdfUri); 
        // Note: react-native-pdf-to-image might convert all pages.
        // For Pro performance, a custom Swift module for PDFKit is recommended.
        
        if (response && response.outputFiles && response.outputFiles[pageIndex]) {
           // Read the generated file and return as base64
           const renderedFile = new File(response.outputFiles[pageIndex]);
           // return await renderedFile.readAsString({ encoding: 'base64' });
        }
      }
    } catch (err) {
      console.error('[PdfService] Native render failed:', err);
    }
    
    return null;
  }

  async deletePdf(id: string) {
    const file = new File(this.STORAGE_DIR, `${id}.pdf`);
    if (file.exists) {
       await file.delete();
    }
  }
}

export const pdfService = new PdfService();
