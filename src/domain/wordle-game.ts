import type { Dictionary } from './dictionary';
import { GameAlreadyFinishedError, InvalidWordLengthError, WordNotInDictionaryError } from './errors';
import { playGuess, startGame, type GameState } from './game';
import { DEFAULT_WORD_LENGTH, type Word, type WordLength } from './word';

export class WordleGame {
  constructor(private readonly dictionary: Dictionary) {}

  start(wordLength: WordLength = DEFAULT_WORD_LENGTH): GameState {
    return startGame(this.dictionary.pickRandomWord(wordLength), wordLength);
  }

  play(gameState: GameState, playerGuess: Word): GameState {
    if (gameState.status !== 'IN_PROGRESS') {
      throw new GameAlreadyFinishedError();
    }

    if (playerGuess.length !== gameState.wordLength) {
      throw new InvalidWordLengthError(playerGuess, gameState.wordLength);
    }

    if (!this.dictionary.contains(playerGuess)) {
      throw new WordNotInDictionaryError(playerGuess);
    }

    return playGuess(gameState, playerGuess);
  }
}
