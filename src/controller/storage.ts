/**
 * Интерфейс для работы с хранилищем
 */

const LABEL = 'english_vocabulary_trainer';

export class Storage {
  public static setItem<T>(data: T) {
    localStorage.setItem(LABEL, JSON.stringify(data));
  }

  public static getItem<T>() {
    const data = localStorage.getItem(LABEL);

    if (!data) return null;

    return JSON.parse(data) as T;
  }

  public static removeItem() {
    localStorage.removeItem(LABEL);
  }
}
