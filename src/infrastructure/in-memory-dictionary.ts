import type { Dictionary, Word } from '../domain';
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

  pickRandomWord(): Word {
    const randomIndex = Math.floor(Math.random() * this.words.length);

    return this.words[randomIndex];
  }
}
