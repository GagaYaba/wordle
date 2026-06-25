import { describe, expect, it } from 'vitest';
import { createWord, GameAlreadyFinishedError, InvalidWordLengthError, playGuess, startGame } from '../../src/domain';

describe('startGame', () => {
  it('Given a secret word, When starting a new game, Then the game should be in progress with 6 remaining attempts and no attempts', () => {
    // Given
    const secretWord = createWord('LIVRE');

    // When
    const gameState = startGame(secretWord);

    // Then
    expect(gameState.secretWord).toBe(secretWord);
    expect(gameState.wordLength).toBe(5);
    expect(gameState.status).toBe('IN_PROGRESS');
    expect(gameState.remainingAttempts).toBe(6);
    expect(gameState.attempts).toEqual([]);
  });

  it('Given a 4-letter secret word, When starting a new game, Then the game should track the selected word length', () => {
    // Given
    const secretWord = createWord('LUNE', 4);

    // When
    const gameState = startGame(secretWord, 4);

    // Then
    expect(gameState.secretWord).toBe(secretWord);
    expect(gameState.wordLength).toBe(4);
    expect(gameState.remainingAttempts).toBe(6);
  });
});

describe('playGuess', () => {
  it('Given an in-progress game, When the player makes a wrong guess, Then the guess should be added to attempts and remaining attempts should decrease', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const playerGuess = createWord('MOUTS');
    const gameState = startGame(secretWord);

    // When
    const nextGameState = playGuess(gameState, playerGuess);

    // Then
    expect(nextGameState.attempts).toHaveLength(1);
    expect(nextGameState.attempts[0]?.guessedWord).toBe(playerGuess);
    expect(nextGameState.remainingAttempts).toBe(5);
    expect(nextGameState.status).toBe('IN_PROGRESS');
  });

  it('Given a 4-letter game, When the player submits a 5-letter guess, Then it should throw InvalidWordLengthError', () => {
    // Given
    const secretWord = createWord('LUNE', 4);
    const playerGuess = createWord('LIVRE');
    const gameState = startGame(secretWord);

    // When
    const playWrongLengthGuess = () => playGuess(gameState, playerGuess);

    // Then
    expect(playWrongLengthGuess).toThrow(InvalidWordLengthError);
  });

  it('Given an in-progress game, When the player guesses the secret word, Then the game should be won', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const playerGuess = createWord('LIVRE');
    const gameState = startGame(secretWord);

    // When
    const nextGameState = playGuess(gameState, playerGuess);

    // Then
    expect(nextGameState.status).toBe('WON');
    expect(nextGameState.attempts).toHaveLength(1);
    expect(nextGameState.remainingAttempts).toBe(5);
  });

  it('Given an in-progress game with five wrong attempts already played, When the player makes a sixth wrong guess, Then the game should be lost', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const wrongGuesses = [
      createWord('MOUTS'),
      createWord('CANAL'),
      createWord('PERDU'),
      createWord('TABLE'),
      createWord('CHIEN'),
    ];
    const sixthGuess = createWord('RADIO');

    const gameWithFiveWrongAttempts = wrongGuesses.reduce(
      (currentGameState, wrongGuess) => playGuess(currentGameState, wrongGuess),
      startGame(secretWord),
    );

    // When
    const lostGameState = playGuess(gameWithFiveWrongAttempts, sixthGuess);

    // Then
    expect(lostGameState.status).toBe('LOST');
    expect(lostGameState.attempts).toHaveLength(6);
    expect(lostGameState.remainingAttempts).toBe(0);
  });

  it('Given a won game, When the player tries to play another guess, Then it should throw GameAlreadyFinishedError', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const winningGuess = createWord('LIVRE');
    const extraGuess = createWord('MOUTS');
    const wonGameState = playGuess(startGame(secretWord), winningGuess);

    // When
    const playAfterWin = () => playGuess(wonGameState, extraGuess);

    // Then
    expect(playAfterWin).toThrow(GameAlreadyFinishedError);
  });

  it('Given a lost game, When the player tries to play another guess, Then it should throw GameAlreadyFinishedError', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const wrongGuesses = [
      createWord('MOUTS'),
      createWord('CANAL'),
      createWord('PERDU'),
      createWord('TABLE'),
      createWord('CHIEN'),
      createWord('RADIO'),
    ];
    const extraGuess = createWord('BALON');

    const lostGameState = wrongGuesses.reduce(
      (currentGameState, wrongGuess) => playGuess(currentGameState, wrongGuess),
      startGame(secretWord),
    );

    // When
    const playAfterLoss = () => playGuess(lostGameState, extraGuess);

    // Then
    expect(playAfterLoss).toThrow(GameAlreadyFinishedError);
  });

  it('Given an in-progress game, When the player makes a guess, Then the returned GameState should be a new object and the original GameState should remain unchanged', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const playerGuess = createWord('MOUTS');
    const gameState = startGame(secretWord);

    // When
    const nextGameState = playGuess(gameState, playerGuess);

    // Then
    expect(nextGameState).not.toBe(gameState);
    expect(gameState.attempts).toEqual([]);
    expect(gameState.remainingAttempts).toBe(6);
    expect(gameState.status).toBe('IN_PROGRESS');
    expect(nextGameState.attempts).toHaveLength(1);
    expect(nextGameState.remainingAttempts).toBe(5);
  });

  it('Given several wrong guesses, When the game is still below 6 attempts, Then the status should remain IN_PROGRESS', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const wrongGuesses = [createWord('MOUTS'), createWord('CANAL'), createWord('PERDU')];
    const initialGame = startGame(secretWord);

    // When
    const updatedGame = wrongGuesses.reduce(
      (currentGameState, playerGuess) => playGuess(currentGameState, playerGuess),
      initialGame,
    );

    // Then
    expect(updatedGame.status).toBe('IN_PROGRESS');
    expect(updatedGame.attempts).toHaveLength(3);
    expect(updatedGame.remainingAttempts).toBe(3);
  });
});
