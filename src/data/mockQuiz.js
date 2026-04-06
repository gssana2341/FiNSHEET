export const sampleQuiz = {
  sourceTitle: 'Calculus II — Integrals & Series',
  questions: [
    {
      id: 'q1',
      question: 'What is the integral of 1/x dx?',
      options: ['x²/2 + C', 'ln|x| + C', '1/x² + C', 'e^x + C'],
      answer: 'B',
      explanation: 'The integral of 1/x is the natural logarithm of the absolute value of x, plus a constant.',
    },
    {
      id: 'q2',
      question: 'Which test is used to determine convergence of a series with alternating signs?',
      options: ['Ratio Test', 'Root Test', 'Alternating Series Test', 'Comparison Test'],
      answer: 'C',
      explanation: 'The Alternating Series Test (Leibniz Test) is specifically designed for series with alternating positive and negative terms.',
    },
    {
      id: 'q3',
      question: 'What is integration by parts formula?',
      options: ['∫u dv = uv + ∫v du', '∫u dv = uv - ∫v du', '∫u dv = u/v - ∫v du', '∫u dv = uv - ∫u dv'],
      answer: 'B',
      explanation: 'Integration by parts: ∫u dv = uv - ∫v du, derived from the product rule of differentiation.',
    },
    {
      id: 'q4',
      question: 'A Taylor series centered at a = 0 is also called:',
      options: ['Laurent Series', 'Maclaurin Series', 'Fourier Series', 'Power Series'],
      answer: 'B',
      explanation: 'A Maclaurin series is a special case of the Taylor series where the expansion point a = 0.',
    },
    {
      id: 'q5',
      question: 'The integral of cos(x) dx equals:',
      options: ['-sin(x) + C', 'sin(x) + C', 'cos(x) + C', '-cos(x) + C'],
      answer: 'B',
      explanation: 'The antiderivative of cos(x) is sin(x) + C, since d/dx[sin(x)] = cos(x).',
    },
  ],
};
