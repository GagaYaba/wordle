import { describe, expect, it } from 'vitest';
import {
  GameAlreadyFinishedError,
  InvalidWordCharactersError,
  InvalidWordLengthError,
  WordNotInDictionaryError,
} from '../../src/domain';

describe('domain errors', () => {
  it('Given an InvalidWordLengthError, When it is instantiated, Then it should be an instance of Error and have the correct name', () => {
    // Given
    const word = 'CHAT';

    // When
    const error = new InvalidWordLengthError(word);

    // Then
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(InvalidWordLengthError);
    expect(error.name).toBe('InvalidWordLengthError');
    expect(error.message.trim().length).toBeGreaterThan(0);
  });

  it('Given an InvalidWordCharactersError, When it is instantiated, Then it should be an instance of Error and have the correct name', () => {
    // Given
    const word = 'LI4RE';

    // When
    const error = new InvalidWordCharactersError(word);

    // Then
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(InvalidWordCharactersError);
    expect(error.name).toBe('InvalidWordCharactersError');
    expect(error.message.trim().length).toBeGreaterThan(0);
  });

  it('Given a WordNotInDictionaryError, When it is instantiated, Then it should be an instance of Error and have the correct name', () => {
    // Given
    const word = 'LIVRE';

    // When
    const error = new WordNotInDictionaryError(word);

    // Then
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(WordNotInDictionaryError);
    expect(error.name).toBe('WordNotInDictionaryError');
    expect(error.message.trim().length).toBeGreaterThan(0);
  });

  it('Given a GameAlreadyFinishedError, When it is instantiated, Then it should be an instance of Error and have the correct name', () => {
    // Given
    const errorName = 'GameAlreadyFinishedError';

    // When
    const error = new GameAlreadyFinishedError();

    // Then
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(GameAlreadyFinishedError);
    expect(error.name).toBe(errorName);
    expect(error.message.trim().length).toBeGreaterThan(0);
  });
});
