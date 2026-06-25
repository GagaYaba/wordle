import { describe, expect, it } from 'vitest';
import {
  createWord,
  InvalidWordCharactersError,
  InvalidWordLengthError,
} from '../../src/domain';

describe('createWord', () => {
  it('Given a valid lowercase 5-letter word, When creating a Word, Then it should return an uppercase Word', () => {
    // Given
    const input = 'livre';

    // When
    const word = createWord(input);

    // Then
    expect(word).toBe('LIVRE');
  });

  it('Given a valid uppercase 5-letter word, When creating a Word, Then it should keep the Word valid', () => {
    // Given
    const input = 'LIVRE';

    // When
    const word = createWord(input);

    // Then
    expect(word).toBe('LIVRE');
  });

  it('Given a word shorter than 5 letters, When creating a Word, Then it should throw InvalidWordLengthError', () => {
    // Given
    const input = 'CHAT';

    // When
    const createShortWord = () => createWord(input);

    // Then
    expect(createShortWord).toThrow(InvalidWordLengthError);
  });

  it('Given a word longer than 5 letters, When creating a Word, Then it should throw InvalidWordLengthError', () => {
    // Given
    const input = 'MAISON';

    // When
    const createLongWord = () => createWord(input);

    // Then
    expect(createLongWord).toThrow(InvalidWordLengthError);
  });

  it('Given a word containing numbers, When creating a Word, Then it should throw InvalidWordCharactersError', () => {
    // Given
    const input = 'LI4RE';

    // When
    const createWordWithNumbers = () => createWord(input);

    // Then
    expect(createWordWithNumbers).toThrow(InvalidWordCharactersError);
  });

  it('Given a word containing punctuation, When creating a Word, Then it should throw InvalidWordCharactersError', () => {
    // Given
    const input = 'LIVR!';

    // When
    const createWordWithPunctuation = () => createWord(input);

    // Then
    expect(createWordWithPunctuation).toThrow(InvalidWordCharactersError);
  });

  it('Given a word containing a space, When creating a Word, Then it should throw InvalidWordCharactersError', () => {
    // Given
    const input = 'LI RE';

    // When
    const createWordWithSpace = () => createWord(input);

    // Then
    expect(createWordWithSpace).toThrow(InvalidWordCharactersError);
  });
});
