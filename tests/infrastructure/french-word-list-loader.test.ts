import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWord } from '../../src/domain';
import {
  createFrenchDictionary,
  fetchFrenchFiveLetterWordList,
  normalizeFrenchWord,
} from '../../src/infrastructure/french-word-list-loader';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('normalizeFrenchWord', () => {
  it('Given a word with accents and ligatures, When normalizing it, Then it should return an uppercase compatible word', () => {
    // Given / When / Then
    expect(normalizeFrenchWord(' école ')).toBe('ECOLE');
    expect(normalizeFrenchWord('cœur')).toBe('COEUR');
  });
});

describe('fetchFrenchFiveLetterWordList', () => {
  it('Given a remote word list with French words, When loading the list, Then it should return uppercase five-letter Word values', async () => {
    // Given
    mockFetchText(['pomme', 'lapin', 'avion'].join('\n'));

    // When
    const words = await fetchFrenchFiveLetterWordList();

    // Then
    expect(words).toEqual([createWord('POMME'), createWord('LAPIN'), createWord('AVION')]);
  });

  it('Given the remote word list contains accents, When loading the list, Then it should normalize accents', async () => {
    // Given
    mockFetchText(['école', 'forêt'].join('\n'));

    // When
    const words = await fetchFrenchFiveLetterWordList();

    // Then
    expect(words).toEqual([createWord('ECOLE'), createWord('FORET')]);
  });

  it('Given the remote word list contains invalid words, When loading the list, Then it should filter them out', async () => {
    // Given
    mockFetchText(['chat', 'maison', 'li4re', 'ab-cd', 'pomme'].join('\n'));

    // When
    const words = await fetchFrenchFiveLetterWordList();

    // Then
    expect(words).toEqual([createWord('POMME')]);
  });

  it('Given the remote list contains words of many lengths, When loading the French word list, Then only five-letter words should be kept', async () => {
    // Given
    mockFetchText(['chat', 'pomme', 'zoologie', 'avion', 'zigzaguer', 'ecole'].join('\n'));

    // When
    const words = await fetchFrenchFiveLetterWordList();

    // Then
    expect(words).toEqual([createWord('POMME'), createWord('AVION'), createWord('ECOLE')]);
  });

  it('Given duplicate words, When loading the list, Then it should remove duplicates', async () => {
    // Given
    mockFetchText(['pomme', 'POMME', 'pomme'].join('\n'));

    // When
    const words = await fetchFrenchFiveLetterWordList();

    // Then
    expect(words).toEqual([createWord('POMME')]);
  });
});

describe('createFrenchDictionary', () => {
  it('Given the remote fetch fails, When creating the French dictionary, Then it should use the fallback dictionary', async () => {
    // Given
    mockFetchFailure();

    // When
    const dictionary = await createFrenchDictionary();

    // Then
    expect(dictionary.contains(createWord('POMME'))).toBe(true);
    expect(dictionary.contains(createWord('LAPIN'))).toBe(true);
    expect(dictionary.contains(createWord('ECOLE'))).toBe(true);
  });

  it('Given the remote list is too small, When creating the French dictionary, Then it should use the fallback dictionary', async () => {
    // Given
    mockFetchText(['pomme', 'lapin', 'ecole'].join('\n'));

    // When
    const dictionary = await createFrenchDictionary();

    // Then
    expect(dictionary.contains(createWord('POMME'))).toBe(true);
    expect(dictionary.contains(createWord('LAPIN'))).toBe(true);
    expect(dictionary.contains(createWord('ECOLE'))).toBe(true);
    expect(dictionary.contains(createWord('VILLE'))).toBe(true);
  });

  it('Given the remote list contains POMME, LAPIN and ECOLE, When creating the French dictionary, Then it should contain those words', async () => {
    // Given
    mockFetchText(buildLargeRemoteWordList(['pomme', 'lapin', 'école', 'océan']));

    // When
    const dictionary = await createFrenchDictionary();

    // Then
    expect(dictionary.contains(createWord('POMME'))).toBe(true);
    expect(dictionary.contains(createWord('LAPIN'))).toBe(true);
    expect(dictionary.contains(createWord('ECOLE'))).toBe(true);
    expect(dictionary.contains(createWord('OCEAN'))).toBe(true);
  });
});

function mockFetchText(payload: string) {
  const fetchMock: typeof fetch = vi.fn(async () =>
    ({
      ok: true,
      text: async () => payload,
    }) as Response,
  );

  vi.stubGlobal('fetch', fetchMock);
}

function mockFetchFailure() {
  const fetchMock: typeof fetch = vi.fn(async () => {
    throw new Error('Network unavailable');
  });

  vi.stubGlobal('fetch', fetchMock);
}

function buildLargeRemoteWordList(requiredWords: string[]): string {
  const validGeneratedWords = Array.from({ length: 100 }, (_, index) => {
    const firstLetter = String.fromCharCode(65 + Math.floor(index / 26));
    const secondLetter = String.fromCharCode(65 + (index % 26));

    return `ZZZ${firstLetter}${secondLetter}`;
  });

  return [...requiredWords, ...validGeneratedWords].join('\n');
}
