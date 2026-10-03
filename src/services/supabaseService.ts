import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { 
  Habit, 
  HabitLog, 
  Task, 
  Goal, 
  MindsetLog, 
  StreakFreeze, 
  UserProfile, 
  WeeklyReview,
  HabitLogStatus 
} from '../types';
import type { FullAppData } from './apiService';

// ============================================================================
// AUTH & SESSION HELPERS
// ============================================================================

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signInWithMagicLink = async (email: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not configured.');
  }
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });
};

export const signInWithPassword = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUpWithPassword = async (email: string, password: string, fullName: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
};

export const signOutUser = async () => {
  if (!isSupabaseConfigured()) return;
  return await supabase.auth.signOut();
};

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

export const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    name: data.name,
    email: data.email,
    avatarUrl: data.avatar_url,
    freezeTokensRemaining: data.freeze_tokens_remaining,
    maxFreezeTokens: data.max_freeze_tokens,
    autoFreezeEnabled: data.auto_freeze_enabled,
    consistencyScore: 0,
    momentumPercent: 0,
    totalHabitsCompleted: 0,
    overallStreak: 0,
  };
};

export const updateProfile = async (userId: string, updates: Partial<UserProfile>) => {
  if (!isSupabaseConfigured()) return false;
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.freezeTokensRemaining !== undefined) payload.freeze_tokens_remaining = updates.freezeTokensRemaining;
  if (updates.autoFreezeEnabled !== undefined) payload.auto_freeze_enabled = updates.autoFreezeEnabled;

  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
  return !error;
};

// ============================================================================
// HABIT CRUD & REORDERING
// ============================================================================

export const fetchHabitsFromDb = async (userId: string): Promise<Habit[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    frequency: row.frequency,
    targetDaysPerWeek: row.target_days_per_week,
    specificDays: row.specific_days,
    isMeasurable: row.is_measurable,
    targetValue: row.target_value ? Number(row.target_value) : undefined,
    targetUnit: row.target_unit,
    timeOfDay: row.time_of_day,
    color: row.color,
    icon: row.icon,
    currentStreak: 0,
    bestStreak: 0,
    createdAt: row.created_at.slice(0, 10),
    isPaused: row.is_paused,
    order: row.sort_order,
  }));
};

export const createHabitInDb = async (userId: string, habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'bestStreak'>): Promise<Habit | null> => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id: userId,
      name: habit.name,
      category: habit.category,
      description: habit.description,
      frequency: habit.frequency,
      target_days_per_week: habit.targetDaysPerWeek,
      specific_days: habit.specificDays,
      is_measurable: habit.isMeasurable,
      target_value: habit.targetValue,
      target_unit: habit.targetUnit,
      time_of_day: habit.timeOfDay,
      color: habit.color,
      sort_order: habit.order || 0,
    })
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    description: data.description,
    frequency: data.frequency,
    targetDaysPerWeek: data.target_days_per_week,
    specificDays: data.specific_days,
    isMeasurable: data.is_measurable,
    targetValue: data.target_value ? Number(data.target_value) : undefined,
    targetUnit: data.target_unit,
    timeOfDay: data.time_of_day,
    color: data.color,
    currentStreak: 0,
    bestStreak: 0,
    createdAt: data.created_at.slice(0, 10),
    isPaused: data.is_paused,
    order: data.sort_order,
  };
};

export const updateHabitInDb = async (habitId: string, updates: Partial<Habit>): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.frequency !== undefined) payload.frequency = updates.frequency;
  if (updates.targetDaysPerWeek !== undefined) payload.target_days_per_week = updates.targetDaysPerWeek;
  if (updates.specificDays !== undefined) payload.specific_days = updates.specificDays;
  if (updates.isMeasurable !== undefined) payload.is_measurable = updates.isMeasurable;
  if (updates.targetValue !== undefined) payload.target_value = updates.targetValue;
  if (updates.targetUnit !== undefined) payload.target_unit = updates.targetUnit;
  if (updates.timeOfDay !== undefined) payload.time_of_day = updates.timeOfDay;
  if (updates.color !== undefined) payload.color = updates.color;
  if (updates.isPaused !== undefined) payload.is_paused = updates.isPaused;
  if (updates.order !== undefined) payload.sort_order = updates.order;

  const { error } = await supabase.from('habits').update(payload).eq('id', habitId);
  return !error;
};

export const deleteHabitFromDb = async (habitId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from('habits').delete().eq('id', habitId);
  return !error;
};

export const reorderHabitsInDb = async (orderedHabits: Habit[]): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  const updates = orderedHabits.map((h, index) => 
    supabase.from('habits').update({ sort_order: index, updated_at: new Date().toISOString() }).eq('id', h.id)
  );
  await Promise.all(updates);
  return true;
};

// ============================================================================
// HABIT LOGS (IDEMPOTENT UPSERT)
// ============================================================================

export const fetchLogsFromDb = async (userId: string): Promise<HabitLog[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    habitId: row.habit_id,
    date: row.local_date,
    status: row.status as HabitLogStatus,
    currentValue: row.current_value ? Number(row.current_value) : undefined,
    targetValue: row.target_value ? Number(row.target_value) : undefined,
    loggedAt: row.logged_at,
    note: row.note,
  }));
};

export const upsertHabitLogInDb = async (
  userId: string,
  habitId: string,
  localDate: string,
  status: HabitLogStatus,
  currentValue?: number,
  targetValue?: number,
  note?: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from('habit_logs').upsert(
    {
      user_id: userId,
      habit_id: habitId,
      local_date: localDate,
      status,
      current_value: currentValue,
      target_value: targetValue,
      note,
      updated_at: new Date().toISOString(),
      logged_at: status === 'completed' ? new Date().toISOString() : undefined,
    },
    { onConflict: 'habit_id,local_date' }
  );

  return !error;
};

// ============================================================================
// SERVER RPC: STREAK FREEZE EXECUTION
// ============================================================================

export const executeStreakFreezeRpc = async (
  habitId: string,
  localDate: string,
  reason: string = 'Planned Rest Day / Travel'
): Promise<{ success: boolean; tokensRemaining?: number; message?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase not configured' };
  }

  const { data, error } = await supabase.rpc('use_freeze_token', {
    p_habit_id: habitId,
    p_local_date: localDate,
    p_reason: reason,
  });

  if (error || !data) {
    return { success: false, message: error?.message || 'RPC execution failed' };
  }

  return data;
};

// ============================================================================
// FULL JSON MIGRATION TO SUPABASE
// ============================================================================

export const migrateLocalDataToSupabase = async (
  userId: string,
  appData: FullAppData
): Promise<{ success: boolean; importedHabits: number; importedLogs: number }> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  let importedHabits = 0;
  let importedLogs = 0;

  // 1. Map old IDs to new UUIDs
  const idMap: Record<string, string> = {};

  for (let i = 0; i < appData.habits.length; i++) {
    const h = appData.habits[i];
    const { data: newHabit, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name: h.name,
        category: h.category,
        description: h.description,
        frequency: h.frequency,
        target_days_per_week: h.targetDaysPerWeek,
        specific_days: h.specificDays,
        is_measurable: h.isMeasurable,
        target_value: h.targetValue,
        target_unit: h.targetUnit,
        time_of_day: h.timeOfDay,
        color: h.color,
        sort_order: i,
      })
      .select()
      .single();

    if (!error && newHabit) {
      idMap[h.id] = newHabit.id;
      importedHabits++;
    }
  }

  // 2. Batch insert logs with mapped habit IDs
  const logsPayload = appData.logs
    .filter((l) => idMap[l.habitId])
    .map((l) => ({
      user_id: userId,
      habit_id: idMap[l.habitId],
      local_date: l.date,
      status: l.status,
      current_value: l.currentValue,
      target_value: l.targetValue,
      note: l.note,
    }));

  if (logsPayload.length > 0) {
    const { error: logsError } = await supabase
      .from('habit_logs')
      .upsert(logsPayload, { onConflict: 'habit_id,local_date' });

    if (!logsError) {
      importedLogs = logsPayload.length;
    }
  }

  return { success: true, importedHabits, importedLogs };
};
