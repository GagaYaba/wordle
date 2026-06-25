import type { Dictionary } from './dictionary';
import { GameAlreadyFinishedError, WordNotInDictionaryError } from './errors';
import { playGuess, startGame, type GameState } from './game';
import type { Word } from './word';

export class WordleGame {
  constructor(private readonly dictionary: Dictionary) {}

  start(): GameState {
    return startGame(this.dictionary.pickRandomWord());
  }

  play(gameState: GameState, playerGuess: Word): GameState {
    if (gameState.status !== 'IN_PROGRESS') {
      throw new GameAlreadyFinishedError();
    }

    if (!this.dictionary.contains(playerGuess)) {
      throw new WordNotInDictionaryError(playerGuess);
    }

    return playGuess(gameState, playerGuess);
  }
}
