export class GameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidWordLengthError extends GameError {
  constructor(word: string, expectedLength = 5) {
    super(`Invalid word length for "${word}". A Word must contain exactly ${expectedLength} letters.`);
    this.name = 'InvalidWordLengthError';
  }
}

export class InvalidWordCharactersError extends GameError {
  constructor(word: string) {
    super(`Invalid word characters for "${word}". A Word must contain only alphabetic letters.`);
    this.name = 'InvalidWordCharactersError';
  }
}

export class WordNotInDictionaryError extends GameError {
  constructor(word: string) {
    super(`Word "${word}" does not exist in the dictionary.`);
    this.name = 'WordNotInDictionaryError';
  }
}

export class GameAlreadyFinishedError extends GameError {
  constructor() {
    super('Cannot play a guess because the game is already finished.');
    this.name = 'GameAlreadyFinishedError';
  }
}
