import type { AttemptResult } from './attempt';
import { evaluateGuess } from './evaluate-guess';
import { GameAlreadyFinishedError, InvalidWordLengthError } from './errors';
import { DEFAULT_WORD_LENGTH, isSupportedWordLength, type Word, type WordLength } from './word';

export const MAX_ATTEMPTS = 6;

export type GameStatus = 'IN_PROGRESS' | 'WON' | 'LOST';

export type GameState = {
  readonly secretWord: Word;
  readonly wordLength: WordLength;
  readonly attempts: readonly AttemptResult[];
  readonly remainingAttempts: number;
  readonly status: GameStatus;
};

export function startGame(secretWord: Word, wordLength: WordLength = resolveWordLength(secretWord)): GameState {
  return {
    secretWord,
    wordLength,
    attempts: [],
    remainingAttempts: MAX_ATTEMPTS,
    status: 'IN_PROGRESS',
  };
}

export function playGuess(gameState: GameState, playerGuess: Word): GameState {
  if (gameState.status !== 'IN_PROGRESS') {
    throw new GameAlreadyFinishedError();
  }

  if (playerGuess.length !== gameState.wordLength) {
    throw new InvalidWordLengthError(playerGuess, gameState.wordLength);
  }

  const attemptResult = evaluateGuess(gameState.secretWord, playerGuess);
  const attempts = [...gameState.attempts, attemptResult];
  const remainingAttempts = gameState.remainingAttempts - 1;

  return {
    ...gameState,
    attempts,
    remainingAttempts,
    status: resolveGameStatus(gameState.secretWord, playerGuess, remainingAttempts),
  };
}

function resolveGameStatus(secretWord: Word, playerGuess: Word, remainingAttempts: number): GameStatus {
  if (playerGuess === secretWord) {
    return 'WON';
  }

  if (remainingAttempts === 0) {
    return 'LOST';
  }

  return 'IN_PROGRESS';
}

function resolveWordLength(word: Word): WordLength {
  if (isSupportedWordLength(word.length)) {
    return word.length;
  }

  return DEFAULT_WORD_LENGTH;
}
