import type { AttemptResult, LetterResult } from './attempt';
import type { LetterFeedback } from './feedback';
import type { Letter, Word } from './word';

export function evaluateGuess(secretWord: Word, playerGuess: Word): AttemptResult {
  const secretLetters = Array.from(secretWord);
  const guessedLetters = Array.from(playerGuess);
  const feedbacks: LetterFeedback[] = [];
  const remainingLetters = countRemainingLettersAfterCorrectMatches(secretLetters, guessedLetters, feedbacks);

  markMisplacedAndAbsentLetters(guessedLetters, feedbacks, remainingLetters);

  return {
    guessedWord: playerGuess,
    letters: guessedLetters.map((letter, position): LetterResult => {
      return {
        letter: letter as Letter,
        position,
        feedback: feedbacks[position],
      };
    }),
  };
}

function countRemainingLettersAfterCorrectMatches(
  secretLetters: string[],
  guessedLetters: string[],
  feedbacks: LetterFeedback[],
): Record<string, number> {
  const remainingLetters: Record<string, number> = {};

  secretLetters.forEach((secretLetter, position) => {
    if (guessedLetters[position] === secretLetter) {
      feedbacks[position] = 'CORRECT';
      return;
    }

    remainingLetters[secretLetter] = (remainingLetters[secretLetter] ?? 0) + 1;
  });

  return remainingLetters;
}

function markMisplacedAndAbsentLetters(
  guessedLetters: string[],
  feedbacks: LetterFeedback[],
  remainingLetters: Record<string, number>,
): void {
  guessedLetters.forEach((guessedLetter, position) => {
    if (feedbacks[position] === 'CORRECT') {
      return;
    }

    const availableOccurrences = remainingLetters[guessedLetter] ?? 0;

    if (availableOccurrences > 0) {
      feedbacks[position] = 'MISPLACED';
      remainingLetters[guessedLetter] = availableOccurrences - 1;
      return;
    }

    feedbacks[position] = 'ABSENT';
  });
}
