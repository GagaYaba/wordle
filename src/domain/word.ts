import { InvalidWordCharactersError, InvalidWordLengthError } from './errors';

export const WORD_LENGTH = 5;

const ALPHABETIC_WORD_PATTERN = /^[A-Za-z]+$/;

declare const wordBrand: unique symbol;
declare const letterBrand: unique symbol;

export type Word = string & { readonly [wordBrand]: 'Word' };
export type Letter = string & { readonly [letterBrand]: 'Letter' };

export function createWord(input: string): Word {
  if (input.length !== WORD_LENGTH) {
    throw new InvalidWordLengthError(input);
  }

  if (!ALPHABETIC_WORD_PATTERN.test(input)) {
    throw new InvalidWordCharactersError(input);
  }

  return input.toUpperCase() as Word;
}
