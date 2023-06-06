export const createLetterBlock = (letter: string, id: string) => {
  const block = document.createElement('button');
  block.id = id;
  block.type = 'button';
  block.setAttribute('data-bs-toggle', 'button');
  block.className = 'btn btn-primary mr-2';
  block.innerHTML = letter;

  return block;
};

export const createLetterBoard = (letterElements: HTMLElement[]) => {
  const block = document.createElement('div');
  block.className = 'd-flex justify-content-center';

  letterElements.forEach((element) => {
    block.appendChild(element);
  });

  return block;
};

export const addElement = (
  parentElement: HTMLElement,
  element: HTMLElement
) => {
  parentElement.appendChild(element);

  return parentElement;
};

export const removeElement = (
  parentElement: HTMLElement,
  element: HTMLElement
) => {
  parentElement.removeChild(element);

  return parentElement;
};
