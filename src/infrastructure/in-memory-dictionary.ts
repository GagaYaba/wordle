import type { Dictionary, Word } from '../domain';
import { createWord } from '../domain';

const DEFAULT_WORDS: readonly Word[] = [
  'LIVRE',
  'TABLE',
  'CHIEN',
  'RADIO',
  'CANAL',
  'BALLE',
  'PORTE',
  'ROUTE',
  'PLAGE',
  'FLEUR',
  'MONDE',
  'CARTE',
  'PIANO',
  'NUAGE',
  'TERRE',
].map(createWord);

export class InMemoryDictionary implements Dictionary {
  constructor(private readonly words: readonly Word[] = DEFAULT_WORDS) {
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
