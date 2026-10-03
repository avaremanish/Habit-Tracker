import React, { useState } from 'react';
import type { Habit, HabitLogStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { getHabitStatusForDate, calculateHabitStreak } from '../../utils/habitUtils';
import { 
  Check, 
  Flame, 
  Snowflake, 
  MoreVertical, 
  BarChart2, 
  Minus, 
  Plus,
  Clock,
  Edit3,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  dateStr: string;
  index?: number;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({ 
  habit, 
  dateStr,
  index = 0,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
  isDragOver = false
}) => {
  const { 
    logs, 
    toggleHabitStatus, 
    useFreezeToken, 
    user, 
    setDetailHabitId,
    setEditingHabit,
    setIsCreateHabitOpen,
    deleteHabit,
    moveHabit
  } = useApp();

  const [showMenu, setShowMenu] = useState(false);
  const status = getHabitStatusForDate(habit, dateStr, logs);
  const { currentStreak } = calculateHabitStreak(habit, logs, dateStr);

  const log = logs.find((l) => l.habitId === habit.id && l.date === dateStr);
  const currentMeasurableValue = log?.currentValue ?? 0;
  const targetMeasurableValue = habit.targetValue || 1;

  const isCompleted = status === 'completed';
  const isFrozen = status === 'frozen';
  const isSkipped = status === 'skipped';
  const isMissed = status === 'missed';

  const handleToggle = () => {
    toggleHabitStatus(habit.id, dateStr);
  };

  const handleIncrementValue = (delta: number) => {
    const newValue = Math.max(0, currentMeasurableValue + delta);
    const newStatus: HabitLogStatus = newValue >= targetMeasurableValue ? 'completed' : newValue > 0 ? 'partial' : 'pending';
    toggleHabitStatus(habit.id, dateStr, newStatus, newValue);
  };

  const handleFreeze = () => {
    if (user.freezeTokensRemaining <= 0) {
      alert("No Streak Freeze tokens remaining! You can earn or refill them in Settings.");
      return;
    }
    useFreezeToken(habit.id, dateStr, "Planned Rest Day / Travel");
    setShowMenu(false);
  };

  const handleEdit = () => {
    setEditingHabit(habit);
    setIsCreateHabitOpen(true);
    setShowMenu(false);
  };

  return (
    <div 
      draggable={Boolean(onDragStart)}
      onDragStart={(e) => onDragStart && onDragStart(e, index)}
      onDragOver={(e) => onDragOver && onDragOver(e, index)}
      onDrop={(e) => onDrop && onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`group relative bg-[#12141c] hover:bg-[#151824] border rounded-xl p-4 transition-all duration-300 shadow-md ${
        isDragging
          ? 'opacity-40 scale-95 border-cyan-500 border-dashed'
          : isDragOver
          ? 'border-cyan-400 border-2 shadow-lg shadow-cyan-500/20 scale-[1.01]'
          : isCompleted
          ? 'border-cyan-500/30 bg-[#12141c]/90'
          : isFrozen
          ? 'border-blue-500/30 bg-blue-950/10'
          : isMissed
          ? 'border-red-500/20'
          : 'border-[#1e2230] hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {/* Drag Handle */}
          <div 
            className="mt-1 cursor-grab active:cursor-grabbing opacity-30 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-cyan-400"
            title="Drag to reorder sequence"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          <button
            onClick={handleToggle}
            className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 focus:outline-none ${
              isCompleted
                ? 'bg-cyan-500 text-[#090a0f] shadow-lg shadow-cyan-500/30 scale-105'
                : isFrozen
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                : isSkipped
                ? 'bg-slate-800 text-slate-500 border border-slate-700'
                : 'bg-[#1a1d28] border border-[#2a2f42] text-transparent hover:border-cyan-500/60 hover:text-cyan-500/40'
            }`}
            title={isCompleted ? "Mark incomplete" : "Mark complete"}
          >
            {isCompleted ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : isFrozen ? (
              <Snowflake className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-semibold text-sm tracking-tight ${isCompleted ? 'text-white line-through opacity-90' : 'text-slate-100'}`}>
                {habit.name}
              </span>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1a1d29] text-slate-400 border border-[#24293c]">
                {habit.timeOfDay}
              </span>
            </div>

            <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
              <div className="flex items-center space-x-1 font-semibold text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{currentStreak} day streak</span>
              </div>
              <span className="text-slate-600">•</span>
              <span className="text-[11px] text-slate-400">
                Category: <strong className="text-cyan-400 font-normal">{habit.category}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex items-center space-x-1">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-[#1a1d29] transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 top-full w-48 bg-[#161924] border border-[#262b3d] rounded-xl shadow-xl z-30 py-1.5 text-xs text-slate-300">
              <button
                onClick={() => {
                  moveHabit(habit.id, 'up');
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-[#1e2230] text-left text-slate-300"
              >
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                <span>Move Up in Sequence</span>
              </button>
              <button
                onClick={() => {
                  moveHabit(habit.id, 'down');
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-[#1e2230] text-left text-slate-300"
              >
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Move Down in Sequence</span>
              </button>
              <div className="my-1 border-t border-[#1e2230]" />
              <button
                onClick={handleEdit}
                className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-[#1e2230] text-left text-cyan-300 font-medium"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edit Habit</span>
              </button>
              <button
                onClick={() => {
                  setDetailHabitId(habit.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-[#1e2230] text-left"
              >
                <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>View Analytics</span>
              </button>
              <button
                onClick={handleFreeze}
                className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-[#1e2230] text-left text-blue-400"
              >
                <Snowflake className="w-3.5 h-3.5" />
                <span>Use Streak Freeze</span>
              </button>
              <button
                onClick={() => {
                  toggleHabitStatus(habit.id, dateStr, 'skipped');
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-[#1e2230] text-left text-slate-400"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Mark Rest / Skip</span>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
                    deleteHabit(habit.id);
                  }
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-red-500/10 text-left text-red-400 border-t border-[#1e2230]/60 mt-1 pt-2"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Delete Habit</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {habit.isMeasurable && (
        <div className="mt-3 pt-3 border-t border-[#1e2230]/70 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Target:</span>
            <span className="font-mono text-cyan-300 font-semibold">
              {currentMeasurableValue} / {habit.targetValue} {habit.targetUnit}
            </span>
          </div>

          <div className="flex items-center space-x-1 bg-[#1a1d28] rounded-lg p-0.5 border border-[#24293c]">
            <button
              onClick={() => handleIncrementValue(-1)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#24293c] transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-1.5 font-mono text-xs text-white">{currentMeasurableValue}</span>
            <button
              onClick={() => handleIncrementValue(1)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#24293c] transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
