import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Habit, 
  HabitLog, 
  Task, 
  Goal, 
  MindsetLog, 
  StreakFreeze, 
  NotificationItem, 
  UserProfile, 
  WeeklyReview,
  HabitLogStatus
} from '../types';
import { 
  INITIAL_USER, 
  INITIAL_HABITS, 
  generateMockLogs, 
  INITIAL_STREAK_FREEZES, 
  INITIAL_GOALS, 
  INITIAL_TASKS, 
  INITIAL_MINDSET_LOGS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_WEEKLY_REVIEW 
} from '../data/mockData';
import { calculateConsistencyScore, calculateMomentumPercent, getTodayString } from '../utils/habitUtils';
import { fetchLocalDatabase, saveToLocalDatabase } from '../services/apiService';
import type { FullAppData } from '../services/apiService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  fetchProfile, 
  fetchHabitsFromDb, 
  fetchLogsFromDb, 
  createHabitInDb, 
  updateHabitInDb, 
  deleteHabitFromDb, 
  reorderHabitsInDb, 
  upsertHabitLogInDb, 
  executeStreakFreezeRpc, 
  migrateLocalDataToSupabase,
  signOutUser 
} from '../services/supabaseService';

export type ActiveTab = 'today' | 'habits' | 'tasks' | 'goals' | 'insights' | 'landing';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  
  // User & Stats
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  consistencyScore: number;
  momentumInfo: { percent: number; trend: 'Building' | 'Stable' | 'Slipping' | 'Recovering' };

  // Supabase Auth & Cloud Sync
  supabaseUser: any;
  isSupabaseConnected: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  signOut: () => Promise<void>;
  migrateToCloud: () => Promise<{ success: boolean; message: string }>;

  // Local DB Server Status
  isDbServerConnected: boolean;

  // Habits
  habits: Habit[];
  logs: HabitLog[];
  addHabit: (habitData: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak'>) => void;
  updateHabit: (id: string, habitData: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  reorderHabits: (reorderedHabits: Habit[]) => void;
  moveHabit: (habitId: string, direction: 'up' | 'down') => void;
  toggleHabitStatus: (habitId: string, dateStr: string, status?: HabitLogStatus, value?: number) => void;

  // Editing Habit
  editingHabit: Habit | null;
  setEditingHabit: (habit: Habit | null) => void;

  // Streak Freeze
  freezes: StreakFreeze[];
  useFreezeToken: (habitId?: string, dateStr?: string, reason?: string) => boolean;

  // Tasks
  tasks: Task[];
  addTask: (taskData: Omit<Task, 'id'>) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;

  // Goals
  goals: Goal[];
  addGoal: (goalData: Omit<Goal, 'id' | 'createdAt' | 'currentValue' | 'status'>) => void;
  updateGoalProgress: (goalId: string, value: number) => void;

  // Mindset
  mindsetLogs: MindsetLog[];
  logMindset: (dateStr: string, energy: number, focus: number, motivation: number, note?: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Modals state
  isCreateHabitOpen: boolean;
  setIsCreateHabitOpen: (open: boolean) => void;
  isCreateGoalOpen: boolean;
  setIsCreateGoalOpen: (open: boolean) => void;
  isCreateTaskOpen: boolean;
  setIsCreateTaskOpen: (open: boolean) => void;
  isWeeklyReviewOpen: boolean;
  setIsWeeklyReviewOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  detailHabitId: string | null;
  setDetailHabitId: (id: string | null) => void;
  
  // Weekly Review
  weeklyReview: WeeklyReview;
  saveWeeklyReview: (review: Partial<WeeklyReview>) => void;

  // Backup / Restore
  exportBackupData: () => void;
  importBackupData: (jsonStr: string) => boolean;

  // Reset to initial demo data
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'consist_app_state_oct1_v3';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayStr = getTodayString();
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isDbServerConnected, setIsDbServerConnected] = useState(false);

  // Supabase Auth State
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isSupabaseConnected = isSupabaseConfigured() && !!supabaseUser;

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_user`);
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_habits`);
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [logs, setLogs] = useState<HabitLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : generateMockLogs();
  });

  const [freezes, setFreezes] = useState<StreakFreeze[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_freezes`);
    return saved ? JSON.parse(saved) : INITIAL_STREAK_FREEZES;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_tasks`);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_goals`);
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [mindsetLogs, setMindsetLogs] = useState<MindsetLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_mindset`);
    return saved ? JSON.parse(saved) : INITIAL_MINDSET_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_weekly_review`);
    return saved ? JSON.parse(saved) : INITIAL_WEEKLY_REVIEW;
  });

  const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isWeeklyReviewOpen, setIsWeeklyReviewOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [detailHabitId, setDetailHabitId] = useState<string | null>(null);

  const hasInitializedRef = React.useRef(false);

  // Initialize Supabase Auth Listener
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    supabase.auth.getUser().then(({ data: { user } }) => {
      setSupabaseUser(user);
      if (user) {
        loadUserDataFromSupabase(user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authUser = session?.user ?? null;
      setSupabaseUser(authUser);
      if (authUser && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        loadUserDataFromSupabase(authUser.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserDataFromSupabase = async (userId: string) => {
    try {
      const [profile, cloudHabits, cloudLogs] = await Promise.all([
        fetchProfile(userId),
        fetchHabitsFromDb(userId),
        fetchLogsFromDb(userId),
      ]);

      if (profile) {
        setUser((prev) => ({ ...prev, ...profile }));
      }
      if (cloudHabits && cloudHabits.length > 0) {
        setHabits(cloudHabits);
      }
      if (cloudLogs && cloudLogs.length > 0) {
        setLogs(cloudLogs);
      }
    } catch (err) {
      console.error('Error loading Supabase data:', err);
    }
  };

  // Load from local backend server on startup if not on Supabase
  useEffect(() => {
    const initServerDb = async () => {
      const serverDb = await fetchLocalDatabase();
      if (serverDb) {
        setIsDbServerConnected(true);
        if (!supabaseUser) {
          if (serverDb.user) setUser(serverDb.user);
          if (serverDb.habits) setHabits(serverDb.habits);
          if (serverDb.logs) setLogs(serverDb.logs);
          if (serverDb.freezes) setFreezes(serverDb.freezes);
          if (serverDb.tasks) setTasks(serverDb.tasks);
          if (serverDb.goals) setGoals(serverDb.goals);
          if (serverDb.mindsetLogs) setMindsetLogs(serverDb.mindsetLogs);
          if (serverDb.notifications) setNotifications(serverDb.notifications);
          if (serverDb.weeklyReview) setWeeklyReview(serverDb.weeklyReview);
        }
      }
      hasInitializedRef.current = true;
    };
    initServerDb();
  }, [supabaseUser]);

  // Sync to LocalStorage & Server DB
  useEffect(() => {
    if (!hasInitializedRef.current) return;

    const appState: FullAppData = {
      user,
      habits,
      logs,
      freezes,
      tasks,
      goals,
      mindsetLogs,
      notifications,
      weeklyReview,
    };
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(user));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_habits`, JSON.stringify(habits));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_logs`, JSON.stringify(logs));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_freezes`, JSON.stringify(freezes));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_tasks`, JSON.stringify(tasks));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_goals`, JSON.stringify(goals));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_mindset`, JSON.stringify(mindsetLogs));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_weekly_review`, JSON.stringify(weeklyReview));

    // Async save to disk file server
    saveToLocalDatabase(appState).then((ok) => {
      if (ok && !isDbServerConnected) {
        setIsDbServerConnected(true);
      }
    });
  }, [user, habits, logs, freezes, tasks, goals, mindsetLogs, notifications, weeklyReview, isDbServerConnected]);

  const consistencyScore = calculateConsistencyScore(habits, logs, 30);
  const momentumInfo = calculateMomentumPercent(habits, logs);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak'>) => {
    const tempId = `h-${Date.now()}`;
    const newHabit: Habit = {
      ...habitData,
      id: tempId,
      createdAt: getTodayString(),
      currentStreak: 0,
      bestStreak: 0,
      order: habits.length,
    };

    setHabits((prev) => [newHabit, ...prev]);

    // If logged in, create in Supabase
    if (supabaseUser) {
      const created = await createHabitInDb(supabaseUser.id, habitData);
      if (created) {
        setHabits((prev) => prev.map((h) => (h.id === tempId ? created : h)));
      }
    }

    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      title: 'New Habit Created 🎯',
      message: `"${newHabit.name}" has been added to your consistency schedule.`,
      time: 'Just now',
      read: false,
      type: 'system',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const updateHabit = (id: string, habitData: Partial<Habit>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...habitData } : h)));
    if (supabaseUser) {
      updateHabitInDb(id, habitData);
    }
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setLogs((prev) => prev.filter((l) => l.habitId !== id));
    if (supabaseUser) {
      deleteHabitFromDb(id);
    }
  };

  const reorderHabits = (reorderedHabits: Habit[]) => {
    setHabits(reorderedHabits);
    if (supabaseUser) {
      reorderHabitsInDb(reorderedHabits);
    }
  };

  const moveHabit = (habitId: string, direction: 'up' | 'down') => {
    setHabits((prev) => {
      const idx = prev.findIndex((h) => h.id === habitId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;

      const newHabits = [...prev];
      const [movedItem] = newHabits.splice(idx, 1);
      newHabits.splice(targetIdx, 0, movedItem);

      if (supabaseUser) {
        reorderHabitsInDb(newHabits);
      }
      return newHabits;
    });
  };

  const toggleHabitStatus = (
    habitId: string,
    dateStr: string,
    targetStatus?: HabitLogStatus,
    value?: number
  ) => {
    let nextStatus: HabitLogStatus = targetStatus || 'completed';

    setLogs((prevLogs) => {
      const existingLogIndex = prevLogs.findIndex(
        (l) => l.habitId === habitId && l.date === dateStr
      );

      if (!targetStatus && existingLogIndex >= 0) {
        const current = prevLogs[existingLogIndex].status;
        if (current === 'completed') nextStatus = 'pending';
        else nextStatus = 'completed';
      }

      const updatedLog: HabitLog = {
        id: existingLogIndex >= 0 ? prevLogs[existingLogIndex].id : `log-${habitId}-${dateStr}`,
        habitId,
        date: dateStr,
        status: nextStatus,
        currentValue: value,
        loggedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
      };

      if (existingLogIndex >= 0) {
        const copy = [...prevLogs];
        copy[existingLogIndex] = updatedLog;
        return copy;
      } else {
        return [...prevLogs, updatedLog];
      }
    });

    // Sync to Supabase per-entity log
    if (supabaseUser) {
      upsertHabitLogInDb(supabaseUser.id, habitId, dateStr, nextStatus, value);
    }
  };

  const useFreezeToken = (habitId?: string, dateStr: string = selectedDate, reason: string = 'Planned Rest Day / Travel'): boolean => {
    if (user.freezeTokensRemaining <= 0) return false;

    // Optimistic update
    setUser((prev) => ({
      ...prev,
      freezeTokensRemaining: Math.max(0, prev.freezeTokensRemaining - 1),
    }));

    const newFreeze: StreakFreeze = {
      id: `sf-${Date.now()}`,
      date: dateStr,
      habitId,
      reason,
      usedAt: new Date().toISOString(),
    };
    setFreezes((prev) => [newFreeze, ...prev]);

    if (habitId) {
      toggleHabitStatus(habitId, dateStr, 'frozen');
    }

    // Call Postgres RPC function if authenticated
    if (supabaseUser && habitId) {
      executeStreakFreezeRpc(habitId, dateStr, reason);
    }

    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        title: 'Streak Freeze Used ❄️',
        message: `Streak freeze applied for ${dateStr}. Streak preserved!`,
        time: 'Just now',
        read: false,
        type: 'system',
      },
      ...prev,
    ]);

    return true;
  };

  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: `t-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'currentValue' | 'status'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `g-${Date.now()}`,
      currentValue: 0,
      status: 'in_progress',
      createdAt: getTodayString(),
    };
    setGoals((prev) => [newGoal, ...prev]);
  };

  const updateGoalProgress = (goalId: string, value: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const target = g.targetValue || 100;
        const newStatus = value >= target ? 'achieved' : 'in_progress';
        return { ...g, currentValue: value, status: newStatus };
      })
    );
  };

  const logMindset = (dateStr: string, energy: number, focus: number, motivation: number, note?: string) => {
    setMindsetLogs((prev) => {
      const idx = prev.findIndex((m) => m.date === dateStr);
      const entry: MindsetLog = { date: dateStr, energy, focus, motivation, note };
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = entry;
        return copy;
      } else {
        return [...prev, entry];
      }
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const saveWeeklyReview = (review: Partial<WeeklyReview>) => {
    setWeeklyReview((prev) => ({ ...prev, ...review, savedAt: new Date().toISOString() }));
  };

  const exportBackupData = () => {
    const backup: FullAppData = {
      user,
      habits,
      logs,
      freezes,
      tasks,
      goals,
      mindsetLogs,
      notifications,
      weeklyReview,
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `consist_backup_${getTodayString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importBackupData = (jsonStr: string): boolean => {
    try {
      const data: FullAppData = JSON.parse(jsonStr);
      if (data.habits && Array.isArray(data.habits)) {
        if (data.user) setUser(data.user);
        if (data.habits) setHabits(data.habits);
        if (data.logs) setLogs(data.logs);
        if (data.freezes) setFreezes(data.freezes);
        if (data.tasks) setTasks(data.tasks);
        if (data.goals) setGoals(data.goals);
        if (data.mindsetLogs) setMindsetLogs(data.mindsetLogs);
        if (data.notifications) setNotifications(data.notifications);
        if (data.weeklyReview) setWeeklyReview(data.weeklyReview);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  const migrateToCloud = async (): Promise<{ success: boolean; message: string }> => {
    if (!supabaseUser) {
      return { success: false, message: 'Please sign in to migrate data.' };
    }
    try {
      const currentData: FullAppData = {
        user,
        habits,
        logs,
        freezes,
        tasks,
        goals,
        mindsetLogs,
        notifications,
        weeklyReview,
      };
      const res = await migrateLocalDataToSupabase(supabaseUser.id, currentData);
      await loadUserDataFromSupabase(supabaseUser.id);
      return { 
        success: true, 
        message: `Migrated ${res.importedHabits} habits & ${res.importedLogs} check-ins to Supabase!` 
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Migration failed' };
    }
  };

  const signOut = async () => {
    await signOutUser();
    setSupabaseUser(null);
  };

  const resetDemoData = () => {
    setUser(INITIAL_USER);
    setHabits(INITIAL_HABITS);
    setLogs(generateMockLogs());
    setFreezes(INITIAL_STREAK_FREEZES);
    setTasks(INITIAL_TASKS);
    setGoals(INITIAL_GOALS);
    setMindsetLogs(INITIAL_MINDSET_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setWeeklyReview(INITIAL_WEEKLY_REVIEW);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedDate,
        setSelectedDate,
        user,
        updateUser,
        consistencyScore,
        momentumInfo,
        supabaseUser,
        isSupabaseConnected,
        isAuthModalOpen,
        setIsAuthModalOpen,
        signOut,
        migrateToCloud,
        isDbServerConnected,
        habits,
        logs,
        addHabit,
        updateHabit,
        deleteHabit,
        reorderHabits,
        moveHabit,
        toggleHabitStatus,
        editingHabit,
        setEditingHabit,
        freezes,
        useFreezeToken,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        goals,
        addGoal,
        updateGoalProgress,
        mindsetLogs,
        logMindset,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        isCreateHabitOpen,
        setIsCreateHabitOpen,
        isCreateGoalOpen,
        setIsCreateGoalOpen,
        isCreateTaskOpen,
        setIsCreateTaskOpen,
        isWeeklyReviewOpen,
        setIsWeeklyReviewOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        detailHabitId,
        setDetailHabitId,
        weeklyReview,
        saveWeeklyReview,
        exportBackupData,
        importBackupData,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
