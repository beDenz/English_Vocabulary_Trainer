/**
 * @file Модуль работы с историей
 */
import { Storage } from '@/controller/storage';

import type {
  Step,
  Conclution,
  ConclutionFull,
  Words,
  StepIndex,
} from '@/types/global';

export type HistoryStorage = {
  words: Words;
  steps: Step[];
};

export class History {
  public words: Words = [];
  public steps: Step[] = [];
  public conclution: Conclution | null = null;
  public conclutionFull: ConclutionFull[] | null = null;

  public setWords(words: Words) {
    this.words = [...words];
  }

  public setStep(step: Step) {
    const hasStep = this.steps.some(
      (item) => item.stepIndex === step.stepIndex
    );

    if (hasStep) {
      this.steps = this.steps.map((item) => {
        if (item.stepIndex === step.stepIndex) {
          return step;
        }

        return item;
      });
    } else {
      this.steps.push(step);
    }

    this.saveHistory();
  }

  public getStepByIndex(stepIndex: StepIndex) {
    return this.steps.find((item) => item.stepIndex === stepIndex);
  }

  public getLastStep() {
    const [currentStep] = this.steps.slice().reverse();

    return currentStep;
  }

  public saveHistory() {
    Storage.setItem({
      words: this.words,
      steps: this.steps,
    });
  }

  public removeHistoryFromStorage() {
    Storage.removeItem();
  }

  public checkHasSaveHistory() {
    const storage = Storage.getItem<HistoryStorage>();

    if (!storage) return false;

    return storage.steps.some((item) => !item.isFinish);
  }

  public resetHistory() {
    this.words = [];
    this.steps = [];
    this.conclution = null;
    this.conclutionFull = null;
  }

  public restoreHistory() {
    const history = Storage.getItem<HistoryStorage>();

    if (history) {
      this.words = history.words;
      this.steps = history.steps;
    }
  }
}
