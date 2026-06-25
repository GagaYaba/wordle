import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWord } from '../../src/domain';
import {
  createFrenchDictionary,
  fetchSupportedFrenchWordList,
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

describe('fetchSupportedFrenchWordList', () => {
  it('Given a remote word list with French words, When loading the list, Then it should return uppercase supported Word values', async () => {
    // Given
    mockFetchText(['chat', 'pomme', 'cabane'].join('\n'));

    // When
    const words = await fetchSupportedFrenchWordList();

    // Then
    expect(words).toEqual([createWord('CHAT', 4), createWord('POMME'), createWord('CABANE', 6)]);
  });

  it('Given the remote word list contains accents, When loading the list, Then it should normalize accents', async () => {
    // Given
    mockFetchText(['école', 'forêt'].join('\n'));

    // When
    const words = await fetchSupportedFrenchWordList();

    // Then
    expect(words).toEqual([createWord('ECOLE'), createWord('FORET')]);
  });

  it('Given the remote word list contains invalid words, When loading the list, Then it should filter them out', async () => {
    // Given
    mockFetchText(['ami', 'maisons', 'li4re', 'ab-cd', 'pomme'].join('\n'));

    // When
    const words = await fetchSupportedFrenchWordList();

    // Then
    expect(words).toEqual([createWord('POMME')]);
  });

  it('Given the remote list contains words of many lengths, When loading the French word list, Then only 4, 5 and 6-letter words should be kept', async () => {
    // Given
    mockFetchText(['ami', 'chat', 'pomme', 'cabane', 'maison', 'maisons'].join('\n'));

    // When
    const words = await fetchSupportedFrenchWordList();

    // Then
    expect(words).toEqual([
      createWord('CHAT', 4),
      createWord('POMME'),
      createWord('CABANE', 6),
      createWord('MAISON', 6),
    ]);
  });

  it('Given duplicate words, When loading the list, Then it should remove duplicates', async () => {
    // Given
    mockFetchText(['pomme', 'POMME', 'pomme'].join('\n'));

    // When
    const words = await fetchSupportedFrenchWordList();

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
    expect(dictionary.contains(createWord('CHAT', 4))).toBe(true);
    expect(dictionary.contains(createWord('POMME'))).toBe(true);
    expect(dictionary.contains(createWord('CABANE', 6))).toBe(true);
    expect(dictionary.contains(createWord('LAPIN'))).toBe(true);
    expect(dictionary.contains(createWord('ECOLE'))).toBe(true);
  });

  it('Given the remote word list responds with a non-OK status, When creating the French dictionary, Then it should fall back to the local default dictionary', async () => {
    // Given
    mockFetchNonOkResponse();

    // When
    const dictionary = await createFrenchDictionary();

    // Then
    expect(dictionary.contains(createWord('CHAT', 4))).toBe(true);
    expect(dictionary.contains(createWord('POMME'))).toBe(true);
    expect(dictionary.contains(createWord('CABANE', 6))).toBe(true);
    expect(dictionary.contains(createWord('LIVRE'))).toBe(true);
  });

  it('Given the remote list is too small, When creating the French dictionary, Then it should use the fallback dictionary', async () => {
    // Given
    mockFetchText(['pomme', 'lapin', 'ecole'].join('\n'));

    // When
    const dictionary = await createFrenchDictionary();

    // Then
    expect(dictionary.contains(createWord('CHAT', 4))).toBe(true);
    expect(dictionary.contains(createWord('POMME'))).toBe(true);
    expect(dictionary.contains(createWord('CABANE', 6))).toBe(true);
    expect(dictionary.contains(createWord('LAPIN'))).toBe(true);
    expect(dictionary.contains(createWord('ECOLE'))).toBe(true);
    expect(dictionary.contains(createWord('VILLE'))).toBe(true);
  });

  it('Given the remote list contains words of 4, 5 and 6 letters, When creating the French dictionary, Then it should contain those words', async () => {
    // Given
    mockFetchText(buildLargeRemoteWordList(['pomme', 'lapin', 'école', 'océan']));

    // When
    const dictionary = await createFrenchDictionary();

    // Then
    expect(dictionary.contains(createWord('CHAT', 4))).toBe(true);
    expect(dictionary.contains(createWord('POMME'))).toBe(true);
    expect(dictionary.contains(createWord('LAPIN'))).toBe(true);
    expect(dictionary.contains(createWord('ECOLE'))).toBe(true);
    expect(dictionary.contains(createWord('CABANE', 6))).toBe(true);
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

function mockFetchNonOkResponse() {
  const fetchMock: typeof fetch = vi.fn(async () =>
    ({
      ok: false,
      status: 500,
      text: vi.fn(),
    }) as unknown as Response,
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

  return ['chat', 'cabane', ...requiredWords, ...validGeneratedWords].join('\n');
}
