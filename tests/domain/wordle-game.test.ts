import { describe, expect, it } from 'vitest';
import {
  createWord,
  type Dictionary,
  GameAlreadyFinishedError,
  InvalidWordLengthError,
  type Word,
  type WordLength,
  WordleGame,
  WordNotInDictionaryError,
} from '../../src/domain';

class FakeDictionary implements Dictionary {
  constructor(
    private readonly words: readonly Word[],
    private readonly secretWord: Word,
  ) {}

  contains(word: Word): boolean {
    return this.words.includes(word);
  }

  pickRandomWord(wordLength: WordLength = 5): Word {
    return this.words.find((word) => word.length === wordLength) ?? this.secretWord;
  }
}

describe('WordleGame', () => {
  it('Given a dictionary with a controlled secret word, When starting a game, Then the game should use the secret word picked by the dictionary', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const dictionary = new FakeDictionary([secretWord], secretWord);
    const wordleGame = new WordleGame(dictionary);

    // When
    const gameState = wordleGame.start();

    // Then
    expect(gameState.secretWord).toBe(secretWord);
    expect(gameState.status).toBe('IN_PROGRESS');
    expect(gameState.remainingAttempts).toBe(6);
  });

  it('Given a dictionary with words of several lengths, When starting a 6-letter game, Then the game should use a 6-letter secret word', () => {
    // Given
    const fourLetterWord = createWord('LUNE', 4);
    const fiveLetterWord = createWord('LIVRE');
    const sixLetterWord = createWord('CABANE', 6);
    const dictionary = new FakeDictionary([fourLetterWord, fiveLetterWord, sixLetterWord], fiveLetterWord);
    const wordleGame = new WordleGame(dictionary);

    // When
    const gameState = wordleGame.start(6);

    // Then
    expect(gameState.secretWord).toBe(sixLetterWord);
    expect(gameState.wordLength).toBe(6);
  });

  it('Given an in-progress game and a valid word from the dictionary, When the player makes a guess, Then the guess should be accepted and added to attempts', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const playerGuess = createWord('MOUTS');
    const dictionary = new FakeDictionary([secretWord, playerGuess], secretWord);
    const wordleGame = new WordleGame(dictionary);
    const gameState = wordleGame.start();

    // When
    const nextGameState = wordleGame.play(gameState, playerGuess);

    // Then
    expect(nextGameState.attempts).toHaveLength(1);
    expect(nextGameState.attempts[0]?.guessedWord).toBe(playerGuess);
    expect(nextGameState.remainingAttempts).toBe(5);
  });

  it('Given an in-progress game and a word not present in the dictionary, When the player makes a guess, Then it should throw WordNotInDictionaryError', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const validGuess = createWord('MOUTS');
    const playerGuess = createWord('TABLE');
    const dictionary = new FakeDictionary([secretWord, validGuess], secretWord);
    const wordleGame = new WordleGame(dictionary);
    const gameState = wordleGame.start();

    // When
    const playUnknownWord = () => wordleGame.play(gameState, playerGuess);

    // Then
    expect(playUnknownWord).toThrow(WordNotInDictionaryError);
  });

  it('Given a 4-letter game and a valid 5-letter dictionary word, When the player makes a guess, Then it should throw InvalidWordLengthError', () => {
    // Given
    const secretWord = createWord('LUNE', 4);
    const wrongLengthGuess = createWord('LIVRE');
    const dictionary = new FakeDictionary([secretWord, wrongLengthGuess], wrongLengthGuess);
    const wordleGame = new WordleGame(dictionary);
    const gameState = wordleGame.start(4);

    // When
    const playWrongLengthWord = () => wordleGame.play(gameState, wrongLengthGuess);

    // Then
    expect(playWrongLengthWord).toThrow(InvalidWordLengthError);
  });

  it('Given a word not present in the dictionary, When the guess is rejected, Then the game state should remain unchanged', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const validGuess = createWord('MOUTS');
    const playerGuess = createWord('TABLE');
    const dictionary = new FakeDictionary([secretWord, validGuess], secretWord);
    const wordleGame = new WordleGame(dictionary);
    const gameState = wordleGame.start();

    // When
    const playUnknownWord = () => wordleGame.play(gameState, playerGuess);

    // Then
    expect(playUnknownWord).toThrow(WordNotInDictionaryError);
    expect(gameState.attempts).toHaveLength(0);
    expect(gameState.remainingAttempts).toBe(6);
    expect(gameState.status).toBe('IN_PROGRESS');
  });

  it('Given the fake dictionary always returns the same secret word, When starting multiple games with the same fake dictionary, Then the selected secret word should be deterministic', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const otherWord = createWord('MOUTS');
    const dictionary = new FakeDictionary([secretWord, otherWord], secretWord);
    const wordleGame = new WordleGame(dictionary);

    // When
    const firstGameState = wordleGame.start();
    const secondGameState = wordleGame.start();

    // Then
    expect(firstGameState.secretWord).toBe(secretWord);
    expect(secondGameState.secretWord).toBe(secretWord);
  });

  it('Given a finished game, When the player tries to play a valid dictionary word, Then it should throw GameAlreadyFinishedError', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const extraGuess = createWord('MOUTS');
    const dictionary = new FakeDictionary([secretWord, extraGuess], secretWord);
    const wordleGame = new WordleGame(dictionary);
    const wonGameState = wordleGame.play(wordleGame.start(), secretWord);

    // When
    const playAfterFinishedGame = () => wordleGame.play(wonGameState, extraGuess);

    // Then
    expect(playAfterFinishedGame).toThrow(GameAlreadyFinishedError);
  });
});
