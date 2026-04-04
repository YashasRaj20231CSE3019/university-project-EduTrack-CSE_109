
// Mock quiz data for demonstration
const MOCK_QUIZ = {
  id: 'q1',
  title: 'Algebraic Equations Review',
  subject: 'Math',
  questions: [
    { id: '1', text: 'Solve for x: 2x + 5 = 15', type: 'multiple-choice', options: ['x = 5', 'x = 10', 'x = 20', 'x = 2.5'], correctAnswer: 'x = 5' },
    { id: '2', text: 'What is the value of y in the equation 3y - 7 = 14?', type: 'multiple-choice', options: ['y = 7', 'y = 21', 'y = -7', 'y = 3'], correctAnswer: 'y = 7' },
    { id: '3', text: 'Explain the difference between an expression and an equation.', type: 'short-answer' }
  ]
};

export const quizService = {
  getQuizzes: () => {
    const savedQuizzes = JSON.parse(localStorage.getItem('edutrack_quizzes') || '[]');
    const deletedMockIds = JSON.parse(localStorage.getItem('edutrack_deleted_mock_quizzes') || '[]');
    
    const quizzes = [...savedQuizzes];
    if (!deletedMockIds.includes(MOCK_QUIZ.id)) {
      quizzes.unshift(MOCK_QUIZ);
    }
    return quizzes;
  },

  deleteQuiz: (quizId: string) => {
    if (quizId === MOCK_QUIZ.id) {
      const deletedMockIds = JSON.parse(localStorage.getItem('edutrack_deleted_mock_quizzes') || '[]');
      if (!deletedMockIds.includes(quizId)) {
        deletedMockIds.push(quizId);
        localStorage.setItem('edutrack_deleted_mock_quizzes', JSON.stringify(deletedMockIds));
      }
    } else {
      const savedQuizzes = JSON.parse(localStorage.getItem('edutrack_quizzes') || '[]');
      const updatedQuizzes = savedQuizzes.filter((q: any) => q.id !== quizId);
      localStorage.setItem('edutrack_quizzes', JSON.stringify(updatedQuizzes));
    }

    // Also delete submissions for this quiz
    const allSubmissions = JSON.parse(localStorage.getItem('edutrack_quiz_submissions') || '[]');
    const updatedSubmissions = allSubmissions.filter((sub: any) => sub.quizId !== quizId);
    localStorage.setItem('edutrack_quiz_submissions', JSON.stringify(updatedSubmissions));
  }
};
