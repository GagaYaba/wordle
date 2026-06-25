import { DEFAULT_WORD_LENGTH, isSupportedWordLength, type Dictionary, type Word, type WordLength } from '../domain';
import { DEFAULT_FRENCH_WORDS } from './default-french-words';

export class InMemoryDictionary implements Dictionary {
  constructor(private readonly words: readonly Word[] = DEFAULT_FRENCH_WORDS) {
    if (words.length === 0) {
      throw new Error('InMemoryDictionary requires at least one word');
    }
  }

  contains(word: Word): boolean {
    return this.words.includes(word);
  }

  pickRandomWord(wordLength: WordLength = DEFAULT_WORD_LENGTH): Word {
    if (!isSupportedWordLength(wordLength)) {
      throw new Error(`Unsupported word length "${wordLength}"`);
    }

    const wordsForLength = this.words.filter((word) => word.length === wordLength);

    if (wordsForLength.length === 0) {
      throw new Error(`InMemoryDictionary has no word with ${wordLength} letters`);
    }

    const randomIndex = Math.floor(Math.random() * wordsForLength.length);

    return wordsForLength[randomIndex];
  }
}
