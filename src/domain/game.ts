import type { AttemptResult } from './attempt';
import { evaluateGuess } from './evaluate-guess';
import { GameAlreadyFinishedError } from './errors';
import type { Word } from './word';

export const MAX_ATTEMPTS = 6;

export type GameStatus = 'IN_PROGRESS' | 'WON' | 'LOST';

export type GameState = {
  readonly secretWord: Word;
  readonly attempts: readonly AttemptResult[];
  readonly remainingAttempts: number;
  readonly status: GameStatus;
};

export function startGame(secretWord: Word): GameState {
  return {
    secretWord,
    attempts: [],
    remainingAttempts: MAX_ATTEMPTS,
    status: 'IN_PROGRESS',
  };
}

export function playGuess(gameState: GameState, playerGuess: Word): GameState {
  if (gameState.status !== 'IN_PROGRESS') {
    throw new GameAlreadyFinishedError();
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
