/**
 * Точка входа
 */
import { TheGame } from '@/game';
import { HtmlController } from '@/controller/html';

document.addEventListener('DOMContentLoaded', () => {
  const htmlController = new HtmlController({
    lettersId: 'letters',
    answerId: 'answer',
    currentQuestionId: 'current_question',
    totalQuestionsId: 'total_questions',
    conclutionId: 'conclution',
    loaderId: 'loader',
    newGameButtonId: 'newGameButton',
  });

  new TheGame(htmlController).start();
});
