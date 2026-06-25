import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/web/App';

beforeEach(() => {
  mockDictionaryApiFailure();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('App', () => {
  it('Given the Wordle web application, When it is rendered, Then the submit button should be visible', async () => {
    // Given / When
    render(<App />);

    // Then
    expect(await screen.findByRole('button', { name: /vérifier/i })).toBeInTheDocument();
  });

  it('Given the user clicks the help button, When the help modal opens, Then the title Comment jouer should be visible', () => {
    // Given
    render(<App />);

    // When
    fireEvent.click(screen.getByRole('button', { name: /ouvrir l'aide/i }));

    // Then
    expect(screen.getByRole('dialog', { name: /comment jouer/i })).toBeInTheDocument();
  });

  it('Given the help modal is open, When the user clicks the close button, Then the title Comment jouer should no longer be visible', () => {
    // Given
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /ouvrir l'aide/i }));

    // When
    fireEvent.click(screen.getByRole('button', { name: /fermer l'aide/i }));

    // Then
    expect(screen.queryByRole('dialog', { name: /comment jouer/i })).not.toBeInTheDocument();
  });
});

function mockDictionaryApiFailure() {
  const fetchMock: typeof fetch = vi.fn(async () => {
    throw new Error('Network unavailable in UI tests');
  });

  vi.stubGlobal('fetch', fetchMock);
}
