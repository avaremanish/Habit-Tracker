export type HabitCategoryType = 
  | 'Fitness'
  | 'Health'
  | 'Learning'
  | 'Work'
  | 'Finance'
  | 'Personal'
  | 'Relationships'
  | 'Mindfulness'
  | 'Sleep'
  | 'Custom';

export type HabitFrequencyType = 
  | 'daily'
  | 'specific_days'
  | 'x_times_week'
  | 'x_times_month'
  | 'weekly'
  | 'monthly';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';

export type HabitLogStatus = 'completed' | 'missed' | 'skipped' | 'frozen' | 'partial' | 'pending';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategoryType;
  description?: string;
  frequency: HabitFrequencyType;
  targetDaysPerWeek?: number; // e.g. 5 for 5x/week
  targetDaysPerMonth?: number;
  specificDays?: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  isMeasurable: boolean;
  targetValue?: number;
  targetUnit?: string; // e.g. 'pages', 'km', 'minutes', 'liters', 'reps'
  timeOfDay: TimeOfDay;
  color?: string; // accent color hex/tailwind class
  icon?: string;
  currentStreak: number;
  bestStreak: number;
  createdAt: string;
  isPaused?: boolean;
  order?: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: HabitLogStatus;
  currentValue?: number;
  targetValue?: number;
  loggedAt?: string;
  note?: string;
}

export interface StreakFreeze {
  id: string;
  date: string; // YYYY-MM-DD
  reason?: string;
  habitId?: string; // optional: specific to a habit or global
  usedAt: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: HabitCategoryType;
  habitId?: string;
  goalId?: string;
  isRecurring?: boolean;
}

export interface LifeArea {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface Goal {
  id: string;
  title: string;
  areaId: string; // references LifeArea
  category: HabitCategoryType;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  targetDate: string; // YYYY-MM-DD
  connectedHabitIds: string[];
  status: 'in_progress' | 'achieved' | 'paused';
  createdAt: string;
}

export interface MindsetLog {
  date: string; // YYYY-MM-DD
  energy: number; // 1-10
  focus: number; // 1-10
  motivation: number; // 1-10
  note?: string;
}

export interface BehavioralInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'warning' | 'neutral';
  category: 'time' | 'day' | 'mindset' | 'streak' | 'correlation';
  stat?: string;
}

export interface BehavioralCorrelation {
  id: string;
  metricA: string;
  metricB: string;
  statement: string;
  confidencePercent: number;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string; // YYYY-MM-DD
  completionRate: number;
  consistencyScore: number;
  momentumPercent: number;
  strongestHabitName: string;
  attentionHabitName: string;
  workedWellAnswer: string;
  impedimentsAnswer: string;
  changesNextWeekAnswer: string;
  savedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'reminder' | 'streak' | 'insight' | 'system';
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  freezeTokensRemaining: number;
  maxFreezeTokens: number;
  autoFreezeEnabled: boolean;
  consistencyScore: number;
  momentumPercent: number;
  totalHabitsCompleted: number;
  overallStreak: number;
}
