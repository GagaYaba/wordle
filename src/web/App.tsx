import { useCallback, useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import {
  createWord,
  DEFAULT_WORD_LENGTH,
  GameAlreadyFinishedError,
  type GameState,
  InvalidWordCharactersError,
  InvalidWordLengthError,
  type LetterFeedback,
  MAX_ATTEMPTS,
  SUPPORTED_WORD_LENGTHS,
  type WordLength,
  WordleGame,
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
  isHint?: boolean;
};

type KeyboardFeedbacks = Partial<Record<string, LetterFeedback>>;
type ConfirmedLetters = Partial<Record<number, string>>;
type HelpVariant = 'correct' | 'misplaced' | 'absent';
type TileStyle = CSSProperties & { '--tile-delay': string };
type GridStyle = CSSProperties & { '--word-length': number };

export function App() {
  const [wordleGame, setWordleGame] = useState<WordleGame | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentGuess, setCurrentGuess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [selectedWordLength, setSelectedWordLength] = useState<WordLength>(DEFAULT_WORD_LENGTH);
  const [lastSubmittedRowIndex, setLastSubmittedRowIndex] = useState<number | null>(null);
  const [invalidRowIndex, setInvalidRowIndex] = useState<number | null>(null);
  const [invalidAttemptAnimationKey, setInvalidAttemptAnimationKey] = useState(0);

  const isGameFinished = gameState?.status !== 'IN_PROGRESS';
  const rows = useMemo(
    () => (gameState ? buildGridRows(gameState, currentGuess, hintsEnabled) : []),
    [currentGuess, gameState, hintsEnabled],
  );
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
      setGameState(loadedGame.start(DEFAULT_WORD_LENGTH));
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
        if (previousGuess.length >= (gameState?.wordLength ?? selectedWordLength)) {
          return previousGuess;
        }

        return `${previousGuess}${letter.toUpperCase()}`;
      });
      setErrorMessage('');
      setInvalidRowIndex(null);
    },
    [gameState?.wordLength, isGameFinished, selectedWordLength],
  );

  const removeLastLetter = useCallback(() => {
    if (isGameFinished) {
      return;
    }

    setCurrentGuess((previousGuess) => previousGuess.slice(0, -1));
    setErrorMessage('');
    setInvalidRowIndex(null);
  }, [isGameFinished]);

  const submitGuess = useCallback(() => {
    if (!gameState || !wordleGame || isGameFinished) {
      return;
    }

    try {
      const playerGuess = createWord(currentGuess, gameState.wordLength);
      const updatedGame = wordleGame.play(gameState, playerGuess);
      const submittedRowIndex = gameState.attempts.length;

      setLastSubmittedRowIndex(submittedRowIndex);
      setInvalidRowIndex(null);
      setGameState(updatedGame);
      setCurrentGuess('');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, gameState.wordLength));
      setInvalidRowIndex(gameState.attempts.length);
      setInvalidAttemptAnimationKey((currentKey) => currentKey + 1);
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

    startGameWithLength(selectedWordLength);
  }

  function startGameWithLength(wordLength: WordLength) {
    if (!wordleGame) {
      setSelectedWordLength(wordLength);
      return;
    }

    setSelectedWordLength(wordLength);
    setGameState(wordleGame.start(wordLength));
    setCurrentGuess('');
    setErrorMessage('');
    setLastSubmittedRowIndex(null);
    setInvalidRowIndex(null);
  }

  return (
    <main className="app-shell" aria-label="Wordle">
      <Header />

      <div className="game-container">
        <div className="game-side-controls">
          <button
            className={`hint-toggle-button${hintsEnabled ? ' hint-toggle-button--active' : ''}`}
            type="button"
            aria-label={hintsEnabled ? 'Masquer les lettres en surbrillance' : 'Afficher les lettres en surbrillance'}
            aria-pressed={hintsEnabled}
            onClick={() => setHintsEnabled((enabled) => !enabled)}
          >
            <LightbulbIcon />
          </button>

          <button
            className="help-floating-button"
            type="button"
            aria-label="Ouvrir l'aide"
            onClick={() => setIsHelpOpen(true)}
          >
            ?
          </button>

          {gameState && <WordLengthSelector selectedWordLength={gameState.wordLength} onSelect={startGameWithLength} />}
        </div>

        {!gameState ? (
          <section className="loading-panel" aria-live="polite">
            Chargement du dictionnaire...
          </section>
        ) : (
          <>
            <section className="game-stage" aria-label="Plateau Wordle">
              <GameGrid
                gameState={gameState}
                invalidAttemptAnimationKey={invalidAttemptAnimationKey}
                invalidRowIndex={invalidRowIndex}
                lastSubmittedRowIndex={lastSubmittedRowIndex}
                rows={rows}
              />

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

function LightbulbIcon() {
  return (
    <svg className="hint-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.74V16h8v-1.26A7 7 0 0 0 12 2Z" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 5 0" />
    </svg>
  );
}

function WordLengthSelector({
  onSelect,
  selectedWordLength,
}: {
  onSelect: (wordLength: WordLength) => void;
  selectedWordLength: WordLength;
}) {
  return (
    <section className="word-length-selector" aria-label="Longueur du mot">
      {SUPPORTED_WORD_LENGTHS.map((wordLength) => (
        <button
          className={`word-length-button${wordLength === selectedWordLength ? ' word-length-button--active' : ''}`}
          key={wordLength}
          type="button"
          aria-label={`${wordLength} lettres`}
          aria-pressed={wordLength === selectedWordLength}
          onClick={() => onSelect(wordLength)}
        >
          {wordLength}
        </button>
      ))}
    </section>
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

function GameGrid({
  gameState,
  invalidAttemptAnimationKey,
  invalidRowIndex,
  lastSubmittedRowIndex,
  rows,
}: {
  gameState: GameState;
  invalidAttemptAnimationKey: number;
  invalidRowIndex: number | null;
  lastSubmittedRowIndex: number | null;
  rows: Tile[][];
}) {
  return (
    <section
      className="game-board"
      aria-label={`Grille des tentatives, ${gameState.wordLength} lettres`}
      style={{ '--word-length': gameState.wordLength } as GridStyle}
    >
      <div className="grid-rows">
        {rows.map((row, rowIndex) => (
          <div
            className={getGridRowClassName(gameState, rowIndex, lastSubmittedRowIndex, invalidRowIndex)}
            key={getGridRowKey(rowIndex, invalidRowIndex, invalidAttemptAnimationKey)}
          >
            {row.map((tile, tileIndex) => {
              const tileClassName = `tile${tile.feedback ? ` tile--${tile.feedback.toLowerCase()}` : ''}${
                tile.letter && !tile.feedback && !tile.isHint ? ' tile--pending' : ''
              }${tile.isHint ? ' tile--hint' : ''}`;

              return (
                <div
                  className={tileClassName}
                  key={`tile-${rowIndex}-${tileIndex}`}
                  style={{ '--tile-delay': `${tileIndex * 100}ms` } as TileStyle}
                  aria-label={getTileLabel(tile)}
                >
                  {tile.letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

function getGridRowClassName(
  gameState: GameState,
  rowIndex: number,
  lastSubmittedRowIndex: number | null,
  invalidRowIndex: number | null,
): string {
  const classes = ['grid-row'];
  const lastPlayedRowIndex = gameState.attempts.length - 1;

  if (rowIndex === lastSubmittedRowIndex) {
    classes.push('is-revealing');
  }

  if (rowIndex === invalidRowIndex) {
    classes.push('is-shaking');
  }

  if (gameState.status === 'WON' && rowIndex === lastPlayedRowIndex) {
    classes.push('is-winning');
  }

  if (gameState.status === 'LOST' && rowIndex === lastPlayedRowIndex) {
    classes.push('is-losing');
  }

  return classes.join(' ');
}

function getGridRowKey(rowIndex: number, invalidRowIndex: number | null, invalidAttemptAnimationKey: number): string {
  if (rowIndex === invalidRowIndex) {
    return `row-${rowIndex}-invalid-${invalidAttemptAnimationKey}`;
  }

  return `row-${rowIndex}`;
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

function buildGridRows(gameState: GameState, currentGuess: string, hintsEnabled: boolean): Tile[][] {
  const confirmedLetters = hintsEnabled ? buildConfirmedLetters(gameState) : {};
  const playedRows = gameState.attempts.map((attempt) =>
    attempt.letters.map((letterResult) => ({
      letter: letterResult.letter,
      feedback: letterResult.feedback,
    })),
  );

  const rows: Tile[][] = [...playedRows];

  if (gameState.status === 'IN_PROGRESS' && rows.length < MAX_ATTEMPTS) {
    rows.push(buildCurrentGuessRow(currentGuess, gameState.wordLength, confirmedLetters));
  }

  while (rows.length < MAX_ATTEMPTS) {
    rows.push(buildEmptyRow(gameState.wordLength));
  }

  return rows.slice(0, MAX_ATTEMPTS);
}

function buildCurrentGuessRow(currentGuess: string, wordLength: WordLength, confirmedLetters: ConfirmedLetters): Tile[] {
  return Array.from({ length: wordLength }, (_, index) => {
    const typedLetter = currentGuess[index] ?? '';
    const hintedLetter = typedLetter ? '' : (confirmedLetters[index] ?? '');

    return {
      letter: typedLetter || hintedLetter,
      isHint: Boolean(hintedLetter),
    };
  });
}

function buildEmptyRow(wordLength: WordLength): Tile[] {
  return Array.from({ length: wordLength }, () => ({
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

function buildConfirmedLetters(gameState: GameState): ConfirmedLetters {
  return gameState.attempts.reduce<ConfirmedLetters>((confirmedLetters, attempt) => {
    attempt.letters.forEach((letterResult) => {
      if (letterResult.feedback === 'CORRECT') {
        confirmedLetters[letterResult.position] = letterResult.letter;
      }
    });

    return confirmedLetters;
  }, {});
}

function getTileLabel(tile: Tile): string {
  if (tile.feedback) {
    return `${tile.letter} ${tile.feedback}`;
  }

  if (tile.isHint) {
    return `${tile.letter} indice confirme`;
  }

  return tile.letter || 'case vide';
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

function getErrorMessage(error: unknown, wordLength: WordLength): string {
  if (error instanceof InvalidWordLengthError) {
    return `Le mot doit contenir exactement ${wordLength} lettres.`;
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
