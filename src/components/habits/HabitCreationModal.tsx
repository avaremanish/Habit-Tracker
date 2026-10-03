import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import type { HabitCategoryType, HabitFrequencyType, TimeOfDay } from '../../types';

export const HabitCreationModal: React.FC = () => {
  const { 
    isCreateHabitOpen, 
    setIsCreateHabitOpen, 
    addHabit, 
    updateHabit, 
    deleteHabit,
    editingHabit, 
    setEditingHabit 
  } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategoryType>('Health');
  const [frequency, setFrequency] = useState<HabitFrequencyType>('daily');
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState<number>(5);
  const [isMeasurable, setIsMeasurable] = useState(false);
  const [targetValue, setTargetValue] = useState<number>(20);
  const [targetUnit, setTargetUnit] = useState<string>('pages');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setCategory(editingHabit.category);
      setFrequency(editingHabit.frequency);
      setTargetDaysPerWeek(editingHabit.targetDaysPerWeek || 5);
      setIsMeasurable(editingHabit.isMeasurable);
      setTargetValue(editingHabit.targetValue || 20);
      setTargetUnit(editingHabit.targetUnit || 'pages');
      setTimeOfDay(editingHabit.timeOfDay);
      setSelectedWeekdays(editingHabit.specificDays || [1, 2, 3, 4, 5]);
    } else {
      setName('');
      setCategory('Health');
      setFrequency('daily');
      setIsMeasurable(false);
      setTargetValue(20);
      setTargetUnit('pages');
      setTimeOfDay('morning');
      setSelectedWeekdays([1, 2, 3, 4, 5]);
    }
  }, [editingHabit, isCreateHabitOpen]);

  const handleClose = () => {
    setEditingHabit(null);
    setIsCreateHabitOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingHabit) {
      updateHabit(editingHabit.id, {
        name: name.trim(),
        category,
        frequency,
        targetDaysPerWeek: frequency === 'x_times_week' ? targetDaysPerWeek : undefined,
        specificDays: frequency === 'specific_days' ? selectedWeekdays : undefined,
        isMeasurable,
        targetValue: isMeasurable ? targetValue : undefined,
        targetUnit: isMeasurable ? targetUnit : undefined,
        timeOfDay,
        color: category === 'Fitness' ? '#00f2fe' : category === 'Mindfulness' ? '#8b5cf6' : '#06b6d4',
      });
    } else {
      addHabit({
        name: name.trim(),
        category,
        frequency,
        targetDaysPerWeek: frequency === 'x_times_week' ? targetDaysPerWeek : undefined,
        specificDays: frequency === 'specific_days' ? selectedWeekdays : undefined,
        isMeasurable,
        targetValue: isMeasurable ? targetValue : undefined,
        targetUnit: isMeasurable ? targetUnit : undefined,
        timeOfDay,
        color: category === 'Fitness' ? '#00f2fe' : category === 'Mindfulness' ? '#8b5cf6' : '#06b6d4',
      });
    }

    handleClose();
  };

  const toggleWeekday = (dayNum: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum]
    );
  };

  return (
    <Modal
      isOpen={isCreateHabitOpen}
      onClose={handleClose}
      title={editingHabit ? "Edit Habit" : "Create New Habit"}
      subtitle={editingHabit ? "Modify routine parameters and execution target." : "Design a custom habit schedule tailored for long-term consistency."}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
            Habit Name
          </label>
          <input
            type="text"
            placeholder="e.g. Read 20 Pages, Morning Run, Meditate"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#090a0f] border border-[#1e2230] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as HabitCategoryType)}
              className="w-full bg-[#090a0f] border border-[#1e2230] text-cyan-300 text-xs font-mono rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500"
            >
              {(['Fitness', 'Health', 'Learning', 'Work', 'Finance', 'Personal', 'Relationships', 'Mindfulness', 'Sleep', 'Custom'] as HabitCategoryType[]).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
              Time Preference
            </label>
            <select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
              className="w-full bg-[#090a0f] border border-[#1e2230] text-slate-200 text-xs font-mono rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
              <option value="anytime">Anytime</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
            Frequency Rhythm
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as HabitFrequencyType)}
            className="w-full bg-[#090a0f] border border-[#1e2230] text-slate-200 text-xs font-mono rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="daily">Every day</option>
            <option value="specific_days">Specific Weekdays</option>
            <option value="x_times_week">X Times per Week</option>
            <option value="x_times_month">X Times per Month</option>
          </select>
        </div>

        {frequency === 'specific_days' && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-slate-400 block">Select Active Days:</span>
            <div className="flex space-x-2">
              {[
                { day: 1, label: 'M' },
                { day: 2, label: 'T' },
                { day: 3, label: 'W' },
                { day: 4, label: 'T' },
                { day: 5, label: 'F' },
                { day: 6, label: 'S' },
                { day: 0, label: 'S' },
              ].map(({ day, label }) => {
                const isSel = selectedWeekdays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWeekday(day)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-colors ${
                      isSel ? 'bg-cyan-500 text-[#090a0f]' : 'bg-[#090a0f] text-slate-400 border border-[#1e2230]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-4 bg-[#161924] border border-[#1e2230] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Measurable Target</span>
            <input
              type="checkbox"
              checked={isMeasurable}
              onChange={(e) => setIsMeasurable(e.target.checked)}
              className="rounded border-slate-700 bg-[#090a0f] text-cyan-500 focus:ring-0 cursor-pointer"
            />
          </div>

          {isMeasurable && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">Target Quantity</label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
                  className="w-full bg-[#090a0f] border border-[#1e2230] text-white text-xs font-mono rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">Unit</label>
                <input
                  type="text"
                  placeholder="pages, km, mins, liters"
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  className="w-full bg-[#090a0f] border border-[#1e2230] text-white text-xs font-mono rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#1e2230] flex items-center justify-between">
          {editingHabit ? (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${editingHabit.name}"?`)) {
                  deleteHabit(editingHabit.id);
                  handleClose();
                }
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
            >
              Delete Habit
            </button>
          ) : <div />}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#090a0f] font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105"
            >
              {editingHabit ? "Update Habit" : "Save Habit"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
