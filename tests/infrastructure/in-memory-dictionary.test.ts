import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWord, type Word } from '../../src/domain';
import { InMemoryDictionary } from '../../src/infrastructure/in-memory-dictionary';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('InMemoryDictionary', () => {
  it('Given an empty word list, When creating an InMemoryDictionary, Then it should throw an error', () => {
    // Given
    const emptyWords: Word[] = [];

    // When
    const createDictionary = () => new InMemoryDictionary(emptyWords);

    // Then
    expect(createDictionary).toThrow('InMemoryDictionary requires at least one word');
  });

  it('Given a dictionary containing known words, When checking an existing word, Then contains should return true', () => {
    // Given
    const livre = createWord('LIVRE');
    const table = createWord('TABLE');
    const dictionary = new InMemoryDictionary([livre, table]);

    // When
    const containsWord = dictionary.contains(livre);

    // Then
    expect(containsWord).toBe(true);
  });

  it('Given a dictionary containing known words, When checking a word that is not present, Then contains should return false', () => {
    // Given
    const livre = createWord('LIVRE');
    const table = createWord('TABLE');
    const pomme = createWord('POMME');
    const dictionary = new InMemoryDictionary([livre, table]);

    // When
    const containsWord = dictionary.contains(pomme);

    // Then
    expect(containsWord).toBe(false);
  });

  it('Given a dictionary with several words, When Math.random returns 0, Then pickRandomWord should return the first word', () => {
    // Given
    const words = [createWord('LIVRE'), createWord('TABLE'), createWord('POMME')];
    const dictionary = new InMemoryDictionary(words);
    vi.spyOn(Math, 'random').mockReturnValue(0);

    // When
    const pickedWord = dictionary.pickRandomWord();

    // Then
    expect(pickedWord).toBe(createWord('LIVRE'));
  });

  it('Given a dictionary with several words, When Math.random returns 0.5, Then pickRandomWord should return the expected indexed word', () => {
    // Given
    const words = [createWord('LIVRE'), createWord('TABLE'), createWord('POMME')];
    const dictionary = new InMemoryDictionary(words);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    // When
    const pickedWord = dictionary.pickRandomWord();

    // Then
    expect(pickedWord).toBe(createWord('TABLE'));
  });

  it('Given pickRandomWord is called, When the dictionary has valid words, Then the returned value should be one of the dictionary words', () => {
    // Given
    const words = [createWord('LIVRE'), createWord('TABLE'), createWord('POMME')];
    const dictionary = new InMemoryDictionary(words);
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    // When
    const pickedWord = dictionary.pickRandomWord();

    // Then
    expect(words).toContain(pickedWord);
  });

  it('Given words of length 4, 5 and 6, When picking a random word for length 4, Then the returned word should have 4 letters', () => {
    // Given
    const dictionary = new InMemoryDictionary([createWord('LUNE', 4), createWord('LIVRE'), createWord('CABANE', 6)]);
    vi.spyOn(Math, 'random').mockReturnValue(0);

    // When
    const pickedWord = dictionary.pickRandomWord(4);

    // Then
    expect(pickedWord).toHaveLength(4);
  });

  it('Given words of length 4, 5 and 6, When picking a random word for length 5, Then the returned word should have 5 letters', () => {
    // Given
    const dictionary = new InMemoryDictionary([createWord('LUNE', 4), createWord('LIVRE'), createWord('CABANE', 6)]);
    vi.spyOn(Math, 'random').mockReturnValue(0);

    // When
    const pickedWord = dictionary.pickRandomWord(5);

    // Then
    expect(pickedWord).toHaveLength(5);
  });

  it('Given words of length 4, 5 and 6, When picking a random word for length 6, Then the returned word should have 6 letters', () => {
    // Given
    const dictionary = new InMemoryDictionary([createWord('LUNE', 4), createWord('LIVRE'), createWord('CABANE', 6)]);
    vi.spyOn(Math, 'random').mockReturnValue(0);

    // When
    const pickedWord = dictionary.pickRandomWord(6);

    // Then
    expect(pickedWord).toHaveLength(6);
  });

  it('Given no length is provided, When picking a random word, Then it should default to 5 letters', () => {
    // Given
    const dictionary = new InMemoryDictionary([createWord('LUNE', 4), createWord('LIVRE'), createWord('CABANE', 6)]);
    vi.spyOn(Math, 'random').mockReturnValue(0);

    // When
    const pickedWord = dictionary.pickRandomWord();

    // Then
    expect(pickedWord).toHaveLength(5);
  });

  it('Given no word exists for the requested length, When picking a random word, Then it should throw an infrastructure error', () => {
    // Given
    const dictionary = new InMemoryDictionary([createWord('LIVRE')]);

    // When
    const pickMissingLength = () => dictionary.pickRandomWord(4);

    // Then
    expect(pickMissingLength).toThrow('InMemoryDictionary has no word with 4 letters');
  });
});
