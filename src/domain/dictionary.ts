import type { Word, WordLength } from './word';

export interface Dictionary {
  contains(word: Word): boolean;
  pickRandomWord(wordLength?: WordLength): Word;
}
