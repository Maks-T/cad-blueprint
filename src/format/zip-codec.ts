import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import type { Zippable } from 'fflate';
import { BlockTable } from '../blocks/block-table';
import { defineBlock } from '../blocks/block';
import type { CadBlock } from '../blocks/types';
import type { CadDocument } from '../document/document';
import { CadFormatError, decodeDocument, decodeEntities, encodeDocument, encodeEntities } from './json-codec';
import type { CompactDocument } from './json-codec';

export const VCAD_FORMAT = 'vcad';
export const VCAD_VERSION = 1;
/** Предел распакованного размера архива (защита от «zip-бомб»). */
export const VCAD_MAX_UNPACKED_BYTES = 256 * 1024 * 1024;
export const VCAD_MAX_FILES = 10_000;

export interface VcadManifest {
  readonly format: typeof VCAD_FORMAT;
  readonly version: number;
  readonly generator: string;
  readonly created: string;
  /** `document` — чертёж с листами; `library` — только библиотека блоков. */
  readonly kind: 'document' | 'library';
  readonly blocks: readonly { readonly name: string; readonly file: string }[];
  readonly assets: readonly string[];
  /** Свободные метаданные (артикул изделия, id заказа, …). */
  readonly meta?: Readonly<Record<string, unknown>>;
}

export interface PackOptions {
  /** Файлы-вложения: шрифты, исходные DXF, картинки. Ключ — путь внутри `assets/` (`fonts/gost.woff2`). */
  assets?: Readonly<Record<string, Uint8Array>>;
  /** Степень сжатия 0…9 (по умолчанию 6). */
  level?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  /** Знаков после запятой для координат (по умолчанию `settings.precision`). */
  precision?: number;
  /** Дата создания в манифесте (по умолчанию — сейчас). */
  created?: Date;
  meta?: Readonly<Record<string, unknown>>;
}

export interface UnpackedVcad {
  readonly manifest: VcadManifest;
  readonly document: CadDocument | null;
  readonly blocks: readonly CadBlock[];
  readonly assets: Readonly<Record<string, Uint8Array>>;
}

const ASSET_RE = /^(?![./])(?!.*\.\.)(?!.*\/\/)[\w\-./ ]{1,200}$/;

function assetPath(name: string): string {
  if (!ASSET_RE.test(name) || name.endsWith('/')) throw new CadFormatError('assets', `invalid asset path "${name}" (relative path without "..")`);
  return `assets/${name}`;
}

function blockFiles(blocks: readonly CadBlock[], precision: number): { files: Zippable; list: { name: string; file: string }[] } {
  const files: Zippable = {};
  const list = blocks.map((b, i) => {
    const file = `blocks/${String(i + 1).padStart(4, '0')}.json`;
    // В библиотеке слои пишутся именами — блок переносим между документами.
    const body = [b.name, [b.basePoint[0], b.basePoint[1]], b.description, encodeEntities(b.entities, { precision })];
    files[file] = strToU8(JSON.stringify(body));
    return { name: b.name, file };
  });
  return { files, list };
}

function pack(kind: VcadManifest['kind'], doc: CompactDocument | null, blocks: readonly CadBlock[], precision: number, options: PackOptions): Uint8Array {
  const { files, list } = blockFiles(blocks, precision);
  const assets = Object.keys(options.assets ?? {});
  for (const name of assets) files[assetPath(name)] = (options.assets as Record<string, Uint8Array>)[name] as Uint8Array;
  const manifest: VcadManifest = {
    format: VCAD_FORMAT,
    version: VCAD_VERSION,
    generator: 'cad-blueprint',
    created: (options.created ?? new Date()).toISOString(),
    kind,
    blocks: list,
    assets,
    ...(options.meta ? { meta: options.meta } : {}),
  };
  files['manifest.json'] = strToU8(JSON.stringify(manifest, null, 2));
  if (doc) files['document.json'] = strToU8(JSON.stringify({ ...doc, b: [] }));
  // ZIP хранит даты с 1980 года.
  const created = options.created ?? new Date();
  const mtime = created.getTime() < Date.UTC(1980, 0, 2) ? new Date(Date.UTC(1980, 0, 2)) : created;
  return zipSync(files, { level: options.level ?? 6, mtime });
}

/** Документ → `.vcad` (ZIP): `manifest.json`, `document.json` (компактный JSON без блоков), `blocks/*.json`, `assets/*`. */
export function packVcad(doc: CadDocument, options: PackOptions = {}): Uint8Array {
  const precision = options.precision ?? doc.settings.precision;
  return pack('document', encodeDocument(doc, { precision }), doc.blocks.topologicalOrder(), precision, options);
}

/** Библиотека блоков (без листов) → `.vcad`. */
export function packBlockLibrary(blocks: Iterable<CadBlock>, options: PackOptions = {}): Uint8Array {
  const table = new BlockTable([...blocks]);
  return pack('library', null, table.topologicalOrder(), options.precision ?? 6, options);
}

function readJson(files: Record<string, Uint8Array>, name: string): unknown {
  const data = files[name];
  if (!data) throw new CadFormatError(name, 'is missing in the archive');
  try {
    return JSON.parse(strFromU8(data));
  } catch (err) {
    throw new CadFormatError(name, `invalid JSON: ${(err as Error).message}`);
  }
}

/** Читает `.vcad` с проверкой манифеста, документа и всех блоков. */
export function unpackVcad(bytes: Uint8Array | ArrayBuffer): UnpackedVcad {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let total = 0;
  let count = 0;
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(data, {
      filter: (file) => {
        count += 1;
        total += file.originalSize;
        if (count > VCAD_MAX_FILES) throw new CadFormatError('vcad', `more than ${VCAD_MAX_FILES} files`);
        if (total > VCAD_MAX_UNPACKED_BYTES) throw new CadFormatError('vcad', `unpacked size exceeds ${VCAD_MAX_UNPACKED_BYTES} bytes`);
        return true;
      },
    });
  } catch (err) {
    if (err instanceof CadFormatError) throw err;
    throw new CadFormatError('vcad', `not a valid ZIP archive: ${(err as Error).message}`);
  }
  const manifest = readJson(files, 'manifest.json') as VcadManifest;
  if (typeof manifest !== 'object' || manifest === null || manifest.format !== VCAD_FORMAT) {
    throw new CadFormatError('manifest.format', `must be "${VCAD_FORMAT}"`);
  }
  if (manifest.version !== VCAD_VERSION) throw new CadFormatError('manifest.version', `unsupported version ${String(manifest.version)}`);
  if (!Array.isArray(manifest.blocks) || !Array.isArray(manifest.assets)) throw new CadFormatError('manifest', 'blocks and assets must be arrays');

  const blocks: CadBlock[] = manifest.blocks.map((entry, i) => {
    const raw = readJson(files, entry.file);
    if (!Array.isArray(raw) || raw.length !== 4) throw new CadFormatError(entry.file, 'block must be [name, basePoint, description, entities]');
    const [name, basePoint, description, entities] = raw as [string, [number, number], string | null, unknown];
    if (name !== entry.name) throw new CadFormatError(`manifest.blocks[${i}]`, `name "${entry.name}" does not match the file ("${name}")`);
    return defineBlock(name, decodeEntities(entities), { basePoint, description });
  });

  let document: CadDocument | null = null;
  if (manifest.kind === 'document') {
    document = decodeDocument(readJson(files, 'document.json'));
    for (const b of blocks) document.blocks.add(b);
  }
  const assets: Record<string, Uint8Array> = {};
  for (const name of manifest.assets) {
    const file = files[assetPath(name)];
    if (!file) throw new CadFormatError(`assets/${name}`, 'is listed in the manifest but missing');
    assets[name] = file;
  }
  return { manifest, document, blocks, assets };
}

/** Блоки из `.vcad` (библиотеки или документа). */
export function unpackBlockLibrary(bytes: Uint8Array | ArrayBuffer): CadBlock[] {
  return [...unpackVcad(bytes).blocks];
}
