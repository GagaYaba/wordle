import { createWord, type Word, type WordLength } from '../domain';

export const DEFAULT_FRENCH_WORDS: readonly Word[] = [
  ...createWordsForLength(['CHAT', 'LUNE', 'ROSE', 'VENT', 'BLEU'], 4),
  ...createWordsForLength(
    [
      'LIVRE',
      'TABLE',
      'CHIEN',
      'RADIO',
      'CANAL',
      'BALLE',
      'PORTE',
      'ROUTE',
      'PLAGE',
      'FLEUR',
      'MONDE',
      'CARTE',
      'PIANO',
      'NUAGE',
      'TERRE',
      'POMME',
      'LAPIN',
      'ECOLE',
      'AVION',
      'LAMPE',
      'ARBRE',
      'VACHE',
      'NEIGE',
      'FRUIT',
      'VILLE',
    ],
    5,
  ),
  ...createWordsForLength(['CABANE', 'BANANE', 'ORANGE', 'JARDIN', 'SOLEIL'], 6),
];

function createWordsForLength(words: string[], wordLength: WordLength): Word[] {
  return words.map((word) => createWord(word, wordLength));
}
