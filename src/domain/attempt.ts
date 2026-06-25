import type { LetterFeedback } from './feedback';
import type { Letter, Word } from './word';

export type LetterResult = {
  readonly letter: Letter;
  readonly position: number;
  readonly feedback: LetterFeedback;
};

export type AttemptResult = {
  readonly guessedWord: Word;
  readonly letters: readonly LetterResult[];
};
