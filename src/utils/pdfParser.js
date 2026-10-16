import * as pdfjsLib from 'pdfjs-dist';

import { safeLogger } from './validators.js';

// Configure worker locally for Vite and modern browser environments without third-party CDN dependencies
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  } catch (err) {
    safeLogger.warn('No se pudo inicializar worker de PDF localmente:', err);
  }
}

/**
 * Extracts formatted plain text from an uploaded .pdf file
 * Preserves line breaks based on coordinate changes and EOL flags
 * @param {File} file 
 * @returns {Promise<string>}
 */
export async function extractTextFromPdf(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    });
    
    const doc = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      let lastY = null;
      let pageText = '';
      
      // Ordenar elementos visualmente de arriba a abajo (Y descendente) y de izquierda a derecha (X ascendente)
      const items = (textContent.items || []).filter(item => item && typeof item.str === 'string');
      items.sort((a, b) => {
        const yA = a.transform ? a.transform[5] : 0;
        const yB = b.transform ? b.transform[5] : 0;
        if (Math.abs(yA - yB) <= 4) {
          const xA = a.transform ? a.transform[4] : 0;
          const xB = b.transform ? b.transform[4] : 0;
          return xA - xB;
        }
        return yB - yA;
      });

      for (const item of items) {
        if (!item.str && item.str !== '') continue;
        const currentY = item.transform ? Math.round(item.transform[5]) : null;
        
        // Detect line breaks when vertical position changes
        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
          pageText += '\n';
        } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
          pageText += ' ';
        }
        
        pageText += item.str;
        if (item.hasEOL) {
          pageText += '\n';
        }
        lastY = currentY;
      }
      
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (err) {
    safeLogger.error('Error extracting text from PDF:', err);
    throw new Error('No se pudo leer el archivo PDF. Comprueba que no esté dañado o protegido.');
  }
}
