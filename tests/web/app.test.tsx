import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createWord, DEFAULT_WORD_LENGTH, type Dictionary, type Word, type WordLength } from '../../src/domain';
import { createFrenchDictionary } from '../../src/infrastructure/french-word-list-loader';
import { App } from '../../src/web/App';

vi.mock('../../src/infrastructure/french-word-list-loader', () => ({
  createFrenchDictionary: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(createFrenchDictionary).mockResolvedValue(createControlledDictionary());
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('App word length selector', () => {
  it('Given the app starts, Then length 5 should be selected by default', async () => {
    // Given / When
    await renderLoadedApp();

    // Then
    expect(screen.getByRole('button', { name: '5 lettres' })).toHaveAttribute('aria-pressed', 'true');
    expect(getGameBoard(5)).toBeInTheDocument();
  });

  it('Given the user selects length 4, When the game starts, Then the grid should display 4 columns', async () => {
    // Given
    await renderLoadedApp();

    // When
    selectWordLength(4);

    // Then
    expect(screen.getByRole('button', { name: '4 lettres' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(getGameBoard(4)).getAllByLabelText(/case vide/i)).toHaveLength(24);
  });

  it('Given the user selects length 6, When the game starts, Then the grid should display 6 columns', async () => {
    // Given
    await renderLoadedApp();

    // When
    selectWordLength(6);

    // Then
    expect(screen.getByRole('button', { name: '6 lettres' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(getGameBoard(6)).getAllByLabelText(/case vide/i)).toHaveLength(36);
  });

  it('Given length 4 is selected, When the user types a 5-letter word, Then the app should prevent the fifth letter from being entered', async () => {
    // Given
    await renderLoadedApp();
    selectWordLength(4);

    // When
    clickVirtualKeyboardWord('POMME');

    // Then
    const gameBoard = getGameBoard(4);
    expect(within(gameBoard).queryByText('E')).not.toBeInTheDocument();
    expect(within(gameBoard).getAllByText('M')).toHaveLength(2);
  });

  it('Given length 6 is selected, When the user submits the controlled secret word, Then the victory message should appear', async () => {
    // Given
    await renderLoadedApp();
    selectWordLength(6);

    // When
    clickVirtualKeyboardWord('CABANE');
    submitCurrentGuess();

    // Then
    expect(await screen.findByText(/bravo/i)).toBeInTheDocument();
  });
});

describe('App confirmed letter hints', () => {
  it('Given a previous attempt has a correct letter, Then the active row should show it as a visual hint', async () => {
    // Given
    await renderLoadedApp();

    // When
    clickVirtualKeyboardWord('POMME');
    submitCurrentGuess();

    // Then
    expect(within(getGameBoard(5)).getByLabelText('E indice confirme')).toBeInTheDocument();
  });

  it('Given a confirmed letter hint is visible, When the player types and deletes another letter there, Then the hint should be restored', async () => {
    // Given
    await renderLoadedApp();
    clickVirtualKeyboardWord('POMME');
    submitCurrentGuess();

    // When
    clickVirtualKeyboardWord('MOUTS');

    // Then
    expect(within(getGameBoard(5)).queryByLabelText('E indice confirme')).not.toBeInTheDocument();

    // When
    fireEvent.keyDown(window, { key: 'Backspace' });

    // Then
    expect(within(getGameBoard(5)).getByLabelText('E indice confirme')).toBeInTheDocument();
  });

  it('Given a confirmed letter hint is visible, When the user starts another game, Then no previous hint should remain', async () => {
    // Given
    await renderLoadedApp();
    clickVirtualKeyboardWord('POMME');
    submitCurrentGuess();

    // When
    clickVirtualKeyboardWord('LIVRE');
    submitCurrentGuess();
    fireEvent.click(screen.getByRole('button', { name: /nouvelle partie/i }));

    // Then
    expect(within(getGameBoard(5)).queryByLabelText('E indice confirme')).not.toBeInTheDocument();
    expect(within(getGameBoard(5)).getAllByLabelText(/case vide/i)).toHaveLength(30);
  });

  it('Given a confirmed letter hint is visible, When the user changes word length, Then no previous hint should remain', async () => {
    // Given
    await renderLoadedApp();
    clickVirtualKeyboardWord('POMME');
    submitCurrentGuess();

    // When
    selectWordLength(4);

    // Then
    expect(within(getGameBoard(4)).queryByLabelText('E indice confirme')).not.toBeInTheDocument();
    expect(within(getGameBoard(4)).getAllByLabelText(/case vide/i)).toHaveLength(24);
  });

  it('Given a confirmed letter hint is visible, When the user disables hints, Then the hint should be hidden', async () => {
    // Given
    await renderLoadedApp();
    clickVirtualKeyboardWord('POMME');
    submitCurrentGuess();

    // When
    fireEvent.click(getHintToggleButton());

    // Then
    expect(getHintToggleButton()).toHaveAttribute('aria-pressed', 'false');
    expect(within(getGameBoard(5)).queryByLabelText('E indice confirme')).not.toBeInTheDocument();
    expect(within(getGameBoard(5)).getByLabelText('E CORRECT')).toBeInTheDocument();
  });

  it('Given hints are disabled, When the user enables hints again, Then the hint should be visible again', async () => {
    // Given
    await renderLoadedApp();
    clickVirtualKeyboardWord('POMME');
    submitCurrentGuess();
    fireEvent.click(getHintToggleButton());

    // When
    fireEvent.click(getHintToggleButton());

    // Then
    expect(getHintToggleButton()).toHaveAttribute('aria-pressed', 'true');
    expect(within(getGameBoard(5)).getByLabelText('E indice confirme')).toBeInTheDocument();
  });

  it('Given the player has typed letters in the active row, When the user disables hints, Then the current guess should be preserved', async () => {
    // Given
    await renderLoadedApp();
    clickVirtualKeyboardWord('POMME');
    submitCurrentGuess();
    clickVirtualKeyboardWord('MOUT');

    // When
    fireEvent.click(getHintToggleButton());

    // Then
    expect(within(getGameBoard(5)).getByLabelText('T')).toBeInTheDocument();
    expect(within(getGameBoard(5)).queryByLabelText('E indice confirme')).not.toBeInTheDocument();
  });

  it('Given hints are disabled, When the user starts a new game, Then hints should remain disabled', async () => {
    // Given
    await renderLoadedApp();
    fireEvent.click(getHintToggleButton());
    clickVirtualKeyboardWord('POMME');
    submitCurrentGuess();
    clickVirtualKeyboardWord('LIVRE');
    submitCurrentGuess();

    // When
    fireEvent.click(screen.getByRole('button', { name: /nouvelle partie/i }));
    clickVirtualKeyboardWord('POMME');
    submitCurrentGuess();

    // Then
    expect(getHintToggleButton()).toHaveAttribute('aria-pressed', 'false');
    expect(within(getGameBoard(5)).queryByLabelText('E indice confirme')).not.toBeInTheDocument();
  });
});

class FakeDictionary implements Dictionary {
  constructor(private readonly words: readonly Word[]) {}

  contains(word: Word): boolean {
    return this.words.includes(word);
  }

  pickRandomWord(wordLength: WordLength = DEFAULT_WORD_LENGTH): Word {
    const secretWord = this.words.find((word) => word.length === wordLength);

    if (!secretWord) {
      throw new Error(`Missing test word for ${wordLength} letters`);
    }

    return secretWord;
  }
}

function createControlledDictionary(): Dictionary {
  return new FakeDictionary([
    createWord('LUNE', 4),
    createWord('ROSE', 4),
    createWord('LIVRE'),
    createWord('POMME'),
    createWord('MOUTS'),
    createWord('CABANE', 6),
    createWord('BANANE', 6),
  ]);
}

async function renderLoadedApp() {
  render(<App />);

  await screen.findByRole('button', { name: /v.rifier/i });
}

function selectWordLength(wordLength: WordLength) {
  fireEvent.click(screen.getByRole('button', { name: `${wordLength} lettres` }));
}

function clickVirtualKeyboardWord(word: string) {
  const keyboard = screen.getByLabelText(/clavier virtuel/i);

  Array.from(word).forEach((letter) => {
    fireEvent.click(within(keyboard).getByRole('button', { name: letter }));
  });
}

function submitCurrentGuess() {
  fireEvent.click(screen.getByRole('button', { name: /v.rifier/i }));
}

function getHintToggleButton() {
  return screen.getByRole('button', { name: /lettres en surbrillance/i });
}

function getGameBoard(wordLength: WordLength) {
  return screen.getByLabelText(`Grille des tentatives, ${wordLength} lettres`);
}
