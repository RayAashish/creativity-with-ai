import { describe, it, expect } from 'vitest';
import { lookupWordInLocalDictionary } from '../lookup/dictionary-dataset';

describe('Instant Lookup & Open Dictionary Dataset', () => {
  it('looks up exact technical terms with Hindi and Nepali senses', () => {
    const res = lookupWordInLocalDictionary('virtualization');
    expect(res).not.toBeNull();
    expect(res?.word).toBe('virtualization');
    expect(res?.devanagariPhonetic).toBe('वर्चुअलाइजेशन');
    expect(res?.senses[0].hindi).toContain('आभासीकरण');
    expect(res?.senses[0].nepali[0]).toContain('भर्चुअलाइजेशन');
  });

  it('handles plural and inflected words (e.g. threads -> thread, processes -> process)', () => {
    const threadPlural = lookupWordInLocalDictionary('threads');
    expect(threadPlural?.word).toBe('thread');

    const processPlural = lookupWordInLocalDictionary('processes');
    expect(processPlural?.word).toBe('process');
  });

  it('handles casing and leading/trailing punctuation (e.g. "(Concurrency).")', () => {
    const res = lookupWordInLocalDictionary('(Concurrency).');
    expect(res?.word).toBe('concurrency');
    expect(res?.senses[0].hindi).toContain('समवर्तिता');
  });

  it('returns null for unknown words to delegate to machine translation', () => {
    const res = lookupWordInLocalDictionary('nonexistentgibberishword');
    expect(res).toBeNull();
  });
});
