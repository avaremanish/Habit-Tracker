import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getHabitStatusForDate, calculateHabitStreak } from '../../utils/habitUtils';
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { 
  Check, 
  X, 
  Snowflake, 
  Coffee, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Calendar as CalendarIcon,
  BarChart2
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis } from 'recharts';

export const UnifiedHabitGrid: React.FC = () => {
  const { habits, logs, toggleHabitStatus, setIsCreateHabitOpen, setDetailHabitId } = useApp();
  const [viewType, setViewType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 9, 1)); // Oct 2026

  // Generate all days for selected month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthLabel = format(currentMonth, 'MMMM yyyy').toUpperCase();

  // Daily trend data calculation for top line chart matching Screenshot 5
  const trendData = daysInMonth.map((dayObj) => {
    const dStr = format(dayObj, 'yyyy-MM-dd');
    const dayNum = format(dayObj, 'd');
    
    let totalScheduled = 0;
    let completed = 0;

    habits.forEach((h) => {
      const st = getHabitStatusForDate(h, dStr, logs);
      if (st !== 'skipped') {
        totalScheduled++;
        if (st === 'completed') completed++;
        else if (st === 'frozen') completed += 0.8;
        else if (st === 'partial') completed += 0.5;
      }
    });

    const pct = totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 0;
    return { day: dayNum, date: dStr, percentage: pct };
  });

  const monthAvgPct = Math.round(
    trendData.reduce((acc, t) => acc + t.percentage, 0) / (trendData.length || 1)
  );

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#12141c] border border-[#1e2230] p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              The Unified Habit Grid
            </h1>
            <span className="text-xs font-mono uppercase bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/30 font-semibold">
              Rhythms Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Daily, weekly, and monthly rhythms in one visual system.
          </p>
        </div>

        {/* View Tabs & Month Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Switcher */}
          <div className="flex items-center space-x-2 bg-[#090a0f] border border-[#1e2230] p-1 rounded-xl">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2230] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-semibold text-cyan-400 px-2">{monthLabel}</span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2230] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#090a0f] border border-[#1e2230] p-1 rounded-xl">
            {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewType(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  viewType === mode
                    ? 'bg-cyan-500 text-[#090a0f] font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCreateHabitOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#090a0f] font-bold text-xs shadow-lg shadow-cyan-500/20 transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* Main Grid Container matching Screenshot 5 */}
      <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 shadow-2xl space-y-6">
        
        {/* Trend Graph Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2230] pb-6">
          <div className="w-full sm:w-3/4 h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#161924] border border-[#262b3d] px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300">
                          {data.date}: <strong className="text-white">{data.percentage}%</strong> completion
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#00f2fe"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#00f2fe' }}
                  activeDot={{ r: 5, fill: '#00f2fe' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Average Consistency Stat Badge */}
          <div className="flex items-center justify-center space-x-3 bg-[#090a0f] border border-[#1e2230] p-3 rounded-2xl min-w-[140px]">
            <div className="w-12 h-12 rounded-full border-2 border-cyan-400 flex items-center justify-center text-cyan-400 font-extrabold text-sm font-mono shadow-md shadow-cyan-500/20">
              {monthAvgPct}%
            </div>
            <div className="text-left">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">MONTH AVG</span>
              <span className="text-xs font-bold text-white">Consistency</span>
            </div>
          </div>
        </div>

        {/* Legend Indicator Pills */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
          <span className="text-[11px] font-mono text-slate-500 uppercase">Status Legend:</span>
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-4 rounded-full bg-cyan-500 text-[#090a0f] flex items-center justify-center">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Completed</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center">
              <Snowflake className="w-2.5 h-2.5" />
            </div>
            <span>Frozen ❄️</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-4 rounded-full bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center">
              <Coffee className="w-2.5 h-2.5" />
            </div>
            <span>Rest Day</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-4 rounded-full bg-red-950/40 text-red-400 border border-red-500/30 flex items-center justify-center">
              <X className="w-2.5 h-2.5" />
            </div>
            <span>Missed</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-4 rounded-full border border-slate-700 bg-[#090a0f]" />
            <span>Scheduled</span>
          </div>
        </div>

        {/* Scrollable Matrix Table */}
        <div className="overflow-x-auto border border-[#1e2230] rounded-xl bg-[#090a0f]/80">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-[#1e2230] bg-[#12141c] text-[11px] font-mono uppercase text-slate-400">
                <th className="p-3.5 sticky left-0 z-20 bg-[#12141c] min-w-[200px] border-r border-[#1e2230]">
                  HABIT
                </th>
                {daysInMonth.map((dayObj) => {
                  const dayNum = format(dayObj, 'd');
                  const dayName = format(dayObj, 'EEEEE'); // M T W T F S S
                  return (
                    <th key={dayObj.toISOString()} className="p-2 text-center border-r border-[#1e2230]/40 min-w-[32px]">
                      <div className="text-[9px] text-slate-500">{dayName}</div>
                      <div className="font-bold text-slate-300">{dayNum}</div>
                    </th>
                  );
                })}
                <th className="p-3 text-center min-w-[100px] border-l border-[#1e2230]">
                  STATS
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1e2230]/50 text-xs">
              {habits.map((habit) => {
                // Calculate completion rate & streaks for stats column
                let habitCompCount = 0;
                let habitTotalCount = 0;

                daysInMonth.forEach((dObj) => {
                  const dStr = format(dObj, 'yyyy-MM-dd');
                  const st = getHabitStatusForDate(habit, dStr, logs);
                  if (st !== 'skipped') {
                    habitTotalCount++;
                    if (st === 'completed' || st === 'frozen') habitCompCount++;
                  }
                });

                const habitPct = Math.round((habitCompCount / (habitTotalCount || 1)) * 100);
                const { currentStreak } = calculateHabitStreak(habit, logs);

                return (
                  <tr key={habit.id} className="hover:bg-[#151824] transition-colors">
                    {/* Sticky Habit Name Column */}
                    <td className="p-3.5 sticky left-0 z-10 bg-[#12141c] border-r border-[#1e2230] font-medium text-slate-100">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setDetailHabitId(habit.id)}
                          className="hover:text-cyan-400 transition-colors text-left flex items-center space-x-2"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: habit.color || '#06b6d4' }}
                          />
                          <span className="font-semibold">{habit.name}</span>
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {habit.category} • {habit.frequency}
                      </div>
                    </td>

                    {/* Day Matrix Cells */}
                    {daysInMonth.map((dayObj) => {
                      const dStr = format(dayObj, 'yyyy-MM-dd');
                      const st = getHabitStatusForDate(habit, dStr, logs);

                      return (
                        <td
                          key={dStr}
                          className="p-1.5 text-center border-r border-[#1e2230]/30"
                        >
                          <button
                            onClick={() => toggleHabitStatus(habit.id, dStr)}
                            className="w-6 h-6 rounded-full mx-auto flex items-center justify-center transition-all transform hover:scale-110 focus:outline-none"
                            title={`${habit.name} on ${dStr}: ${st}`}
                          >
                            {st === 'completed' ? (
                              <div className="w-5 h-5 rounded-full bg-cyan-500 text-[#090a0f] flex items-center justify-center shadow-md shadow-cyan-500/30">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : st === 'frozen' ? (
                              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center">
                                <Snowflake className="w-3 h-3" />
                              </div>
                            ) : st === 'skipped' ? (
                              <div className="w-5 h-5 rounded-full bg-slate-800/80 text-slate-600 border border-slate-800 flex items-center justify-center">
                                <Coffee className="w-2.5 h-2.5" />
                              </div>
                            ) : st === 'missed' ? (
                              <div className="w-5 h-5 rounded-full bg-red-950/40 text-red-400 border border-red-500/40 flex items-center justify-center">
                                <X className="w-3 h-3" />
                              </div>
                            ) : st === 'partial' ? (
                              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-transparent border border-cyan-500 flex items-center justify-center" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-[#2a2f42] bg-[#090a0f] hover:border-cyan-500/50" />
                            )}
                          </button>
                        </td>
                      );
                    })}

                    {/* Habit Stats Column */}
                    <td className="p-3 text-center border-l border-[#1e2230] font-mono">
                      <div className="flex items-center justify-center space-x-2 text-xs">
                        <span className="font-bold text-cyan-400">{habitPct}%</span>
                        <div className="flex items-center text-amber-400 font-semibold text-[11px]">
                          <Flame className="w-3 h-3 fill-amber-400 mr-0.5" />
                          <span>{currentStreak}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
