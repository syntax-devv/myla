import stripAnsi from 'strip-ansi';

const NULL_BYTE_RE = /\u0000/g;

const SPINNER_LINE_RE = /^(?:\s*[|/\\\-]\s*)+$/gm;
const BRAILLE_SPINNER_RE = /[\u2800-\u28FF]/g;

const PROGRESS_BAR_RE = /\[[#=\-\s>]{3,}\]/g;
const PERCENT_RE = /\s*\d{1,3}%/g;

function collapseSpaces(input: string): string {
  return input.replace(/[ \t]{2,}/g, ' ');
}

function normalizeNewlines(input: string): string {
  return input.replace(/\r\n/g, '\n');
}

function collapseCarriageReturns(input: string): string {
  const chunks = input.split('\n');
  const out: string[] = [];

  for (const chunk of chunks) {
    const parts = chunk.split('\r');
    out.push(parts[parts.length - 1] ?? '');
  }

  return out.join('\n');
}

function trimLineWhitespace(input: string): string {
  return input
    .split('\n')
    .map(line => line.replace(/[\t \f\v]+$/g, ''))
    .join('\n');
}

function collapseExcessBlankLines(input: string): string {
  return input.replace(/\n{3,}/g, '\n\n');
}

export function scrubOutput(raw: string): string {
  const safeRaw = String(raw).replace(NULL_BYTE_RE, '');

  let out = stripAnsi(safeRaw);

  out = normalizeNewlines(out);
  out = collapseCarriageReturns(out);

  out = out.replace(SPINNER_LINE_RE, '');
  out = out.replace(BRAILLE_SPINNER_RE, '');
  out = out.replace(PROGRESS_BAR_RE, '');
  out = out.replace(PERCENT_RE, '');

  out = collapseSpaces(out);

  out = out
    .split('\n')
    .map(line => (line.trim().length === 0 ? '' : line))
    .join('\n');

  out = trimLineWhitespace(out);
  out = collapseExcessBlankLines(out);

  return out;
}
