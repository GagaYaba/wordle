export type { AttemptResult, LetterResult } from './attempt';
export type { Dictionary } from './dictionary';
export { evaluateGuess } from './evaluate-guess';
export type { LetterFeedback } from './feedback';
export { MAX_ATTEMPTS, playGuess, startGame } from './game';
export type { GameState, GameStatus } from './game';
export { WORD_LENGTH, createWord } from './word';
export type { Letter, Word } from './word';
export { WordleGame } from './wordle-game';
export {
  GameAlreadyFinishedError,
  GameError,
  InvalidWordCharactersError,
  InvalidWordLengthError,
  WordNotInDictionaryError,
} from './errors';
