export const currentUser = {
  id: 'u001',
  displayName: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  avatarUrl: null,
  creditBalance: 3500, // in satang (35 THB)
  streakDays: 12,
  examGoal: 'Calculus II Midterm',
  examDate: '2026-05-15',
  isCreator: true,
  lastActiveDate: '2026-04-06',
  joinedDate: '2026-01-15',
  totalStudyMinutes: 1280,
  quizzesCompleted: 24,
  summariesCreated: 8,
};

export const leaderboardUsers = [
  { id: 'u010', displayName: 'Natasha K.', studyMinutes: 320, avatar: null },
  { id: 'u011', displayName: 'James W.', studyMinutes: 285, avatar: null },
  { id: 'u012', displayName: 'Ploy S.', studyMinutes: 260, avatar: null },
  { id: 'u001', displayName: 'Alex Johnson', studyMinutes: 245, avatar: null },
  { id: 'u013', displayName: 'Beam T.', studyMinutes: 210, avatar: null },
  { id: 'u014', displayName: 'Sara L.', studyMinutes: 198, avatar: null },
  { id: 'u015', displayName: 'Mike R.', studyMinutes: 175, avatar: null },
  { id: 'u016', displayName: 'Fern P.', studyMinutes: 160, avatar: null },
  { id: 'u017', displayName: 'David C.', studyMinutes: 142, avatar: null },
  { id: 'u018', displayName: 'Nina M.', studyMinutes: 130, avatar: null },
];

export const achievements = [
  { id: 'a01', name: 'Rookie', icon: '🌱', description: 'First AI summary', unlocked: true },
  { id: 'a02', name: 'Streak 7', icon: '🔥', description: '7-day study streak', unlocked: true },
  { id: 'a03', name: 'Quick Buyer', icon: '🛒', description: 'First purchase', unlocked: true },
  { id: 'a04', name: 'First Creator', icon: '✨', description: 'First sale', unlocked: false },
  { id: 'a05', name: 'Quiz Master', icon: '🧪', description: 'Completed 10 quizzes', unlocked: false },
  { id: 'a06', name: 'Streak 30', icon: '💎', description: '30-day study streak', unlocked: false },
];
