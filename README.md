# Mina Snapp: Hangman

## Description

This is an attempt to create a proof-of-concept game of hangman using snarky-js via snapps-cli. Unfortunately it never got to a point of working enough to be run without errors.

The project defines a Word class, which uses an array of Field elements, holding integers that represent each letter in the secret word of a game of hangman, and which has a method returning a hash of the word.

It also defines a Hangman class extending the snarkyjs SmartContract, which creates individual games instances and contains various methods to progress through the game. A hangman game would be constructed with a word object, and store `wordHash` and `outcome` in the public smart contract state. It would store the word object itself in local state, along with `hangmanParts`, a number representing the number of 'strikes' accumulated during a game and thus the number of parts to render, `guessed`, an array of Optional objects representing each letter of the unknown word, whether it had been correctly guessed and if so, the int representation of the correct letter, and `incorrect`, an array of numbers representing letters that had been guessed and were not found in the word.

Of the methods on the Hangman class, `isGuessedFull()` would return false if any field in `guessed` still did not have a value, representing that the game had not been won via guessing all letters correctly. The method `isHangmanFull()` similarly returned true only if the count of hangman parts, or incorrect guesses, had reached 8, which would trigger the end of the game with a loss condition. Two other methods, `guessLetter(letter: Field)` and `guessWord(word: Word)` would be used to update local game state as guesses were made, and public state on the smart contract when the game was won or lost. These were intended to be placed in a web app or terminal UI in order to play an individual game, but none of them were ever properly tested, as the project never got to a point where the Hangman constructor would run without errors in a `main()` function designed to test that functions worked as expected.

This template uses TypeScript.

## How to build

```sh
npm run build
```

## How to run tests

```sh
npm run test
npm run testw # watch mode
```

## How to run coverage

```sh
npm run coverage
```

## License

[Apache-2.0](LICENSE)
