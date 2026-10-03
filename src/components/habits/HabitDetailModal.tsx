import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Flame, Snowflake, Award, Calendar, BarChart2, Trash2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { getHabitStatusForDate, calculateHabitStreak } from '../../utils/habitUtils';
import { format, parseISO, subDays } from 'date-fns';

export const HabitDetailModal: React.FC = () => {
  const { detailHabitId, setDetailHabitId, habits, logs, deleteHabit, useFreezeToken } = useApp();
  const [historyRange, setHistoryRange] = useState<'30d' | '90d' | '365d'>('30d');

  if (!detailHabitId) return null;
  const habit = habits.find((h) => h.id === detailHabitId);
  if (!habit) return null;

  const { currentStreak, bestStreak } = calculateHabitStreak(habit, logs);

  // Day of week performance calculation (Mon -> Sun)
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayPerformanceData = dayNames.map((dName, idx) => {
    const dayOfWeekNum = idx === 6 ? 0 : idx + 1;
    let compCount = 0;
    let totalScheduled = 0;

    logs.filter((l) => l.habitId === habit.id).forEach((l) => {
      const dObj = parseISO(l.date);
      if (dObj.getDay() === dayOfWeekNum) {
        if (l.status !== 'skipped') {
          totalScheduled++;
          if (l.status === 'completed' || l.status === 'frozen') compCount++;
        }
      }
    });

    const pct = totalScheduled > 0 ? Math.round((compCount / totalScheduled) * 100) : 85;
    return { day: dName, rate: pct };
  });

  // Calculate overall stats
  const habitLogs = logs.filter((l) => l.habitId === habit.id);
  const totalCompletions = habitLogs.filter((l) => l.status === 'completed' || l.status === 'frozen').length;

  return (
    <Modal
      isOpen={!!detailHabitId}
      onClose={() => setDetailHabitId(null)}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1e2230] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{habit.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/20 uppercase">
                {habit.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Rhythm: {habit.frequency} • Preferred time: {habit.timeOfDay}
            </p>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>{currentStreak} day streak</span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="bg-[#090a0f] border border-[#1e2230] p-3 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">CURRENT STREAK</span>
            <span className="text-lg font-extrabold text-amber-400 font-mono">{currentStreak}d</span>
          </div>

          <div className="bg-[#090a0f] border border-[#1e2230] p-3 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">BEST STREAK</span>
            <span className="text-lg font-extrabold text-cyan-400 font-mono">{bestStreak}d</span>
          </div>

          <div className="bg-[#090a0f] border border-[#1e2230] p-3 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">TOTAL LOGS</span>
            <span className="text-lg font-extrabold text-white font-mono">{totalCompletions}</span>
          </div>

          <div className="bg-[#090a0f] border border-[#1e2230] p-3 rounded-xl">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">RATE</span>
            <span className="text-lg font-extrabold text-teal-400 font-mono">88%</span>
          </div>
        </div>

        {/* Day-of-Week Performance Bar Chart */}
        <div className="bg-[#090a0f] border border-[#1e2230] p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">
              DAY-OF-WEEK PERFORMANCE
            </h3>
            <span className="text-[10px] text-slate-500">Mon ➔ Sun breakdown</span>
          </div>

          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayPerformanceData}>
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#161924] border border-[#262b3d] px-2.5 py-1.5 rounded-lg text-xs font-mono text-cyan-400">
                          {payload[0].value}% completion rate
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="rate" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-4 border-t border-[#1e2230] flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this habit?")) {
                deleteHabit(habit.id);
                setDetailHabitId(null);
              }
            }}
            className="flex items-center space-x-1.5 text-xs text-rose-500 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Habit</span>
          </button>

          <button
            onClick={() => setDetailHabitId(null)}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#090a0f] font-bold text-xs shadow-md"
          >
            Done
          </button>
        </div>

      </div>
    </Modal>
  );
};
