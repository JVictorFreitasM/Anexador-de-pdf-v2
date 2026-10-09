import { download, safePdfName, baseName, tick } from './utils.js';

const { PDFDocument, degrees, StandardFonts, rgb } = window.PDFLib;

export async function mergePdfs(items, outputName, progress) {
  const output = await PDFDocument.create();
  for (let index = 0; index < items.length; index += 1) {
    progress?.(index + 1, items.length);
    const source = await PDFDocument.load(await items[index].file.arrayBuffer(), { ignoreEncryption: false });
    const pages = await output.copyPages(source, source.getPageIndices());
    pages.forEach(page => output.addPage(page));
    await tick();
  }
  download(await output.save(), safePdfName(outputName, 'PDF_consolidado'));
}

export async function getPageRotations(file) {
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false });
  return source.getPages().map(page => page.getRotation().angle);
}

async function copyState(file, states) {
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false });
  const output = await PDFDocument.create();
  const copied = [];
  for (const state of states) {
    const [page] = await output.copyPages(source, [state.sourceIndex]);
    page.setRotation(degrees((state.baseRotation + state.rotation) % 360));
    output.addPage(page);
    copied.push(page);
  }
  return { output, copied };
}

export async function makePdfFromPageState(file, pages, name) {
  const { output } = await copyState(file, pages);
  download(await output.save(), safePdfName(name, `${baseName(file.name)}_organizado`));
}

export async function extractPages(file, sourceIndexes, name) {
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false });
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, sourceIndexes);
  pages.forEach(page => output.addPage(page));
  download(await output.save(), safePdfName(name, `${baseName(file.name)}_extraido`));
}

export async function splitPdf(file, groups, progress) {
  const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false });
  for (let index = 0; index < groups.length; index += 1) {
    progress?.(index + 1, groups.length);
    const output = await PDFDocument.create();
    const pages = await output.copyPages(source, groups[index]);
    pages.forEach(page => output.addPage(page));
    download(await output.save(), safePdfName(`${baseName(file.name)}_parte_${index + 1}`));
    await tick();
  }
}

export async function imagesToPdf(items, outputName, progress) {
  const output = await PDFDocument.create();
  for (let index = 0; index < items.length; index += 1) {
    progress?.(index + 1, items.length);
    const file = items[index].file;
    const bytes = await file.arrayBuffer();
    const image = /png$/i.test(file.type) || /\.png$/i.test(file.name) ? await output.embedPng(bytes) : await output.embedJpg(bytes);
    const page = output.addPage([595.28, 841.89]);
    const scale = Math.min((page.getWidth() - 48) / image.width, (page.getHeight() - 48) / image.height);
    const width = image.width * scale, height = image.height * scale;
    page.drawImage(image, { x: (page.getWidth() - width) / 2, y: (page.getHeight() - height) / 2, width, height });
    await tick();
  }
  download(await output.save(), safePdfName(outputName, 'imagens'));
}

function coordinates(page, text, font, size, position, margin = 26) {
  const width = font.widthOfTextAtSize(text, size);
  const height = font.heightAtSize(size);
  const vertical = position.startsWith('top') ? page.getHeight() - margin - height : position.startsWith('bottom') ? margin : (page.getHeight() - height) / 2;
  const horizontal = position.endsWith('left') ? margin : position.endsWith('right') ? page.getWidth() - margin - width : (page.getWidth() - width) / 2;
  return { x: horizontal, y: vertical };
}

export async function decoratePageState(file, states, options) {
  const { output, copied } = await copyState(file, states);
  const font = await output.embedFont(StandardFonts.Helvetica);
  const selected = new Set(options.selectedIds || []);
  const applies = state => !selected.size || selected.has(state.id);

  copied.forEach((page, index) => {
    const state = states[index];
    if (!applies(state)) return;
    if (options.watermark?.text) {
      const { text, size, opacity, position } = options.watermark;
      const point = coordinates(page, text, font, size, position, 34);
      page.drawText(text, { ...point, size, font, opacity, color: rgb(.259, .282, .58) });
    }
    if (options.numbering && index + 1 >= options.numbering.fromPage) {
      const number = options.numbering.initial + (index + 1 - options.numbering.fromPage);
      const text = options.numbering.format === 'simple' ? `${number}` : `Página ${number} de ${options.numbering.initial + states.length - options.numbering.fromPage}`;
      page.drawText(text, { ...coordinates(page, text, font, 9, options.numbering.position, 24), size: 9, font, color: rgb(.1, .1, .1) });
    }
  });
  download(await output.save(), safePdfName(options.name, `${baseName(file.name)}_editado`));
}
