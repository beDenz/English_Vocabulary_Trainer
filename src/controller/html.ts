/**
 * @file Модуль работы с DOM
 * При желании, в методах можно исполизовать любые библиотеки для работы с DOM
 */

import {
  createLetterBoard,
  createLetterBlock,
  addElement,
  removeElement,
} from '@/utils/dom';
import { Letter } from '@/models/letter';

import type { Word, Id, StepIndex } from '@/types/global';

type MouseEventCallback = (id: Id) => void;
type KeyboardEventCallback = (key: string) => void;
type NewGameButtonCallback = () => void;

export abstract class Controller {
  public abstract addElementToLettersBoard(elements: Letter | Letter[]): void;
  public abstract removeElementFromLettersBoard(
    elements: Letter | Letter[]
  ): void;
  public abstract addElementToAnswerBoard(elements: Letter | Letter[]): void;
  public abstract removeElementFromAnswerBoard(element: Letter): void;
  public abstract removeAllElementFromLettersBoard(): void;
  public abstract removeAllElementFromAnswerBoard(): void;
  public abstract setSuccess(ids: Id | Id[]): void;
  public abstract setError(ids: Id | Id[]): void;
  public abstract setActive(id: Id): void;
  public abstract setCurrentStep(stepIndex: StepIndex): void;
  public abstract setTotalStep(maxSteps: number): void;
  public abstract addKeyboardEvent(callback: KeyboardEventCallback): void;
  public abstract addMouseEvent(callback: MouseEventCallback): void;
  public abstract addNewGameEvent(callback: NewGameButtonCallback): void;
  public abstract showProgressModal(): Promise<unknown>;
  public abstract createСonclution(
    data: { answer: Word; errors: number; stepIndex: number }[],
    conclution: {
      wordsWithoutErrors: number;
      errors: number;
      wordWithMostErrors: string;
    }
  ): void;
  public abstract removeСonclution(): void;
  public abstract showLoader(): void;
  public abstract hideLoader(): void;
  public abstract showNewGameButton(): void;
  public abstract hideNewGameButton(): void;
}

type HtmlControllerConstructorParams = {
  lettersId: string;
  answerId: string;
  currentQuestionId: string;
  totalQuestionsId: string;
  conclutionId: string;
  loaderId: string;
  newGameButtonId: string;
};

export class HtmlController extends Controller {
  lettersRoot: HTMLElement | null;
  answerRoot: HTMLElement | null;
  stepRoot: HTMLElement | null;
  totalStep: HTMLElement | null;
  conclution: HTMLElement | null;
  loader: HTMLElement | null;
  newGameButton: HTMLElement | null;

  letterBoard: HTMLElement = createLetterBoard([]);
  answerBoard: HTMLElement = createLetterBoard([]);

  constructor(ids: HtmlControllerConstructorParams) {
    super();

    this.lettersRoot = document.getElementById(ids.lettersId);
    this.answerRoot = document.getElementById(ids.answerId);
    this.stepRoot = document.getElementById(ids.currentQuestionId);
    this.totalStep = document.getElementById(ids.totalQuestionsId);
    this.conclution = document.getElementById(ids.conclutionId);
    this.loader = document.getElementById(ids.loaderId);
    this.newGameButton = document.getElementById(ids.newGameButtonId);

    if (this.lettersRoot && this.answerRoot) {
      addElement(this.lettersRoot, this.letterBoard);
      addElement(this.answerRoot, this.answerBoard);
    } else {
      /**
       * Рализовать обработку ошибок
       */
    }
  }

  public addElementToLettersBoard(elements: Letter | Letter[]) {
    const currentElements = Array.isArray(elements) ? elements : [elements];

    currentElements.forEach((element) => {
      const htmlElement = createLetterBlock(element.value, element.id);
      this.letterBoard = addElement(this.letterBoard, htmlElement);
    });
  }

  public removeElementFromLettersBoard(elements: Letter | Letter[]) {
    const currentElements = Array.isArray(elements) ? elements : [elements];

    currentElements.forEach((element) => {
      const htmlElement = document.getElementById(element.id);

      if (htmlElement) {
        this.letterBoard = removeElement(this.letterBoard, htmlElement);
      }
    });
  }

  public removeAllElementFromLettersBoard() {
    this.letterBoard.innerHTML = '';
  }

  public addElementToAnswerBoard(elements: Letter | Letter[]) {
    const currentElements = Array.isArray(elements) ? elements : [elements];

    currentElements.forEach((element) => {
      const htmlElement = createLetterBlock(element.value, element.id);
      this.answerBoard = addElement(this.answerBoard, htmlElement);
    });
  }

  public removeElementFromAnswerBoard(element: Letter) {
    const htmlElement = document.getElementById(element.id);

    if (htmlElement) {
      this.answerBoard = removeElement(this.answerBoard, htmlElement);
    }
  }

  public removeAllElementFromAnswerBoard() {
    this.answerBoard.innerHTML = '';
  }

  public addMouseEvent(callback: MouseEventCallback) {
    this.letterBoard.addEventListener(
      'click',
      (event: Event) => {
        const target = event.target as HTMLElement | null;

        if (target) {
          callback(target.id);
        }
      },
      false
    );
  }

  public addKeyboardEvent(callback: KeyboardEventCallback) {
    document.addEventListener('keydown', (event: KeyboardEvent) =>
      callback(event.key)
    );
  }

  public addNewGameEvent(callback: NewGameButtonCallback) {
    if (this.newGameButton) {
      this.newGameButton.addEventListener('click', callback);
    }
  }

  public setActive(ids: Id | Id[]) {
    const currentIds = Array.isArray(ids) ? ids : [ids];

    currentIds.forEach((id) => {
      const block = document.getElementById(id);

      if (block) {
        block.classList.remove('btn-danger');
        block.classList.remove('btn-success');

        block.classList.add('btn-primary');
      }
    });
  }

  public setSuccess(ids: Id | Id[]) {
    const currentIds = Array.isArray(ids) ? ids : [ids];

    currentIds.forEach((id) => {
      const block = document.getElementById(id);

      if (block) {
        block.classList.remove('btn-danger');
        block.classList.remove('btn-primary');

        block.classList.add('btn-success');
      }
    });
  }

  public setError(ids: Id | Id[]) {
    const currentIds = Array.isArray(ids) ? ids : [ids];

    currentIds.forEach((id) => {
      const block = document.getElementById(id);

      if (block) {
        block.classList.remove('btn-primary');
        block.classList.remove('btn-success');

        block.classList.add('btn-danger');
      }
    });
  }

  public setCurrentStep(stepIndex: StepIndex) {
    if (this.stepRoot) {
      this.stepRoot.innerHTML = stepIndex.toString();
    }
  }

  public setTotalStep(maxSteps: number) {
    if (this.totalStep) {
      this.totalStep.innerHTML = maxSteps.toString();
    }
  }

  public createСonclution(
    data: { answer: Word; errors: number; stepIndex: StepIndex }[],
    conclution: {
      wordsWithoutErrors: number;
      errors: number;
      wordWithMostErrors: string;
    }
  ) {
    if (!this.conclution) return;

    const tableFull = document.createElement('table');

    tableFull.className = 'table mb-6';

    const theadTableFull = `
      <thead>
        <tr>
          <th scope="col">Step</th>
          <th scope="col">Word</th>
          <th scope="col">Errors</th>
        </tr>
      </thead>`;

    const tbodytableFull = data.map(
      (item) =>
        `<tr>
        <th scope="row">${item.stepIndex + 1}</th>
        <th scope="row">${item.answer}</th>
        <th scope="row">${item.errors}</th>
      </tr>`
    );

    tableFull.innerHTML = `${theadTableFull}<tbody>${tbodytableFull.join(
      ''
    )}</tbody>`;

    const table = document.createElement('table');

    table.className = 'table mb-6';

    const tbody = `
      <tr>
        <th scope="row">Number of collected words without errors</th>
        <th scope="row">${conclution.wordsWithoutErrors}</th>
      </tr>
      <tr>
        <th scope="row">Number of errors</th>
        <th scope="row">${conclution.errors}</th>
      </tr>
      <tr>
        <th scope="row">The word with the most errors</th>
        <th scope="row">${
          conclution.errors > 0 ? conclution.wordWithMostErrors : '-'
        }</th>
      </tr>
      `;

    table.innerHTML = `<tbody>${tbody}</tbody>`;

    this.conclution.appendChild(table);
    this.conclution.appendChild(tableFull);

    this.conclution.style.display = 'block';
  }

  public removeСonclution() {
    if (this.conclution) {
      this.conclution.style.display = 'none';
      this.conclution.innerHTML = '';
    }
  }

  public showProgressModal() {
    return new Promise((resolve, reject) => {
      const modal = document.getElementById('progressModal');

      if (modal) {
        modal.classList.add('show');
        modal.removeAttribute('aria-hidden');
        modal.setAttribute('aria-modal', 'true');
        modal.style.display = 'block';

        const yesBtn = document.getElementById('progressModalYesBtn');
        const noBtn = document.getElementById('progressModalNoBtn');

        yesBtn?.addEventListener('click', () => {
          resolve(true);
          this.closeProgressModal();
        });

        noBtn?.addEventListener('click', () => {
          reject();
          this.closeProgressModal();
        });
      } else {
        reject();
      }
    });
  }

  private closeProgressModal() {
    const modal = document.getElementById('progressModal');

    if (modal) {
      modal.classList.remove('show');
      modal.removeAttribute('aria-modal');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
    }
  }

  public showLoader() {
    if (this.loader) {
      this.loader.style.display = 'block';
    }
  }

  public hideLoader() {
    if (this.loader) {
      this.loader.style.display = 'none';
    }
  }

  public showNewGameButton() {
    if (this.newGameButton) {
      this.newGameButton.style.display = 'block';
    }
  }

  public hideNewGameButton() {
    if (this.newGameButton) {
      this.newGameButton.style.display = 'none';
    }
  }
}
