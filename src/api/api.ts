import { shuffleArray } from '@/utils/common';

const NUMBER_WORDS_IN_TASK = 6;
// const NUMBER_WORDS_IN_TASK = 2;

const TASK = [
  'apple',
  'function',
  'timeout',
  'task',
  'application',
  'data',
  'tragedy',
  'sun',
  'symbol',
  'button',
  'software',
];

/**
 * API интерфейс
 */
export class Api {
  /**
   * Эмуляция запроса слов для тренировки
   */
  static faceApiRequest() {
    return new Promise<string[]>((resolve) => {
      setTimeout(() => {
        const tast = shuffleArray(TASK).slice(0, NUMBER_WORDS_IN_TASK);
        resolve(tast);
      }, 1000);
    });
  }
}
