import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../../src/web/App';

describe('App', () => {
  it('Given the Wordle web application, When it is rendered, Then the submit button should be visible', () => {
    // Given / When
    render(<App />);

    // Then
    expect(screen.getByRole('button', { name: /vérifier/i })).toBeInTheDocument();
  });
});
