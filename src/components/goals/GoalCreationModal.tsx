import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { LIFE_AREAS } from '../../data/mockData';
import type { HabitCategoryType } from '../../types';

export const GoalCreationModal: React.FC = () => {
  const { isCreateGoalOpen, setIsCreateGoalOpen, addGoal, habits } = useApp();

  const [title, setTitle] = useState('');
  const [areaId, setAreaId] = useState(LIFE_AREAS[0].id);
  const [category, setCategory] = useState<HabitCategoryType>('Fitness');
  const [targetValue, setTargetValue] = useState(100);
  const [unit, setUnit] = useState('km');
  const [targetDate, setTargetDate] = useState('2026-10-31');
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addGoal({
      title: title.trim(),
      areaId,
      category,
      targetValue,
      unit,
      targetDate,
      connectedHabitIds: selectedHabitIds,
    });

    setTitle('');
    setIsCreateGoalOpen(false);
  };

  const toggleHabit = (id: string) => {
    setSelectedHabitIds((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  return (
    <Modal
      isOpen={isCreateGoalOpen}
      onClose={() => setIsCreateGoalOpen(false)}
      title="Create Long-Term Goal"
      subtitle="Connect daily habits to high-level life outcomes."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Goal Title</label>
          <input
            type="text"
            placeholder="e.g. Run 100 km this month, Read 3 Non-Fiction Books"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#090a0f] border border-[#1e2230] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Life Area</label>
            <select
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              className="w-full bg-[#090a0f] border border-[#1e2230] text-cyan-300 text-xs font-mono rounded-xl px-3 py-2.5"
            >
              {LIFE_AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.icon} {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as HabitCategoryType)}
              className="w-full bg-[#090a0f] border border-[#1e2230] text-cyan-300 text-xs font-mono rounded-xl px-3 py-2.5"
            >
              <option value="Fitness">Fitness</option>
              <option value="Health">Health</option>
              <option value="Learning">Learning</option>
              <option value="Work">Work</option>
              <option value="Mindfulness">Mindfulness</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Target Value</label>
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(parseInt(e.target.value) || 1)}
              className="w-full bg-[#090a0f] border border-[#1e2230] text-white text-xs font-mono rounded-xl px-3 py-2.5"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Unit</label>
            <input
              type="text"
              placeholder="km, pages, sessions"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-[#090a0f] border border-[#1e2230] text-white text-xs font-mono rounded-xl px-3 py-2.5"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-[#090a0f] border border-[#1e2230] text-white text-xs font-mono rounded-xl px-3 py-2.5"
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="block text-xs font-mono uppercase text-slate-400">Connect Habits:</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {habits.map((h) => {
              const isSelected = selectedHabitIds.includes(h.id);
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => toggleHabit(h.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-[#090a0f] text-slate-400 border border-[#1e2230]'
                  }`}
                >
                  {h.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-[#1e2230] flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setIsCreateGoalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-[#090a0f] font-extrabold text-xs shadow-lg"
          >
            Save Goal
          </button>
        </div>
      </form>
    </Modal>
  );
};
