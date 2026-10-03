import type { 
  UserProfile, 
  Habit, 
  HabitLog, 
  StreakFreeze, 
  Task, 
  Goal, 
  MindsetLog, 
  NotificationItem, 
  WeeklyReview 
} from '../types';

const API_URL = 'http://localhost:3001/api/data';

export interface FullAppData {
  user: UserProfile;
  habits: Habit[];
  logs: HabitLog[];
  freezes: StreakFreeze[];
  tasks: Task[];
  goals: Goal[];
  mindsetLogs: MindsetLog[];
  notifications: NotificationItem[];
  weeklyReview: WeeklyReview;
}

export const fetchLocalDatabase = async (): Promise<FullAppData | null> => {
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return result.data as FullAppData;
      }
    }
  } catch (err) {
    console.warn('Local DB server not reachable on 3001, falling back to client storage.');
  }
  return null;
};

export const saveToLocalDatabase = async (data: FullAppData): Promise<boolean> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      return true;
    }
  } catch (err) {
    console.warn('Failed to sync to local DB server:', err);
  }
  return false;
};
