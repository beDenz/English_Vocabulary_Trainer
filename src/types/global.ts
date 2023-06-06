export type Id = string;
export type Word = string;
export type Words = Word[];
export type StepIndex = number;

export type Step = {
  answer: string;
  letterBoard: string;
  answerBoard: string;
  stepIndex: number;
  errors: number;
  isFinish: boolean;
};

export type Conclution = {
  wordsWithoutErrors: number;
  errors: number;
  wordWithMostErrors: string;
};

export type ConclutionFull = {
  answer: Word;
  errors: number;
  stepIndex: StepIndex;
};
