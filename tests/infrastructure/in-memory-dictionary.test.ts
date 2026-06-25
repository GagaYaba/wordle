import { describe, expect, it } from 'vitest';
import type { Word } from '../../src/domain';
import { InMemoryDictionary } from '../../src/infrastructure/in-memory-dictionary';

describe('InMemoryDictionary', () => {
  it('Given an empty word list, When creating an InMemoryDictionary, Then it should throw an error', () => {
    // Given
    const emptyWords: Word[] = [];

    // When
    const createDictionary = () => new InMemoryDictionary(emptyWords);

    // Then
    expect(createDictionary).toThrow('InMemoryDictionary requires at least one word');
  });
});
