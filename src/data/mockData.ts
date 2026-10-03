import type { 
  Habit, 
  HabitLog, 
  LifeArea, 
  Goal, 
  Task, 
  MindsetLog, 
  StreakFreeze, 
  NotificationItem, 
  UserProfile, 
  WeeklyReview,
  BehavioralInsight,
  BehavioralCorrelation
} from '../types';

export const INITIAL_USER: UserProfile = {
  name: 'Manish',
  email: 'manish@consist.app',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  freezeTokensRemaining: 3,
  maxFreezeTokens: 3,
  autoFreezeEnabled: true,
  consistencyScore: 92,
  momentumPercent: 18,
  totalHabitsCompleted: 28,
  overallStreak: 4,
};

export const LIFE_AREAS: LifeArea[] = [
  { id: 'area-1', name: 'Health & Fitness', icon: '🏋️‍♂️', description: 'Physical strength, endurance, and clean nutrition', color: '#06b6d4' },
  { id: 'area-2', name: 'Career Growth', icon: '💼', description: 'Skill development, execution, and project leadership', color: '#8b5cf6' },
  { id: 'area-3', name: 'Finances & Wealth', icon: '💰', description: 'Savings goals, investments, and disciplined spending', color: '#10b981' },
  { id: 'area-4', name: 'Relationships', icon: '❤️', description: 'Deep family bonds, friendships, and community support', color: '#ec4899' },
  { id: 'area-5', name: 'Spirituality', icon: '✨', description: 'Inner peace, gratitude, and purpose alignment', color: '#f59e0b' },
  { id: 'area-6', name: 'Home', icon: '🏠', description: 'Organized space, environment, and decluttering', color: '#6366f1' },
  { id: 'area-7', name: 'Adventure & Travel', icon: '✈️', description: 'New experiences, exploration, and nature hikes', color: '#00f2fe' },
  { id: 'area-8', name: 'Fun & Hobbies', icon: '🎮', description: 'Music, creative outlets, and restful hobbies', color: '#a855f7' },
  { id: 'area-9', name: 'Community', icon: '🌏', description: 'Mentorship, giving back, and civic engagement', color: '#3b82f6' },
  { id: 'area-10', name: 'Personal', icon: '🎯', description: 'Self-mastery, identity shift, and lifelong learning', color: '#14b8a6' },
];

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'h-1',
    name: 'WAKE UP AT 5AM',
    category: 'Health',
    frequency: 'daily',
    isMeasurable: false,
    timeOfDay: 'morning',
    currentStreak: 4,
    bestStreak: 7,
    color: '#06b6d4',
    createdAt: '2026-10-01',
  },
  {
    id: 'h-2',
    name: 'Morning Workout',
    category: 'Fitness',
    frequency: 'specific_days',
    targetDaysPerWeek: 5,
    specificDays: [1, 2, 4, 5, 6],
    isMeasurable: true,
    targetValue: 45,
    targetUnit: 'minutes',
    timeOfDay: 'morning',
    currentStreak: 3,
    bestStreak: 5,
    color: '#00f2fe',
    createdAt: '2026-10-01',
  },
  {
    id: 'h-3',
    name: 'Meditation',
    category: 'Mindfulness',
    frequency: 'daily',
    isMeasurable: true,
    targetValue: 15,
    targetUnit: 'minutes',
    timeOfDay: 'morning',
    currentStreak: 4,
    bestStreak: 6,
    color: '#8b5cf6',
    createdAt: '2026-10-01',
  },
  {
    id: 'h-4',
    name: 'Read 20 Pages',
    category: 'Learning',
    frequency: 'daily',
    isMeasurable: true,
    targetValue: 20,
    targetUnit: 'pages',
    timeOfDay: 'night',
    currentStreak: 4,
    bestStreak: 7,
    color: '#3b82f6',
    createdAt: '2026-10-01',
  },
  {
    id: 'h-5',
    name: 'Hydrate 3 Liters',
    category: 'Health',
    frequency: 'daily',
    isMeasurable: true,
    targetValue: 3,
    targetUnit: 'liters',
    timeOfDay: 'anytime',
    currentStreak: 4,
    bestStreak: 10,
    color: '#06b6d4',
    createdAt: '2026-10-01',
  },
  {
    id: 'h-6',
    name: 'Journaling',
    category: 'Mindfulness',
    frequency: 'daily',
    isMeasurable: false,
    timeOfDay: 'evening',
    currentStreak: 3,
    bestStreak: 5,
    color: '#a855f7',
    createdAt: '2026-10-01',
  },
  {
    id: 'h-7',
    name: 'Cold Shower',
    category: 'Personal',
    frequency: 'daily',
    isMeasurable: false,
    timeOfDay: 'morning',
    currentStreak: 4,
    bestStreak: 6,
    color: '#00f2fe',
    createdAt: '2026-10-01',
  },
  {
    id: 'h-8',
    name: 'No Social Media after 9PM',
    category: 'Mindfulness',
    frequency: 'daily',
    isMeasurable: false,
    timeOfDay: 'night',
    currentStreak: 2,
    bestStreak: 4,
    color: '#f43f5e',
    createdAt: '2026-10-01',
  },
  {
    id: 'h-9',
    name: 'Plan Next Day',
    category: 'Work',
    frequency: 'specific_days',
    specificDays: [1, 2, 3, 4, 5],
    isMeasurable: false,
    timeOfDay: 'evening',
    currentStreak: 3,
    bestStreak: 5,
    color: '#10b981',
    createdAt: '2026-10-01',
  }
];

export const generateMockLogs = (): HabitLog[] => {
  const logs: HabitLog[] = [];
  const habits = INITIAL_HABITS;

  // Generate logs for October 1st to October 31st, 2026
  for (let day = 1; day <= 31; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `2026-10-${dayStr}`;
    const dateObj = new Date(2026, 9, day);
    const dayOfWeek = dateObj.getDay();

    habits.forEach((habit) => {
      let status: 'completed' | 'missed' | 'frozen' | 'skipped' | 'partial' = 'completed';
      
      // Rest day or non-scheduled day logic
      if (habit.id === 'h-2' && (dayOfWeek === 0 || dayOfWeek === 3)) {
        status = 'skipped';
      } else if (habit.id === 'h-9' && (dayOfWeek === 0 || dayOfWeek === 6)) {
        status = 'skipped';
      } else if (day === 8 && habit.id === 'h-4') {
        status = 'frozen';
      } else if (day === 14 && habit.id === 'h-8') {
        status = 'missed';
      } else if (day === 19 && habit.id === 'h-3') {
        status = 'partial';
      } else {
        if ((day * 3 + habit.name.length) % 9 === 0 && day > 5) {
          status = 'missed';
        }
      }

      logs.push({
        id: `log-${habit.id}-${dateStr}`,
        habitId: habit.id,
        date: dateStr,
        status: status,
        currentValue: habit.isMeasurable ? (status === 'completed' ? habit.targetValue : status === 'partial' ? Math.round((habit.targetValue || 10) * 0.5) : 0) : undefined,
        targetValue: habit.targetValue,
        loggedAt: `${dateStr}T08:30:00Z`,
      });
    });
  }

  return logs;
};

export const INITIAL_STREAK_FREEZES: StreakFreeze[] = [];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g-1',
    title: 'Get Consistently Fit & Run 100 km',
    areaId: 'area-1',
    category: 'Fitness',
    targetValue: 100,
    currentValue: 15,
    unit: 'km',
    targetDate: '2026-10-31',
    connectedHabitIds: ['h-2', 'h-5', 'h-7'],
    status: 'in_progress',
    createdAt: '2026-10-01',
  },
  {
    id: 'g-2',
    title: 'Master Morning Focus & Mindfulness',
    areaId: 'area-5',
    category: 'Mindfulness',
    targetValue: 31,
    currentValue: 4,
    unit: 'sessions',
    targetDate: '2026-10-31',
    connectedHabitIds: ['h-1', 'h-3', 'h-6'],
    status: 'in_progress',
    createdAt: '2026-10-01',
  },
  {
    id: 'g-3',
    title: 'Finish 3 Non-Fiction Books',
    areaId: 'area-2',
    category: 'Learning',
    targetValue: 600,
    currentValue: 80,
    unit: 'pages',
    targetDate: '2026-11-01',
    connectedHabitIds: ['h-4'],
    status: 'in_progress',
    createdAt: '2026-10-01',
  }
];

export const INITIAL_TASKS: Task[] = [
  { id: 't-1', title: 'Complete Morning Workout Routine', dueDate: '2026-10-01', completed: true, priority: 'high', category: 'Fitness', habitId: 'h-2' },
  { id: 't-2', title: 'Q4 Systems Architecture kick-off', dueDate: '2026-10-01', completed: true, priority: 'high', category: 'Work' },
  { id: 't-3', title: 'Read 20 pages of non-fiction', dueDate: '2026-10-01', completed: true, priority: 'medium', category: 'Learning', habitId: 'h-4' },
  { id: 't-4', title: 'Hydrate 3 liters throughout day', dueDate: '2026-10-01', completed: true, priority: 'low', category: 'Health', habitId: 'h-5' },
  
  { id: 't-5', title: 'Friday strength training gym session', dueDate: '2026-10-02', completed: true, priority: 'high', category: 'Fitness', habitId: 'h-2' },
  { id: 't-6', title: 'Weekly habit review reflection', dueDate: '2026-10-02', completed: true, priority: 'medium', category: 'Personal' },

  { id: 't-7', title: 'Weekend long run (8 km)', dueDate: '2026-10-03', completed: true, priority: 'high', category: 'Fitness', goalId: 'g-1' },
  { id: 't-8', title: 'Organize workspace & declutter desk', dueDate: '2026-10-04', completed: true, priority: 'low', category: 'Personal' },
];

export const INITIAL_MINDSET_LOGS: MindsetLog[] = [
  { date: '2026-09-28', energy: 8, focus: 8, motivation: 8 },
  { date: '2026-09-29', energy: 7, focus: 8, motivation: 7 },
  { date: '2026-09-30', energy: 9, focus: 9, motivation: 9 },
  { date: '2026-10-01', energy: 9, focus: 9, motivation: 9 },
  { date: '2026-10-02', energy: 8, focus: 8, motivation: 8 },
  { date: '2026-10-03', energy: 9, focus: 9, motivation: 9 },
  { date: '2026-10-04', energy: 8, focus: 9, motivation: 8 },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'October Tracker Active 🚀',
    message: 'Welcome to October! Your 7-day week glance and monthly rhythm grid are active.',
    time: 'Just now',
    read: false,
    type: 'system',
  },
  {
    id: 'n-2',
    title: 'Habit Scheduled ⏰',
    message: 'Your Morning Workout is scheduled for 7:00 AM today.',
    time: '1h ago',
    read: false,
    type: 'reminder',
  },
];

export const BEHAVIORAL_INSIGHTS: BehavioralInsight[] = [
  {
    id: 'bi-1',
    title: 'October Start Momentum',
    description: 'You have maintained high consistency starting from October 1st across all anchor routines.',
    type: 'positive',
    category: 'day',
    stat: '92% Consistency',
  },
  {
    id: 'bi-2',
    title: 'Morning Anchor Habits',
    description: 'Executing Wake Up at 5AM and Morning Workout establishes strong momentum early in the day.',
    type: 'positive',
    category: 'time',
    stat: '5 AM Anchor',
  },
];

export const BEHAVIORAL_CORRELATIONS: BehavioralCorrelation[] = [
  {
    id: 'bc-1',
    metricA: 'Energy Score ≥ 8',
    metricB: 'Habit Completion Rate',
    statement: 'On high-energy days, your execution confidence and focus reach peak performance.',
    confidencePercent: 95,
  },
  {
    id: 'bc-2',
    metricA: 'Morning Workout Completed',
    metricB: 'Focus Score',
    statement: 'Starting the morning with physical effort yields an average focus score of 9/10.',
    confidencePercent: 90,
  }
];

export const INITIAL_WEEKLY_REVIEW: WeeklyReview = {
  id: 'wr-2026-w40',
  weekStartDate: '2026-09-28',
  completionRate: 92,
  consistencyScore: 92,
  momentumPercent: 18,
  strongestHabitName: 'WAKE UP AT 5AM',
  attentionHabitName: 'Read 20 Pages',
  workedWellAnswer: 'Starting October 1st with clear intention and structured anchor habits.',
  impedimentsAnswer: 'None so far. Clean slate established.',
  changesNextWeekAnswer: 'Maintain daily discipline across all 10 life areas.',
  savedAt: '2026-10-01T00:00:00Z',
};
