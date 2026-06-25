import type { Word } from './word';

export interface Dictionary {
  contains(word: Word): boolean;
  pickRandomWord(): Word;
}
