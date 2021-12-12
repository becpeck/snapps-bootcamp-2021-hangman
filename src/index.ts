import {
  Field,
  PublicKey,
  SmartContract,
  state,
  State,
  method,
  UInt64,
  Optional,
  CircuitValue,
  arrayProp,
  Bool,
  Poseidon,
  Mina,
  isReady,
  PrivateKey,
  Party,
  shutdown,
  Circuit,
} from 'snarkyjs';

export class Word extends CircuitValue {
  // value: Field[];
  // length: Field;
  @arrayProp(Field, 6) value: Field[];

  constructor(letters: number[]) {
    super();

    this.value = letters.map((letter) => new Field(letter));
    // this.length = Field(letters.length);
  }

  hash() {
    return Poseidon.hash(this.value);
  }

  // getLength() {
  //   console.warn('Word.getLength() === UNTESTED');
  //   return this.length;
  // }

  toString() {
    // let string = ""
    // for (let i = 0; i < parseInt(this.getLength().toString()); i++) {
    //   string.
    // }
    return String.fromCharCode(
      ...this.value.map((field) => parseInt(field.toString()) + 96)
    );
  }

  // reveal() {
  //   let stringWord = []
  //   for (let i = 0; i < 6; i++) {
  //     stringWord.push(this.value[i].toString())
  //   }
  //   return stringWord
  // }
}

export class Hangman extends SmartContract {
  word: Word;
  hangmanParts: Field;
  guessed: Optional<Field>[];
  incorrect: Field[];

  @state(Field) wordHash: State<Field>;
  // @state(Field) wordLength: State<Field>;
  @state(Field) outcome: State<Optional<Bool>>;
  // @state(Bool) wasGuessed: State<Bool>;

  constructor(initialBalance: UInt64, address: PublicKey, word: Word) {
    super(address);
    this.balance.addInPlace(initialBalance);

    this.word = word;
    this.wordHash = State.init(this.word.hash());
    // this.wordLength = State.init(this.word.getLength());
    // game outcome: is game over? was game won?
    this.outcome = State.init(new Optional(Bool(false), Bool(false)));

    this.hangmanParts = Field.zero;
    // letters guessed correctly in word
    this.guessed = Array.from(
      { length: 6 },
      () => new Optional(Bool(false), Field.zero)
    );
    // letters guessed that were incorrect, 8 ends game with loss
    // this.incorrect = Array.from({ length: 8 }, () =>
    //   new Optional(Bool(false), Field(0))
    // )
    this.incorrect = [];

    // this.wasGuessed = State.init(Bool(false));
  }

  @method isGuessedFull() {
    console.warn('Hangman.isGuessedFull() === UNTESTED');
    let anyEmptyGuess = Bool(false);
    for (let i = 0; i < 6; i++) {
      anyEmptyGuess = Circuit.if(
        Bool.not(this.guessed[i].isSome),
        Bool(true),
        anyEmptyGuess
      );
    }
    return Bool.not(anyEmptyGuess);
  }

  @method isHangmanFull() {
    console.warn('Hangman.isHangmanFull() === UNTESTED');
    return this.hangmanParts.gte(8);
  }

  @method guessLetter(letter: Field) {
    console.warn('Hangman.guessLetter(letter: Field) === UNTESTED');
    for (let i = 0; i < 6; i++) {
      // make sure current letter has not been guessed
      this.guessed[i].isSome.assertEquals(false);

      // update guessed with isSome true and letter if letter matches
      this.guessed[i] = Circuit.if(
        this.word.value[i].equals(letter),
        new Optional(Bool(true), letter),
        this.guessed[i]
      );
      // update incorrect with letter if letter does not match
      let incorrect = Circuit.if(
        Bool.not(this.word.value[i].equals(letter)),
        new Optional(Bool(true), letter),
        new Optional(Bool(false), Field.zero)
      );
      incorrect.isSome && this.incorrect.push(incorrect.value);

      // increment hangman parts if letter does not match
      this.hangmanParts.add(
        Circuit.if(
          Bool.not(this.word.value[i].equals(letter)),
          Field.one,
          Field.zero
        )
      );
    }
  }

  @method async guessWord(word: Word) {
    console.warn('Hangman.guessWord(word: Word) === UNTESTED');
    let wordHash = await this.wordHash.get();
    // add hangman part if incorrect guess
    this.hangmanParts.add(
      Circuit.if(Bool.not(wordHash.equals(word.hash())), Field.one, Field.zero)
    );

    // run win only if correct guess
    wordHash.assertEquals(word.hash());
    console.log('running win code');
    // update each letter in guessed to show correct guess
    this.guessed = word.value.map((letter) => new Optional(Bool(true), letter));
    // update outcome to isSome true, won true
    this.outcome.set(new Optional(Bool(true), Bool(true)));
  }
}

async function main(word: string) {
  await isReady;
  console.log('isReady');

  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  const account1 = Local.testAccounts[0].privateKey;
  const account2 = Local.testAccounts[1].privateKey;

  const snappPrivateKey = PrivateKey.random();
  const snappPublicKey = snappPrivateKey.toPublicKey();

  let strToArray = (word: string) =>
    word.split('').map((char) => char.charCodeAt(0) - 96);

  console.log('\n====== DEPLOYING ======\n');
  let snapp: Hangman;
  console.log('before transaction');
  await Mina.transaction(account1, async () => {
    const initialBalance = UInt64.fromNumber(1000000);
    const p = await Party.createSigned(account2);
    p.balance.addInPlace(initialBalance);
    snapp = new Hangman(
      initialBalance,
      snappPublicKey,
      new Word(strToArray(word))
    );
  })
    .send()
    .wait()
    .catch((e) => console.error(e));

  console.log('initial snapp state');
  // printSnappState()

  async function printSnappState() {
    let snappState = (await Mina.getAccount(snappPublicKey)).snapp.appState;
    let wordHash = BigInt(snappState[0].toString()).toString(16);
    // let wordLength = parseInt(snappState[1].toString())
    let outcome = snappState[2].toString();
    // let wasGuessed = snappState[1].equals(true).toBoolean();
    // return { wordHash, wasGuessed };
    console.log(`wordHash: ${wordHash}`);
    // console.log(`wordLength: ${wordLength}`)
    console.log(`outcome: ${outcome}`);
  }

  shutdown();
}

main('banana');

// console.log("initial state")
// wasGuessed = await printSnappState()

// // if (!wasGuessed) {
//   console.log('\n\n=== GUESSING "banana" ===\n\n');
//   await Mina.transaction(account1, async () => {
//     await snapp.submitGuess(new Word(wordToIntArray('banana')))
//   }).send().wait().catch(e => console.error(e));

//   console.log('state after guess "banana"')
//   wasGuessed = await printSnappState()
// // }
