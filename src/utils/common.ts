/**
 * Функция перемешивания массива
 * Использовал самый простой, но предвзятый способ
 */
export const shuffleArray = <T>(array: T[]) =>
  array.sort(() => Math.random() - 0.5);

/**
 * Получить массив букв из строки
 */
export const getLettersFromWord = (word: string) => word?.split('') || [];

export const getQueryParam = (param: string) => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);

  return url.searchParams.get(param);
};
