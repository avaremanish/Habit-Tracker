import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Sparkles, Flame, CheckCircle2, Save } from 'lucide-react';

export const WeeklyReviewModal: React.FC = () => {
  const { isWeeklyReviewOpen, setIsWeeklyReviewOpen, weeklyReview, saveWeeklyReview } = useApp();

  const [workedWell, setWorkedWell] = useState(weeklyReview.workedWellAnswer || '');
  const [impediments, setImpediments] = useState(weeklyReview.impedimentsAnswer || '');
  const [changesNextWeek, setChangesNextWeek] = useState(weeklyReview.changesNextWeekAnswer || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveWeeklyReview({
      workedWellAnswer: workedWell,
      impedimentsAnswer: impediments,
      changesNextWeekAnswer: changesNextWeek,
    });
    setIsWeeklyReviewOpen(false);
  };

  return (
    <Modal
      isOpen={isWeeklyReviewOpen}
      onClose={() => setIsWeeklyReviewOpen(false)}
      title="Your Weekly Review"
      subtitle="Reflect on weekly patterns and tune your consistency operating system."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Weekly Performance Stats Grid */}
        <div className="grid grid-cols-3 gap-3 text-center bg-[#090a0f] border border-[#1e2230] p-4 rounded-2xl">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">COMPLETION</span>
            <span className="text-xl font-extrabold text-cyan-400 font-mono">{weeklyReview.completionRate}%</span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">CONSISTENCY</span>
            <span className="text-xl font-extrabold text-white font-mono">{weeklyReview.consistencyScore}</span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block">MOMENTUM</span>
            <span className="text-xl font-extrabold text-teal-400 font-mono">+{weeklyReview.momentumPercent}%</span>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#161924] border border-[#1e2230] rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Strongest Habit</span>
            <div className="font-semibold text-white">{weeklyReview.strongestHabitName}</div>
          </div>

          <div className="p-3 bg-[#161924] border border-[#1e2230] rounded-xl space-y-1">
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Needs Attention</span>
            <div className="font-semibold text-white">{weeklyReview.attentionHabitName}</div>
          </div>
        </div>

        {/* Reflection Questions */}
        <div className="space-y-4 pt-2 border-t border-[#1e2230]">
          <div>
            <label className="block text-xs font-semibold text-white mb-1">
              What worked this week?
            </label>
            <textarea
              rows={2}
              value={workedWell}
              onChange={(e) => setWorkedWell(e.target.value)}
              placeholder="e.g. Waking up at 5am consistently created a 2-hour distraction-free block..."
              className="w-full bg-[#090a0f] border border-[#1e2230] text-xs text-white rounded-xl p-3 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white mb-1">
              What got in the way?
            </label>
            <textarea
              rows={2}
              value={impediments}
              onChange={(e) => setImpediments(e.target.value)}
              placeholder="e.g. Late evening screen time on Wednesday caused delayed sleep..."
              className="w-full bg-[#090a0f] border border-[#1e2230] text-xs text-white rounded-xl p-3 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white mb-1">
              What will you change next week?
            </label>
            <textarea
              rows={2}
              value={changesNextWeek}
              onChange={(e) => setChangesNextWeek(e.target.value)}
              placeholder="e.g. Set a hard boundary to put phone away by 9 PM..."
              className="w-full bg-[#090a0f] border border-[#1e2230] text-xs text-white rounded-xl p-3 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-[#1e2230] flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setIsWeeklyReviewOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Close
          </button>
          <button
            type="submit"
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#090a0f] font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Save Reflection</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
