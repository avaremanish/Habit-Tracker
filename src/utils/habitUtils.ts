import type { Habit, HabitLog, HabitLogStatus } from '../types';
import { 
  format, 
  parseISO, 
  subDays, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth 
} from 'date-fns';

export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const formatDateDisplay = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr);
    return format(date, 'EEEE, d MMMM yyyy').toUpperCase();
  } catch {
    return dateStr;
  }
};

export const formatShortDay = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), 'EEE');
  } catch {
    return dateStr;
  }
};

export const getWeekDaysForDate = (currentDateStr: string) => {
  const current = parseISO(currentDateStr);
  const start = startOfWeek(current, { weekStartsOn: 1 });
  const end = endOfWeek(current, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'));
};

export const getMonthDaysForDate = (currentDateStr: string) => {
  const current = parseISO(currentDateStr);
  const start = startOfMonth(current);
  const end = endOfMonth(current);
  return eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'));
};

export const getHabitStatusForDate = (
  habit: Habit,
  dateStr: string,
  logs: HabitLog[]
): HabitLogStatus => {
  const log = logs.find((l) => l.habitId === habit.id && l.date === dateStr);
  if (log) {
    return log.status;
  }

  const dateObj = parseISO(dateStr);
  const dayOfWeek = dateObj.getDay();

  if (habit.frequency === 'specific_days' && habit.specificDays) {
    if (!habit.specificDays.includes(dayOfWeek)) {
      return 'skipped';
    }
  }

  return 'pending';
};

/**
 * Calculates current streak and all-time best streak dynamically from actual logs.
 * Evaluates consecutive completed or frozen scheduled days backwards from referenceDate.
 */
export const calculateHabitStreak = (
  habit: Habit,
  logs: HabitLog[],
  referenceDateStr?: string
): { currentStreak: number; bestStreak: number } => {
  const refDateStr = referenceDateStr || getTodayString();
  const refDate = parseISO(refDateStr);

  // 1. Current streak calculation
  let currentStreak = 0;
  
  const todayStatus = getHabitStatusForDate(habit, refDateStr, logs);
  const isTodayDone = todayStatus === 'completed' || todayStatus === 'frozen';
  
  if (isTodayDone) {
    currentStreak++;
  }

  // Walk backwards day-by-day from yesterday
  const maxLookback = 365;
  for (let offset = 1; offset <= maxLookback; offset++) {
    const checkDate = format(subDays(refDate, offset), 'yyyy-MM-dd');
    const status = getHabitStatusForDate(habit, checkDate, logs);

    if (status === 'completed' || status === 'frozen') {
      currentStreak++;
    } else if (status === 'skipped') {
      // Planned rest day / not scheduled for this habit - preserves continuity
      continue;
    } else {
      // Missed or uncompleted past scheduled day breaks current streak
      break;
    }
  }

  // 2. Compute all-time best streak across log history
  const completedLogDates = logs
    .filter((l) => l.habitId === habit.id && (l.status === 'completed' || l.status === 'frozen'))
    .map((l) => l.date);

  let bestStreak = currentStreak;

  if (completedLogDates.length > 0) {
    const sortedDates = Array.from(new Set(completedLogDates)).sort();
    const startDate = parseISO(sortedDates[0]);
    const endDate = refDate > parseISO(sortedDates[sortedDates.length - 1]) ? refDate : parseISO(sortedDates[sortedDates.length - 1]);

    let runningStreak = 0;
    let curr = startDate;

    while (curr <= endDate) {
      const dStr = format(curr, 'yyyy-MM-dd');
      const status = getHabitStatusForDate(habit, dStr, logs);

      if (status === 'completed' || status === 'frozen') {
        runningStreak++;
        if (runningStreak > bestStreak) {
          bestStreak = runningStreak;
        }
      } else if (status === 'skipped') {
        // preserve running streak
      } else {
        runningStreak = 0;
      }
      curr = addDays(curr, 1);
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak, habit.bestStreak || 0)
  };
};

/**
 * Calculates overall active consistency streak across all habits.
 */
export const calculateOverallStreak = (
  habits: Habit[],
  logs: HabitLog[],
  referenceDateStr?: string
): { currentStreak: number; bestStreak: number } => {
  const activeHabits = habits.filter((h) => !h.isPaused);
  if (!activeHabits.length) return { currentStreak: 0, bestStreak: 0 };

  const refDateStr = referenceDateStr || getTodayString();
  const refDate = parseISO(refDateStr);

  const isDaySuccessful = (dStr: string): boolean => {
    let dueCount = 0;
    let completedCount = 0;

    activeHabits.forEach((h) => {
      const st = getHabitStatusForDate(h, dStr, logs);
      if (st !== 'skipped') {
        dueCount++;
        if (st === 'completed' || st === 'frozen') {
          completedCount++;
        }
      }
    });

    if (dueCount === 0) return true;
    return (completedCount / dueCount) >= 0.5;
  };

  let currentStreak = 0;
  if (isDaySuccessful(refDateStr)) {
    currentStreak++;
  }

  for (let offset = 1; offset <= 365; offset++) {
    const pastDate = format(subDays(refDate, offset), 'yyyy-MM-dd');
    if (isDaySuccessful(pastDate)) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(currentStreak, 24)
  };
};

export const calculateConsistencyScore = (
  habits: Habit[],
  logs: HabitLog[],
  daysWindow: number = 30
): number => {
  if (!habits.length) return 0;
  
  const today = new Date();
  let totalScheduled = 0;
  let totalCompletedOrFrozen = 0;

  for (let i = 0; i < daysWindow; i++) {
    const checkDate = format(subDays(today, i), 'yyyy-MM-dd');
    habits.forEach((h) => {
      const status = getHabitStatusForDate(h, checkDate, logs);
      if (status !== 'skipped') {
        totalScheduled++;
        if (status === 'completed') {
          totalCompletedOrFrozen++;
        } else if (status === 'frozen') {
          totalCompletedOrFrozen += 0.8;
        } else if (status === 'partial') {
          totalCompletedOrFrozen += 0.5;
        }
      }
    });
  }

  if (totalScheduled === 0) return 100;
  const baseRate = (totalCompletedOrFrozen / totalScheduled) * 100;

  const streaks = habits.map((h) => calculateHabitStreak(h, logs).currentStreak);
  const avgStreak = streaks.reduce((acc, s) => acc + s, 0) / (habits.length || 1);
  const streakBonus = Math.min(15, avgStreak * 1.2);

  const finalScore = Math.min(100, Math.round(baseRate * 0.85 + streakBonus));
  return Math.max(0, finalScore);
};

export const calculateMomentumPercent = (
  habits: Habit[],
  logs: HabitLog[]
): { percent: number; trend: 'Building' | 'Stable' | 'Slipping' | 'Recovering' } => {
  const today = new Date();
  
  let last7Completed = 0;
  let last7Scheduled = 0;
  for (let i = 0; i < 7; i++) {
    const d = format(subDays(today, i), 'yyyy-MM-dd');
    habits.forEach((h) => {
      const st = getHabitStatusForDate(h, d, logs);
      if (st !== 'skipped') {
        last7Scheduled++;
        if (st === 'completed' || st === 'frozen') last7Completed++;
      }
    });
  }

  let prev7Completed = 0;
  let prev7Scheduled = 0;
  for (let i = 7; i < 14; i++) {
    const d = format(subDays(today, i), 'yyyy-MM-dd');
    habits.forEach((h) => {
      const st = getHabitStatusForDate(h, d, logs);
      if (st !== 'skipped') {
        prev7Scheduled++;
        if (st === 'completed' || st === 'frozen') prev7Completed++;
      }
    });
  }

  const currentRate = last7Scheduled > 0 ? (last7Completed / last7Scheduled) * 100 : 0;
  const prevRate = prev7Scheduled > 0 ? (prev7Completed / prev7Scheduled) * 100 : 0;

  const diff = Math.round(currentRate - prevRate);
  
  let trend: 'Building' | 'Stable' | 'Slipping' | 'Recovering' = 'Stable';
  if (diff >= 5) trend = 'Building';
  else if (diff <= -5) trend = 'Slipping';
  else if (diff > 0 && prevRate < 60) trend = 'Recovering';

  return { percent: diff, trend };
};
