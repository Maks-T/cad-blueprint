/**
 * DXF R2000 — не UTF-8: символы вне ASCII пишутся как `\U+XXXX` (так делает AutoCAD для символов вне кодовой
 * страницы чертежа). Это работает и в именах таблиц, и в тексте; файл остаётся чистым ASCII.
 */
export function encodeDxfString(text: string): string {
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0) as number;
    if (code >= 0x20 && code < 0x7f) out += ch;
    else if (code <= 0xffff) out += `\\U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
    else {
      // Вне BMP: суррогатная пара двумя escape-последовательностями.
      const hi = Math.floor((code - 0x10000) / 0x400) + 0xd800;
      const lo = ((code - 0x10000) % 0x400) + 0xdc00;
      out += `\\U+${hi.toString(16).toUpperCase()}\\U+${lo.toString(16).toUpperCase()}`;
    }
  }
  return out;
}

/** Обратное преобразование: `\U+XXXX` → символ. */
export function decodeDxfString(text: string): string {
  const decoded = text.replace(/\\U\+([0-9A-Fa-f]{4})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
  return decoded;
}

/** Текст MTEXT: экранирование `\ { }`, перевод строки → `\P`, табуляция → `^I`. */
export function encodeMText(text: string): string {
  const escaped = text.replace(/\\/g, '\\\\').replace(/\{/g, '\\{').replace(/\}/g, '\\}').replace(/\t/g, '^I').replace(/\n/g, '\\P');
  return encodeDxfString(escaped);
}

/** Однострочный TEXT: каждый `%` пишется как `%%%`, чтобы `%%d`, `%%c` в тексте не стали кодами AutoCAD. */
export function escapePercent(text: string): string {
  return text.replace(/%/g, '%%%');
}

export function encodeText(text: string): string {
  return encodeDxfString(escapePercent(text));
}

/** Убирает форматирование MTEXT (`\P`, `{\fArial;…}`, `\H2;` и т.п.) до простого текста. */
export function plainMText(raw: string): string {
  let s = decodeDxfString(raw);
  s = s.replace(/\\P/g, '\n').replace(/\^I/g, '\t');
  s = s.replace(/\\[ACcFfHhQqTtWw][^;\\{}]*;/g, '');
  s = s.replace(/\\[LlOoKk]/g, '');
  s = s.replace(/\\S([^;]*)\^([^;]*);/g, '$1/$2');
  s = s.replace(/\\~/g, ' ');
  s = s.replace(/(?<!\\)[{}]/g, '');
  s = s.replace(/\\([\\{}])/g, '$1');
  return s;
}

/** Коды AutoCAD в TEXT: `%%d` → °, `%%c` → Ø, `%%p` → ±, `%%%` → %. */
export function plainText(raw: string): string {
  const codes: Record<string, string> = { '%': '%', d: '°', c: 'Ø', p: '±', u: '', o: '' };
  return decodeDxfString(raw).replace(/%%([%dDcCpPuUoO])/g, (_, c: string) => codes[c.toLowerCase()] ?? '');
}
