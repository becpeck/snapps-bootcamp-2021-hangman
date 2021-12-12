import { Field, isReady, shutdown } from 'snarkyjs';
import { Word, Hangman } from '../build/src/index';

describe('index.ts', () => {
  describe('foo()', () => {
    beforeAll(async () => {
      await isReady;
    });
    afterAll(async () => {
      await shutdown();
    });
    it('should be correct', async () => {
      expect(Field(1).add(1)).toEqual(Field(2));
    });

    it('word', async () => {
      let banana = 'banana'
        .split('')
        .map((letter) => letter.charCodeAt(0) - 96);
      let bananaWord = new Word(banana);

      expect(bananaWord).toEqual(new Word([2, 1, 14, 1, 14, 1]));
    });
  });
});
