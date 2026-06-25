import { describe, expect, it } from 'vitest';
import {
  createWord,
  InvalidWordCharactersError,
  InvalidWordLengthError,
  type WordLength,
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

  it('Given no word length is provided, When creating a Word, Then it should default to 5 letters', () => {
    // Given
    const input = 'POMME';

    // When
    const word = createWord(input);

    // Then
    expect(word).toBe('POMME');
  });

  it('Given a 4-letter word and expected length 4, When creating a Word, Then it should be accepted', () => {
    // Given
    const input = 'lune';

    // When
    const word = createWord(input, 4);

    // Then
    expect(word).toBe('LUNE');
  });

  it('Given a 6-letter word and expected length 6, When creating a Word, Then it should be accepted', () => {
    // Given
    const input = 'cabane';

    // When
    const word = createWord(input, 6);

    // Then
    expect(word).toBe('CABANE');
  });

  it('Given a 4-letter word with expected length 5, When creating a Word, Then it should throw InvalidWordLengthError', () => {
    // Given
    const input = 'LUNE';

    // When
    const createFourLetterWordAsFiveLetterWord = () => createWord(input, 5);

    // Then
    expect(createFourLetterWordAsFiveLetterWord).toThrow(InvalidWordLengthError);
  });

  it('Given an unsupported word length, When creating a Word, Then it should throw InvalidWordLengthError', () => {
    // Given
    const input = 'SEPTLET';
    const unsupportedLength = 7 as WordLength;

    // When
    const createUnsupportedWord = () => createWord(input, unsupportedLength);

    // Then
    expect(createUnsupportedWord).toThrow(InvalidWordLengthError);
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

  it('Given a word containing an accent, When creating a domain Word directly, Then it should throw InvalidWordCharactersError', () => {
    // Given
    const input = '\u00e9cole';

    // When
    const createWordWithAccent = () => createWord(input);

    // Then
    expect(createWordWithAccent).toThrow(InvalidWordCharactersError);
  });
});
