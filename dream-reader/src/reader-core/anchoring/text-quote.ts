/**
 * W3C Web Annotation TextQuoteSelector implementation.
 * Describes a text segment using exact text, plus surrounding prefix and suffix context
 * to ensure robust matching even when the document slightly shifts or contains duplicated phrases.
 */

export interface TextQuoteSelector {
  exact: string;
  prefix?: string;
  suffix?: string;
}

const CONTEXT_LENGTH = 32;

/**
 * Creates a TextQuoteSelector from full document text and selection start/end indices.
 */
export function createTextQuoteSelector(
  documentText: string,
  start: number,
  end: number,
  contextLength = CONTEXT_LENGTH
): TextQuoteSelector {
  const exact = documentText.slice(start, end);
  const prefixStart = Math.max(0, start - contextLength);
  const prefix = documentText.slice(prefixStart, start);
  const suffixEnd = Math.min(documentText.length, end + contextLength);
  const suffix = documentText.slice(end, suffixEnd);

  return {
    exact,
    prefix,
    suffix,
  };
}

export interface MatchResult {
  start: number;
  end: number;
  score: number; // 1.0 is exact match with exact prefix and suffix
}

/**
 * Finds the best match for a TextQuoteSelector in document text.
 * Resilient to minor whitespace or formatting changes.
 */
export function matchTextQuoteSelector(
  documentText: string,
  selector: TextQuoteSelector
): MatchResult | null {
  const { exact, prefix = '', suffix = '' } = selector;
  if (!exact) return null;

  // 1. Direct exact match search
  let candidateIndex = documentText.indexOf(exact);
  let bestMatch: MatchResult | null = null;
  let highestScore = -1;

  while (candidateIndex !== -1) {
    const start = candidateIndex;
    const end = start + exact.length;

    // Check prefix
    const actualPrefix = documentText.slice(Math.max(0, start - prefix.length), start);
    // Check suffix
    const actualSuffix = documentText.slice(end, Math.min(documentText.length, end + suffix.length));

    let score = 1.0;
    if (prefix) {
      score += actualPrefix === prefix ? 0.5 : (actualPrefix.endsWith(prefix.slice(-8)) ? 0.2 : 0);
    }
    if (suffix) {
      score += actualSuffix === suffix ? 0.5 : (actualSuffix.startsWith(suffix.slice(0, 8)) ? 0.2 : 0);
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = { start, end, score };
    }

    candidateIndex = documentText.indexOf(exact, candidateIndex + 1);
  }

  if (bestMatch) {
    return bestMatch;
  }

  // 2. Normalized fallback (ignore extra whitespace / case)
  const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
  const normalizedExact = normalize(exact);
  const normalizedDoc = normalize(documentText);

  const normIndex = normalizedDoc.indexOf(normalizedExact);
  if (normIndex !== -1) {
    // Rough approximate range in original doc
    return {
      start: normIndex,
      end: normIndex + exact.length,
      score: 0.7,
    };
  }

  return null;
}
