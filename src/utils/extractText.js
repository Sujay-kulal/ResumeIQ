/**
 * Extract text from a PDF file using pdf.js
 */
export async function extractPdfText(file) {
  const pdfjsLib = await import('pdfjs-dist');
  
  // Use the local worker from pdfjs-dist instead of a CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
  
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText.trim();
}

/**
 * Extract text from a DOCX file using mammoth
 */
export async function extractDocxText(file) {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

/**
 * Extract text based on file type
 */
export async function extractResumeText(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  
  if (ext === 'pdf') {
    return extractPdfText(file);
  } else if (ext === 'docx' || ext === 'doc') {
    return extractDocxText(file);
  } else if (ext === 'txt') {
    return file.text();
  } else {
    throw new Error(`Unsupported file type: .${ext}`);
  }
}

/**
 * Format file size into human-readable string
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
