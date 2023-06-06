import { getLettersFromWord, shuffleArray } from '@/utils/common';
import { v4 as uuidv4 } from 'uuid';

import type { Word, Id } from '@/types/global';

export class Letter {
  id: string;
  value: string;

  constructor(value: Word) {
    this.id = uuidv4();
    this.value = value;
  }
}

export class LetterBoard {
  elements: Letter[] = [];

  get ids() {
    return this.elements.map(({ id }) => id);
  }

  get letters() {
    return this.elements.map(({ value }) => value);
  }

  get word() {
    return this.elements.map(({ value }) => value).join('');
  }

  public fillBoard(word: Word) {
    this.elements = getLettersFromWord(word).map(
      (letter) => new Letter(letter)
    );
  }

  public fillBoardWithSuffle(word: Word) {
    this.elements = shuffleArray(
      getLettersFromWord(word).map((letter) => new Letter(letter))
    );
  }

  public addElement(element: Letter) {
    this.elements = [...this.elements, element];
  }

  public removeElement(element: Letter) {
    this.elements = this.elements.filter(({ id }) => element.id !== id);
  }

  public removeAllElements() {
    this.elements = [];
  }

  public getElement(id: Id) {
    return this.elements.find((element) => element.id === id);
  }
}
