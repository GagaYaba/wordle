import { InvalidWordCharactersError, InvalidWordLengthError } from './errors';

export const SUPPORTED_WORD_LENGTHS = [4, 5, 6] as const;
export type WordLength = (typeof SUPPORTED_WORD_LENGTHS)[number];
export const DEFAULT_WORD_LENGTH: WordLength = 5;
export const WORD_LENGTH = DEFAULT_WORD_LENGTH;

const ALPHABETIC_WORD_PATTERN = /^[A-Za-z]+$/;

declare const wordBrand: unique symbol;
declare const letterBrand: unique symbol;

export type Word = string & { readonly [wordBrand]: 'Word' };
export type Letter = string & { readonly [letterBrand]: 'Letter' };

export function isSupportedWordLength(length: number): length is WordLength {
  return SUPPORTED_WORD_LENGTHS.includes(length as WordLength);
}

export function createWord(input: string, expectedLength: WordLength = DEFAULT_WORD_LENGTH): Word {
  if (!isSupportedWordLength(expectedLength) || input.length !== expectedLength) {
    throw new InvalidWordLengthError(input, expectedLength);
  }

  if (!ALPHABETIC_WORD_PATTERN.test(input)) {
    throw new InvalidWordCharactersError(input);
  }

  return input.toUpperCase() as Word;
}
