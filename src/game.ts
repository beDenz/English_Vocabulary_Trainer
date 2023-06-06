import { LetterBoard } from '@/models/letter';
import { History } from '@/models/history';
import { Controller } from '@/controller/html';
import { Api } from '@/api/api';
import { getQueryParam } from '@/utils/common';

import type { Step, Words, Id } from '@/types/global';

/**
 * Максум слов в задаче. (Технически количество слов должно регулироваться на уровне бекенда, но в задаче четко сказано, что должно быть 6 слов)
 */
const MAX_STEPS = 6;
/**
 *  Количество попыток
 */
const MAX_COUNT_OF_ATTENPS = 3;
/**
 * Задержка при переходе между шагами
 */
const STEP_DELAY = 2000;
/**
 * Задержка изменения статуса
 */
const DALAY_CHANGE_STATUS = 300;

export class TheGame<T extends Controller> {
  /**
   * Отдельный борды для списка предложенных букв и ответов
   */
  private answerBoard: LetterBoard;
  private lettersBoard: LetterBoard;

  /**
   * Список слов в задаче
   */
  private words: Words = [];

  private isActive = true;

  /**
   * Текущий шаг в задаче
   */
  private currentStepIndex = 0;
  /**
   * Слово в текущем шаге
   */
  private answer = '';
  /**
   * Количество ошибок в текущем шаге
   */
  private errors = 0;

  /**
   * Модуль работы с историей
   */
  private history: History;

  constructor(private controller: T) {
    this.answerBoard = new LetterBoard();
    this.lettersBoard = new LetterBoard();
    this.history = new History();
  }

  /**
   * Всего шагов
   */
  private get totalSteps() {
    return this.words.length <= MAX_STEPS ? this.words.length : MAX_STEPS;
  }

  private get isAvailableSteps() {
    return this.currentStepIndex < this.totalSteps;
  }

  private get isAvaliableAttempt() {
    return this.errors < MAX_COUNT_OF_ATTENPS;
  }

  private get isAvaliableLetters() {
    return this.lettersBoard.elements.length > 0;
  }

  private get currentStep() {
    return {
      answer: this.answer,
      letterBoard: this.lettersBoard.letters.join(''),
      answerBoard: this.answerBoard.letters.join(''),
      stepIndex: this.currentStepIndex,
      errors: this.errors,
      isFinish: !this.isAvaliableAttempt || !this.isAvaliableLetters,
    };
  }

  private inctementStepIndex() {
    this.currentStepIndex += 1;
  }

  private inctementErrors() {
    this.errors += 1;
  }

  private resetErrorsCount() {
    this.errors = 0;
  }

  private addEvents() {
    this.controller.addMouseEvent((id: Id) => this.clickEvent(id));
    this.controller.addKeyboardEvent((key: string) => this.keyboardEvent(key));
    this.controller.addNewGameEvent(async () => await this.startNewGame());
  }

  private restoreGameFromStorage() {
    this.history.restoreHistory();

    this.words = this.history.words;

    const currentStep = this.history.getLastStep();

    this.initStepFromHistory(currentStep);
  }

  private initStepFromHistory(currentStep: Step) {
    this.currentStepIndex = currentStep.stepIndex;
    this.answer = this.words[currentStep.stepIndex];
    this.errors = currentStep.errors;

    this.controller.setCurrentStep(this.currentStepIndex + 1);
    this.controller.setTotalStep(this.totalSteps);

    this.lettersBoard.fillBoard(currentStep.letterBoard);
    this.answerBoard.fillBoard(currentStep.answerBoard);

    this.controller.addElementToLettersBoard(this.lettersBoard.elements);
    this.controller.addElementToAnswerBoard(this.answerBoard.elements);

    if (!this.isAvaliableAttempt) {
      this.controller.setError(this.answerBoard.ids);
    } else {
      this.controller.setSuccess(this.answerBoard.ids);
    }
  }

  private initStep() {
    const answer = this.words[this.currentStepIndex];

    this.answer = answer;

    if (getQueryParam('suffle_off') === '1') {
      this.lettersBoard.fillBoard(answer);
    } else {
      this.lettersBoard.fillBoardWithSuffle(answer);
    }

    this.controller.setCurrentStep(this.currentStepIndex + 1);
    this.controller.setTotalStep(this.totalSteps);
    this.controller.addElementToLettersBoard(this.lettersBoard.elements);
    this.controller.addElementToAnswerBoard(this.answerBoard.elements);

    this.history.setStep(this.currentStep);
  }

  private clickEvent(id: Id) {
    this.checkLetter(id);
  }

  private keyboardNavigation(key: 'ArrowLeft' | 'ArrowRight') {
    const stepIndex =
      key === 'ArrowLeft'
        ? this.currentStepIndex - 1
        : this.currentStepIndex + 1;

    if (stepIndex < 0) return;

    if (
      stepIndex === this.words.length &&
      this.history.conclution &&
      this.history.conclutionFull
    ) {
      this.resetBoards();

      this.showСonclution();
      this.inctementStepIndex();
      return;
    }

    const currentStep = this.history.getStepByIndex(stepIndex);

    if (!currentStep) return;

    this.controller.removeСonclution();
    this.resetBoards();
    this.initStepFromHistory(currentStep);
  }

  private kayboardPressLetter(key: string) {
    const element = this.lettersBoard.elements.find(
      (item) => item.value === key
    );

    if (element) {
      this.checkLetter(element.id);
    } else {
      this.handleError();
    }
  }

  private keyboardEvent(key: string) {
    if (!this.isActive) return;

    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      this.keyboardNavigation(key);
    } else {
      this.kayboardPressLetter(key);
    }
  }

  private checkLetter(id?: Id) {
    if (!id) return;

    const element = this.lettersBoard.getElement(id);
    const answer = this.answerBoard.word + element?.value;

    if (answer !== this.answer.slice(0, answer.length)) {
      this.handleError(id);

      return;
    }

    this.replaceLatter(id);
    this.controller.setSuccess(id);
    this.history.setStep(this.currentStep);

    if (!this.isAvaliableLetters) {
      setTimeout(() => {
        this.nextStep();
      }, STEP_DELAY);
    } else {
      this.isActive = true;
    }
  }

  private handleError(id?: Id) {
    this.isActive = false;
    this.inctementErrors();

    this.history.setStep(this.currentStep);

    if (id) {
      this.controller.setError(id);
      setTimeout(() => {
        this.controller.setActive(id);
      }, DALAY_CHANGE_STATUS);
    }

    if (!this.isAvaliableAttempt) {
      this.replaceAllLatter();
    }

    if (!this.isAvaliableLetters) {
      setTimeout(() => {
        this.nextStep();
      }, STEP_DELAY);
    } else {
      this.isActive = true;
    }
  }

  private resetBoards() {
    this.controller.removeAllElementFromAnswerBoard();
    this.controller.removeAllElementFromLettersBoard();

    this.lettersBoard.removeAllElements();
    this.answerBoard.removeAllElements();
  }

  private replaceAllLatter() {
    this.resetBoards();

    this.answerBoard.fillBoard(this.answer);

    this.controller.addElementToAnswerBoard(this.answerBoard.elements);
    this.controller.setError(this.answerBoard.ids);
  }

  private replaceLatter(id: Id) {
    const element = this.lettersBoard.getElement(id);

    if (element) {
      this.lettersBoard.removeElement(element);
      this.answerBoard.addElement(element);

      this.controller.removeElementFromLettersBoard(element);
      this.controller.addElementToAnswerBoard(element);
    }
  }

  private nextStep() {
    this.history.setStep(this.currentStep);

    this.inctementStepIndex();
    this.resetErrorsCount();
    this.resetBoards();
    this.isActive = true;

    if (this.isAvailableSteps) {
      this.initStep();
    } else {
      this.showСonclution();
      this.controller.showNewGameButton();
    }
  }

  private createConclution() {
    const conclutionFull = this.history.steps.map((item) => {
      return {
        answer: item.answer,
        errors: item.errors,
        stepIndex: item.stepIndex,
      };
    });

    const wordsWithoutErrors = this.history.steps.reduce((acc, cur) => {
      if (cur.errors === 0) {
        return acc + 1;
      }

      return acc;
    }, 0);

    const errors = this.history.steps.reduce((acc, cur) => {
      return acc + cur.errors;
    }, 0);

    const [wordWithMostErrors] = this.history.steps.sort(
      (a, b) => b.errors - a.errors
    );

    const conclution = {
      wordsWithoutErrors,
      errors,
      wordWithMostErrors: wordWithMostErrors.answer,
    };

    return { conclutionFull, conclution };
  }

  private showСonclution() {
    if (this.history.conclution && this.history.conclutionFull) {
      this.controller.createСonclution(
        this.history.conclutionFull,
        this.history.conclution
      );
    } else {
      const { conclution, conclutionFull } = this.createConclution();

      this.history.conclution = conclution;
      this.history.conclutionFull = conclutionFull;

      this.controller.createСonclution(conclutionFull, conclution);
    }
  }

  public async start() {
    const hasSaveHistory = this.history.checkHasSaveHistory();

    if (hasSaveHistory) {
      /**
       * Показываем модальное окно пользователю и ждем его реакцию
       */
      try {
        await this.controller.showProgressModal();
        this.restoreGameFromStorage();
      } catch (e) {
        this.history.removeHistoryFromStorage();
        await this.startNewGame();
      }
    } else {
      await this.startNewGame();
    }

    this.addEvents();
  }

  private async startNewGame() {
    this.history.resetHistory();
    this.resetBoards();

    this.controller.hideNewGameButton();
    this.controller.removeСonclution();
    this.controller.showLoader();

    this.words = await Api.faceApiRequest();

    this.history.setWords(this.words);
    this.resetErrorsCount();
    this.currentStepIndex = 0;

    this.controller.hideLoader();

    this.initStep();
  }
}
