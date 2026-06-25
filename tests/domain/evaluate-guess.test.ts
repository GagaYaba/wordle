import { describe, expect, it } from 'vitest';
import { createWord, evaluateGuess } from '../../src/domain';

describe('evaluateGuess', () => {
  it('Given a secret word and the exact same guess, When evaluating the guess, Then every letter should be marked as CORRECT', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const playerGuess = createWord('LIVRE');

    // When
    const result = evaluateGuess(secretWord, playerGuess);

    // Then
    expect(result.guessedWord).toBe(playerGuess);
    expect(result.letters).toEqual([
      { letter: 'L', position: 0, feedback: 'CORRECT' },
      { letter: 'I', position: 1, feedback: 'CORRECT' },
      { letter: 'V', position: 2, feedback: 'CORRECT' },
      { letter: 'R', position: 3, feedback: 'CORRECT' },
      { letter: 'E', position: 4, feedback: 'CORRECT' },
    ]);
  });

  it('Given a secret word and a guess with no matching letters, When evaluating the guess, Then every letter should be marked as ABSENT', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const playerGuess = createWord('MOUTS');

    // When
    const result = evaluateGuess(secretWord, playerGuess);

    // Then
    expect(result.guessedWord).toBe(playerGuess);
    expect(result.letters).toEqual([
      { letter: 'M', position: 0, feedback: 'ABSENT' },
      { letter: 'O', position: 1, feedback: 'ABSENT' },
      { letter: 'U', position: 2, feedback: 'ABSENT' },
      { letter: 'T', position: 3, feedback: 'ABSENT' },
      { letter: 'S', position: 4, feedback: 'ABSENT' },
    ]);
  });

  it('Given a secret word and a guess with correct letters in wrong positions, When evaluating the guess, Then those letters should be marked as MISPLACED', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const playerGuess = createWord('REXXX');

    // When
    const result = evaluateGuess(secretWord, playerGuess);

    // Then
    expect(result.guessedWord).toBe(playerGuess);
    expect(result.letters).toEqual([
      { letter: 'R', position: 0, feedback: 'MISPLACED' },
      { letter: 'E', position: 1, feedback: 'MISPLACED' },
      { letter: 'X', position: 2, feedback: 'ABSENT' },
      { letter: 'X', position: 3, feedback: 'ABSENT' },
      { letter: 'X', position: 4, feedback: 'ABSENT' },
    ]);
  });
});

describe('evaluateGuess - multiple letters rule', () => {
  it('Given a guess containing the same letter twice but the secret contains it once, When evaluating the guess, Then only one occurrence should be marked as MISPLACED and the extra one as ABSENT', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const playerGuess = createWord('RAMER');

    // When
    const result = evaluateGuess(secretWord, playerGuess);

    // Then
    expect(result.guessedWord).toBe(playerGuess);
    expect(result.letters).toEqual([
      { letter: 'R', position: 0, feedback: 'MISPLACED' },
      { letter: 'A', position: 1, feedback: 'ABSENT' },
      { letter: 'M', position: 2, feedback: 'ABSENT' },
      { letter: 'E', position: 3, feedback: 'MISPLACED' },
      { letter: 'R', position: 4, feedback: 'ABSENT' },
    ]);
  });

  it('Given a correct occurrence already consumes a repeated letter, When the same letter appears again in the guess, Then the extra occurrence should be ABSENT', () => {
    // Given
    const secretWord = createWord('BALLE');
    const playerGuess = createWord('BELLE');

    // When
    const result = evaluateGuess(secretWord, playerGuess);

    // Then
    expect(result.guessedWord).toBe(playerGuess);
    expect(result.letters).toEqual([
      { letter: 'B', position: 0, feedback: 'CORRECT' },
      { letter: 'E', position: 1, feedback: 'ABSENT' },
      { letter: 'L', position: 2, feedback: 'CORRECT' },
      { letter: 'L', position: 3, feedback: 'CORRECT' },
      { letter: 'E', position: 4, feedback: 'CORRECT' },
    ]);
  });

  it('Given the secret contains a repeated letter twice, When the guess contains that letter twice in valid positions or misplaced positions, Then both available occurrences can receive feedback', () => {
    // Given
    const secretWord = createWord('BALLE');
    const playerGuess = createWord('ALLOB');

    // When
    const result = evaluateGuess(secretWord, playerGuess);

    // Then
    expect(result.guessedWord).toBe(playerGuess);
    expect(result.letters).toEqual([
      { letter: 'A', position: 0, feedback: 'MISPLACED' },
      { letter: 'L', position: 1, feedback: 'MISPLACED' },
      { letter: 'L', position: 2, feedback: 'CORRECT' },
      { letter: 'O', position: 3, feedback: 'ABSENT' },
      { letter: 'B', position: 4, feedback: 'MISPLACED' },
    ]);
  });

  it('Given the guess contains more occurrences than the secret, When evaluating the guess, Then only the available occurrences should be CORRECT or MISPLACED', () => {
    // Given
    const secretWord = createWord('CANAL');
    const playerGuess = createWord('BANAL');

    // When
    const result = evaluateGuess(secretWord, playerGuess);

    // Then
    expect(result.guessedWord).toBe(playerGuess);
    expect(result.letters).toEqual([
      { letter: 'B', position: 0, feedback: 'ABSENT' },
      { letter: 'A', position: 1, feedback: 'CORRECT' },
      { letter: 'N', position: 2, feedback: 'CORRECT' },
      { letter: 'A', position: 3, feedback: 'CORRECT' },
      { letter: 'L', position: 4, feedback: 'CORRECT' },
    ]);
  });

  it('Given a word with repeated absent letters, When the repeated letters do not exist in the secret, Then all those letters should be ABSENT', () => {
    // Given
    const secretWord = createWord('LIVRE');
    const playerGuess = createWord('XXXXX');

    // When
    const result = evaluateGuess(secretWord, playerGuess);

    // Then
    expect(result.guessedWord).toBe(playerGuess);
    expect(result.letters).toEqual([
      { letter: 'X', position: 0, feedback: 'ABSENT' },
      { letter: 'X', position: 1, feedback: 'ABSENT' },
      { letter: 'X', position: 2, feedback: 'ABSENT' },
      { letter: 'X', position: 3, feedback: 'ABSENT' },
      { letter: 'X', position: 4, feedback: 'ABSENT' },
    ]);
  });

  it('Given CORRECT and MISPLACED compete for the same letter occurrence, When evaluating the guess, Then CORRECT should have priority', () => {
    // Given
    const secretWord = createWord('ABBEY');
    const playerGuess = createWord('BABBB');

    // When
    const result = evaluateGuess(secretWord, playerGuess);

    // Then
    expect(result.guessedWord).toBe(playerGuess);
    expect(result.letters).toEqual([
      { letter: 'B', position: 0, feedback: 'MISPLACED' },
      { letter: 'A', position: 1, feedback: 'MISPLACED' },
      { letter: 'B', position: 2, feedback: 'CORRECT' },
      { letter: 'B', position: 3, feedback: 'ABSENT' },
      { letter: 'B', position: 4, feedback: 'ABSENT' },
    ]);
  });
});
