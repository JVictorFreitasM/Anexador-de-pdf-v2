const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
if (window.pdfjsLib) window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export async function getPdfInfo(file) {
  const bytes = await file.arrayBuffer();
  const pdfDocument = await window.pdfjsLib.getDocument({ data: bytes }).promise;
  const pages = pdfDocument.numPages;
  await pdfDocument.destroy();
  return pages;
}

export async function previewPage(file, pageNumber = 1, width = 140) {
  const bytes = await file.arrayBuffer();
  const pdfDocument = await window.pdfjsLib.getDocument({ data: bytes }).promise;
  const page = await pdfDocument.getPage(pageNumber);
  const initial = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: width / initial.width });
  const canvas = window.document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  page.cleanup(); await pdfDocument.destroy();
  return canvas.toDataURL('image/jpeg', .78);
}
