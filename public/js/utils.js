export const naturalCompare = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
export const formatBytes = bytes => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`;
export const safePdfName = (name, fallback = 'documento') => `${(name || fallback).trim().replace(/\.pdf$/i, '').replace(/[\\/:*?"<>|]/g, '-') || fallback}.pdf`;
export const baseName = name => name.replace(/\.[^/.]+$/, '');
export const isPdf = file => file && (file.type === 'application/pdf' || /\.pdf$/i.test(file.name));
export const isImage = file => file && (/^image\/(jpeg|png)$/.test(file.type) || /\.(jpe?g|png)$/i.test(file.name));
export const download = (bytes, name, mime = 'application/pdf') => { const url = URL.createObjectURL(new Blob([bytes], { type: mime })); const anchor = Object.assign(document.createElement('a'), { href: url, download: name }); document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
export function parseRanges(value, pageCount) {
  if (!value.trim()) throw new Error('Informe ao menos uma página ou intervalo.');
  const pages = [];
  value.split(',').map(item => item.trim()).filter(Boolean).forEach(part => {
    const match = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error(`Intervalo inválido: “${part}”.`);
    let from = Number(match[1]), to = Number(match[2] || match[1]);
    if (from < 1 || to < from || to > pageCount) throw new Error(`A página “${part}” não existe neste documento.`);
    for (let page = from; page <= to; page += 1) if (!pages.includes(page)) pages.push(page);
  });
  return pages;
}
export const tick = () => new Promise(resolve => setTimeout(resolve, 0));
