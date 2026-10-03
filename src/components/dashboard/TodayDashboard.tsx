import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HabitCard } from './HabitCard';
import { ProgressRing } from '../common/ProgressRing';
import { format, parseISO, addDays, subDays, startOfWeek } from 'date-fns';
import { 
  Flame, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  Snowflake, 
  Zap, 
  Brain, 
  TrendingUp,
  Calendar as CalendarIcon,
  ShieldCheck
} from 'lucide-react';
import { getHabitStatusForDate, calculateOverallStreak } from '../../utils/habitUtils';

export const TodayDashboard: React.FC = () => {
  const { 
    user, 
    habits, 
    logs, 
    selectedDate, 
    setSelectedDate, 
    consistencyScore, 
    momentumInfo,
    setIsCreateHabitOpen,
    setIsCreateTaskOpen,
    mindsetLogs,
    logMindset,
    setIsWeeklyReviewOpen,
    reorderHabits
  } = useApp();

  const [weekOffset, setWeekOffset] = useState(0);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIndex) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const newHabits = [...habits];
    const [movedHabit] = newHabits.splice(draggedIdx, 1);
    newHabits.splice(dropIndex, 0, movedHabit);

    reorderHabits(newHabits);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  // Today's date calculations
  const currentDateObj = parseISO(selectedDate);
  const formattedHeaderDate = format(currentDateObj, 'EEEE, d MMMM yyyy').toUpperCase();

  // Habits due for selected date
  const todayHabits = habits.filter((h) => !h.isPaused);
  const todayStatuses = todayHabits.map((h) => getHabitStatusForDate(h, selectedDate, logs));
  const completedCount = todayStatuses.filter((s) => s === 'completed').length;
  const totalDueCount = todayStatuses.filter((s) => s !== 'skipped').length || todayHabits.length;
  const todayCompletionPercentage = Math.round((completedCount / (totalDueCount || 1)) * 100);

  // Week at a glance date calculation
  const startOfCurrentWeek = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7);
  const weekDays = [0, 1, 2, 3, 4, 5, 6].map((i) => format(addDays(startOfCurrentWeek, i), 'yyyy-MM-dd'));

  // Mindset log for selected date
  const currentMindset = mindsetLogs.find((m) => m.date === selectedDate) || {
    date: selectedDate,
    energy: 8,
    focus: 8,
    motivation: 8,
  };

  const handleMindsetChange = (key: 'energy' | 'focus' | 'motivation', val: number) => {
    logMindset(
      selectedDate,
      key === 'energy' ? val : currentMindset.energy,
      key === 'focus' ? val : currentMindset.focus,
      key === 'motivation' ? val : currentMindset.motivation
    );
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#12141c] via-[#161924] to-[#12141c] p-6 lg:p-8 rounded-2xl border border-[#1e2230] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Good morning, {user.name} 👋
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-medium">
            Let's build another consistent day.
          </p>
        </div>

        {/* Date & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <div className="flex items-center space-x-2 bg-[#090a0f]/80 px-3 py-1.5 rounded-xl border border-[#1e2230] text-xs font-mono text-slate-300">
            <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formattedHeaderDate}</span>
          </div>

          <button
            onClick={() => setIsCreateHabitOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#090a0f] font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* Primary KPI & Progress Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Large Circular Progress Indicator */}
        <div className="md:col-span-5 lg:col-span-4 bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 flex flex-col items-center justify-center text-center relative shadow-lg">
          <div className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-4 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Today's Progress</span>
          </div>

          <ProgressRing
            percentage={todayCompletionPercentage}
            size={170}
            strokeWidth={12}
            color="#06b6d4"
            label="TODAY"
            sublabel={`${completedCount} / ${totalDueCount} habits`}
          />

          <div className="mt-4 flex items-center justify-center space-x-2 text-xs font-medium text-slate-300">
            {todayCompletionPercentage === 100 ? (
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold animate-pulse">
                Day complete 🎯
              </span>
            ) : (
              <span className="text-slate-400">
                {totalDueCount - completedCount} habits remaining to hit 100%
              </span>
            )}
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="md:col-span-7 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Consistency Score Card */}
          <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Consistency Score</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="my-3">
              <div className="text-4xl font-extrabold text-white tracking-tight font-sans">
                {consistencyScore}
              </div>
              <p className="text-xs text-cyan-400 font-medium mt-1">
                {consistencyScore >= 80 ? 'Excellent consistency' : 'Building discipline'}
              </p>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-[#1e2230] pt-2">
              Weighted by streak, recovery & difficulty
            </div>
          </div>

          {/* Overall Streak Card */}
          <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Overall Streak</span>
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="my-3">
              <div className="text-4xl font-extrabold text-amber-400 tracking-tight font-sans">
                {calculateOverallStreak(habits, logs, selectedDate).currentStreak} <span className="text-lg font-normal text-slate-400">days</span>
              </div>
              <p className="text-xs text-amber-300/80 font-medium mt-1">
                Best: {calculateOverallStreak(habits, logs, selectedDate).bestStreak} consecutive days
              </p>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-[#1e2230] pt-2">
              Protected by {user.freezeTokensRemaining} Freeze Tokens
            </div>
          </div>

          {/* Momentum Card */}
          <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Momentum</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="my-3">
              <div className="text-4xl font-extrabold text-purple-400 tracking-tight font-sans">
                {momentumInfo.percent >= 0 ? `+${momentumInfo.percent}%` : `${momentumInfo.percent}%`}
              </div>
              <p className="text-xs text-purple-300 font-medium mt-1">
                {momentumInfo.trend} trend (7d vs 14d)
              </p>
            </div>
            <div className="text-[11px] text-slate-400 border-t border-[#1e2230] pt-2">
              Completion velocity building
            </div>
          </div>

        </div>

      </div>

      {/* Your Week at a Glance Card */}
      <div className="bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Your Week at a Glance
            </h2>
            <p className="text-xs text-slate-400">
              Monitored completion rings and volume per day
            </p>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center space-x-2 bg-[#090a0f] border border-[#1e2230] p-1 rounded-xl">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2230] transition-colors"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1 text-xs font-mono text-cyan-400 hover:bg-[#1e2230] rounded-lg transition-colors"
            >
              {weekOffset === 0 ? 'Current Week' : `Week ${weekOffset > 0 ? `+${weekOffset}` : weekOffset}`}
            </button>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2230] transition-colors"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7 Days Grid Cards */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center">
          {weekDays.map((dStr) => {
            const dateObj = parseISO(dStr);
            const dayName = format(dateObj, 'EEE').toUpperCase();
            const dayNum = format(dateObj, 'd');
            const isSelected = dStr === selectedDate;

            // Stats for this day
            const dayStatuses = todayHabits.map((h) => getHabitStatusForDate(h, dStr, logs));
            const dayComp = dayStatuses.filter((s) => s === 'completed').length;
            const dayMiss = dayStatuses.filter((s) => s === 'missed').length;
            const dayTotal = dayStatuses.filter((s) => s !== 'skipped').length || todayHabits.length;
            const dayPct = Math.round((dayComp / (dayTotal || 1)) * 100);

            return (
              <button
                key={dStr}
                onClick={() => setSelectedDate(dStr)}
                className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                    : 'bg-[#090a0f]/60 border-[#1e2230] hover:border-slate-700 hover:bg-[#151824]'
                }`}
              >
                <span className="text-[11px] font-mono text-slate-400 font-medium">{dayName}</span>
                <span className="text-sm font-bold text-white my-1">{dayNum}</span>

                {/* Progress Ring */}
                <div className="my-2">
                  <ProgressRing
                    percentage={dayPct}
                    size={48}
                    strokeWidth={4}
                    color="#06b6d4"
                    showText={false}
                  >
                    <span className="text-[10px] font-bold font-mono text-white">{dayPct}%</span>
                  </ProgressRing>
                </div>

                {/* Vertical Progress Bar */}
                <div className="w-full bg-[#1e2230] rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${dayPct}%` }}
                  />
                </div>

                {/* Completed / Missed counts */}
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  <span className="text-cyan-400 font-semibold">{dayComp}</span>
                  <span className="text-slate-600"> / </span>
                  <span className="text-slate-400">{dayTotal}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Today Habits List & Mindset Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Today's Habits Cards (Left 8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Today's Habits</h2>
              <p className="text-xs text-slate-400">
                Tick habits off as you execute. Drag cards to set your preferred routine sequence.
              </p>
            </div>
            <button
              onClick={() => setIsCreateHabitOpen(true)}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Habit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayHabits.map((habit, idx) => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                dateStr={selectedDate}
                index={idx}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                isDragging={draggedIdx === idx}
                isDragOver={dragOverIdx === idx}
              />
            ))}
          </div>
        </div>

        {/* Mindset Tracker Sidebar Widget (Right 4 Cols) */}
        <div className="lg:col-span-4 bg-[#12141c] border border-[#1e2230] rounded-2xl p-6 space-y-6 shadow-xl h-fit">
          <div className="flex items-center justify-between border-b border-[#1e2230] pb-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white text-base">Mindset Tracker</h3>
            </div>
            <span className="text-[10px] font-mono uppercase bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
              Daily Rating
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Rate your internal state (1–10). Connect energy and focus with completion velocity.
          </p>

          {/* Energy Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Energy</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{currentMindset.energy}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={currentMindset.energy}
              onChange={(e) => handleMindsetChange('energy', parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#1e2230] rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Focus Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>Focus</span>
              </span>
              <span className="font-mono text-purple-400 font-bold">{currentMindset.focus}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={currentMindset.focus}
              onChange={(e) => handleMindsetChange('focus', parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#1e2230] rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Motivation Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Motivation</span>
              </span>
              <span className="font-mono text-teal-400 font-bold">{currentMindset.motivation}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={currentMindset.motivation}
              onChange={(e) => handleMindsetChange('motivation', parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#1e2230] rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
          </div>

          {/* Behavioral Correlation Mini Insight */}
          <div className="p-3 bg-[#161924] border border-[#1e2230] rounded-xl text-xs space-y-1">
            <div className="text-cyan-400 font-semibold flex items-center space-x-1 text-[11px]">
              <Sparkles className="w-3 h-3" />
              <span>Behavioral Pattern Detected</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              "Your habit completion rate is higher on days when your energy score is 7 or above."
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
