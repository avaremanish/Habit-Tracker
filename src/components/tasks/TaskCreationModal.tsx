import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import type { HabitCategoryType } from '../../types';
import { getTodayString } from '../../utils/habitUtils';

export const TaskCreationModal: React.FC = () => {
  const { isCreateTaskOpen, setIsCreateTaskOpen, addTask, habits, goals } = useApp();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(getTodayString());
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<HabitCategoryType>('Work');
  const [habitId, setHabitId] = useState<string>('');
  const [goalId, setGoalId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      dueDate,
      completed: false,
      priority,
      category,
      habitId: habitId || undefined,
      goalId: goalId || undefined,
    });

    setTitle('');
    setIsCreateTaskOpen(false);
  };

  return (
    <Modal
      isOpen={isCreateTaskOpen}
      onClose={() => setIsCreateTaskOpen(false)}
      title="Create Task"
      subtitle="Schedule a task for any day of the week."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Task Description</label>
          <input
            type="text"
            placeholder="e.g. Complete architecture design review"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#090a0f] border border-[#1e2230] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#090a0f] border border-[#1e2230] text-white text-xs font-mono rounded-xl px-3 py-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full bg-[#090a0f] border border-[#1e2230] text-slate-200 text-xs font-mono rounded-xl px-3 py-2.5"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as HabitCategoryType)}
              className="w-full bg-[#090a0f] border border-[#1e2230] text-slate-200 text-xs font-mono rounded-xl px-3 py-2.5"
            >
              <option value="Work">Work</option>
              <option value="Fitness">Fitness</option>
              <option value="Learning">Learning</option>
              <option value="Health">Health</option>
              <option value="Mindfulness">Mindfulness</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Connect Habit</label>
            <select
              value={habitId}
              onChange={(e) => setHabitId(e.target.value)}
              className="w-full bg-[#090a0f] border border-[#1e2230] text-cyan-300 text-xs font-mono rounded-xl px-3 py-2.5"
            >
              <option value="">None</option>
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Connect Goal (Optional)</label>
          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="w-full bg-[#090a0f] border border-[#1e2230] text-purple-300 text-xs font-mono rounded-xl px-3 py-2.5"
          >
            <option value="">None</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-3 border-t border-[#1e2230] flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setIsCreateTaskOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-[#090a0f] font-extrabold text-xs shadow-lg"
          >
            Save Task
          </button>
        </div>
      </form>
    </Modal>
  );
};
