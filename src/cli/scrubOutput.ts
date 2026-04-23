import stripAnsi from 'strip-ansi';

const NULL_BYTE_RE = /\u0000/g;

const SPINNER_LINE_RE = /^[ \t]*[|/\\\-][ \t]*$/gm;
const BRAILLE_SPINNER_RE = /[\u2800-\u28FF]/g;

const BOX_DRAWING_RE = /[\u2500-\u259F]+/g;

const BOX_CHROME_LINE_RE = /^[\u2500-\u259F\s]+$/gm;

const PROGRESS_BAR_RE = /\[[-\s]*[#=>]+[-\s]*\]/g;

const PROGRESS_PERCENT_RE = /(?:^|\s)\d{1,3}%(?=\s|$)/gm;

const AI_TIP_RE = /^Tip:.*$/gm;
const AI_PROMPT_RE = /^›\s+(?:Improve|Write|Add|Fix|Refactor|Optimize|Remove|Update)/gm;

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

  out = out.replace(BOX_CHROME_LINE_RE, '');
  out = out.replace(BOX_DRAWING_RE, '');

  out = out.replace(BRAILLE_SPINNER_RE, '');
  out = out.replace(SPINNER_LINE_RE, '');
  out = out.replace(PROGRESS_BAR_RE, '');
  out = out.replace(PROGRESS_PERCENT_RE, '');

  if (process.env.MYLA_SCRUB_AI_SUGGESTIONS === '1') {
    out = out.replace(AI_TIP_RE, '');
    out = out.replace(AI_PROMPT_RE, '');
  }

  out = collapseSpaces(out);

  out = out
    .split('\n')
    .map(line => (line.trim().length === 0 ? '' : line))
    .join('\n');

  out = trimLineWhitespace(out);
  out = collapseExcessBlankLines(out);

  return out;
}
