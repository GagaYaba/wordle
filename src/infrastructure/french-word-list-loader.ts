import { createWord, type Word } from '../domain';
import { InMemoryDictionary } from './in-memory-dictionary';

const FRENCH_WORD_LIST_URL = 'https://raw.githubusercontent.com/Taknok/French-Wordlist/master/francais.txt';
const MIN_REMOTE_WORD_COUNT = 100;
const FRENCH_FIVE_LETTER_WORD_PATTERN = /^[A-Z]{5}$/;

export function normalizeFrenchWord(input: string): string | null {
  const normalizedWord = input
    .trim()
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!FRENCH_FIVE_LETTER_WORD_PATTERN.test(normalizedWord)) {
    return null;
  }

  return normalizedWord;
}

export async function fetchFrenchFiveLetterWordList(): Promise<Word[]> {
  const response = await fetch(FRENCH_WORD_LIST_URL);

  if (!response.ok) {
    throw new Error('Unable to fetch French word list');
  }

  const payload = await response.text();
  const wordsByValue = new Map<string, Word>();

  payload.split(/\r?\n/).forEach((line) => {
    const normalizedWord = normalizeFrenchWord(line);

    if (!normalizedWord) {
      return;
    }

    try {
      wordsByValue.set(normalizedWord, createWord(normalizedWord));
    } catch {
      // Invalid remote entries are ignored so the dictionary only receives domain words.
    }
  });

  return Array.from(wordsByValue.values());
}

export async function createFrenchDictionary(): Promise<InMemoryDictionary> {
  try {
    const words = await fetchFrenchFiveLetterWordList();

    if (words.length >= MIN_REMOTE_WORD_COUNT) {
      return new InMemoryDictionary(words);
    }
  } catch {
    // The local fallback keeps the game playable offline or when the remote list is unavailable.
  }

  return new InMemoryDictionary();
}
