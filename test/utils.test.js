import assert from 'node:assert/strict';
import test from 'node:test';
import { baseName, formatBytes, isImage, isPdf, naturalCompare, parseRanges, safePdfName } from '../public/js/utils.js';

test('ordena arquivos em ordem natural pelo nome', () => {
  const files = [{ name: 'arquivo10.pdf' }, { name: 'arquivo2.pdf' }, { name: 'arquivo1.pdf' }];

  assert.deepEqual(files.sort(naturalCompare).map(file => file.name), ['arquivo1.pdf', 'arquivo2.pdf', 'arquivo10.pdf']);
});

test('ordena os itens internos que armazenam o arquivo na propriedade file', () => {
  const files = [{ file: { name: 'lote10.pdf' } }, { file: { name: 'lote2.pdf' } }];

  assert.deepEqual(files.sort(naturalCompare).map(item => item.file.name), ['lote2.pdf', 'lote10.pdf']);
});

test('formata tamanhos de arquivo', () => {
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1024 * 1024 * 2.4), '2,4 MB');
});

test('normaliza nomes de PDF para download', () => {
  assert.equal(safePdfName(' LOTE:08 '), 'LOTE-08.pdf');
  assert.equal(safePdfName('resultado.pdf'), 'resultado.pdf');
  assert.equal(safePdfName('', 'consolidado'), 'consolidado.pdf');
  assert.equal(baseName('arquivo.final.pdf'), 'arquivo.final');
});

test('reconhece PDFs e imagens suportadas', () => {
  assert.ok(isPdf({ name: 'documento.PDF', type: '' }));
  assert.ok(isPdf({ name: 'sem-extensao', type: 'application/pdf' }));
  assert.equal(isPdf({ name: 'foto.png', type: 'image/png' }), false);
  assert.ok(isImage({ name: 'foto.JPEG', type: '' }));
  assert.ok(isImage({ name: 'foto', type: 'image/png' }));
  assert.equal(isImage({ name: 'documento.pdf', type: 'application/pdf' }), false);
});

test('interpreta páginas e intervalos sem repetir páginas', () => {
  assert.deepEqual(parseRanges('1, 3, 5-7, 3', 9), [1, 3, 5, 6, 7]);
});

test('rejeita intervalos vazios, inválidos ou fora do documento', () => {
  assert.throws(() => parseRanges('', 4));
  assert.throws(() => parseRanges('1-a', 4));
  assert.throws(() => parseRanges('5', 4));
  assert.throws(() => parseRanges('3-1', 4));
});
