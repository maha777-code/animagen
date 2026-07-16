export interface Token {
  /** Normalized lowercase word. */
  value: string;
  /** Index in token array. */
  index: number;
  /** Character offset in normalized prompt string. */
  offset: number;
}

/** Normalize and split prompt into word tokens. */
export function tokenize(prompt: string): Token[] {
  const normalized = prompt.toLowerCase().trim();
  const tokens: Token[] = [];
  const re = /[a-z0-9]+(?:-[a-z0-9]+)*/gi;
  let match: RegExpExecArray | null;

  while ((match = re.exec(normalized)) !== null) {
    tokens.push({
      value: match[0].toLowerCase(),
      index: tokens.length,
      offset: match.index,
    });
  }

  return tokens;
}

/** Join consecutive tokens into n-grams (longest first for matching). */
export function getNgrams(tokens: Token[], n: number): string[] {
  const grams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    grams.push(tokens.slice(i, i + n).map((t) => t.value).join(' '));
  }
  return grams;
}

/** Find first dictionary match using longest n-gram scan (up to 3 words). */
export function matchDictionary<T extends string>(
  tokens: Token[],
  dictionary: Readonly<Record<string, T>>,
  maxGram = 3,
): { value: T; matched: string; startIndex: number } | null {
  for (let n = maxGram; n >= 1; n--) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const phrase = tokens.slice(i, i + n).map((t) => t.value).join(' ');
      const hit = dictionary[phrase];
      if (hit) {
        return { value: hit, matched: phrase, startIndex: i };
      }
    }
  }
  return null;
}

/** Find all non-overlapping dictionary matches. */
export function matchAllDictionary<T extends string>(
  tokens: Token[],
  dictionary: Readonly<Record<string, T>>,
  maxGram = 3,
): Array<{ value: T; matched: string; startIndex: number; endIndex: number }> {
  const used = new Set<number>();
  const results: Array<{ value: T; matched: string; startIndex: number; endIndex: number }> = [];

  for (let n = maxGram; n >= 1; n--) {
    for (let i = 0; i <= tokens.length - n; i++) {
      if (used.has(i)) continue;
      const slice = tokens.slice(i, i + n);
      if (slice.some((t) => used.has(t.index))) continue;

      const phrase = slice.map((t) => t.value).join(' ');
      const hit = dictionary[phrase];
      if (hit) {
        for (let j = i; j < i + n; j++) used.add(j);
        results.push({ value: hit, matched: phrase, startIndex: i, endIndex: i + n - 1 });
      }
    }
  }

  return results.sort((a, b) => a.startIndex - b.startIndex);
}

/** Match phrase in raw token sequence (for multi-word camera phrases). */
export function matchPhrase(tokens: Token[], phrase: string): number | null {
  const parts = phrase.split(' ');
  if (parts.length === 0) return null;

  outer: for (let i = 0; i <= tokens.length - parts.length; i++) {
    for (let j = 0; j < parts.length; j++) {
      if (tokens[i + j]?.value !== parts[j]) continue outer;
    }
    return i;
  }
  return null;
}

/** Parse numeric count from token or digit string near subject. */
export function parseCountToken(value: string): number | undefined {
  const n = Number(value);
  if (Number.isInteger(n) && n > 0 && n <= 50) return n;
  return undefined;
}
