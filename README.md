# Wordle — Projet TDD / DDD

## Présentation du projet

Ce projet est une implémentation du jeu Wordle en TypeScript. Le joueur doit deviner un mot secret de 5 lettres en 6 tentatives maximum.

Après chaque tentative, chaque lettre reçoit un feedback :

- `CORRECT` : la lettre est au bon endroit.
- `MISPLACED` : la lettre existe dans le mot secret, mais à une autre position.
- `ABSENT` : la lettre n'existe pas dans le mot secret.

L'application est jouable dans le navigateur via une interface web React.

Le dictionnaire de jeu charge une liste distante de mots français, filtre les mots de 5 lettres côté client, et conserve un fallback local pour rester jouable si la source distante est indisponible.

La source distante utilisée est `https://raw.githubusercontent.com/Taknok/French-Wordlist/master/francais.txt`.

Une règle importante concerne les lettres multiples : si une lettre est proposée plusieurs fois mais qu'elle existe moins de fois dans le mot secret, seules les occurrences disponibles peuvent être marquées `CORRECT` ou `MISPLACED`. Les occurrences en trop sont marquées `ABSENT`.

## Choix techniques

- TypeScript : types expressifs et sécurité autour du domaine.
- Vitest : tests unitaires rapides et lisibles.
- React : interface web jouable.
- Vite : serveur de développement et build rapides.
- TDD : les comportements métier sont décrits par les tests avant ou pendant l'implémentation.
- DDD : les concepts métier sont isolés dans le domaine avec un vocabulaire clair.

## Installation

```bash
npm install
```

Cette commande installe toutes les dépendances nécessaires au projet.

## Commandes disponibles

```bash
npm run test
```

Lance la suite de tests avec Vitest.

```bash
npm run test:watch
```

Lance les tests en mode watch.

```bash
npm run typecheck
```

Vérifie les types TypeScript sans générer de fichiers.

```bash
npm run build
```

Compile le projet et génère la version de production.

```bash
npm run dev
```

Lance l'application web en local.

## Lancer les tests

Les tests vérifient :

- la validation des mots ;
- le feedback des lettres ;
- la règle des lettres multiples ;
- la victoire ;
- la défaite après 6 tentatives ;
- les erreurs métier ;
- l'injection du dictionnaire ;
- le chargement de mots via une liste distante avec des mocks réseau déterministes ;
- le comportement déterministe grâce aux doublures de test.

```bash
npm run test
```

## Lancer le jeu

```bash
npm run dev
```

Une fois le serveur lancé, ouvrir l'URL affichée dans le terminal pour jouer au Wordle dans le navigateur.

## Architecture du projet

```txt
src/
  domain/
    word.ts
    feedback.ts
    attempt.ts
    game.ts
    dictionary.ts
    errors.ts
    evaluate-guess.ts
    wordle-game.ts
    index.ts

  infrastructure/
    in-memory-dictionary.ts
    default-french-words.ts
    french-word-list-loader.ts

  web/
    App.tsx
    main.tsx
    styles.css

tests/
  domain/
    word.test.ts
    evaluate-guess.test.ts
    game.test.ts
    wordle-game.test.ts
    errors.test.ts
  infrastructure/
    in-memory-dictionary.test.ts
    french-word-list-loader.test.ts
  web/
    app.test.tsx
  setup.test.ts
```

- `src/domain` contient la logique métier pure.
- `src/infrastructure` contient les implémentations techniques, comme le dictionnaire en mémoire, le fallback local et le chargement de mots via liste distante.
- `src/web` contient l'interface React.
- `tests/domain` contient les tests unitaires du domaine.
- `tests/infrastructure` contient les tests des implémentations techniques.
- `tests/web` contient les tests minimaux de rendu de l'interface.

Le domaine ne dépend ni de l'interface web ni de l'infrastructure.

## Démarche TDD

Le projet suit une logique TDD :

1. écrire un test décrivant un comportement attendu ;
2. lancer le test et constater qu'il échoue ;
3. écrire le minimum de code pour le faire passer ;
4. refactoriser si nécessaire sans casser les tests.

Cette démarche a été utilisée pour :

- le feedback des lettres ;
- les lettres multiples ;
- la logique de victoire et de défaite ;
- les erreurs métier ;
- l'isolation du dictionnaire.

## Modélisation du domaine

Le domaine est construit autour de concepts métier explicites :

- `Word`
- `LetterFeedback`
- `AttemptResult`
- `GameState`
- `GameStatus`
- `Dictionary`
- erreurs métier dédiées

Cette séparation permet :

- de tester le domaine sans interface ;
- de garder la logique métier indépendante de React ;
- de remplacer facilement le dictionnaire plus tard ;
- de rendre les règles du jeu lisibles dans le code.

## Règles métier couvertes

- Mot secret de 5 lettres.
- 6 tentatives maximum.
- Feedback `CORRECT`.
- Feedback `MISPLACED`.
- Feedback `ABSENT`.
- Gestion des lettres multiples.
- Victoire si le mot est trouvé.
- Défaite après 6 tentatives.
- Refus d'un mot invalide.
- Refus d'un mot absent du dictionnaire.
- Refus de jouer après la fin de partie.

## Qualité des tests

Les tests sont écrits avec Vitest et structurés autour du comportement métier.

Ils sont :

- lisibles ;
- organisés en logique Given / When / Then ;
- déterministes ;
- indépendants d'un fichier, d'une API ou d'une valeur aléatoire dans les tests du domaine.

Le `FakeDictionary` utilisé dans les tests permet de contrôler le mot secret et les mots valides.

## Séparation métier / interface

- Le domaine ne contient pas de `console.log`.
- Le domaine ne lit pas de fichier.
- Le domaine ne dépend pas de React.
- Le domaine ne dépend pas du navigateur.
- L'interface web consomme le domaine, mais ne réimplémente pas les règles Wordle.
