import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  createWord,
  GameAlreadyFinishedError,
  type GameState,
  InvalidWordCharactersError,
  InvalidWordLengthError,
  type LetterFeedback,
  MAX_ATTEMPTS,
  WordleGame,
  WORD_LENGTH,
  WordNotInDictionaryError,
} from '../domain';
import { createFrenchDictionary } from '../infrastructure/french-word-list-loader';
import './styles.css';

const TITLE_LETTERS = ['W', 'O', 'R', 'D', 'L', 'E'];
const KEYBOARD_ROWS = [
  ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
  ['ENTER', 'W', 'X', 'C', 'V', 'B', 'N', 'BACKSPACE'],
];
const FEEDBACK_PRIORITY: Record<LetterFeedback, number> = {
  ABSENT: 0,
  MISPLACED: 1,
  CORRECT: 2,
};

type Tile = {
  letter: string;
  feedback?: LetterFeedback;
};

type KeyboardFeedbacks = Partial<Record<string, LetterFeedback>>;
type HelpVariant = 'correct' | 'misplaced' | 'absent';

export function App() {
  const [wordleGame, setWordleGame] = useState<WordleGame | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentGuess, setCurrentGuess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const isGameFinished = gameState?.status !== 'IN_PROGRESS';
  const rows = useMemo(() => (gameState ? buildGridRows(gameState, currentGuess) : []), [currentGuess, gameState]);
  const keyboardFeedbacks = useMemo(() => (gameState ? buildKeyboardFeedbacks(gameState) : {}), [gameState]);

  useEffect(() => {
    let isMounted = true;

    async function loadDictionary() {
      const dictionary = await createFrenchDictionary();

      if (!isMounted) {
        return;
      }

      const loadedGame = new WordleGame(dictionary);
      setWordleGame(loadedGame);
      setGameState(loadedGame.start());
    }

    void loadDictionary();

    return () => {
      isMounted = false;
    };
  }, []);

  const appendLetter = useCallback(
    (letter: string) => {
      if (isGameFinished) {
        return;
      }

      setCurrentGuess((previousGuess) => {
        if (previousGuess.length >= WORD_LENGTH) {
          return previousGuess;
        }

        return `${previousGuess}${letter.toUpperCase()}`;
      });
      setErrorMessage('');
    },
    [isGameFinished],
  );

  const removeLastLetter = useCallback(() => {
    if (isGameFinished) {
      return;
    }

    setCurrentGuess((previousGuess) => previousGuess.slice(0, -1));
    setErrorMessage('');
  }, [isGameFinished]);

  const submitGuess = useCallback(() => {
    if (!gameState || !wordleGame || isGameFinished) {
      return;
    }

    try {
      const playerGuess = createWord(currentGuess);
      const updatedGame = wordleGame.play(gameState, playerGuess);

      setGameState(updatedGame);
      setCurrentGuess('');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }, [currentGuess, gameState, isGameFinished, wordleGame]);

  useEffect(() => {
    function handlePhysicalKeyboard(event: KeyboardEvent) {
      if (isHelpOpen) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setIsHelpOpen(false);
        }

        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        appendLetter(event.key);
        return;
      }

      if (event.key === 'Backspace') {
        event.preventDefault();
        removeLastLetter();
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        submitGuess();
      }
    }

    window.addEventListener('keydown', handlePhysicalKeyboard);

    return () => window.removeEventListener('keydown', handlePhysicalKeyboard);
  }, [appendLetter, isHelpOpen, removeLastLetter, submitGuess]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitGuess();
  }

  function handleKeyboardKey(key: string) {
    if (key === 'ENTER') {
      submitGuess();
      return;
    }

    if (key === 'BACKSPACE') {
      removeLastLetter();
      return;
    }

    appendLetter(key);
  }

  function startNewGame() {
    if (!wordleGame) {
      return;
    }

    setGameState(wordleGame.start());
    setCurrentGuess('');
    setErrorMessage('');
  }

  return (
    <main className="app-shell" aria-label="Wordle">
      <Header />

      <div className="game-container">
        <button
          className="help-floating-button"
          type="button"
          aria-label="Ouvrir l'aide"
          onClick={() => setIsHelpOpen(true)}
        >
          ?
        </button>

        {!gameState ? (
          <section className="loading-panel" aria-live="polite">
            Chargement du dictionnaire...
          </section>
        ) : (
          <>
            <section className="game-stage" aria-label="Plateau Wordle">
              <GameGrid rows={rows} />

              <section className="status-panel" aria-label="Etat de la partie">
                <p className="attempts">{gameState.remainingAttempts} tentative(s)</p>

                {gameState.status === 'WON' && <p className="message message--success">Bravo, mot trouvé !</p>}
                {gameState.status === 'LOST' && (
                  <p className="message message--loss">Perdu ! Le mot était : {gameState.secretWord}</p>
                )}
                {errorMessage && <p className="message message--error">{errorMessage}</p>}
              </section>

              <form className="verify-form" onSubmit={handleSubmit}>
                <button className="verify-button" disabled={isGameFinished} type="submit">
                  VÉRIFIER
                </button>
              </form>

              {isGameFinished && (
                <button className="new-game-button" onClick={startNewGame} type="button">
                  Nouvelle partie
                </button>
              )}
            </section>

            <VirtualKeyboard
              disabled={isGameFinished}
              feedbacks={keyboardFeedbacks}
              onKeyPress={handleKeyboardKey}
            />
          </>
        )}
      </div>

      {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
    </main>
  );
}

function Header() {
  return (
    <header className="top-bar">
      <h1 className="wordle-title" aria-label="WORDLE">
        {TITLE_LETTERS.map((letter, index) => (
          <span className={`title-bubble title-bubble--${index}`} key={`${letter}-${index}`} aria-hidden="true">
            {letter}
          </span>
        ))}
      </h1>
    </header>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="help-overlay" onClick={onClose}>
      <section
        aria-labelledby="help-modal-title"
        aria-modal="true"
        className="help-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <button className="help-close-button" type="button" aria-label="Fermer l'aide" onClick={onClose}>
          ×
        </button>

        <h2 id="help-modal-title">Comment jouer ?</h2>

        <p>Devinez le mot en six essais. Chaque essai doit être un mot valide.</p>
        <p>Après chaque essai, les lettres changent de couleur selon leur proximité avec la solution.</p>

        <div className="help-examples" aria-label="Exemples de feedback">
          <HelpExample
            highlightedLetter="P"
            letters={['P', 'O', 'M', 'M', 'E']}
            text="est la bonne lettre à la bonne place"
            variant="correct"
          />
          <HelpExample
            highlightedLetter="N"
            letters={['L', 'A', 'P', 'I', 'N']}
            text="n'est pas dans le mot"
            variant="absent"
          />
          <HelpExample
            highlightedLetter="E"
            letters={['F', 'L', 'E', 'U', 'R']}
            text="est la bonne lettre à la mauvaise place"
            variant="misplaced"
          />
        </div>
      </section>
    </div>
  );
}

function HelpExample({
  highlightedLetter,
  letters,
  text,
  variant,
}: {
  highlightedLetter: string;
  letters: string[];
  text: string;
  variant: HelpVariant;
}) {
  return (
    <div className="help-example">
      <div className="help-example-word" aria-label={letters.join('')}>
        {letters.map((letter, index) => (
          <span
            className={`help-example-tile${letter === highlightedLetter ? ` help-example-tile--${variant}` : ''}`}
            key={`${letter}-${index}`}
          >
            {letter}
          </span>
        ))}
      </div>
      <p>
        <span className={`help-example-letter help-example-letter--${variant}`}>
          {highlightedLetter}
        </span>{' '}
        {text}
      </p>
    </div>
  );
}

function GameGrid({ rows }: { rows: Tile[][] }) {
  return (
    <section className="game-board" aria-label="Grille des tentatives">
      <div className="grid-rows">
        {rows.map((row, rowIndex) => (
          <div className="grid-row" key={`row-${rowIndex}`}>
            {row.map((tile, tileIndex) => (
              <div
                className={`tile${tile.feedback ? ` tile--${tile.feedback.toLowerCase()}` : ''}${
                  tile.letter && !tile.feedback ? ' tile--pending' : ''
                }`}
                key={`tile-${rowIndex}-${tileIndex}`}
                aria-label={tile.feedback ? `${tile.letter} ${tile.feedback}` : tile.letter || 'case vide'}
              >
                {tile.letter}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function VirtualKeyboard({
  disabled,
  feedbacks,
  onKeyPress,
}: {
  disabled: boolean;
  feedbacks: KeyboardFeedbacks;
  onKeyPress: (key: string) => void;
}) {
  return (
    <section className="keyboard" aria-label="Clavier virtuel">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div className="keyboard-row" key={`keyboard-row-${rowIndex}`}>
          {row.map((key) => {
            const feedback = feedbacks[key];
            const isSpecialKey = key === 'ENTER' || key === 'BACKSPACE';
            const label = getKeyboardLabel(key);

            return (
              <button
                className={`keyboard-key${isSpecialKey ? ' keyboard-key--wide' : ''}${
                  feedback ? ` keyboard-key--${feedback.toLowerCase()}` : ''
                }`}
                disabled={disabled}
                key={key}
                onClick={() => onKeyPress(key)}
                type="button"
                aria-label={label}
              >
                {label}
              </button>
            );
          })}
        </div>
      ))}
    </section>
  );
}

function buildGridRows(gameState: GameState, currentGuess: string): Tile[][] {
  const playedRows = gameState.attempts.map((attempt) =>
    attempt.letters.map((letterResult) => ({
      letter: letterResult.letter,
      feedback: letterResult.feedback,
    })),
  );

  const rows: Tile[][] = [...playedRows];

  if (gameState.status === 'IN_PROGRESS' && rows.length < MAX_ATTEMPTS) {
    rows.push(buildCurrentGuessRow(currentGuess));
  }

  while (rows.length < MAX_ATTEMPTS) {
    rows.push(buildEmptyRow());
  }

  return rows.slice(0, MAX_ATTEMPTS);
}

function buildCurrentGuessRow(currentGuess: string): Tile[] {
  return Array.from({ length: WORD_LENGTH }, (_, index) => ({
    letter: currentGuess[index] ?? '',
  }));
}

function buildEmptyRow(): Tile[] {
  return Array.from({ length: WORD_LENGTH }, () => ({
    letter: '',
  }));
}

function buildKeyboardFeedbacks(gameState: GameState): KeyboardFeedbacks {
  return gameState.attempts.reduce<KeyboardFeedbacks>((feedbacks, attempt) => {
    attempt.letters.forEach((letterResult) => {
      const previousFeedback = feedbacks[letterResult.letter];

      if (!previousFeedback || FEEDBACK_PRIORITY[letterResult.feedback] > FEEDBACK_PRIORITY[previousFeedback]) {
        feedbacks[letterResult.letter] = letterResult.feedback;
      }
    });

    return feedbacks;
  }, {});
}

function getKeyboardLabel(key: string): string {
  if (key === 'ENTER') {
    return 'Entrée';
  }

  if (key === 'BACKSPACE') {
    return '⌫';
  }

  return key;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof InvalidWordLengthError) {
    return 'Le mot doit contenir exactement 5 lettres.';
  }

  if (error instanceof InvalidWordCharactersError) {
    return 'Le mot doit contenir uniquement des lettres.';
  }

  if (error instanceof WordNotInDictionaryError) {
    return "Ce mot n'est pas dans le dictionnaire.";
  }

  if (error instanceof GameAlreadyFinishedError) {
    return 'La partie est déjà terminée.';
  }

  return 'Impossible de jouer cette tentative.';
}
